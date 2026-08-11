'use client';

// Puce « MAJ prix » affichée sur chaque ligne d'article d'une commande : la dernière fois que
// le prix de CETTE RÉFÉRENCE a bougé dans Business Central, avec l'ancien et le nouveau prix.
//
// L'historique est tenu par article, pas par ligne (cf. PriceHistoryService) : la même
// référence sur deux commandes affiche la même date. La puce répond à « le prix de la ligne
// est-il encore d'actualité ? », pas à « qui a modifié cette ligne ? ».
//
// Chaque puce demande sa propre référence ; le service regroupe toutes les demandes d'un même
// tick en une seule requête, donc poser la puce sur 20 lignes ne coûte qu'un appel.

import { useEffect, useState } from 'react';

// material-ui
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Popover from '@mui/material/Popover';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import { alpha, useTheme } from '@mui/material/styles';

// project-imports
import {
  PriceFreshness,
  PriceHistoryEntry,
  PriceUpdate,
  fetchPriceHistory,
  getLastPriceUpdate
} from 'app/api/services/PriceHistoryService';

const nf = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 3, maximumFractionDigits: 3 });

const formatPrice = (v: number) => nf.format(v ?? 0);

const formatDate = (iso: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' });
};

const formatDateTime = (iso: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/** Écart en % entre l'ancien et le nouveau prix ('' si l'ancien est nul). */
const variation = (u: { oldPrice: number; newPrice: number }) => {
  if (!u.oldPrice) return '';
  const pct = ((u.newPrice - u.oldPrice) / u.oldPrice) * 100;
  return `${pct > 0 ? '+' : ''}${pct.toFixed(1)} %`;
};

const DAY_MS = 24 * 60 * 60 * 1000;

// La couleur dit la FRAÎCHEUR du prix, pas le sens de la variation : c'est « puis-je encore
// vendre à ce prix ? » qui intéresse, et un prix qui a baissé il y a deux mois est aussi
// périmé qu'un prix qui avait monté. Le sens du mouvement reste lisible via la flèche.
//   ≤ 1 semaine → vert · 1 à 2 semaines → orange · au-delà → rouge
//
// Les seuils font autorité côté backend (PriceHistoryService), qui les applique aussi pour
// l'app commerciale : on lit son `freshness` quand il est là. Le calcul local ne sert que de
// repli si la réponse ne le porte pas — sans lui, un backend plus ancien décolorerait tout.
const FRESH_DAYS = 7;
const STALE_DAYS = 14;

/** Nombre de jours écoulés depuis la MAJ (null si la date est inexploitable). */
const daysSince = (iso: string): number | null => {
  const d = new Date(iso);
  if (!iso || Number.isNaN(d.getTime())) return null;
  return Math.floor((Date.now() - d.getTime()) / DAY_MS);
};

const localFreshness = (days: number | null): PriceFreshness | null => {
  if (days === null) return null;
  if (days <= FRESH_DAYS) return 'recent';
  return days <= STALE_DAYS ? 'aging' : 'stale';
};

const ageLabel = (days: number) => {
  if (days <= 0) return "aujourd'hui";
  if (days === 1) return 'hier';
  if (days < 14) return `il y a ${days} jours`;
  if (days < 60) return `il y a ${Math.floor(days / 7)} semaines`;
  return `il y a ${Math.floor(days / 30)} mois`;
};

interface Props {
  /** Référence de l'article (lineObjectNumber de la ligne de commande). */
  itemNo?: string | null;
  /** Rend la puce encore plus compacte pour les tableaux denses. */
  dense?: boolean;
}

export default function LastPriceUpdate({ itemNo, dense = false }: Props) {
  const theme = useTheme();
  const [update, setUpdate] = useState<PriceUpdate | null>(null);
  const [loading, setLoading] = useState(false);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [history, setHistory] = useState<PriceHistoryEntry[] | null>(null);

  useEffect(() => {
    let alive = true;
    if (!itemNo) {
      setUpdate(null);
      return;
    }
    setLoading(true);
    getLastPriceUpdate(itemNo)
      .then((u) => {
        if (alive) setUpdate(u);
      })
      .catch(() => {
        if (alive) setUpdate(null);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [itemNo]);

  const openHistory = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation(); // la ligne de commande se replierait sinon
    setAnchor(event.currentTarget);
    if (history === null && itemNo) {
      fetchPriceHistory(itemNo)
        .then(setHistory)
        .catch(() => setHistory([]));
    }
  };

  if (!itemNo) return null;

  if (loading && !update) {
    return <CircularProgress size={10} sx={{ ml: 0.5, opacity: 0.4 }} />;
  }

  // Aucun changement enregistré : le prix n'a jamais bougé depuis la création de l'article.
  if (!update) {
    return (
      <Tooltip title="Aucun changement de prix enregistré pour cette référence">
        <Typography variant="caption" color="text.secondary" sx={{ opacity: 0.5 }}>
          —
        </Typography>
      </Tooltip>
    );
  }

  const hausse = update.newPrice > update.oldPrice;
  const days = update.daysAgo ?? daysSince(update.dateTime);
  const fresh = update.freshness ?? localFreshness(days);
  // Fraîcheur indéterminable : on reste neutre plutôt que d'annoncer un prix « périmé » à tort.
  const color =
    fresh === 'recent'
      ? theme.palette.success.main
      : fresh === 'aging'
        ? theme.palette.warning.main
        : fresh === 'stale'
          ? theme.palette.error.main
          : theme.palette.text.secondary;

  return (
    <>
      <Tooltip
        title={
          <Box sx={{ py: 0.5 }}>
            <Typography variant="caption" sx={{ display: 'block', fontWeight: 600 }}>
              Dernière MAJ du prix de l&apos;article
            </Typography>
            <Typography variant="caption" sx={{ display: 'block' }}>
              {formatPrice(update.oldPrice)} → {formatPrice(update.newPrice)} {variation(update) && `(${variation(update)})`}
            </Typography>
            <Typography variant="caption" sx={{ display: 'block' }}>
              le {formatDateTime(update.dateTime)}
              {days !== null && ` · ${ageLabel(days)}`}
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', opacity: 0.75 }}>
              {update.changeCount} changement{update.changeCount > 1 ? 's' : ''} enregistré
              {update.changeCount > 1 ? 's' : ''} · cliquer pour l&apos;historique
            </Typography>
          </Box>
        }
      >
        <Chip
          size="small"
          onClick={openHistory}
          label={`${hausse ? '↑' : '↓'} ${formatDate(update.dateTime)}`}
          sx={{
            height: dense ? 16 : 18,
            cursor: 'pointer',
            fontSize: dense ? '0.6rem' : '0.65rem',
            fontWeight: 500,
            color,
            bgcolor: alpha(color, 0.1),
            border: `1px solid ${alpha(color, 0.25)}`,
            '& .MuiChip-label': { px: 0.6 }
          }}
        />
      </Tooltip>

      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        slotProps={{ paper: { sx: { p: 1.5, maxHeight: 320, minWidth: 280 } } }}
      >
        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
          Historique des prix — {itemNo}
        </Typography>
        <Divider sx={{ mb: 1 }} />
        {history === null ? (
          <Stack alignItems="center" sx={{ py: 2 }}>
            <CircularProgress size={18} />
          </Stack>
        ) : history.length === 0 ? (
          <Typography variant="caption" color="text.secondary">
            Aucun changement enregistré.
          </Typography>
        ) : (
          <Stack spacing={0.75}>
            {/* Ici la couleur ne code plus la fraîcheur (chaque ligne est une date différente) :
                on reste en texte neutre et c'est la flèche qui donne le sens du mouvement. */}
            {history.map((h, i) => (
              <Stack key={`${h.dateTime}-${i}`} direction="row" justifyContent="space-between" spacing={2}>
                <Typography variant="caption" color="text.secondary">
                  {formatDateTime(h.dateTime)}
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: i === 0 ? 600 : 400 }}>
                  {h.newPrice > h.oldPrice ? '↑' : '↓'} {formatPrice(h.oldPrice)} → {formatPrice(h.newPrice)}
                </Typography>
              </Stack>
            ))}
          </Stack>
        )}
      </Popover>
    </>
  );
}
