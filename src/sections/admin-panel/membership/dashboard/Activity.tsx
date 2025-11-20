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
import ActivityChart from './ActivityChart';
import MainCard from 'components/MainCard';

// ==============================|| MEMBERSHIP - DASHBOARD - ACTIVITY ||============================== //

export default function Activity() {
  const [value, setValue] = useState('30');
  const handleChange = (event: SelectChangeEvent) => {
    setValue(event.target.value as string);
  };

  return (
    <MainCard>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
        <Typography variant="h5">Activity</Typography>
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
      <ActivityChart />
    </MainCard>
  );
}
