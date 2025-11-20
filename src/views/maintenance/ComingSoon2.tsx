'use client';

// material-ui
import useMediaQuery from '@mui/material/useMediaQuery';
import Button from '@mui/material/Button';
import CardMedia from '@mui/material/CardMedia';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// third-party
import { useTimer } from 'react-timer-hook';

// project-imports
import IconButton from 'components/@extended/IconButton';
import MainCard from 'components/MainCard';

// assets
import { Facebook, Google, Notification } from '@wandersonalwes/iconsax-react';
const coming = '/assets/images/maintenance/img-soon-2.svg';

// ==============================|| COMING SOON ||============================== //

function TimerBox({ count }: { count: number }) {
  const downSM = useMediaQuery((theme) => theme.breakpoints.down('sm'));

  return (
    <MainCard content={false} sx={{ width: { xs: 60, sm: 80 } }}>
      <Stack sx={{ justifyContent: 'center', alignItems: 'center' }}>
        <Box sx={{ py: 1.75 }}>
          <Typography variant={downSM ? 'h4' : 'h2'}>{count}</Typography>
        </Box>
      </Stack>
    </MainCard>
  );
}

export default function ComingSoon() {
  const time = new Date();
  time.setSeconds(time.getSeconds() + 3600 * 24 * 2 - 3600 * 15.5);

  const { seconds, minutes, hours, days } = useTimer({ expiryTimestamp: time });

  return (
    <>
      <Container fixed>
        <Grid container spacing={4} sx={{ alignItems: 'center', justifyContent: 'center', minHeight: '100vh', py: 2 }}>
          <Grid size={{ md: 6 }}>
            <Box sx={{ height: { xs: 310, sm: 420 }, width: { xs: 360, sm: 'auto' } }}>
              <CardMedia component="img" src={coming} alt="coming soon 1" sx={{ height: 1, width: 'auto' }} />
            </Box>
          </Grid>
          <Grid size={{ md: 6 }}>
            <Grid container spacing={3} direction="column" sx={{ alignItems: 'center' }}>
              <Grid size={12}>
                <Stack sx={{ gap: 1, justifyContent: 'center', alignItems: 'center' }}>
                  <Typography align="center" variant="h1">
                    Coming Soon
                  </Typography>
                  <Typography align="center" sx={{ color: 'text.secondary' }}>
                    Something new is on its way
                  </Typography>
                </Stack>
              </Grid>
              <Grid size={12}>
                <Stack direction="row" sx={{ gap: { xs: 1, sm: 2 }, alignItems: 'center', justifyContent: 'center' }}>
                  <TimerBox count={days} />
                  <TimerBox count={hours} />
                  <TimerBox count={minutes} />
                  <TimerBox count={seconds} />
                </Stack>
              </Grid>
              <Grid sx={{ width: { xs: 380, md: 380, lg: 380 } }} size={12}>
                <Stack sx={{ gap: 3, mt: 2 }}>
                  <Stack direction="row" sx={{ gap: 1 }}>
                    <TextField fullWidth placeholder="Email Address" />
                    <Button variant="contained" sx={{ width: '50%' }} startIcon={<Notification variant="Bold" />}>
                      Notify Me
                    </Button>
                  </Stack>
                  <Stack direction="row" sx={{ gap: 2, alignItems: 'center', justifyContent: 'center' }}>
                    <IconButton shape="rounded" color="secondary">
                      <Facebook variant="Bulk" size={20} />
                    </IconButton>
                    <IconButton shape="rounded" color="secondary">
                      <Google variant="Bulk" size={20} />
                    </IconButton>
                  </Stack>
                </Stack>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
