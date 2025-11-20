'use client';

import { MouseEvent, useState } from 'react';

// material-ui
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

// project-imports
import MainCard from 'components/MainCard';
import Avatar from 'components/@extended/Avatar';
import IconButton from 'components/@extended/IconButton';
import MoreIcon from 'components/@extended/MoreIcon';

// assets
const avatar1 = '/assets/images/online-panel/avatar-1.jpg';
const avatar2 = '/assets/images/online-panel/avatar-2.jpg';
const avatar3 = '/assets/images/online-panel/avatar-3.jpg';
const avatar4 = '/assets/images/online-panel/avatar-4.jpg';

const data = [
  { content: 'Report Successfully', avatar: avatar1, time: 'Today | 9:00 AM' },
  { content: 'Reminder: Test time', avatar: avatar2, time: 'Yesterday | 6:30 PM' },
  { content: 'Send course pdf', avatar: avatar3, time: '05 Feb | 3:45 PM' },
  { content: 'Report Successfully', avatar: avatar4, time: '05 Feb | 4:00 PM' }
];

// ==============================|| DASHBOARD - NOTIFICATIONS ||============================== //

export default function NotificationCard() {
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
      <Stack direction="row" sx={{ gap: 1, alignItems: 'center', justifyContent: 'space-between', p: 2.5, pb: 1.5 }}>
        <Typography variant="h5">Notifications</Typography>
        <IconButton
          color="secondary"
          id="notification-more-button"
          aria-controls={open ? 'notification-more-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          onClick={handleClick}
        >
          <MoreIcon />
        </IconButton>
        <Menu
          id="notification-more-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          slotProps={{ list: { 'aria-labelledby': 'notification-more-button', sx: { p: 1.25, minWidth: 150 } } }}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <ListItemButton onClick={handleClose}>Today</ListItemButton>
          <ListItemButton onClick={handleClose}>View all</ListItemButton>
        </Menu>
      </Stack>
      <List disablePadding sx={{ '& .MuiListItem-root': { px: 2.5, py: 1 } }}>
        {data.map((value, index) => (
          <ListItem key={index}>
            <ListItemAvatar sx={{ minWidth: 40 }}>
              <Avatar alt="Avatar 1" src={value.avatar} sx={{ background: 'none' }} />
            </ListItemAvatar>
            <ListItemText
              sx={{ mx: 1.25 }}
              primary={
                <Stack>
                  <Typography color="inherit" sx={{ fontWeight: 600 }}>
                    {value.content}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {value.time}
                  </Typography>
                </Stack>
              }
            />
          </ListItem>
        ))}
      </List>
    </MainCard>
  );
}
