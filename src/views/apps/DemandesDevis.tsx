'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

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
  Clock,
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

  const [rows, setRows] = useState<DemandeDevis[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<DemandeDevis | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  // Filters. `treated` is a tri-state: '' = all, 'false' = à traiter, 'true' = traitées.
  const [treated, setTreated] = useState<string>('false');
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

  const toggleTreated = async (row: DemandeDevis) => {
    setSavingId(row.id);
    try {
      const updated = await setDemandeTreated(row.id, !row.treated);
      setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, treated: updated.treated } : r)));
      if (selected?.id === row.id) setSelected({ ...selected, treated: updated.treated });
      // A row filtered out by the current view shouldn't linger after being handled.
      if (treated !== '') load();
    } catch {
      setError('La mise à jour du statut a échoué.');
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
                <TableCell align="center">Articles</TableCell>
                <TableCell align="center">Médias</TableCell>
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
                      <TableCell align="center">{row.items?.length || 0}</TableCell>
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

                <Divider textAlign="left">
                  <Stack direction="row" spacing={0.75} alignItems="center">
                    <Clock size={14} />
                    <Typography variant="caption" color="text.secondary">
                      HORODATAGE
                    </Typography>
                  </Stack>
                </Divider>

                <Grid container spacing={2.5}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Field label="Saisie sur le terrain" value={formatDateTime(selected.createdOnDevice)} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Field label="Reçue par Plexus" value={formatDateTime(selected.receivedAt)} />
                  </Grid>
                </Grid>

                {selected.notes && (
                  <>
                    <Divider textAlign="left">
                      <Typography variant="caption" color="text.secondary">
                        NOTES DU COMMERCIAL
                      </Typography>
                    </Divider>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: (t) => alpha(t.palette.warning.main, 0.06),
                        borderLeft: (t) => `3px solid ${t.palette.warning.main}`
                      }}
                    >
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {selected.notes}
                      </Typography>
                    </Box>
                  </>
                )}

                <Divider textAlign="left">
                  <Typography variant="caption" color="text.secondary">
                    ARTICLES DEMANDÉS
                  </Typography>
                </Divider>

                {selected.items?.length ? (
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Désignation</TableCell>
                        <TableCell align="center">Qté</TableCell>
                        <TableCell align="right">Ajouté</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selected.items.map((it, i) => (
                        <TableRow key={i}>
                          <TableCell>{it.description}</TableCell>
                          <TableCell align="center">{it.quantity ?? 1}</TableCell>
                          <TableCell align="right">{formatDateTime(it.addedAt)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Aucun article transmis avec cette demande.
                  </Typography>
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
