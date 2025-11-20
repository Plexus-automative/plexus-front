// next
import Link from 'next/link';

// material-ui
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Links from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project-imports
import Avatar from 'components/@extended/Avatar';
import MainCard from 'components/MainCard';

// assets
import { DocumentText, ShoppingCart, Sms } from '@wandersonalwes/iconsax-react';

// ==============================|| DATA WIDGET - FEEDS ||============================== //

export default function FeedsCard() {
  return (
    <MainCard
      title="Feeds"
      content={false}
      secondary={
        <Links component={Link} href="#" color="primary">
          View all
        </Links>
      }
    >
      <CardContent>
        <Grid container spacing={3}>
          <Grid size={12}>
            <Grid container spacing={2} sx={{ alignItems: 'center', justifyContent: 'center' }}>
              <Grid>
                <Box sx={{ position: 'relative' }}>
                  <Avatar color="primary" type="filled" size="sm">
                    <Sms variant="Bold" />
                  </Avatar>
                </Box>
              </Grid>
              <Grid size="grow">
                <Grid container spacing={1}>
                  <Grid size="grow">
                    <Typography variant="body2">You have 3 pending tasks.</Typography>
                  </Grid>
                  <Grid>
                    <Typography variant="caption" color="secondary">
                      just now
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid size={12}>
            <Grid container spacing={2} sx={{ alignItems: 'center', justifyContent: 'center' }}>
              <Grid>
                <Box sx={{ position: 'relative' }}>
                  <Avatar color="error" type="filled" size="sm">
                    <ShoppingCart variant="Bold" />
                  </Avatar>
                </Box>
              </Grid>
              <Grid size="grow">
                <Grid container spacing={1}>
                  <Grid size="grow">
                    <Typography variant="body2">New order received</Typography>
                  </Grid>
                  <Grid>
                    <Typography variant="caption" color="secondary">
                      1 day ago
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid size={12}>
            <Grid container spacing={2} sx={{ alignItems: 'center', justifyContent: 'center' }}>
              <Grid>
                <Box sx={{ position: 'relative' }}>
                  <Avatar color="success" type="filled" size="sm">
                    <DocumentText variant="Bold" />
                  </Avatar>
                </Box>
              </Grid>
              <Grid size="grow">
                <Grid container spacing={1}>
                  <Grid size="grow">
                    <Typography variant="body2">You have 3 pending tasks.</Typography>
                  </Grid>
                  <Grid>
                    <Typography variant="caption" color="secondary">
                      3 week ago
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid size={12}>
            <Grid container spacing={2} sx={{ alignItems: 'center', justifyContent: 'center' }}>
              <Grid>
                <Box sx={{ position: 'relative' }}>
                  <Avatar color="primary" type="filled" size="sm">
                    <Sms variant="Bold" />
                  </Avatar>
                </Box>
              </Grid>
              <Grid size="grow">
                <Grid container spacing={1}>
                  <Grid size="grow">
                    <Typography variant="body2">New order received</Typography>
                  </Grid>
                  <Grid>
                    <Typography variant="caption" color="secondary">
                      around month
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid size={12}>
            <Grid container spacing={2} sx={{ alignItems: 'center', justifyContent: 'center' }}>
              <Grid>
                <Box sx={{ position: 'relative' }}>
                  <Avatar color="warning" type="filled" size="sm">
                    <ShoppingCart variant="Bold" />
                  </Avatar>
                </Box>
              </Grid>
              <Grid size="grow">
                <Grid container spacing={1}>
                  <Grid size="grow">
                    <Typography variant="body2">Order cancelled</Typography>
                  </Grid>
                  <Grid>
                    <Typography variant="caption" color="secondary">
                      2 month ago
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
