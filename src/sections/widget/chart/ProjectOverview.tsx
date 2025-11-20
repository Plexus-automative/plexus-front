'use client';

import { useEffect, useState, MouseEvent } from 'react';

// next
import dynamic from 'next/dynamic';

// material-ui
import { useTheme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
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
import { ThemeMode, ThemeDirection } from 'config';

// assets
import { Add } from '@wandersonalwes/iconsax-react';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

// ==============================|| CHART ||============================== //

interface Props {
  color: string;
  data: number[];
}

function TaskStatusChart({ color, data }: Props) {
  const theme = useTheme();
  const mode = theme.palette.mode;

  // chart options
  const areaChartOptions = {
    chart: {
      id: 'new-stack-chart',
      type: 'area',
      stacked: true,
      sparkline: {
        enabled: true
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
        shadeIntensity: 1,
        type: 'vertical',
        inverseColors: false,
        opacityFrom: 0.5,
        opacityTo: 0
      }
    },
    stroke: { curve: 'smooth', width: 2 },
    grid: {
      show: false
    }
  };
  const { primary, secondary } = theme.palette.text;
  const line = theme.palette.divider;

  const [options, setOptions] = useState<ChartProps>(areaChartOptions);

  useEffect(() => {
    setOptions((prevState) => ({
      ...prevState,
      colors: [color],
      theme: {
        mode: mode === ThemeMode.DARK ? 'dark' : 'light'
      }
    }));
  }, [color, mode, primary, secondary, line, theme]);

  const [series] = useState([{ name: 'Orders', data }]);

  return <ReactApexChart options={options} series={series} type="area" height={60} />;
}

// ==============================|| CHART - PROJECT OVERVIEW ||============================== //

export default function ProjectOverview() {
  const theme = useTheme();
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
      <Stack direction="row" sx={{ gap: 1, alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h5">Project overview</Typography>
        <IconButton
          color="secondary"
          id="wallet-button"
          aria-controls={open ? 'wallet-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          onClick={handleClick}
          sx={{ transform: 'rotate(90deg)' }}
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
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Grid container spacing={1} sx={{ alignItems: 'flex-end' }}>
            <Grid size={6}>
              <Stack sx={{ gap: 0.25 }}>
                <Typography sx={{ color: 'text.secondary' }}>Total Tasks</Typography>
                <Typography variant="h5">34,686</Typography>
              </Stack>
            </Grid>
            <Grid size={6}>
              <Box sx={{ ...(theme.direction === ThemeDirection.RTL && { mr: 2 }) }}>
                <TaskStatusChart color={theme.palette.primary.main} data={[5, 25, 3, 10, 4, 50, 0]} />
              </Box>
            </Grid>
          </Grid>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Grid container spacing={1}>
            <Grid size={6}>
              <Stack sx={{ gap: 0.25 }}>
                <Typography sx={{ color: 'text.secondary' }}>Pending Tasks</Typography>
                <Typography variant="h5">36,786</Typography>
              </Stack>
            </Grid>
            <Grid size={6}>
              <Box sx={{ ...(theme.direction === ThemeDirection.RTL && { mr: 2 }) }}>
                <TaskStatusChart color={theme.palette.error.main} data={[0, 50, 4, 10, 3, 25, 5]} />
              </Box>
            </Grid>
          </Grid>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Button fullWidth variant="contained" startIcon={<Add />} size="large">
            Add project
          </Button>
        </Grid>
      </Grid>
    </MainCard>
  );
}
