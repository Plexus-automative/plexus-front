// material-ui
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project-imports
import Avatar from 'components/@extended/Avatar';
import MainCard from 'components/MainCard';

// assets
import { Lock1 } from '@wandersonalwes/iconsax-react';

// ===========================|| STATISTICS - PERMISSION BLOCK ||=========================== //

export default function PermissionBlock() {
  return (
    <MainCard sx={{ bgcolor: 'primary.lighter' }}>
      <Stack sx={{ gap: 1.5, alignItems: 'center' }}>
        <Avatar type="filled" variant="rounded">
          <Lock1 />
        </Avatar>
        <Stack sx={{ gap: 0.5, alignItems: 'center' }}>
          <Typography variant="h5">Unlock All Features</Typography>
          <Typography>Unlock All Features</Typography>
        </Stack>
        <Button fullWidth variant="contained">
          Upgrade to premium
        </Button>
      </Stack>
    </MainCard>
  );
}
