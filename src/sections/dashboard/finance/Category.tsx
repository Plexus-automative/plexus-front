'use client';

import { useState, useEffect, MouseEvent } from 'react';

// next
import dynamic from 'next/dynamic';

// material-ui
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import ListItemButton from '@mui/material/ListItemButton';
import Menu from '@mui/material/Menu';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// third-party
import { Props as ChartProps } from 'react-apexcharts';

// project-imports
import IconButton from 'components/@extended/IconButton';
import MoreIcon from 'components/@extended/MoreIcon';
import MainCard from 'components/MainCard';
import { ThemeMode } from 'config';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

// chart options
const pieChartOptions = {
  chart: {
    id: 'category-donut-chart',
    type: 'donut',
    height: 340
  },
  labels: ['Saving', 'Spend', 'Income'],
  legend: {
    show: true
  },
  dataLabels: {
    enabled: false
  }
};

// ===========================|| CATEGORY - CHART ||=========================== //

function CategoryChart() {
  const theme = useTheme();
  const downSM = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  const mode = theme.palette.mode;

  const { primary } = theme.palette.text;
  const line = theme.palette.divider;
  const grey200 = theme.palette.secondary[200];
  const backColor = theme.palette.background.paper;

  const [series] = useState([90, 180, 90]);
  const [options, setOptions] = useState<ChartProps>(pieChartOptions);

  useEffect(() => {
    const warning = theme.palette.warning.main;
    const primary = theme.palette.primary.main;
    const success = theme.palette.success.main;

    setOptions((prevState) => ({
      ...prevState,
      colors: [warning, primary, success],
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
      },
      legend: {
        position: 'bottom',
        itemMargin: {
          horizontal: 6,
          vertical: 0
        }
      }
    }));
  }, [mode, primary, line, grey200, backColor, theme]);

  return (
    <Box sx={{ '.apexcharts-active': { color: 'common.white' } }}>
      <ReactApexChart options={options} series={series} type="donut" height={downSM ? 280 : 330} />
    </Box>
  );
}

// ===========================|| FINANCE - CATEGORY ||=========================== //

export default function CategoryCard() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <MainCard content={false} sx={{ p: 2.5 }}>
      <Stack sx={{ gap: 1 }}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h5">Category</Typography>
          <IconButton
            color="secondary"
            id="wallet-button"
            aria-controls={open ? 'wallet-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            onClick={handleClick}
            disableRipple
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
        <CategoryChart />
      </Stack>
    </MainCard>
  );
}
