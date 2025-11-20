import { ReactElement } from 'react';

// material-ui
import CardMedia from '@mui/material/CardMedia';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';

// project-imports
import AuthCard from './AuthCard';

// assets
const AuthSideImg = '/assets/images/auth/img-auth-sideimg.png';

interface Props {
  children: ReactElement;
}

// ==============================|| AUTHENTICATION - WRAPPER ||============================== //

export default function AuthWrapper2({ children }: Props) {
  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Grid container direction="column" sx={{ justifyContent: 'center', minHeight: '100vh', bgcolor: 'background.paper' }}>
        <Grid size={12}>
          <Grid
            size={12}
            container
            sx={{
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: { xs: 'calc(100vh - 210px)', sm: 'calc(100vh - 134px)', md: 'calc(100vh - 112px)' }
            }}
          >
            <Grid sx={{ display: { xs: 'none', md: 'flex' }, alignSelf: 'center', justifyContent: 'flex-start' }} size={{ md: 7 }}>
              <CardMedia component="img" src={AuthSideImg} alt="Authimg" sx={{ height: '100vh', minHeight: 1 }} />
            </Grid>
            <Grid sx={{ display: 'flex', justifyContent: 'center' }} size={{ md: 5 }}>
              <AuthCard border={false}>{children}</AuthCard>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}
