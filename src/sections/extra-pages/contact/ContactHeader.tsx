// material-ui
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// assets
import AuthBackground from '../../../../public/assets/images/auth/AuthBackground';

// ==============================|| CONTACT US - HEADER ||============================== //

export default function ContactHeader() {
  return (
    <Box sx={{ position: 'relative', overflow: 'hidden', pt: 9, pb: 2 }}>
      <AuthBackground />
      <Container maxWidth="lg" sx={{ px: { xs: 0, sm: 2 } }}>
        <Box sx={{ width: { xs: '100%', sm: 360, lg: 436 }, px: 2, py: 6, mx: 'auto' }}>
          <Stack sx={{ gap: 1 }}>
            <Typography align="center" variant="h2">
              Talk to our Expert
            </Typography>
            <Typography align="center" sx={{ color: 'text.secondary' }}>
              Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </Typography>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
