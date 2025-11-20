'use client';

// next
import Link from 'next/link';

// material-ui
import Button from '@mui/material/Button';
import CardMedia from '@mui/material/CardMedia';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project-imports
import { APP_DEFAULT_PATH } from 'config';

// assets
const construction = '/assets/images/maintenance/img-construction-2.svg';

// ==============================|| UNDER CONSTRUCTION ||============================== //

export default function UnderConstructionPage() {
  return (
    <Grid container spacing={3} direction="column" sx={{ alignItems: 'center', justifyContent: 'center', minHeight: '100vh', py: 2 }}>
      <Grid size={12}>
        <Stack sx={{ alignItems: 'center', justifyContent: 'center' }}>
          <Box sx={{ width: { xs: 300, sm: 374 } }}>
            <CardMedia component="img" src={construction} alt="under construction" sx={{ height: 1 }} />
          </Box>
        </Stack>
      </Grid>
      <Grid size={12}>
        <Stack sx={{ gap: 2, justifyContent: 'center', alignItems: 'center' }}>
          <Typography align="center" variant="h1">
            Under Construction
          </Typography>
          <Typography align="center" sx={{ color: 'text.secondary', width: '85%' }}>
            Hey! Please check out this site later. We are doing some maintenance on it right now.
          </Typography>
          <Button component={Link} href={APP_DEFAULT_PATH} variant="contained">
            Back To Home
          </Button>
        </Stack>
      </Grid>
    </Grid>
  );
}
