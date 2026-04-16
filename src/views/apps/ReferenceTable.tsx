'use client';

import { useState, useCallback, useEffect } from 'react';
import {
    Stack,
    Box,
    Typography,
    TextField,
    Autocomplete,
    Select,
    MenuItem,
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
    Grid,
    InputAdornment,
    SelectChangeEvent
} from '@mui/material';

// third-party
import { motion, AnimatePresence } from 'framer-motion';
import {
    Add,
    Trash,
    TickCircle,
    NoteAdd,
    Global
} from '@wandersonalwes/iconsax-react';

// project-imports
import MainCard from 'components/MainCard';
import { fetchVendors, saveReferences } from 'app/api/services/ReferenceService';

interface ReferenceLine {
    id: string;
    reference: string;
    designation: string;
    marque: string;
}

interface Vendor {
    number: string;
    displayName: string;
}

const BRANDS = [
    { value: 'AUTRES', label: 'Autres' },
    { value: 'BMW', label: 'Bmw' },
    { value: 'FORD', label: 'Ford' },
    { value: 'HYUNDAI', label: 'HYUNDAI' },
    { value: 'FIAT', label: 'Groupe Fiat /Alpha Romeo /Lancia/jeep' },
    { value: 'IVECO', label: 'IVECO' },
    { value: 'KIA', label: 'Groupe Kia / Hyundai' },
    { value: 'MAZDA', label: 'Mazda' },
    { value: 'MERCEDES', label: 'Mercedes' },
    { value: 'MITSUBISHI', label: 'Mitsubishi' },
    { value: 'NISSAN', label: 'Nissan' },
    { value: 'OPEL', label: 'Opel' },
    { value: 'PEUGEOT', label: 'Peugeot / Citroën' },
    { value: 'PLEXUS', label: 'PLEXUS' },
    { value: 'PORSCHE', label: 'PORSCHE' },
    { value: 'RENAULT', label: 'Renault / Dacia' },
    { value: 'SUZUKI', label: 'SUZUKI' },
    { value: 'TOYOTA', label: 'Toyota' },
    { value: 'AUDI', label: 'Groupe Audi / Seat / Skoda / Volkswagen' }
];

export default function ReferenceTablePage() {
    const theme = useTheme();
    const [rows, setRows] = useState<ReferenceLine[]>([
        { id: '1', reference: '', designation: '', marque: '' },
        { id: '2', reference: '', designation: '', marque: '' },
        { id: '3', reference: '', designation: '', marque: '' },
        { id: '4', reference: '', designation: '', marque: '' }
    ]);

    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [selectedVendor, setSelectedVendor] = useState<string>('');
    const [loadingVendors, setLoadingVendors] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Fetch vendors on mount
    useEffect(() => {
        const loadVendors = async () => {
            try {
                const data = await fetchVendors();
                console.log('API Response:', data);

                // FIXED VENDOR MAPPING: Ensuring number/ID is correctly captured
                const vendorList = (data.value || []).map((v: any) => {
                    // Correct fournisseur ID is v.no
                    const id = v.no || v.No || v.number || v.id;
                    const name = v.name || v.displayName || v.Name || v.displayName2 || id;
                    return {
                        number: id,
                        displayName: name
                    };
                });

                console.log('Mapped Vendors:', vendorList);
                setVendors(vendorList);
            } catch (err) {
                console.error('Error fetching vendors:', err);
                setError('Erreur lors du chargement des fournisseur');
            } finally {
                setLoadingVendors(false);
            }
        };
        loadVendors();
    }, []);

    const updateRow = useCallback((id: string, key: keyof ReferenceLine, value: string) => {
        setRows(prev => prev.map(row => row.id === id ? { ...row, [key]: value } : row));
    }, []);

    const addRow = useCallback(() => {
        setRows(prev => [...prev, { id: Date.now().toString(), reference: '', designation: '', marque: '' }]);
    }, []);

    const removeRow = useCallback((id: string) => {
        setRows(prev => prev.length > 1 ? prev.filter(row => row.id !== id) : prev);
    }, []);

    const handleSave = async () => {
        console.log('Attempting to save with vendor:', selectedVendor);

        if (!selectedVendor) {
            setError('Veuillez sélectionner un fournisseur avant d’ajouter.');
            return;
        }

        const validRows = rows.filter(r => r.reference.trim() !== '' || r.designation.trim() !== '');
        if (validRows.length === 0) {
            setError('Veuillez remplir au moins une ligne (Réf ou Désignation).');
            return;
        }

        setSaving(true);
        setError(null);
        try {
            await saveReferences({
                vendorNumber: selectedVendor,
                items: validRows.map(({ reference, designation, marque }) => ({ reference, designation, marque }))
            });
            setSuccess(true);
            setRows([
                { id: '1', reference: '', designation: '', marque: '' },
                { id: '2', reference: '', designation: '', marque: '' },
                { id: '3', reference: '', designation: '', marque: '' },
                { id: '4', reference: '', designation: '', marque: '' }
            ]);
            // Keep the vendor selected for next batch? Or reset? User choice. Keeping for now.
        } catch (err: any) {
            setError(err.response?.data?.error?.message || 'Erreur lors de l’enregistrement.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Stack spacing={4}>
            {/* MINIMALIST HEADER BAR */}
            <MainCard sx={{ borderRadius: 3, boxShadow: theme.customShadows.z1 }}>
                <Grid container spacing={3} alignItems="center">
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}>
                                <NoteAdd variant="Bold" size={28} />
                            </Box>
                            <Box>
                                <Typography variant="h3" fontWeight={900}>Ajout de Références</Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>GESTION DES ARTICLES • PLEXUS AUTOMATIVE</Typography>
                            </Box>
                        </Stack>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Stack direction="row" spacing={2} alignItems="center" justifyContent={{ md: 'flex-end' }}>
                            <Box sx={{ width: '100%', maxWidth: 400 }}>
                                <Typography variant="caption" fontWeight={800} color="error.main" sx={{ mb: 0.5, display: 'block' }}>FOURNISSEUR OBLIGATOIRE *</Typography>
                                <Autocomplete
                                    fullWidth
                                    size="small"
                                    options={vendors}
                                    getOptionLabel={(option) => option.displayName || ''}
                                    value={vendors.find((v) => v.number === selectedVendor) || null}
                                    onChange={(_, value) => setSelectedVendor(value?.number || '')}
                                    loading={loadingVendors}
                                    disabled={loadingVendors}
                                    isOptionEqualToValue={(option, value) => option.number === value.number}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            placeholder={loadingVendors ? 'Sincronisation...' : 'Sélectionner le fournisseur'}
                                            size="small"
                                            variant="outlined"
                                            InputProps={{
                                                ...params.InputProps,
                                                sx: {
                                                    borderRadius: 2,
                                                    fontWeight: 800,
                                                    bgcolor: alpha(theme.palette.grey[100], 0.3),
                                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider }
                                                },
                                                endAdornment: (
                                                    <>
                                                        {loadingVendors ? <CircularProgress color="inherit" size={20} /> : null}
                                                        {params.InputProps.endAdornment}
                                                    </>
                                                )
                                            }}
                                        />
                                    )}
                                />
                            </Box>
                        </Stack>
                    </Grid>
                </Grid>
            </MainCard>

            {/* THE "PREMIUM DOCUMENT" TABLE */}
            <MainCard content={false} sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: theme.customShadows.z1 }}>
                <TableContainer>
                    <Table size="medium">
                        <TableHead>
                            <TableRow sx={{ bgcolor: alpha(theme.palette.grey[50], 0.8) }}>
                                <TableCell sx={{ color: 'error.main', fontWeight: '900', py: 2.5, pl: 4 }}>RÉFÉRENCE *</TableCell>
                                <TableCell sx={{ color: 'error.main', fontWeight: '900', py: 2.5 }}>DÉSIGNATION *</TableCell>
                                <TableCell sx={{ color: 'error.main', fontWeight: '900', py: 2.5 }}>MARQUE *</TableCell>
                                <TableCell align="center" sx={{ width: 80, pr: 4 }}></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <AnimatePresence mode="popLayout">
                                {rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        component={motion.tr}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        sx={{ '&:hover': { bgcolor: alpha(theme.palette.primary.lighter, 0.05) } }}
                                    >
                                        <TableCell sx={{ pl: 4, py: 2 }}>
                                            <TextField
                                                fullWidth
                                                size="small"
                                                variant="outlined"
                                                placeholder="Saisir la réf..."
                                                value={row.reference}
                                                onChange={(e) => updateRow(row.id, 'reference', e.target.value)}
                                                InputProps={{ sx: { borderRadius: 1.5, fontWeight: 700 } }}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ py: 2 }}>
                                            <TextField
                                                fullWidth
                                                size="small"
                                                variant="outlined"
                                                placeholder="Saisir la désignation..."
                                                value={row.designation}
                                                onChange={(e) => updateRow(row.id, 'designation', e.target.value)}
                                                InputProps={{ sx: { borderRadius: 1.5, fontWeight: 700 } }}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ py: 2 }}>
                                            <Select
                                                fullWidth
                                                size="small"
                                                value={row.marque}
                                                onChange={(e: SelectChangeEvent) => updateRow(row.id, 'marque', e.target.value as string)}
                                                displayEmpty
                                                sx={{
                                                    borderRadius: 1.5,
                                                    fontWeight: 700,
                                                    '& .MuiSelect-select': { display: 'flex', alignItems: 'center' }
                                                }}
                                                startAdornment={
                                                    <InputAdornment position="start" sx={{ mr: 1, opacity: 0.6 }}>
                                                        <Global size={18} />
                                                    </InputAdornment>
                                                }
                                            >
                                                <MenuItem value=""><em>Marque...</em></MenuItem>
                                                {BRANDS.map(b => (
                                                    <MenuItem key={b.value} value={b.value}>{b.label}</MenuItem>
                                                ))}
                                            </Select>
                                        </TableCell>
                                        <TableCell align="center" sx={{ pr: 4, py: 2 }}>
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

                {/* TABLE FOOTER ACTIONS */}
                <Box sx={{ p: 4, bgcolor: alpha(theme.palette.grey[50], 0.5) }}>
                    <Grid container justifyContent="space-between" alignItems="center">
                        <Grid size="auto">
                            <Button
                                variant="outlined"
                                color="secondary"
                                startIcon={<Add />}
                                onClick={addRow}
                                sx={{ borderRadius: 2, fontWeight: 800, px: 3 }}
                            >
                                AJOUTER UNE LIGNE
                            </Button>
                        </Grid>
                        <Grid size="auto">
                            <Stack direction="row" spacing={3} alignItems="center">
                                <Box sx={{ textAlign: 'right' }}>
                                    <Typography variant="caption" color="text.secondary" fontWeight={800}>ARTICLES À ENREGISTRER</Typography>
                                    <Typography variant="h4" fontWeight={900}>{rows.length}</Typography>
                                </Box>
                                <Button
                                    variant="contained"
                                    color="success"
                                    size="large"
                                    onClick={handleSave}
                                    disabled={saving}
                                    startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <TickCircle variant="Bold" />}
                                    sx={{
                                        borderRadius: 2.5,
                                        px: 6,
                                        py: 1.5,
                                        fontWeight: 900,
                                        fontSize: '1rem',
                                        boxShadow: `0 8px 32px ${alpha(theme.palette.success.main, 0.2)}`
                                    }}
                                >
                                    {saving ? 'EN COURS...' : 'AJOUTER'}
                                </Button>
                            </Stack>
                        </Grid>
                    </Grid>
                </Box>
            </MainCard>

            {/* FEEDBACK OVERLAYS */}
            <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                <Alert severity="error" variant="filled" onClose={() => setError(null)} sx={{ borderRadius: 2, fontWeight: 700 }}>{error}</Alert>
            </Snackbar>
            <Snackbar open={success} autoHideDuration={6000} onClose={() => setSuccess(false)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                <Alert severity="success" variant="filled" onClose={() => setSuccess(false)} sx={{ borderRadius: 2, fontWeight: 700, bgcolor: 'success.main' }}>
                    Félicitation ! Vos articles ont été ajoutés avec succès.
                </Alert>
            </Snackbar>
        </Stack>
    );
}