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

interface Props {
  color: string;
  data: number[];
}

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

// chart options
const areaChartOptions = {
  chart: {
    type: 'line',
    zoom: { enabled: false },
    sparkline: { enabled: true }
  },
  plotOptions: { bar: { borderRadius: 0 } },
  dataLabels: { enabled: false },
  markers: { hover: { size: 5 } },
  tooltip: { x: { show: false } },
  grid: { show: false },
  stroke: { width: 2 }
};

// ==============================|| TOTAL CARD - CHART ||============================== //

export function TotalChart({ color, data }: Props) {
  const theme = useTheme();
  const mode = theme.palette.mode;

  const [options, setOptions] = useState<ChartProps>(areaChartOptions);

  useEffect(() => {
    setOptions((prevState) => ({
      ...prevState,
      colors: [color],
      theme: { mode: mode === ThemeMode.DARK ? 'dark' : 'light' }
    }));
  }, [color, mode]);

  const [series] = useState([{ name: 'Orders', data }]);

  return <ReactApexChart options={options} series={series} type="line" height={43} />;
}
