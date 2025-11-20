'use client';

// material-ui
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project-imports
import FileOverviewCard from 'components/cards/file-manager/FileOverviewCard';
import RecentFileCard from 'components/cards/file-manager/RecentFileCard';
import StorageCard from 'sections/apps/file-manager/StorageCard';

import { GRID_COMMON_SPACING } from 'config';
import { quickFilterData, recentFilesData } from 'data/file-manager';

// ==============================|| FILE MANAGER - SUMMARY SECTION ||============================== //

export default function SummaryAccordion() {
  const commonSummaryProps = {
    expandIcon: null,
    slotProps: { content: { sx: { mx: 0 } } },
    sx: { p: 0, mx: 0 }
  };

  return (
    <Box
      sx={{
        mb: 1,
        // apply gap b/w two accordions
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        '& .MuiAccordion-root': { border: 'none', bgcolor: 'transparent', '& .MuiAccordionDetails-root': { p: 0, border: 'none' } }
      }}
    >
      <Accordion defaultExpanded sx={{ '&.Mui-expanded': { mb: 4 } }}>
        <AccordionSummary aria-controls="panel1d-content" id="panel1d-header" {...commonSummaryProps}>
          <Typography variant="h5">Quick Filter</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={GRID_COMMON_SPACING}>
            {quickFilterData.map((item, index) => (
              <Grid key={index} size={{ xs: 12, sm: 6, lg: 3 }}>
                <FileOverviewCard item={item} />
              </Grid>
            ))}
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StorageCard />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
      {/* mb:4 also needed here due to last-item accordion mb always applied 0 */}
      <Accordion defaultExpanded sx={{ '&.Mui-expanded:last-of-type': { mb: 4 } }}>
        <AccordionSummary aria-controls="panel2d-content" id="panel2d-header" {...commonSummaryProps}>
          <Typography variant="h5">Recent Files</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={GRID_COMMON_SPACING}>
            {recentFilesData.map((item, index) => (
              <Grid key={index} size={{ xs: 12, sm: 6, lg: 3 }}>
                <RecentFileCard item={item} />
              </Grid>
            ))}
          </Grid>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}
