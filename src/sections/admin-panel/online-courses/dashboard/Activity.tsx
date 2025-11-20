import { useMemo, useState } from 'react';

// material-ui
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project-imports
import ActivityChart from './charts/ActivityChart';
import MainCard from 'components/MainCard';

const activityData: { [key: string]: { name: string; data: number[] }[] } = {
  today: [
    { name: 'Free Course', data: [50, 100, 150, 200, 250, 300, 250, 200, 150, 100, 50, 75] },
    { name: 'Subscription', data: [25, 50, 75, 100, 150, 200, 150, 100, 75, 50, 25, 50] }
  ],
  weekly: [
    { name: 'Free Course', data: [55, 110, 160, 210, 260, 310, 290, 250, 180, 140, 90, 130] },
    { name: 'Subscription', data: [30, 60, 90, 120, 180, 240, 200, 160, 120, 80, 50, 70] }
  ],
  monthly: [
    { name: 'Free Course', data: [50, 150, 200, 250, 200, 100, 50, 100, 150, 200, 250, 300] },
    { name: 'Subscription', data: [25, 75, 100, 150, 100, 50, 25, 50, 75, 100, 150, 200] }
  ]
};

// ==============================|| DASHBOARD - ACTIVITY ||============================== //

export default function ActivityCard() {
  const [value, setValue] = useState('monthly');

  const handleChange = (event: SelectChangeEvent) => {
    setValue(event.target.value as string);
  };

  const chartData = useMemo(() => activityData[value], [value]);

  return (
    <MainCard content={false} sx={{ p: 2.5 }}>
      <Stack sx={{ gap: 1.5 }}>
        <Stack direction="row" sx={{ gap: 1, alignItems: 'center', justifyContent: 'space-between' }}>
          <Stack sx={{ gap: 0.5 }}>
            <Typography variant="h5">Activity</Typography>
          </Stack>
          <Box sx={{ minWidth: 120 }}>
            <FormControl fullWidth size="small">
              <Select id="activity-time-select" value={value} onChange={handleChange}>
                <MenuItem value="today">Today</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Stack>
        <ActivityChart data={chartData} />
      </Stack>
    </MainCard>
  );
}
