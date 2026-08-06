'use client';

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

// material-ui
import { useTheme, styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Tooltip from '@mui/material/Tooltip';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Divider from '@mui/material/Divider';

// next
import { useRouter } from 'next/navigation';

// third-party
import ReactECharts from 'echarts-for-react';
import { motion } from 'framer-motion';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

// project-imports
import useUser from 'hooks/useUser';
import MainCard from 'components/MainCard';
import {
  ActivityEntry,
  ActivityLogFilters,
  ActivityLogResponse,
  exportActivityLog,
  fetchActivityLog
} from 'app/api/services/ActivityLogService';

// assets
import {
  ArrowLeft2,
  Activity,
  Profile2User,
  DocumentDownload,
  Refresh,
  SearchNormal1,
  Danger,
  Copy,
  CloseCircle
} from '@wandersonalwes/iconsax-react';

// ==============================|| STYLED ||============================== //

const PageContainer = styled(Box)(({ theme }) => ({
  background: theme.palette.mode === 'dark' ? '#070a13' : '#f8fafc',
  minHeight: '100vh',
  padding: theme.spacing(3.5),
  borderRadius: '32px',
  fontFamily: 'Inter, sans-serif'
}));

const HeaderRow = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(4)
}));

const PremiumCard = styled(MainCard)(({ theme }) => ({
  borderRadius: '28px',
  border: 'none',
  background: theme.palette.mode === 'dark' ? '#111827' : '#ffffff',
  boxShadow: theme.palette.mode === 'dark' ? '0 12px 48px -8px rgba(0, 0, 0, 0.3)' : '0 12px 48px -8px rgba(17, 24, 39, 0.02)',
  overflow: 'hidden',
  height: '100%',
  '& .MuiCardHeader-root': { padding: '28px 32px 8px 32px' },
  '& .MuiCardContent-root': { padding: '8px 32px 32px 32px' }
}));

const KpiCard = styled(motion.div)<{ accent: string }>(({ theme, accent }) => ({
  background: theme.palette.mode === 'dark' ? '#111827' : '#ffffff',
  borderRadius: '24px',
  padding: '26px 28px',
  height: '100%',
  position: 'relative',
  overflow: 'hidden',
  boxShadow: theme.palette.mode === 'dark' ? '0 12px 40px -12px rgba(0,0,0,0.4)' : '0 12px 40px -14px rgba(17,24,39,0.06)',
  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(17,24,39,0.03)'}`,
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '5px',
    height: '100%',
    background: accent
  }
}));

// ==============================|| HELPERS ||============================== //

const ALL = 'ALL';
const AUTO_REFRESH_MS = 30000;

/** Category → French label + accent colour used by the chips and the chart. */
const CATEGORY_META: Record<string, { label: string; color: string }> = {
  AUTH: { label: 'Connexions', color: '#6366f1' },
  COMMANDE: { label: 'Commandes', color: '#0ea5e9' },
  PEC: { label: 'Demandes PEC', color: '#f59e0b' },
  DOCUMENT: { label: 'Documents', color: '#10b981' },
  BRIS: { label: 'Bris de glace', color: '#8b5cf6' },
  ARTICLE: { label: 'Articles', color: '#ec4899' },
  EXPORT: { label: 'Exports', color: '#14b8a6' },
  AUTRE: { label: 'Autres', color: '#94a3b8' }
};

const categoryMeta = (category?: string | null) =>
  CATEGORY_META[(category || 'AUTRE').toUpperCase()] || { label: category || 'Autres', color: '#94a3b8' };

const formatLocalDate = (date: Date | null) => {
  if (!date) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const parseLocalDate = (dateStr: string) => {
  const parts = dateStr.split('-');
  return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
};

/** Stored instants are UTC; the journal is read in local (Tunis) time. */
const formatDateTime = (iso: string) => {
  if (!iso) return '-';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(d);
};

const formatDayLabel = (day: string) => `${day.substring(8, 10)}/${day.substring(5, 7)}`;

const formatInt = (val: number) => new Intl.NumberFormat('fr-FR').format(Math.round(val || 0));

/** Who did it: the BC display name when known, otherwise the login. */
const actorLabel = (entry: ActivityEntry) => entry.userName || entry.user || 'anonyme';

/** Long form with the seconds and the timezone, for the detail modal. */
const formatFullDateTime = (iso: string) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'full', timeStyle: 'medium' }).format(d);
};

/** Pretty-print a captured body; non-JSON payloads are shown as-is. */
const prettyBody = (raw?: string | null) => {
  if (!raw) return null;
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw;
  }
};

/** Readable "Chrome sur Windows" from the raw user agent. */
const describeClient = (userAgent?: string | null) => {
  if (!userAgent) return '—';
  const browser = /Edg\//.test(userAgent)
    ? 'Edge'
    : /Chrome\//.test(userAgent)
      ? 'Chrome'
      : /Firefox\//.test(userAgent)
        ? 'Firefox'
        : /Safari\//.test(userAgent)
          ? 'Safari'
          : /curl/i.test(userAgent)
            ? 'curl'
            : 'Navigateur inconnu';
  const os = /Windows/.test(userAgent)
    ? 'Windows'
    : /Mac OS X|Macintosh/.test(userAgent)
      ? 'macOS'
      : /Android/.test(userAgent)
        ? 'Android'
        : /iPhone|iPad/.test(userAgent)
          ? 'iOS'
          : /Linux/.test(userAgent)
            ? 'Linux'
            : null;
  return os ? `${browser} sur ${os}` : browser;
};

// ==============================|| DETAIL MODAL PARTS ||============================== //

/** One label/value pair of the detail modal. */
function DetailField({ label, value, mono, span }: { label: string; value?: ReactNode; mono?: boolean; span?: number }) {
  const empty = value === null || value === undefined || value === '';
  return (
    <Grid size={{ xs: 12, sm: span || 6 }}>
      <Typography
        variant="caption"
        sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'text.secondary' }}
      >
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{ fontWeight: 600, wordBreak: 'break-word', fontFamily: mono ? 'monospace' : undefined }}
      >
        {empty ? '—' : value}
      </Typography>
    </Grid>
  );
}

/** Captured request/response body, pretty-printed and scrollable. */
function BodyBlock({ title, body }: { title: string; body?: string | null }) {
  const pretty = prettyBody(body);
  if (!pretty) return null;
  return (
    <Box sx={{ mt: 2.5 }}>
      <Typography
        variant="caption"
        sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'text.secondary' }}
      >
        {title}
      </Typography>
      <Box
        component="pre"
        sx={{
          mt: 0.5,
          mb: 0,
          p: 2,
          borderRadius: '12px',
          bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#0b1220' : '#f1f5f9'),
          border: (theme) => `1px solid ${theme.palette.divider}`,
          maxHeight: 260,
          overflow: 'auto',
          fontSize: 12,
          fontFamily: 'monospace',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}
      >
        {pretty}
      </Box>
    </Box>
  );
}

// ==============================|| JOURNAL D'ACTIVITÉ ||============================== //

export default function ActivityJournal() {
  const theme = useTheme();
  const router = useRouter();
  const user = useUser();

  // Reserved to the admin account (the one with the consolidated dashboard). The guard
  // (return null) sits AFTER every hook so React always sees the same hook order.
  const isAdmin = !!user && user.customerNo === 'C0082';

  useEffect(() => {
    if (user && user.customerNo !== 'C0082') {
      router.push('/pages/articles');
    }
  }, [user, router]);

  const todayStr = formatLocalDate(new Date());
  const defaultStart = formatLocalDate(new Date(Date.now() - 29 * 24 * 60 * 60 * 1000));

  // Applied filters (drive the fetch) vs. draft filters (bound to the inputs).
  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(todayStr);
  const [tempStartDate, setTempStartDate] = useState(defaultStart);
  const [tempEndDate, setTempEndDate] = useState(todayStr);
  const [selectedUser, setSelectedUser] = useState(ALL);
  const [selectedCategory, setSelectedCategory] = useState(ALL);
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);

  const [data, setData] = useState<ActivityLogResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [selected, setSelected] = useState<ActivityEntry | null>(null);
  const [copied, setCopied] = useState(false);

  const filters: ActivityLogFilters = useMemo(
    () => ({
      startDate,
      endDate,
      user: selectedUser === ALL ? undefined : selectedUser,
      category: selectedCategory === ALL ? undefined : selectedCategory,
      search: appliedSearch || undefined
    }),
    [startDate, endDate, selectedUser, selectedCategory, appliedSearch]
  );

  const load = useCallback(
    async (silent = false) => {
      if (!isAdmin) return;
      if (!silent) setLoading(true);
      setError(null);
      try {
        const result = await fetchActivityLog(filters, page, rowsPerPage);
        setData(result);
        setLastRefresh(new Date());
      } catch (err: any) {
        const status = err?.response?.status;
        setError(
          status === 403
            ? "Accès au journal d'activité réservé au compte administrateur."
            : "Impossible de charger le journal d'activité. Réessayez dans un instant."
        );
      } finally {
        setLoading(false);
      }
    },
    [filters, page, rowsPerPage, isAdmin]
  );

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!autoRefresh) return;
    const timer = setInterval(() => load(true), AUTO_REFRESH_MS);
    return () => clearInterval(timer);
  }, [autoRefresh, load]);

  const applyFilters = () => {
    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
    setAppliedSearch(search);
    setPage(0);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await exportActivityLog(filters);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `journal-activite-${startDate}_${endDate}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setError("Export du journal impossible.");
    } finally {
      setExporting(false);
    }
  };

  const copyDetails = async () => {
    if (!selected) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(selected, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard blocked (http origin / permissions) — not worth an error banner
    }
  };

  const chartOption = useMemo(() => {
    const days = Object.keys(data?.countsByDay || {});
    const values = days.map((d) => (data?.countsByDay || {})[d]);
    return {
      grid: { left: 8, right: 16, top: 24, bottom: 8, containLabel: true },
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: days.map(formatDayLabel),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: theme.palette.text.secondary, fontSize: 11 }
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: theme.palette.divider, type: 'dashed' } },
        axisLabel: { color: theme.palette.text.secondary, fontSize: 11 }
      },
      series: [
        {
          type: 'bar',
          data: values,
          barMaxWidth: 22,
          itemStyle: { color: '#6366f1', borderRadius: [6, 6, 0, 0] }
        }
      ]
    };
  }, [data, theme]);

  const categoryRows = useMemo(() => {
    const counts = data?.countsByCategory || {};
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [data]);

  const topCategory = categoryRows.length > 0 ? categoryMeta(categoryRows[0][0]).label : '-';

  if (!isAdmin) {
    return null;
  }

  return (
    <PageContainer>
      {/* Header */}
      <HeaderRow>
        <Stack direction="row" spacing={2} alignItems="center">
          <IconButton
            onClick={() => router.push('/dashboard/default')}
            sx={{
              bgcolor: theme.palette.mode === 'dark' ? '#1e293b' : '#ffffff',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              '&:hover': { bgcolor: theme.palette.mode === 'dark' ? '#243449' : '#f1f5f9' }
            }}
          >
            <ArrowLeft2 size="20" />
          </IconButton>
          <Stack spacing={0.5}>
            <Typography variant="h2" sx={{ fontWeight: 800, letterSpacing: '-1.5px', color: 'text.primary' }}>
              Journal d&apos;activité
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
              Traçabilité des actions réalisées dans l&apos;application (connexions, commandes, demandes PEC, documents, exports)
            </Typography>
          </Stack>
        </Stack>

        <Stack direction="row" spacing={1.5} alignItems="center">
          <FormControlLabel
            control={<Switch size="small" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} />}
            label={<Typography variant="caption" sx={{ fontWeight: 600 }}>Rafraîchissement auto</Typography>}
          />
          <Tooltip title="Rafraîchir maintenant">
            <IconButton
              onClick={() => load()}
              sx={{
                bgcolor: theme.palette.mode === 'dark' ? '#1e293b' : '#ffffff',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
              }}
            >
              <Refresh size="20" />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<DocumentDownload size="18" variant="Bold" />}
            onClick={handleExport}
            disabled={exporting || loading}
            sx={{
              borderRadius: '50px',
              textTransform: 'none',
              fontWeight: 700,
              px: 3,
              py: 1,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)',
              '&:hover': { background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }
            }}
          >
            {exporting ? 'Export…' : 'Exporter (CSV)'}
          </Button>
        </Stack>
      </HeaderRow>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '16px' }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <PremiumCard content={false} sx={{ mb: 3, p: 3 }}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <DatePicker
                label="Du"
                value={parseLocalDate(tempStartDate)}
                maxDate={new Date()}
                onChange={(v) => v && setTempStartDate(formatLocalDate(v))}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <DatePicker
                label="Au"
                value={parseLocalDate(tempEndDate)}
                maxDate={new Date()}
                onChange={(v) => v && setTempEndDate(formatLocalDate(v))}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
              <TextField
                select
                fullWidth
                size="small"
                label="Utilisateur"
                value={selectedUser}
                onChange={(e) => {
                  setSelectedUser(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value={ALL}>Tous les utilisateurs</MenuItem>
                {(data?.users || []).map((u) => (
                  <MenuItem key={u} value={u}>
                    {u}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <TextField
                select
                fullWidth
                size="small"
                label="Catégorie"
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value={ALL}>Toutes les catégories</MenuItem>
                {(data?.categories || []).map((c) => (
                  <MenuItem key={c} value={c}>
                    {categoryMeta(c).label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 8, md: 2.5 }}>
              <TextField
                fullWidth
                size="small"
                label="Rechercher"
                placeholder="Utilisateur, action, document, IP…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') applyFilters();
                }}
                InputProps={{
                  startAdornment: (
                    <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                      <SearchNormal1 size="16" color={theme.palette.text.secondary} />
                    </Box>
                  )
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4, md: 1 }}>
              <Button
                fullWidth
                variant="contained"
                onClick={applyFilters}
                disabled={loading}
                sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700 }}
              >
                Filtrer
              </Button>
            </Grid>
          </Grid>
        </LocalizationProvider>
      </PremiumCard>

      {/* KPIs */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard accent="#6366f1" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Stack spacing={0.5}>
                <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'text.secondary' }}>
                  Événements tracés
                </Typography>
                <Typography variant="h2" sx={{ fontWeight: 900, letterSpacing: '-1px' }}>
                  {formatInt(data?.total || 0)}
                </Typography>
              </Stack>
              <Activity size="26" color="#6366f1" variant="Bold" />
            </Stack>
          </KpiCard>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard accent="#0ea5e9" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Stack spacing={0.5}>
                <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'text.secondary' }}>
                  Utilisateurs actifs
                </Typography>
                <Typography variant="h2" sx={{ fontWeight: 900, letterSpacing: '-1px' }}>
                  {formatInt(data?.distinctUsers || 0)}
                </Typography>
              </Stack>
              <Profile2User size="26" color="#0ea5e9" variant="Bold" />
            </Stack>
          </KpiCard>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard accent="#ef4444" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.1 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Stack spacing={0.5}>
                <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'text.secondary' }}>
                  Actions en échec
                </Typography>
                <Typography variant="h2" sx={{ fontWeight: 900, letterSpacing: '-1px', color: (data?.failures || 0) > 0 ? '#ef4444' : 'inherit' }}>
                  {formatInt(data?.failures || 0)}
                </Typography>
              </Stack>
              <Danger size="26" color="#ef4444" variant="Bold" />
            </Stack>
          </KpiCard>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard accent="#10b981" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.15 }}>
            <Stack spacing={0.5}>
              <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'text.secondary' }}>
                Activité principale
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-0.5px' }}>
                {topCategory}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                {lastRefresh ? `Actualisé à ${new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(lastRefresh)}` : '—'}
              </Typography>
            </Stack>
          </KpiCard>
        </Grid>
      </Grid>

      {/* Volume per day + breakdown */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <PremiumCard title="Volume d'activité par jour">
            {loading && !data ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress size={32} />
              </Box>
            ) : (
              <ReactECharts option={chartOption} style={{ height: 260 }} notMerge />
            )}
          </PremiumCard>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <PremiumCard title="Répartition par catégorie">
            <Stack spacing={1.5}>
              {categoryRows.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  Aucune activité sur la période.
                </Typography>
              )}
              {categoryRows.map(([category, count]) => {
                const meta = categoryMeta(category);
                const pct = data && data.total > 0 ? (count / data.total) * 100 : 0;
                return (
                  <Box key={category}>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {meta.label}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                        {formatInt(count)} · {pct.toFixed(0)}%
                      </Typography>
                    </Stack>
                    <Box sx={{ height: 8, borderRadius: 8, bgcolor: theme.palette.action.hover, overflow: 'hidden' }}>
                      <Box sx={{ width: `${pct}%`, height: '100%', bgcolor: meta.color, borderRadius: 8 }} />
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          </PremiumCard>
        </Grid>
      </Grid>

      {/* Journal table */}
      <PremiumCard content={false}>
        <Box sx={{ px: 3, pt: 2.5, pb: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            Cliquez sur une ligne pour afficher le détail complet de l&apos;action.
          </Typography>
        </Box>
        <TableContainer>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Date / heure</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Utilisateur</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Catégorie</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Référence</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Résultat</TableCell>
                <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>Durée</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>IP</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={28} />
                  </TableCell>
                </TableRow>
              )}

              {!loading && (data?.items || []).length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Aucune activité pour ces critères.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}

              {!loading &&
                (data?.items || []).map((entry) => {
                  const meta = categoryMeta(entry.category);
                  const failed = entry.success === false;
                  return (
                    <TableRow key={entry.id} hover onClick={() => setSelected(entry)} sx={{ cursor: 'pointer' }}>
                      <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 600 }}>{formatDateTime(entry.timestamp)}</TableCell>
                      <TableCell>
                        <Stack spacing={0.2}>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {actorLabel(entry)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {[entry.user !== actorLabel(entry) ? entry.user : null, entry.customerNo, entry.vendorNo]
                              .filter(Boolean)
                              .join(' · ') || '—'}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={meta.label}
                          sx={{
                            fontWeight: 700,
                            color: meta.color,
                            bgcolor: `${meta.color}1a`,
                            border: `1px solid ${meta.color}33`
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ maxWidth: 420 }}>
                        <Tooltip title={`${entry.method || ''} ${entry.path || ''}`.trim()}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {entry.action}
                          </Typography>
                        </Tooltip>
                        {/* What actually happened, in business terms */}
                        {entry.summary && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}
                          >
                            {entry.summary}
                          </Typography>
                        )}
                        {entry.detail && (
                          <Typography variant="caption" color="error.main" sx={{ display: 'block' }}>
                            {entry.detail}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ fontFamily: 'monospace' }}>{entry.reference || '—'}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={failed ? `Échec${entry.status ? ` (${entry.status})` : ''}` : 'Succès'}
                          color={failed ? 'error' : 'success'}
                          variant={failed ? 'filled' : 'outlined'}
                          sx={{ fontWeight: 700 }}
                        />
                      </TableCell>
                      <TableCell align="right">{entry.durationMs != null ? `${formatInt(entry.durationMs)} ms` : '—'}</TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>{entry.ip || '—'}</TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={data?.total || 0}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[25, 50, 100, 200]}
          labelRowsPerPage="Lignes par page"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
        />
      </PremiumCard>

      {/* Detail of one event */}
      <Dialog
        open={!!selected}
        onClose={() => setSelected(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: '24px' } }}
      >
        {selected && (
          <>
            <DialogTitle sx={{ pb: 1.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                <Stack spacing={1}>
                  <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.5px' }}>
                    {selected.action}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                    <Chip
                      size="small"
                      label={categoryMeta(selected.category).label}
                      sx={{
                        fontWeight: 700,
                        color: categoryMeta(selected.category).color,
                        bgcolor: `${categoryMeta(selected.category).color}1a`,
                        border: `1px solid ${categoryMeta(selected.category).color}33`
                      }}
                    />
                    <Chip
                      size="small"
                      label={
                        selected.success === false
                          ? `Échec${selected.status ? ` (${selected.status})` : ''}`
                          : `Succès${selected.status ? ` (${selected.status})` : ''}`
                      }
                      color={selected.success === false ? 'error' : 'success'}
                      variant={selected.success === false ? 'filled' : 'outlined'}
                      sx={{ fontWeight: 700 }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      {formatFullDateTime(selected.timestamp)}
                    </Typography>
                  </Stack>
                </Stack>
                <IconButton onClick={() => setSelected(null)} size="small">
                  <CloseCircle size="22" />
                </IconButton>
              </Stack>
            </DialogTitle>

            <DialogContent dividers sx={{ borderColor: 'divider' }}>
              {/* Plain-language recap, first thing read */}
              {(selected.summary || selected.context) && (
                <Box
                  sx={{
                    mb: 2.5,
                    p: 2,
                    borderRadius: '14px',
                    bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.07)'),
                    border: '1px solid rgba(99,102,241,0.25)'
                  }}
                >
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>
                    {actorLabel(selected)} — {selected.summary || selected.context}
                  </Typography>
                </Box>
              )}

              {selected.changes && selected.changes.length > 0 && (
                <Box sx={{ mb: 2.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                    Ce qui a changé
                  </Typography>
                  <Table size="small">
                    <TableBody>
                      {selected.changes.map((change, idx) => (
                        <TableRow key={`${change.label}-${idx}`}>
                          <TableCell sx={{ fontWeight: 700, width: '40%', border: 0, py: 0.75 }}>{change.label}</TableCell>
                          <TableCell sx={{ border: 0, py: 0.75 }}>
                            {change.before != null && change.before !== change.after ? (
                              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                                <Typography variant="body2" sx={{ textDecoration: 'line-through', color: 'text.disabled' }}>
                                  {change.before}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  →
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                                  {change.after}
                                </Typography>
                              </Stack>
                            ) : (
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {change.after ?? '—'}
                              </Typography>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              )}

              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>
                Qui
              </Typography>
              <Grid container spacing={2}>
                <DetailField label="Utilisateur" value={actorLabel(selected)} />
                <DetailField label="Login" value={selected.user} mono />
                <DetailField label="Rôle" value={selected.role} />
                <DetailField label="N° client / fournisseur" value={[selected.customerNo, selected.vendorNo].filter(Boolean).join(' · ')} />
                <DetailField label="Adresse IP" value={selected.ip} mono />
                <DetailField label="Poste / navigateur" value={describeClient(selected.userAgent)} />
              </Grid>

              <Divider sx={{ my: 2.5 }} />

              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>
                Quoi
              </Typography>
              <Grid container spacing={2}>
                <DetailField label="Action" value={selected.action} span={12} />
                {selected.context && <DetailField label="Élément concerné" value={selected.context} span={12} />}
                <DetailField label="Document concerné" value={selected.reference} mono />
                <DetailField label="Durée de traitement" value={selected.durationMs != null ? `${formatInt(selected.durationMs)} ms` : null} />
                <DetailField label="Requête" value={`${selected.method || ''} ${selected.path || ''}`.trim()} mono span={12} />
                <DetailField label="Paramètres" value={selected.query} mono span={12} />
                {selected.detail && <DetailField label="Motif" value={selected.detail} span={12} />}
                <DetailField label="Identifiant de l'événement" value={selected.id} mono span={12} />
              </Grid>

              <BodyBlock title="Données envoyées" body={selected.payload} />
              <BodyBlock title="Réponse du système" body={selected.responseBody} />

              {!selected.payload && !selected.responseBody && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2.5, fontWeight: 600 }}>
                  Aucun contenu enregistré pour cette action (consultation, téléchargement de document ou connexion).
                </Typography>
              )}
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
              <Button
                startIcon={<Copy size="18" />}
                onClick={copyDetails}
                sx={{ textTransform: 'none', fontWeight: 700 }}
              >
                {copied ? 'Copié' : 'Copier le détail'}
              </Button>
              <Button variant="contained" onClick={() => setSelected(null)} sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '12px' }}>
                Fermer
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </PageContainer>
  );
}
