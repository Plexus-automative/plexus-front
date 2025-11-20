// material-ui
import { alpha, Theme } from '@mui/material/styles';

// ==============================|| OVERRIDES - SNACKBAR ||============================== //

export default function Snackbar(theme: Theme) {
  return {
    MuiSnackbar: {
      styleOverrides: {
        root: {
          '& .MuiAlert-root': {
            '& .MuiAlert-message': {
              marginTop: 4,
              '& .MuiButton-root': {
                marginTop: 2
              }
            },
            '& .MuiAlert-action': {
              '& .MuiButton-root': {
                marginRight: 4,
                marginTop: 0
              },
              '& .MuiIconButton-root': {
                color: theme.palette.background.default,
                '&.MuiIconButton-colorSecondary': {
                  backgroundColor: theme.palette.secondary.main,
                  '&:hover': {
                    backgroundColor: theme.palette.secondary.dark
                  }
                }
              }
            },
            '&:not(.MuiAlert-outlined)': {
              '& .MuiAlert-action': {
                '& .MuiIconButton-root': {
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.background.default, 0.25)
                  }
                }
              }
            }
          }
        }
      }
    }
  };
}
