'use client';

import { useEffect, useState } from 'react';

// next
import dynamic from 'next/dynamic';

// material-ui
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';

// third-party
import { Props as ChartProps } from 'react-apexcharts';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

const pieChartOptions = {
  chart: {
    type: 'pie'
  },
  tooltip: {
    enabled: true,
    fillSeriesColor: true
  },
  labels: ['Very Satisfied', 'Satisfied', 'Poor', 'Very Poor'],
  legend: {
    show: false
  }
};

// ==============================|| DASHBOARD - CUSTOMER SATISFACTION CHART ||============================== //

export default function CustomerSatisfactionChart() {
  const theme = useTheme();
  const mode = theme.palette.mode;

  const [series] = useState([66, 50, 40, 30]);
  const [options, setOptions] = useState<ChartProps>(pieChartOptions);

  useEffect(() => {
    setOptions((prevState) => ({
      ...prevState,
      colors: [theme.palette.primary.dark, theme.palette.primary[400], theme.palette.primary.light, theme.palette.primary[200]],
      theme: {
        mode: mode === 'dark' ? 'dark' : 'light'
      },
      legend: {
        labels: {
          colors: theme.palette.text.secondary
        }
      },
      stroke: {
        colors: [theme.palette.background.paper]
      }
    }));
  }, [mode, theme]);

  return (
    <Box sx={{ '.apexcharts-active': { color: 'common.white' } }}>
      <ReactApexChart options={options} series={series} type="pie" height={250} />
    </Box>
  );
}
