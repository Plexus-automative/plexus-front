// material-ui
import { Theme } from '@mui/material/styles';

// project imports
import getColors from 'utils/getColors';
import getShadow from 'utils/getShadow';

// types
import { ColorProps } from 'types/extended';
import { PickersTextFieldProps } from '@mui/x-date-pickers';

interface Props {
  variant: ColorProps;
  theme: Theme;
}

// ==============================|| OVERRIDES - INPUT BORDER & SHADOWS ||============================== //

function getColor({ variant, theme }: Props) {
  const colors = getColors(theme, variant);
  const { light } = colors;

  const shadows = getShadow(theme, `${variant}`);

  return {
    '&:hover .MuiPickersOutlinedInput-notchedOutline': {
      borderColor: light
    },
    '&.Mui-focused': {
      boxShadow: shadows,
      '& .MuiPickersOutlinedInput-notchedOutline': {
        border: '1px solid',
        borderColor: light
      }
    }
  };
}

// ==============================|| OVERRIDES - PICKERS TEXT FIELD ||============================== //

export default function PickersTextField(theme: Theme) {
  return {
    MuiPickersTextField: {
      defaultProps: {
        variant: 'outlined',
        color: 'primary'
      },
      styleOverrides: {
        root: {
          '& .MuiPickersInputBase-sectionsContainer': {
            padding: '14px 14px 14px 0px'
          },
          '& .MuiPickersOutlinedInput-notchedOutline': {
            borderColor: theme.palette.secondary[400],
            ...theme.applyStyles('dark', { borderColor: theme.palette.secondary[200] })
          },
          variants: [
            {
              props: { variant: 'outlined' },
              style: ({ color }: PickersTextFieldProps) => {
                return {
                  '& .MuiPickersInputBase-root': {
                    ...getColor({ variant: color, theme })
                  }
                };
              }
            },
            {
              props: { size: 'small' },
              style: {
                '& .MuiPickersInputBase-sectionsContainer': {
                  padding: '10px 10px 10px 0px'
                }
              }
            }
          ]
        }
      }
    }
  };
}
