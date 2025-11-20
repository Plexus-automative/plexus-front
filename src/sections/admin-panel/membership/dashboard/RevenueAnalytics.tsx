'use client';

import { useState } from 'react';

// material-ui
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project-imports
import RevenueAnalyticsChart from './RevenueAnalyticsChart';
import MainCard from 'components/MainCard';

// ==============================|| DASHBOARD - REVENUE ANALYTICS ||============================== //

export default function RevenueAnalytics() {
  const [value, setValue] = useState('30');
  const handleChange = (event: SelectChangeEvent) => {
    setValue(event.target.value as string);
  };

  return (
    <MainCard>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
        <Typography variant="h5">Revenue analytics</Typography>
        <Box>
          <FormControl fullWidth size="small">
            <Select id="demo-simple-select" value={value} onChange={handleChange}>
              <MenuItem value={10}>Today</MenuItem>
              <MenuItem value={20}>Weekly</MenuItem>
              <MenuItem value={30}>Monthly</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Stack>
      <RevenueAnalyticsChart />
    </MainCard>
  );
}
