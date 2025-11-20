'use client';

import { useState, useEffect } from 'react';

// next
import dynamic from 'next/dynamic';

// material-ui
import { alpha, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// third-party
import { Props as ChartProps } from 'react-apexcharts';

// project-imports
import MainCard from 'components/MainCard';
import { ThemeMode } from 'config';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

type ChartData = {
  name: string;
  data: number[];
};

// chart options
const areaChartOptions = {
  chart: {
    type: 'bar',
    toolbar: {
      show: false
    }
  },
  dataLabels: {
    enabled: false
  },
  stroke: {
    show: true,
    width: 3,
    colors: ['transparent']
  },
  fill: {
    opacity: [1, 0.4]
  },
  grid: {
    show: false
  },
  tooltip: {
    y: {
      formatter: (val: number) => '$' + val + ' thousands'
    }
  }
};

// ===========================|| CASHFLOW - CHART ||=========================== //

function CashflowChart({ data }: { data: ChartData[] }) {
  const theme = useTheme();
  const downSM = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  const mode = theme.palette.mode;

  const { primary, secondary } = theme.palette.text;
  const line = theme.palette.divider;

  const [options, setOptions] = useState<ChartProps>(areaChartOptions);

  useEffect(() => {
    setOptions((prevState) => ({
      ...prevState,
      colors: [theme.palette.primary.main, theme.palette.primary.light],
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: downSM ? '70%' : '40%',
          borderRadius: downSM ? 2 : 4
        }
      },
      xaxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
        labels: {
          style: { colors: secondary }
        },
        axisBorder: {
          show: false
        },
        axisTicks: {
          show: false
        }
      },
      yaxis: {
        labels: {
          style: { colors: secondary },
          formatter: (val: number) => '$' + val
        }
      },
      legend: {
        show: true,
        position: 'top',
        horizontalAlign: 'right',
        markers: {
          fillColors: [theme.palette.primary.main, alpha(theme.palette.primary.light, 0.4)]
        }
      },
      theme: {
        mode: mode === ThemeMode.DARK ? 'dark' : 'light'
      }
    }));
  }, [mode, primary, secondary, line, theme, downSM]);

  const [series, setSeries] = useState(data);

  useEffect(() => {
    setSeries(data);
  }, [data]);

  return <ReactApexChart options={options} series={series} type="bar" height={286} />;
}

// ===========================|| FINANCE - CASHFLOW CHART CARD ||=========================== //

export default function CashflowChartCard() {
  const [value, setValue] = useState('10');

  // Define data sets for different time ranges
  const dataToday = [
    { name: 'Income', data: [48, 35, 20, 42, 55, 60, 45, 32] },
    { name: 'Expends', data: [78, 62, 45, 18, 72, 92, 68, 50] }
  ];
  const dataWeekly = [
    { name: 'Income', data: [76, 85, 95, 98, 87, 94, 91, 40] },
    { name: 'Expends', data: [44, 55, 57, 56, 61, 58, 63, 60] }
  ];
  const dataMonthly = [
    { name: 'Income', data: [59, 78, 35, 61, 19, 80, 39, 44] },
    { name: 'Expends', data: [95, 73, 25, 20, 84, 38, 90, 98] }
  ];

  const getChartData = () => {
    switch (value) {
      case '10':
        return dataToday;
      case '20':
        return dataWeekly;
      case '30':
      default:
        return dataMonthly;
    }
  };

  const handleChangeSelect = (event: SelectChangeEvent) => {
    setValue(event.target.value);
  };

  return (
    <MainCard sx={{ '& .MuiCardContent-root:last-child': { pb: 1 } }}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <div>
          <Typography variant="h5">Cashflow</Typography>
          <Stack direction="row" sx={{ alignItems: 'center', gap: 1.25 }}>
            <Typography variant="h5">5.44%</Typography>
            <Chip color="success" label="+2.6%" size="small" />
          </Stack>
        </div>
        <Box sx={{ minWidth: 120 }}>
          <FormControl fullWidth>
            <Select id="demo-simple-select" value={value} onChange={handleChangeSelect}>
              <MenuItem value={'10'}>Today</MenuItem>
              <MenuItem value={'20'}>Weekly</MenuItem>
              <MenuItem value={'30'}>Monthly</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Stack>
      <CashflowChart data={getChartData()} />
    </MainCard>
  );
}
