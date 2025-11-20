'use client';

import { useMemo, useState } from 'react';

// material-ui
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project-imports
import StatisticsChart from './charts/StatisticsChart';
import MainCard from 'components/MainCard';

const statisticsData: { [key: string]: { name: string; data: number[] }[] } = {
  today: [
    { name: 'Revenue', data: [200, 350, 275, 275, 400, 400, 300, 440, 320, 320, 275, 400] },
    { name: 'Sales', data: [200, 250, 300, 340, 320, 320, 400, 350, 250, 240, 340, 320] }
  ],
  weekly: [
    { name: 'Revenue', data: [350, 850, 755, 435, 345, 570, 695, 950, 1025, 215, 650, 350] },
    { name: 'Sales', data: [353, 450, 687, 786, 256, 159, 358, 852, 981, 1028, 450, 851] }
  ],
  monthly: [
    { name: 'Revenue', data: [130, 753, 951, 456, 159, 357, 258, 654, 546, 852, 1059, 345] },
    { name: 'Sales', data: [573, 159, 753, 357, 205, 458, 687, 860, 953, 1035, 258, 468] }
  ]
};

// ==============================|| DASHBOARD - STATISTICS ||============================== //

export default function StatisticsCard() {
  const [value, setValue] = useState('today');

  const handleChange = (event: SelectChangeEvent) => {
    setValue(event.target.value as string);
  };

  const chartData = useMemo(() => statisticsData[value], [value]);

  return (
    <MainCard>
      <Stack sx={{ gap: 1.5 }}>
        <Stack direction="row" sx={{ gap: 1, alignItems: 'center', justifyContent: 'space-between' }}>
          <Stack sx={{ gap: 0.25 }}>
            <Typography variant="h5">Statistics</Typography>
            <Typography sx={{ color: 'secondary.main' }}>Revenue and Sales</Typography>
          </Stack>
          <Box sx={{ minWidth: 120 }}>
            <FormControl fullWidth size="small">
              <Select id="statistics-time-select" value={value} onChange={handleChange}>
                <MenuItem value="today">Today</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Stack>
        <StatisticsChart data={chartData} />
      </Stack>
    </MainCard>
  );
}
