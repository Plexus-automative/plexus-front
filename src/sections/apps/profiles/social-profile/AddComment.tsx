// material-ui
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Badge from '@mui/material/Badge';
import Divider from '@mui/material/Divider';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';

// project-imports
import Avatar from 'components/@extended/Avatar';
import IconButton from 'components/@extended/IconButton';

// assets
import { AttachSquare, EmojiHappy, Gallery, Send2 } from '@wandersonalwes/iconsax-react';
const Avatar6 = '/assets/images/users/avatar-6.png';

// ==============================|| SOCIAL PROFILE - ADD COMMENT ||============================== //

export default function AddComment() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Stack direction="row" sx={{ gap: 2, alignItems: 'center' }}>
      {!isMobile && (
        <Badge color="error" overlap="circular" variant="dot" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
          <Avatar alt="profile" src={Avatar6} />
        </Badge>
      )}

      <OutlinedInput
        fullWidth
        size="small"
        placeholder="Type a something..."
        sx={{ pl: 0.5 }}
        startAdornment={
          <InputAdornment position="start">
            <Stack direction="row" sx={{ alignItems: 'center' }}>
              <IconButton size="small" color="warning">
                <EmojiHappy style={{ color: 'inherit' }} />
              </IconButton>
              <Divider orientation="vertical" flexItem />
            </Stack>
          </InputAdornment>
        }
        endAdornment={
          <InputAdornment position="end">
            <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
              <IconButton size="small" color="secondary">
                <Gallery />
              </IconButton>
              <IconButton size="small" color="secondary">
                <AttachSquare />
              </IconButton>
            </Stack>
          </InputAdornment>
        }
      />
      <IconButton variant="contained">
        <Send2 />
      </IconButton>
    </Stack>
  );
}
