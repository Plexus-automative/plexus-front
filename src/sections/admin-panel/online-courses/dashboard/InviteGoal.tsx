import { useState, MouseEvent } from 'react';

// material-ui
import Chip from '@mui/material/Chip';
import ListItemButton from '@mui/material/ListItemButton';
import Menu from '@mui/material/Menu';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project-imports
import RadialBarChart from './charts/RadialChart';
import MainCard from 'components/MainCard';
import IconButton from 'components/@extended/IconButton';
import MoreIcon from 'components/@extended/MoreIcon';

// assets
import { ArrowDown, ArrowUp } from '@wandersonalwes/iconsax-react';

const data = [
  { name: 'Target', amount: 20 },
  { name: 'Revenue', amount: 9 },
  { name: 'Today', amount: 15 }
];

// ==============================|| DASHBOARD - INVITE GOAL ||============================== //

export default function InviteGoalCard() {
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
      <Stack sx={{ gap: 1.5 }}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h5">Invites goal</Typography>
          <IconButton
            color="secondary"
            id="menu-button"
            aria-controls={open ? 'menu-list' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            onClick={handleClick}
          >
            <MoreIcon />
          </IconButton>
          <Menu
            id="menu-list"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            slotProps={{ list: { 'aria-labelledby': 'menu-button', sx: { p: 1.25, minWidth: 150 } } }}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <ListItemButton onClick={handleClose}>Today</ListItemButton>
            <ListItemButton onClick={handleClose}>Weekly</ListItemButton>
            <ListItemButton onClick={handleClose}>Monthly</ListItemButton>
          </Menu>
        </Stack>
        <Stack>
          <Box sx={{ height: 170, overflow: 'hidden' }}>
            <RadialBarChart />
          </Box>

          <Stack sx={{ gap: 1.5, justifyContent: 'center', alignItems: 'center' }}>
            <Chip variant="light" color="success" label="+10%" size="small" />
            <Typography sx={{ color: 'text.secondary' }}>You succeed earn $240 today, its higher than yesterday</Typography>
            <Stack direction="row" sx={{ width: 1, alignContent: 'center', justifyContent: 'space-around' }}>
              {data.map((value, index) => (
                <Stack key={index} sx={{ gap: 0.5, alignContent: 'center' }}>
                  <Typography variant="subtitle2" align="center" sx={{ color: 'text.secondary' }}>
                    {value.name}
                  </Typography>
                  <Stack
                    direction="row"
                    sx={{
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 0.5,
                      '& .arrow-up': { color: 'success.main' },
                      '& .arrow-down': { color: 'error.main' }
                    }}
                  >
                    <Typography variant="h5">${value.amount}k</Typography>
                    {value.amount > 10 ? <ArrowUp size={20} className="arrow-up" /> : <ArrowDown size={20} className="arrow-down" />}
                  </Stack>
                </Stack>
              ))}
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    </MainCard>
  );
}
