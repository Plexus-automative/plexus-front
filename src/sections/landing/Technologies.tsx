'use client';

// next
import Link from 'next/link';

// material-ui
import Button from '@mui/material/Button';
import CardMedia from '@mui/material/CardMedia';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Links from '@mui/material/Link';
import Typography from '@mui/material/Typography';

// third-party
import { motion } from 'framer-motion';

// project-imports
import FadeInWhenVisible from './Animation';
import IconButton from 'components/@extended/IconButton';
import MainCard from 'components/MainCard';
import { techData } from 'data/tech-data';
import { useBuyNowLink } from 'hooks/getBuyNowLink';

// assets
import { ExportSquare } from '@wandersonalwes/iconsax-react';
import GithubIcon from '../../../public/assets/third-party/github';

// ==============================|| LANDING - TECHNOLOGIES PAGE ||============================== //

export default function TechnologiesPage() {
  const { getQueryParams } = useBuyNowLink();

  return (
    <Container>
      <Grid container spacing={3} sx={{ alignItems: 'center', justifyContent: 'center', mt: { md: 15, xs: 2.5 }, mb: { md: 10, xs: 2.5 } }}>
        <Grid size={12}>
          <Grid container spacing={2} sx={{ textAlign: 'center', marginBottom: 3, paddingTop: 3 }}>
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
                <Typography variant="h2">Available Technologies</Typography>
              </motion.div>
            </Grid>
            <Grid size={12}>
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
                <Typography>Explore the Demos of Able Pro in multiple technologies.</Typography>
              </motion.div>
            </Grid>
          </Grid>
        </Grid>
        <Grid size={12}>
          <Grid container spacing={3} sx={{ alignItems: 'center', justifyContent: 'center' }}>
            {techData.map((tech, index) => (
              <Grid key={index} size={{ xs: 12, md: 6, lg: 4 }}>
                <FadeInWhenVisible>
                  <MainCard>
                    <Grid container spacing={2}>
                      <Grid size={12}>
                        <CardMedia component="img" image={tech.image} sx={{ width: 'auto' }} />
                      </Grid>
                      <Grid size={12}>
                        <Typography variant="h4">{tech.label}</Typography>
                      </Grid>
                      <Grid size={12}>
                        <Typography>{tech.description}</Typography>
                      </Grid>
                      <Grid size={12}>
                        <Grid container spacing={2} sx={{ justifyContent: 'flex-start' }}>
                          <Grid>
                            <Button
                              variant="contained"
                              color="secondary"
                              size="large"
                              startIcon={<ExportSquare />}
                              component={Link}
                              href={tech.url + getQueryParams}
                              target={tech.target}
                              sx={(theme) => ({
                                fontWeight: 500,
                                bgcolor: 'secondary.light',
                                color: 'secondary.darker',
                                ...theme.applyStyles('light', { '&:hover': { color: 'secondary.lighter' } })
                              })}
                            >
                              Preview
                            </Button>
                          </Grid>
                          {!(tech.free == null) && (
                            <Grid>
                              <Links component={Link} href={tech.url}>
                                <IconButton
                                  size="large"
                                  shape="rounded"
                                  color="secondary"
                                  variant="light"
                                  sx={(theme) => ({
                                    bgcolor: 'secondary.light',
                                    color: 'secondary.darker',
                                    '&:hover': {
                                      color: 'secondary.lighter',
                                      bgcolor: 'grey.800',
                                      svg: { stroke: theme.palette.common.white },
                                      ...theme.applyStyles('dark', { color: 'grey.500' })
                                    }
                                  })}
                                >
                                  <GithubIcon />
                                </IconButton>
                              </Links>
                            </Grid>
                          )}
                        </Grid>
                      </Grid>
                    </Grid>
                  </MainCard>
                </FadeInWhenVisible>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
}
