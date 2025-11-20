// material-ui
import Stack from '@mui/material/Stack';

// project-imports
import { GRID_COMMON_SPACING } from 'config';

import ExpandingTable from 'sections/tables/react-table/ExpandingTable';
import ExpandingDetails from 'sections/tables/react-table/ExpandingDetails';
import ExpandingSubTable from 'sections/tables/react-table/ExpandingSubTable';

// ==============================|| REACT TABLE - EXPANDING ||============================== //

export default function Expanding() {
  return (
    <Stack sx={{ gap: GRID_COMMON_SPACING }}>
      <ExpandingTable />
      <ExpandingDetails />
      <ExpandingSubTable />
    </Stack>
  );
}
