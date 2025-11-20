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
    },
    offsetY: 16
  },
  dataLabels: {
    enabled: false
  },
  stroke: {
    width: 1
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
    position: 'bottom',
    offsetY: 20,
    fontWeight: 500,
    labels: {
      useSeriesColors: false
    },
    markers: {
      size: 4
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
  },
  grid: {
    strokeDashArray: 4,
    xaxis: {
      lines: {
        show: true
      }
    },
    yaxis: {
      lines: {
        show: true
      }
    }
  }
};

// ==============================|| MEMBERSHIP - DASHBOARD - REVENUE ANALYTICS CHART ||============================== //

export default function RevenueAnalyticsChart() {
  const theme = useTheme();

  const mode = theme.palette.mode;
  const { primary, secondary } = theme.palette.text;
  const line = theme.palette.divider;

  const [options, setOptions] = useState<ChartProps>(areaChartOptions);

  useEffect(() => {
    setOptions((prevState) => ({
      ...prevState,
      colors: [theme.palette.primary.main, theme.palette.warning.main],
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
          },
          formatter: function (value: number) {
            return `$${value}K`;
          }
        }
      },
      grid: {
        borderColor: line
      },
      theme: { mode: mode === ThemeMode.DARK ? 'dark' : 'light' }
    }));
  }, [mode, primary, secondary, line, theme]);

  const [series] = useState([
    {
      name: 'Revenue',
      data: [4, 2.5, 8, 3.6, 4.4, 1.8, 11, 9.7, 12, 8.5, 11.5, 6]
    },
    {
      name: 'Earning',
      data: [1, 3.5, 3.7, 4.5, 5.4, 4.7, 5.2, 6.5, 5.8, 6.2, 6.7, 8.2]
    }
  ]);

  return <ReactApexChart options={options} series={series} type="area" height={370} />;
}
