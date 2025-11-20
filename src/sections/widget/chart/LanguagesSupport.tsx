'use client';

import { useEffect, useState, MouseEvent } from 'react';

// next
import dynamic from 'next/dynamic';

// material-ui
import { useTheme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import ListItemButton from '@mui/material/ListItemButton';
import Menu from '@mui/material/Menu';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// third-party
import { Props as ChartProps } from 'react-apexcharts';

// project-imports
import Avatar from 'components/@extended/Avatar';
import MoreIcon from 'components/@extended/MoreIcon';
import IconButton from 'components/@extended/IconButton';
import MainCard from 'components/MainCard';
import { ThemeMode } from 'config';

// assets
import { ArrowRight } from '@wandersonalwes/iconsax-react';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

// ==============================|| CHART ||============================== //

function DataChart() {
  const theme = useTheme();
  const mode = theme.palette.mode;

  // chart options
  const areaChartOptions = {
    chart: {
      id: 'new-users-chart',
      type: 'area',
      sparkline: { enabled: true }
    },
    stroke: {
      width: 1.5
    },
    plotOptions: { bar: { columnWidth: '80%' } },
    xaxis: { crosshairs: { width: 1 } },
    tooltip: {
      fixed: { enabled: false },
      x: { show: false },
      y: {
        title: {
          formatter: () => ''
        }
      }
    }
  };
  const { primary, secondary } = theme.palette.text;
  const line = theme.palette.divider;

  const [options, setOptions] = useState<ChartProps>(areaChartOptions);

  useEffect(() => {
    setOptions((prevState) => ({
      ...prevState,
      colors: [theme.palette.primary.main],
      theme: {
        mode: mode === ThemeMode.DARK ? 'dark' : 'light'
      }
    }));
  }, [mode, primary, secondary, line, theme]);

  const [series] = useState([
    {
      data: [100, 140, 100, 250, 115, 125, 90, 100, 140, 100, 230, 115, 215, 90, 190, 100, 120, 180]
    }
  ]);

  return <ReactApexChart options={options} series={series} type="area" height={130} />;
}

// ==============================|| CHART WIDGETS - LANGUAGE SUPPORT ||============================== //

export default function LanguagesSupport() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <MainCard sx={{ height: 1, '.MuiCardContent-root': { height: 1 } }}>
      <Grid container spacing={2} sx={{ height: 1 }}>
        <Grid size={12}>
          <Stack direction="row" sx={{ gap: 1, alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h5">Languages support</Typography>
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
              <ListItemButton onClick={handleClose}>Name</ListItemButton>
              <ListItemButton onClick={handleClose}>Date</ListItemButton>
              <ListItemButton onClick={handleClose}>Rating</ListItemButton>
              <ListItemButton onClick={handleClose}>Unread</ListItemButton>
            </Menu>
          </Stack>
        </Grid>
        <Grid size={12}>
          <Stack direction="row" sx={{ gap: 2, alignItems: 'center' }}>
            <Avatar size="sm" color="secondary" variant="rounded" sx={{ color: 'text.secondary' }}>
              <ArrowRight />
            </Avatar>
            <Typography variant="subtitle1">Update version</Typography>
            <Chip color="success" size="small" label="v1.1.0" sx={{ borderRadius: 1, bgcolor: 'success.main' }} />
          </Stack>
        </Grid>
        <Grid size={12}>
          <DataChart />
        </Grid>
        <Grid size={6}>
          <Button fullWidth variant="outlined" color="secondary">
            React
          </Button>
        </Grid>
        <Grid size={6}>
          <Button fullWidth variant="outlined" color="secondary">
            Angular
          </Button>
        </Grid>
        <Grid size={6}>
          <Button fullWidth variant="outlined" color="secondary">
            Bootstrap
          </Button>
        </Grid>
        <Grid size={6}>
          <Button fullWidth variant="outlined" color="secondary">
            MUI
          </Button>
        </Grid>
      </Grid>
    </MainCard>
  );
}
