'use client';

// material-ui
import Button from '@mui/material/Button';
import CardMedia from '@mui/material/CardMedia';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// third-party
import { motion } from 'framer-motion';

// project-imports
import FadeInWhenVisible from './Animation';
import MainCard from 'components/MainCard';
import { useBuyNowLink } from 'hooks/getBuyNowLink';

// assets
import { ExportSquare } from '@wandersonalwes/iconsax-react';
// const featureFigma = '/assets/images/landing/feature-figma.png';
const featureComponents = '/assets/images/landing/feature-components.png';
const featureDocumentation = '/assets/images/landing/feature-documentation.png';

const Technologies = [
  // {
  //   icon: featureFigma,
  //   title: 'Figma Design System',
  //   description: 'Check the live preview of Able Pro Figma design file. Figma file included in all licenses.',
  //   preview: 'https://www.figma.com/file/6XqmRhRmkr33w0EFD49acY/Able-Pro--v9.0-Figma-Preview?type=design&mode=design&t=4FS2Lw6WxsmJ3RLm-0'
  // },
  {
    icon: featureComponents,
    title: 'Explore Components',
    description: 'Access all components of Able Pro in one place to make your development work easier.',
    preview: '/components-overview/buttons',
    label: 'View All Components'
  },
  {
    icon: featureDocumentation,
    title: 'Documentation',
    description: 'Find solutions and navigate through our helper guide with ease.',
    preview: 'https://phoenixcoded.gitbook.io/able-pro',
    label: 'Check Documentation'
  }
];

// ==============================|| LANDING - COMBO PAGE ||============================== //

export default function ComboPage() {
  const { getQueryParams } = useBuyNowLink();

  return (
    <Container>
      <Grid container spacing={3} sx={{ alignItems: 'center', justifyContent: 'center', mt: { md: 15, xs: 2.5 }, mb: { md: 10, xs: 2.5 } }}>
        <Grid size={12}>
          <Grid container spacing={2} sx={{ justifyContent: 'center', textAlign: 'center', marginBottom: 3, paddingTop: 3 }}>
            <Grid size={12}>
              <motion.div
                initial={{ opacity: 0, y: 550 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 150,
                  damping: 30,
                  delay: 0.2
                }}
              >
                <Typography variant="h2">Complete Combo</Typography>
              </motion.div>
            </Grid>
            <Grid size={{ xs: 12, md: 7 }}>
              <motion.div
                initial={{ opacity: 0, y: 550 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 150,
                  damping: 30,
                  delay: 0.4
                }}
              >
                <Typography>
                  Able Pro caters to the needs of both developers and designers, whether they are beginners or experts.
                </Typography>
              </motion.div>
            </Grid>
          </Grid>
        </Grid>
        <Grid size={12}>
          <Grid container spacing={3}>
            {Technologies.map((tech, index) => (
              <Grid key={index} size={{ xs: 12, md: 6 }}>
                <Box
                  sx={{
                    height: '100%',
                    '& > div': {
                      height: '100%'
                    }
                  }}
                >
                  <FadeInWhenVisible>
                    <MainCard sx={{ height: '100%' }}>
                      <Grid container spacing={3.5}>
                        <Grid size={12}>
                          <Stack sx={{ gap: 1 }}>
                            <Typography variant="h5">{tech.title}</Typography>
                            <Typography>{tech.description}</Typography>
                          </Stack>
                        </Grid>
                        <Grid size={12}>
                          <CardMedia component="img" image={tech.icon} sx={{ width: '100%' }} />
                        </Grid>
                        <Grid size={12}>
                          <Button
                            variant="contained"
                            color="secondary"
                            size="large"
                            startIcon={<ExportSquare />}
                            component={Link}
                            href={tech.preview + getQueryParams}
                            target="_blank"
                            sx={(theme) => ({
                              fontWeight: 500,
                              bgcolor: 'secondary.light',
                              color: 'secondary.darker',
                              ...theme.applyStyles('light', { '&:hover': { color: 'secondary.lighter' } })
                            })}
                          >
                            {tech.label}
                          </Button>
                        </Grid>
                      </Grid>
                    </MainCard>
                  </FadeInWhenVisible>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
}
