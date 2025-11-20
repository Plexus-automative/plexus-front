// material-ui
import { Theme } from '@mui/material/styles';
import { TableCellProps } from '@mui/material/TableCell';

// ==============================|| OVERRIDES - TABLE CELL ||============================== //

export default function TableCell(theme: Theme) {
  const commonCell = {
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    '&:not(:last-of-type)': {
      backgroundImage: `linear-gradient(${theme.palette.divider}, ${theme.palette.divider})`,
      backgroundRepeat: 'no-repeat',
      /* 1px wide, shorter than full height */
      backgroundSize: '1px calc(100% - 30px)',
      /* 16px from top */
      backgroundPosition: 'right 16px'
    }
  };

  return {
    MuiTableCell: {
      styleOverrides: {
        root: ({ ownerState }: { ownerState: TableCellProps }) => {
          const baseStyle = {
            fontSize: '0.875rem',
            padding: 12,
            borderColor: theme.palette.divider
          };

          const align = ownerState.align;

          if (align === 'right') {
            return {
              ...baseStyle,
              justifyContent: 'flex-end',
              textAlign: 'right',
              '& > *': {
                justifyContent: 'flex-end',
                margin: '0 0 0 auto'
              },
              '& .MuiOutlinedInput-input': {
                textAlign: 'right'
              }
            };
          }

          if (align === 'center') {
            return {
              ...baseStyle,
              justifyContent: 'center',
              textAlign: 'center',
              '& > *': {
                justifyContent: 'center',
                margin: '0 auto'
              }
            };
          }

          return baseStyle;
        },
        sizeSmall: { padding: 8 },
        head: { fontWeight: 700, ...commonCell },
        footer: { ...commonCell }
      }
    }
  };
}
