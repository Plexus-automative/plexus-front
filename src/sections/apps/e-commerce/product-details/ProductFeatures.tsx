// material-ui
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

// ==============================|| PRODUCT DETAILS - FEATURES ||============================== //

export default function ProductFeatures() {
  return (
    <Grid container spacing={2}>
      <Grid size={3}>
        <Typography sx={{ color: 'text.secondary' }}>Band :</Typography>
      </Grid>
      <Grid size={9}>
        <Typography>Smart Band</Typography>
      </Grid>
      <Grid size={3}>
        <Typography noWrap sx={{ color: 'text.secondary' }}>
          Compatible Devices :
        </Typography>
      </Grid>
      <Grid size={9}>
        <Typography>Smartphones</Typography>
      </Grid>
      <Grid size={3}>
        <Typography noWrap sx={{ color: 'text.secondary' }}>
          Ideal For :
        </Typography>
      </Grid>
      <Grid size={9}>
        <Typography>Unisex</Typography>
      </Grid>
      <Grid size={3}>
        <Typography noWrap sx={{ color: 'text.secondary' }}>
          Lifestyle :
        </Typography>
      </Grid>
      <Grid size={9}>
        <Typography noWrap>Fitness | Indoor | Sports | Swimming | Outdoor</Typography>
      </Grid>
      <Grid size={3}>
        <Typography noWrap sx={{ color: 'text.secondary' }}>
          Basic Features :
        </Typography>
      </Grid>
      <Grid size={9}>
        <Typography noWrap>Calendar | Date & Time | Timer/Stop Watch</Typography>
      </Grid>
      <Grid size={3}>
        <Typography sx={{ color: 'text.secondary' }}>Health Tracker :</Typography>
      </Grid>
      <Grid size={9}>
        <Typography> Heart Rate | Exercise Tracker</Typography>
      </Grid>
    </Grid>
  );
}
