// material-ui
import { Theme } from '@mui/material/styles';
import { PaginationProps } from '@mui/material/Pagination';

// project-imports
import getColors from 'utils/getColors';

// types
import { ExtendedStyleProps } from 'types/extended';

interface PaginationStyleProps extends ExtendedStyleProps {
  variant: PaginationProps['variant'];
}

// ==============================|| PAGINATION ITEM - COLORS ||============================== //

function getColorStyle({ variant, color, theme }: PaginationStyleProps) {
  const colors = getColors(theme, color);
  const { lighter, light, dark, main, contrastText } = colors;

  const focusStyle = {
    '&:focus-visible': {
      outline: `2px solid ${dark}`,
      outlineOffset: 2,
      ...(variant === 'text' && {
        backgroundColor: theme.palette.background.paper
      })
    }
  };

  switch (variant) {
    case 'combined':
    case 'contained':
      return {
        color: color === 'secondary' ? lighter : contrastText,
        backgroundColor: main,
        '&:hover': {
          backgroundColor: light
        },
        ...focusStyle
      };
    case 'outlined':
      return {
        borderColor: main,
        '&:hover': {
          backgroundColor: lighter,
          borderColor: light
        },
        ...focusStyle
      };
    case 'text':
    default:
      return {
        color: main,
        '&:hover': {
          backgroundColor: main,
          color: lighter
        },
        ...focusStyle
      };
  }
}

// ==============================|| OVERRIDES - PAGINATION ITEM ||============================== //

export default function PaginationItem(theme: Theme) {
  return {
    MuiPaginationItem: {
      styleOverrides: {
        root: {
          '&:focus-visible': {
            outline: `2px solid ${theme.palette.secondary.dark}`,
            outlineOffset: 2
          },
          marginTop: '4px',
          marginBottom: '4px'
        },
        text: {
          '&.Mui-selected': {
            backgroundColor: 'transparent',
            fontSize: '1rem',
            fontWeight: 500,
            '&.MuiPaginationItem-text.MuiPaginationItem-colorPrimary': getColorStyle({ variant: 'text', color: 'primary', theme }),
            '&.MuiPaginationItem-text.MuiPaginationItem-colorSecondary': getColorStyle({ variant: 'text', color: 'secondary', theme }),
            '&.MuiPaginationItem-text.MuiPaginationItem-colorError': getColorStyle({ variant: 'text', color: 'error', theme }),
            '&.MuiPaginationItem-text.MuiPaginationItem-colorSuccess': getColorStyle({ variant: 'text', color: 'success', theme }),
            '&.MuiPaginationItem-text.MuiPaginationItem-colorInfo': getColorStyle({ variant: 'text', color: 'info', theme }),
            '&.MuiPaginationItem-text.MuiPaginationItem-colorWarning': getColorStyle({ variant: 'text', color: 'warning', theme })
          }
        },
        contained: {
          '&.Mui-selected': {
            '&.MuiPaginationItem-containedPrimary': getColorStyle({ variant: 'contained', color: 'primary', theme }),
            '&.MuiPaginationItem-containedSecondary': getColorStyle({ variant: 'contained', color: 'secondary', theme }),
            '&.MuiPaginationItem-containedError': getColorStyle({ variant: 'contained', color: 'error', theme }),
            '&.MuiPaginationItem-containedSuccess': getColorStyle({ variant: 'contained', color: 'success', theme }),
            '&.MuiPaginationItem-containedInfo': getColorStyle({ variant: 'contained', color: 'info', theme }),
            '&.MuiPaginationItem-containedWarning': getColorStyle({ variant: 'contained', color: 'warning', theme })
          }
        },
        combined: {
          border: '1px solid',
          borderColor: theme.palette.divider,
          '&.MuiPaginationItem-ellipsis': {
            border: 'none'
          },
          '&.Mui-selected': {
            '&.MuiPaginationItem-combinedPrimary': getColorStyle({ variant: 'combined', color: 'primary', theme }),
            '&.MuiPaginationItem-combinedSecondary': getColorStyle({ variant: 'combined', color: 'secondary', theme }),
            '&.MuiPaginationItem-combinedError': getColorStyle({ variant: 'combined', color: 'error', theme }),
            '&.MuiPaginationItem-combinedSuccess': getColorStyle({ variant: 'combined', color: 'success', theme }),
            '&.MuiPaginationItem-combinedInfo': getColorStyle({ variant: 'combined', color: 'info', theme }),
            '&.MuiPaginationItem-combinedWarning': getColorStyle({ variant: 'combined', color: 'warning', theme })
          }
        },
        outlined: {
          borderColor: theme.palette.divider,
          '&.Mui-selected': {
            backgroundColor: 'transparent',
            '&.MuiPaginationItem-outlined.MuiPaginationItem-colorPrimary': getColorStyle({ variant: 'outlined', color: 'primary', theme }),
            '&.MuiPaginationItem-outlined.MuiPaginationItem-colorSecondary': getColorStyle({
              variant: 'outlined',
              color: 'secondary',
              theme
            }),
            '&.MuiPaginationItem-outlined.MuiPaginationItem-colorError': getColorStyle({ variant: 'outlined', color: 'error', theme }),
            '&.MuiPaginationItem-outlined.MuiPaginationItem-colorSuccess': getColorStyle({ variant: 'outlined', color: 'success', theme }),
            '&.MuiPaginationItem-outlined.MuiPaginationItem-colorInfo': getColorStyle({ variant: 'outlined', color: 'info', theme }),
            '&.MuiPaginationItem-outlined.MuiPaginationItem-colorWarning': getColorStyle({ variant: 'outlined', color: 'warning', theme })
          }
        }
      }
    }
  };
}
