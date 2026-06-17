// material-ui
import { styled, Theme, CSSObject } from '@mui/material/styles';
import Drawer from '@mui/material/Drawer';

// project-imports
import { DRAWER_WIDTH, MINI_DRAWER_WIDTH } from 'config';

const openedMixin = (theme: Theme): CSSObject => ({
  backgroundColor: '#111827',
  width: DRAWER_WIDTH,
  borderRight: '1px solid',
  borderRightColor: 'rgba(255, 255, 255, 0.1)',
  boxShadow: 'none',
  ...theme.applyStyles('dark', {
    borderRightColor: 'rgba(255, 255, 255, 0.1)',
    boxShadow: theme.customShadows.z1
  }),
  overflowX: 'hidden',

  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen
  })
});

const closedMixin = (theme: Theme): CSSObject => ({
  overflow: 'hidden',
  backgroundColor: '#111827',

  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen
  }),

  overflowX: 'hidden',
  width: MINI_DRAWER_WIDTH,
  borderRight: '1px solid',
  borderRightColor: 'rgba(255, 255, 255, 0.1)',
  boxShadow: theme.customShadows.z1
});

// ==============================|| DRAWER - MINI STYLED ||============================== //

const MiniDrawerStyled = styled(Drawer, { shouldForwardProp: (prop) => prop !== 'open' })(({ theme, open }) => ({
  width: DRAWER_WIDTH,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  ...(open && {
    ...openedMixin(theme),
    '& .MuiDrawer-paper': openedMixin(theme)
  }),
  ...(!open && {
    ...closedMixin(theme),
    '& .MuiDrawer-paper': closedMixin(theme)
  })
}));

export default MiniDrawerStyled;
