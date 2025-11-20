// material-ui
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project-imports
import AuthWrapper2 from 'sections/auth/AuthWrapper2';
import AuthCodeVerification from 'sections/auth/auth-forms/AuthCodeVerification';

// ================================|| CODE VERIFICATION ||================================ //

export default function CodeVerificationPage() {
  return (
    <AuthWrapper2>
      <Grid container spacing={3}>
        <Grid size={12}>
          <Stack sx={{ gap: 1 }}>
            <Typography variant="h3">Enter Verification Code</Typography>
            <Typography color="secondary">We send you on mail.</Typography>
          </Stack>
        </Grid>
        <Grid size={12}>
          <Typography>We`ve send you code on jone. ****@company.com</Typography>
        </Grid>
        <Grid size={12}>
          <AuthCodeVerification />
        </Grid>
      </Grid>
    </AuthWrapper2>
  );
}
