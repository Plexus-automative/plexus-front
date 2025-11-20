'use client';

// next
import Link from 'next/link';

// material-ui
import CardMedia from '@mui/material/CardMedia';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project-imports
import Logo from 'components/logo';
import useUser from 'hooks/useUser';
import AuthSocButton from 'sections/auth/AuthSocButton';
import AuthDivider from 'sections/auth/AuthDivider';
import AuthWrapper2 from 'sections/auth/AuthWrapper2';
import AuthLogin from 'sections/auth/auth-forms/AuthLogin';

// assets
const imgFacebook = '/assets/images/auth/facebook.svg';
const imgTwitter = '/assets/images/auth/twitter.svg';
const imgGoogle = '/assets/images/auth/google.svg';

// ================================|| LOGIN ||================================ //

export default function Login2Page() {
  const user = useUser();

  return (
    <AuthWrapper2>
      <Grid container spacing={3}>
        <Grid sx={{ textAlign: 'center' }} size={12}>
          <Logo />
        </Grid>
        <Grid size={12}>
          <Grid container spacing={1}>
            <Grid size={12}>
              <AuthSocButton>
                <CardMedia component="img" src={imgFacebook} alt="Facebook" sx={{ my: 0, mx: 1.25, width: 'auto' }} /> Sign In with Facebook
              </AuthSocButton>
            </Grid>
            <Grid size={12}>
              <AuthSocButton>
                <CardMedia component="img" src={imgTwitter} alt="Facebook" sx={{ my: 0, mx: 1.25, width: 'auto' }} /> Sign In with Twitter
              </AuthSocButton>
            </Grid>
            <Grid size={12}>
              <AuthSocButton>
                <CardMedia component="img" src={imgGoogle} alt="Facebook" sx={{ my: 0, mx: 1.25, width: 'auto' }} /> Sign In with Google
              </AuthSocButton>
            </Grid>
          </Grid>
        </Grid>
        <Grid size={12}>
          <AuthDivider>
            <Typography variant="body1">OR</Typography>
          </AuthDivider>
        </Grid>
        <Grid size={12}>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'baseline', mb: { xs: -0.5, sm: 0.5 } }}>
            <Typography variant="h3">Login</Typography>
            <Typography
              component={Link}
              href={user ? '/auth/register2' : '/register2'}
              variant="body1"
              sx={{ textDecoration: 'none' }}
              color="primary"
            >
              Don&apos;t have an account?
            </Typography>
          </Stack>
        </Grid>
        <Grid size={12}>
          <AuthLogin forgot="/auth/forgot-password2" />
        </Grid>
      </Grid>
    </AuthWrapper2>
  );
}
