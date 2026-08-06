'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Box, Stack, Chip, Typography, CircularProgress, useTheme, alpha } from '@mui/material';
import { Refresh } from '@wandersonalwes/iconsax-react';

// Glass zones of a vehicle. Ordered for display.
export const BRIS_ZONES: { id: string; label: string }[] = [
  { id: 'windshield', label: 'Pare-brise' },
  { id: 'rear_window', label: 'Lunette arrière' },
  { id: 'front_left', label: 'Vitre avant gauche' },
  { id: 'front_right', label: 'Vitre avant droite' },
  { id: 'rear_left', label: 'Vitre arrière gauche' },
  { id: 'rear_right', label: 'Vitre arrière droite' },
  { id: 'roof', label: 'Toit vitré' }
];

export const BRIS_ZONE_LABELS: Record<string, string> = BRIS_ZONES.reduce(
  (acc, z) => ({ ...acc, [z.id]: z.label }),
  {} as Record<string, string>
);

// Parse a stored CSV of zone ids into human labels.
export const parseZoneLabels = (csv?: string): string[] => {
  if (!csv) return [];
  return csv
    .split(',')
    .map((z) => z.trim())
    .filter(Boolean)
    .map((z) => BRIS_ZONE_LABELS[z] || z);
};

// The three.js scene is client-only (WebGL) — never rendered on the server.
const Car3D = dynamic(() => import('./Car3D'), {
  ssr: false,
  loading: () => (
    <Stack alignItems="center" justifyContent="center" sx={{ height: '100%' }}>
      <CircularProgress size={28} />
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, fontWeight: 600 }}>
        Chargement du véhicule 3D...
      </Typography>
    </Stack>
  )
});

interface CarDamageSelectorProps {
  value: string[];
  onChange?: (ids: string[]) => void;
  readOnly?: boolean;
}

export default function CarDamageSelector({ value, onChange, readOnly = false }: CarDamageSelectorProps) {
  const theme = useTheme();
  const [hovered, setHovered] = useState<string | null>(null);
  const isDark = theme.palette.mode === 'dark';

  const toggle = (id: string) => {
    if (readOnly || !onChange) return;
    onChange(value.includes(id) ? value.filter((z) => z !== id) : [...value, id]);
  };

  return (
    <Stack spacing={1.5} alignItems="center" sx={{ width: '100%' }}>
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          maxWidth: 720,
          height: { xs: 300, md: 400 },
          borderRadius: 3,
          overflow: 'hidden',
          border: `1px solid ${theme.palette.divider}`,
          background: isDark
            ? 'radial-gradient(ellipse at 50% 40%, #2b3138 0%, #16191d 100%)'
            : 'radial-gradient(ellipse at 50% 40%, #ffffff 0%, #dde3e9 100%)'
        }}
      >
        <Car3D
          value={value}
          onChange={onChange}
          readOnly={readOnly}
          onHover={setHovered}
          primary={theme.palette.primary.main}
          primaryDark={theme.palette.primary.dark}
          isDark={isDark}
        />

        {/* Rotate hint */}
        <Stack
          direction="row"
          spacing={0.75}
          alignItems="center"
          sx={{
            position: 'absolute',
            top: 12,
            left: 12,
            px: 1.25,
            py: 0.5,
            borderRadius: 5,
            bgcolor: alpha(theme.palette.background.paper, 0.85),
            border: `1px solid ${theme.palette.divider}`,
            pointerEvents: 'none'
          }}
        >
          <Refresh size={16} color={theme.palette.primary.main} />
          <Typography variant="caption" sx={{ fontWeight: 700 }}>
            Faites pivoter le véhicule
          </Typography>
        </Stack>

        {/* Live zone name */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 12,
            left: '50%',
            transform: 'translateX(-50%)',
            px: 1.5,
            py: 0.5,
            borderRadius: 5,
            bgcolor: alpha(theme.palette.background.paper, 0.85),
            border: `1px solid ${hovered ? theme.palette.primary.main : theme.palette.divider}`,
            pointerEvents: 'none'
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 700, color: hovered ? 'primary.main' : 'text.secondary' }}>
            {readOnly
              ? value.length === 0
                ? 'Aucune zone renseignée'
                : `${value.length} zone${value.length > 1 ? 's' : ''} endommagée${value.length > 1 ? 's' : ''}`
              : hovered
                ? BRIS_ZONE_LABELS[hovered]
                : 'Cliquez sur les vitres endommagées'}
          </Typography>
        </Box>
      </Box>

      {/* Selected zones as chips (accessibility + quick removal) */}
      {value.length > 0 && (
        <Box sx={{ width: '100%', maxWidth: 720 }}>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {value.map((id) => (
              <Chip
                key={id}
                label={BRIS_ZONE_LABELS[id] || id}
                color="primary"
                size="small"
                variant="filled"
                onDelete={readOnly ? undefined : () => toggle(id)}
                sx={{ fontWeight: 700, mb: 1 }}
              />
            ))}
          </Stack>
        </Box>
      )}


    </Stack>
  );
}
