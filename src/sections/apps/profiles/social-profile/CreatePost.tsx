// material-ui
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

// project-imports
import MainCard from 'components/MainCard';

// assets
import { AttachSquare, EmojiHappy, Gallery } from '@wandersonalwes/iconsax-react';

// ==============================|| SOCIAL PROFILE - CREATE POST ||============================== //

export default function CreatePost() {
  return (
    <MainCard>
      <TextField placeholder="What's new, Stebin?" fullWidth multiline rows={3} />
      <Stack direction="row" sx={{ mt: 2, justifyContent: 'space-between' }}>
        <Stack direction="row" gap={1}>
          <IconButton color="warning">
            <EmojiHappy />
          </IconButton>
          <Divider orientation="vertical" />
          <IconButton>
            <Gallery />
          </IconButton>
          <IconButton>
            <AttachSquare />
          </IconButton>
        </Stack>
        <Stack>
          <Button variant="contained">Post</Button>
        </Stack>
      </Stack>
    </MainCard>
  );
}
