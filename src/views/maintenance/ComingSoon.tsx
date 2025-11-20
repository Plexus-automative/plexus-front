'use client';

// material-ui
import Button from '@mui/material/Button';
import CardMedia from '@mui/material/CardMedia';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project-imports
import IconButton from 'components/@extended/IconButton';

// assets
import { Facebook, Google, Notification } from '@wandersonalwes/iconsax-react';
import AuthBackground from '../../../public/assets/images/auth/AuthBackground';
const coming1 = '/assets/images/maintenance/img-soon-1-1.png';
const coming2 = '/assets/images/maintenance/img-soon-1-2.png';

// ==============================|| COMING SOON ||============================== //

export default function ComingSoon() {
  return (
    <>
      <AuthBackground />
      <Container fixed>
        <Grid container spacing={4} sx={{ alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
          <Grid size={{ md: 6 }}>
            <Box sx={{ width: { xs: 300, md: 'auto' }, margin: '0 auto' }}>
              <Grid container spacing={3} direction="column">
                <Grid size={12}>
                  <Stack sx={{ gap: 3 }}>
                    <Typography variant="h4">Coming Soon</Typography>
                    <Typography variant="h2">
                      <Box sx={{ color: 'primary.main', display: 'inline-block' }}>Able Pro</Box> - The Bootstrap Admin Template
                    </Typography>
                    <Typography sx={{ color: 'text.secondary' }}>
                      Presenting Material-UI based React Dashboard Template to build performance centric websites and applications.
                    </Typography>
                  </Stack>
                </Grid>
                <Grid sx={{ width: { xs: 320, md: 380 } }} size={12}>
                  <Stack sx={{ gap: 3, mt: 2 }}>
                    <Stack direction="row" sx={{ gap: 1 }}>
                      <TextField fullWidth placeholder="Email Address" />
                      <Button variant="contained" sx={{ width: '50%' }} startIcon={<Notification variant="Bold" />}>
                        Notify Me
                      </Button>
                    </Stack>
                    <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
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
            </Box>
          </Grid>
          <Grid size={{ md: 6 }}>
            <Stack
              direction="row"
              spacing={2}
              sx={{ alignItems: 'start', width: { xs: 360, sm: 'auto' }, height: '100vh', overflow: 'hidden' }}
            >
              <Box sx={{ position: 'relative', width: '280px' }}>
                <Box
                  sx={{
                    lineHeight: 0,
                    position: 'absolute',
                    animation: 'img-l1 50s infinite linear',
                    '@keyframes img-l1': { '0%': { transform: 'translateY(-100%)' }, '100%': { transform: 'translateY(0%)' } }
                  }}
                >
                  <CardMedia component="img" src={coming1} alt="coming soon 1" />
                </Box>
                <Box
                  sx={{
                    lineHeight: 0,
                    position: 'absolute',
                    animation: 'img-l2 50s infinite linear',
                    '@keyframes img-l2': { '0%': { transform: 'translateY(0%)' }, '100%': { transform: 'translateY(100%)' } }
                  }}
                >
                  <CardMedia component="img" src={coming1} alt="coming soon 2" />
                </Box>
              </Box>
              <Box sx={{ position: 'relative', width: '280px' }}>
                <Box
                  sx={{
                    position: 'absolute',
                    animation: 'img-r1 50s infinite linear',
                    '@keyframes img-r1': { '0%': { transform: 'translateY(0%)' }, '100%': { transform: 'translateY(-100%)' } }
                  }}
                >
                  <CardMedia component="img" src={coming2} alt="coming soon 1" />
                </Box>
                <Box
                  sx={{
                    position: 'absolute',
                    animation: 'img-r2 50s infinite linear',
                    '@keyframes img-r2': { '0%': { transform: 'translateY(100%)' }, '100%': { transform: 'translateY(0%)' } }
                  }}
                >
                  <CardMedia component="img" src={coming2} alt="coming soon 1" />
                </Box>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
