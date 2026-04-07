'use client';

import { useEffect, ReactNode } from 'react';

// material-ui
import useMediaQuery from '@mui/material/useMediaQuery';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Link from 'next/link';

// icons
import { ShoppingCart, TaskSquare, DocumentText, TruckTime, BoxTick } from '@wandersonalwes/iconsax-react';

// project-imports
import Drawer from './Drawer';
import Header from './Header';
import HorizontalBar from './Drawer/HorizontalBar';
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import Loader from 'components/Loader';
import AddCustomer from 'sections/apps/customer/AddCustomer';

import { handlerDrawerOpen, useGetMenuMaster } from 'api/menu';
import { DRAWER_WIDTH, MenuOrientation } from 'config';
import useConfig from 'hooks/useConfig';
import { Toolbar } from '@mui/material';

// ==============================|| MAIN LAYOUT ||============================== //

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { menuMasterLoading } = useGetMenuMaster();
  const downXL = useMediaQuery((theme) => theme.breakpoints.down('xl'));
  const downLG = useMediaQuery((theme) => theme.breakpoints.down('lg'));

  const { container, miniDrawer, menuOrientation } = useConfig();

  const isHorizontal = menuOrientation === MenuOrientation.HORIZONTAL && !downLG;

  // set media wise responsive drawer
  useEffect(() => {
    if (!miniDrawer) {
      handlerDrawerOpen(!downXL);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [downXL]);

  if (menuMasterLoading) return <Loader />;

  return (
    <Box sx={{ display: 'flex', width: '100%' }}>
      <Header />
      {!isHorizontal ? <Drawer /> : <HorizontalBar />}

      <Box component="main" sx={{ width: `calc(100% - ${DRAWER_WIDTH}px)`, flexGrow: 1, p: { xs: 1, sm: 3 } }}>
        <Toolbar sx={{ mt: isHorizontal ? 8 : 'inherit', mb: isHorizontal ? 2 : 'inherit' }} />
        <Container
          maxWidth={container && !downXL ? 'xl' : false}
          sx={{
            ...(container && !downXL && { px: { xs: 0, sm: 3 } }),
            position: 'relative',
            minHeight: 'calc(100vh - 124px)',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Breadcrumbs />
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start', gap: 1, mb: 2 }}>
            <Button
              component={Link}
              href="/panier"
              variant="outlined"
              color="secondary"
              size="small"
              startIcon={<ShoppingCart size={18} variant="Outline" />}
              sx={{ textTransform: 'none', minWidth: 155 }}
            >
              Panier
            </Button>
            <Button
              component={Link}
              href="/pages/commandes-emis/non-traitees"
              variant="outlined"
              color="secondary"
              size="small"
              startIcon={<TaskSquare size={18} variant="Outline" />}
              sx={{ textTransform: 'none', minWidth: 155 }}
            >
              Commande en attente
            </Button>
            <Button
              component={Link}
              href="/pages/commandes-recus/non-traitees"
              variant="outlined"
              color="secondary"
              size="small"
              startIcon={<DocumentText size={18} variant="Outline" />}
              sx={{ textTransform: 'none', minWidth: 155 }}
            >
              Commandes reçues
            </Button>
            <Button
              component={Link}
              href="/pages/commandes-recus/en-cours"
              variant="outlined"
              color="secondary"
              size="small"
              startIcon={<TruckTime size={18} variant="Outline" />}
              sx={{ textTransform: 'none', minWidth: 155 }}
            >
              Etat de livraison
            </Button>
          </Box>
          {children}
        </Container>

      </Box>
      <AddCustomer />
    </Box>
  );
}
