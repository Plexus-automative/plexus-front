// material-ui
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project-imports
import PostHeader from './PostHeader';
import MainCard from 'components/MainCard';

// assets
const Avatar6 = '/assets/images/users/avatar-6.png';

// ==============================|| SOCIAL PROFILE - COMMENT REPLY ||============================== //

export default function CommentReply() {
  return (
    <Box sx={{ position: 'relative' }}>
      <MainCard border={false} sx={{ bgcolor: 'secondary.lighter', ml: 8 }}>
        <PostHeader header="John Doe" subHeader="2 hour ago" avatarImg={Avatar6} status="warning" />
        <MainCard sx={{ ml: 6, mt: 2 }}>
          <Stack sx={{ gap: 1 }}>
            <Typography variant="subtitle1">Lorem Ipsum is simply dummy</Typography>
            <Typography>Lorem Ipsum has been the industry&apos;s standard dummy text ever since the 1500s.</Typography>
            <Link sx={{ overflowWrap: 'anywhere' }} href="#">
              https://phoenixcoded.net/
            </Link>
          </Stack>
        </MainCard>
      </MainCard>
      <Divider
        orientation="horizontal"
        sx={{ position: 'absolute', left: 29, top: 44, width: 35, border: 1, borderColor: 'secondary.lighter' }}
      />
    </Box>
  );
}
