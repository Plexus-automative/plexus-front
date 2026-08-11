'use client';

import React, { useState } from 'react';
import axiosServices from 'utils/axios';
import { useSession } from 'next-auth/react';

// material-ui
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import FormControlLabel from '@mui/material/FormControlLabel';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Alert from '@mui/material/Alert';
import InputAdornment from '@mui/material/InputAdornment';

// project-imports
import MainCard from 'components/MainCard';
import AssignDevisDialog from 'components/demandes-devis/AssignDevisDialog';
import { DemandeDevis, assignOrderToDemande } from 'app/api/services/DemandeDevisService';

// icons
import { Trash, InfoCircle, Edit2, DocumentText, SearchNormal1, CloseCircle, ArrowRight2 } from '@wandersonalwes/iconsax-react';

// context
import { useCart } from 'contexts/CartContext';

export default function PanierPage() {
    const theme = useTheme();
    const { data: session } = useSession();
    const { cartItems, totalPrice, removeFromCart, updateQuantity, toggleAdaptable, updateChassisNo, clearCart, registrationNumber, setRegistrationNumber } = useCart();

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    // Dossier assurance states
    const [isDossierChecked, setIsDossierChecked] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [dossierData, setDossierData] = useState({
        InsuranceName: 'STAR ASSURANCE',
        SinitreNumber: '',
        RegistrationNumber: '',
        VIN: '',
        InsuranceCode: 0,
        Insurancefile: true,
        InsuredName: ''
    });

    // Sync global registrationNumber with dossierData
    React.useEffect(() => {
        setDossierData(prev => ({ ...prev, RegistrationNumber: registrationNumber }));
    }, [registrationNumber]);

    // Demande de devis to attach to the order(s) this cart will create. Plexus (C0090)
    // only — nobody else sees the demandes, so nobody else can link one.
    const isPlexusPec = (session?.user as any)?.customerNo === 'C0090';
    const [isDevisPickerOpen, setIsDevisPickerOpen] = useState(false);
    const [selectedDevis, setSelectedDevis] = useState<DemandeDevis | null>(null);
    /** What picking the devis filled in, so the reuse is visible rather than silent. */
    const [devisPrefill, setDevisPrefill] = useState<string[]>([]);

    /**
     * Carries the vehicle over from the demande so it is not keyed in twice.
     *
     * The devis is the record of what the commercial actually saw on site, so it wins
     * over whatever is currently in the fields — but every value it writes is listed
     * underneath, so nothing changes without being visible.
     */
    const handleDevisSelected = (d: DemandeDevis) => {
        setSelectedDevis(d);

        const filled: string[] = [];
        if (d.vehicle?.immatriculation) {
            // Goes out on every order, insurance dossier or not.
            setRegistrationNumber(d.vehicle.immatriculation);
            filled.push('immatriculation');
        }
        if (d.vehicle?.vin) {
            // Only reaches BC when the dossier assurance is ticked — see handleValidation.
            setDossierData(prev => ({ ...prev, VIN: d.vehicle!.vin as string }));
            filled.push('VIN');
        }
        setDevisPrefill(filled);
    };

    // Chassis modal states
    const [isChassisModalOpen, setIsChassisModalOpen] = useState(false);
    const [activeChassisItem, setActiveChassisItem] = useState<any>(null);
    const [tempChassisNo, setTempChassisNo] = useState('');

    const handleToggleAdaptable = (item: any, checked: boolean) => {
        toggleAdaptable(item.id, checked);
    };

    const [pendingType, setPendingType] = useState<'demande' | 'devis' | null>(null);

    const handleConfirmChassis = () => {
        // Apply tempChassisNo to all adaptable items
        cartItems.forEach(item => {
            if (item.isAdaptable) {
                updateChassisNo(item.id, tempChassisNo);
            }
        });
        setIsChassisModalOpen(false);
        if (pendingType) {
            handleValidation(pendingType, true);
            setPendingType(null);
        }
        setTempChassisNo('');
    };

    const isInsuranceDossierValid =
        dossierData.InsuranceName &&
        (dossierData.InsuranceName === 'MAWDY' || dossierData.SinitreNumber.trim() !== '') &&
        dossierData.RegistrationNumber.trim() !== '' &&
        (dossierData.InsuranceName !== 'MAWDY' || dossierData.InsuredName.trim() !== '') &&
        dossierData.VIN.length === 17;

    // Action modals state
    const [infoItem, setInfoItem] = useState<any>(null);
    const [editItem, setEditItem] = useState<any>(null);
    const [deleteItem, setDeleteItem] = useState<any>(null);
    const [editQuantity, setEditQuantity] = useState<number | string>(0);

    const handleDossierCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        if (checked) {
            setIsModalOpen(true);
        } else {
            setIsDossierChecked(false);
            setRegistrationNumber('');
            setDossierData({
                InsuranceName: 'STAR ASSURANCE',
                SinitreNumber: '',
                RegistrationNumber: '',
                VIN: '',
                InsuranceCode: 0,
                Insurancefile: true,
                InsuredName: ''
            });
        }
    };

    const handleConfirmDossier = () => {
        if (dossierData.VIN.length !== 17) {
            alert("Le numéro VIN doit comporter exactement 17 caractères.");
            return;
        }
        setRegistrationNumber(dossierData.RegistrationNumber);
        setIsDossierChecked(true);
        setIsModalOpen(false);
    };

    const handleCancelDossier = () => {
        setIsDossierChecked(false);
        setIsModalOpen(false);
        setRegistrationNumber('');
        setDossierData({
            InsuranceName: 'STAR ASSURANCE',
            SinitreNumber: '',
            RegistrationNumber: '',
            VIN: '',
            InsuranceCode: 0,
            Insurancefile: true,
            InsuredName: ''
        });
    };

    const handleOpenEdit = (item: any) => {
        setEditItem(item);
        setEditQuantity(item.quantity);
    };

    const handleConfirmEdit = () => {
        if (editItem) {
            const finalQuantity = typeof editQuantity === 'string' ? parseInt(editQuantity) || 1 : editQuantity;
            updateQuantity(editItem.id, finalQuantity);
            setEditItem(null);
        }
    };

    const handleConfirmDelete = () => {
        if (deleteItem) {
            removeFromCart(deleteItem.id);
            setDeleteItem(null);
        }
    };

    const handleValidation = async (type: 'demande' | 'devis', chassisConfirmed = false) => {
        if (cartItems.length === 0) return;

        // If Demander and has adaptable items without chassis confirmed yet
        if (type === 'demande' && !chassisConfirmed) {
            const hasAdaptable = cartItems.some(item => item.isAdaptable);
            if (hasAdaptable) {
                setPendingType(type);
                setIsChassisModalOpen(true);
                return;
            }
        }

        setLoading(true);
        setSuccess('');
        setError('');

        try {
            // Group items by vendor
            const itemsByVendor = cartItems.reduce((acc, item) => {
                if (!acc[item.vendorNumber]) {
                    acc[item.vendorNumber] = [];
                }
                acc[item.vendorNumber].push(item);
                return acc;
            }, {} as Record<string, typeof cartItems>);

            const today = new Date().toISOString().split('T')[0];
            let firstOrderData: any = null;
            const allLinesForDevis: any[] = [];
            // One order per vendor, so a cart can produce several numbers — all of them
            // get recorded on the demande rather than just the first.
            const createdOrderNumbers: string[] = [];

            for (const [vendorNumber, items] of Object.entries(itemsByVendor)) {
                // Incorporate the Dossier Assurance data if available and checked
                const payload = {
                    vendorNumber: vendorNumber,
                    SellToCustomerNo: (session?.user as any)?.customerNo || '',
                    orderDate: today,
                    postingDate: today,
                    ShippingAdvice: "Attente",
                    Delivred: "Non",
                    QtyReceived: "Non",
                    lines: items.map(item => ({
                        lineType: "Item",
                        lineObjectNumber: item.number,
                        directUnitCost: item.price,
                        quantity: item.quantity,
                        description: item.description,
                        UncertainReference: item.isAdaptable || false,
                        ChassisNo: item.isAdaptable ? (item.chassisNo || tempChassisNo || '') : ''
                    })),
                    RegistrationNumber: registrationNumber,
                    ...(isDossierChecked ? dossierData : {})
                };

                const response = await axiosServices.post(`/api/purchase-orders/bulk`, payload, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                const orderData = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
                if (!firstOrderData) firstOrderData = orderData;
                if (orderData?.number) createdOrderNumbers.push(orderData.number);

                if (type === 'devis') {
                    allLinesForDevis.push(...payload.lines);
                }
            }

            if (type === 'devis' && firstOrderData) {
                // Generate and download ONE consolidated Devis PDF
                const pdfRes = await axiosServices.post(`/api/purchase-orders/generate-devis`, {
                    ...firstOrderData,
                    lines: allLinesForDevis
                }, { responseType: 'blob' });

                const url = window.URL.createObjectURL(new Blob([pdfRes.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `DEVIS_${firstOrderData.number.replace(/\//g, '-')}.pdf`);
                document.body.appendChild(link);
                link.click();
                link.remove();
            }

            // Link the demande de devis, if one was picked. Done after the orders exist,
            // because the number being assigned is theirs.
            let devisMsg = '';
            if (selectedDevis && createdOrderNumbers.length > 0) {
                try {
                    await assignOrderToDemande(selectedDevis.id, createdOrderNumbers.join(', '));
                    devisMsg = ` La demande ${selectedDevis.number} a été rattachée et passée en traitée.`;
                    setSelectedDevis(null);
                } catch (assignErr: any) {
                    // The order is already created — that must not read as a failure. Say
                    // plainly what did and did not happen so it can be fixed by hand.
                    devisMsg =
                        ` En revanche, le rattachement à la demande ${selectedDevis.number} a échoué :` +
                        ` assignez-la manuellement (commande ${createdOrderNumbers.join(', ')}).`;
                }
            }

            setSuccess(
                `Votre ${type === 'devis' ? 'devis' : 'commande'} a été ${type === 'devis' ? 'créé' : 'créée'} avec succès !` +
                devisMsg
            );

            if (type === 'demande') {
                clearCart();
            }

            // Reset Dossier assurance
            setIsDossierChecked(false);
            setRegistrationNumber('');
            setDossierData({ InsuranceName: 'STAR ASSURANCE', SinitreNumber: '', RegistrationNumber: '', VIN: '', InsuranceCode: 0, Insurancefile: true, InsuredName: '' });
        } catch (err: any) {
            setError('Erreur lors de la validation du panier: ' + (err.message || 'Erreur inconnue'));
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ mb: 3 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="h3" sx={{ fontWeight: 'bold' }}>Mon Panier</Typography>
                    {cartItems.length > 0 && (
                        <Button variant="outlined" color="error" onClick={clearCart} startIcon={<Trash variant="Bulk" />}>
                            Vider le panier
                        </Button>
                    )}
                </Stack>
            </Box>

            {/* ERROR/SUCCESS ALERTS */}
            <Box sx={{ mb: 3 }}>
                {success && <Alert severity="success" sx={{ mb: 1 }}>{success}</Alert>}
                {error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}
            </Box>

            <Box sx={{ width: '100%' }}>
                <MainCard content={false} sx={{ width: '100%' }}>
                    {/* TOP CONTROLS (Mock Search / Pagination info) */}
                    <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${theme.palette.divider}` }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Typography variant="body2" color="textSecondary">Afficher</Typography>
                            <TextField select size="small" value={10} sx={{ width: 70 }}>
                                <MenuItem value={10}>10</MenuItem>
                                <MenuItem value={25}>25</MenuItem>
                                <MenuItem value={50}>50</MenuItem>
                            </TextField>
                            <Typography variant="body2" color="textSecondary">lignes</Typography>
                        </Stack>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <TextField
                                placeholder="N° Immatriculation ..."
                                size="small"
                                value={registrationNumber}
                                onChange={(e) => setRegistrationNumber(e.target.value.toUpperCase())}
                                sx={{ 
                                    width: 180,
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 1.5,
                                        bgcolor: theme.palette.background.paper
                                    }
                                }}
                            />
                            <TextField
                                placeholder="Chercher"
                                size="small"
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <SearchNormal1 size={14} />
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Stack>
                    </Box>

                    {/* DATA TABLE */}
                    <TableContainer>
                        <Table sx={{ minWidth: 650 }} aria-label="cart table">
                            <TableHead sx={{ bgcolor: theme.palette.grey[50] }}>
                                <TableRow>
                                    <TableCell>Code article</TableCell>
                                    <TableCell>Libellé article</TableCell>
                                    <TableCell>Quantité</TableCell>
                                    <TableCell sx={{ color: 'error.main', fontWeight: 'bold' }}>
                                        Référence en doute?
                                    </TableCell>
                                    <TableCell>Détails</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {cartItems.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                                            <Typography variant="h5" color="textSecondary">Votre panier est actuellement vide.</Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    cartItems.map((item) => (
                                        <TableRow key={item.id} hover>
                                            <TableCell>{item.number}</TableCell>
                                            <TableCell>
                                                <Typography variant="body1">{item.description}</Typography>
                                                <Typography variant="caption" color="textSecondary">Fournisseur: {item.vendorName || item.vendorNumber}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body1">{item.quantity}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Checkbox
                                                    color="primary"
                                                    checked={item.isAdaptable || false}
                                                    onChange={(e) => handleToggleAdaptable(item, e.target.checked)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Stack direction="row" spacing={1}>
                                                    <IconButton size="small" sx={{ color: 'info.main', bgcolor: theme.palette.info.lighter }} onClick={() => setInfoItem(item)}>
                                                        <InfoCircle size={18} variant="Bold" />
                                                    </IconButton>
                                                    <IconButton size="small" sx={{ color: 'secondary.main', bgcolor: theme.palette.secondary.lighter }} onClick={() => handleOpenEdit(item)}>
                                                        <Edit2 size={18} variant="Bold" />
                                                    </IconButton>
                                                    <IconButton size="small" sx={{ color: 'error.main', bgcolor: theme.palette.error.lighter }} onClick={() => setDeleteItem(item)}>
                                                        <CloseCircle size={18} variant="Bold" />
                                                    </IconButton>
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {cartItems.length > 0 && (
                        <Box sx={{ p: 3, pt: 1 }}>
                            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'flex-end' }} spacing={3}>
                                {/* DOSSIER ASSURANCE & BUTTONS */}
                                <Stack spacing={2}>
                                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                                        Lignes 1 à {cartItems.length} sur {cartItems.length}
                                    </Typography>

                                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ width: '100%' }}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={isDossierChecked}
                                                    onChange={handleDossierCheck}
                                                    sx={{ '& .MuiSvgIcon-root': { fontSize: 24, borderRadius: 0 }, color: 'error.main', '&.Mui-checked': { color: 'error.main' } }}
                                                />
                                            }
                                            label={
                                                <Typography variant="h4" color="error.main" sx={{ fontWeight: 'bold' }}>
                                                    Dossier assurance ?
                                                </Typography>
                                            }
                                        />
                                    </Stack>

                                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                                        {isPlexusPec && (
                                            selectedDevis ? (
                                                <Stack spacing={0.25}>
                                                    <Chip
                                                        color="primary"
                                                        variant="outlined"
                                                        label={`Devis ${selectedDevis.number}`}
                                                        onDelete={() => { setSelectedDevis(null); setDevisPrefill([]); }}
                                                        onClick={() => setIsDevisPickerOpen(true)}
                                                    />
                                                    {devisPrefill.length > 0 && (
                                                        <Typography variant="caption" color="text.secondary">
                                                            {devisPrefill.join(' et ')} repris du devis
                                                            {devisPrefill.includes('VIN') && !isDossierChecked
                                                                ? " — le VIN part avec le dossier assurance"
                                                                : ''}
                                                        </Typography>
                                                    )}
                                                </Stack>
                                            ) : (
                                                <Button
                                                    variant="outlined"
                                                    color="primary"
                                                    onClick={() => setIsDevisPickerOpen(true)}
                                                    disabled={loading}
                                                    startIcon={<DocumentText variant="Bold" />}
                                                    sx={{ borderWidth: 1, '&:hover': { borderWidth: 1 } }}
                                                >
                                                    Assigner devis
                                                </Button>
                                            )
                                        )}
                                        <Button
                                            variant="outlined"
                                            color="success"
                                            onClick={() => handleValidation('demande')}
                                            disabled={loading}
                                            startIcon={<DocumentText variant="Bold" />}
                                            sx={{ borderWidth: 1, '&:hover': { borderWidth: 1 } }}
                                        >
                                            Demander
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            onClick={() => handleValidation('devis')}
                                            disabled={loading}
                                            startIcon={<DocumentText variant="Bold" />}
                                            sx={{ borderWidth: 1, '&:hover': { borderWidth: 1 } }}
                                        >
                                            Devis
                                        </Button>
                                    </Stack>
                                </Stack>

                                {/* TOTAL */}
                                <Stack direction="row" alignItems="center" spacing={2} sx={{ alignSelf: 'flex-end' }}>
                                    <Typography variant="h5" color="secondary.dark" sx={{ fontWeight: 'bold' }}>Somme panier :</Typography>
                                    <Box sx={{ bgcolor: theme.palette.grey[100], p: 1.5, borderRadius: 1, minWidth: 150, textAlign: 'right', border: `1px solid ${theme.palette.divider}` }}>
                                        <Typography variant="h5">{totalPrice.toFixed(2).replace('.', ',')}</Typography>
                                    </Box>
                                </Stack>
                            </Stack>
                        </Box>
                    )}
                </MainCard>
            </Box>

            {/* CHASSIS NUMBER MODAL - ENHANCED DESIGN */}
            <Dialog
                open={isChassisModalOpen}
                onClose={() => {
                    setIsChassisModalOpen(false);
                    setTempChassisNo('');
                }}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        boxShadow: theme.customShadows.z1,
                        overflow: 'hidden'
                    }
                }}
            >
                <DialogTitle sx={{
                    bgcolor: 'error.main',
                    color: 'white',
                    fontWeight: 'bold',
                    py: 3,
                    textAlign: 'center',
                    position: 'relative'
                }}>
                    Veuillez saisir le numéro de Chassis :
                    <Box
                        sx={{
                            position: 'absolute',
                            bottom: -20,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            bgcolor: 'white',
                            borderRadius: '50%',
                            p: 0.5,
                            boxShadow: theme.customShadows.z1
                        }}
                    >
                        <Box
                            sx={{
                                bgcolor: 'error.lighter',
                                color: 'error.main',
                                borderRadius: '50%',
                                width: 40,
                                height: 40,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <DocumentText size={24} variant="Bold" />
                        </Box>
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ p: 5, pt: 0 }}>
                    <Stack spacing={3} sx={{ mt: 6 }}>
                        <Typography variant="body1" color="textSecondary" textAlign="center" sx={{ px: 2, mt: 2 }}>
                            Certaines références de votre commande sont marquées comme "En doute".
                            Veuillez renseigner le numéro de chassis du véhicule concerné pour validation.
                        </Typography>
                        <TextField
                            fullWidth
                            placeholder="Entrez le numéro de chassis (17 caractères)..."
                            value={tempChassisNo}
                            onChange={(e) => setTempChassisNo(e.target.value.toUpperCase())}
                            variant="outlined"
                            autoFocus
                            inputProps={{ maxLength: 17 }}
                            error={tempChassisNo.length > 0 && tempChassisNo.length !== 17}
                            helperText={tempChassisNo.length > 0 && tempChassisNo.length !== 17 ? "Le numéro de chassis doit comporter exactement 17 caractères" : ""}
                            InputProps={{
                                sx: { borderRadius: 2, height: 56, fontSize: '1.1rem', letterSpacing: 1 },
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <InfoCircle size={20} color={theme.palette.error.main} />
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 4, pt: 0, justifyContent: 'center', gap: 3 }}>
                    <Button
                        variant="text"
                        color="secondary"
                        onClick={() => {
                            setIsChassisModalOpen(false);
                            setTempChassisNo('');
                        }}
                        sx={{ fontWeight: 'bold' }}
                    >
                        Annuler
                    </Button>
                    <Button
                        variant="contained"
                        disabled={tempChassisNo.length !== 17}
                        sx={{
                            borderRadius: 10,
                            px: 5,
                            py: 1.5,
                            bgcolor: 'success.main',
                            boxShadow: '0 4px 14px 0 rgba(0,183,110,0.39)',
                            '&:hover': { bgcolor: 'success.dark', boxShadow: '0 6px 20px rgba(0,183,110,0.23)' },
                            '&.Mui-disabled': {
                                bgcolor: 'grey.200',
                                color: 'text.disabled',
                                opacity: 0.8
                            }
                        }}
                        onClick={handleConfirmChassis}
                    >
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                            <Box
                                component="span"
                                sx={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: 24,
                                    height: 24,
                                    bgcolor: tempChassisNo.length === 17 ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.05)',
                                    borderRadius: '50%',
                                    color: tempChassisNo.length === 17 ? 'white' : 'text.disabled'
                                }}
                            >
                                <ArrowRight2 size={16} />
                            </Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: tempChassisNo.length === 17 ? 'white' : 'text.disabled' }}>
                                Confirmer Votre Demande
                            </Typography>
                        </Stack>
                    </Button>
                </DialogActions>
            </Dialog>

            {/* DOSSIER ASSURANCE MODAL */}
            <Dialog open={isModalOpen} onClose={handleCancelDossier} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ color: 'error.main', fontWeight: 'bold', borderBottom: `1px solid ${theme.palette.divider}` }}>
                    Veuillez saisir les informations ci-dessous :
                </DialogTitle>
                <DialogContent sx={{ p: 4 }}>
                    <Box component="form">
                        <Stack spacing={3} sx={{ pt: 4 }}>
                            <Box sx={{ width: '100%' }}>
                                <Stack direction="row" alignItems="center" spacing={2}>
                                    <Typography variant="body1" sx={{ width: 150, color: 'text.secondary' }}>Assurance</Typography>
                                    <TextField
                                        select
                                        fullWidth
                                        size="small"
                                        value={dossierData.InsuranceName}
                                        onChange={(e) => setDossierData({ ...dossierData, InsuranceName: e.target.value })}
                                        error={!dossierData.InsuranceName}
                                        helperText={!dossierData.InsuranceName ? "Veuillez sélectionner une assurance" : ""}
                                    >
                                        <MenuItem value="STAR ASSURANCE">STAR ASSURANCE</MenuItem>
                                        <MenuItem value="MAE ASSURANCE">MAE ASSURANCE</MenuItem>
                                        <MenuItem value="MAWDY">MAWDY</MenuItem>
                                    </TextField>
                                </Stack>
                            </Box>

                            {dossierData.InsuranceName !== 'MAWDY' && (
                                <Box sx={{ width: '100%' }}>
                                    <Stack direction="row" alignItems="center" spacing={2}>
                                        <Typography variant="body1" sx={{ width: 150, color: 'text.secondary' }}>N° Sinistre</Typography>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            value={dossierData.SinitreNumber}
                                            onChange={(e) => setDossierData({ ...dossierData, SinitreNumber: e.target.value })}
                                            error={!dossierData.SinitreNumber.trim()}
                                            helperText={!dossierData.SinitreNumber.trim() ? "Le numéro de sinistre est obligatoire" : ""}
                                        />
                                    </Stack>
                                </Box>
                            )}
                            <Box sx={{ width: '100%' }}>
                                <Stack direction="row" alignItems="center" spacing={2}>
                                    <Typography variant="body1" sx={{ width: 150, color: 'text.secondary' }}>N° Immatriculation</Typography>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        value={dossierData.RegistrationNumber}
                                        onChange={(e) => setDossierData({ ...dossierData, RegistrationNumber: e.target.value })}
                                        error={!dossierData.RegistrationNumber.trim()}
                                        helperText={!dossierData.RegistrationNumber.trim() ? "Le numéro d'immatriculation est obligatoire" : ""}
                                    />
                                </Stack>
                            </Box>
                            <Box sx={{ width: '100%' }}>
                                <Stack direction="row" alignItems="center" spacing={2}>
                                    <Typography variant="body1" sx={{ width: 150, color: 'text.secondary' }}>VIN</Typography>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        value={dossierData.VIN}
                                        onChange={(e) => setDossierData({ ...dossierData, VIN: e.target.value.toUpperCase() })}
                                        inputProps={{ maxLength: 17 }}
                                        error={dossierData.VIN.length !== 17}
                                        helperText={
                                            dossierData.VIN.length === 0
                                                ? "Le numéro VIN est obligatoire"
                                                : dossierData.VIN.length !== 17
                                                    ? "Le VIN doit comporter exactement 17 caractères"
                                                    : ""
                                        }
                                    />
                                </Stack>
                            </Box>
                            {dossierData.InsuranceName === 'MAWDY' && (
                                <Box sx={{ width: '100%' }}>
                                    <Stack direction="row" alignItems="center" spacing={2}>
                                        <Typography variant="body1" sx={{ width: 150, color: 'text.secondary' }}>Assurée :</Typography>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            placeholder="Assurée : ..."
                                            value={dossierData.InsuredName}
                                            onChange={(e) => setDossierData({ ...dossierData, InsuredName: e.target.value })}
                                            error={!dossierData.InsuredName.trim()}
                                            helperText={!dossierData.InsuredName.trim() ? "Le champ Assurée est obligatoire pour MAWDY" : ""}
                                        />
                                    </Stack>
                                </Box>
                            )}
                        </Stack>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0, justifyContent: 'center', gap: 2 }}>
                    <Button
                        variant="contained"
                        color="success"
                        onClick={handleConfirmDossier}
                        disabled={!isInsuranceDossierValid}
                        startIcon={<ArrowRight2 />}
                        sx={{ borderRadius: 1, px: 4 }}
                    >
                        Confirmer votre demande
                    </Button>
                    <Button variant="outlined" color="error" onClick={handleCancelDossier} startIcon={<CloseCircle />} sx={{ borderRadius: 1, px: 4 }}>
                        Annuler
                    </Button>
                </DialogActions>
            </Dialog>

            {/* INFO MODAL */}
            <Dialog open={!!infoItem} onClose={() => setInfoItem(null)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ color: 'primary.main', fontWeight: 'bold', borderBottom: `1px solid ${theme.palette.divider}` }}>
                    Détails de l'article
                </DialogTitle>
                <DialogContent sx={{ p: 4 }}>
                    {infoItem && (
                        <Stack spacing={3} sx={{ pt: 4 }}>
                            <Box sx={{ width: '100%' }}>
                                <Stack direction="row" alignItems="center" spacing={2}>
                                    <Typography variant="body1" sx={{ width: 150, color: 'text.secondary' }}>Code article</Typography>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        value={infoItem.number}
                                        InputProps={{ readOnly: true }}
                                    />
                                </Stack>
                            </Box>
                            <Box sx={{ width: '100%' }}>
                                <Stack direction="row" alignItems="center" spacing={2}>
                                    <Typography variant="body1" sx={{ width: 150, color: 'text.secondary' }}>Désignation</Typography>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        value={infoItem.description}
                                        InputProps={{ readOnly: true }}
                                    />
                                </Stack>
                            </Box>
                            <Box sx={{ width: '100%' }}>
                                <Stack direction="row" alignItems="center" spacing={2}>
                                    <Typography variant="body1" sx={{ width: 150, color: 'text.secondary' }}>Fournisseur</Typography>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        value={infoItem.vendorName || infoItem.vendorNumber}
                                        InputProps={{ readOnly: true }}
                                    />
                                </Stack>
                            </Box>
                            <Box sx={{ width: '100%' }}>
                                <Stack direction="row" alignItems="center" spacing={2}>
                                    <Typography variant="body1" sx={{ width: 150, color: 'text.secondary' }}>Prix Unitaire</Typography>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        value={`${infoItem.price.toFixed(3)} TND`}
                                        InputProps={{ readOnly: true }}
                                    />
                                </Stack>
                            </Box>
                            <Box sx={{ width: '100%' }}>
                                <Stack direction="row" alignItems="center" spacing={2}>
                                    <Typography variant="body1" sx={{ width: 150, color: 'text.secondary' }}>Quantité</Typography>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        value={infoItem.quantity}
                                        InputProps={{ readOnly: true }}
                                    />
                                </Stack>
                            </Box>
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0, justifyContent: 'center' }}>
                    <Button variant="outlined" color="error" onClick={() => setInfoItem(null)} startIcon={<CloseCircle />} sx={{ borderRadius: 1, px: 4 }}>
                        Fermer
                    </Button>
                </DialogActions>
            </Dialog>

            {/* EDIT MODAL */}
            <Dialog open={!!editItem} onClose={() => setEditItem(null)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ color: 'secondary.main', fontWeight: 'bold', borderBottom: `1px solid ${theme.palette.divider}` }}>
                    Modifier la quantité de l'article :
                </DialogTitle>
                <DialogContent sx={{ p: 4 }}>
                    {editItem && (
                        <Stack spacing={3} sx={{ pt: 4 }}>
                            <Box sx={{ width: '100%' }}>
                                <Stack direction="row" alignItems="center" spacing={2}>
                                    <Typography variant="body1" sx={{ width: 150, color: 'text.secondary' }}>Article</Typography>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        value={`${editItem.number} - ${editItem.description}`}
                                        InputProps={{ readOnly: true }}
                                    />
                                </Stack>
                            </Box>
                            <Box sx={{ width: '100%' }}>
                                <Stack direction="row" alignItems="center" spacing={2}>
                                    <Typography variant="body1" sx={{ width: 150, color: 'text.secondary' }}>Quantité</Typography>
                                    <TextField
                                        fullWidth
                                        type="number"
                                        size="small"
                                        value={editQuantity}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val === '') {
                                                setEditQuantity('');
                                            } else {
                                                const parsed = parseInt(val);
                                                setEditQuantity(isNaN(parsed) ? '' : parsed);
                                            }
                                        }}
                                    />
                                </Stack>
                            </Box>
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0, justifyContent: 'center', gap: 2 }}>
                    <Button variant="contained" color="success" onClick={handleConfirmEdit} startIcon={<ArrowRight2 />} sx={{ borderRadius: 1, px: 4 }}>
                        Enregistrer
                    </Button>
                    <Button variant="outlined" color="error" onClick={() => setEditItem(null)} startIcon={<CloseCircle />} sx={{ borderRadius: 1, px: 4 }}>
                        Annuler
                    </Button>
                </DialogActions>
            </Dialog>

            {/* DELETE MODAL */}
            <Dialog open={!!deleteItem} onClose={() => setDeleteItem(null)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold', color: 'error.main', textAlign: 'center' }}>
                    Confirmer la suppression
                </DialogTitle>
                <DialogContent sx={{ textAlign: 'center', py: 2 }}>
                    <Typography variant="body1">
                        Êtes-vous sûr de vouloir retirer l'article
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', my: 1 }}>{deleteItem?.number}</Typography>
                    <Typography variant="body1">de votre panier ?</Typography>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0, justifyContent: 'center', gap: 2 }}>
                    <Button variant="contained" color="error" onClick={handleConfirmDelete} sx={{ borderRadius: 1, px: 3 }}>
                        Oui, Supprimer
                    </Button>
                    <Button variant="outlined" color="secondary" onClick={() => setDeleteItem(null)} sx={{ borderRadius: 1, px: 3 }}>
                        Non, Annuler
                    </Button>
                </DialogActions>
            </Dialog>

            {isPlexusPec && (
                <AssignDevisDialog
                    open={isDevisPickerOpen}
                    onClose={() => setIsDevisPickerOpen(false)}
                    onSelect={handleDevisSelected}
                />
            )}
        </Box>
    );
}
