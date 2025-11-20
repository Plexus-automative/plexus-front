// material-ui
import Grid from '@mui/material/Grid';

// project-imports
import ComponentHeader from 'components/cards/ComponentHeader';
import { GRID_COMMON_SPACING } from 'config';

import ComponentWrapper from 'sections/components-overview/ComponentWrapper';
import ServerModal from 'sections/components-overview/modal/ServerModal';
import BasicModal from 'sections/components-overview/modal/BasicModal';
import NestedModal from 'sections/components-overview/modal/NestedModal';
import TransitionsModal from 'sections/components-overview/modal/TransitionsModal';

// ==============================|| COMPONENTS - MODAL ||============================== //

export default function ComponentModal() {
  return (
    <>
      <ComponentHeader
        title="Modal"
        caption="The modal component provides a solid foundation for creating dialogs, popovers, lightboxes, or whatever else."
        directory="src/pages/components-overview/modal"
        link="https://mui.com/material-ui/react-modal"
      />
      <ComponentWrapper>
        <Grid container spacing={GRID_COMMON_SPACING}>
          <Grid size={12}>
            <ServerModal />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <BasicModal />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <NestedModal />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TransitionsModal />
          </Grid>
        </Grid>
      </ComponentWrapper>
    </>
  );
}
