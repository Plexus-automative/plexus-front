'use client';

import { useState, MouseEvent } from 'react';

// material-ui
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
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
import { ArrowDown2, ArrowUp2 } from '@wandersonalwes/iconsax-react';
const avatar = '/assets/images/users/avatar-6.png';

// ===========================|| STATISTICS - WALLET PROFILE ||=========================== //

export default function WalletProfile() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const [anchorElProfile, setAnchorElProfile] = useState<null | HTMLElement>(null);

  const openProfile = Boolean(anchorElProfile);

  const handleClickProfile = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorElProfile(event.currentTarget);
  };

  const handleCloseProfile = () => {
    setAnchorElProfile(null);
  };

  return (
    <MainCard>
      <Grid container spacing={2}>
        <Grid size={12}>
          <Stack direction="row" sx={{ gap: 1, alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h5">Add Fund</Typography>
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
        </Grid>
        <Grid size={12}>
          <Stack sx={{ alignItems: 'center' }}>
            <Typography>Amount</Typography>
            <Typography variant="h3">$100</Typography>
          </Stack>
        </Grid>
        <Grid size={12}>
          <Stack
            direction="row"
            sx={{
              gap: 1.25,
              alignItems: 'center',
              justifyContent: 'center',
              '& .MuiChip-root': { borderColor: 'divider', borderRadius: 1 }
            }}
          >
            <Chip color="primary" label="$100" variant="light" size="small" />
            <Chip label="$150" variant="outlined" size="small" />
            <Chip label="$200" variant="outlined" size="small" />
            <Chip label="$250" variant="outlined" size="small" />
          </Stack>
        </Grid>
        <Grid size={12}>
          <MainCard content={false}>
            <Box sx={{ p: 2 }}>
              <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                <Stack direction="row" sx={{ gap: 2, alignItems: 'center' }}>
                  <Avatar alt="Jone Doe" src={avatar} size="lg" />
                  <Stack>
                    <Typography variant="subtitle1">Able pro</Typography>
                    <Typography variant="caption">@ableprodevelop</Typography>
                  </Stack>
                </Stack>

                <IconButton
                  color="secondary"
                  id="profile-button"
                  aria-controls={openProfile ? 'profile-menu' : undefined}
                  aria-haspopup="true"
                  aria-expanded={openProfile ? 'true' : undefined}
                  onClick={handleClickProfile}
                >
                  {openProfile ? <ArrowDown2 /> : <ArrowUp2 />}
                </IconButton>
                <Menu
                  id="profile-menu"
                  anchorEl={anchorElProfile}
                  open={openProfile}
                  onClose={handleCloseProfile}
                  slotProps={{ list: { 'aria-labelledby': 'profile-button', sx: { p: 1.25, minWidth: 150 } } }}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                  <ListItemButton onClick={handleCloseProfile}>Active</ListItemButton>
                  <ListItemButton onClick={handleCloseProfile}>Disable</ListItemButton>
                  <ListItemButton onClick={handleCloseProfile}>Remove</ListItemButton>
                </Menu>
              </Stack>
            </Box>
          </MainCard>
        </Grid>
        <Grid size={12}>
          <Button fullWidth variant="contained">
            Confirm
          </Button>
        </Grid>
      </Grid>
    </MainCard>
  );
}
