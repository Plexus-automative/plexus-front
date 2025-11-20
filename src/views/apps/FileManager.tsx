// material-ui
import Stack from '@mui/material/Stack';

// project-imports
import { Files, SummaryAccordion } from 'sections/apps/file-manager';
import { GRID_COMMON_SPACING } from 'config';

// ==============================|| APPLICATION - FILE MANAGER ||============================== //

export default function FileManager() {
  return (
    <Stack gap={GRID_COMMON_SPACING}>
      <SummaryAccordion />
      <Files />
    </Stack>
  );
}
