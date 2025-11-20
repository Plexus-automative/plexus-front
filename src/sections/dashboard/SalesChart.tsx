'use client';

import { useEffect, useState, ChangeEvent } from 'react';

// next
import dynamic from 'next/dynamic';

// material-ui
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// third-party
import { Props as ChartProps } from 'react-apexcharts';

// project-imports
import MainCard from 'components/MainCard';
import { ThemeMode } from 'config';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

// chart options
const columnChartOptions = {
  chart: {
    type: 'bar',
    height: 430,
    toolbar: {
      show: false
    }
  },
  plotOptions: {
    bar: {
      columnWidth: '30%',
      borderRadius: 4
    }
  },
  dataLabels: {
    enabled: false
  },
  stroke: {
    show: true,
    width: 8,
    colors: ['transparent']
  },
  xaxis: {
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
  },
  yaxis: {
    title: {
      text: '$ (thousands)'
    }
  },
  fill: {
    opacity: 1
  },
  tooltip: {
    y: {
      formatter(val: number) {
        return `$ ${val} thousands`;
      }
    }
  },
  legend: {
    show: false
  }
};

const initialSeries = [
  {
    name: 'Income',
    data: [180, 90, 135, 114, 120, 145]
  },
  {
    name: 'Cost Of Sales',
    data: [120, 45, 78, 150, 168, 99]
  }
];

// ==============================|| DASHBOARD - SALES COLUMN CHART ||============================== //

export default function SalesChart() {
  const theme = useTheme();

  const [age, setAge] = useState('30');
  const handleChange = (event: SelectChangeEvent) => {
    setAge(event.target.value as string);
  };

  const [legend, setLegend] = useState({
    income: true,
    cos: true
  });

  const { income, cos } = legend;

  const mode = theme.palette.mode;
  const { primary, secondary } = theme.palette.text;
  const line = theme.palette.divider;

  const warning = theme.palette.warning.main;
  const primaryMain = theme.palette.primary.main;
  const successDark = theme.palette.success.dark;

  const [series, setSeries] = useState(initialSeries);

  const handleLegendChange = (event: ChangeEvent<HTMLInputElement>) => {
    setLegend({ ...legend, [event.target.name]: event.target.checked });
  };

  const downSM = useMediaQuery(theme.breakpoints.down('sm'));
  const [options, setOptions] = useState<ChartProps>(columnChartOptions);

  useEffect(() => {
    if (income && cos) {
      setSeries(initialSeries);
    } else if (income) {
      setSeries([
        {
          name: 'Income',
          data: [180, 90, 135, 114, 120, 145]
        }
      ]);
    } else if (cos) {
      setSeries([
        {
          name: 'Cost Of Sales',
          data: [120, 45, 78, 150, 168, 99]
        }
      ]);
    } else {
      setSeries([]);
    }
  }, [income, cos]);

  useEffect(() => {
    setOptions((prevState) => ({
      ...prevState,
      colors: !(income && cos) && cos ? [primaryMain] : [warning, primaryMain],
      xaxis: {
        labels: {
          style: { colors: secondary }
        }
      },
      yaxis: {
        labels: {
          style: { colors: secondary }
        }
      },
      grid: {
        borderColor: line
      },
      plotOptions: {
        bar: {
          columnWidth: downSM ? '60%' : '30%'
        }
      },
      theme: {
        mode: mode === ThemeMode.DARK ? 'dark' : 'light'
      }
    }));
  }, [mode, primary, secondary, line, warning, primaryMain, successDark, income, cos, downSM]);

  return (
    <MainCard>
      <Stack direction="row" sx={{ gap: 1, alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h5">Sales Report</Typography>
        <Box sx={{ minWidth: 120 }}>
          <FormControl fullWidth>
            <Select id="demo-simple-select" value={age} onChange={handleChange}>
              <MenuItem value={10}>Today</MenuItem>
              <MenuItem value={20}>Weekly</MenuItem>
              <MenuItem value={30}>Monthly</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Stack>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mt: 1.5 }}>
        <Stack>
          <Typography variant="h6" color="secondary">
            Net Profit
          </Typography>
          <Typography variant="h4">$1560</Typography>
        </Stack>
        <FormControl component="fieldset" sx={{ width: 136 }}>
          <FormGroup row>
            <FormControlLabel
              control={<Checkbox color="warning" checked={income} onChange={handleLegendChange} name="income" />}
              label="Income"
            />
            <FormControlLabel control={<Checkbox checked={cos} onChange={handleLegendChange} name="cos" />} label="Cost of Sales" />
          </FormGroup>
        </FormControl>
      </Stack>
      <div id="chart">
        <ReactApexChart options={options} series={series} type="bar" height={360} />
      </div>
    </MainCard>
  );
}
