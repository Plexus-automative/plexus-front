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

interface ChartProp {
  name: string;
  data: number[];
}
interface Props {
  data: ChartProp[];
}

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

// chart options
const lineChartOptions = {
  chart: {
    type: 'line',
    zoom: { enabled: false },
    toolbar: { show: false }
  },
  xaxis: { axisTicks: { show: false }, axisBorder: { show: false } },
  yaxis: { stepSize: 200 },
  plotOptions: { bar: { borderRadius: 0 } },
  dataLabels: { enabled: false },
  tooltip: { x: { show: false } },
  grid: { show: false }
};

// ==============================|| EARNING - CHART ||============================== //

export default function EarningChart({ data }: Props) {
  const theme = useTheme();
  const { mode } = theme.palette;
  const { secondary } = theme.palette.text;

  const [options, setOptions] = useState<ChartProps>(lineChartOptions);

  useEffect(() => {
    setOptions((prevState) => ({
      ...prevState,
      xaxis: {
        ...prevState.xaxis,
        categories: [2018, 2019, 2020, 2021, 2022, 2023],
        labels: { style: { colors: secondary } }
      },
      yaxis: {
        ...prevState.yaxis,
        labels: { style: { colors: secondary } }
      },
      colors: [theme.palette.warning.main],
      theme: { mode: mode === ThemeMode.DARK ? 'dark' : 'light' }
    }));
  }, [mode, secondary, theme]);

  const [series, setSeries] = useState(data);

  useEffect(() => {
    setSeries(data);
  }, [data]);

  return <ReactApexChart options={options} series={series} type="line" height={212} />;
}
