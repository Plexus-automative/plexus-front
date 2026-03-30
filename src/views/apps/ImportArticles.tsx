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
    Paper,
} from '@mui/material';
import MainCard from 'components/MainCard';
import { DocumentCopy, DocumentUpload, ExportSquare, TruckFast } from '@wandersonalwes/iconsax-react';

export default function ImportArticles() {
    const theme = useTheme();
    const intl = useIntl();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setSelectedFile(event.target.files[0]);
        }
    };

    const handleDownloadTemplate = () => {
        // Placeholder functionality to download Excel template
        const csvContent = "data:text/csv;charset=utf-8,Code Article,Designation,Marque,Quantite,Prix\n";
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "modele_articles.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Stack spacing={4}>
            <MainCard sx={{ borderRadius: 3, boxShadow: theme.customShadows.z1 }}>
                <Grid container spacing={4}>
                    {/* LEFT COLUMN: Download Template */}
                    <Grid item xs={12} md={6}>
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
                    <Grid item xs={12} md={6}>
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
                                        startIcon={<DocumentUpload variant="Bold" />}
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
                                        startIcon={<TruckFast variant="Bold" />}
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
