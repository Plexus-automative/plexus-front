// material-ui
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

// project-imports
import MainCard from 'components/MainCard';
import { HEADER_HEIGHT } from 'config';

// assets
import { Personalcard } from '@wandersonalwes/iconsax-react';

// ==============================|| LAYOUTS - STICKY ACTION BAR ||============================== //

export default function StickyActionBar() {
  return (
    <MainCard content={false} sx={{ overflow: 'visible' }}>
      <CardActions
        sx={{
          position: 'sticky',
          top: HEADER_HEIGHT,
          bgcolor: 'background.default',
          zIndex: 1,
          borderBottom: '1px solid',
          borderBottomColor: 'divider',
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12
        }}
      >
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', width: 1 }}>
          <Typography variant="h5" sx={{ m: 0, pl: 1.5 }}>
            Sticky Action Bar:
          </Typography>
          <Stack direction="row" sx={{ gap: 1, px: 1.5, py: 0.75 }}>
            <Button color="error" size="small">
              Cancel
            </Button>
            <Button variant="contained" size="small">
              Submit
            </Button>
          </Stack>
        </Stack>
      </CardActions>
      <CardContent>
        <Grid container spacing={3} sx={{ alignItems: 'center' }}>
          <Grid size={12}>
            <Grid container spacing={2} alignItems="flex-start">
              <Grid sx={{ pt: 0.75 }} size={{ xs: 'auto', sm: 3, lg: 4 }}>
                <Avatar variant="rounded" color="inherit" sx={{ bgcolor: 'secondary.main', ml: 'auto' }}>
                  <Personalcard />
                </Avatar>
              </Grid>
              <Grid size={{ xs: 12, sm: 9, lg: 6 }}>
                <Typography variant="h3" sx={{ mb: 0 }}>
                  Personal Information
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Sticky Action Bar Lorem Ipsum is simply
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid size={12}>
            <Divider />
          </Grid>
          <Grid size={12}>
            <Grid container spacing={2} sx={{ alignItems: 'center' }}>
              <Grid size={{ xs: 12, sm: 3, lg: 4 }} />
              <Grid size={{ xs: 12, sm: 9, lg: 6 }}>
                <Typography variant="h5" sx={{ mb: 3 }}>
                  A. Personal Info:
                </Typography>
              </Grid>
              <Grid sx={{ pt: { xs: 2, sm: '0 !important' }, mb: { xs: 0, sm: 2 } }} size={{ xs: 12, sm: 3, lg: 4 }}>
                <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' } }}>Name :</InputLabel>
              </Grid>
              <Grid size={{ xs: 12, sm: 9, lg: 6 }}>
                <TextField fullWidth placeholder="Enter full name" />
                <FormHelperText>Please enter your full name</FormHelperText>
              </Grid>
              <Grid sx={{ pt: { xs: 2, sm: '0 !important' }, mb: { xs: 0, sm: 2 } }} size={{ xs: 12, sm: 3, lg: 4 }}>
                <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' } }}>Email :</InputLabel>
              </Grid>
              <Grid size={{ xs: 12, sm: 9, lg: 6 }}>
                <TextField fullWidth placeholder="Enter email" />
                <FormHelperText>Please enter your Email</FormHelperText>
              </Grid>
              <Grid sx={{ pt: { xs: 2, sm: '0 !important' }, mb: { xs: 0, sm: 2 } }} size={{ xs: 12, sm: 3, lg: 4 }}>
                <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' } }}>Password :</InputLabel>
              </Grid>
              <Grid size={{ xs: 12, sm: 9, lg: 6 }}>
                <TextField fullWidth placeholder="Enter Password" />
                <FormHelperText>Please enter your Password</FormHelperText>
              </Grid>
            </Grid>
          </Grid>
          <Grid size={12}>
            <Divider />
          </Grid>
          <Grid size={12}>
            <Grid container spacing={2} sx={{ alignItems: 'center' }}>
              <Grid size={{ xs: 12, sm: 3, lg: 4 }} />
              <Grid size={{ xs: 12, sm: 9, lg: 6 }}>
                <Typography variant="h5" sx={{ mb: 3 }}>
                  B. Educational Info:
                </Typography>
              </Grid>
              <Grid sx={{ pt: { xs: 2, sm: '0 !important' }, mb: { xs: 0, sm: 2 } }} size={{ xs: 12, sm: 3, lg: 4 }}>
                <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' } }}>Degree Name :</InputLabel>
              </Grid>
              <Grid size={{ xs: 12, sm: 9, lg: 6 }}>
                <TextField fullWidth placeholder="Enter Degree name" />
                <FormHelperText>Please enter your Degree name</FormHelperText>
              </Grid>
              <Grid sx={{ pt: { xs: 2, sm: '0 !important' }, mb: { xs: 0, sm: 2 } }} size={{ xs: 12, sm: 3, lg: 4 }}>
                <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' } }}>Passing Year :</InputLabel>
              </Grid>
              <Grid size={{ xs: 12, sm: 9, lg: 6 }}>
                <TextField fullWidth placeholder="Enter Passing Year" />
                <FormHelperText>Please enter Passing Year</FormHelperText>
              </Grid>
              <Grid sx={{ pt: { xs: 2, sm: '0 !important' }, mb: { xs: 0, sm: 2 } }} size={{ xs: 12, sm: 3, lg: 4 }}>
                <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' } }}>College Name :</InputLabel>
              </Grid>
              <Grid size={{ xs: 12, sm: 9, lg: 6 }}>
                <TextField fullWidth placeholder="Enter College name" />
                <FormHelperText>Please enter your College name</FormHelperText>
              </Grid>
              <Grid sx={{ pt: { xs: 2, sm: '0 !important' }, mb: { xs: 0, sm: 2 } }} size={{ xs: 12, sm: 3, lg: 4 }}>
                <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' } }}>Work Experience :</InputLabel>
              </Grid>
              <Grid size={{ xs: 12, sm: 9, lg: 6 }}>
                <TextField fullWidth placeholder="Enter Work Experience" />
                <FormHelperText>Please enter your Work Experience</FormHelperText>
              </Grid>
              <Grid sx={{ pt: { xs: 2, sm: '0 !important' } }} size={{ xs: 12, sm: 3, lg: 4 }}>
                <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' } }}>Language :</InputLabel>
              </Grid>
              <Grid size={{ xs: 12, sm: 9, lg: 6 }}>
                <FormControlLabel control={<Checkbox defaultChecked />} label="English" />
                <FormControlLabel control={<Checkbox />} label="French" />
                <FormControlLabel control={<Checkbox />} label="Dutch" />
              </Grid>
              <Grid sx={{ pt: { xs: 2, sm: '0 !important' } }} size={{ xs: 12, sm: 3, lg: 4 }}>
                <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' } }}>Hobby :</InputLabel>
              </Grid>
              <Grid size={{ xs: 12, sm: 9, lg: 6 }}>
                <FormControlLabel control={<Checkbox />} label="Reading" />
                <FormControlLabel control={<Checkbox />} label="Dancing" />
                <FormControlLabel control={<Checkbox />} label="Swimming" />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
      <Divider />
      <CardActions>
        <Stack direction="row" sx={{ gap: 1, justifyContent: 'center', width: 1, px: 1.5, py: 0.75 }}>
          <Button color="error" size="small">
            Cancel
          </Button>
          <Button variant="contained" size="small">
            Submit
          </Button>
        </Stack>
      </CardActions>
    </MainCard>
  );
}
