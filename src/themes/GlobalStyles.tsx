// material-ui
import MuiGlobalStyles from '@mui/material/GlobalStyles';

// ==============================|| THEME - GLOBAL STYLE  ||============================== //

export default function GlobalStyles() {
  return (
    <MuiGlobalStyles
      styles={(theme) => ({
        // global-style -> apexcharts
        '.apexcharts-theme-dark .apexcharts-menu': {
          borderColor: theme.palette.text.secondary,
          color: theme.palette.text.primary,
          '& .apexcharts-menu-item:hover': {
            color: theme.palette.primary.main
          }
        }
      })}
    />
  );
}
