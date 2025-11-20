'use client';

import { useState, useEffect } from 'react';

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
const areaChartOptions = {
  chart: {
    height: 350,
    type: 'line',
    stacked: false,
    toolbar: {
      show: false
    }
  },
  plotOptions: {
    bar: {
      columnWidth: '50%'
    }
  },
  legend: {
    show: false
  },
  stroke: {
    width: [0, 2],
    curve: 'smooth'
  },
  dataLabels: {
    enabled: false
  }
};

// ==============================|| INVOICE - INCOME AREA CHART ||============================== //

export default function InvoiceIncomeAreaChart({ series }: { series: any }) {
  const theme = useTheme();
  const mode = theme.palette.mode;

  const { primary, secondary } = theme.palette.text;
  const line = theme.palette.divider;

  const [options, setOptions] = useState<ChartProps>(areaChartOptions);

  useEffect(() => {
    setOptions((prevState) => ({
      ...prevState,
      colors: [theme.palette.warning.main, theme.palette.warning.main],
      xaxis: {
        type: 'datetime',
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        labels: {
          style: { colors: secondary }
        },
        axisBorder: {
          show: false,
          color: line
        },
        tickAmount: 11
      },
      yaxis: {
        labels: {
          style: { colors: secondary }
        }
      },
      fill: {
        type: 'gradient',
        gradient: {
          inverseColors: false,
          shade: 'light',
          type: 'vertical',
          opacityFrom: [0, 1],
          opacityTo: [0.5, 1],
          stops: [0, 100],
          hover: {
            inverseColors: false,
            shade: 'light',
            type: 'vertical',
            opacityFrom: 0.15,
            opacityTo: 0.65,
            stops: [0, 96, 100]
          }
        }
      },
      markers: {
        size: [0, 3],
        colors: theme.palette.background.paper,
        strokeWidth: [0, 2],
        strokeColors: theme.palette.warning.main,
        hover: {
          size: 5,
          colors: theme.palette.warning.main,
          strokeColors: theme.palette.background.paper
        }
      },
      grid: {
        borderColor: line
      },
      theme: { mode: mode === ThemeMode.DARK ? 'dark' : 'light' }
    }));
  }, [mode, primary, secondary, line, theme]);

  return (
    <Box sx={{ '.apexcharts-bar-area': { strokeWidth: 0 } }}>
      <ReactApexChart options={options} series={series} type="line" height={262} />
    </Box>
  );
}
