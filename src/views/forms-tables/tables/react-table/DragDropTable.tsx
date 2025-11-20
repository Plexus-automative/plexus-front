// material-ui
import Stack from '@mui/material/Stack';

// project-imports
import { GRID_COMMON_SPACING } from 'config';

import RowDragDrop from 'sections/tables/react-table/RowDragDrop';
import ColumnDragDrop from 'sections/tables/react-table/ColumnDragDrop';

// ==============================|| REACT TABLE - DRAG & DROP ||============================== //

export default function DragDrop() {
  return (
    <Stack sx={{ gap: GRID_COMMON_SPACING }}>
      <RowDragDrop /> <ColumnDragDrop />
    </Stack>
  );
}
