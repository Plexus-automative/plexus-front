'use client';

import { useEffect } from 'react';

// next
import { useRouter, usePathname } from 'next/navigation';

// material-ui
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Box from '@mui/material/Box';

// project-imports
import { handlerActiveItem, useGetMenuMaster } from 'api/menu';
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import MainCard from 'components/MainCard';
import { APP_DEFAULT_PATH, GRID_COMMON_SPACING } from 'config';
import TabProfile from 'sections/apps/profiles/account/TabProfile';
import TabPersonal from 'sections/apps/profiles/account/TabPersonal';
import TabAccount from 'sections/apps/profiles/account/TabAccount';
import TabPassword from 'sections/apps/profiles/account/TabPassword';
import TabRole from 'sections/apps/profiles/account/TabRole';
import TabSettings from 'sections/apps/profiles/account/TabSettings';

// assets
import { DocumentText, Lock, Profile, Profile2User, Setting3, TableDocument } from '@wandersonalwes/iconsax-react';

type Props = {
  tab: string;
};

// ==============================|| PROFILE - ACCOUNT ||============================== //

export default function AccountProfile({ tab }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { menuMaster } = useGetMenuMaster();

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    router.replace(`/apps/profiles/account/${newValue}`);
  };

  let breadcrumbTitle = '';
  let breadcrumbHeading = '';

  switch (tab) {
    case 'personal':
      breadcrumbTitle = 'personal';
      breadcrumbHeading = 'personal';
      break;
    case 'my-account':
      breadcrumbTitle = 'my account';
      breadcrumbHeading = 'my account';
      break;
    case 'password':
      breadcrumbTitle = 'change password';
      breadcrumbHeading = 'change password';
      break;
    case 'role':
      breadcrumbTitle = 'role';
      breadcrumbHeading = 'accountant';
      break;
    case 'settings':
      breadcrumbTitle = 'settings';
      breadcrumbHeading = 'account settings';
      break;
    case 'basic':
    default:
      breadcrumbTitle = 'basic';
      breadcrumbHeading = 'basic account';
  }

  let breadcrumbLinks = [
    { title: 'home', to: APP_DEFAULT_PATH },
    { title: 'account-profile', to: '/apps/profiles/account/basic' },
    { title: breadcrumbTitle }
  ];
  if (tab === 'basic') {
    breadcrumbLinks = [{ title: 'home', to: APP_DEFAULT_PATH }, { title: 'account-profile' }];
  }

  useEffect(() => {
    if (menuMaster.openedItem !== 'account-profile') handlerActiveItem('account-profile');
    // eslint-disable-next-line
  }, [pathname]);

  return (
    <>
      <Breadcrumbs custom heading={breadcrumbHeading} links={breadcrumbLinks} />
      <MainCard border={false}>
        <Stack sx={{ gap: GRID_COMMON_SPACING }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%' }}>
            <Tabs value={tab} onChange={handleChange} variant="scrollable" scrollButtons="auto" aria-label="account profile tab">
              <Tab label="Profile" icon={<Profile />} value="basic" iconPosition="start" />
              <Tab label="Personal" icon={<DocumentText />} value="personal" iconPosition="start" />
              <Tab label="My Account" icon={<TableDocument />} value="my-account" iconPosition="start" />
              <Tab label="Change Password" icon={<Lock />} value="password" iconPosition="start" />
              <Tab label="Role" icon={<Profile2User />} value="role" iconPosition="start" />
              <Tab label="Settings" icon={<Setting3 />} value="settings" iconPosition="start" />
            </Tabs>
          </Box>
          <Box>
            {tab === 'basic' && <TabProfile />}
            {tab === 'personal' && <TabPersonal />}
            {tab === 'my-account' && <TabAccount />}
            {tab === 'password' && <TabPassword />}
            {tab === 'role' && <TabRole />}
            {tab === 'settings' && <TabSettings />}
          </Box>
        </Stack>
      </MainCard>
    </>
  );
}
