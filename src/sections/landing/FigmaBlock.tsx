'use client';

// material-ui
import { useTheme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import CardMedia from '@mui/material/CardMedia';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project import
import { ThemeMode } from 'config';

// icons
import { ShoppingCart, ArrowDown } from '@wandersonalwes/iconsax-react';

// assets
const figmaLight = '/assets/images/landing/figma-light.png';
const figmaDark = '/assets/images/landing/figma-dark.png';

// =============================|| LANDING - FIGMA PAGE ||============================= //

export default function FigmaBlock() {
  const theme = useTheme();

  const FigmaImg = theme.palette.mode === ThemeMode.DARK ? figmaDark : figmaLight;

  return (
    <Container>
      <Grid container alignItems="center" justifyContent="center" spacing={2} sx={{ mt: { md: 15, xs: 2.5 }, mb: { md: 10, xs: 2.5 } }}>
        <Grid size={12}>
          <Grid container spacing={1} justifyContent="center" sx={{ mb: 4, textAlign: 'center' }}>
            <Grid size={{ sm: 10, md: 6 }}>
              <Grid container spacing={1} justifyContent="center">
                <Grid size={12}>
                  <Typography variant="h2" sx={{ mb: 2 }}>
                    The Complete Figma Design System to Save Hundreds of Hours
                  </Typography>
                </Grid>
                <Grid size={12}>
                  <Typography variant="body1">
                    Optimize your workflow with 100% Auto Layout, variables, smart variants, and WCAG accessibility. Enjoy super-smart
                    global colors, typography, and effects styles + variables, crafted for seamless design efficiency!
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Grid size={{ xs: 12, sm: 9 }}>
          <Box sx={{ position: 'relative', mb: 3 }}>
            <CardMedia component="img" src={FigmaImg} sx={{ width: 1, m: '0 auto' }} />
          </Box>
        </Grid>
        <Grid size={12}>
          <Grid container spacing={1.5}>
            <Grid sx={{ textAlign: 'right' }} size={{ xs: 6 }}>
              <Button
                component={Link}
                target="_blank"
                href="https://codedthemes.com/item/able-pro-free-figma-ui-kit/"
                size="large"
                color="secondary"
                variant="outlined"
                startIcon={<ArrowDown />}
              >
                Free Figma
              </Button>
            </Grid>
            <Grid sx={{ textAlign: 'left' }} size={{ xs: 6 }}>
              <Button
                component={Link}
                target="_blank"
                href="https://codedthemes.com/item/able-pro-figma-ui-kit/"
                size="large"
                color="primary"
                variant="contained"
                startIcon={<ShoppingCart />}
              >
                Pro Figma
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
}
