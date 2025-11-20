'use client';

import { useState } from 'react';

// next
import dynamic from 'next/dynamic';

// material-ui
import { useTheme } from '@mui/material/styles';

// third-party
import { Props as ChartProps } from 'react-apexcharts';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

// ==============================|| INVITE GOAL - CHART ||============================== //

export default function RadialBarChart() {
  const theme = useTheme();

  const [options] = useState<ChartProps>({
    chart: {
      type: 'radialBar',
      offsetY: -40
    },
    plotOptions: {
      radialBar: {
        startAngle: -90,
        endAngle: 90,
        hollow: {
          size: '70%',
          background: 'transparent'
        },
        track: {
          background: theme.palette.grey[200],
          strokeWidth: '50%'
        },
        dataLabels: {
          name: { show: false },
          value: {
            offsetY: -30,
            fontSize: '24px',
            color: theme.palette.text.primary
          }
        }
      }
    },
    stroke: { lineCap: 'round', width: 20 },
    colors: [theme.palette.primary.main]
  });

  const [series] = useState([75.55]);

  return <ReactApexChart options={options} series={series} type="radialBar" height={350} />;
}
