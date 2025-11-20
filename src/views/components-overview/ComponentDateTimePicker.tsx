// material-ui
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';

// project-imports
import ComponentHeader from 'components/cards/ComponentHeader';
import { GRID_COMMON_SPACING } from 'config';

import ComponentWrapper from 'sections/components-overview/ComponentWrapper';
import StaticDatePicker from 'sections/components-overview/date-time-picker/StaticDatePicker';
import SubComponentsPickers from 'sections/components-overview/date-time-picker/SubComponentsPickers';
import LandscapeDatePicker from 'sections/components-overview/date-time-picker/LandscapeDatePicker';
import BasicPickers from 'sections/components-overview/date-time-picker/BasicPickers';
import NativePickers from 'sections/components-overview/date-time-picker/NativePickers';
import LocalizedPicker from 'sections/components-overview/date-time-picker/LocalizedPicker';
import HelperText from 'sections/components-overview/date-time-picker/HelperText';
import DisabledPickers from 'sections/components-overview/date-time-picker/DisabledPickers';

// ===============================|| COMPONENTS - DATE / TIME PICKER ||=============================== //

export default function ComponentDateTimePicker() {
  return (
    <>
      <ComponentHeader
        title="Date / Time Picker"
        caption="Date pickers let the user select a date."
        directory="src/pages/components-overview/date-time-picker"
        link="https://mui.com/x/react-date-pickers/getting-started/"
      />
      <ComponentWrapper>
        <Grid container spacing={GRID_COMMON_SPACING}>
          <Grid size={{ xs: 12, lg: 6 }}>
            <Stack sx={{ gap: GRID_COMMON_SPACING }}>
              <StaticDatePicker />
              <SubComponentsPickers />
              <LandscapeDatePicker />
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <Stack sx={{ gap: GRID_COMMON_SPACING }}>
              <BasicPickers />
              <HelperText />
              <NativePickers />
              <LocalizedPicker />
              <DisabledPickers />
            </Stack>
          </Grid>
        </Grid>
      </ComponentWrapper>
    </>
  );
}
