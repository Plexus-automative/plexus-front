'use client';

import { useCallback, useEffect, useState } from 'react';

// material-ui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import { alpha } from '@mui/material/styles';

// project-imports
import { DemandeDevis, fetchDemandesDevis } from 'app/api/services/DemandeDevisService';

// assets
import { CloseCircle, SearchNormal1, TickCircle } from '@wandersonalwes/iconsax-react';

// ==============================|| PANIER - ASSIGNER UNE DEMANDE DE DEVIS ||============================== //
//
// Picks the demande that this cart answers. Only demandes still "à traiter" are offered:
// one already linked to a commande has been dealt with, and offering it again invites
// assigning two orders to the same request.

const formatDate = (value?: string | null) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export default function AssignDevisDialog({
  open,
  onClose,
  onSelect
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (demande: DemandeDevis) => void;
}) {
  const [rows, setRows] = useState<DemandeDevis[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [garage, setGarage] = useState('');
  const [immatriculation, setImmatriculation] = useState('');
  const [picked, setPicked] = useState<DemandeDevis | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDemandesDevis(
        {
          treated: false,
          ...(garage.trim() ? { garage: garage.trim() } : {}),
          ...(immatriculation.trim() ? { immatriculation: immatriculation.trim() } : {})
        },
        50,
        0
      );
      setRows(data.items || []);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Impossible de charger les demandes de devis.');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [garage, immatriculation]);

  useEffect(() => {
    if (open) {
      setPicked(null);
      load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 3, pt: 2.5, pb: 1.5 }}>
        <Stack>
          <Typography variant="h5">Assigner une demande de devis</Typography>
          <Typography variant="caption" color="text.secondary">
            La commande créée sera rattachée à la demande choisie, qui passera en « traitée ».
          </Typography>
        </Stack>
        <IconButton size="small" onClick={onClose}>
          <CloseCircle size={20} />
        </IconButton>
      </Stack>

      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={{ xs: 12, sm: 5 }}>
            <TextField
              fullWidth
              size="small"
              label="Garage"
              value={garage}
              onChange={(e) => setGarage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && load()}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 5 }}>
            <TextField
              fullWidth
              size="small"
              label="Immatriculation"
              value={immatriculation}
              onChange={(e) => setImmatriculation(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && load()}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 2 }}>
            <Button fullWidth variant="outlined" onClick={load} startIcon={<SearchNormal1 size={16} />}>
              Chercher
            </Button>
          </Grid>
        </Grid>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading && (
          <Stack alignItems="center" sx={{ py: 5 }}>
            <CircularProgress size={28} />
          </Stack>
        )}

        {!loading && rows.length === 0 && (
          <Stack alignItems="center" sx={{ py: 5 }}>
            <Typography color="text.secondary">Aucune demande à traiter pour ces critères.</Typography>
          </Stack>
        )}

        {!loading && (
          <Stack spacing={1}>
            {rows.map((d) => {
              const isPicked = picked?.id === d.id;
              const vehicule = [d.vehicle?.make, d.vehicle?.model].filter(Boolean).join(' ');
              return (
                <Stack
                  key={d.id}
                  direction="row"
                  alignItems="center"
                  spacing={1.5}
                  onClick={() => setPicked(d)}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    cursor: 'pointer',
                    border: (t) => `1px solid ${isPicked ? t.palette.primary.main : t.palette.divider}`,
                    bgcolor: (t) => (isPicked ? alpha(t.palette.primary.main, 0.06) : 'transparent'),
                    '&:hover': { borderColor: (t) => t.palette.primary.main }
                  }}
                >
                  <Box sx={{ color: isPicked ? 'primary.main' : 'text.disabled', display: 'flex' }}>
                    <TickCircle size={20} variant={isPicked ? 'Bold' : 'Linear'} />
                  </Box>
                  <Stack sx={{ minWidth: 0, flexGrow: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                      <Typography variant="subtitle2">{d.number}</Typography>
                      <Chip size="small" variant="outlined" label={d.garage?.name || 'Garage inconnu'} />
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      {[d.vehicle?.immatriculation, vehicule, d.commercial?.name,
                        formatDate(d.createdOnDevice || d.receivedAt)]
                        .filter(Boolean)
                        .join('  ·  ')}
                    </Typography>
                  </Stack>
                </Stack>
              );
            })}
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Box sx={{ flexGrow: 1 }} />
        <Button color="secondary" onClick={onClose}>
          Annuler
        </Button>
        <Button
          variant="contained"
          disabled={!picked}
          onClick={() => {
            if (picked) {
              onSelect(picked);
              onClose();
            }
          }}
        >
          Valider
        </Button>
      </DialogActions>
    </Dialog>
  );
}
