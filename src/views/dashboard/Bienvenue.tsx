'use client';

// material-ui
import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project-imports
import useUser from 'hooks/useUser';
import { GRID_COMMON_SPACING } from 'config';

// assets
const welcomeIllustration = '/assets/images/welcome-illustration.png';

// ==============================|| DASHBOARD - BIENVENUE ||============================== //

export default function Bienvenue() {
  const theme = useTheme();
  const user = useUser();
  const name = user ? user.name : 'Utilisateur';

  return (
    <Grid container spacing={GRID_COMMON_SPACING}>
      <Grid size={12}>
        <Card
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.lighter} 0%, ${theme.palette.background.paper} 100%)`,
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 4,
            border: `1px solid ${theme.palette.divider}`,
            transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: theme.customShadows.z1
            }
          }}
        >
          <CardContent sx={{ p: { xs: 3, md: 5 }, position: 'relative', zIndex: 1 }}>
            <Grid container spacing={3} alignItems="center">
              <Grid size={{ xs: 12, md: 7 }}>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="h2" sx={{ fontWeight: 700, mb: 1 }}>
                      Bienvenue, <Box component="span" sx={{ color: 'primary.main' }}>{name}</Box>!
                    </Typography>
                    <Typography variant="h4" color="text.secondary" sx={{ fontWeight: 400 }}>
                      Heureux de vous revoir sur la plateforme <Box component="span" sx={{ fontWeight: 600 }}>Plexus Automotive</Box>.
                    </Typography>
                  </Box>
                  <Typography variant="body1" color="text.secondary" sx={{ opacity: 0.8, maxWidth: 480 }}>
                    Gérez vos commandes, suivez vos livraisons et optimisez votre inventaire en toute simplicité grâce à nos outils intelligents.
                  </Typography>
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, md: 5 }} sx={{ display: { xs: 'none', md: 'block' } }}>
                <Box
                  component="img"
                  src={welcomeIllustration}
                  alt="Welcome Illustration"
                  sx={{
                    width: '100%',
                    maxWidth: 400,
                    height: 'auto',
                    filter: 'drop-shadow(0px 20px 40px rgba(0,0,0,0.1))',
                    animation: 'float 6s ease-in-out infinite'
                  }}
                />
              </Grid>
            </Grid>
          </CardContent>

          {/* Decorative shapes */}
          <Box
            sx={{
              position: 'absolute',
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              borderRadius: '50%',
              bgcolor: 'primary.light',
              opacity: 0.1,
              zIndex: 0
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: -20,
              left: '10%',
              width: 100,
              height: 100,
              borderRadius: '50%',
              bgcolor: 'secondary.light',
              opacity: 0.1,
              zIndex: 0
            }}
          />

          <style jsx>{`
            @keyframes float {
              0% { transform: translateY(0px); }
              50% { transform: translateY(-15px); }
              100% { transform: translateY(0px); }
            }
          `}</style>
        </Card>
      </Grid>
    </Grid>
  );
}

