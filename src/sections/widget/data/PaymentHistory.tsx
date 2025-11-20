'use client';

import { useState, MouseEvent } from 'react';

// material-ui
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
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
import { Add } from '@wandersonalwes/iconsax-react';

const paypal = '/assets/images/widget/img-paypal.png';
const gpay = '/assets/images/widget/img-gpay.png';
const phonePay = '/assets/images/widget/img-phonepay.png';

// ==============================|| DATA WIDGET - PAYMENT HISTORY ||============================== //

export default function PaymentHistory() {
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
      <Box sx={{ p: 3, pb: 1 }}>
        <Stack direction="row" sx={{ gap: 1, alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h5">Payment History</Typography>
          <IconButton color="secondary" sx={{ color: 'secondary.darker' }}>
            <Add />
          </IconButton>
        </Stack>
      </Box>
      <List disablePadding sx={{ '& .MuiListItem-root': { px: 3, py: 1.5 } }}>
        <ListItem
          divider
          secondaryAction={
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
          }
        >
          <ListItemAvatar>
            <Avatar variant="rounded" color="secondary">
              <CardMedia component="img" alt="Paypal" src={paypal} sx={{ width: 24 }} />
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary="Paypal"
            secondary={
              <Typography variant="subtitle1">
                +2,10,000{' '}
                <Typography variant="caption" sx={{ color: 'success.main' }}>
                  +30.6%
                </Typography>
              </Typography>
            }
          />
        </ListItem>
        <ListItem
          divider
          secondaryAction={
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
          }
        >
          <ListItemAvatar>
            <Avatar variant="rounded" color="secondary">
              <CardMedia component="img" alt="Gpay" src={gpay} sx={{ width: 24 }} />
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary="Gpay"
            secondary={
              <Typography variant="subtitle1">
                -2000{' '}
                <Typography variant="caption" sx={{ color: 'error.dark' }}>
                  - 30.6%
                </Typography>
              </Typography>
            }
          />
        </ListItem>
        <ListItem
          divider
          secondaryAction={
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
          }
        >
          <ListItemAvatar>
            <Avatar variant="rounded" color="secondary">
              <CardMedia component="img" alt="phone-pay" src={phonePay} sx={{ width: 24 }} />
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary="Phone Pay"
            secondary={
              <Typography variant="subtitle1">
                -2000{' '}
                <Typography variant="caption" sx={{ color: 'error.dark' }}>
                  - 30.6%
                </Typography>
              </Typography>
            }
          />
        </ListItem>
      </List>
      <Stack direction="row" sx={{ gap: 1.25, alignItems: 'center', p: 3 }}>
        <Button variant="outlined" fullWidth color="secondary">
          View all
        </Button>
      </Stack>
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
        <ListItemButton onClick={handleClose}>Name</ListItemButton>
        <ListItemButton onClick={handleClose}>Date</ListItemButton>
        <ListItemButton onClick={handleClose}>Rating</ListItemButton>
        <ListItemButton onClick={handleClose}>Unread</ListItemButton>
      </Menu>
    </MainCard>
  );
}
