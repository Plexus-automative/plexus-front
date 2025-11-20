import { useMemo } from 'react';

// material-ui
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';

// project-imports
import FullScreen from './FullScreen';
import Localization from './Localization';
import MegaMenuSection from './MegaMenuSection';
import Message from './Message';
import MobileSection from './MobileSection';
import Notification from './Notification';
import Profile from './Profile';
import Search from './Search';

import { MenuOrientation } from 'config';
import useConfig from 'hooks/useConfig';
import DrawerHeader from 'layout/DashboardLayout/Drawer/DrawerHeader';

// ==============================|| HEADER - CONTENT ||============================== //

export default function HeaderContent() {
  const { menuOrientation } = useConfig();

  const downLG = useMediaQuery((theme: Theme) => theme.breakpoints.down('lg'));

  const localization = useMemo(() => <Localization />, []);

  const megaMenu = useMemo(() => <MegaMenuSection />, []);

  return (
    <>
      {menuOrientation === MenuOrientation.HORIZONTAL && !downLG && <DrawerHeader open={true} />}
      {!downLG && <Search />}
      {!downLG && megaMenu}
      {!downLG && localization}
      {downLG && <Box sx={{ width: 1, ml: 1 }} />}

      <Notification />
      {!downLG && <FullScreen />}
      <Message />
      {!downLG && <Profile />}
      {downLG && <MobileSection />}
    </>
  );
}
