'use client';

// next
import Link from 'next/link';

// material-ui
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import CardMedia from '@mui/material/CardMedia';
import Links from '@mui/material/Link';
import Rating from '@mui/material/Rating';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project-imports
import AnimateButton from 'components/@extended/AnimateButton';
import { techData } from 'data/tech-data';
import { useBuyNowLink } from 'hooks/getBuyNowLink';

// third-party
import { motion } from 'framer-motion';

// ==============================|| LANDING - HERO PAGE ||============================== //

export default function HeroPage() {
  const { getQueryParams } = useBuyNowLink();

  const techBottom = techData.map((item, index) => {
    const finalUrl = item.url !== '#!' ? `${item.url}${getQueryParams}` : '#!';
    return (
      <Grid key={index} sx={{ minWidth: { xs: 60, md: 90 } }}>
        <motion.div
          initial={{ opacity: 0, y: 550 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 150, damping: 30, delay: 0.8 }}
        >
          <Tooltip title={item.tooltipTitle}>
            <Links component={Link} href={finalUrl} target={item.target}>
              <CardMedia component="img" image={item.image} sx={{ width: 'auto', height: { xs: 60, md: 'auto' } }} />
            </Links>
          </Tooltip>
        </motion.div>
      </Grid>
    );
  });

  return (
    <Box sx={{ minHeight: '100vh', position: 'relative', pb: 12.5, pt: 10, display: 'flex', alignItems: 'center' }}>
      <Container>
        <Grid container spacing={2} sx={{ alignItems: 'center', justifyContent: 'center', pt: { md: 0, xs: 10 }, pb: { md: 0, xs: 22 } }}>
          <Grid size={{ xs: 12, md: 9 }}>
            <Grid container spacing={3} sx={{ textAlign: 'center' }}>
              <Grid size={12}>
                <motion.div
                  initial={{ opacity: 0, y: 550 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 150,
                    damping: 30
                  }}
                >
                  <Typography
                    variant="h1"
                    sx={{
                      fontSize: { xs: '1.825rem', sm: '2rem', md: '3.4375rem' },
                      fontWeight: 700,
                      lineHeight: 1.2
                    }}
                  >
                    Explore One of the{' '}
                    <Typography
                      variant="h1"
                      component="span"
                      sx={{
                        fontSize: 'inherit',
                        background: 'linear-gradient(90deg, rgb(37, 161, 244), rgb(249, 31, 169), rgb(37, 161, 244)) 0 0 / 400% 100%',
                        color: 'transparent',
                        WebkitBackgroundClip: 'text',
                        backgroundClip: 'text',
                        animation: 'move-bg 24s infinite linear',
                        '@keyframes move-bg': { '100%': { backgroundPosition: '400% 0' } }
                      }}
                    >
                      Featured Dashboard
                    </Typography>{' '}
                    Template
                  </Typography>
                </motion.div>
              </Grid>
              <Grid container size={12} sx={{ justifyContent: 'center' }}>
                <Grid size={8}>
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
                    <Typography
                      variant="h6"
                      sx={{
                        fontSize: { xs: '0.875rem', md: '1rem' },
                        fontWeight: 400,
                        lineHeight: { xs: 1.4, md: 1.4 }
                      }}
                    >
                      Able Pro is the one of the finest admin dashboard template out there in market. Used by over 6.5K+ Customers
                      worldwide.
                    </Typography>
                  </motion.div>
                </Grid>
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
                  <Grid container spacing={2} sx={{ justifyContent: 'center' }}>
                    <Grid>
                      <AnimateButton>
                        <Button
                          component={Link}
                          href={`/components-overview/buttons${getQueryParams}`}
                          size="large"
                          color="secondary"
                          variant="outlined"
                        >
                          Explore Components
                        </Button>
                      </AnimateButton>
                    </Grid>
                    <Grid>
                      <AnimateButton>
                        <Button
                          component={Link}
                          href={`/login${getQueryParams}`}
                          target="_blank"
                          size="large"
                          color="primary"
                          variant="contained"
                        >
                          Live Preview
                        </Button>
                      </AnimateButton>
                    </Grid>
                  </Grid>
                </motion.div>
              </Grid>
              <Grid size={12}>
                <motion.div
                  initial={{ opacity: 0, y: 550 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 150, damping: 30, delay: 0.6 }}
                >
                  <Grid container spacing={3} sx={{ justifyContent: 'center' }}>
                    <Grid
                      sx={{
                        position: 'relative',
                        '&:after': {
                          content: '""',
                          position: 'absolute',
                          height: 30,
                          bottom: 10,
                          left: 'auto',
                          right: '-12px',
                          width: '1px',
                          bgcolor: 'divider'
                        }
                      }}
                    >
                      <Rating name="read-only" value={4.5} size="small" readOnly />
                      <Typography variant="h4">
                        4.7/5
                        <Box component="span" sx={{ fontSize: '75%', fontWeight: 400, margin: 0.625, color: 'text.secondary' }}>
                          Ratings
                        </Box>
                      </Typography>
                    </Grid>
                    <Grid>
                      <Typography variant="h5">
                        <Box
                          component="span"
                          sx={{
                            fontSize: '75%',
                            fontWeight: 400,
                            color: 'text.secondary'
                          }}
                        >
                          Sales
                        </Box>
                      </Typography>
                      <Typography variant="h4">6.5K+</Typography>
                    </Grid>
                  </Grid>
                </motion.div>
              </Grid>
              <Grid container size={12} sx={{ justifyContent: 'center' }}>
                <Grid size={8}>
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
                    <Typography
                      variant="h6"
                      sx={{
                        fontSize: { xs: '0.875rem', md: '1rem' },
                        fontWeight: 400,
                        lineHeight: { xs: 1.4, md: 1.4 }
                      }}
                    >
                      - Click Below Icon to Preview Each Tech Demos -
                    </Typography>
                  </motion.div>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Box
          sx={{
            display: 'flex',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'background.paper',
            borderTop: '1px solid',
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Grid
            container
            spacing={0}
            wrap="nowrap"
            sx={(theme) => ({
              justifyContent: { xs: 'start', lg: 'center' },
              overflowX: 'auto',
              '& > .MuiGrid-root': {
                borderRight: `1px solid ${theme.palette.divider}`,
                '&:first-of-type': { borderLeft: `1px solid ${theme.palette.divider}` },
                '& img': { padding: 1.3 }
              }
            })}
          >
            {techBottom}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}
