// material-ui
import Stack from '@mui/material/Stack';

// project-imports
import { GRID_COMMON_SPACING } from 'config';
import RowSelectionTable from 'sections/tables/react-table/RowSelectionTable';
import RSPControl from 'sections/tables/react-table/RSPControl';

// ==============================|| REACT TABLE - ROW SELECTION ||============================== //

export default function RowSelection() {
  return (
    <Stack sx={{ gap: GRID_COMMON_SPACING }}>
      <RowSelectionTable />
      <RSPControl />
    </Stack>
  );
}
