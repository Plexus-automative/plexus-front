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

// ==============================|| SOCIAL PROFILE - POST COMMENT ||============================== //

export default function PostComment({ isReply }: { isReply: boolean }) {
  return (
    <Box sx={{ position: 'relative' }}>
      <MainCard border={false} sx={{ bgcolor: 'secondary.lighter' }}>
        <Stack sx={{ gap: 1.5 }}>
          <PostHeader header="John Doe" subHeader="2 hour ago" avatarImg={Avatar6} status="success" />
          <Typography sx={{ ml: 6 }}>
            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry&apos;s standard
            dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.
          </Typography>
          <Link href="#" sx={{ ml: 6 }}>
            https://phoenixcoded.net/
          </Link>
        </Stack>
      </MainCard>
      {isReply && (
        <Divider orientation="vertical" sx={{ position: 'absolute', left: 28, height: 130, border: 1, borderColor: 'secondary.lighter' }} />
      )}
    </Box>
  );
}
