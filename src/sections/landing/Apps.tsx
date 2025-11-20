'use client';

import { useRef, useState } from 'react';

// material-ui
import { alpha, useTheme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import CardMedia from '@mui/material/CardMedia';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project-imports
import FadeInWhenVisible from './Animation';
import { ThemeDirection, ThemeMode } from 'config';

// third-party
import Slider, { Settings } from 'react-slick';

// assets
const featureChatLight = 'assets/images/landing/chatLight.png';
const featureChatDark = 'assets/images/landing/chatDark.png';
const featureEcommerceLight = 'assets/images/landing/ecommerceLight.png';
const featureEcommerceDark = 'assets/images/landing/ecommerceDark.png';
const featureInvoiceLight = 'assets/images/landing/invoiceLight.png';
const featureInvoiceDark = 'assets/images/landing/invoiceDark.png';
const featureUserLight = 'assets/images/landing/userLight.png';
const featureUserDark = 'assets/images/landing/userDark.png';

// ==============================|| LANDING - AppsPage ||============================== //

export default function AppsPage() {
  const theme = useTheme();
  const [slideIndex, setSlideIndex] = useState<number>(0);

  const Technologies = [
    {
      image: theme.palette.mode === ThemeMode.DARK ? featureChatDark : featureChatLight,
      title: 'Chat',
      href: 'chat',
      description: 'Power your web apps with the conceptual chat app of Able Pro Dashboard Template.'
    },
    {
      image: theme.palette.mode === ThemeMode.DARK ? featureEcommerceDark : featureEcommerceLight,
      title: 'E-commerce',
      href: 'ecommerce',
      description: 'Collection, filter, product detail, add new product, and checkout pages makes your e-commerce app complete.'
    },
    {
      image: theme.palette.mode === ThemeMode.DARK ? featureInvoiceDark : featureInvoiceLight,
      title: 'Invoice',
      href: 'invoice',
      description:
        'Create, manage, and customize invoices with detailed views for invoice lists, invoice details, and payment status tracking.'
    },
    {
      image: theme.palette.mode === ThemeMode.DARK ? featureUserDark : featureUserLight,
      title: 'User Management',
      href: 'social',
      description: 'Detailed pages for user management like profile settings, role, account settings, social profile and more to explore.'
    }
  ];

  function handleChange(value: number) {
    goToSlide(value);
    setSlideIndex(value);
  }
  const sliderRef = useRef<Slider>(null);

  const goToSlide = (index: number) => {
    if (sliderRef.current) {
      sliderRef.current.slickGoTo(index);
    }
  };

  const settings: Settings = {
    autoplay: true,
    fade: true,
    dots: false,
    arrows: false,
    infinite: true,
    speed: 5000,
    slidesToShow: 1,
    slidesToScroll: 1,
    beforeChange: function (currentSlide: number, next: number) {
      setSlideIndex(next);
    }
  };

  return (
    <Box sx={{ bgcolor: theme.palette.primary.main, overflow: 'hidden', pt: { md: 10, xs: 5 } }}>
      <Container>
        <Grid container spacing={3} sx={{ alignItems: 'center', justifyContent: 'center' }}>
          <Grid size={12}>
            <Grid container spacing={2} sx={{ justifyContent: 'center', textAlign: 'center', marginBottom: 3 }}>
              <Grid size={12}>
                <Typography variant="h2" color="white">
                  Working Conceptual Apps
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 7 }}>
                <Typography color="white">
                  Each App is carefully crafted to achieve the best feature rich working concept for your project.
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>
      <Container>
        <Grid container spacing={3} sx={{ alignItems: 'center', justifyContent: 'center', pt: { md: 10, xs: 2.5 } }}>
          <Grid size={12}>
            <Grid container spacing={3} sx={{ alignItems: 'start' }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ pb: { xs: 0, md: 10 } }}>
                  <Grid container spacing={1.5} sx={{ alignItems: 'center' }}>
                    {Technologies.map((tech, index) => (
                      <Grid key={index} size={12}>
                        <FadeInWhenVisible>
                          <Button
                            onClick={() => {
                              handleChange(index);
                            }}
                            role="link"
                            href={`#${tech.href}`}
                            sx={{
                              p: 3,
                              borderRadius: 1.5,
                              ...(slideIndex === index && {
                                background: alpha(theme.palette.secondary.lighter, 0.13),
                                '&:hover': { background: alpha(theme.palette.secondary.lighter, 0.13) }
                              })
                            }}
                            variant="light"
                          >
                            <Grid container spacing={2} sx={{ textAlign: 'start' }}>
                              <Grid size={12}>
                                <Typography variant="h4" color="white">
                                  {tech.title}
                                </Typography>
                              </Grid>
                              <Grid size={12}>
                                <Typography color="white">{tech.description}</Typography>
                              </Grid>
                            </Grid>
                          </Button>
                        </FadeInWhenVisible>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Box
                  sx={{
                    transform: 'scale(1.56)',
                    transformOrigin: 'top left',
                    mt: 3,
                    width: '100%',
                    pointerEvents: 'none',
                    ...(theme.direction === ThemeDirection.RTL && {
                      '& .slick-slider > .slick-list > .slick-track > .slick-slide': { float: 'right !important' }
                    })
                  }}
                >
                  <Slider ref={sliderRef} {...settings}>
                    {Technologies.map((tech, index) => (
                      <Box key={index}>
                        {slideIndex === index && <CardMedia component="img" image={tech.image} sx={{ width: '100%', minHeight: '100%' }} />}
                      </Box>
                    ))}
                  </Slider>
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
