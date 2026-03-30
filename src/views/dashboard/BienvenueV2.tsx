'use client';

// material-ui
import { useTheme, alpha } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Link from 'next/link';

// project-imports
import useUser from 'hooks/useUser';
import { GRID_COMMON_SPACING } from 'config';

// assets
import { ExportCurve, ImportCurve, SearchNormal1, BoxTick } from '@wandersonalwes/iconsax-react';
const welcomeIllustrationTech = '/assets/images/welcome-illustration-tech.png';

// ==============================|| DASHBOARD - BIENVENUE V2 ||============================== //

export default function BienvenueV2() {
    const theme = useTheme();
    const user = useUser();
    const name = user ? user.name : 'Utilisateur';

    const quickActions = [
        { title: 'Articles', icon: <SearchNormal1 size={24} />, url: '/pages/articles', color: theme.palette.primary.main },
        { title: 'Émises', icon: <ExportCurve size={24} />, url: '/pages/commandes-emis/en-cours', color: theme.palette.secondary.main },
        { title: 'Reçues', icon: <ImportCurve size={24} />, url: '/pages/commandes-recus/en-cours', color: theme.palette.success.main },
        { title: 'Livrées', icon: <BoxTick size={24} />, url: '/pages/commandes-livree', color: theme.palette.warning.main }
    ];

    return (
        <Grid container spacing={GRID_COMMON_SPACING}>
            <Grid size={12}>
                <Card
                    sx={{
                        background: theme.palette.mode === 'dark'
                            ? `linear-gradient(135deg, ${alpha(theme.palette.primary.darker, 0.4)} 0%, ${alpha(theme.palette.background.paper, 0.8)} 100%)`
                            : `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.2)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
                        position: 'relative',
                        overflow: 'hidden',
                        borderRadius: 6,
                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        backdropFilter: 'blur(20px)',
                        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)'
                    }}
                >
                    <CardContent sx={{ p: { xs: 3, md: 6 }, position: 'relative', zIndex: 1 }}>
                        <Grid container spacing={4} alignItems="center">
                            <Grid size={{ xs: 12, md: 7 }}>
                                <Stack spacing={4}>
                                    <Box>
                                        <Typography variant="h5" color="primary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 2, mb: 1 }}>
                                            Tableau de Bord
                                        </Typography>
                                        <Typography variant="h1" sx={{ fontWeight: 800, fontSize: { xs: '2.5rem', md: '3.5rem' }, lineHeight: 1.2 }}>
                                            Salut, {name} <Box component="span" sx={{ fontSize: '2.5rem' }}>👋</Box>
                                        </Typography>
                                        <Typography variant="h4" color="text.secondary" sx={{ mt: 2, fontWeight: 300 }}>
                                            Votre centre de commandement pour <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>Plexus Automotive</Box> est prêt.
                                        </Typography>
                                    </Box>

                                    <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 2 }}>
                                        {quickActions.map((action, index) => (
                                            <Button
                                                key={index}
                                                component={Link}
                                                href={action.url}
                                                variant="outlined"
                                                startIcon={action.icon}
                                                sx={{
                                                    borderRadius: 3,
                                                    px: 3,
                                                    py: 1.5,
                                                    borderColor: alpha(action.color, 0.2),
                                                    bgcolor: alpha(action.color, 0.05),
                                                    color: 'text.primary',
                                                    textTransform: 'none',
                                                    fontSize: '1rem',
                                                    fontWeight: 600,
                                                    transition: 'all 0.2s',
                                                    '&:hover': {
                                                        bgcolor: action.color,
                                                        color: '#fff',
                                                        borderColor: action.color,
                                                        transform: 'translateY(-2px)',
                                                        boxShadow: `0 4px 12px ${alpha(action.color, 0.4)}`
                                                    }
                                                }}
                                            >
                                                {action.title}
                                            </Button>
                                        ))}
                                    </Stack>
                                </Stack>
                            </Grid>

                            <Grid size={{ xs: 12, md: 5 }} sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
                                <Box
                                    sx={{
                                        position: 'relative',
                                        width: '100%',
                                        maxWidth: 450,
                                        '&::before': {
                                            content: '""',
                                            position: 'absolute',
                                            top: '50%',
                                            left: '50%',
                                            transform: 'translate(-50%, -50%)',
                                            width: '80%',
                                            height: '80%',
                                            background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.2)} 0%, transparent 70%)`,
                                            filter: 'blur(40px)',
                                            zIndex: -1
                                        }
                                    }}
                                >
                                    <Box
                                        component="img"
                                        src={welcomeIllustrationTech}
                                        alt="Analytics Illustration"
                                        sx={{
                                            width: '100%',
                                            height: 'auto',
                                            filter: 'drop-shadow(0px 30px 60px rgba(0,0,0,0.15))',
                                            animation: 'pulse 4s ease-in-out infinite'
                                        }}
                                    />
                                </Box>
                            </Grid>
                        </Grid>
                    </CardContent>

                    {/* Background decorative elements */}
                    <Box
                        sx={{
                            position: 'absolute',
                            top: '10%',
                            right: '5%',
                            width: 300,
                            height: 300,
                            borderRadius: '50%',
                            background: `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.1)}, transparent)`,
                            filter: 'blur(60px)',
                            zIndex: 0
                        }}
                    />

                    <style jsx>{`
            @keyframes pulse {
              0% { transform: scale(1); }
              50% { transform: scale(1.02); }
              100% { transform: scale(1); }
            }
          `}</style>
                </Card>
            </Grid>
        </Grid>
    );
}
