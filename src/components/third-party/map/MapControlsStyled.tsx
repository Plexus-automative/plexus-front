// material-ui
import GlobalStyles from '@mui/material/GlobalStyles';

// ==============================|| MAP BOX - CONTROL STYLED ||============================== //

export default function MapControlsStyled() {
  return (
    <GlobalStyles
      styles={(theme) => ({
        '.mapboxgl-ctrl.mapboxgl-ctrl-group': { borderRadius: '4px', boxShadow: theme.customShadows.z1 },

        '.mapboxgl-ctrl-fullscreen': { '.mapboxgl-ctrl-icon': { transform: ' scale(0.75)' } },

        '.mapboxgl-ctrl-zoom-in': { borderRadius: '4px 4px 0 0' },
        '.mapboxgl-ctrl-compass': { borderRadius: '0 0 4px 4px' },

        '.mapboxgl-ctrl-group button+button': { borderTop: `1px solid ${theme.palette.divider}` },

        '.mapboxgl-ctrl.mapboxgl-ctrl-scale': {
          border: 'none',
          lineHeight: '14px',
          borderRadius: '4px',
          color: theme.palette.text.primary,
          fontWeight: theme.typography.fontWeightBold,
          background: theme.palette.background.default
        }
      })}
    />
  );
}
