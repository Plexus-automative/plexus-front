`use client`;

// material-ui
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project-imports
import { GRID_COMMON_SPACING } from 'config';

// ==============================|| DASHBOARD - BIENVENUE ||============================== //

export default function Bienvenue() {
  return (
    <Grid container spacing={GRID_COMMON_SPACING}>
      <Grid size={12}>
        <Card>
          <CardContent>
            <Stack spacing={1.5}>
              <Typography variant="h3">Bienvenue</Typography>
              <Typography variant="body1" color="text.secondary">
                Heureux de vous revoir sur la plateforme Plexus.
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

