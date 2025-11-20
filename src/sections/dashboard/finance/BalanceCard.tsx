import { useState, MouseEvent } from 'react';

// material-ui
import { Theme } from '@mui/material/styles';
import CardMedia from '@mui/material/CardMedia';
import ListItemButton from '@mui/material/ListItemButton';
import Menu from '@mui/material/Menu';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project-imports
import IconButton from 'components/@extended/IconButton';
import MoreIcon from 'components/@extended/MoreIcon';
import MainCard from 'components/MainCard';

// assets
const cardBack = '/assets/images/widget/img-card-bg.svg';
const cardDots = '/assets/images/finance/dot-img.svg';

// ===========================|| FINANCE - BALANCE CARD ||=========================== //

export default function BalanceCard() {
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
      <Stack sx={{ gap: 2.5 }}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h5">My Card</Typography>
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
        <Stack direction="row" sx={{ justifyContent: 'center', width: 1 }}>
          <MainCard
            sx={(theme: Theme) => ({
              color: 'background.paper',
              maxWidth: 348,
              width: 1,
              boxShadow: theme.customShadows.secondaryButton,
              ...theme.applyStyles('dark', { color: 'text.primary', boxShadow: theme.customShadows.z1 }),
              '.MuiCardContent-root': { position: 'relative', zIndex: 1 },
              '&:after': {
                content: '""',
                height: 1,
                background: `url("${cardBack}") 100% / cover no-repeat`,
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0
              }
            })}
          >
            <Stack sx={{ gap: { xs: 2, md: 3 } }}>
              <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                <Stack sx={{ gap: 0.25 }}>
                  <Typography variant="body2" sx={{ color: 'grey.600' }}>
                    CARD NAME
                  </Typography>
                  <Typography variant="h5">Jonh Smith</Typography>
                </Stack>
                <CardMedia component="img" src={cardDots} alt="CardDots" sx={{ width: 30, height: 18 }} />
              </Stack>
              <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
                <Typography variant="h6" sx={{ mt: 0.5 }}>
                  **** **** ****
                </Typography>
                <Typography variant="h6">8361</Typography>
              </Stack>
              <Stack direction="row" sx={{ alignItems: 'center', gap: 3 }}>
                <Stack sx={{ gap: 0.25 }}>
                  <Typography variant="body2" sx={{ color: 'grey.600' }}>
                    EXP
                  </Typography>
                  <Typography variant="h6">7/30</Typography>
                </Stack>
                <Stack sx={{ gap: 0.25 }}>
                  <Typography variant="body2" sx={{ color: 'grey.600' }}>
                    CVV
                  </Typography>
                  <Typography variant="h6">455</Typography>
                </Stack>
              </Stack>
            </Stack>
          </MainCard>
        </Stack>
        <Stack sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 0.25 }}>
          <Typography variant="h3">$1.480.000</Typography>
          <Typography variant="h6" sx={{ color: 'text.secondary' }}>
            Total Balance
          </Typography>
        </Stack>
      </Stack>
    </MainCard>
  );
}
