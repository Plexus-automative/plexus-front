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
import MainCard from 'components/MainCard';
import EarningChart from './charts/EarningChart';

const earningData: { [key: string]: { name: string; data: number[] }[] } = {
  weekly: [{ name: 'Earning', data: [750, 550, 650, 450, 500, 350] }],
  monthly: [{ name: 'Earning', data: [500, 700, 300, 600, 200, 400] }],
  yearly: [{ name: 'Earning', data: [100, 200, 450, 500, 700, 800] }]
};

// ==============================|| DASHBOARD - EARNING COURSE ||============================== //

export default function EarningCourseCard() {
  const [value, setValue] = useState('yearly');

  const handleChange = (event: SelectChangeEvent) => {
    setValue(event.target.value as string);
  };

  const chartData = useMemo(() => earningData[value], [value]);

  return (
    <MainCard>
      <Stack sx={{ gap: 2.5 }}>
        <Stack direction="row" sx={{ gap: 1, alignItems: 'center', justifyContent: 'space-between' }}>
          <Stack sx={{ gap: 0.5 }}>
            <Typography variant="h5">Earning Courses</Typography>
          </Stack>
          <Box sx={{ minWidth: 120 }}>
            <FormControl fullWidth size="small">
              <Select id="earning-time-select" value={value} onChange={handleChange}>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="yearly">Yearly</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Stack>
        <EarningChart data={chartData} />
      </Stack>
    </MainCard>
  );
}
