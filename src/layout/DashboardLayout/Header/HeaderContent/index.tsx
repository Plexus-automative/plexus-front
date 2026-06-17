import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';

// project-imports
import Livraison from './Livraison';
import Notification from './Notification';
import Profile from './Profile';
import Search from './Search';
import PecNotification from './PecNotification';

import { MenuOrientation } from 'config';
import useConfig from 'hooks/useConfig';
import useUser from 'hooks/useUser';
import DrawerHeader from 'layout/DashboardLayout/Drawer/DrawerHeader';
import Panier from './Panier';
import Emises from './Emises';
import Recues from './Recues';

// ==============================|| HEADER - CONTENT ||============================== //

export default function HeaderContent() {
  const { menuOrientation } = useConfig();
  const user = useUser();
  const userRole = user ? user.role : '';

  const downLG = useMediaQuery((theme: Theme) => theme.breakpoints.down('lg'));

  return (
    <>
      {menuOrientation === MenuOrientation.HORIZONTAL && !downLG && <DrawerHeader open={true} />}
      {!downLG && <Search />}
      {downLG && <Box sx={{ width: 1, ml: 1 }} />}

      {userRole !== 'Fournisseur' && <Panier />}
      {user?.customerNo === 'C0090' && <PecNotification />}
      {userRole !== 'Client' && <Recues />}
      {userRole !== 'Fournisseur' && <Emises />}
      {userRole !== 'Client' && <Livraison />}
      {userRole !== 'Fournisseur' && <Notification />}

      {!downLG && <Profile />}
    </>
  );
}
