'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

// material-ui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Tooltip from '@mui/material/Tooltip';
import Skeleton from '@mui/material/Skeleton';
import { alpha, useTheme } from '@mui/material/styles';

// project-imports
import { DemandeDevisMedia } from 'app/api/services/DemandeDevisService';

// assets
import {
  ArrowLeft2,
  ArrowRight2,
  CloseCircle,
  DocumentText,
  ExportSquare,
  Gallery,
  Microphone2,
  Maximize4
} from '@wandersonalwes/iconsax-react';

// ==============================|| DEMANDES DE DEVIS - MÉDIAS ||============================== //
//
// Photos, vocaux and documents captured during the visit. The files live on the mobile
// app's own storage (mobile.plexus-tec.com) — Plexus stores only the links — so every
// element here loads cross-origin and must degrade gracefully when a file has moved,
// expired, or was never reachable.

/** Labels arrive percent-encoded from the mobile app ("Cv%20iheb.pdf"). */
const prettyLabel = (raw?: string, fallbackUrl?: string) => {
  const source = raw || (fallbackUrl ? fallbackUrl.split('/').pop() || '' : '');
  try {
    return decodeURIComponent(source);
  } catch {
    return source;
  }
};

const formatTime = (value?: string) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatDuration = (seconds?: number) => {
  if (seconds == null || Number.isNaN(seconds)) return '';
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
};

const isPhoto = (m: DemandeDevisMedia) => ['photo', 'image'].includes((m.type || '').toLowerCase());
const isAudio = (m: DemandeDevisMedia) => (m.type || '').toLowerCase() === 'audio';

// ---------------------------------------------------------------- section header ---

function SectionHeader({ icon, title, count }: { icon: React.ReactNode; title: string; count: number }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
      {icon}
      <Typography variant="subtitle1">{title}</Typography>
      <Chip size="small" label={count} sx={{ height: 20, fontSize: 12 }} />
    </Stack>
  );
}

// ---------------------------------------------------------------------- photos ---

function PhotoTile({
  media,
  onOpen
}: {
  media: DemandeDevisMedia;
  onOpen: () => void;
}) {
  const theme = useTheme();
  const [state, setState] = useState<'loading' | 'ok' | 'error'>('loading');

  return (
    <Box
      onClick={state === 'error' ? undefined : onOpen}
      sx={{
        position: 'relative',
        borderRadius: 2,
        overflow: 'hidden',
        border: `1px solid ${theme.palette.divider}`,
        bgcolor: theme.palette.background.default,
        aspectRatio: '4 / 3',
        cursor: state === 'error' ? 'default' : 'zoom-in',
        '&:hover .overlay': { opacity: 1 }
      }}
    >
      {state === 'loading' && (
        <Skeleton variant="rectangular" width="100%" height="100%" animation="wave" />
      )}

      {state !== 'error' && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={media.url}
          alt={prettyLabel(media.label, media.url)}
          loading="lazy"
          onLoad={() => setState('ok')}
          onError={() => setState('error')}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: state === 'ok' ? 'block' : 'none'
          }}
        />
      )}

      {state === 'error' && (
        <Stack alignItems="center" justifyContent="center" spacing={0.5} sx={{ height: '100%', p: 1 }}>
          <Gallery size={22} color={theme.palette.text.disabled} />
          <Typography variant="caption" color="text.secondary" align="center">
            Image indisponible
          </Typography>
          <Button size="small" href={media.url} target="_blank" rel="noopener noreferrer">
            Ouvrir
          </Button>
        </Stack>
      )}

      {state === 'ok' && (
        <Box
          className="overlay"
          sx={{
            position: 'absolute',
            inset: 0,
            opacity: 0,
            transition: 'opacity .2s',
            background: `linear-gradient(to top, ${alpha(theme.palette.common.black, 0.75)} 0%, transparent 55%)`,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            p: 1
          }}
        >
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Maximize4 size={14} color={theme.palette.common.white} />
            <Typography
              variant="caption"
              sx={{ color: 'common.white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            >
              {prettyLabel(media.label, media.url)}
            </Typography>
          </Stack>
        </Box>
      )}
    </Box>
  );
}

function Lightbox({
  photos,
  index,
  onClose,
  onIndex
}: {
  photos: DemandeDevisMedia[];
  index: number;
  onClose: () => void;
  onIndex: (i: number) => void;
}) {
  const theme = useTheme();
  const current = photos[index];

  const prev = useCallback(() => onIndex((index - 1 + photos.length) % photos.length), [index, photos.length, onIndex]);
  const next = useCallback(() => onIndex((index + 1) % photos.length), [index, photos.length, onIndex]);

  // Arrow keys are how people actually page through a gallery.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [prev, next]);

  if (!current) return null;

  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      slotProps={{ paper: { sx: { bgcolor: 'common.black', backgroundImage: 'none' } } }}
    >
      <DialogContent sx={{ p: 0, position: 'relative', bgcolor: 'common.black' }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ px: 2, py: 1.25, color: 'common.white' }}
        >
          <Stack>
            <Typography variant="subtitle2" noWrap sx={{ color: 'common.white' }}>
              {prettyLabel(current.label, current.url)}
            </Typography>
            {current.addedAt && (
              <Typography variant="caption" sx={{ color: alpha(theme.palette.common.white, 0.7) }}>
                {formatTime(current.addedAt)}
              </Typography>
            )}
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="caption" sx={{ color: alpha(theme.palette.common.white, 0.7) }}>
              {index + 1} / {photos.length}
            </Typography>
            <Tooltip title="Ouvrir l'original">
              <IconButton
                size="small"
                href={current.url}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ color: 'common.white' }}
              >
                <ExportSquare size={18} />
              </IconButton>
            </Tooltip>
            <IconButton size="small" onClick={onClose} sx={{ color: 'common.white' }}>
              <CloseCircle size={20} />
            </IconButton>
          </Stack>
        </Stack>

        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: { xs: 260, md: 520 },
            maxHeight: '75vh',
            bgcolor: 'common.black'
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={current.url}
            alt={prettyLabel(current.label, current.url)}
            style={{ maxWidth: '100%', maxHeight: '75vh', objectFit: 'contain' }}
          />

          {photos.length > 1 && (
            <>
              <IconButton
                onClick={prev}
                sx={{
                  position: 'absolute',
                  left: 8,
                  color: 'common.white',
                  bgcolor: alpha(theme.palette.common.black, 0.4),
                  '&:hover': { bgcolor: alpha(theme.palette.common.black, 0.65) }
                }}
              >
                <ArrowLeft2 size={20} />
              </IconButton>
              <IconButton
                onClick={next}
                sx={{
                  position: 'absolute',
                  right: 8,
                  color: 'common.white',
                  bgcolor: alpha(theme.palette.common.black, 0.4),
                  '&:hover': { bgcolor: alpha(theme.palette.common.black, 0.65) }
                }}
              >
                <ArrowRight2 size={20} />
              </IconButton>
            </>
          )}
        </Box>

        {photos.length > 1 && (
          <Stack direction="row" spacing={1} sx={{ p: 1.5, overflowX: 'auto' }}>
            {photos.map((p, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={p.url}
                alt=""
                onClick={() => onIndex(i)}
                style={{
                  width: 64,
                  height: 48,
                  objectFit: 'cover',
                  borderRadius: 6,
                  cursor: 'pointer',
                  flex: '0 0 auto',
                  outline: i === index ? `2px solid ${theme.palette.primary.main}` : 'none',
                  opacity: i === index ? 1 : 0.55
                }}
              />
            ))}
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ----------------------------------------------------------------------- audio ---

function AudioPlayer({ media }: { media: DemandeDevisMedia }) {
  const theme = useTheme();
  const [failed, setFailed] = useState(false);
  const [duration, setDuration] = useState<number | undefined>(media.durationSec);

  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        bgcolor: alpha(theme.palette.primary.main, 0.04)
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            bgcolor: alpha(theme.palette.primary.main, 0.12),
            color: 'primary.main',
            flex: '0 0 auto'
          }}
        >
          <Microphone2 size={18} />
        </Box>
        <Stack sx={{ minWidth: 0, flexGrow: 1 }}>
          <Typography variant="subtitle2" noWrap>
            {prettyLabel(media.label, media.url)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {[formatDuration(duration), formatTime(media.addedAt)].filter(Boolean).join(' · ')}
          </Typography>
        </Stack>
        <Tooltip title="Ouvrir dans un nouvel onglet">
          <IconButton size="small" href={media.url} target="_blank" rel="noopener noreferrer">
            <ExportSquare size={16} />
          </IconButton>
        </Tooltip>
      </Stack>

      {failed ? (
        <Typography variant="caption" color="error">
          Ce vocal ne peut pas être lu ici. Utilisez le bouton d&apos;ouverture.
        </Typography>
      ) : (
        <audio
          controls
          preload="metadata"
          src={media.url}
          onLoadedMetadata={(e) => {
            const d = (e.target as HTMLAudioElement).duration;
            if (Number.isFinite(d)) setDuration(d);
          }}
          onError={() => setFailed(true)}
          style={{ width: '100%', height: 36 }}
        />
      )}
    </Box>
  );
}

// ------------------------------------------------------------------- documents ---

function DocumentCard({ media, onPreview }: { media: DemandeDevisMedia; onPreview: () => void }) {
  const theme = useTheme();
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1.5}
      sx={{
        p: 1.5,
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        '&:hover': { borderColor: theme.palette.primary.main }
      }}
    >
      <Box
        sx={{
          width: 34,
          height: 34,
          borderRadius: 1,
          display: 'grid',
          placeItems: 'center',
          bgcolor: alpha(theme.palette.error.main, 0.1),
          color: 'error.main',
          flex: '0 0 auto'
        }}
      >
        <DocumentText size={18} />
      </Box>
      <Stack sx={{ minWidth: 0, flexGrow: 1 }}>
        <Typography variant="subtitle2" noWrap>
          {prettyLabel(media.label, media.url)}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {formatTime(media.addedAt)}
        </Typography>
      </Stack>
      <Button size="small" variant="outlined" onClick={onPreview}>
        Aperçu
      </Button>
      <Tooltip title="Ouvrir dans un nouvel onglet">
        <IconButton size="small" href={media.url} target="_blank" rel="noopener noreferrer">
          <ExportSquare size={16} />
        </IconButton>
      </Tooltip>
    </Stack>
  );
}

function DocumentPreview({ media, onClose }: { media: DemandeDevisMedia; onClose: () => void }) {
  return (
    <Dialog open onClose={onClose} maxWidth="lg" fullWidth>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2, py: 1.25 }}>
        <Typography variant="subtitle1" noWrap>
          {prettyLabel(media.label, media.url)}
        </Typography>
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Ouvrir dans un nouvel onglet">
            <IconButton size="small" href={media.url} target="_blank" rel="noopener noreferrer">
              <ExportSquare size={18} />
            </IconButton>
          </Tooltip>
          <IconButton size="small" onClick={onClose}>
            <CloseCircle size={20} />
          </IconButton>
        </Stack>
      </Stack>
      <DialogContent dividers sx={{ p: 0, height: '78vh', position: 'relative' }}>
        {/* No `sandbox` attribute on purpose: Chrome's built-in PDF viewer refuses to run
            inside a sandboxed frame — verified that both sandbox="" and
            sandbox="allow-scripts allow-same-origin" render nothing at all. The files are
            served from mobile.plexus-tec.com, our own mobile host rather than an outside
            party, so framing them unsandboxed is an acceptable trade for a preview that
            actually works. `no-referrer` still keeps our URLs out of their logs. */}
        <iframe
          src={media.url}
          title={prettyLabel(media.label, media.url)}
          referrerPolicy="no-referrer"
          style={{ width: '100%', height: '100%', border: 0, position: 'relative', zIndex: 1 }}
        />
        {/* Sits behind the frame: only visible if the viewer renders nothing. */}
        <Stack
          spacing={1}
          alignItems="center"
          justifyContent="center"
          sx={{ position: 'absolute', inset: 0, p: 3, textAlign: 'center' }}
        >
          <DocumentText size={28} />
          <Typography variant="body2" color="text.secondary">
            L&apos;aperçu ne s&apos;affiche pas dans ce navigateur.
          </Typography>
          <Button size="small" variant="outlined" href={media.url} target="_blank" rel="noopener noreferrer">
            Ouvrir le document
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

// ------------------------------------------------------------------------ main ---

export default function MediaGallery({ media }: { media: DemandeDevisMedia[] }) {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [doc, setDoc] = useState<DemandeDevisMedia | null>(null);

  const { photos, audios, docs } = useMemo(
    () => ({
      photos: (media || []).filter(isPhoto),
      audios: (media || []).filter(isAudio),
      docs: (media || []).filter((m) => !isPhoto(m) && !isAudio(m))
    }),
    [media]
  );

  if (!media?.length) {
    return (
      <Typography variant="body2" color="text.secondary">
        Aucun média transmis avec cette demande.
      </Typography>
    );
  }

  return (
    <Stack spacing={3}>
      {photos.length > 0 && (
        <Box>
          <SectionHeader icon={<Gallery size={18} />} title="Photos" count={photos.length} />
          <Grid container spacing={1.5}>
            {photos.map((m, i) => (
              <Grid key={i} size={{ xs: 6, sm: 4, md: 3 }}>
                <PhotoTile media={m} onOpen={() => setLightbox(i)} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {audios.length > 0 && (
        <Box>
          <SectionHeader icon={<Microphone2 size={18} />} title="Vocaux" count={audios.length} />
          <Stack spacing={1.5}>
            {audios.map((m, i) => (
              <AudioPlayer key={i} media={m} />
            ))}
          </Stack>
        </Box>
      )}

      {docs.length > 0 && (
        <Box>
          <SectionHeader icon={<DocumentText size={18} />} title="Documents" count={docs.length} />
          <Stack spacing={1.5}>
            {docs.map((m, i) => (
              <DocumentCard key={i} media={m} onPreview={() => setDoc(m)} />
            ))}
          </Stack>
        </Box>
      )}

      {lightbox !== null && (
        <Lightbox photos={photos} index={lightbox} onIndex={setLightbox} onClose={() => setLightbox(null)} />
      )}
      {doc && <DocumentPreview media={doc} onClose={() => setDoc(null)} />}
    </Stack>
  );
}
