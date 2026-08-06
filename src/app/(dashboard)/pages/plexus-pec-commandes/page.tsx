'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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
  Autocomplete,
  Checkbox
} from '@mui/material';
import Grid from '@mui/material/Grid';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

// third-party
import { motion, AnimatePresence } from 'framer-motion';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { fr } from 'date-fns/locale/fr';
import { format, isValid, parseISO, startOfDay } from 'date-fns';
import {
  Add,
  Trash,
  TickCircle,
  NoteAdd,
  Eye,
  ArrowRight,
  ClipboardText,
  InfoCircle,
  Refresh2,
  SearchNormal1
} from '@wandersonalwes/iconsax-react';

// project-imports
import MainCard from 'components/MainCard';
import useUser from 'hooks/useUser';
import {
  createPecRequest,
  fetchPecRequests,
  fetchPecRequestLines,
  createOrderFromPec,
  createDevisFromPec,
  fetchOrdersForPecSync,
  fetchOrderLinesForPecSync,
  PecSyncOrder
} from 'app/api/services/PecService';
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
  expectedDeliveryDate?: string;
}

// Statut de ligne "Livraison prévue" : pièce annoncée disponible à une date future
const isLivraisonPrevue = (statusVal?: string | number) => {
  const s = statusVal?.toString().toLowerCase().trim();
  return s === 'livraisonprevudate' || s === 'livprevuadate' || s === 'livraison prévue';
};

// BC renvoie une date vide sous la forme "0001-01-01"
const normalizeDate = (value?: string | null) => {
  if (!value) return '';
  const day = value.toString().substring(0, 10);
  return day === '0001-01-01' ? '' : day;
};

export default function PlexusPecCommandesPage() {
  const theme = useTheme();
  const user = useUser();
  const router = useRouter();
  const isPecClient = user && user.customerNo === 'C0090';
  const canAccess = isPecClient || (user && user.isPec);

  const searchParams = useSearchParams();
  const highlightNumber = searchParams ? searchParams.get('number') : null;
  const [autoOpened, setAutoOpened] = useState(false);

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
            Votre compte client n'est pas configuré pour accéder au module de commandes prise en charge (PEC). Veuillez contacter le support technique Plexus.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => router.push('/')}
            sx={{ borderRadius: 2, px: 4, py: 1.2, fontWeight: 700 }}
          >
            Retour au Tableau de Bord
          </Button>
        </MainCard>
      </Stack>
    );
  }

  // Form states
  const [vin, setVin] = useState('');
  const [registration, setRegistration] = useState('');
  const [insuredName, setInsuredName] = useState('');
  const [insuredRealName, setInsuredRealName] = useState('');
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
  const [vendorError, setVendorError] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [checkedLineIds, setCheckedLineIds] = useState<string[]>([]);

  // Synchronisation des prix depuis une commande d'achat existante (opérateur PEC)
  const [syncOpen, setSyncOpen] = useState(false);
  const [syncSearch, setSyncSearch] = useState('');
  const [syncOrders, setSyncOrders] = useState<PecSyncOrder[]>([]);
  const [loadingSyncOrders, setLoadingSyncOrders] = useState(false);
  const [syncingOrderNumber, setSyncingOrderNumber] = useState<string | null>(null);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

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

  useEffect(() => {
    if (highlightNumber && requests.length > 0 && !autoOpened) {
      const matched = requests.find(r => r.number === highlightNumber);
      if (matched) {
        handleOpenDetails(matched);
        setAutoOpened(true);
      }
    }
  }, [highlightNumber, requests, autoOpened]);

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
    // Validate PEC Number (insuredName) - Mandatory
    const cleanInsuredName = insuredName.trim();
    if (!cleanInsuredName) {
      setError('Veuillez saisir le numéro de PEC.');
      return;
    }

    const cleanInsuredRealName = insuredRealName.trim();
    const finalInsuredName = cleanInsuredRealName
      ? `${cleanInsuredName} / ${cleanInsuredRealName}`
      : cleanInsuredName;

    // Validate VIN - Optional
    const cleanVin = vin.trim();
    if (cleanVin) {
      if (cleanVin.length !== 17) {
        setError('Le numéro de châssis (VIN) doit comporter exactement 17 caractères.');
        return;
      }
      if (!/^[a-zA-Z0-9]+$/.test(cleanVin)) {
        setError('Le numéro de châssis (VIN) ne doit contenir que des caractères alphanumériques.');
        return;
      }
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
        insuredName: finalInsuredName,
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
      setInsuredRealName('');
      setLines([
        { id: '1', reference: '', designation: '', quantity: 1 },
        { id: '2', reference: '', designation: '', quantity: 1 }
      ]);
      setPage(0);
      loadRequests();
    } catch (err: any) {
      console.error(err);
      let errMsg = 'Erreur lors de la soumission de la demande PEC.';
      if (typeof err === 'string') {
        errMsg = err;
      } else if (err && typeof err === 'object') {
        errMsg = err.response?.data?.error?.message || err.message || errMsg;
      }
      setError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Open detail drawer/modal
  const handleOpenDetails = async (req: PecRequestHeader) => {
    setSelectedRequest(req);
    if (req.insuredName && req.insuredName.includes('|')) {
      setSelectedVendor(req.insuredName.split('|')[1]);
    } else {
      setSelectedVendor('');
    }
    setOpenDetails(true);
    setLoadingDetails(true);
    setDetailLines([]);
    setCheckedLineIds([]);
    try {
      const data = await fetchPecRequestLines(req.number);
      const lines = (data.value || []).map((l: any) => ({
        ...l,
        price: l.unitCost !== undefined && l.unitCost !== null ? l.unitCost : 0.0,
        expectedDeliveryDate: normalizeDate(l.expectedDeliveryDate)
      }));
      setDetailLines(lines);
      const activeLineIds = lines
        .filter((l: any) =>
          l.status?.toString().toLowerCase() !== 'commandé' &&
          l.status?.toString() !== '3' &&
          l.status?.toString().toLowerCase() !== 'non disponible' &&
          l.status?.toString() !== '2'
        )
        .map((l: any) => l.id);
      setCheckedLineIds(activeLineIds);
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
    setVendorError(false);
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

  const handleUpdateDetailLineStatus = (id: string, newStatus: string) => {
    setDetailLines(prev =>
      prev.map(line =>
        line.id === id
          ? {
              ...line,
              status: newStatus,
              // la date de livraison prévue n'a de sens que pour ce statut
              expectedDeliveryDate: isLivraisonPrevue(newStatus) ? line.expectedDeliveryDate : ''
            }
          : line
      )
    );
  };

  // Charge les commandes proposées dans le dialogue de synchronisation (recherche par n° commande)
  useEffect(() => {
    if (!syncOpen) return;
    let cancelled = false;
    setLoadingSyncOrders(true);
    const timer = setTimeout(() => {
      fetchOrdersForPecSync(syncSearch)
        .then(orders => {
          if (!cancelled) setSyncOrders(orders);
        })
        .catch(err => {
          console.error('Error fetching orders for PEC sync:', err);
          if (!cancelled) setSyncOrders([]);
        })
        .finally(() => {
          if (!cancelled) setLoadingSyncOrders(false);
        });
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [syncOpen, syncSearch]);

  const handleOpenSync = () => {
    setSyncSearch('');
    setSyncOrders([]);
    setSyncOpen(true);
  };

  // Applique les prix de la commande sélectionnée aux lignes PEC ayant la même référence
  const handleSyncPricesFromOrder = async (order: PecSyncOrder) => {
    setSyncingOrderNumber(order.number);
    setError(null);
    try {
      const data = await fetchOrderLinesForPecSync(order.number);
      const priceByRef = new Map<string, number>();
      (data.value || []).forEach(l => {
        const ref = (l.reference || '').trim().toUpperCase();
        if (ref && !priceByRef.has(ref)) priceByRef.set(ref, l.unitPrice);
      });

      let matched = 0;
      const updatedLines = detailLines.map(line => {
        const ref = (line.reference || '').trim().toUpperCase();
        const price = ref ? priceByRef.get(ref) : undefined;
        if (price === undefined) return line;
        matched += 1;
        return { ...line, price };
      });
      setDetailLines(updatedLines);

      // Renseigne le fournisseur de la commande s'il n'est pas encore choisi
      if (!selectedVendor && data.vendorNumber) {
        setSelectedVendor(data.vendorNumber);
        setVendorError(false);
      }

      const total = detailLines.length;
      setSyncMessage(
        matched === 0
          ? `Aucune référence du PEC ne correspond aux lignes de la commande ${order.number}.`
          : `${matched}/${total} prix synchronisés depuis la commande ${order.number}.`
      );
      setSyncOpen(false);
    } catch (err: any) {
      console.error('Error syncing prices from order:', err);
      setError(typeof err === 'string' ? err : (err?.message || 'Erreur lors de la synchronisation des prix.'));
    } finally {
      setSyncingOrderNumber(null);
    }
  };

  const handleUpdateDetailLineDate = (id: string, newDate: string) => {
    setDetailLines(prev =>
      prev.map(line => (line.id === id ? { ...line, expectedDeliveryDate: newDate } : line))
    );
  };

  const handleCreateOrder = async () => {
    if (!selectedRequest) return;
    const vendorNumber = (selectedRequest.insuredName && selectedRequest.insuredName.includes('|') ? selectedRequest.insuredName.split('|')[1] : selectedRequest.purchaseOrderNo) || selectedVendor;
    if (!vendorNumber) {
      setError('Fournisseur non spécifié.');
      return;
    }

    const checkedLines = detailLines.filter(l => checkedLineIds.includes(l.id));
    if (checkedLines.length === 0) {
      setError('Veuillez cocher au moins un article pour créer la commande.');
      return;
    }

    const missingRefs = checkedLines.some(l => !l.reference || l.reference.trim() === '');
    if (missingRefs) {
      setError('Certains articles sélectionnés n\'ont pas de référence.');
      return;
    }

    setCreatingOrder(true);
    setError(null);
    try {
      const payload = {
        vendorNumber: vendorNumber,
        lines: checkedLines.map(l => ({
          id: l.id,
          reference: l.reference!.trim(),
          designation: l.designation || '',
          quantity: l.quantity,
          price: typeof l.price === 'number' ? l.price : (parseFloat(String(l.price)) || 0.0),
          status: l.status,
          expectedDeliveryDate: isLivraisonPrevue(l.status) ? (l.expectedDeliveryDate || undefined) : undefined
        }))
      };

      await createOrderFromPec(selectedRequest.number, payload);
      setSuccess(true);
      handleCloseDetails();
      loadRequests();
    } catch (err: any) {
      console.error('Error creating order from PEC:', err);
      let errMsg = 'Erreur lors de la création de la commande.';
      if (typeof err === 'string') {
        if (err.startsWith('BC Error:')) {
          try {
            const jsonPart = err.substring(9).trim();
            const parsed = JSON.parse(jsonPart);
            if (parsed?.error?.message) {
              errMsg = `BC Error: ${parsed.error.message}`;
            } else {
              errMsg = err;
            }
          } catch (e) {
            errMsg = err;
          }
        } else {
          errMsg = err;
        }
      } else if (err && typeof err === 'object') {
        errMsg = err.response?.data?.error?.message || err.message || errMsg;
      }
      setError(errMsg);
    } finally {
      setCreatingOrder(false);
    }
  };

  const handleCreateDevis = async () => {
    if (!selectedRequest) return;

    if (!selectedVendor) {
      setError('Veuillez sélectionner un fournisseur.');
      setVendorError(true);
      return;
    }

    const missingRefs = detailLines.some(l =>
      l.status?.toString().toLowerCase() !== 'non disponible' &&
      l.status?.toString() !== '2' &&
      (!l.reference || l.reference.trim() === '')
    );
    if (missingRefs) {
      setError('Veuillez remplir toutes les références d\'articles avant de créer le devis.');
      return;
    }

    const missingDates = detailLines.some(l => isLivraisonPrevue(l.status) && !l.expectedDeliveryDate);
    if (missingDates) {
      setError('Veuillez saisir la date de livraison prévue pour les articles concernés.');
      return;
    }

    setCreatingOrder(true);
    setError(null);
    try {
      const payload = {
        vendorNumber: selectedVendor,
        lines: detailLines.map(l => ({
          id: l.id,
          reference: l.reference?.trim() || '',
          designation: l.designation || '',
          quantity: l.quantity,
          price: typeof l.price === 'number' ? l.price : (parseFloat(String(l.price)) || 0.0),
          status: l.status || 'Trouvé',
          expectedDeliveryDate: isLivraisonPrevue(l.status) ? (l.expectedDeliveryDate || undefined) : undefined
        }))
      };

      await createDevisFromPec(selectedRequest.number, payload);
      setSuccess(true);
      handleCloseDetails();
      loadRequests();
    } catch (err: any) {
      console.error('Error creating devis from PEC:', err);
      let errMsg = 'Erreur lors de la création du devis.';
      if (typeof err === 'string') {
        if (err.startsWith('BC Error:')) {
          try {
            const jsonPart = err.substring(9).trim();
            const parsed = JSON.parse(jsonPart);
            if (parsed?.error?.message) {
              errMsg = `BC Error: ${parsed.error.message}`;
            } else {
              errMsg = err;
            }
          } catch (e) {
            errMsg = err;
          }
        } else {
          errMsg = err;
        }
      } else if (err && typeof err === 'object') {
        errMsg = err.response?.data?.error?.message || err.message || errMsg;
      }
      setError(errMsg);
    } finally {
      setCreatingOrder(false);
    }
  };

  // Status Chip helper
  const getStatusLabelAndColor = (statusVal: string | number, insuredName?: string, parentStatus?: string | number) => {
    const status = statusVal?.toString().toLowerCase().replace(/_/g, ' ').trim();
    const pStatus = parentStatus?.toString().toLowerCase().replace(/_/g, ' ').trim();
    const isParentOrdered = pStatus && pStatus !== 'en cours' && pStatus !== '0';

    if (isLivraisonPrevue(statusVal)) {
      return { label: 'Livraison prévue', color: 'secondary' as const };
    }
    if (status === 'commandé' || status === 'commande' || status === '3' || status === '1') {
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
    if (status === 'trouvé' || status === 'trouve' || status === '1') {
      if (isParentOrdered) {
        return { label: 'Non commandé', color: 'default' as const };
      }
      return { label: 'Disponible', color: 'success' as const };
    }
    if (status === 'non disponible' || status === '2') {
      return { label: 'Non Disponible', color: 'error' as const };
    }
    if ((status === 'en cours' || status === '0') && insuredName && insuredName.includes('|')) {
      return { label: 'Devis proposé', color: 'warning' as const };
    }
    return { label: 'En cours', color: 'warning' as const };
  };

  // L'opérateur PEC peut encore chiffrer le dossier (en cours et devis pas encore proposé)
  const canEditRequest = !!(
    isPecClient &&
    selectedRequest &&
    (selectedRequest.status?.toString() === '0' || selectedRequest.status?.toString().toLowerCase() === 'en cours') &&
    !(selectedRequest.insuredName && selectedRequest.insuredName.includes('|'))
  );

  const getStatusChip = (statusVal: string | number, insuredName?: string, parentStatus?: string | number) => {
    const info = getStatusLabelAndColor(statusVal, insuredName, parentStatus);
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
            <Typography variant="h3" fontWeight={900}>Commandes prise en charge</Typography>
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
            1. Détails du Véhicule & PEC
          </Typography>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                label="N° PEC *"
                placeholder="Numéro de PEC..."
                value={insuredName}
                onChange={(e) => setInsuredName(e.target.value)}
                variant="outlined"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                label="Nom de l'assuré"
                placeholder="Nom de l'assuré..."
                value={insuredRealName}
                onChange={(e) => setInsuredRealName(e.target.value)}
                variant="outlined"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                label="N° Châssis (VIN)"
                placeholder="Ex: 17 caractères..."
                value={vin}
                onChange={(e) => setVin(e.target.value)}
                inputProps={{ maxLength: 17 }}
                variant="outlined"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
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
                <TableCell sx={{ fontWeight: '900' }}>N° PEC</TableCell>
                {isPecClient && <TableCell sx={{ fontWeight: '900' }}>Client</TableCell>}
                <TableCell sx={{ fontWeight: '900' }}>VIN / Châssis</TableCell>
                <TableCell sx={{ fontWeight: '900' }}>Immatriculation</TableCell>
                <TableCell sx={{ fontWeight: '900' }}>Date Demande</TableCell>
                <TableCell sx={{ fontWeight: '900' }}>Statut</TableCell>
                <TableCell align="center" sx={{ fontWeight: '900', width: 120 }}>Détails</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loadingList ? (
                <TableRow>
                  <TableCell colSpan={isPecClient ? 7 : 6} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={32} />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontWeight: 600 }}>
                      Chargement de l'historique...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isPecClient ? 7 : 6} align="center" sx={{ py: 6 }}>
                    <InfoCircle size={40} color={theme.palette.text.secondary} />
                    <Typography variant="body1" color="text.secondary" sx={{ mt: 1, fontWeight: 700 }}>
                      Aucune demande PEC enregistrée pour le moment.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((req) => {
                  const isHighlighted = req.number === highlightNumber;
                  return (
                    <TableRow
                      key={req.number}
                      sx={{
                        '&:hover': { bgcolor: isHighlighted ? alpha(theme.palette.primary.main, 0.15) : alpha(theme.palette.grey[100], 0.3) },
                        ...(isHighlighted && {
                          bgcolor: alpha(theme.palette.primary.main, 0.08),
                          borderLeft: `4px solid ${theme.palette.primary.main}`
                        })
                      }}
                    >
                      <TableCell sx={{ fontWeight: 800 }}>
                        <Stack spacing={0.5}>
                          <Box>{req.insuredName ? (req.insuredName.includes('|') ? req.insuredName.split('|')[0] : req.insuredName).split(' / ')[0] : '-'}</Box>
                          {req.insuredName && (req.insuredName.includes('|') ? req.insuredName.split('|')[0] : req.insuredName).includes(' / ') && (
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                              Assuré: {(req.insuredName.includes('|') ? req.insuredName.split('|')[0] : req.insuredName).split(' / ')[1]}
                            </Typography>
                          )}
                        </Stack>
                      </TableCell>
                      {isPecClient && (
                        <TableCell sx={{ fontWeight: 700 }}>
                          {(req as any).customerName || (req as any).customerNo || '-'}
                        </TableCell>
                      )}
                      <TableCell sx={{ fontWeight: 700, fontFamily: 'monospace' }}>{req.vin || '-'}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{req.registrationNumber || '-'}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>
                        {req.creationDateTime ? new Date(req.creationDateTime).toLocaleString('fr-FR') : '-'}
                      </TableCell>
                      <TableCell>{getStatusChip(req.status, req.insuredName)}</TableCell>
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
                  );
                })
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
      <Dialog open={openDetails} onClose={handleCloseDetails} maxWidth="lg" fullWidth sx={{ '& .MuiPaper-root': { borderRadius: 3 } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <ClipboardText size={24} variant="Bold" color={theme.palette.primary.main} />
            <Typography variant="h4" fontWeight={900}>
              Articles du PEC {selectedRequest?.insuredName ? (selectedRequest.insuredName.includes('|') ? selectedRequest.insuredName.split('|')[0] : selectedRequest.insuredName).split(' / ')[0] : ''}
              {selectedRequest?.insuredName && (selectedRequest.insuredName.includes('|') ? selectedRequest.insuredName.split('|')[0] : selectedRequest.insuredName).includes(' / ') && (
                <span style={{ fontWeight: 500, fontSize: '0.8em', marginLeft: 12, opacity: 0.8 }}>
                  • Assuré: {(selectedRequest.insuredName.includes('|') ? selectedRequest.insuredName.split('|')[0] : selectedRequest.insuredName).split(' / ')[1]}
                </span>
              )}
            </Typography>
          </Stack>
          <Box>{selectedRequest && getStatusChip(selectedRequest.status, selectedRequest.insuredName)}</Box>
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
            <Box sx={{ mb: 3, p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.04), border: `1px solid ${vendorError ? theme.palette.error.main : alpha(theme.palette.primary.main, 0.1)}` }}>
              <Typography variant="h5" fontWeight={800} color={vendorError ? "error.main" : "primary.main"} sx={{ mb: 1.5 }}>
                Sélection du Fournisseur *
              </Typography>
              <Autocomplete
                fullWidth
                disabled={!!(selectedRequest && selectedRequest.insuredName && selectedRequest.insuredName.includes('|'))}
                options={vendors}
                getOptionLabel={(option) => `${option.displayName || option.name || option.number} (${option.number})`}
                value={vendors.find((v) => v.number === selectedVendor) || null}
                onChange={(_, newValue) => {
                  setSelectedVendor(newValue ? newValue.number : '');
                  if (newValue) setVendorError(false);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Fournisseur *"
                    placeholder="Rechercher ou sélectionner un Fournisseur..."
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                    error={vendorError}
                    helperText={vendorError ? "La sélection du fournisseur est obligatoire." : ""}
                  />
                )}
                sx={{
                  '& .MuiOutlinedInput-root': { borderRadius: 2 },
                  '& .MuiAutocomplete-input': { fontWeight: 700 },
                  '& .MuiInputBase-input.Mui-disabled': {
                    WebkitTextFillColor: `${theme.palette.text.primary} !important`,
                    color: `${theme.palette.text.primary} !important`
                  },
                  '& .MuiOutlinedInput-root.Mui-disabled .MuiOutlinedInput-notchedOutline': {
                    borderColor: `${theme.palette.divider} !important`
                  },
                  '& .MuiInputLabel-root.Mui-disabled': {
                    color: `${theme.palette.text.secondary} !important`
                  }
                }}
              />
            </Box>
          )}

          {canEditRequest && (
            <Stack direction="row" justifyContent="flex-end" sx={{ mb: 2 }}>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleOpenSync}
                startIcon={<Refresh2 size={18} variant="Bold" />}
                sx={{ borderRadius: 2, fontWeight: 800, px: 2.5 }}
              >
                SYNC COMMANDE
              </Button>
            </Stack>
          )}

          {loadingDetails ? (
            <Stack alignItems="center" sx={{ py: 6 }}>
              <CircularProgress size={32} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Chargement des articles...
              </Typography>
            </Stack>
          ) : (
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
              <TableContainer sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                <Table size="medium">
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha(theme.palette.grey[50], 0.8) }}>
                    {!isPecClient && selectedRequest &&
                      (selectedRequest.status?.toString() === '0' || selectedRequest.status?.toString().toLowerCase() === 'en cours') &&
                      selectedRequest.insuredName && selectedRequest.insuredName.includes('|') && (
                        <TableCell padding="checkbox" sx={{ fontWeight: '900' }}>
                          <Checkbox
                            indeterminate={
                              checkedLineIds.length > 0 &&
                              checkedLineIds.length < detailLines.filter(l =>
                                l.status?.toString().toLowerCase() !== 'commandé' &&
                                l.status?.toString() !== '3' &&
                                l.status?.toString().toLowerCase() !== 'non disponible' &&
                                l.status?.toString() !== '2'
                              ).length
                            }
                            checked={
                              detailLines.filter(l =>
                                l.status?.toString().toLowerCase() !== 'commandé' &&
                                l.status?.toString() !== '3' &&
                                l.status?.toString().toLowerCase() !== 'non disponible' &&
                                l.status?.toString() !== '2'
                              ).length > 0 &&
                              checkedLineIds.length === detailLines.filter(l =>
                                l.status?.toString().toLowerCase() !== 'commandé' &&
                                l.status?.toString() !== '3' &&
                                l.status?.toString().toLowerCase() !== 'non disponible' &&
                                l.status?.toString() !== '2'
                              ).length
                            }
                            onChange={(e) => {
                              if (e.target.checked) {
                                setCheckedLineIds(detailLines.filter(l =>
                                  l.status?.toString().toLowerCase() !== 'commandé' &&
                                  l.status?.toString() !== '3' &&
                                  l.status?.toString().toLowerCase() !== 'non disponible' &&
                                  l.status?.toString() !== '2'
                                ).map(l => l.id));
                              } else {
                                setCheckedLineIds([]);
                              }
                            }}
                          />
                        </TableCell>
                      )}
                    <TableCell sx={{ fontWeight: '900' }}>Référence</TableCell>
                    <TableCell sx={{ fontWeight: '900' }}>Désignation</TableCell>
                    <TableCell sx={{ fontWeight: '900', width: 180 }}>Prix</TableCell>
                    <TableCell sx={{ fontWeight: '900', width: 100 }}>Quantité</TableCell>
                    <TableCell sx={{ fontWeight: '900', width: 170 }}>Statut Pièce</TableCell>
                    <TableCell sx={{ fontWeight: '900', width: 150 }}>Date Livraison</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {detailLines.map((line, idx) => {
                    const isProposed = !!(selectedRequest && selectedRequest.insuredName && selectedRequest.insuredName.includes('|'));
                    const canEdit = isPecClient && selectedRequest && (selectedRequest.status?.toString() === '0' || selectedRequest.status?.toString().toLowerCase() === 'en cours') && !isProposed;
                    const isDevisProposed = !isPecClient && selectedRequest &&
                      (selectedRequest.status?.toString() === '0' || selectedRequest.status?.toString().toLowerCase() === 'en cours') &&
                      selectedRequest.insuredName && selectedRequest.insuredName.includes('|');
                    return (
                      <TableRow key={idx} sx={{ '&:hover': { bgcolor: alpha(theme.palette.grey[100], 0.3) } }}>
                        {isDevisProposed && (
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={checkedLineIds.includes(line.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setCheckedLineIds(prev => [...prev, line.id]);
                                } else {
                                  setCheckedLineIds(prev => prev.filter(id => id !== line.id));
                                }
                              }}
                              disabled={
                                line.status?.toString().toLowerCase() === 'commandé' ||
                                line.status?.toString() === '3' ||
                                line.status?.toString().toLowerCase() === 'non disponible' ||
                                line.status?.toString() === '2'
                              }
                            />
                          </TableCell>
                        )}
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
                        <TableCell>
                          {canEdit ? (
                            <Select
                              value={
                                line.status?.toString().toLowerCase() === 'trouvé' || line.status?.toString().toLowerCase() === 'trouve' || line.status?.toString() === '1'
                                  ? 'Trouvé'
                                  : line.status?.toString().toLowerCase() === 'non disponible' || line.status?.toString() === '2'
                                    ? 'Non Disponible'
                                    : isLivraisonPrevue(line.status)
                                      ? 'LivraisonPrevuDate'
                                      : 'En cours'
                              }
                              onChange={(e) => handleUpdateDetailLineStatus(line.id, e.target.value as string)}
                              size="small"
                              fullWidth
                              sx={{ borderRadius: 1.5, fontWeight: 700 }}
                            >
                              <MenuItem value="En cours">En cours</MenuItem>
                              <MenuItem value="Trouvé">Disponible</MenuItem>
                              <MenuItem value="LivraisonPrevuDate">Livraison prévue</MenuItem>
                              <MenuItem value="Non Disponible">Non disponible</MenuItem>
                            </Select>
                          ) : (
                            getStatusChip(line.status, undefined, selectedRequest?.status)
                          )}
                        </TableCell>
                        <TableCell sx={{ py: canEdit ? 1 : 1.5 }}>
                          {canEdit && isLivraisonPrevue(line.status) ? (
                            <DatePicker
                              value={line.expectedDeliveryDate ? parseISO(line.expectedDeliveryDate) : null}
                              onChange={(newDate) =>
                                handleUpdateDetailLineDate(line.id, newDate && isValid(newDate) ? format(newDate, 'yyyy-MM-dd') : '')
                              }
                              minDate={startOfDay(new Date())}
                              format="dd/MM/yyyy"
                              slotProps={{
                                textField: {
                                  size: 'small',
                                  error: !line.expectedDeliveryDate,
                                  sx: { width: 140 },
                                  InputProps: { sx: { borderRadius: 1.5, fontWeight: 700, fontSize: '0.8rem' } }
                                },
                                actionBar: { actions: ['today', 'clear'] }
                              }}
                            />
                          ) : line.expectedDeliveryDate ? (
                            <Typography fontWeight={800}>
                              {new Date(line.expectedDeliveryDate).toLocaleDateString('fr-FR')}
                            </Typography>
                          ) : (
                            <Typography color="text.secondary">-</Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
                </Table>
              </TableContainer>
            </LocalizationProvider>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: `1px solid ${theme.palette.divider}`, justifyContent: 'space-between' }}>
          <Button onClick={handleCloseDetails} color="secondary" variant="contained" sx={{ borderRadius: 2, fontWeight: 800, px: 3 }}>
            Fermer
          </Button>
          {isPecClient && selectedRequest && (selectedRequest.status?.toString() === '0' || selectedRequest.status?.toString().toLowerCase() === 'en cours') && (
            <Button
              onClick={handleCreateDevis}
              color="primary"
              variant="contained"
              disabled={
                creatingOrder ||
                !!(selectedRequest.insuredName && selectedRequest.insuredName.includes('|')) ||
                !selectedVendor ||
                detailLines.some(l => {
                  const status = l.status?.toString().toLowerCase().trim();
                  const isEnCours = status === 'en cours' || status === '0' || !status;
                  if (isEnCours) return true;

                  const isPrevue = isLivraisonPrevue(l.status);
                  if (isPrevue && !l.expectedDeliveryDate) return true;

                  const isDispo = status === 'trouvé' || status === 'trouve' || status === '1';
                  if (isDispo || isPrevue) {
                    const priceVal = parseFloat(String(l.price));
                    return isNaN(priceVal) || priceVal <= 0;
                  }
                  return false;
                })
              }
              startIcon={creatingOrder ? <CircularProgress size={20} color="inherit" /> : <TickCircle variant="Bold" />}
              sx={{ borderRadius: 2, fontWeight: 900, px: 3 }}
            >
              {creatingOrder ? 'ENREGISTREMENT...' : (selectedRequest.insuredName && selectedRequest.insuredName.includes('|') ? 'DEVIS DÉJÀ PROPOSÉ' : 'CRÉER LE DEVIS')}
            </Button>
          )}
          {!isPecClient && selectedRequest &&
            (selectedRequest.status?.toString() === '0' || selectedRequest.status?.toString().toLowerCase() === 'en cours') &&
            selectedRequest.insuredName && selectedRequest.insuredName.includes('|') && (
              <Button
                onClick={handleCreateOrder}
                color="primary"
                variant="contained"
                disabled={creatingOrder || checkedLineIds.length === 0}
                startIcon={creatingOrder ? <CircularProgress size={20} color="inherit" /> : <TickCircle variant="Bold" />}
                sx={{ borderRadius: 2, fontWeight: 900, px: 3 }}
              >
                {creatingOrder ? 'CRÉATION...' : 'CRÉER LA COMMANDE'}
              </Button>
            )}
        </DialogActions>
      </Dialog>

      {/* SYNC PRIX DEPUIS UNE COMMANDE D'ACHAT */}
      <Dialog open={syncOpen} onClose={() => setSyncOpen(false)} maxWidth="md" fullWidth sx={{ '& .MuiPaper-root': { borderRadius: 3 } }}>
        <DialogTitle sx={{ pb: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Refresh2 size={24} variant="Bold" color={theme.palette.primary.main} />
            <Typography variant="h4" fontWeight={900}>
              Synchroniser les prix depuis une commande
            </Typography>
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            Les prix sont repris sur les lignes du PEC ayant la même référence.
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ mt: 2, p: 3 }}>
          <TextField
            fullWidth
            autoFocus
            label="Rechercher par n° de commande"
            placeholder="Ex: CA26/1389..."
            value={syncSearch}
            onChange={(e) => setSyncSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <Box sx={{ display: 'flex', mr: 1, color: 'text.secondary' }}>
                  <SearchNormal1 size={18} />
                </Box>
              ),
              sx: { borderRadius: 2, fontWeight: 700 }
            }}
            // marge haute : MUI supprime le padding-top d'un DialogContent qui suit un
            // DialogTitle, ce qui rognait le label flottant du champ
            sx={{ mt: 1.5, mb: 2 }}
          />

          <TableContainer sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2, maxHeight: 380 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: '900' }}>N° Commande</TableCell>
                  <TableCell sx={{ fontWeight: '900' }}>Fournisseur</TableCell>
                  <TableCell sx={{ fontWeight: '900' }}>Date</TableCell>
                  <TableCell align="right" sx={{ fontWeight: '900' }}>Montant HT</TableCell>
                  <TableCell align="center" sx={{ fontWeight: '900', width: 140 }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loadingSyncOrders ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                      <CircularProgress size={28} />
                    </TableCell>
                  </TableRow>
                ) : syncOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                      <Typography color="text.secondary" fontWeight={700}>
                        Aucune commande trouvée.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  syncOrders.map((order) => (
                    <TableRow key={order.number} sx={{ '&:hover': { bgcolor: alpha(theme.palette.grey[100], 0.4) } }}>
                      <TableCell sx={{ fontWeight: 800, fontFamily: 'monospace' }}>{order.number}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{order.vendorName || order.vendorNumber || '-'}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>
                        {order.orderDate ? new Date(order.orderDate).toLocaleDateString('fr-FR') : '-'}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800 }}>
                        {order.totalAmountExcludingTax ? Number(order.totalAmountExcludingTax).toFixed(3) : '-'}
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => handleSyncPricesFromOrder(order)}
                          disabled={!!syncingOrderNumber}
                          startIcon={
                            syncingOrderNumber === order.number ? (
                              <CircularProgress size={16} color="inherit" />
                            ) : (
                              <Refresh2 size={16} variant="Bold" />
                            )
                          }
                          sx={{ borderRadius: 2, fontWeight: 800 }}
                        >
                          {syncingOrderNumber === order.number ? '...' : 'SYNC'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Button onClick={() => setSyncOpen(false)} color="secondary" variant="contained" sx={{ borderRadius: 2, fontWeight: 800, px: 3 }}>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>

      {/* FEEDBACK SNACKBARS */}
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="error" variant="filled" onClose={() => setError(null)} sx={{ borderRadius: 2, fontWeight: 700 }}>{error}</Alert>
      </Snackbar>
      <Snackbar open={!!syncMessage} autoHideDuration={6000} onClose={() => setSyncMessage(null)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="info" variant="filled" onClose={() => setSyncMessage(null)} sx={{ borderRadius: 2, fontWeight: 700 }}>{syncMessage}</Alert>
      </Snackbar>
      <Snackbar open={success} autoHideDuration={6000} onClose={() => setSuccess(false)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="success" variant="filled" onClose={() => setSuccess(false)} sx={{ borderRadius: 2, fontWeight: 700, bgcolor: 'success.main' }}>
          Dossier PEC envoyé et enregistré avec succès !
        </Alert>
      </Snackbar>
    </Stack>
  );
}
