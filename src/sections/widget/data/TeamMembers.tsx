'use client';

import { useState, MouseEvent } from 'react';

// material-ui
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project-imports
import Avatar from 'components/@extended/Avatar';
import IconButton from 'components/@extended/IconButton';
import MoreIcon from 'components/@extended/MoreIcon';
import MainCard from 'components/MainCard';

// assets
const Avatar1 = '/assets/images/users/avatar-1.png';
const Avatar2 = '/assets/images/users/avatar-2.png';
const Avatar3 = '/assets/images/users/avatar-3.png';
const Avatar4 = '/assets/images/users/avatar-4.png';

// ===========================|| DATA WIDGET - TEAM MEMBERS ||=========================== //

export default function TeamMembers() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <MainCard content={false}>
      <Box sx={{ p: 3, pb: 0 }}>
        <Stack direction="row" sx={{ gap: 1, alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h5">Team Members</Typography>
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
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right'
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right'
            }}
          >
            <ListItemButton onClick={handleClose}>Today</ListItemButton>
            <ListItemButton onClick={handleClose}>Weekly</ListItemButton>
            <ListItemButton onClick={handleClose}>Monthly</ListItemButton>
          </Menu>
        </Stack>
      </Box>
      <List disablePadding sx={{ '& .MuiListItem-root': { px: 3, py: 1.5 } }}>
        <ListItem divider secondaryAction={<Typography sx={{ color: 'text.secondary' }}>5 min ago</Typography>}>
          <ListItemAvatar sx={{ mr: 1 }}>
            <Avatar alt="User 1" src={Avatar1} variant="rounded" size="lg" />
          </ListItemAvatar>
          <ListItemText
            primary={<Typography variant="subtitle1">David Jones</Typography>}
            secondary={<Typography sx={{ mt: 0.25 }}>Project Leader</Typography>}
          />
        </ListItem>
        <ListItem divider secondaryAction={<Typography sx={{ color: 'text.secondary' }}>1 hour ago</Typography>}>
          <ListItemAvatar sx={{ mr: 1 }}>
            <Avatar alt="User 2" src={Avatar2} variant="rounded" size="lg" />
          </ListItemAvatar>
          <ListItemText
            primary={<Typography variant="subtitle1">David Jones</Typography>}
            secondary={<Typography sx={{ mt: 0.25 }}>HR Manager</Typography>}
          />
        </ListItem>
        <ListItem divider secondaryAction={<Typography sx={{ color: 'text.secondary' }}>Yesterday</Typography>}>
          <ListItemAvatar sx={{ mr: 1 }}>
            <Avatar alt="User 3" src={Avatar3} variant="rounded" size="lg" />
          </ListItemAvatar>
          <ListItemText
            primary={<Typography variant="subtitle1">David Jones</Typography>}
            secondary={<Typography sx={{ mt: 0.25 }}>Developer</Typography>}
          />
        </ListItem>
        <ListItem secondaryAction={<Typography sx={{ color: 'text.secondary' }}>02-05-2022</Typography>}>
          <ListItemAvatar sx={{ mr: 1 }}>
            <Avatar alt="User 4" src={Avatar4} variant="rounded" size="lg" />
          </ListItemAvatar>
          <ListItemText
            primary={<Typography variant="subtitle1">David Jones</Typography>}
            secondary={<Typography sx={{ mt: 0.25 }}>UI/UX Designer</Typography>}
          />
        </ListItem>
      </List>
    </MainCard>
  );
}
