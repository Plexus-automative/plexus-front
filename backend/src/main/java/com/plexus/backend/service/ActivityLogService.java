package com.plexus.backend.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.TreeMap;
import java.util.UUID;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;
import java.util.stream.Stream;

/**
 * Journal d'activité — append-only audit trail of what users do in the app.
 *
 * The backend has no database (it is a stateless proxy in front of Business
 * Central), so events are appended as JSON Lines to one file per month
 * ({@code activity-YYYY-MM.jsonl}) inside a directory that is a Docker volume in
 * production — the same storage pattern already used for the bris de glace
 * uploads. One line per event keeps writes atomic-ish and lets a month be
 * streamed and filtered without loading everything into memory.
 *
 * Writes go through a single-thread executor with a bounded queue so an audited
 * request never blocks on disk (and a disk stall degrades to dropped journal
 * lines rather than to failed business requests).
 */
@Service
@Slf4j
public class ActivityLogService {

    /** One journal event. Append-only: never mutated once written. */
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ActivityEntry {
        public String id;
        public String timestamp; // ISO-8601 instant, UTC
        public String user; // login (email) — the actor
        public String userName; // display name when known
        public String role; // Client / Fournisseur / Client and Fournisseur
        public String customerNo;
        public String vendorNo;
        public String category; // AUTH, COMMANDE, PEC, DOCUMENT, BRIS, ARTICLE, EXPORT, AUTRE
        public String action; // human-readable label (fr)
        public String reference; // affected document, when derivable from the route
        public String method;
        public String path;
        public String query;
        public Integer status; // HTTP status
        public Long durationMs;
        public String ip;
        public String userAgent;
        public Boolean success;
        public String detail; // free-form extra (error message, …)
        public String payload; // request body sent by the user (redacted + truncated)
        public String responseBody; // JSON answer returned to them (truncated)
        public String context; // what the app said it was doing (X-Activity-Context header)
        public String summary; // what was done, in business terms (see ActivityNarrator)
        public List<ActivityChange> changes; // field-by-field, with the previous value when known
    }

    /** One modified field: "Prix unitaire", 100 → 120. */
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ActivityChange {
        public String label;
        public String before; // null when the app didn't send the previous value
        public String after;
    }

    /** A page of journal entries plus the facets the UI needs to build its filters. */
    public static class ActivityQueryResult {
        public List<ActivityEntry> items = new ArrayList<>();
        public int total;
        public int page;
        public int size;
        public List<String> users = new ArrayList<>();
        public List<String> categories = new ArrayList<>();
        public Map<String, Integer> countsByCategory = new LinkedHashMap<>();
        public Map<String, Integer> countsByDay = new TreeMap<>();
        public int distinctUsers;
        public int failures;
    }

    private static final DateTimeFormatter MONTH_FMT = DateTimeFormatter.ofPattern("yyyy-MM", Locale.ROOT);
    private static final String FILE_PREFIX = "activity-";
    private static final String FILE_SUFFIX = ".jsonl";

    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${activity-log.enabled:true}")
    private boolean enabled;

    @Value("${activity-log.dir}")
    private String configuredDir;

    @Value("${activity-log.retention-months:24}")
    private int retentionMonths;

    /**
     * Business timezone. Events are stored as UTC instants, but day filtering and the
     * per-day counts use local days — otherwise "aujourd'hui" silently drops the events
     * of the first hour of the day (Tunis is UTC+1).
     */
    @Value("${activity-log.zone:Africa/Tunis}")
    private String zoneId;

    private Path logsPath;
    private ThreadPoolExecutor writer;

    @jakarta.annotation.PostConstruct
    public void init() {
        logsPath = prepareLogsDir();
        // Bounded queue + CallerRunsPolicy: under a burst the calling thread writes the
        // line itself rather than the event being lost.
        writer = new ThreadPoolExecutor(1, 1, 0L, TimeUnit.MILLISECONDS, new ArrayBlockingQueue<>(2000),
                r -> {
                    Thread t = new Thread(r, "activity-log-writer");
                    t.setDaemon(true);
                    return t;
                },
                new ThreadPoolExecutor.CallerRunsPolicy());
        log.info("Journal d'activité: enabled={}, dir={}, retention={} mois", enabled, logsPath, retentionMonths);
        purgeOldFiles();
    }

    @jakarta.annotation.PreDestroy
    public void shutdown() {
        if (writer != null) {
            writer.shutdown();
            try {
                writer.awaitTermination(5, TimeUnit.SECONDS);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
    }

    /**
     * Resolve a writable journal directory. Mirrors the bris de glace fallback chain so a
     * bad ACTIVITY_LOG_DIR (e.g. /data on a local macOS run) degrades to a local folder
     * instead of killing startup.
     */
    private Path prepareLogsDir() {
        String[] candidates = {
                configuredDir,
                Paths.get(System.getProperty("user.dir", "."), "logs", "activity").toString(),
                Paths.get(System.getProperty("java.io.tmpdir", "/tmp"), "plexus-activity-log").toString()
        };
        for (String candidate : candidates) {
            if (candidate == null || candidate.isBlank()) {
                continue;
            }
            try {
                Path p = Paths.get(candidate).toAbsolutePath().normalize();
                Files.createDirectories(p);
                if (Files.isWritable(p)) {
                    return p;
                }
                log.warn("Journal d'activité: dossier non inscriptible, essai suivant: {}", p);
            } catch (Exception e) {
                log.warn("Journal d'activité: dossier inutilisable {} ({})", candidate, e.getMessage());
            }
        }
        // Last resort: keep the app running, journal disabled.
        enabled = false;
        return Paths.get(".").toAbsolutePath().normalize();
    }

    // ==================== WRITE ====================

    public void record(ActivityEntry entry) {
        if (!enabled || entry == null) {
            return;
        }
        if (entry.id == null) {
            entry.id = UUID.randomUUID().toString();
        }
        if (entry.timestamp == null) {
            entry.timestamp = java.time.Instant.now().toString();
        }
        final ActivityEntry toWrite = entry;
        writer.execute(() -> append(toWrite));
    }

    private void append(ActivityEntry entry) {
        try {
            String line = mapper.writeValueAsString(entry) + System.lineSeparator();
            Path file = fileFor(YearMonth.from(java.time.Instant.parse(entry.timestamp).atZone(zone())));
            Files.writeString(file, line, StandardCharsets.UTF_8,
                    StandardOpenOption.CREATE, StandardOpenOption.APPEND);
        } catch (Exception e) {
            // The journal must never break the request it describes.
            log.warn("Journal d'activité: écriture impossible ({})", e.getMessage());
        }
    }

    /** Business timezone, falling back to UTC if misconfigured. */
    private ZoneId zone() {
        try {
            return ZoneId.of(zoneId);
        } catch (Exception e) {
            return ZoneOffset.UTC;
        }
    }

    private Path fileFor(YearMonth month) {
        return logsPath.resolve(FILE_PREFIX + month.format(MONTH_FMT) + FILE_SUFFIX);
    }

    // ==================== READ ====================

    /**
     * Query the journal. {@code from}/{@code to} are inclusive calendar days; the other
     * filters are optional (null/blank = no filtering). Results are newest-first.
     */
    public ActivityQueryResult query(LocalDate from, LocalDate to, String user, String category,
            String search, int page, int size) {

        ActivityQueryResult result = scan(from, to, user, category, search);
        List<ActivityEntry> matched = result.items;

        result.page = Math.max(page, 0);
        result.size = size <= 0 ? 50 : Math.min(size, 500);

        int fromIndex = Math.min(result.page * result.size, matched.size());
        int toIndex = Math.min(fromIndex + result.size, matched.size());
        result.items = new ArrayList<>(matched.subList(fromIndex, toIndex));
        return result;
    }

    /**
     * One pass over the month files in range. Returns every match (newest-first) in
     * {@code items} plus the facets — callers slice the page they need.
     */
    private ActivityQueryResult scan(LocalDate from, LocalDate to, String user, String category, String search) {

        LocalDate today = LocalDate.now(zone());
        LocalDate start = from != null ? from : today.minusDays(30);
        LocalDate end = to != null ? to : today;
        if (end.isBefore(start)) {
            LocalDate swap = start;
            start = end;
            end = swap;
        }

        String userFilter = blankToNull(user);
        String categoryFilter = blankToNull(category);
        String needle = blankToNull(search) != null ? search.trim().toLowerCase(Locale.ROOT) : null;

        List<ActivityEntry> matched = new ArrayList<>();
        java.util.Set<String> allUsers = new java.util.TreeSet<>();
        java.util.Set<String> allCategories = new java.util.TreeSet<>();
        Map<String, Integer> byCategory = new LinkedHashMap<>();
        Map<String, Integer> byDay = new TreeMap<>();
        java.util.Set<String> distinctUsers = new java.util.HashSet<>();
        int failures = 0;

        YearMonth cursor = YearMonth.from(start);
        YearMonth last = YearMonth.from(end);
        while (!cursor.isAfter(last)) {
            Path file = fileFor(cursor);
            if (Files.exists(file)) {
                try (Stream<String> lines = Files.lines(file, StandardCharsets.UTF_8)) {
                    for (String line : (Iterable<String>) lines::iterator) {
                        if (line == null || line.isBlank()) {
                            continue;
                        }
                        ActivityEntry e;
                        try {
                            e = mapper.readValue(line, ActivityEntry.class);
                        } catch (Exception ex) {
                            continue; // skip a corrupt/partial line rather than failing the page
                        }
                        LocalDate day = dayOf(e);
                        if (day == null || day.isBefore(start) || day.isAfter(end)) {
                            continue;
                        }
                        // Facets are built on the date range only, so the dropdowns stay
                        // usable while the other filters narrow the table.
                        if (e.user != null) {
                            allUsers.add(e.user);
                        }
                        if (e.category != null) {
                            allCategories.add(e.category);
                        }
                        if (userFilter != null && !userFilter.equalsIgnoreCase(e.user)) {
                            continue;
                        }
                        if (categoryFilter != null && !categoryFilter.equalsIgnoreCase(e.category)) {
                            continue;
                        }
                        if (needle != null && !matchesSearch(e, needle)) {
                            continue;
                        }
                        matched.add(e);
                        byCategory.merge(e.category == null ? "AUTRE" : e.category, 1, Integer::sum);
                        byDay.merge(day.toString(), 1, Integer::sum);
                        if (e.user != null) {
                            distinctUsers.add(e.user);
                        }
                        if (Boolean.FALSE.equals(e.success)) {
                            failures++;
                        }
                    }
                } catch (IOException ex) {
                    log.warn("Journal d'activité: lecture impossible {} ({})", file, ex.getMessage());
                }
            }
            cursor = cursor.plusMonths(1);
        }

        matched.sort(Comparator.comparing((ActivityEntry e) -> e.timestamp == null ? "" : e.timestamp).reversed());

        ActivityQueryResult result = new ActivityQueryResult();
        result.total = matched.size();
        result.users = new ArrayList<>(allUsers);
        result.categories = new ArrayList<>(allCategories);
        result.countsByCategory = byCategory;
        result.countsByDay = byDay;
        result.distinctUsers = distinctUsers.size();
        result.failures = failures;
        result.items = matched;
        return result;
    }

    /** Same filters as {@link #query}, but returns every match (used by the CSV export). */
    public List<ActivityEntry> queryAll(LocalDate from, LocalDate to, String user, String category, String search) {
        return scan(from, to, user, category, search).items;
    }

    private boolean matchesSearch(ActivityEntry e, String needle) {
        return contains(e.user, needle) || contains(e.userName, needle) || contains(e.action, needle)
                || contains(e.reference, needle) || contains(e.path, needle) || contains(e.customerNo, needle)
                || contains(e.vendorNo, needle) || contains(e.detail, needle) || contains(e.ip, needle);
    }

    private boolean contains(String value, String needle) {
        return value != null && value.toLowerCase(Locale.ROOT).contains(needle);
    }

    private LocalDate dayOf(ActivityEntry e) {
        try {
            return java.time.Instant.parse(e.timestamp).atZone(zone()).toLocalDate();
        } catch (Exception ex) {
            return null;
        }
    }

    private String blankToNull(String s) {
        return (s == null || s.isBlank()) ? null : s.trim();
    }

    // ==================== RETENTION ====================

    /** Drop month files older than the retention window. */
    private void purgeOldFiles() {
        if (retentionMonths <= 0) {
            return;
        }
        YearMonth cutoff = YearMonth.now(zone()).minusMonths(retentionMonths);
        try (Stream<Path> files = Files.list(logsPath)) {
            files.filter(p -> p.getFileName().toString().startsWith(FILE_PREFIX)
                    && p.getFileName().toString().endsWith(FILE_SUFFIX))
                    .forEach(p -> {
                        String name = p.getFileName().toString();
                        String monthPart = name.substring(FILE_PREFIX.length(), name.length() - FILE_SUFFIX.length());
                        try {
                            if (YearMonth.parse(monthPart, MONTH_FMT).isBefore(cutoff)) {
                                Files.deleteIfExists(p);
                                log.info("Journal d'activité: fichier purgé (rétention) {}", name);
                            }
                        } catch (Exception ignored) {
                            // not a journal file we recognise — leave it alone
                        }
                    });
        } catch (IOException e) {
            log.warn("Journal d'activité: purge impossible ({})", e.getMessage());
        }
    }
}
