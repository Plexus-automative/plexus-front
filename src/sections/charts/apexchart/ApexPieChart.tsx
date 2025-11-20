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

// chart options
const pieChartOptions = {
  chart: {
    type: 'pie',
    width: 450,
    height: 450
  },
  labels: ['Team A', 'Team B', 'Team C', 'Team D', 'Team E'],
  legend: {
    show: true,
    fontFamily: `Inter var`,
    position: 'bottom',
    labels: {
      useSeriesColors: false
    },
    markers: {
      size: 7
    },
    itemMargin: {
      horizontal: 25,
      vertical: 4
    }
  },
  responsive: [
    {
      breakpoint: 450,
      options: {
        chart: {
          width: 280,
          height: 280
        },
        legend: {
          show: false,
          position: 'bottom'
        }
      }
    }
  ]
};

// ==============================|| APEXCHART - PIE ||============================== //

export default function ApexPieChart() {
  const theme = useTheme();
  const mode = theme.palette.mode;

  const { primary } = theme.palette.text;
  const line = theme.palette.divider;
  const grey200 = theme.palette.secondary[200];
  const backColor = theme.palette.background.paper;

  const [series] = useState([44, 55, 13, 43, 22]);
  const [options, setOptions] = useState<ChartProps>(pieChartOptions);

  const secondary = theme.palette.primary[700];
  const primaryMain = theme.palette.primary.main;
  const successDark = theme.palette.success.main;
  const error = theme.palette.error.main;
  const orangeDark = theme.palette.warning.main;

  useEffect(() => {
    setOptions((prevState) => ({
      ...prevState,
      colors: [secondary, primaryMain, successDark, error, orangeDark],
      xaxis: {
        labels: {
          style: { colors: primary }
        }
      },
      yaxis: {
        labels: {
          style: { colors: primary }
        }
      },
      grid: {
        borderColor: line
      },
      legend: {
        labels: {
          colors: 'secondary.main'
        }
      },
      stroke: {
        colors: [backColor]
      },
      theme: { mode: mode === ThemeMode.DARK ? 'dark' : 'light' }
    }));
  }, [mode, primary, line, grey200, backColor, secondary, primaryMain, successDark, error, orangeDark]);

  return (
    <Box id="chart" sx={{ '.apexcharts-active': { color: 'common.white' } }}>
      <ReactApexChart options={options} series={series} type="pie" />;
    </Box>
  );
}
