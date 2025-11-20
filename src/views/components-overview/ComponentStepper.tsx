// material-ui
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';

// project-imports
import ComponentHeader from 'components/cards/ComponentHeader';
import { GRID_COMMON_SPACING } from 'config';

import ComponentWrapper from 'sections/components-overview/ComponentWrapper';
import HorizontalLinearStepper from 'sections/components-overview/stepper/HorizontalLinearStepper';
import HorizontalNonLinearStepper from 'sections/components-overview/stepper/HorizontalNonLinearStepper';
import VerticalLinearStepper from 'sections/components-overview/stepper/VerticalLinearStepper';
import CarouselEffectStepper from 'sections/components-overview/stepper/CarouselEffectStepper';

// ==============================|| COMPONENTS - STEPPER ||============================== //

export default function ComponentStepper() {
  return (
    <>
      <ComponentHeader
        title="Stepper"
        caption="Steppers convey progress through numbered steps. It provides a wizard-like workflow."
        directory="src/pages/components-overview/stepper"
        link="https://mui.com/material-ui/react-stepper/"
      />
      <ComponentWrapper>
        <Grid container spacing={GRID_COMMON_SPACING}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <Stack sx={{ gap: GRID_COMMON_SPACING }}>
              <HorizontalLinearStepper />
              <HorizontalNonLinearStepper />
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, lg: 4 }}>
            <Stack sx={{ gap: GRID_COMMON_SPACING }}>
              <VerticalLinearStepper />
              <CarouselEffectStepper />
            </Stack>
          </Grid>
        </Grid>
      </ComponentWrapper>
    </>
  );
}
