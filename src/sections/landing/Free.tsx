'use client';

// next
import Link from 'next/link';

// material-ui
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project-imports
import FadeInWhenVisible from './Animation';
import { useBuyNowLink } from 'hooks/getBuyNowLink';

// assets
import { ExportSquare } from '@wandersonalwes/iconsax-react';

// ==============================|| LANDING - FREE PAGE ||============================== //

export default function FreePage() {
  const { getQueryParams } = useBuyNowLink();

  return (
    <Container>
      <Grid container spacing={3} sx={{ alignItems: 'center', justifyContent: 'center', mt: { md: 10, xs: 2.5 }, mb: { md: 10, xs: 2.5 } }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <FadeInWhenVisible>
            <Grid container spacing={2} sx={{ justifyContent: 'center', paddingTop: 3 }}>
              <Grid size={12}>
                <Typography variant="h2">
                  <Box
                    component="span"
                    sx={{
                      color: 'primary.main'
                    }}
                  >
                    TRY{' '}
                  </Box>
                  BEFORE BUY
                </Typography>
              </Grid>
              <Grid size={12}>
                <Typography>Download the Free MIT Able Pro Dashboard Template before make your purchase decision.</Typography>
              </Grid>
            </Grid>
          </FadeInWhenVisible>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <FadeInWhenVisible>
            <Grid container spacing={2} sx={{ justifyContent: 'end', alignItems: 'center', paddingTop: 3 }}>
              <Grid>
                <Button variant="outlined" color="secondary" size="large" component={Link} href={`/login${getQueryParams}`} target="_blank">
                  Check out Pro Version
                </Button>
              </Grid>
              <Grid>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={<ExportSquare />}
                  component={Link}
                  href="https://github.com/phoenixcoded/able-pro-free-admin-dashboard-template"
                  target="_blank"
                >
                  Free Version
                </Button>
              </Grid>
            </Grid>
          </FadeInWhenVisible>
        </Grid>
      </Grid>
    </Container>
  );
}
