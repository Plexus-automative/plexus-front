// material-ui
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';

// project-imports
import ContactForm from 'sections/extra-pages/contact/ContactForm';
import ContactHeader from 'sections/extra-pages/contact/ContactHeader';

// ==============================|| CONTACT US - MAIN ||============================== //

export default function ContactUSPage() {
  return (
    <Grid container spacing={12} sx={{ justifyContent: 'center', alignItems: 'center', mb: 12 }}>
      <Grid size={{ xs: 12, md: 12 }}>
        <ContactHeader />
      </Grid>
      <Grid size={{ xs: 12, sm: 10, lg: 9 }}>
        <Container maxWidth="lg" sx={{ px: { xs: 0, sm: 2 } }}>
          <ContactForm />
        </Container>
      </Grid>
    </Grid>
  );
}
