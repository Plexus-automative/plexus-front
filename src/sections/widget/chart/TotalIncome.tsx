'use client';

import { useEffect, useState, MouseEvent } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Grid from '@mui/material/Grid';
import ListItemButton from '@mui/material/ListItemButton';
import Menu from '@mui/material/Menu';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// third-party
import ReactApexChart, { Props as ChartProps } from 'react-apexcharts';

// project-imports
import Dot from 'components/@extended/Dot';
import IconButton from 'components/@extended/IconButton';
import MoreIcon from 'components/@extended/MoreIcon';
import MainCard from 'components/MainCard';
import { GRID_COMMON_SPACING, ThemeMode } from 'config';

// assets
import { ArrowDown, ArrowUp } from '@wandersonalwes/iconsax-react';

// chart options
const pieChartOptions = {
  chart: {
    type: 'donut',
    height: 320
  },
  labels: ['Total income', 'Total rent', 'Download', 'Views'],
  legend: {
    show: false
  },
  dataLabels: {
    enabled: false
  }
};

// type is according to palette mode
type DotColor = 'primary' | 'error' | 'warning' | 'success' | 'info';

type IncomeProps = {
  id: string;
  label: string;
  value: number;
  change: number;
  dotColor?: DotColor;
  isProfit?: boolean;
};

const incomeCards: IncomeProps[] = [
  {
    id: 'item01',
    label: 'Total Income',
    value: 23876,
    change: 76343
  },
  {
    id: 'item02',
    label: 'Views',
    value: 23876,
    change: 76343,
    dotColor: 'error',
    isProfit: false
  },
  {
    id: 'item03',
    label: 'Total Rent',
    value: 23876,
    change: 76343,
    dotColor: 'warning'
  },
  {
    id: 'item04',
    label: 'Download',
    value: 23876,
    change: 76343,
    dotColor: 'success'
  }
];

// ==============================|| CHART ||============================== //

function ApexDonutChart() {
  const theme = useTheme();
  const downSM = useMediaQuery(theme.breakpoints.down('sm'));

  const mode = theme.palette.mode;

  const { primary } = theme.palette.text;
  const line = theme.palette.divider;
  const grey200 = theme.palette.secondary[200];
  const backColor = theme.palette.background.paper;

  const [series] = useState([31, 26, 23, 20]);
  const [options, setOptions] = useState<ChartProps>(pieChartOptions);

  useEffect(() => {
    const primaryMain = theme.palette.primary.main;
    const errorMain = theme.palette.error.main;
    const warning = theme.palette.warning.main;
    const success = theme.palette.success.main;

    setOptions((prevState) => ({
      ...prevState,
      colors: [primaryMain, warning, success, errorMain],
      xaxis: {
        labels: {
          style: { colors: primary }
        }
      },
      yaxis: {
        labels: {
          style: { colors: primary }
        }
      },
      grid: {
        borderColor: line
      },
      stroke: {
        colors: [backColor]
      },
      theme: {
        mode: mode === ThemeMode.DARK ? 'dark' : 'light'
      }
    }));
  }, [mode, primary, line, grey200, backColor, theme]);

  return (
    <div id="chart">
      <ReactApexChart options={options} series={series} type="donut" height={downSM ? 280 : 320} id="total-income-chart" />
    </div>
  );
}

// ==============================|| CHART WIDGETS - TOTAL INCOME ||============================== //

export default function TotalIncome() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <MainCard>
      <Grid container spacing={GRID_COMMON_SPACING}>
        <Grid size={12}>
          <Stack direction="row" sx={{ gap: 1, alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h5">Total Income</Typography>
            <IconButton
              color="secondary"
              id="wallet-button"
              aria-controls={open ? 'wallet-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
              onClick={handleClick}
            >
              <MoreIcon />
            </IconButton>
            <Menu
              id="wallet-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              slotProps={{ list: { 'aria-labelledby': 'wallet-button', sx: { p: 1.25, minWidth: 150 } } }}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <ListItemButton onClick={handleClose}>Today</ListItemButton>
              <ListItemButton onClick={handleClose}>Weekly</ListItemButton>
              <ListItemButton onClick={handleClose}>Monthly</ListItemButton>
            </Menu>
          </Stack>
        </Grid>
        <Grid size={12} sx={{ '.apexcharts-active': { color: 'common.white' } }}>
          <ApexDonutChart />
        </Grid>
        {incomeCards.map((item, index) => (
          <Grid size={{ xs: 12, sm: 6 }} key={index}>
            <MainCard content={false} border={false} sx={{ bgcolor: 'secondary.lighter', boxShadow: 'none' }}>
              <Stack sx={{ gap: 0.5, alignItems: 'flex-start', p: 2 }}>
                <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
                  <Dot componentDiv sx={{ bgcolor: `${item.dotColor}.main` || 'primary.main' }} />
                  <Typography>{item.label}</Typography>
                </Stack>

                <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  ${item.value}
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.25 }}
                  >
                    {item.isProfit !== false ? <ArrowUp size={14} /> : <ArrowDown size={14} />} +${item.change}
                  </Typography>
                </Typography>
              </Stack>
            </MainCard>
          </Grid>
        ))}
      </Grid>
    </MainCard>
  );
}
