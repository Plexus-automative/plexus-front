// material-ui
import { Theme } from '@mui/material/styles';

// ==============================|| OVERRIDES - MENU ITEM ||============================== //

export default function MenuItem(theme: Theme) {
  return {
    MuiMenuItem: {
      styleOverrides: {
        root: {
          // Sidebar/menu dropdown text color
          color: '#48617d'
        }
      }
    }
  };
}

