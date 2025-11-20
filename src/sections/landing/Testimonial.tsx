'use client';

// material-ui
import { useTheme } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// third-party
import { motion } from 'framer-motion';
import Marquee from 'react-fast-marquee';

// project-imports
import FadeInWhenVisible from './Animation';
import MainCard from 'components/MainCard';
import { ThemeDirection } from 'config';

// assets
import Avatar from 'components/@extended/Avatar';
const Avatar1 = '/assets/images/users/avatar-6.png';
const Avatar2 = '/assets/images/users/avatar-1.png';
const Avatar3 = '/assets/images/users/avatar-2.png';
const Avatar4 = '/assets/images/users/avatar-3.png';
const Avatar5 = '/assets/images/users/avatar-4.png';
const Avatar6 = '/assets/images/users/avatar-5.png';
const Avatar7 = '/assets/images/users/avatar-7.png';
const Avatar8 = '/assets/images/users/avatar-8.png';

// ================================|| SLIDER - ITEMS ||================================ //

function Item({ item }: { item: { image: string; text: string; name: string; designation: string; highlight?: boolean } }) {
  return (
    <MainCard sx={{ width: { xs: '300px', md: '420px' }, cursor: 'pointer', my: 0.2, mx: 1.5 }}>
      <Stack direction="row" sx={{ gap: 2, alignItems: 'flex-start' }}>
        <Avatar alt="Avatar" size="lg" src={item.image}></Avatar>
        <Stack>
          <Typography>{item.text}</Typography>
          <Typography>
            <Typography component="span" variant="caption">
              {item.name}
            </Typography>
            {' - '}
            <Typography component="span" sx={{ color: 'text.secondary' }}>
              {item.designation}
            </Typography>
          </Typography>
        </Stack>
      </Stack>
    </MainCard>
  );
}

// ==============================|| LANDING - TestimonialPage ||============================== //

export default function TestimonialPage() {
  const theme = useTheme();
  const items = [
    {
      image: Avatar1,
      text: '“Code quality is amazing. Design is astonishing. very easy to customize .. and any developer can use it with ease.“',
      name: 'shahabblouch',
      designation: 'Code Quality'
    },
    {
      image: Avatar2,
      text: '“I get all what I need for my project from this template so I can focus to back end side. The template looks fantastic and the support is fast. Thank you.“',
      name: 'menhook',
      designation: 'Feature Availability'
    },
    {
      image: Avatar3,
      text: '“Design is very good.“',
      name: 'dimas_ferian',
      designation: 'Design Quality'
    },
    {
      image: Avatar4,
      text: '“Amazing template for fast develop“',
      name: 'devbardbudist',
      designation: 'Customizability'
    },
    {
      image: Avatar5,
      text: '“The author is very nice and solved my problem inmediately “',
      name: 'richitela',
      designation: 'Customer Support'
    },
    {
      image: Avatar6,
      text: '“I love the looks of Able Pro 7.0. I really like the colors you guys have chosen for this theme. It looks really nice.. 💎“',
      name: 'ritelogic',
      designation: 'Other'
    },
    {
      image: Avatar7,
      text: '“The author is very nice and solved my problem inmediately 😍 “',
      name: 'richitela',
      designation: 'Customer Support'
    },
    {
      image: Avatar8,
      text: '“An amazing template, Very good design, good quality code and also very good customer support.“',
      name: 'macugi',
      designation: 'Code Quality'
    }
  ];
  return (
    <>
      <Box sx={{ mt: { md: 15, xs: 2.5 } }}>
        <Container>
          <Grid container spacing={2} sx={{ justifyContent: 'center', textAlign: 'center', marginBottom: 4, paddingTop: 3 }}>
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
                <Typography variant="h2">
                  They{' '}
                  <Typography variant="h2" component="span" sx={{ color: 'primary.main' }}>
                    love
                  </Typography>{' '}
                  Able Pro, Now your turn 😍
                </Typography>
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
                  We take pride in our Dashboard development, which has been consistently rated 4.7/5 by our satisfied customers. It brings
                  us joy to share the positive feedback we have received from our loyal clients.
                </Typography>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>
      <Box sx={{ mb: { md: 10, xs: 2.5 } }}>
        <Grid container spacing={4}>
          <Grid sx={{ direction: theme.direction }} size={12}>
            <FadeInWhenVisible>
              <Marquee pauseOnHover direction={theme.direction === ThemeDirection.RTL ? 'right' : 'left'} gradient={false}>
                {items.map((item, index) => (
                  <Item key={index} item={item} />
                ))}
              </Marquee>
            </FadeInWhenVisible>
          </Grid>
          <Grid sx={{ direction: theme.direction }} size={12}>
            <FadeInWhenVisible>
              <Marquee pauseOnHover direction={theme.direction === ThemeDirection.RTL ? 'left' : 'right'} gradient={false}>
                {items.map((item, index) => (
                  <Item key={index} item={item} />
                ))}
              </Marquee>
            </FadeInWhenVisible>
          </Grid>
        </Grid>
      </Box>
    </>
  );
}
