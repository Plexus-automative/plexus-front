// material-ui
import { styled, Theme } from '@mui/material/styles';
import MuiTooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import Box from '@mui/material/Box';

// project-imports
import getColors from 'utils/getColors';

// types
import { ColorProps } from 'types/extended';

interface TooltipStyleProps {
  color?: ColorProps | string;
  labelColor?: ColorProps | string;
  theme: Theme;
}

// ==============================|| TOOLTIP - VARIANT ||============================== //

function getVariantStyle({ color, theme, labelColor }: TooltipStyleProps) {
  const colors = getColors(theme, color as ColorProps);
  const { main, contrastText } = colors;
  const colorValue = color ? color : '';

  if (['primary', 'secondary', 'info', 'success', 'warning', 'error'].includes(colorValue)) {
    return {
      [`& .${tooltipClasses.tooltip}`]: {
        backgroundColor: main,
        color: labelColor ? labelColor : contrastText
      },
      [`& .${tooltipClasses.arrow}`]: {
        color: main
      }
    };
  } else {
    return {
      [`& .${tooltipClasses.tooltip}`]: {
        backgroundColor: colorValue,
        color: labelColor ? labelColor : contrastText,
        boxShadow: theme.shadows[1]
      },
      [`& .${tooltipClasses.arrow}`]: {
        color: colorValue
      }
    };
  }
}

// ==============================|| TOOLTIP - COLOR STYLED ||============================== //

interface StyleProps {
  arrow: TooltipProps['arrow'];
  labelColor?: ColorProps | string;
  color?: ColorProps | string;
}

const TooltipStyle = styled(({ className, ...props }: TooltipProps) => <MuiTooltip {...props} classes={{ popper: className }} />, {
  shouldForwardProp: (prop) => prop !== 'color' && prop !== 'labelColor'
})<StyleProps>(({ theme, color, labelColor }) => ({
  ...(color && getVariantStyle({ color, theme, labelColor }))
}));

// ==============================|| TOOLTIP - EXTENDED ||============================== //

interface Props extends TooltipProps {
  color?: ColorProps | string;
  labelColor?: ColorProps | string;
  children: TooltipProps['children'];
}

export default function CustomTooltip({ children, arrow, labelColor = '', ...rest }: Props) {
  return (
    <Box sx={{ display: 'flex' }}>
      <TooltipStyle arrow={arrow} {...rest} labelColor={labelColor}>
        {children}
      </TooltipStyle>
    </Box>
  );
}
