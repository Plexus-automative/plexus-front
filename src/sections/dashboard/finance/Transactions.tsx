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
import SimpleBar from 'components/third-party/SimpleBar';

// assets
import { Airdrop, ArrowDown, ArrowSwapHorizontal, ArrowUp, Car, MusicFilter, SmartCar, VoiceCricle } from '@wandersonalwes/iconsax-react';

// ==============================|| FINANCE - TRANSACTIONS ||============================== //

export default function Transactions() {
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
          <Typography variant="h5">Transactions</Typography>
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
      <SimpleBar sx={{ height: { xs: 1, sm: 332, lg: 1 } }}>
        <List disablePadding sx={{ '& .MuiListItem-root': { px: 3, py: 1.5 } }}>
          <ListItem
            divider
            secondaryAction={
              <Stack sx={{ gap: 0.25, alignItems: 'flex-end' }}>
                <Typography variant="subtitle1">$210,000</Typography>
                <Typography sx={{ color: 'success.main', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <ArrowUp style={{ transform: 'rotate(45deg)' }} size={14} /> 30.6%
                </Typography>
              </Stack>
            }
          >
            <ListItemAvatar>
              <Avatar variant="rounded" type="outlined" color="secondary" sx={{ color: 'warning.darker', borderColor: 'secondary.light' }}>
                <VoiceCricle variant="Bold" />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={<Typography variant="subtitle1">headspace</Typography>}
              secondary={
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  02:30pm
                </Typography>
              }
            />
          </ListItem>
          <ListItem
            divider
            secondaryAction={
              <Stack sx={{ gap: 0.25, alignItems: 'flex-end' }}>
                <Typography variant="subtitle1">-10,000</Typography>
                <Typography sx={{ color: 'error.main', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <ArrowDown style={{ transform: 'rotate(45deg)' }} size={14} /> 30.6%
                </Typography>
              </Stack>
            }
          >
            <ListItemAvatar>
              <Avatar variant="rounded" type="outlined" color="secondary" sx={{ color: 'success.main', borderColor: 'secondary.light' }}>
                <MusicFilter variant="Bold" />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={<Typography variant="subtitle1">Spotify Music</Typography>}
              secondary={
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  04:30pm
                </Typography>
              }
            />
          </ListItem>
          <ListItem
            divider
            secondaryAction={
              <Stack sx={{ gap: 0.25, alignItems: 'flex-end' }}>
                <Typography variant="subtitle1">-26</Typography>
                <Typography sx={{ color: 'warning.main', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <ArrowSwapHorizontal size={14} /> 5%
                </Typography>
              </Stack>
            }
          >
            <ListItemAvatar>
              <Avatar variant="rounded">
                <Airdrop variant="Bold" />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={<Typography variant="subtitle1">Medium Platform</Typography>}
              secondary={
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  06:30 pm
                </Typography>
              }
            />
          </ListItem>
          <ListItem
            divider
            secondaryAction={
              <Stack sx={{ gap: 0.25, alignItems: 'flex-end' }}>
                <Typography variant="subtitle1">+2,10,000</Typography>
                <Typography sx={{ color: 'success.main', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <ArrowUp style={{ transform: 'rotate(45deg)' }} size={14} /> 10.6%
                </Typography>
              </Stack>
            }
          >
            <ListItemAvatar>
              <Avatar
                variant="rounded"
                type="outlined"
                color="secondary"
                sx={{ color: 'secondary.darker', borderColor: 'secondary.light' }}
              >
                <SmartCar variant="Bold" />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={<Typography variant="subtitle1">Uber</Typography>}
              secondary={
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  08:40 pm
                </Typography>
              }
            />
          </ListItem>
          <ListItem
            secondaryAction={
              <Stack sx={{ gap: 0.25, alignItems: 'flex-end' }}>
                <Typography variant="subtitle1">+2,10,000</Typography>
                <Typography sx={{ color: 'success.main', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <ArrowUp style={{ transform: 'rotate(45deg)' }} size={14} /> 30.6%
                </Typography>
              </Stack>
            }
          >
            <ListItemAvatar>
              <Avatar variant="rounded" color="warning">
                <Car variant="Bold" />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={<Typography variant="subtitle1">Ola Cabs</Typography>}
              secondary={
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  07:40 pm
                </Typography>
              }
            />
          </ListItem>
        </List>
      </SimpleBar>
    </MainCard>
  );
}
