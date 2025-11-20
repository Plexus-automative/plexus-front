// material-ui
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project-imports
import CoursesChart from './charts/CoursesChart';
import MainCard from 'components/MainCard';

// assets
import { ArrowUp } from '@wandersonalwes/iconsax-react';

const chartData = [
  { name: 'Income', data: [180, 90, 135, 114, 120, 145, 90, 135, 114, 120, 145, 85] },
  { name: 'Expends', data: [120, 45, 78, 150, 168, 99, 45, 78, 150, 168, 99, 110] }
];

// ==============================|| DASHBOARD - COURSES ||============================== //

export default function CoursesCard() {
  return (
    <MainCard content={false} sx={{ p: 2.5 }}>
      <Stack direction="row" sx={{ gap: 1, alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography variant="h5">Courses</Typography>
        <Button>View Report</Button>
      </Stack>
      <Stack direction="row" sx={{ gap: 1, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <Stack sx={{ gap: 0.25 }}>
          <Typography variant="h3">$7,860</Typography>
          <Stack direction="row" sx={{ alignItems: 'center', color: 'success.main' }}>
            <ArrowUp size={14} />
            <Typography variant="subtitle2">2.1%</Typography>
          </Stack>
        </Stack>
        <Typography sx={{ color: 'text.secondary' }}>Sales from 1-12 Dec, 2023</Typography>
      </Stack>
      <CoursesChart data={chartData} />
    </MainCard>
  );
}
