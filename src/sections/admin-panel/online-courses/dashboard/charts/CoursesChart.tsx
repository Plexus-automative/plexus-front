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

type ChartData = {
  name: string;
  data: number[];
};

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

// Initial chart options
const baseChartOptions = {
  chart: { type: 'bar', toolbar: { show: false }, offsetX: -5 },
  plotOptions: { bar: { horizontal: false, columnWidth: '55%' } },
  yaxis: { labels: { show: false } },
  legend: { show: true, position: 'top', horizontalAlign: 'right' },
  dataLabels: { enabled: false },
  stroke: { show: true, width: 3, colors: ['transparent'] },
  grid: { strokeDashArray: 4 },
  tooltip: { y: { formatter: (val: number) => `$${val} thousands` } },
  xaxis: {
    categories: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'],
    axisTicks: { show: false }
  }
};

// ==============================|| DASHBOARD - COURSES CHART ||============================== //

export default function CoursesChart({ data }: { data: ChartData[] }) {
  const theme = useTheme();

  const [chartSeries, setChartSeries] = useState(data);
  const [chartOptions, setChartOptions] = useState<ChartProps>(baseChartOptions);

  useEffect(() => {
    setChartOptions((prev) => ({
      ...prev,
      colors: [theme.palette.primary.main, theme.palette.warning.main],
      grid: { ...prev.grid, borderColor: theme.palette.divider },
      xaxis: {
        ...prev.xaxis,
        labels: { style: { colors: theme.palette.text.secondary } },
        axisBorder: { color: theme.palette.divider }
      },
      theme: { mode: theme.palette.mode === ThemeMode.DARK ? 'dark' : 'light' }
    }));
  }, [theme]);

  useEffect(() => {
    setChartSeries(data);
  }, [data]);

  return <ReactApexChart options={chartOptions} series={chartSeries} type="bar" height={190} />;
}
