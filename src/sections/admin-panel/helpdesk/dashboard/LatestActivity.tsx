'use client';

import { useState, MouseEvent } from 'react';

// material-ui
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import Menu from '@mui/material/Menu';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project-imports
import Avatar from 'components/@extended/Avatar';
import MoreIcon from 'components/@extended/MoreIcon';
import MainCard from 'components/MainCard';
import SimpleBarScroll from 'components/third-party/SimpleBar';
import { activityData } from 'data/helpdesk';

// types
import { ColorProps } from 'types/extended';

// ==========================|| DASHBOARD - LATEST ACTIVITY ||========================== //

export default function LatestActivity() {
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
      title="Latest Activity"
      secondary={
        <>
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
        </>
      }
      content={false}
    >
      <SimpleBarScroll sx={{ height: 400 }}>
        <CardContent>
          <List disablePadding component="nav" aria-label="main mailbox folders">
            {activityData.map((notification, index) => {
              const AvatarIcon = notification.avatar!;
              const avatarIcon = <AvatarIcon />;

              return (
                <ListItem
                  key={index}
                  sx={{ px: 0, pt: 0.5, pb: 0.5, mb: 3, '& .MuiListItemSecondaryAction-root': { right: 0 } }}
                  secondaryAction={
                    <Typography sx={{ fontWeight: 600, color: 'text.secondary' }} variant="caption">
                      {notification.timeStamp}
                    </Typography>
                  }
                >
                  <ListItemAvatar sx={{ minWidth: 'inherit', pr: 1.5 }}>
                    <Avatar size="sm" sx={{ svg: { height: 16, width: 16 } }} color={notification.color as ColorProps}>
                      {avatarIcon}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography
                        sx={{
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis',
                          maxWidth: 'calc(100% - 80px)',
                          overflow: 'hidden',
                          '&:hover': {
                            color: 'primary.main',
                            cursor: 'pointer'
                          }
                        }}
                        variant="h6"
                      >
                        {notification.text}
                      </Typography>
                    }
                  />
                </ListItem>
              );
            })}
          </List>
        </CardContent>
      </SimpleBarScroll>
      <Divider sx={{ mx: -3 }} />
      <Stack direction="row" sx={{ justifyContent: 'center', p: 3 }}>
        <Link href="#">View all Feeds</Link>
      </Stack>
    </MainCard>
  );
}
