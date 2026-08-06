'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Stack,
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
  useTheme,
  alpha,
  IconButton,
  Autocomplete
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { useDropzone } from 'react-dropzone';
import { Car, TickCircle, InfoCircle, DocumentUpload, DocumentText, Trash } from '@wandersonalwes/iconsax-react';

// project-imports
import MainCard from 'components/MainCard';
import useUser from 'hooks/useUser';
import CarDamageSelector from 'components/bris-de-glace/CarDamageSelector';
import { VEHICLE_MODELS as FALLBACK_MODELS } from 'components/bris-de-glace/vehicleData';
import { createBrisDossier, fetchVehicleModels } from 'app/api/services/BrisDeGlaceService';

export default function BrisDeGlaceCreationPage() {
  const theme = useTheme();
  const user = useUser();
  const router = useRouter();

  const canAccess = user && (user.isBriseDeGlace || user.customerNo === 'C0090');

  // Form state
  const [dossierNo, setDossierNo] = useState('');
  const [immatriculation, setImmatriculation] = useState('');
  const [assureur, setAssureur] = useState('');
  const [marque, setMarque] = useState('');
  const [modele, setModele] = useState('');
  const [vin, setVin] = useState('');
  const [zones, setZones] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);

  // Vehicle makes/models — managed in BC (plexusVehicleModels), fallback to the built-in list.
  const [modelsMap, setModelsMap] = useState<Record<string, string[]>>(FALLBACK_MODELS);

  useEffect(() => {
    let active = true;
    fetchVehicleModels()
      .then((rows) => {
        if (!active || rows.length === 0) return; // keep fallback until BC is seeded
        const map: Record<string, string[]> = {};
        rows.forEach(({ make, model }) => {
          if (!map[make]) map[make] = [];
          if (model && !map[make].includes(model)) map[make].push(model);
        });
        Object.values(map).forEach((list) => list.sort((a, b) => a.localeCompare(b, 'fr')));
        setModelsMap(map);
      })
      .catch(() => {
        /* keep fallback list */
      });
    return () => {
      active = false;
    };
  }, []);

  const makes = useMemo(() => Object.keys(modelsMap).sort((a, b) => a.localeCompare(b, 'fr')), [modelsMap]);

  // Feedback
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    multiple: false,
    onDrop: (accepted) => {
      if (accepted && accepted.length > 0) setFile(accepted[0]);
    }
  });

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
            Votre compte n&apos;est pas autorisé à créer des dossiers bris de glace.
          </Typography>
          <Button variant="contained" onClick={() => router.push('/')} sx={{ borderRadius: 2, px: 4, py: 1.2, fontWeight: 700 }}>
            Retour
          </Button>
        </MainCard>
      </Stack>
    );
  }

  const resetForm = () => {
    setDossierNo('');
    setImmatriculation('');
    setAssureur('');
    setMarque('');
    setModele('');
    setVin('');
    setZones([]);
    setFile(null);
  };

  // All fields are mandatory — used to gate the submit button.
  const isFormValid =
    dossierNo.trim() !== '' &&
    immatriculation.trim() !== '' &&
    assureur.trim() !== '' &&
    marque.trim() !== '' &&
    modele.trim() !== '' &&
    vin.trim() !== '' &&
    zones.length > 0;

  const handleSubmit = async () => {
    if (!dossierNo.trim()) {
      setError('Veuillez saisir le N° de dossier.');
      return;
    }
    if (!immatriculation.trim()) {
      setError("Veuillez saisir l'immatriculation.");
      return;
    }
    if (!assureur.trim()) {
      setError("Veuillez saisir l'assureur.");
      return;
    }
    if (!marque.trim()) {
      setError('Veuillez sélectionner la marque du véhicule.');
      return;
    }
    if (!modele.trim()) {
      setError('Veuillez sélectionner le modèle du véhicule.');
      return;
    }
    const cleanVin = vin.trim();
    if (!cleanVin) {
      setError('Veuillez saisir le VIN (châssis).');
      return;
    }
    if (cleanVin.length !== 17) {
      setError('Le numéro de châssis (VIN) doit comporter exactement 17 caractères.');
      return;
    }
    if (zones.length === 0) {
      setError('Veuillez sélectionner au moins une zone endommagée sur le véhicule.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await createBrisDossier(
        {
          dossierNo: dossierNo.trim(),
          immatriculation: immatriculation.trim(),
          assureur: assureur.trim(),
          vehicleMakeModel: [marque.trim(), modele.trim()].filter(Boolean).join(' '),
          vin: cleanVin.toUpperCase(),
          damageZones: zones
        },
        file
      );
      setSuccess(true);
      resetForm();
    } catch (err: any) {
      let errMsg = 'Erreur lors de la création du dossier.';
      if (typeof err === 'string') {
        errMsg = err;
      } else if (err && typeof err === 'object') {
        errMsg = err.error || err.response?.data?.error || err.message || errMsg;
      }
      setError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Stack spacing={4} sx={{ width: '100%' }}>
      {/* HEADER */}
      <MainCard sx={{ borderRadius: 3, boxShadow: theme.customShadows.z1 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}>
            <Car variant="Bold" size={32} />
          </Box>
          <Box>
            <Typography variant="h3" fontWeight={900}>Nouveau dossier bris de glace</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
              RENSEIGNER LE VÉHICULE, SÉLECTIONNER LES DÉGÂTS ET JOINDRE LE PDF • PLEXUS AUTOMATIVE
            </Typography>
          </Box>
        </Stack>
      </MainCard>

      {/* STEP 1 — IDENTITY */}
      <MainCard sx={{ borderRadius: 3, boxShadow: theme.customShadows.z1 }}>
        <Typography variant="h4" fontWeight={800} sx={{ mb: 3 }}>
          1. Informations du dossier & véhicule
        </Typography>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              label="N° dossier *"
              placeholder="Ex: 126133549"
              value={dossierNo}
              onChange={(e) => setDossierNo(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              label="Immatriculation *"
              placeholder="Ex: 134 TU 248"
              value={immatriculation}
              onChange={(e) => setImmatriculation(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              label="Assureur *"
              placeholder="Ex: STAR, MAWDY..."
              value={assureur}
              onChange={(e) => setAssureur(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Autocomplete
              freeSolo
              autoHighlight
              options={makes}
              inputValue={marque}
              onInputChange={(_, v) => {
                setMarque(v);
                // Reset the model when the make changes so stale models are cleared
                if (modele && !(modelsMap[v] || []).includes(modele)) setModele('');
              }}
              renderInput={(params) => (
                <TextField {...params} fullWidth label="Marque *" placeholder="Ex: Volkswagen" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Autocomplete
              freeSolo
              autoHighlight
              options={modelsMap[marque] || []}
              inputValue={modele}
              onInputChange={(_, v) => setModele(v)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  label="Modèle *"
                  placeholder={marque ? 'Ex: Golf' : "Choisir d'abord la marque"}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              label="VIN (châssis) *"
              placeholder="17 caractères"
              value={vin}
              onChange={(e) => setVin(e.target.value)}
              inputProps={{ maxLength: 17 }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>
        </Grid>
      </MainCard>

      {/* STEP 2 — DEGA (damage zones + PDF) */}
      <MainCard sx={{ borderRadius: 3, boxShadow: theme.customShadows.z1 }}>
        <Typography variant="h4" fontWeight={800} sx={{ mb: 1 }}>
          2. Dégâts & pièce jointe
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3, fontWeight: 600 }}>
          Cliquez sur les vitres endommagées, puis joignez le PDF du dossier (BC).
        </Typography>
        <Grid container spacing={4} alignItems="flex-start">
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1 }}>
              Zones endommagées *
            </Typography>
            <CarDamageSelector value={zones} onChange={setZones} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1 }}>
              Fichier PDF <Typography component="span" variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>(optionnel — peut être ajouté plus tard)</Typography>
            </Typography>
            {!file ? (
              <Box
                {...getRootProps()}
                sx={{
                  border: `2px dashed ${isDragActive ? theme.palette.primary.main : theme.palette.divider}`,
                  borderRadius: 2,
                  p: 4,
                  textAlign: 'center',
                  cursor: 'pointer',
                  bgcolor: isDragActive ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
                  transition: 'all .15s ease'
                }}
              >
                <input {...getInputProps()} />
                <DocumentUpload size={40} variant="Bold" color={theme.palette.primary.main} />
                <Typography variant="body1" fontWeight={700} sx={{ mt: 1 }}>
                  Glissez le PDF ici ou cliquez pour parcourir
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Un seul fichier PDF
                </Typography>
              </Box>
            ) : (
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ p: 2, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, bgcolor: alpha(theme.palette.success.main, 0.06) }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
                  <DocumentText size={28} variant="Bold" color={theme.palette.success.main} />
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body1" fontWeight={700} noWrap>
                      {file.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {(file.size / 1024).toFixed(0)} Ko
                    </Typography>
                  </Box>
                </Stack>
                <IconButton color="error" onClick={() => setFile(null)} sx={{ bgcolor: alpha(theme.palette.error.main, 0.05) }}>
                  <Trash size={18} variant="Bold" />
                </IconButton>
              </Stack>
            )}
          </Grid>
        </Grid>

        <Stack direction="row" justifyContent="flex-end" sx={{ mt: 4 }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleSubmit}
            disabled={submitting || !isFormValid}
            startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <TickCircle variant="Bold" />}
            sx={{ borderRadius: 2.5, px: 6, py: 1.5, fontWeight: 900, boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.2)}` }}
          >
            {submitting ? 'ENVOI EN COURS...' : 'CRÉER LE DOSSIER'}
          </Button>
        </Stack>
      </MainCard>

      {/* FEEDBACK */}
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="error" variant="filled" onClose={() => setError(null)} sx={{ borderRadius: 2, fontWeight: 700 }}>
          {error}
        </Alert>
      </Snackbar>
      <Snackbar open={success} autoHideDuration={6000} onClose={() => setSuccess(false)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert
          severity="success"
          variant="filled"
          onClose={() => setSuccess(false)}
          action={
            <Button color="inherit" size="small" onClick={() => router.push('/pages/bris-de-glace/consultation')} sx={{ fontWeight: 800 }}>
              CONSULTER
            </Button>
          }
          sx={{ borderRadius: 2, fontWeight: 700 }}
        >
          Dossier bris de glace créé avec succès !
        </Alert>
      </Snackbar>
    </Stack>
  );
}
