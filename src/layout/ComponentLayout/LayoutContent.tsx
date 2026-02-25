'use client';

import { ReactNode } from 'react';

// material-ui
import { styled } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';

// project-imports
import { useGetMenuMaster } from 'api/menu';

// component content
const Main = styled('main')(({ theme }) => ({
  minHeight: `calc(100vh - 180px)`,
  width: '100%',
  flexGrow: 1,
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen
  }),
  [theme.breakpoints.down('md')]: {
    paddingLeft: 0
  }
}));

interface Props {
  children: ReactNode;
}

// ==============================|| COMPONENTS LAYOUT ||============================== //

export default function LayoutContent({ children }: Props) {
  // keep media hook in case layout adjustments are added later
  useMediaQuery((theme) => theme.breakpoints.down('md'));

  return (
    <Box sx={{ display: 'flex', pt: 0 }}>
      <Main>{children}</Main>
    </Box>
  );
} 
