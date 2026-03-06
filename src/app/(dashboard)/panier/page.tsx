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

// icons
import { Trash, InfoCircle, Edit2, DocumentText, SearchNormal1, CloseCircle, ArrowRight2 } from '@wandersonalwes/iconsax-react';

// context
import { useCart } from 'contexts/CartContext';

export default function PanierPage() {
    const theme = useTheme();
    const { data: session } = useSession();
    const { cartItems, totalPrice, removeFromCart, updateQuantity, clearCart } = useCart();

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
        Insurancefile: true
    });

    // Action modals state
    const [infoItem, setInfoItem] = useState<any>(null);
    const [editItem, setEditItem] = useState<any>(null);
    const [deleteItem, setDeleteItem] = useState<any>(null);
    const [editQuantity, setEditQuantity] = useState<number>(0);

    const handleDossierCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        if (checked) {
            setIsModalOpen(true);
        } else {
            setIsDossierChecked(false);
        }
    };

    const handleConfirmDossier = () => {
        setIsDossierChecked(true);
        setIsModalOpen(false);
    };

    const handleCancelDossier = () => {
        setIsDossierChecked(false);
        setIsModalOpen(false);
    };

    const handleOpenEdit = (item: any) => {
        setEditItem(item);
        setEditQuantity(item.quantity);
    };

    const handleConfirmEdit = () => {
        if (editItem) {
            updateQuantity(editItem.id, editQuantity);
            setEditItem(null);
        }
    };

    const handleConfirmDelete = () => {
        if (deleteItem) {
            removeFromCart(deleteItem.id);
            setDeleteItem(null);
        }
    };

    const handleValidation = async (type: 'demande' | 'devis') => {
        if (cartItems.length === 0) return;

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

            for (const [vendorNumber, items] of Object.entries(itemsByVendor)) {
                console.log("vendorNumber", session?.user);
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
                        description: item.description
                    })),
                    ...(isDossierChecked ? dossierData : {})
                };

                const response = await axiosServices.post('http://localhost:8080/api/purchase-orders/bulk', payload, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                const orderData = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
                if (!firstOrderData) firstOrderData = orderData;

                if (type === 'devis') {
                    allLinesForDevis.push(...payload.lines);
                }
            }

            if (type === 'devis' && firstOrderData) {
                // Generate and download ONE consolidated Devis PDF
                const pdfRes = await axiosServices.post('http://localhost:8080/api/purchase-orders/generate-devis', {
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

            setSuccess(`Votre ${type === 'devis' ? 'devis' : 'commande'} a été ${type === 'devis' ? 'créé' : 'créée'} avec succès !`);

            if (type === 'demande') {
                clearCart();
            }

            // Reset Dossier assurance
            setIsDossierChecked(false);
            setDossierData({ InsuranceName: 'STAR ASSURANCE', SinitreNumber: '', RegistrationNumber: '', VIN: '', InsuranceCode: 0, Insurancefile: true });
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
                                                <Checkbox color="primary" />
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

                                    <Stack direction="row" spacing={1}>
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
                                    >
                                        <MenuItem value="STAR ASSURANCE">STAR ASSURANCE</MenuItem>
                                    </TextField>
                                </Stack>
                            </Box>
                            <Box sx={{ width: '100%' }}>
                                <Stack direction="row" alignItems="center" spacing={2}>
                                    <Typography variant="body1" sx={{ width: 150, color: 'text.secondary' }}>N° Sinistre</Typography>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        value={dossierData.SinitreNumber}
                                        onChange={(e) => setDossierData({ ...dossierData, SinitreNumber: e.target.value })}
                                    />
                                </Stack>
                            </Box>
                            <Box sx={{ width: '100%' }}>
                                <Stack direction="row" alignItems="center" spacing={2}>
                                    <Typography variant="body1" sx={{ width: 150, color: 'text.secondary' }}>N° Immatriculation</Typography>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        value={dossierData.RegistrationNumber}
                                        onChange={(e) => setDossierData({ ...dossierData, RegistrationNumber: e.target.value })}
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
                                        onChange={(e) => setDossierData({ ...dossierData, VIN: e.target.value })}
                                    />
                                </Stack>
                            </Box>
                        </Stack>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0, justifyContent: 'center', gap: 2 }}>
                    <Button variant="contained" color="success" onClick={handleConfirmDossier} startIcon={<ArrowRight2 />} sx={{ borderRadius: 1, px: 4 }}>
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
                                        onChange={(e) => setEditQuantity(parseInt(e.target.value) || 1)}
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
        </Box>
    );
}
