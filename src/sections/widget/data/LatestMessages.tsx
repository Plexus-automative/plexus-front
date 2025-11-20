// next
import Link from 'next/link';

// material-ui
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Links from '@mui/material/Link';
import Typography from '@mui/material/Typography';

// project-imports
import Avatar from 'components/@extended/Avatar';
import MainCard from 'components/MainCard';

// assets
import { Facebook, Profile, ShoppingCart, TickCircle } from '@wandersonalwes/iconsax-react';

// ==========================|| DATA WIDGET - LATEST MESSAGES ||========================== //

export default function LatestMessages() {
  return (
    <MainCard
      title="Latest Messages"
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
          spacing={3}
          sx={{
            alignItems: 'center',
            position: 'relative',
            '&>*': { position: 'relative', zIndex: '5' },

            '&:after': {
              content: '""',
              position: 'absolute',
              top: 8,
              left: 90,
              width: 2,
              height: '100%',
              bgcolor: 'divider',
              zIndex: '1'
            }
          }}
        >
          <Grid size={12}>
            <Grid container spacing={2}>
              <Grid>
                <Grid container spacing={2} sx={{ alignItems: 'center' }}>
                  <Grid size="grow">
                    <Typography variant="caption" color="secondary">
                      2 hrs ago
                    </Typography>
                  </Grid>
                  <Grid>
                    <Avatar color="info">
                      <Facebook variant="Bold" />
                    </Avatar>
                  </Grid>
                </Grid>
              </Grid>
              <Grid size="grow">
                <Grid container spacing={1}>
                  <Grid size={12}>
                    <Typography variant="subtitle1">+ 1652 Followers</Typography>
                    <Typography color="secondary" variant="caption">
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
                <Grid container spacing={2} sx={{ alignItems: 'center' }}>
                  <Grid size="grow">
                    <Typography variant="caption" color="secondary">
                      4 hrs ago
                    </Typography>
                  </Grid>
                  <Grid>
                    <Avatar color="error">
                      <ShoppingCart variant="Bold" />
                    </Avatar>
                  </Grid>
                </Grid>
              </Grid>
              <Grid size="grow">
                <Grid container spacing={1}>
                  <Grid size={12}>
                    <Typography variant="subtitle1">+ 5 New Products were added!</Typography>
                    <Typography color="secondary" variant="caption">
                      Congratulations!
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid size={12}>
            <Grid container spacing={2}>
              <Grid>
                <Grid container spacing={2} sx={{ alignItems: 'center' }}>
                  <Grid size="grow">
                    <Typography variant="caption" color="secondary">
                      1 day ago
                    </Typography>
                  </Grid>
                  <Grid>
                    <Avatar color="success">
                      <TickCircle variant="Bold" />
                    </Avatar>
                  </Grid>
                </Grid>
              </Grid>
              <Grid size="grow">
                <Grid container spacing={1}>
                  <Grid size={12}>
                    <Typography variant="subtitle1">Database backup completed!</Typography>
                    <Typography color="secondary" variant="caption">
                      Download the{' '}
                      <Links component={Link} href="#" underline="hover">
                        latest backup
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
                <Grid container spacing={2} sx={{ alignItems: 'center' }}>
                  <Grid size="grow">
                    <Typography variant="caption" color="secondary">
                      2 day ago
                    </Typography>
                  </Grid>
                  <Grid>
                    <Avatar color="primary">
                      <Profile variant="Bold" />
                    </Avatar>
                  </Grid>
                </Grid>
              </Grid>
              <Grid size="grow">
                <Grid container spacing={1}>
                  <Grid size={12}>
                    <Typography variant="subtitle1">+2 Friend Requests</Typography>
                    <Typography color="secondary" variant="caption">
                      This is great, keep it up!
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </MainCard>
  );
}
