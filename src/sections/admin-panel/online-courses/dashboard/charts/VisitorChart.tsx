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
  data: { data: number[] }[];
}

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

// chart options
const barChartOptions = {
  chart: { type: 'bar', toolbar: { show: false } },
  xaxis: { axisTicks: { show: false }, axisBorder: { show: false } },
  plotOptions: { bar: { horizontal: false, columnWidth: '55%', borderRadius: 4 } },
  dataLabels: { enabled: false },
  stroke: { show: true, width: 3, colors: ['transparent'] },
  fill: { opacity: [1, 0.5] },
  grid: { show: false }
};

// ==============================|| VISITOR - CHART ||============================== //

export default function VisitorChart({ data }: Props) {
  const theme = useTheme();
  const { mode } = theme.palette;
  const { secondary } = theme.palette.text;

  const [options, setOptions] = useState<ChartProps>(barChartOptions);

  useEffect(() => {
    setOptions((prevState) => ({
      ...prevState,
      xaxis: {
        ...prevState.xaxis,
        categories: [2018, 2019, 2020, 2021, 2022, 2023],
        labels: { style: { colors: secondary } }
      },
      yaxis: { labels: { style: { colors: secondary } } },
      colors: [theme.palette.success.main],
      theme: { mode: mode === ThemeMode.DARK ? 'dark' : 'light' }
    }));
  }, [mode, secondary, theme]);

  const [series, setSeries] = useState(data);

  useEffect(() => {
    setSeries(data);
  }, [data]);

  return <ReactApexChart options={options} series={series} type="bar" height={233} />;
}
