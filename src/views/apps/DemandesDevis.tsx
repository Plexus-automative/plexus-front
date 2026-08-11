'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// next
import { useSearchParams } from 'next/navigation';

// material-ui
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
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Divider from '@mui/material/Divider';
import { alpha } from '@mui/material/styles';

// project-imports
import MainCard from 'components/MainCard';
import MediaGallery from 'components/demandes-devis/MediaGallery';
import useUser from 'hooks/useUser';
import {
  DemandeDevis,
  DemandeDevisFilters,
  fetchDemandeDevis,
  fetchDemandesDevis,
  setDemandeTreated
} from 'app/api/services/DemandeDevisService';

// assets
import {
  Refresh,
  TickCircle,
  Gallery,
  Microphone2,
  DocumentText,
  Car,
  CloseCircle
} from '@wandersonalwes/iconsax-react';

// ==============================|| DEMANDES DE DEVIS - CONSULTATION ||============================== //

const PLEXUS_CUSTOMER_NO = 'C0090';

/**
 * Renders an ISO-8601 instant in the reader's locale.
 *
 * The commercial's capture time carries its own offset (e.g. +01:00) and the receipt time
 * is UTC, so both are normalised here rather than shown raw — a demande that appears to
 * have been photographed an hour before the visit is worse than no timestamp at all.
 */
const formatDateTime = (value?: string | null) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/** Counts media by kind so the table can show what a demande actually contains. */
const mediaBreakdown = (media: DemandeDevis['media']) => {
  const t = (m: { type?: string }) => (m.type || '').toLowerCase();
  return {
    photos: (media || []).filter((m) => ['photo', 'image'].includes(t(m))).length,
    audios: (media || []).filter((m) => t(m) === 'audio').length,
    docs: (media || []).filter((m) => !['photo', 'image', 'audio'].includes(t(m))).length
  };
};

/** One labelled value in the detail dialog. */
function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <Stack spacing={0.25}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: value ? 500 : 400 }}>
        {value || '—'}
      </Typography>
    </Stack>
  );
}

export default function DemandesDevis() {
  const user = useUser();
  const searchParams = useSearchParams();
  /** Set by a notification click: /pages/demandes-devis?number=DV26%2F0001 */
  const wantedNumber = searchParams.get('number');

  const [rows, setRows] = useState<DemandeDevis[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<DemandeDevis | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  // Filters. `treated` is a tri-state: '' = all, 'false' = à traiter, 'true' = traitées.
  // Defaults to all: a demande that has just been handled stays on screen with its status
  // visibly changed, instead of vanishing from the list the moment you act on it.
  const [treated, setTreated] = useState<string>('');
  const [garage, setGarage] = useState('');
  const [immatriculation, setImmatriculation] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const isPlexus = !!user && user.customerNo === PLEXUS_CUSTOMER_NO;

  const filters = useMemo<DemandeDevisFilters>(
    () => ({
      ...(treated !== '' ? { treated: treated === 'true' } : {}),
      ...(garage.trim() ? { garage: garage.trim() } : {}),
      ...(immatriculation.trim() ? { immatriculation: immatriculation.trim() } : {}),
      ...(from ? { from } : {}),
      ...(to ? { to } : {})
    }),
    [treated, garage, immatriculation, from, to]
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDemandesDevis(filters, rowsPerPage, page * rowsPerPage);
      setRows(data.items || []);
      setTotal(data.total || 0);
    } catch (e: any) {
      setError(
        e?.response?.status === 403
          ? "Cette page est réservée au compte Plexus."
          : "Impossible de charger les demandes de devis."
      );
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [filters, page, rowsPerPage]);

  useEffect(() => {
    if (isPlexus) load();
  }, [isPlexus, load]);

  // Opened once per `?number=`, otherwise re-running the list (filters, paging, treating)
  // would keep re-opening a dialog the user has deliberately closed.
  const openedNumber = useRef<string | null>(null);

  useEffect(() => {
    if (!isPlexus || !wantedNumber || openedNumber.current === wantedNumber) return;
    openedNumber.current = wantedNumber;

    // Usually already on screen — the notification fires for a demande that is, by
    // definition, the newest and untreated. Fall back to fetching it so an older link
    // still opens rather than silently doing nothing.
    const inList = rows.find((r) => r.number === wantedNumber);
    if (inList) {
      setSelected(inList);
      return;
    }
    fetchDemandeDevis(wantedNumber)
      .then(setSelected)
      .catch(() => setError(`La demande ${wantedNumber} est introuvable.`));
  }, [isPlexus, wantedNumber, rows]);

  const toggleTreated = async (row: DemandeDevis) => {
    setSavingId(row.id);
    setError(null);
    try {
      const updated = await setDemandeTreated(row.id, !row.treated);
      // Trust the value the server just confirmed. Re-fetching here used to undo the
      // change on screen: Business Central can still serve the pre-PATCH value for a
      // moment, so the reloaded row came back untreated and the chip flipped straight
      // back to "À traiter".
      const now = typeof updated?.treated === 'boolean' ? updated.treated : !row.treated;

      setRows((prev) => {
        const next = prev.map((r) => (r.id === row.id ? { ...r, treated: now } : r));
        // While a status filter is active, a row that no longer matches it should leave
        // the list — done locally rather than by reloading, for the same reason.
        if (treated !== '') {
          const keep = treated === 'true';
          const filtered = next.filter((r) => r.treated === keep);
          setTotal((t) => Math.max(0, t - (next.length - filtered.length)));
          return filtered;
        }
        return next;
      });

      setSelected((cur) => (cur && cur.id === row.id ? { ...cur, treated: now } : cur));
    } catch (e: any) {
      setError(e?.response?.data?.message || 'La mise à jour du statut a échoué.');
    } finally {
      setSavingId(null);
    }
  };

  const resetFilters = () => {
    setTreated('');
    setGarage('');
    setImmatriculation('');
    setFrom('');
    setTo('');
    setPage(0);
  };

  if (user && !isPlexus) {
    return (
      <MainCard title="Demandes de devis">
        <Alert severity="warning">Cette page est réservée au compte Plexus.</Alert>
      </MainCard>
    );
  }

  return (
    <MainCard
      title="Demandes de devis"
      secondary={
        <Tooltip title="Actualiser">
          <IconButton onClick={load} disabled={loading} size="small">
            <Refresh size={18} />
          </IconButton>
        </Tooltip>
      }
    >
      <Stack spacing={2.5}>
        <Typography variant="body2" color="text.secondary">
          Demandes transmises par les commerciaux en visite chez les garages. Les photos et
          vocaux restent hébergés par l&apos;application mobile — les liens ci-dessous ouvrent
          leurs fichiers.
        </Typography>

        {/* Filters */}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Statut"
              value={treated}
              onChange={(e) => {
                setTreated(e.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="">Toutes</MenuItem>
              <MenuItem value="false">À traiter</MenuItem>
              <MenuItem value="true">Traitées</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              size="small"
              label="Garage"
              value={garage}
              onChange={(e) => setGarage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (setPage(0), load())}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              fullWidth
              size="small"
              label="Immatriculation"
              value={immatriculation}
              onChange={(e) => setImmatriculation(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (setPage(0), load())}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3, md: 2 }}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Du"
              InputLabelProps={{ shrink: true }}
              value={from}
              onChange={(e) => {
                setFrom(e.target.value);
                setPage(0);
              }}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3, md: 2 }}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Au"
              InputLabelProps={{ shrink: true }}
              value={to}
              onChange={(e) => {
                setTo(e.target.value);
                setPage(0);
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 1 }}>
            <Button fullWidth variant="outlined" color="secondary" onClick={resetFilters}>
              Réinit.
            </Button>
          </Grid>
        </Grid>

        {error && <Alert severity="error">{error}</Alert>}

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>N°</TableCell>
                <TableCell>Saisie terrain</TableCell>
                <TableCell>Garage</TableCell>
                <TableCell>Véhicule</TableCell>
                <TableCell>Commercial</TableCell>
                <TableCell align="center">Médias</TableCell>
                <TableCell>Commande</TableCell>
                <TableCell align="center">Statut</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 5 }}>
                    <CircularProgress size={28} />
                  </TableCell>
                </TableRow>
              )}

              {!loading && rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 5 }}>
                    <Typography color="text.secondary">Aucune demande pour ces critères.</Typography>
                  </TableCell>
                </TableRow>
              )}

              {!loading &&
                rows.map((row) => {
                  const vehicule = [row.vehicle?.make, row.vehicle?.model].filter(Boolean).join(' ');
                  return (
                    <TableRow
                      key={row.id}
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => setSelected(row)}
                    >
                      <TableCell>
                        <Typography variant="subtitle2">{row.number}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {row.externalReference}
                        </Typography>
                      </TableCell>
                      <TableCell>{formatDateTime(row.createdOnDevice || row.receivedAt)}</TableCell>
                      <TableCell>{row.garage?.name || '—'}</TableCell>
                      <TableCell>
                        <Typography variant="body2">{row.vehicle?.immatriculation || '—'}</Typography>
                        {vehicule && (
                          <Typography variant="caption" color="text.secondary">
                            {vehicule}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>{row.commercial?.name || '—'}</TableCell>
                      <TableCell align="center">
                        {(() => {
                          const b = mediaBreakdown(row.media);
                          if (!row.media?.length) {
                            return (
                              <Typography variant="caption" color="text.secondary">
                                —
                              </Typography>
                            );
                          }
                          return (
                            <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                              {b.photos > 0 && (
                                <Tooltip title={`${b.photos} photo(s)`}>
                                  <Stack direction="row" spacing={0.25} alignItems="center">
                                    <Gallery size={14} />
                                    <Typography variant="caption">{b.photos}</Typography>
                                  </Stack>
                                </Tooltip>
                              )}
                              {b.audios > 0 && (
                                <Tooltip title={`${b.audios} vocal/vocaux`}>
                                  <Stack direction="row" spacing={0.25} alignItems="center">
                                    <Microphone2 size={14} />
                                    <Typography variant="caption">{b.audios}</Typography>
                                  </Stack>
                                </Tooltip>
                              )}
                              {b.docs > 0 && (
                                <Tooltip title={`${b.docs} document(s)`}>
                                  <Stack direction="row" spacing={0.25} alignItems="center">
                                    <DocumentText size={14} />
                                    <Typography variant="caption">{b.docs}</Typography>
                                  </Stack>
                                </Tooltip>
                              )}
                            </Stack>
                          );
                        })()}
                      </TableCell>
                      <TableCell>
                        {row.orderNo ? (
                          // Several numbers when the cart spanned more than one vendor.
                          <Stack spacing={0.25}>
                            {row.orderNo.split(',').map((n, i) => (
                              <Typography key={i} variant="body2" sx={{ fontWeight: 500 }}>
                                {n.trim()}
                              </Typography>
                            ))}
                          </Stack>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            —
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          size="small"
                          variant={row.treated ? 'filled' : 'outlined'}
                          color={row.treated ? 'success' : 'warning'}
                          label={row.treated ? 'Traitée' : 'À traiter'}
                        />
                      </TableCell>
                      <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="small"
                          variant={row.treated ? 'outlined' : 'contained'}
                          color={row.treated ? 'secondary' : 'success'}
                          disabled={savingId === row.id}
                          startIcon={<TickCircle size={16} />}
                          onClick={() => toggleTreated(row)}
                        >
                          {row.treated ? 'Rouvrir' : 'Traiter'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 25, 50, 100]}
          labelRowsPerPage="Lignes par page"
        />
      </Stack>

      {/* Detail */}
      <Dialog open={!!selected} onClose={() => setSelected(null)} maxWidth="md" fullWidth>
        {selected && (
          <>
            {/* Header: identity and state, above the fold */}
            <Box
              sx={{
                px: 3,
                pt: 2.5,
                pb: 2,
                bgcolor: (t) => alpha(t.palette.primary.main, 0.04),
                borderBottom: (t) => `1px solid ${t.palette.divider}`
              }}
            >
              <Stack direction="row" alignItems="flex-start" spacing={2}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: (t) => alpha(t.palette.primary.main, 0.12),
                    color: 'primary.main',
                    flex: '0 0 auto'
                  }}
                >
                  <Car size={22} />
                </Box>

                <Stack spacing={0.5} sx={{ minWidth: 0, flexGrow: 1 }}>
                  <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                    <Typography variant="h4">{selected.number}</Typography>
                    <Chip
                      size="small"
                      variant={selected.treated ? 'filled' : 'outlined'}
                      color={selected.treated ? 'success' : 'warning'}
                      label={selected.treated ? 'Traitée' : 'À traiter'}
                    />
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    {[
                      selected.garage?.name,
                      selected.vehicle?.immatriculation,
                      [selected.vehicle?.make, selected.vehicle?.model].filter(Boolean).join(' ')
                    ]
                      .filter(Boolean)
                      .join('  ·  ') || 'Aucune information véhicule'}
                  </Typography>
                </Stack>

                <IconButton size="small" onClick={() => setSelected(null)}>
                  <CloseCircle size={20} />
                </IconButton>
              </Stack>
            </Box>

            <DialogContent dividers sx={{ px: 3 }}>
              <Stack spacing={3}>
                {/* Identity */}
                <Grid container spacing={2.5}>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Field label="Référence partenaire" value={selected.externalReference} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Field label="Garage" value={selected.garage?.name} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Field label="Commercial" value={selected.commercial?.name} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Field label="Commande" value={selected.orderNo} />
                  </Grid>
                </Grid>

                <Divider textAlign="left">
                  <Stack direction="row" spacing={0.75} alignItems="center">
                    <Car size={14} />
                    <Typography variant="caption" color="text.secondary">
                      VÉHICULE
                    </Typography>
                  </Stack>
                </Divider>

                <Grid container spacing={2.5}>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Field label="Immatriculation" value={selected.vehicle?.immatriculation} />
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Field label="Marque" value={selected.vehicle?.make} />
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Field label="Modèle" value={selected.vehicle?.model} />
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Field label="N° de châssis (VIN)" value={selected.vehicle?.vin} />
                  </Grid>
                </Grid>

                {selected.notes && (
                  <>
                    <Divider textAlign="left">
                      <Typography variant="caption" color="text.secondary">
                        NOTES
                      </Typography>
                    </Divider>
                    {/* Read as a quote from the commercial, not an alert — this is what
                        they observed on site, so it carries attribution rather than a
                        warning colour. */}
                    <Stack
                      direction="row"
                      spacing={1.5}
                      sx={{
                        p: 2.5,
                        borderRadius: 2,
                        bgcolor: (t) => alpha(t.palette.text.primary, 0.03),
                        border: (t) => `1px solid ${t.palette.divider}`
                      }}
                    >
                      <Typography
                        aria-hidden
                        sx={{
                          fontFamily: 'Georgia, serif',
                          fontSize: 38,
                          lineHeight: 0.9,
                          color: 'text.disabled',
                          userSelect: 'none'
                        }}
                      >
                        &ldquo;
                      </Typography>
                      <Stack spacing={1} sx={{ pt: 0.5 }}>
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                          {selected.notes}
                        </Typography>
                        {selected.commercial?.name && (
                          <Typography variant="caption" color="text.secondary">
                            — {selected.commercial.name}
                            {selected.createdOnDevice ? `, ${formatDateTime(selected.createdOnDevice)}` : ''}
                          </Typography>
                        )}
                      </Stack>
                    </Stack>
                  </>
                )}

                <Divider textAlign="left">
                  <Typography variant="caption" color="text.secondary">
                    MÉDIAS
                  </Typography>
                </Divider>

                <MediaGallery media={selected.media || []} />
              </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
              <Box sx={{ flexGrow: 1 }} />
              <Button onClick={() => setSelected(null)} color="secondary">
                Fermer
              </Button>
              <Button
                variant="contained"
                color={selected.treated ? 'secondary' : 'success'}
                disabled={savingId === selected.id}
                startIcon={<TickCircle size={16} />}
                onClick={() => toggleTreated(selected)}
              >
                {selected.treated ? 'Rouvrir' : 'Marquer traitée'}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </MainCard>
  );
}
