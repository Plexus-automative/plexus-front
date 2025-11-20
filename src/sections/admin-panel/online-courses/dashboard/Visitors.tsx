'use client';

import { useState, MouseEvent } from 'react';

// material-ui
import ListItemButton from '@mui/material/ListItemButton';
import Menu from '@mui/material/Menu';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project-imports
import VisitorChart from './charts/VisitorChart';
import MainCard from 'components/MainCard';
import IconButton from 'components/@extended/IconButton';
import MoreIcon from 'components/@extended/MoreIcon';

const chartDataOptions: Record<string, { name: string; data: number[] }[]> = {
  Weekly: [{ name: 'Visitors', data: [200, 250, 220, 260, 270, 300] }],
  Monthly: [{ name: 'Visitors', data: [70, 80, 75, 90, 85, 100] }],
  Yearly: [{ name: 'Visitors', data: [350, 700, 450, 600, 800, 550] }]
};

// ==============================|| DASHBOARD - VISITOR ||============================== //

export default function VisitorsCard() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('Yearly');

  const open = Boolean(anchorEl);

  const handleMenuClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (period: string) => {
    setSelectedPeriod(period);
    setAnchorEl(null);
  };

  return (
    <MainCard content={false} sx={{ p: 2.5 }}>
      <Stack sx={{ gap: 1 }}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h5">Visitors</Typography>
          <IconButton
            color="secondary"
            id="more-button"
            aria-controls={open ? 'more-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            onClick={handleMenuClick}
          >
            <MoreIcon />
          </IconButton>
          <Menu
            id="more-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={() => setAnchorEl(null)}
            slotProps={{ list: { 'aria-labelledby': 'more-button', sx: { p: 1.25, minWidth: 150 } } }}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            {Object.keys(chartDataOptions).map((key) => (
              <ListItemButton key={key} onClick={() => handleMenuClose(key)}>
                {key}
              </ListItemButton>
            ))}
          </Menu>
        </Stack>
        <VisitorChart data={chartDataOptions[selectedPeriod]} />
      </Stack>
    </MainCard>
  );
}
