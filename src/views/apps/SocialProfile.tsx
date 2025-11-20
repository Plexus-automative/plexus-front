'use client';

// next
import { useRouter } from 'next/navigation';

// material-ui
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';

// project imports
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import MainCard from 'components/MainCard';
import { APP_DEFAULT_PATH, GRID_COMMON_SPACING } from 'config';
import {
  BioBoard,
  Contact,
  Event,
  Followers,
  FollowersList,
  Gallery,
  ProfileHero,
  TabFriendRequest,
  TabFriends,
  TabGallery,
  TabProfile,
  TeamPages
} from 'sections/apps/profiles/social-profile';

// assets
import { Gallery as GalleryIcon, Profile2User, ProfileAdd, User } from '@wandersonalwes/iconsax-react';

type Props = { tab: string };

// ==============================|| PROFILE - SOCIAL PROFILE ||============================== //

export default function SocialProfile({ tab }: Props) {
  const router = useRouter();

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    router.replace(`/apps/profiles/social-profile/${newValue}`);
  };

  let breadcrumbTitle = '';

  switch (tab) {
    case 'friends':
      breadcrumbTitle = 'friends';
      break;
    case 'friend-requests':
      breadcrumbTitle = 'friend-requests';
      break;
    case 'gallery':
      breadcrumbTitle = 'gallery';
      break;
    case 'profile':
    default:
      breadcrumbTitle = 'profile';
  }

  const breadcrumbLinks = [
    { title: 'home', to: APP_DEFAULT_PATH },
    { title: 'social-profile', to: '/apps/profiles/social-profile/profile' },
    { title: breadcrumbTitle }
  ];

  return (
    <>
      <Breadcrumbs custom heading={breadcrumbTitle} links={breadcrumbLinks} />
      <Grid container spacing={GRID_COMMON_SPACING}>
        <Grid size={12}>
          <ProfileHero />
        </Grid>

        <Grid size={12}>
          <MainCard content={false}>
            <Tabs value={tab} onChange={handleChange} variant="scrollable" scrollButtons="auto">
              <Tab label="Profile" icon={<User size="18" />} iconPosition="start" value="profile" />
              <Tab
                icon={<Profile2User size="18" />}
                iconPosition="start"
                value="friends"
                label={
                  <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
                    <Typography>Friends</Typography>
                    <Chip label="99" size="small" color="secondary" sx={{ color: 'secondary.lighter' }} />
                  </Stack>
                }
              />
              <Tab label="Friend Requests" icon={<ProfileAdd size="18" />} iconPosition="start" value="friend-requests" />
              <Tab label="Gallery" icon={<GalleryIcon size="18" />} iconPosition="start" value="gallery" />
            </Tabs>
          </MainCard>
        </Grid>
        <Grid size={{ xs: 12, md: 8, xl: 9 }}>
          {tab === 'profile' && <TabProfile />}
          {tab === 'friends' && <TabFriends />}
          {tab === 'friend-requests' && <TabFriendRequest />}
          {tab === 'gallery' && <TabGallery />}
        </Grid>
        <Grid size={{ xs: 12, md: 4, xl: 3 }}>
          <Stack spacing={GRID_COMMON_SPACING}>
            <Followers />
            <BioBoard />
            <Gallery />
            <Contact />
            <Event />
            <FollowersList />
            <TeamPages />
          </Stack>
        </Grid>
      </Grid>
    </>
  );
}
