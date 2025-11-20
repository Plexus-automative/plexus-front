'use client';

import { useEffect, useState } from 'react';

// next
import dynamic from 'next/dynamic';

// material-ui
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';

// third-party
import { Props as ChartProps } from 'react-apexcharts';

// project-imports
import { ThemeMode } from 'config';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

const pieChartOptions = {
  chart: {
    type: 'donut',
    height: 299
  },
  labels: ['Total Signup', 'Active Student'],
  legend: {
    show: true,
    position: 'bottom'
  },
  dataLabels: {
    enabled: false
  }
};

// ==============================|| STUDENT STATES - CHART ||============================== //s

export function ApexDonutChart() {
  const theme = useTheme();
  const { mode, divider } = theme.palette;
  const [options, setOptions] = useState<ChartProps>(pieChartOptions);

  const series = [70, 30];

  useEffect(() => {
    const primaryDark = theme.palette.primary.dark;
    const primaryLight = theme.palette.primary.light;

    setOptions((prevState) => ({
      ...prevState,
      colors: [primaryDark, primaryLight],
      grid: { borderColor: divider },
      stroke: { colors: ['background.paper'] },
      theme: { mode: mode === ThemeMode.DARK ? 'dark' : 'light' }
    }));
  }, [divider, mode, theme.palette]);

  return (
    <Box sx={{ '.apexcharts-active': { color: 'common.white' } }}>
      <ReactApexChart options={options} series={series} type="donut" height={280} />
    </Box>
  );
}
