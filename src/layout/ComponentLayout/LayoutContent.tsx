'use client';

import { ReactNode, useEffect } from 'react';

// material-ui
import { styled } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';

// project-imports
import Drawer from './Drawer';
import { handlerComponentDrawer, useGetMenuMaster } from 'api/menu';
import { DRAWER_WIDTH } from 'config';

// component content
const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{ open: boolean }>(({ theme }) => ({
  minHeight: `calc(100vh - 180px)`,
  width: `calc(100% - ${DRAWER_WIDTH}px)`,
  flexGrow: 1,
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen
  }),
  [theme.breakpoints.down('md')]: {
    paddingLeft: 0
  },
  variants: [
    {
      props: ({ open }) => open,
      style: {
        transition: theme.transitions.create('margin', {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen
        })
      }
    }
  ]
}));

interface Props {
  children: ReactNode;
}

// ==============================|| COMPONENTS LAYOUT ||============================== //

export default function LayoutContent({ children }: Props) {
  const downMD = useMediaQuery((theme) => theme.breakpoints.down('md'));

  const { menuMaster } = useGetMenuMaster();

  useEffect(() => {
    handlerComponentDrawer(!downMD);
  }, [downMD]);

  return (
    <Box sx={{ display: 'flex', pt: menuMaster.isComponentDrawerOpened ? { xs: 0, md: 2.5 } : 0 }}>
      <Drawer />
      <Main open={menuMaster.isComponentDrawerOpened}>{children}</Main>
    </Box>
  );
}
