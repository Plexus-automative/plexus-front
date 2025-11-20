// material-ui
import Button from '@mui/material/Button';
import CardMedia from '@mui/material/CardMedia';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project-imports
import Avatar from 'components/@extended/Avatar';
import MainCard from 'components/MainCard';

// assets
const ImageProfile = '/assets/images/profile/social-profile/img-profile-cover.jpg';
const ProfileAvatar = '/assets/images/profile/social-profile/profile-avatar.jpg';

// ==============================|| SOCIAL PROFILE - PROFILE HERO ||============================== //

export default function ProfileHero() {
  return (
    <MainCard content={false}>
      <CardMedia component="img" src={ImageProfile} alt="profile-cover" />
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        sx={{ p: 3, pt: 0, gap: { xs: 1, sm: 3 }, alignItems: { xs: 'center', sm: 'flex-end' } }}
      >
        <Avatar
          alt="Avatar 2"
          src={ProfileAvatar}
          sx={{ mt: { xs: '-65px', sm: '-20px' }, width: 90, height: 90, border: '4px solid', borderColor: 'background.paper' }}
        />
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          sx={{ justifyContent: 'space-between', alignItems: { xs: 'center', sm: 'flex-end' }, gap: { xs: 2, sm: 3 }, width: 1 }}
        >
          <Stack sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
            <Typography variant="h5">Stebin Ben</Typography>
            <Typography>UI/UX Designer</Typography>
          </Stack>
          <Stack direction="row" sx={{ gap: 1 }}>
            <Button variant="contained">Message</Button>
            <Button variant="outlined" color="secondary">
              Follow
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </MainCard>
  );
}
