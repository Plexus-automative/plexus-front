// material-ui
import { Theme } from '@mui/material/styles';

// ==============================|| OVERRIDES - TABLE BODY ||============================== //

export default function TableBody(theme: Theme) {
  const hoverStyle = {
    '&:hover': {
      backgroundColor: theme.palette.secondary.lighter
    }
  };

  return {
    MuiTableBody: {
      styleOverrides: {
        root: {
          backgroundColor: theme.palette.background.paper,
          '& .MuiTableRow-root': {
            ...hoverStyle
          }
        }
      }
    }
  };
}
