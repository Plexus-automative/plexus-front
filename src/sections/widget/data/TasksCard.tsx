// next
import Link from 'next/link';

// material-ui
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Links from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project-imports
import Dot from 'components/@extended/Dot';
import MainCard from 'components/MainCard';

// assets
import { TickCircle } from '@wandersonalwes/iconsax-react';

// ==============================|| DATA WIDGET - TASKS ||============================== //

export default function TasksCard() {
  return (
    <MainCard
      title="Tasks"
      content={false}
      secondary={
        <Links component={Link} href="#" color="primary">
          View all
        </Links>
      }
    >
      <CardContent>
        <Grid
          container
          spacing={3.5}
          sx={{
            alignItems: 'center',
            position: 'relative',
            '&>*': { position: 'relative', zIndex: '5' },

            '&:after': {
              content: '""',
              position: 'absolute',
              top: 20,
              left: 6,
              width: 2,
              height: `calc(100% - 30px)`,
              bgcolor: 'divider',
              zIndex: '1'
            }
          }}
        >
          <Grid size={12}>
            <Grid container spacing={2}>
              <Grid>
                <Box sx={{ color: 'success.main', marginLeft: -0.5 }}>
                  <TickCircle variant="Bold" />
                </Box>
              </Grid>
              <Grid size="grow">
                <Grid container spacing={0}>
                  <Grid size={12}>
                    <Typography>8:50</Typography>
                  </Grid>
                  <Grid size={12}>
                    <Typography variant="h5" sx={{ color: 'text.secondary' }}>
                      You’re getting more and more followers, keep it up!
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid size={12}>
            <Grid container spacing={2}>
              <Grid>
                <Dot size={14} color="primary" componentDiv sx={{ mt: 0.5 }} />
              </Grid>
              <Grid size="grow">
                <Grid container spacing={0}>
                  <Grid size={12}>
                    <Typography>Sat, 5 Mar</Typography>
                  </Grid>
                  <Grid size={12}>
                    <Typography variant="h5" sx={{ color: 'text.secondary' }}>
                      Design mobile Application
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid size={12}>
            <Grid container spacing={2}>
              <Grid>
                <Dot size={14} color="error" componentDiv sx={{ mt: 0.5 }} />
              </Grid>
              <Grid size="grow">
                <Grid container spacing={0}>
                  <Grid size={12}>
                    <Typography>Sun, 17 Feb</Typography>
                  </Grid>
                  <Grid size={12}>
                    <Typography variant="h5" sx={{ color: 'text.secondary' }}>
                      <Links component={Link} href="#" underline="hover">
                        Jenny
                      </Links>{' '}
                      assign you a task{' '}
                      <Links component={Link} href="#" underline="hover">
                        Mockup Design
                      </Links>
                      .
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid size={12}>
            <Grid container spacing={2}>
              <Grid>
                <Dot size={14} color="warning" componentDiv sx={{ mt: 0.5 }} />
              </Grid>
              <Grid size="grow">
                <Grid container spacing={0}>
                  <Grid size={12}>
                    <Typography>Sat, 18 Mar</Typography>
                  </Grid>
                  <Grid size={12}>
                    <Typography variant="h5" sx={{ color: 'text.secondary' }}>
                      Design logo
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid size={12}>
            <Grid container spacing={2}>
              <Grid>
                <Dot size={14} color="success" componentDiv sx={{ mt: 0.5 }} />
              </Grid>
              <Grid size="grow">
                <Grid container spacing={0}>
                  <Grid size={12}>
                    <Typography>Sat, 22 Mar</Typography>
                  </Grid>
                  <Grid size={12}>
                    <Typography variant="h5" sx={{ color: 'text.secondary' }}>
                      Design mobile Application
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid size={12}>
            <Grid container spacing={2}>
              <Grid>
                <Dot size={14} color="secondary" componentDiv sx={{ mt: -1.5 }} />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </MainCard>
  );
}
