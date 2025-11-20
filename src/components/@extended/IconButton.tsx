'use client';

import { ReactNode, ReactPortal } from 'react';

// material-ui
import { alpha, styled } from '@mui/material/styles';
import MuiIconButton, { IconButtonProps } from '@mui/material/IconButton';

// project-imports
import getColors from 'utils/getColors';
import getShadow from 'utils/getShadow';

// types
import { ButtonVariantProps, ExtendedStyleProps, IconButtonShapeProps } from 'types/extended';

interface IconButtonStyleProps extends ExtendedStyleProps {
  variant?: ButtonVariantProps;
}

// ==============================|| ICON BUTTON - COLOR STYLE ||============================== //

function getColorStyle({ variant, theme, color }: IconButtonStyleProps) {
  const colors = getColors(theme, color);
  const { lighter, light, dark, darker, main, contrastText } = colors;

  const buttonShadow = `${color}Button`;
  const shadows = getShadow(theme, buttonShadow);

  const commonShadow = {
    '&::after': {
      boxShadow: `0 0 6px 6px ${alpha(main, 0.9)}`
    },
    '&:active::after': {
      boxShadow: `0 0 0 0 ${alpha(main, 0.9)}`
    },
    '&:focus-visible': {
      outline: `2px solid ${dark}`,
      outlineOffset: 2
    }
  };

  switch (variant) {
    case 'contained':
      return {
        color: contrastText,
        backgroundColor: main,
        '&:hover': {
          backgroundColor: dark
        },
        ...(color === 'secondary' && {
          ...theme.applyStyles('dark', { backgroundColor: light, '&:hover': { backgroundColor: lighter } })
        }),
        ...commonShadow
      };
    case 'light':
      return {
        color: main,
        backgroundColor: lighter,
        '&:hover': {
          backgroundColor: light
        },
        ...commonShadow
      };
    case 'shadow':
      return {
        boxShadow: shadows,
        color: contrastText,
        backgroundColor: main,
        '&:hover': {
          boxShadow: 'none',
          backgroundColor: dark
        },
        ...commonShadow
      };
    case 'outlined':
      return {
        '&:hover': {
          backgroundColor: 'transparent',
          color: dark,
          borderColor: dark
        },
        ...commonShadow
      };
    case 'dashed':
      return {
        backgroundColor: lighter,
        ...theme.applyStyles('dark', {
          color: darker,
          borderColor: dark
        }),
        '&:hover': {
          color: dark,
          borderColor: dark,
          backgroundColor: alpha(lighter, 0.2)
        },
        ...commonShadow
      };
    case 'text':
    default:
      return {
        '&:hover': { color: dark, ...theme.applyStyles('dark', { color: darker }), backgroundColor: lighter },
        ...commonShadow
      };
  }
}

interface StyleProps extends Omit<IconButtonStyleProps, 'theme'> {
  shape?: IconButtonShapeProps;
}

// ==============================|| ICON BUTTON - STYLED ||============================== //

const IconButtonStyle = styled(MuiIconButton, { shouldForwardProp: (prop) => prop !== 'variant' && prop !== 'shape' })<StyleProps>(
  ({ theme, variant, shape, color }) => ({
    position: 'relative',
    '::after': {
      content: '""',
      display: 'block',
      position: 'absolute',
      left: 0,
      top: 0,
      width: '100%',
      height: '100%',
      borderRadius: shape === 'rounded' ? '50%' : 8,
      opacity: 0,
      transition: 'all 0.5s'
    },

    ':active::after': {
      position: 'absolute',
      borderRadius: shape === 'rounded' ? '50%' : 8,
      left: 0,
      top: 0,
      opacity: 1,
      transition: '0s'
    },
    ...(shape === 'rounded' && {
      borderRadius: '50%'
    }),
    ...(variant === 'outlined' && {
      border: '1px solid',
      borderColor: 'inherit'
    }),
    ...(variant === 'dashed' && {
      border: '1px dashed',
      borderColor: 'inherit'
    }),
    ...(variant !== 'text' && {
      '&.Mui-disabled': {
        backgroundColor: theme.palette.secondary[200]
      }
    }),
    ...getColorStyle({ variant, theme, color })
  })
);

interface Props extends IconButtonProps {
  shape?: IconButtonShapeProps;
  variant?: ButtonVariantProps;
  children: ReactNode;
  tooltip?: boolean | ReactNode | ReactPortal;
}

// ==============================|| ICON BUTTON - EXTENDED ||============================== //

function IconButton({ variant = 'text', shape = 'square', children, color = 'primary', ref, ...others }: Props) {
  return (
    <IconButtonStyle ref={ref} variant={variant} shape={shape} color={color} {...others}>
      {children}
    </IconButtonStyle>
  );
}

IconButton.displayName = 'IconButton';

export default IconButton;
