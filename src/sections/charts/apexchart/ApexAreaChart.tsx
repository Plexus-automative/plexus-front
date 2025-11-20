'use client';

import { useEffect, useState } from 'react';

// next
import dynamic from 'next/dynamic';

// material-ui
import { useTheme } from '@mui/material/styles';

// third-party
import { Props as ChartProps } from 'react-apexcharts';

// project-imports
import { ThemeMode } from 'config';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

// chart options
const areaChartOptions = {
  chart: {
    height: 350,
    type: 'area'
  },
  colors: ['primary.700', 'primary.main'],
  dataLabels: {
    enabled: false
  },
  stroke: {
    curve: 'smooth'
  },
  xaxis: {
    type: 'datetime',
    categories: [
      '2018-09-19T00:00:00.000Z',
      '2018-09-19T01:30:00.000Z',
      '2018-09-19T02:30:00.000Z',
      '2018-09-19T03:30:00.000Z',
      '2018-09-19T04:30:00.000Z',
      '2018-09-19T05:30:00.000Z',
      '2018-09-19T06:30:00.000Z'
    ]
  },
  tooltip: {
    x: {
      format: 'dd/MM/yy HH:mm'
    }
  },
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
      horizontal: 15,
      vertical: 8
    }
  }
};

// ==============================|| APEXCHART - AREA ||============================== //

export default function ApexAreaChart() {
  const theme = useTheme();

  const mode = theme.palette.mode;
  const line = theme.palette.divider;
  const { primary, secondary } = theme.palette.text;

  const [series] = useState([
    {
      name: 'Series 1',
      data: [31, 40, 28, 51, 42, 109, 100]
    },
    {
      name: 'Series 2',
      data: [11, 32, 45, 32, 34, 52, 41]
    }
  ]);

  const [options, setOptions] = useState<ChartProps>(areaChartOptions);
  useEffect(() => {
    setOptions((prevState) => ({
      ...prevState,
      colors: [theme.palette.primary[700], theme.palette.primary.main],
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
      theme: { mode: mode === ThemeMode.DARK ? 'dark' : 'light' }
    }));
  }, [mode, primary, secondary, line, theme]);

  return (
    <div id="chart">
      <ReactApexChart options={options} series={series} type="area" height={350} />
    </div>
  );
}
