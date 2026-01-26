import { useMemo } from 'react';

// material-ui
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';

// project-imports
import Livraison from './Livraison';
import Notification from './Notification';
import Profile from './Profile';
import Search from './Search';

import { MenuOrientation } from 'config';
import useConfig from 'hooks/useConfig';
import DrawerHeader from 'layout/DashboardLayout/Drawer/DrawerHeader';
import Panier from './Panier';
import Emises from './Emises';
import Recues from './Recues';
// ==============================|| HEADER - CONTENT ||============================== //

export default function HeaderContent() {
  
  const { menuOrientation } = useConfig();

  const downLG = useMediaQuery((theme: Theme) => theme.breakpoints.down('lg'));



  return (
    <>
      {menuOrientation === MenuOrientation.HORIZONTAL && !downLG && <DrawerHeader open={true} />}
      {!downLG && <Search />}
      {downLG && <Box sx={{ width: 1, ml: 1 }} />}

      <Notification />
      <Panier/>
      <Livraison/>
      <Emises/>
      <Recues/>
      
      {!downLG && <Profile />}
    </>
  );
}
