// material-ui
import Stack from '@mui/material/Stack';

// project-imports
import { GRID_COMMON_SPACING } from 'config';
import VirtualizedInfiniteScrollTable from 'sections/tables/react-table/VirtualizedInfiniteScrollTable';
import VirtualizedRowsTable from 'sections/tables/react-table/VirtualizedRowsTable';

// ==============================|| REACT TABLE - VIRTUALIZED ||============================== //

export default function VirtualizedRows() {
  return (
    <Stack sx={{ gap: GRID_COMMON_SPACING }}>
      <VirtualizedInfiniteScrollTable />
      <VirtualizedRowsTable />
    </Stack>
  );
}
