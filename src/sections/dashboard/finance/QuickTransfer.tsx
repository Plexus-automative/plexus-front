import { useState, MouseEvent } from 'react';

// material-ui
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import Menu from '@mui/material/Menu';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project-imports
import Avatar from 'components/@extended/Avatar';
import IconButton from 'components/@extended/IconButton';
import MoreIcon from 'components/@extended/MoreIcon';
import MainCard from 'components/MainCard';

// assets
import { Add } from '@wandersonalwes/iconsax-react';
const Avatar1 = '/assets/images/users/avatar-1.png';
const Avatar2 = '/assets/images/users/avatar-2.png';
const Avatar3 = '/assets/images/users/avatar-3.png';
const Avatar4 = '/assets/images/users/avatar-4.png';
const Avatar5 = '/assets/images/users/avatar-5.png';
const StarBucks = '/assets/images/finance/img-acitivity-3.svg';
const Liberty = '/assets/images/finance/liberty.svg';
const Croma = '/assets/images/finance/croma.svg';

const avatars = [Avatar1, Avatar2, Avatar3, Avatar4, Avatar5];

// table data
function createData(name: string, avatar: string, time: string, amount: number) {
  return { name, avatar, time, amount };
}

const rows = [
  createData('Starbucks Coffee', StarBucks, 'yesterday', 26),
  createData('Liberty Trading', Liberty, '10:40 AM', 150),
  createData('Croma', Croma, '05:41 PM', 55)
];

// ===========================|| FINANCE - QUICK TRANSFER ||=========================== //

export default function QuickTransferCard() {
  const downSM = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <MainCard content={false} sx={{ p: 2.5, pb: 2 }}>
      <Stack sx={{ gap: 3 }}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h5">Quick Transfer</Typography>
          <IconButton
            color="secondary"
            id="wallet-button"
            aria-controls={open ? 'wallet-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            onClick={handleClick}
            disableRipple
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
        <Stack direction="row" sx={{ gap: 0.5, alignItems: 'center', flexWrap: 'wrap' }}>
          <IconButton variant="outlined" shape="rounded" color="secondary" size={downSM ? 'small' : 'large'}>
            <Add />
          </IconButton>
          {avatars.map((src, index) => (
            <Avatar key={index} src={src} {...(downSM && { size: 'sm' })} />
          ))}
        </Stack>
        <Stack sx={{ gap: 1.5 }}>
          <Typography variant="h5">Recent Transfer</Typography>
          <List disablePadding sx={{ '& .MuiListItem-root': { py: 0.5, px: 0 } }}>
            {rows.map((row, index) => (
              <ListItem
                key={index} // always set a unique key when mapping
                secondaryAction={
                  <Typography variant="h5" color={row.amount > 100 ? 'success.main' : 'error.main'}>
                    {row.amount > 100 ? `+$${row.amount}.00` : `-$${Math.abs(row.amount)}.00`}
                  </Typography>
                }
              >
                <ListItemAvatar sx={{ minWidth: 56 }}>
                  <Avatar alt={row.name} src={row.avatar} color="secondary" />
                </ListItemAvatar>
                <ListItemText primary={row.name} secondary={row.time} />
              </ListItem>
            ))}
          </List>
        </Stack>
      </Stack>
    </MainCard>
  );
}
