'use client';

import { useState } from 'react';
import { useIntl } from 'react-intl';
import {
    Stack,
    Box,
    Typography,
    Button,
    Alert,
    Grid,
    useTheme,
    alpha,
} from '@mui/material';
import MainCard from 'components/MainCard';
import { DocumentUpload, ExportSquare, TruckFast } from '@wandersonalwes/iconsax-react';
import axios from 'utils/axios';
import { openSnackbar } from 'api/snackbar';
import { CircularProgress } from '@mui/material';

export default function ImportArticles() {
    const theme = useTheme();
    const intl = useIntl();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileUpload = async (mode: 'all' | 'stock') => {
        if (!selectedFile) {
            openSnackbar({
                open: true,
                message: 'Merci de choisir un fichier',
                variant: 'alert',
                alert: { color: 'error' },
                close: true
            });
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('mode', mode);

        try {
            await axios.post('/api/articles/import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            openSnackbar({
                open: true,
                message: 'Importation réussie!',
                variant: 'alert',
                alert: { color: 'success' },
                close: true
            });
            setSelectedFile(null);
        } catch (error: any) {
            openSnackbar({
                open: true,
                message: error.message || 'Échec de l\'importation',
                variant: 'alert',
                alert: { color: 'error' },
                close: true
            });
        } finally {
            setIsUploading(false);
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setSelectedFile(event.target.files[0]);
        }
    };

    const handleDownloadTemplate = () => {
        const headers = ['CodeArticle', 'CodeFrs', 'Designation', 'Prix', 'Qte'];
        const csvContent = '\uFEFF' + headers.join(';') + '\n';
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'modele_articles.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <Stack spacing={4}>
            <MainCard sx={{ borderRadius: 3, boxShadow: theme.customShadows.z1 }}>
                <Grid container spacing={4}>
                    {/* LEFT COLUMN: Download Template */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Stack spacing={3}>
                            <Typography variant="h4" color="error" fontWeight={800}>
                                {intl.formatMessage({ id: 'download-excel-template', defaultMessage: '1) Télécharger le modèle Excel' })}
                            </Typography>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Typography variant="body1" color="text.secondary" fontWeight={500}>
                                    {intl.formatMessage({ id: 'file-format', defaultMessage: 'Télécharger le format:' })}
                                </Typography>
                                <Button
                                    variant="outlined"
                                    color="success"
                                    onClick={handleDownloadTemplate}
                                    startIcon={<ExportSquare variant="Bold" />}
                                    sx={{
                                        borderRadius: 2,
                                        fontWeight: 700,
                                        textTransform: 'none',
                                        borderWidth: 1.5,
                                        px: 3,
                                        py: 1,
                                        '&:hover': { borderWidth: 1.5, backgroundColor: alpha(theme.palette.success.main, 0.05) }
                                    }}
                                >
                                    {intl.formatMessage({ id: 'export-excel', defaultMessage: 'Exporter Fichier Excel' })}
                                </Button>
                            </Stack>
                        </Stack>
                    </Grid>

                    {/* RIGHT COLUMN: Upload and Process File */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Stack spacing={3}>
                            <Typography variant="h4" color="success.main" fontWeight={800}>
                                {intl.formatMessage({ id: 'add-excel-file', defaultMessage: '2) Ajouter votre fichier Excel' })}
                            </Typography>

                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems={{ sm: 'center' }}>
                                <Box>
                                    <Button
                                        variant="outlined"
                                        component="label"
                                        color="secondary"
                                        sx={{
                                            textTransform: 'none',
                                            borderRadius: 1.5,
                                            borderColor: theme.palette.grey[400],
                                            color: theme.palette.text.primary,
                                            fontWeight: 600,
                                            bgcolor: theme.palette.grey[100],
                                            mr: 2,
                                            '&:hover': {
                                                bgcolor: theme.palette.grey[200],
                                                borderColor: theme.palette.grey[500]
                                            }
                                        }}
                                    >
                                        Choose file
                                        <input
                                            type="file"
                                            hidden
                                            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                                            onChange={handleFileChange}
                                        />
                                    </Button>
                                    <Typography variant="caption" color="text.secondary">
                                        {selectedFile ? selectedFile.name : 'No file chosen'}
                                    </Typography>
                                </Box>

                                <Stack spacing={2} sx={{ minWidth: 200 }}>
                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        disabled={isUploading}
                                        onClick={() => handleFileUpload('all')}
                                        startIcon={isUploading ? <CircularProgress size={20} /> : <DocumentUpload variant="Bold" />}
                                        fullWidth
                                        sx={{
                                            borderRadius: 2,
                                            fontWeight: 700,
                                            textTransform: 'none',
                                            borderWidth: 1.5,
                                            '&:hover': { borderWidth: 1.5 }
                                        }}
                                    >
                                        {intl.formatMessage({ id: 'download-all', defaultMessage: 'Télécharger Tous' })}
                                    </Button>

                                    <Button
                                        variant="outlined"
                                        color="success"
                                        disabled={isUploading}
                                        onClick={() => handleFileUpload('stock')}
                                        startIcon={isUploading ? <CircularProgress size={20} /> : <TruckFast variant="Bold" />}
                                        fullWidth
                                        sx={{
                                            borderRadius: 2,
                                            fontWeight: 700,
                                            textTransform: 'none',
                                            borderWidth: 1.5,
                                            '&:hover': { borderWidth: 1.5 }
                                        }}
                                    >
                                        {intl.formatMessage({ id: 'download-stock', defaultMessage: 'Télécharger stock' })}
                                    </Button>
                                </Stack>
                            </Stack>
                        </Stack>
                    </Grid>
                </Grid>
            </MainCard>

            {/* REMARKS SECTION */}
            <Box>
                <Typography variant="h3" color="text.primary" fontWeight={600} sx={{ mb: 3, opacity: 0.8 }}>
                    - {intl.formatMessage({ id: 'remarks', defaultMessage: 'Remarques:' })}
                </Typography>

                <Stack spacing={2}>
                    <Alert
                        icon={false}
                        sx={{
                            bgcolor: '#e6f4ea',
                            color: '#1e4620',
                            borderRadius: 0,
                            py: 2,
                            '& .MuiAlert-message': { width: '100%', fontWeight: 700, fontSize: '0.95rem' }
                        }}
                    >
                        {intl.formatMessage({ id: 'import-remark-1', defaultMessage: "Merci de vérifier votre fichier Excel avant de l'enregistrer" })}
                    </Alert>

                    <Alert
                        icon={false}
                        sx={{
                            bgcolor: '#e3f2fd',
                            color: '#0d47a1',
                            borderRadius: 0,
                            py: 2,
                            '& .MuiAlert-message': { width: '100%', fontWeight: 700, fontSize: '0.95rem' }
                        }}
                    >
                        {intl.formatMessage({ id: 'import-remark-2', defaultMessage: "Le code article ne doit pas contenir des caractères spéciaux exemple: ( ) * $" })}
                    </Alert>

                    <Alert
                        icon={false}
                        sx={{
                            bgcolor: '#fff8e1',
                            color: '#825f00',
                            borderRadius: 0,
                            py: 2,
                            '& .MuiAlert-message': { width: '100%', fontWeight: 700, fontSize: '0.95rem' }
                        }}
                    >
                        {intl.formatMessage({ id: 'import-remark-3', defaultMessage: "Pour chaque article vous devez mentionner la désignation" })}
                    </Alert>

                    <Alert
                        icon={false}
                        sx={{
                            bgcolor: '#ffebee',
                            color: '#b71c1c',
                            borderRadius: 0,
                            py: 2,
                            '& .MuiAlert-message': { width: '100%', fontWeight: 700, fontSize: '0.95rem' }
                        }}
                    >
                        {intl.formatMessage({ id: 'import-remark-4', defaultMessage: "Les prix et les quantités: avec des virgules exemple: (200,500)" })}
                    </Alert>
                </Stack>
            </Box>

        </Stack>
    );
}
