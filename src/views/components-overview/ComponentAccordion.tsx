// material-ui
import Grid from '@mui/material/Grid';

// project-imports
import ComponentHeader from 'components/cards/ComponentHeader';
import { GRID_COMMON_SPACING } from 'config';

import ComponentWrapper from 'sections/components-overview/ComponentWrapper';
import BasicAccordion from 'sections/components-overview/accordion/BasicAccordion';
import DisabledAccordion from 'sections/components-overview/accordion/DisabledAccordion';
import ControlledAccordion from 'sections/components-overview/accordion/ControlledAccordion';
import FixedAccordion from 'sections/components-overview/accordion/FixedAccordion';
import CustomizedAccordion from 'sections/components-overview/accordion/CustomizedAccordion';

// ==============================|| COMPONENTS - ACCORDION ||============================== //

export default function ComponentAccordion() {
  return (
    <>
      <ComponentHeader
        title="Accordion"
        caption="Lists are continuous, vertical indexes of text or images."
        directory="src/pages/components-overview/accordion"
        link="https://mui.com/material-ui/react-accordion/"
      />
      <ComponentWrapper>
        <Grid container spacing={GRID_COMMON_SPACING}>
          <Grid size={{ xs: 12, lg: 6 }}>
            <BasicAccordion />
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <DisabledAccordion />
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <ControlledAccordion />
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <FixedAccordion />
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <CustomizedAccordion />
          </Grid>
        </Grid>
      </ComponentWrapper>
    </>
  );
}
