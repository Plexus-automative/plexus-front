'use client';

import { useState, MouseEvent } from 'react';

// material-ui
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import Typography from '@mui/material/Typography';

// project-imports
import Avatar from 'components/@extended/Avatar';
import MoreIcon from 'components/@extended/MoreIcon';
import MainCard from 'components/MainCard';
import { notificationsData } from 'data/membership';

// ==========================|| MEMBERSHIP - DASHBOARD - NOTIFICATIONS ||========================== //

export default function Notifications() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <MainCard
      title="Notifications"
      secondary={
        <>
          <IconButton
            color="secondary"
            id="notification-button"
            aria-controls={open ? 'notification-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            onClick={handleClick}
          >
            <MoreIcon />
          </IconButton>
          <Menu
            id="notification-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            slotProps={{ list: { 'aria-labelledby': 'notification-button', sx: { p: 1.25, minWidth: 150 } } }}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <ListItemButton onClick={handleClose}>Today</ListItemButton>
            <ListItemButton onClick={handleClose}>Weekly</ListItemButton>
            <ListItemButton onClick={handleClose}>Monthly</ListItemButton>
          </Menu>
        </>
      }
      content={false}
    >
      <List disablePadding component="nav" sx={{ px: 1.25, pb: 1.25 }} aria-label="main mailbox folders">
        {notificationsData.map((notification, index) => (
          <ListItem
            key={index}
            divider={index !== notificationsData.length - 1}
            sx={{ px: 1, py: 1.5, '& .MuiListItemSecondaryAction-root': { right: 8 } }}
            secondaryAction={
              <Typography sx={{ color: 'secondary.500' }} variant="caption">
                {notification.timeStamp}
              </Typography>
            }
          >
            <ListItemAvatar sx={{ minWidth: 'inherit', pr: 1 }}>
              <Avatar size="md" sx={{ border: 2, borderColor: 'divider' }} src={notification.avatar} />
            </ListItemAvatar>
            <ListItemText
              primary={
                <Typography
                  sx={{
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    maxWidth: 'calc(100% - 120px)',
                    overflow: 'hidden',
                    fontWeight: 500
                  }}
                  variant="body1"
                >
                  {notification.text}
                </Typography>
              }
            />
          </ListItem>
        ))}
      </List>
    </MainCard>
  );
}
