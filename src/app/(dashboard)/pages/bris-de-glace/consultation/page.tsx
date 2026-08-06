'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Stack,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  CircularProgress,
  Alert,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  useTheme,
  alpha,
  InputAdornment
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { DocumentFilter, Eye, DocumentDownload, DocumentUpload, SearchNormal1, InfoCircle, TickCircle } from '@wandersonalwes/iconsax-react';

// project-imports
import MainCard from 'components/MainCard';
import useUser from 'hooks/useUser';
import CarDamageSelector, { parseZoneLabels } from 'components/bris-de-glace/CarDamageSelector';
import { fetchBrisDossiers, downloadBrisFile, uploadBrisFile, treatBrisDossier, BrisDossier } from 'app/api/services/BrisDeGlaceService';

export default function BrisDeGlaceConsultationPage() {
  const theme = useTheme();
  const user = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const highlightNumber = searchParams ? searchParams.get('number') : null;

  const canAccess = user && (user.isBriseDeGlace || user.customerNo === 'C0090');
  const seesAll = !!(user && user.customerNo === 'C0090');

  const [dossiers, setDossiers] = useState<BrisDossier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [selected, setSelected] = useState<BrisDossier | null>(null);
  const [openDetails, setOpenDetails] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [treatingId, setTreatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadTargetId = useRef<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchBrisDossiers();
      setDossiers(data);
    } catch (err: any) {
      setError(typeof err === 'string' ? err : err?.error || err?.message || 'Erreur de chargement des dossiers.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (canAccess) load();
  }, [canAccess, load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return dossiers;
    return dossiers.filter((d) =>
      [d.brisDossierNo, d.number, d.registrationNumber, d.vin, d.insuranceName, d.vehicleMakeModel, d.createdBy]
        .filter(Boolean)
        .some((v) => v.toLowerCase().includes(q))
    );
  }, [dossiers, search]);

  const paged = useMemo(
    () => filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filtered, page, rowsPerPage]
  );

  // When opened from the notification, jump to the page holding the target dossier.
  useEffect(() => {
    if (!highlightNumber || dossiers.length === 0) return;
    const idx = filtered.findIndex((d) => d.number === highlightNumber);
    if (idx >= 0) setPage(Math.floor(idx / rowsPerPage));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlightNumber, dossiers]);

  const handleViewPdf = async (d: BrisDossier) => {
    if (!d.insuranceFile) {
      setError('Aucun fichier PDF associé à ce dossier.');
      return;
    }
    setDownloadingId(d.id);
    try {
      const blob = await downloadBrisFile(d.id);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      // Give the browser time to open before revoking
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (err: any) {
      setError('Impossible d\'ouvrir le PDF de ce dossier.');
    } finally {
      setDownloadingId(null);
    }
  };

  const openDetail = (d: BrisDossier) => {
    setSelected(d);
    setOpenDetails(true);
  };

  const handleTreat = async (d: BrisDossier) => {
    setTreatingId(d.id);
    try {
      await treatBrisDossier(d.id, true);
      setSuccess(`Dossier ${d.brisDossierNo || d.number} marqué comme traité.`);
      await load();
    } catch (err: any) {
      setError(typeof err === 'string' ? err : err?.error || err?.message || 'Échec du traitement du dossier.');
    } finally {
      setTreatingId(null);
    }
  };

  const handlePickFile = (d: BrisDossier) => {
    uploadTargetId.current = d.id;
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const id = uploadTargetId.current;
    if (!file || !id) return;
    setUploadingId(id);
    try {
      await uploadBrisFile(id, file);
      setSuccess('PDF enregistré avec succès.');
      await load();
    } catch (err: any) {
      setError(typeof err === 'string' ? err : err?.error || err?.message || "Échec de l'envoi du PDF.");
    } finally {
      setUploadingId(null);
      uploadTargetId.current = null;
    }
  };

  const colCount = seesAll ? 9 : 7;

  if (user && !canAccess) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ minHeight: '60vh', p: 3 }}>
        <MainCard sx={{ maxWidth: 500, p: 4, textAlign: 'center', borderRadius: 4, boxShadow: theme.customShadows.z1 }}>
          <Box sx={{ display: 'inline-flex', p: 2, borderRadius: '50%', bgcolor: alpha(theme.palette.error.main, 0.1), color: 'error.main', mb: 3 }}>
            <InfoCircle size={48} variant="Bold" />
          </Box>
          <Typography variant="h3" fontWeight={900} gutterBottom>
            Accès Non Autorisé
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 4, fontWeight: 500 }}>
            Votre compte n&apos;est pas autorisé à consulter les dossiers bris de glace.
          </Typography>
          <Button variant="contained" onClick={() => router.push('/')} sx={{ borderRadius: 2, px: 4, py: 1.2, fontWeight: 700 }}>
            Retour
          </Button>
        </MainCard>
      </Stack>
    );
  }

  return (
    <Stack spacing={4} sx={{ width: '100%' }}>
      {/* HEADER */}
      <MainCard sx={{ borderRadius: 3, boxShadow: theme.customShadows.z1 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} justifyContent="space-between">
          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}>
              <DocumentFilter variant="Bold" size={32} />
            </Box>
            <Box>
              <Typography variant="h3" fontWeight={900}>Dossiers bris de glace</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                {seesAll ? 'TOUS LES DOSSIERS REÇUS • PLEXUS AUTOMATIVE' : 'HISTORIQUE DE VOS DOSSIERS'}
              </Typography>
            </Box>
          </Stack>
          <TextField
            size="small"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchNormal1 size={18} />
                </InputAdornment>
              )
            }}
            sx={{ minWidth: 240, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
        </Stack>
      </MainCard>

      {/* TABLE */}
      <MainCard sx={{ borderRadius: 3, boxShadow: theme.customShadows.z1 }}>
        <TableContainer sx={{ borderRadius: 2, border: `1px solid ${theme.palette.divider}`, overflowX: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: alpha(theme.palette.grey[50], 0.8) }}>
                <TableCell sx={{ fontWeight: 900 }}>N° dossier</TableCell>
                <TableCell sx={{ fontWeight: 900 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 900 }}>Immatriculation</TableCell>
                <TableCell sx={{ fontWeight: 900 }}>Assureur</TableCell>
                <TableCell sx={{ fontWeight: 900 }}>Véhicule</TableCell>
                <TableCell sx={{ fontWeight: 900 }}>Zones</TableCell>
                {seesAll && <TableCell sx={{ fontWeight: 900 }}>Créé par</TableCell>}
                {seesAll && <TableCell sx={{ fontWeight: 900 }}>Statut</TableCell>}
                <TableCell align="center" sx={{ fontWeight: 900, width: 200 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={colCount} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={32} />
                  </TableCell>
                </TableRow>
              ) : paged.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={colCount} align="center" sx={{ py: 6 }}>
                    <InfoCircle size={40} color={theme.palette.text.secondary} />
                    <Typography variant="body1" color="text.secondary" sx={{ mt: 1, fontWeight: 700 }}>
                      Aucun dossier bris de glace.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paged.map((d) => {
                  const zoneLabels = parseZoneLabels(d.damageZones);
                  const isHighlighted = !!highlightNumber && d.number === highlightNumber;
                  return (
                    <TableRow
                      key={d.id}
                      sx={{
                        '&:hover': { bgcolor: isHighlighted ? alpha(theme.palette.primary.main, 0.14) : alpha(theme.palette.grey[100], 0.3) },
                        ...(isHighlighted && {
                          bgcolor: alpha(theme.palette.primary.main, 0.09),
                          borderLeft: `4px solid ${theme.palette.primary.main}`
                        })
                      }}
                    >
                      <TableCell sx={{ fontWeight: 800 }}>{d.brisDossierNo || '-'}</TableCell>
                      <TableCell>{d.creationDate ? new Date(d.creationDate).toLocaleDateString('fr-FR') : '-'}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{d.registrationNumber || '-'}</TableCell>
                      <TableCell>{d.insuranceName || '-'}</TableCell>
                      <TableCell>{d.vehicleMakeModel || '-'}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                          {zoneLabels.length ? (
                            zoneLabels.map((z) => <Chip key={z} label={z} size="small" sx={{ fontWeight: 600, mb: 0.5 }} />)
                          ) : (
                            <span>-</span>
                          )}
                        </Stack>
                      </TableCell>
                      {seesAll && <TableCell sx={{ fontWeight: 600 }}>{d.createdBy || '-'}</TableCell>}
                      {seesAll && (
                        <TableCell>
                          <Chip
                            label={d.treated ? 'Traité' : 'Nouveau'}
                            color={d.treated ? 'success' : 'warning'}
                            size="small"
                            variant="filled"
                            sx={{ fontWeight: 700 }}
                          />
                        </TableCell>
                      )}
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          {seesAll && !d.treated && (
                            <IconButton
                              color="success"
                              onClick={() => handleTreat(d)}
                              disabled={treatingId === d.id}
                              title="Marquer comme traité"
                              sx={{ bgcolor: alpha(theme.palette.success.main, 0.1) }}
                            >
                              {treatingId === d.id ? <CircularProgress size={16} /> : <TickCircle size={18} variant="Bold" />}
                            </IconButton>
                          )}
                          <IconButton
                            color="primary"
                            onClick={() => handleViewPdf(d)}
                            disabled={!d.insuranceFile || downloadingId === d.id}
                            title="Voir le PDF"
                            sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}
                          >
                            {downloadingId === d.id ? <CircularProgress size={16} /> : <DocumentDownload size={18} variant="Bold" />}
                          </IconButton>
                          <IconButton
                            color={d.insuranceFile ? 'secondary' : 'success'}
                            onClick={() => handlePickFile(d)}
                            disabled={uploadingId === d.id}
                            title={d.insuranceFile ? 'Remplacer le PDF' : 'Ajouter un PDF'}
                            sx={{ bgcolor: alpha(d.insuranceFile ? theme.palette.secondary.main : theme.palette.success.main, 0.08) }}
                          >
                            {uploadingId === d.id ? <CircularProgress size={16} /> : <DocumentUpload size={18} variant="Bold" />}
                          </IconButton>
                          <IconButton
                            color="secondary"
                            onClick={() => openDetail(d)}
                            title="Détails"
                            sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.05) }}
                          >
                            <Eye size={18} variant="Bold" />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filtered.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="Lignes par page:"
          sx={{ mt: 1 }}
        />
      </MainCard>

      {/* DETAIL DIALOG */}
      <Dialog open={openDetails} onClose={() => setOpenDetails(false)} maxWidth="md" fullWidth sx={{ '& .MuiPaper-root': { borderRadius: 3 } }}>
        <DialogTitle sx={{ pb: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="h4" fontWeight={900}>
            Dossier {selected?.brisDossierNo || selected?.number}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ mt: 2, p: 3 }}>
          {selected && (
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 7 }}>
                <Stack spacing={1.5}>
                  <DetailRow label="N° dossier" value={selected.brisDossierNo} />
                  <DetailRow label="N° dossier BC" value={selected.number} mono />
                  <DetailRow label="Date" value={selected.creationDate ? new Date(selected.creationDate).toLocaleDateString('fr-FR') : ''} />
                  <DetailRow label="Immatriculation" value={selected.registrationNumber} />
                  <DetailRow label="Assureur" value={selected.insuranceName} />
                  <DetailRow label="Véhicule" value={selected.vehicleMakeModel} />
                  <DetailRow label="VIN" value={selected.vin} mono />
                  {seesAll && <DetailRow label="Créé par" value={selected.createdBy} />}
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, md: 5 }}>
                <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1 }}>
                  Zones endommagées
                </Typography>
                <CarDamageSelector value={selected.damageZones ? selected.damageZones.split(',').map((z) => z.trim()).filter(Boolean) : []} readOnly />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: `1px solid ${theme.palette.divider}`, justifyContent: 'space-between' }}>
          <Button onClick={() => setOpenDetails(false)} color="secondary" variant="contained" sx={{ borderRadius: 2, fontWeight: 800, px: 3 }}>
            Fermer
          </Button>
          {selected?.insuranceFile && (
            <Button
              onClick={() => selected && handleViewPdf(selected)}
              color="primary"
              variant="contained"
              startIcon={<DocumentDownload size={18} variant="Bold" />}
              sx={{ borderRadius: 2, fontWeight: 900, px: 3 }}
            >
              VOIR LE PDF
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Hidden input shared by all rows' upload buttons */}
      <input ref={fileInputRef} type="file" accept="application/pdf" hidden onChange={handleFileSelected} />

      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="error" variant="filled" onClose={() => setError(null)} sx={{ borderRadius: 2, fontWeight: 700 }}>
          {error}
        </Alert>
      </Snackbar>
      <Snackbar open={!!success} autoHideDuration={5000} onClose={() => setSuccess(null)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="success" variant="filled" onClose={() => setSuccess(null)} sx={{ borderRadius: 2, fontWeight: 700 }}>
          {success}
        </Alert>
      </Snackbar>
    </Stack>
  );
}

function DetailRow({ label, value, mono }: { label: string; value?: string; mono?: boolean }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
        {label}
      </Typography>
      <Typography variant="body1" fontWeight={700} sx={{ fontFamily: mono ? 'monospace' : 'inherit' }}>
        {value || '-'}
      </Typography>
      <Divider sx={{ mt: 1 }} />
    </Box>
  );
}
