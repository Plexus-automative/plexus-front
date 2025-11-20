'use client';

import { useState, useEffect } from 'react';

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
const initialChartOptions: ChartProps = {
  chart: {
    type: 'radialBar',
    sparkline: {
      enabled: true
    },
    offsetX: 0,
    offsetY: 0
  },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      type: 'vertical',
      inverseColors: false,
      opacityFrom: 0.5,
      opacityTo: 0
    }
  },
  plotOptions: {
    radialBar: {
      startAngle: -90,
      endAngle: 90,
      track: {
        strokeWidth: '80%',
        show: true,
        margin: 0
      },
      dataLabels: {
        name: { show: false },
        value: { offsetY: -2, fontSize: '20px' }
      }
    }
  },
  grid: {
    show: false
  },
  labels: ['Average Results']
};

// ==============================|| MEMBERSHIP - DASHBOARD - MEMBERSHIP STATE CHART ||============================== //

export default function MembershipStateChart() {
  const theme = useTheme();

  const [options, setOptions] = useState<ChartProps>(initialChartOptions);

  useEffect(() => {
    setOptions((prevState) => ({
      ...prevState,
      colors: [theme.palette.primary.main],
      fill: { type: 'solid' },
      theme: { mode: theme.palette.mode === ThemeMode.DARK ? 'dark' : 'light' },
      plotOptions: {
        radialBar: {
          startAngle: -90,
          endAngle: 90,
          track: {
            strokeWidth: '80%',
            show: true,

            background: theme.palette.primary.lighter,
            margin: 0
          },
          dataLabels: {
            name: { show: false },
            value: { offsetY: -2, fontSize: '20px' }
          }
        }
      }
    }));
  }, [theme]);

  const [series] = useState([75]);

  return <ReactApexChart options={options} series={series} type="radialBar" height={400} />;
}
