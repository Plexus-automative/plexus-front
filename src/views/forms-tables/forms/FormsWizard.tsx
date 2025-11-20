// material-ui
import Grid from '@mui/material/Grid';

// project-imports
import { GRID_COMMON_SPACING } from 'config';

import BasicWizard from 'sections/forms/wizard/basic-wizard';
import ValidationWizard from 'sections/forms/wizard/validation-wizard';

// ==============================|| FORMS WIZARD ||============================== //

export default function FormsWizardPage() {
  return (
    <Grid container spacing={GRID_COMMON_SPACING} sx={{ justifyContent: 'center' }}>
      <Grid size={{ xs: 12, md: 6, lg: 7 }}>
        <BasicWizard />
      </Grid>
      <Grid size={{ xs: 12, md: 6, lg: 7 }}>
        <ValidationWizard />
      </Grid>
    </Grid>
  );
}
