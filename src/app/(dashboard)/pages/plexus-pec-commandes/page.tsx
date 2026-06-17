'use client';

import { useState, useEffect, useCallback } from 'react';
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
  useTheme,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  TablePagination,
  Autocomplete
} from '@mui/material';
import Grid from '@mui/material/Grid';

// third-party
import { motion, AnimatePresence } from 'framer-motion';
import {
  Add,
  Trash,
  TickCircle,
  NoteAdd,
  Eye,
  ArrowRight,
  ClipboardText,
  InfoCircle
} from '@wandersonalwes/iconsax-react';

// project-imports
import MainCard from 'components/MainCard';
import useUser from 'hooks/useUser';
import { createPecRequest, fetchPecRequests, fetchPecRequestLines, createOrderFromPec } from 'app/api/services/PecService';
import { fetchVendors } from 'app/api/services/ReferenceService';

interface PecLineInput {
  id: string;
  reference: string;
  designation: string;
  quantity: number;
}

interface PecRequestHeader {
  number: string;
  vin: string;
  registrationNumber?: string;
  insuredName?: string;
  status: string | number;
  creationDateTime: string;
}

interface PecRequestLine {
  id: string;
  reference?: string;
  designation?: string;
  quantity: number;
  status: string | number;
  unitCost?: number;
  price?: number | string;
}

export default function PlexusPecCommandesPage() {
  const theme = useTheme();
  const user = useUser();
  const isPecClient = user && user.customerNo === 'C0090';

  // Form states
  const [vin, setVin] = useState('');
  const [registration, setRegistration] = useState('');
  const [insuredName, setInsuredName] = useState('');
  const [lines, setLines] = useState<PecLineInput[]>([
    { id: '1', reference: '', designation: '', quantity: 1 },
    { id: '2', reference: '', designation: '', quantity: 1 }
  ]);

  // List states
  const [requests, setRequests] = useState<PecRequestHeader[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loadingList, setLoadingList] = useState(true);

  // Dialog & Detail states
  const [selectedRequest, setSelectedRequest] = useState<PecRequestHeader | null>(null);
  const [detailLines, setDetailLines] = useState<PecRequestLine[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);

  // Vendor & creation states for PEC client C0090
  const [vendors, setVendors] = useState<any[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<string>('');
  const [creatingOrder, setCreatingOrder] = useState(false);

  // Fetch vendors list if logged in as C0090
  useEffect(() => {
    if (isPecClient) {
      fetchVendors()
        .then(res => {
          const list = res?.value || res || [];
          setVendors(list);
        })
        .catch(err => console.error('Error fetching vendors:', err));
    }
  }, [isPecClient]);

  // Feedback states
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Load requests on change page / rowsPerPage
  const loadRequests = useCallback(async () => {
    setLoadingList(true);
    try {
      const skip = page * rowsPerPage;
      const data = await fetchPecRequests(skip, rowsPerPage);
      setRequests(data.value || []);
      setTotalCount(data['@odata.count'] || (data.value ? data.value.length : 0));
    } catch (err) {
      console.error('Error fetching PEC requests:', err);
    } finally {
      setLoadingList(false);
    }
  }, [page, rowsPerPage]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  // Update specific field in lines grid
  const updateRow = useCallback((id: string, key: keyof PecLineInput, value: any) => {
    setLines(prev =>
      prev.map(row => {
        if (row.id === id) {
          if (key === 'quantity') {
            const qty = parseFloat(value) || 1;
            return { ...row, quantity: qty < 1 ? 1 : qty };
          }
          return { ...row, [key]: value };
        }
        return row;
      })
    );
  }, []);

  const addRow = useCallback(() => {
    setLines(prev => [
      ...prev,
      { id: Date.now().toString(), reference: '', designation: '', quantity: 1 }
    ]);
  }, []);

  const removeRow = useCallback((id: string) => {
    setLines(prev => (prev.length > 1 ? prev.filter(row => row.id !== id) : prev));
  }, []);

  // Submit form
  const handleSubmit = async () => {
    // Validate VIN
    const cleanVin = vin.trim();
    if (!cleanVin) {
      setError('Veuillez saisir le numéro de châssis (VIN).');
      return;
    }
    if (cleanVin.length !== 17) {
      setError('Le numéro de châssis (VIN) doit comporter exactement 17 caractères.');
      return;
    }
    if (!/^[a-zA-Z0-9]+$/.test(cleanVin)) {
      setError('Le numéro de châssis (VIN) ne doit contenir que des caractères alphanumériques.');
      return;
    }

    // Validate Lines
    const validLines = lines.filter(l => l.reference.trim() !== '' || l.designation.trim() !== '');
    if (validLines.length === 0) {
      setError('Veuillez remplir au moins un article avec une référence ou une désignation.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await createPecRequest({
        vin: cleanVin.toUpperCase(),
        registrationNumber: registration.trim() || undefined,
        insuredName: insuredName.trim() || undefined,
        lines: validLines.map(l => ({
          reference: l.reference.trim() || undefined,
          designation: l.designation.trim() || undefined,
          quantity: l.quantity
        }))
      });

      setSuccess(true);
      // Reset form
      setVin('');
      setRegistration('');
      setInsuredName('');
      setLines([
        { id: '1', reference: '', designation: '', quantity: 1 },
        { id: '2', reference: '', designation: '', quantity: 1 }
      ]);
      setPage(0);
      loadRequests();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error?.message || 'Erreur lors de la soumission de la demande PEC.');
    } finally {
      setSubmitting(false);
    }
  };

  // Open detail drawer/modal
  const handleOpenDetails = async (req: PecRequestHeader) => {
    setSelectedRequest(req);
    setOpenDetails(true);
    setLoadingDetails(true);
    setDetailLines([]);
    try {
      const data = await fetchPecRequestLines(req.number);
      const lines = (data.value || []).map((l: any) => ({
        ...l,
        price: l.unitCost !== undefined ? l.unitCost : 0.0
      }));
      setDetailLines(lines);
    } catch (err) {
      console.error('Error fetching PEC lines:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCloseDetails = () => {
    setOpenDetails(false);
    setSelectedRequest(null);
    setSelectedVendor('');
  };

  const handleUpdateDetailLineReference = (id: string, newRef: string) => {
    setDetailLines(prev =>
      prev.map(line => (line.id === id ? { ...line, reference: newRef } : line))
    );
  };

  const handleUpdateDetailLinePrice = (id: string, newPrice: string) => {
    setDetailLines(prev =>
      prev.map(line => (line.id === id ? { ...line, price: newPrice === '' ? '' : (isNaN(parseFloat(newPrice)) ? line.price : parseFloat(newPrice)) } : line))
    );
  };

  const handleCreateOrder = async () => {
    if (!selectedRequest || !selectedVendor) return;

    const missingRefs = detailLines.some(l => !l.reference || l.reference.trim() === '');
    if (missingRefs) {
      setError('Veuillez remplir toutes les références d\'articles avant de créer la commande.');
      return;
    }

    setCreatingOrder(true);
    setError(null);
    try {
      const payload = {
        vendorNumber: selectedVendor,
        lines: detailLines.map(l => ({
          id: l.id,
          reference: l.reference!.trim(),
          designation: l.designation || '',
          quantity: l.quantity,
          price: typeof l.price === 'number' ? l.price : (parseFloat(String(l.price)) || 0.0)
        }))
      };

      await createOrderFromPec(selectedRequest.number, payload);
      setSuccess(true);
      handleCloseDetails();
      loadRequests();
    } catch (err: any) {
      console.error('Error creating order from PEC:', err);
      setError(err.response?.data?.error?.message || err.message || 'Erreur lors de la création de la commande.');
    } finally {
      setCreatingOrder(false);
    }
  };

  // Status Chip helper
  const getStatusLabelAndColor = (statusVal: string | number) => {
    const status = statusVal?.toString().toLowerCase().replace(/_/g, ' ').trim();
    if (status === 'commandé' || status === 'commande' || status === '1') {
      return { label: 'Commandé', color: 'info' as const };
    }
    if (status === 'en cours de livraison' || status === '2') {
      return { label: 'En cours de livraison', color: 'secondary' as const };
    }
    if (status === 'en cours de réception' || status === 'en cours de reception' || status === '3') {
      return { label: 'En cours de réception', color: 'primary' as const };
    }
    if (status === 'réceptionné' || status === 'receptionne' || status === '4') {
      return { label: 'Réceptionné', color: 'success' as const };
    }
    if (status === 'annulé' || status === 'annule' || status === '5') {
      return { label: 'Annulé', color: 'error' as const };
    }
    return { label: 'En cours', color: 'warning' as const };
  };

  const getStatusChip = (statusVal: string | number) => {
    const info = getStatusLabelAndColor(statusVal);
    return <Chip label={info.label} color={info.color} size="small" variant="filled" sx={{ fontWeight: 700 }} />;
  };

  return (
    <Stack spacing={4} sx={{ width: '100%' }}>
      {/* HEADER BAR */}
      <MainCard sx={{ borderRadius: 3, boxShadow: theme.customShadows.z1 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}>
            <ClipboardText variant="Bold" size={32} />
          </Box>
          <Box>
            <Typography variant="h3" fontWeight={900}>Plexus Pec Commandes</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
              {isPecClient
                ? "CONSULTER ET TRAITER LES DEMANDES PEC DES CLIENTS"
                : "CRÉER UN DOSSIER DE DEMANDE HORS CATALOGUE • PLEXUS AUTOMATIVE"}
            </Typography>
          </Box>
        </Stack>
      </MainCard>

      {/* FORM AND ARTICLE GRID */}
      {!isPecClient && (
        <MainCard sx={{ borderRadius: 3, boxShadow: theme.customShadows.z1 }}>
          <Typography variant="h4" fontWeight={800} sx={{ mb: 3 }}>
            1. Détails du Véhicule & Assuré
          </Typography>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="N° Châssis (VIN) *"
                placeholder="Ex: 17 caractères..."
                value={vin}
                onChange={(e) => setVin(e.target.value)}
                inputProps={{ maxLength: 17 }}
                helperText="Exactement 17 caractères alphanumériques."
                variant="outlined"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="N° Immatriculation"
                placeholder="Ex: 123 TUN 4567..."
                value={registration}
                onChange={(e) => setRegistration(e.target.value)}
                variant="outlined"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Nom de l'Assuré"
                placeholder="Nom et Prénom..."
                value={insuredName}
                onChange={(e) => setInsuredName(e.target.value)}
                variant="outlined"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
          </Grid>

          <Typography variant="h4" fontWeight={800} sx={{ mb: 2 }}>
            2. Liste des Articles demandés
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2, fontWeight: 600 }}>
            Remplir la référence, la désignation, ou les deux. Une quantité valide est obligatoire.
          </Typography>

          <TableContainer sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2, overflow: 'hidden', mb: 3 }}>
            <Table size="medium">
              <TableHead>
                <TableRow sx={{ bgcolor: alpha(theme.palette.grey[50], 0.8) }}>
                  <TableCell sx={{ fontWeight: '900', py: 2 }}>Référence</TableCell>
                  <TableCell sx={{ fontWeight: '900', py: 2 }}>Désignation</TableCell>
                  <TableCell sx={{ fontWeight: '900', py: 2, width: 120 }}>Quantité</TableCell>
                  <TableCell align="center" sx={{ width: 80 }}></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <AnimatePresence mode="popLayout">
                  {lines.map((row) => (
                    <TableRow
                      key={row.id}
                      component={motion.tr}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      sx={{ '&:hover': { bgcolor: alpha(theme.palette.primary.lighter, 0.05) } }}
                    >
                      <TableCell sx={{ py: 1.5 }}>
                        <TextField
                          fullWidth
                          size="small"
                          placeholder="Réf article (optionnel)..."
                          value={row.reference}
                          onChange={(e) => updateRow(row.id, 'reference', e.target.value)}
                          InputProps={{ sx: { borderRadius: 1.5, fontWeight: 700 } }}
                        />
                      </TableCell>
                      <TableCell sx={{ py: 1.5 }}>
                        <TextField
                          fullWidth
                          size="small"
                          placeholder="Description de la pièce..."
                          value={row.designation}
                          onChange={(e) => updateRow(row.id, 'designation', e.target.value)}
                          InputProps={{ sx: { borderRadius: 1.5, fontWeight: 700 } }}
                        />
                      </TableCell>
                      <TableCell sx={{ py: 1.5 }}>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          placeholder="Qty"
                          value={row.quantity}
                          onChange={(e) => updateRow(row.id, 'quantity', e.target.value)}
                          InputProps={{ inputProps: { min: 1 }, sx: { borderRadius: 1.5, fontWeight: 700 } }}
                        />
                      </TableCell>
                      <TableCell align="center" sx={{ py: 1.5 }}>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => removeRow(row.id)}
                          sx={{ bgcolor: alpha(theme.palette.error.main, 0.05) }}
                        >
                          <Trash size={18} variant="Bold" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          </TableContainer>

          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<Add />}
              onClick={addRow}
              sx={{ borderRadius: 2, fontWeight: 800, px: 3 }}
            >
              AJOUTER UNE LIGNE
            </Button>

            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleSubmit}
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <TickCircle variant="Bold" />}
              sx={{
                borderRadius: 2.5,
                px: 6,
                py: 1.5,
                fontWeight: 900,
                boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.2)}`
              }}
            >
              {submitting ? 'ENVOI EN COURS...' : 'ENVOYER LA DEMANDE'}
            </Button>
          </Stack>
        </MainCard>
      )}

      {/* PAST REQUESTS LIST */}
      <MainCard 
        title={isPecClient ? "Liste de toutes les Demandes PEC" : "Historique de vos Demandes PEC"}
        sx={{ borderRadius: 3, boxShadow: theme.customShadows.z1 }}
      >
        <TableContainer sx={{ borderRadius: 2, border: `1px solid ${theme.palette.divider}`, overflow: 'hidden' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: alpha(theme.palette.grey[50], 0.8) }}>
                <TableCell sx={{ fontWeight: '900' }}>N° Dossier</TableCell>
                {isPecClient && <TableCell sx={{ fontWeight: '900' }}>Client</TableCell>}
                <TableCell sx={{ fontWeight: '900' }}>VIN / Châssis</TableCell>
                <TableCell sx={{ fontWeight: '900' }}>Immatriculation</TableCell>
                <TableCell sx={{ fontWeight: '900' }}>Nom Assuré</TableCell>
                <TableCell sx={{ fontWeight: '900' }}>Date Demande</TableCell>
                <TableCell sx={{ fontWeight: '900' }}>Statut</TableCell>
                <TableCell align="center" sx={{ fontWeight: '900', width: 120 }}>Détails</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loadingList ? (
                <TableRow>
                  <TableCell colSpan={isPecClient ? 8 : 7} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={32} />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontWeight: 600 }}>
                      Chargement de l'historique...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isPecClient ? 8 : 7} align="center" sx={{ py: 6 }}>
                    <InfoCircle size={40} color={theme.palette.text.secondary} />
                    <Typography variant="body1" color="text.secondary" sx={{ mt: 1, fontWeight: 700 }}>
                      Aucune demande PEC enregistrée pour le moment.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((req) => (
                  <TableRow key={req.number} sx={{ '&:hover': { bgcolor: alpha(theme.palette.grey[100], 0.3) } }}>
                    <TableCell sx={{ fontWeight: 800 }}>{req.number}</TableCell>
                    {isPecClient && (
                      <TableCell sx={{ fontWeight: 700 }}>
                        {(req as any).customerName || (req as any).customerNo || '-'}
                      </TableCell>
                    )}
                    <TableCell sx={{ fontWeight: 700, fontFamily: 'monospace' }}>{req.vin}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{req.registrationNumber || '-'}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{req.insuredName || '-'}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {req.creationDateTime ? new Date(req.creationDateTime).toLocaleString('fr-FR') : '-'}
                    </TableCell>
                    <TableCell>{getStatusChip(req.status)}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenDetails(req)}
                        sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}
                      >
                        <Eye size={18} variant="Bold" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={totalCount}
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
      <Dialog open={openDetails} onClose={handleCloseDetails} maxWidth="md" fullWidth sx={{ '& .MuiPaper-root': { borderRadius: 3 } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <ClipboardText size={24} variant="Bold" color={theme.palette.primary.main} />
            <Typography variant="h4" fontWeight={900}>
              Articles du Dossier {selectedRequest?.number}
            </Typography>
          </Stack>
          <Box>{selectedRequest && getStatusChip(selectedRequest.status)}</Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 2, p: 3 }}>
          {/* Purchase Order Association */}
          {selectedRequest?.purchaseOrderNo && (
            <Box sx={{ mb: 3, p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.success.main, 0.08), border: `1px solid ${alpha(theme.palette.success.main, 0.15)}` }}>
              <Typography variant="h5" fontWeight={800} color="success.main">
                Commande BC Associée
              </Typography>
              <Typography variant="body1" fontWeight={700} sx={{ mt: 0.5 }}>
                N° Commande Achat: <span style={{ fontFamily: 'monospace', textDecoration: 'underline' }}>{selectedRequest.purchaseOrderNo}</span>
              </Typography>
            </Box>
          )}

          {/* Vendor selection for PEC Operator client C0090 when status is En cours */}
          {isPecClient && selectedRequest && (selectedRequest.status?.toString() === '0' || selectedRequest.status?.toString().toLowerCase() === 'en cours') && (
            <Box sx={{ mb: 3, p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.04), border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}` }}>
              <Typography variant="h5" fontWeight={800} color="primary.main" sx={{ mb: 1.5 }}>
                Sélection du Fournisseur *
              </Typography>
              <Autocomplete
                fullWidth
                options={vendors}
                getOptionLabel={(option) => `${option.displayName || option.name || option.number} (${option.number})`}
                value={vendors.find((v) => v.number === selectedVendor) || null}
                onChange={(_, newValue) => {
                  setSelectedVendor(newValue ? newValue.number : '');
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Fournisseur *"
                    placeholder="Rechercher ou sélectionner un Fournisseur..."
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                  />
                )}
                sx={{
                  '& .MuiOutlinedInput-root': { borderRadius: 2 },
                  '& .MuiAutocomplete-input': { fontWeight: 700 }
                }}
              />
            </Box>
          )}

          {loadingDetails ? (
            <Stack alignItems="center" sx={{ py: 6 }}>
              <CircularProgress size={32} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Chargement des articles...
              </Typography>
            </Stack>
          ) : (
            <TableContainer sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
              <Table size="medium">
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha(theme.palette.grey[50], 0.8) }}>
                    <TableCell sx={{ fontWeight: '900' }}>Référence</TableCell>
                    <TableCell sx={{ fontWeight: '900' }}>Désignation</TableCell>
                    <TableCell sx={{ fontWeight: '900', width: 120 }}>Prix</TableCell>
                    <TableCell sx={{ fontWeight: '900', width: 100 }}>Quantité</TableCell>
                    <TableCell sx={{ fontWeight: '900', width: 140 }}>Statut Pièce</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {detailLines.map((line, idx) => {
                    const canEdit = isPecClient && selectedRequest && (selectedRequest.status?.toString() === '0' || selectedRequest.status?.toString().toLowerCase() === 'en cours');
                    return (
                      <TableRow key={idx} sx={{ '&:hover': { bgcolor: alpha(theme.palette.grey[100], 0.3) } }}>
                        <TableCell sx={{ py: canEdit ? 1 : 1.5 }}>
                          {canEdit ? (
                            <TextField
                              size="small"
                              fullWidth
                              placeholder="Saisir la Référence article *"
                              value={line.reference || ''}
                              onChange={(e) => handleUpdateDetailLineReference(line.id, e.target.value)}
                              InputProps={{ sx: { borderRadius: 1.5, fontWeight: 700, fontFamily: 'monospace' } }}
                            />
                          ) : (
                            <Typography fontWeight={700} sx={{ fontFamily: 'monospace' }}>
                              {line.reference || '-'}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>{line.designation || '-'}</TableCell>
                        <TableCell sx={{ py: canEdit ? 1 : 1.5 }}>
                          {canEdit ? (
                            <TextField
                              size="small"
                              fullWidth
                              type="number"
                              placeholder="Prix"
                              value={line.price === '' ? '' : (line.price ?? '')}
                              onChange={(e) => handleUpdateDetailLinePrice(line.id, e.target.value)}
                              InputProps={{ inputProps: { min: 0, step: 'any' }, sx: { borderRadius: 1.5, fontWeight: 700 } }}
                            />
                          ) : (
                            <Typography fontWeight={800}>
                              {line.price !== undefined && line.price !== '' ? Number(line.price).toFixed(3) : '-'}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>{line.quantity}</TableCell>
                        <TableCell>{getStatusChip(line.status)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: `1px solid ${theme.palette.divider}`, justifyContent: 'space-between' }}>
          <Button onClick={handleCloseDetails} color="secondary" variant="contained" sx={{ borderRadius: 2, fontWeight: 800, px: 3 }}>
            Fermer
          </Button>
          {isPecClient && selectedRequest && (selectedRequest.status?.toString() === '0' || selectedRequest.status?.toString().toLowerCase() === 'en cours') && (
            <Button
              onClick={handleCreateOrder}
              color="primary"
              variant="contained"
              disabled={creatingOrder || !selectedVendor || detailLines.some(l => !l.reference?.trim())}
              startIcon={creatingOrder ? <CircularProgress size={20} color="inherit" /> : <TickCircle variant="Bold" />}
              sx={{ borderRadius: 2, fontWeight: 900, px: 3 }}
            >
              {creatingOrder ? 'CRÉATION...' : 'CRÉER LA COMMANDE'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* FEEDBACK SNACKBARS */}
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="error" variant="filled" onClose={() => setError(null)} sx={{ borderRadius: 2, fontWeight: 700 }}>{error}</Alert>
      </Snackbar>
      <Snackbar open={success} autoHideDuration={6000} onClose={() => setSuccess(false)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="success" variant="filled" onClose={() => setSuccess(false)} sx={{ borderRadius: 2, fontWeight: 700, bgcolor: 'success.main' }}>
          Dossier PEC envoyé et enregistré avec succès !
        </Alert>
      </Snackbar>
    </Stack>
  );
}
