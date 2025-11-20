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
const areaChartOptions: ChartProps = {
  chart: {
    type: 'area',
    toolbar: {
      show: false
    }
  },
  dataLabels: {
    enabled: false
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
  legend: {
    show: true,
    fontFamily: 'Inter var',
    fontWeight: 500,
    position: 'top',
    labels: {
      useSeriesColors: false
    },
    markers: {
      size: 5
    },
    itemMargin: {
      horizontal: 10,
      vertical: 4
    }
  },
  plotOptions: {
    bar: {
      columnWidth: '45%',
      borderRadius: 4
    }
  }
};

// ==============================|| MEMBERSHIP - DASHBOARD - ACTIVITY CHART ||============================== //

export default function ActivityChart() {
  const theme = useTheme();

  const mode = theme.palette.mode;
  const { primary, secondary } = theme.palette.text;
  const line = theme.palette.divider;

  const [options, setOptions] = useState<ChartProps>(areaChartOptions);

  useEffect(() => {
    setOptions((prevState) => ({
      ...prevState,
      colors: [theme.palette.success.main, theme.palette.success.lighter],
      stroke: {
        curve: 'monotoneCubic',
        width: 2
      },
      xaxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        labels: {
          style: {
            colors: [
              secondary,
              secondary,
              secondary,
              secondary,
              secondary,
              secondary,
              secondary,
              secondary,
              secondary,
              secondary,
              secondary,
              secondary
            ]
          }
        },
        axisBorder: {
          show: false,
          color: line
        },
        axisTicks: {
          show: false
        },
        tickAmount: 11
      },
      yaxis: {
        labels: {
          style: {
            colors: [secondary]
          }
        },
        max: 600,
        stepSize: 200
      },
      grid: {
        borderColor: line
      },
      theme: { mode: mode === ThemeMode.DARK ? 'dark' : 'light' }
    }));
  }, [mode, primary, secondary, line, theme]);

  const [series] = useState([
    {
      name: 'Active',
      data: [20, 230, 280, 220, 120, 90, 250, 460, 580, 590, 480, 200]
    },
    {
      name: 'Inactive',
      data: [80, 450, 550, 450, 250, 200, 250, 300, 250, 200, 350, 450]
    }
  ]);

  return <ReactApexChart options={options} series={series} type="area" height={225} />;
}
