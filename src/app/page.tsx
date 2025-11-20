// material-ui
import Divider from '@mui/material/Divider';

// project-imports
import Hero from 'sections/landing/Hero';
import Technologies from 'sections/landing/Technologies';
import Combo from 'sections/landing/Combo';
import FigmaBlock from 'sections/landing/FigmaBlock';
import Apps from 'sections/landing/Apps';
import Free from 'sections/landing/Free';
import Testimonial from 'sections/landing/Testimonial';
import Partner from 'sections/landing/Partner';
import Subscribe from 'sections/landing/Subscribe';
import SimpleLayout from 'layout/SimpleLayout';

// ==============================|| LANDING PAGE ||============================== //

export default function Landing() {
  return (
    <SimpleLayout>
      <Hero />
      <Technologies />
      <Combo />
      <FigmaBlock />
      <Apps />
      <Free />
      <Testimonial />
      <Partner />
      <Subscribe />
      <Divider sx={{ borderColor: 'secondary.light' }} />
    </SimpleLayout>
  );
}
