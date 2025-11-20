import { ReactNode } from 'react';

// material-ui
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';

// project-imports
import AuthSlider from './AuthSlider';

interface Props {
  children: ReactNode;
}

// ==============================|| AUTHENTICATION - WRAPPER ||============================== //

export default function AuthWrapper3({ children }: Props) {
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
            <Grid
              sx={{
                display: 'flex',
                justifyContent: 'center',
                flex: 1,
                padding: 4,
                minHeight: '100vh',
                '& > .MuiPaper-root > .MuiBox-root': { minHeight: '100%', display: 'flex' }
              }}
            >
              {children}
            </Grid>
            <Grid
              sx={{
                display: { xs: 'none', lg: 'flex' },
                width: 580,
                overflow: 'hidden',
                alignSelf: 'stretch',
                position: 'relative',
                bgcolor: 'primary.main'
              }}
            >
              <AuthSlider />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}
