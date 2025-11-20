'use client';

import { ReactNode } from 'react';

// material-ui
import { alpha, styled } from '@mui/material/styles';
import MuiAvatar, { AvatarProps } from '@mui/material/Avatar';

// project-imports
import getColors from 'utils/getColors';

// types
import { AvatarTypeProps, ColorProps, ExtendedStyleProps, SizeProps } from 'types/extended';

// ==============================|| AVATAR - COLOR STYLE ||============================== //

interface AvatarStyleProps extends ExtendedStyleProps {
  variant?: AvatarProps['variant'];
  type?: AvatarTypeProps;
}

function getColorStyle({ variant, theme, color, type }: AvatarStyleProps) {
  const colors = getColors(theme, color);
  const { lighter, light, main, contrastText } = colors;

  switch (type) {
    case 'filled':
      return {
        color: contrastText,
        ...theme.applyStyles('dark', { ...(color === 'secondary' && { color: lighter }) }),
        backgroundColor: main
      };
    case 'outlined':
      return {
        color: main,
        border: '1px solid',
        borderColor: main,
        backgroundColor: 'transparent'
      };
    case 'combined':
      return {
        color: main,
        border: '1px solid',
        borderColor: light,
        backgroundColor: alpha(lighter, 0.8)
      };
    default:
      return {
        color: main,
        backgroundColor: alpha(lighter, 0.8),
        ...theme.applyStyles('dark', { backgroundColor: alpha(lighter, 0.25) })
      };
  }
}

// ==============================|| AVATAR - SIZE STYLE ||============================== //

function getSizeStyle(size?: SizeProps) {
  switch (size) {
    case 'badge':
      return {
        border: '2px solid',
        fontSize: '0.675rem',
        width: 20,
        height: 20,
        '& svg': {
          width: 10,
          height: 10
        }
      };
    case 'xs':
      return {
        fontSize: '0.75rem',
        width: 24,
        height: 24,
        '& svg': {
          width: 14,
          height: 14
        }
      };
    case 'sm':
      return {
        fontSize: '0.875rem',
        width: 32,
        height: 32,
        '& svg': {
          width: 18,
          height: 18
        }
      };
    case 'lg':
      return {
        fontSize: '1.2rem',
        width: 52,
        height: 52,
        '& svg': {
          width: 28,
          height: 28
        }
      };
    case 'xl':
      return {
        fontSize: '1.5rem',
        width: 64,
        height: 64,
        '& svg': {
          width: 36,
          height: 36
        }
      };
    case 'md':
    default:
      return {
        fontSize: '1rem',
        width: 40,
        height: 40,
        '& svg': {
          width: 20,
          height: 20
        }
      };
  }
}

// ==============================|| AVATAR - STYLED ||============================== //

interface StyleProps {
  color: ColorProps;
  type?: AvatarTypeProps;
  size?: SizeProps;
}

const AvatarStyle = styled(MuiAvatar, { shouldForwardProp: (prop) => prop !== 'color' && prop !== 'type' && prop !== 'size' })<StyleProps>(
  ({ theme, color, type, size }) => ({
    ...getSizeStyle(size),
    ...getColorStyle({ theme, color, type }),
    ...(size === 'badge' && {
      borderColor: theme.palette.background.default
    })
  })
);

// ==============================|| AVATAR - EXTENDED ||============================== //

interface Props extends AvatarProps {
  color?: ColorProps;
  children?: ReactNode | string;
  type?: AvatarTypeProps;
  size?: SizeProps;
}

export default function Avatar({ children, color = 'primary', type, size = 'md', ...others }: Props) {
  return (
    <AvatarStyle color={color} type={type} size={size} {...others}>
      {children}
    </AvatarStyle>
  );
}
