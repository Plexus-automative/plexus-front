// next
import Link from 'next/link';

// material-ui
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Links from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project-imports
import MainCard from 'components/MainCard';

// assets
import { Clock } from '@wandersonalwes/iconsax-react';

const Avatar1 = '/assets/images/users/avatar-5.png';
const Avatar2 = '/assets/images/users/avatar-6.png';
const Avatar3 = '/assets/images/users/avatar-7.png';

// ===========================|| DATA WIDGET - USER ACTIVITY ||=========================== //

export default function UserActivity() {
  return (
    <MainCard
      title="User Activity"
      content={false}
      secondary={
        <Links component={Link} href="#" color="primary">
          View all
        </Links>
      }
    >
      <CardContent>
        <Grid container spacing={3} sx={{ alignItems: 'center' }}>
          <Grid size={12}>
            <Grid container spacing={2}>
              <Grid>
                <Badge variant="dot" overlap="circular" color="error" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                  <Avatar alt="image" src={Avatar1} />
                </Badge>
              </Grid>
              <Grid size="grow">
                <Typography variant="subtitle1">John Deo</Typography>
                <Typography variant="caption" color="secondary">
                  Lorem Ipsum is simply dummy text.
                </Typography>
              </Grid>
              <Grid>
                <Stack direction="row" sx={{ gap: 0.5, alignItems: 'center' }}>
                  <Typography variant="caption" color="secondary">
                    now
                  </Typography>
                  <Clock size={14} />
                </Stack>
              </Grid>
            </Grid>
          </Grid>
          <Grid size={12}>
            <Grid container spacing={2}>
              <Grid>
                <Box sx={{ position: 'relative' }}>
                  <Badge variant="dot" overlap="circular" color="success" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                    <Avatar alt="image" src={Avatar2} />
                  </Badge>
                </Box>
              </Grid>
              <Grid size="grow">
                <Typography variant="subtitle1">John Deo</Typography>
                <Typography variant="caption" color="secondary">
                  Lorem Ipsum is simply dummy text.
                </Typography>
              </Grid>
              <Grid>
                <Stack direction="row" sx={{ gap: 0.5, alignItems: 'center' }}>
                  <Typography variant="caption" color="secondary">
                    2 min ago
                  </Typography>
                  <Clock size={14} />
                </Stack>
              </Grid>
            </Grid>
          </Grid>
          <Grid size={12}>
            <Grid container spacing={2}>
              <Grid>
                <Box sx={{ position: 'relative' }}>
                  <Badge variant="dot" overlap="circular" color="primary" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                    <Avatar alt="image" src={Avatar3} />
                  </Badge>
                </Box>
              </Grid>
              <Grid size="grow">
                <Typography variant="subtitle1">John Deo</Typography>
                <Typography variant="caption" color="secondary">
                  Lorem Ipsum is simply dummy text.
                </Typography>
              </Grid>
              <Grid>
                <Stack direction="row" sx={{ gap: 0.5, alignItems: 'center' }}>
                  <Typography variant="caption" color="secondary">
                    1 day ago
                  </Typography>
                  <Clock size={14} />
                </Stack>
              </Grid>
            </Grid>
          </Grid>
          <Grid size={12}>
            <Grid container spacing={2}>
              <Grid>
                <Box sx={{ position: 'relative' }}>
                  <Badge variant="dot" overlap="circular" color="warning" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                    <Avatar alt="image" src={Avatar1} />
                  </Badge>
                </Box>
              </Grid>
              <Grid size="grow">
                <Typography variant="subtitle1">John Deo</Typography>
                <Typography variant="caption" color="secondary">
                  Lorem Ipsum is simply dummy text.
                </Typography>
              </Grid>
              <Grid>
                <Stack direction="row" sx={{ gap: 0.5, alignItems: 'center' }}>
                  <Typography variant="caption" color="secondary">
                    3 week ago
                  </Typography>
                  <Clock size={14} />
                </Stack>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </MainCard>
  );
}
