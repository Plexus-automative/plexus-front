// material-ui
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';

// project-imports
import ComponentHeader from 'components/cards/ComponentHeader';
import { GRID_COMMON_SPACING } from 'config';

import ComponentWrapper from 'sections/components-overview/ComponentWrapper';
import BasicSelect from 'sections/components-overview/select/BasicSelect';
import HelperTextSelect from 'sections/components-overview/select/HelperTextSelect';
import AutoWidthSelect from 'sections/components-overview/select/AutoWidthSelect';
import MultipleSelect from 'sections/components-overview/select/MultipleSelect';
import CheckmarksSelect from 'sections/components-overview/select/CheckmarksSelect';
import ChipSelect from 'sections/components-overview/select/ChipSelect';

// ==============================|| COMPONENTS - SELECT ||============================== //

export default function ComponentSelect() {
  return (
    <>
      <ComponentHeader
        title="Select"
        caption="Select components are used for collecting user provided information from a list of options."
        directory="src/pages/components-overview/select"
        link="https://mui.com/material-ui/react-select/"
      />
      <ComponentWrapper>
        <Grid container spacing={GRID_COMMON_SPACING}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Stack sx={{ gap: GRID_COMMON_SPACING }}>
              <BasicSelect />
              <HelperTextSelect />
              <AutoWidthSelect />
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Stack sx={{ gap: GRID_COMMON_SPACING }}>
              <MultipleSelect />
              <CheckmarksSelect />
              <ChipSelect />
            </Stack>
          </Grid>
        </Grid>
      </ComponentWrapper>
    </>
  );
}
