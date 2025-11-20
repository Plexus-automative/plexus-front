'use client';

import { useEffect, useState } from 'react';

// next
import dynamic from 'next/dynamic';

// material-ui
import { useTheme, Theme, PaletteColor } from '@mui/material/styles';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// third-party
import { Props as ChartProps } from 'react-apexcharts';

// project-imports
import { ThemeMode } from 'config';
import MainCard from 'components/MainCard';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface Props {
  color: string;
  data: number[];
}

const getResolvedColor = (color: string, theme: any): string => {
  const [paletteKey, shade] = color.split('.');

  // Check if the palette key exists in theme.palette and has the shade
  if (
    paletteKey in theme.palette &&
    theme.palette[paletteKey as keyof typeof theme.palette] &&
    theme.palette[paletteKey as keyof typeof theme.palette][shade as keyof PaletteColor]
  ) {
    return theme.palette[paletteKey as keyof typeof theme.palette][shade as keyof PaletteColor];
  }

  // Fallback to a default color or return the input color if not found in the palette
  return color;
};

// ==============================|| CHART ||============================== //

function SupportCardChart({ color, data }: Props) {
  const theme = useTheme();
  const mode = theme.palette.mode;

  const resolvedColor = getResolvedColor(color, theme);

  // chart options
  const areaChartOptions: ChartProps = {
    chart: {
      id: 'new-stack-chart',
      type: 'area',
      stacked: true,
      sparkline: {
        enabled: true
      },
      offsetX: 0
    },
    plotOptions: {
      bar: {
        borderRadius: 0,
        barHeight: '100%'
      }
    },
    dataLabels: {
      enabled: false
    },
    markers: {
      hover: {
        size: 5
      }
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 0.7,
        type: 'vertical',
        inverseColors: false,
        opacityFrom: 0.7,
        opacityTo: 0.5
      }
    },
    stroke: {
      curve: 'smooth',
      width: 2
    },
    yaxis: {
      min: 0,
      max: Math.max(...data) * 1.1, // Adjusts max based on data for better area filling
      labels: {
        show: false
      },
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      }
    },
    xaxis: {
      labels: {
        show: false
      },
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      }
    },
    tooltip: {
      x: {
        show: false
      }
    },
    grid: {
      show: false
    }
  };

  const [options, setOptions] = useState<ChartProps>(areaChartOptions);

  useEffect(() => {
    setOptions((prevState) => ({
      ...prevState,
      colors: [resolvedColor],
      theme: {
        mode: mode === ThemeMode.DARK ? 'dark' : 'light'
      }
    }));
  }, [resolvedColor, mode, theme]);

  const [series] = useState([{ name: 'Orders', data }]);

  return <ReactApexChart options={options} series={series} type="area" height={100} />;
}

interface SupportCardProps {
  title: string;
  count: number;
  details: string;
  color?: any;
  openValue: number;
  runningValue: number;
  solvedValue: number;
  chartData: number[];
}

// ==============================|| SUPPORT CARD ||============================== //

export default function SupportCard({ title, count, details, color, openValue, runningValue, solvedValue, chartData }: SupportCardProps) {
  const textColor = (theme: Theme) => (theme.palette.mode === 'dark' ? 'text.primary' : 'background.paper');

  return (
    <MainCard content={false}>
      <Stack sx={{ px: 3, pt: 3 }}>
        <Typography variant="h2" sx={{ fontWeight: 700 }}>
          {count}
        </Typography>
        <Typography variant="body1" sx={{ color: color }}>
          {title}
        </Typography>
        <Typography variant="body1" sx={{ color: 'secondary.darker', my: 2 }}>
          {details}
        </Typography>
      </Stack>
      <SupportCardChart color={color} data={chartData} />
      <Stack direction="row" sx={{ justifyContent: 'space-around', p: 3, bgcolor: color }}>
        <Stack sx={{ alignItems: 'center' }}>
          <Typography variant="h4" sx={{ color: textColor }}>
            {openValue}
          </Typography>
          <Typography variant="body1" sx={{ color: textColor }}>
            Open
          </Typography>
        </Stack>
        <Divider flexItem orientation="vertical" sx={{ bgcolor: textColor }} />
        <Stack sx={{ alignItems: 'center' }}>
          <Typography variant="h4" sx={{ color: textColor }}>
            {runningValue}
          </Typography>
          <Typography variant="body1" sx={{ color: textColor }}>
            Running
          </Typography>
        </Stack>
        <Divider flexItem orientation="vertical" sx={{ bgcolor: textColor }} />
        <Stack sx={{ alignItems: 'center' }}>
          <Typography variant="h4" sx={{ color: textColor }}>
            {solvedValue}
          </Typography>
          <Typography variant="body1" sx={{ color: textColor }}>
            Solved
          </Typography>
        </Stack>
      </Stack>
    </MainCard>
  );
}
