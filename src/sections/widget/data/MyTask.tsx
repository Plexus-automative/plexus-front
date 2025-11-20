'use client';

import { useState, MouseEvent } from 'react';

// material-ui
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project-imports
import IconButton from 'components/@extended/IconButton';
import MoreIcon from 'components/@extended/MoreIcon';
import MainCard from 'components/MainCard';

// types
import { Folder, Send2, TickCircle } from '@wandersonalwes/iconsax-react';

// ===========================|| DATA WIDGET - MY TASK ||=========================== //

export default function MyTask() {
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
          <Typography variant="h5">My Task</Typography>
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
      </Box>
      <List sx={{ '& .MuiListItem-root': { pl: 3 } }}>
        <ListItem
          divider
          secondaryAction={
            <IconButton aria-label="delete" color="success">
              <TickCircle />
            </IconButton>
          }
        >
          <Stack>
            <ListItemText primary={<Typography variant="subtitle1">Follow up client for feedback</Typography>} />
            <Stack sx={{ gap: 0.5 }}>
              <Stack direction="row" sx={{ gap: 0.5, alignItems: 'center' }}>
                <Send2 size={12} />
                <Typography>Sending report</Typography>
              </Stack>
              <Box>
                <Chip label="00 : 15" color="error" variant="filled" size="small" />
              </Box>
            </Stack>
          </Stack>
        </ListItem>
        <ListItem
          divider
          secondaryAction={
            <IconButton aria-label="delete" color="secondary">
              <TickCircle />
            </IconButton>
          }
        >
          <Stack>
            <ListItemText primary={<Typography variant="subtitle1">Follow up client for feedback</Typography>} />
            <Stack sx={{ gap: 0.5 }}>
              <Stack direction="row" sx={{ gap: 0.5, alignItems: 'center' }}>
                <Folder size={12} />
                <Typography>Received report</Typography>
              </Stack>
              <Box>
                <Chip label="00 : 15" color="success" variant="filled" size="small" />
              </Box>
            </Stack>
          </Stack>
        </ListItem>
        <ListItem
          secondaryAction={
            <IconButton aria-label="delete" color="secondary">
              <TickCircle />
            </IconButton>
          }
        >
          <Stack>
            <ListItemText primary={<Typography variant="subtitle1">Follow up client for feedback</Typography>} />
            <Stack sx={{ gap: 0.5 }}>
              <Stack direction="row" sx={{ gap: 0.5, alignItems: 'center' }}>
                <Send2 size={12} />
                <Typography>Sending report</Typography>
              </Stack>
              <Box>
                <Chip label="00 : 15" color="error" variant="filled" size="small" />
              </Box>
            </Stack>
          </Stack>
        </ListItem>
      </List>
    </MainCard>
  );
}
