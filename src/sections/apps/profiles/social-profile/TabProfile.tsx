// material-ui
import Stack from '@mui/material/Stack';

// project-imports
import CreatePost from './CreatePost';
import Post1 from './Post1';
import Post2 from './Post2';
import Stories from './Stories';
import { GRID_COMMON_SPACING } from 'config';

// ==============================|| SOCIAL PROFILE - TAB PROFILE ||============================== //

export default function TabProfile() {
  return (
    <Stack sx={{ gap: GRID_COMMON_SPACING }}>
      <CreatePost />
      <Stories />
      <Post1 />
      <Post2 />
    </Stack>
  );
}
