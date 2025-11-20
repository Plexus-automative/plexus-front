import { useState, MouseEvent } from 'react';

// material-ui
import Button from '@mui/material/Button';
import CardMedia from '@mui/material/CardMedia';
import Grid from '@mui/material/Grid';
import Menu from '@mui/material/Menu';
import ListItemButton from '@mui/material/ListItemButton';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project-imports
import IconButton from 'components/@extended/IconButton';
import MoreIcon from 'components/@extended/MoreIcon';
import MainCard from 'components/MainCard';

// assets
import { Add } from '@wandersonalwes/iconsax-react';
const Food = '/assets/images/finance/food.png';
const Travel = '/assets/images/finance/travel.png';
const Shopping = '/assets/images/finance/shopping.png';
const Healthcare = '/assets/images/finance/health.png';

interface cardProps {
  name: string;
  img: string;
  percentage: number;
  money: number;
}

const cards = [
  { name: 'Food & Drink', img: Food, percentage: 65, money: 1000 },
  { name: 'Travel', img: Travel, percentage: 30, money: 400 },
  { name: 'Shopping', img: Shopping, percentage: 52, money: 900 },
  { name: 'Healthcare', img: Healthcare, percentage: 25, money: 250 }
];

// ===========================|| MONEY SPENT - CARD ||=========================== //

function SpentCard({ name, img, percentage, money }: cardProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <MainCard content={false} sx={{ p: 1.5 }}>
      <Stack sx={{ gap: 1.25 }}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <CardMedia component="img" src={img} alt={name} sx={{ width: '30px', height: '30px' }} />
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
        <Typography variant="subtitle1">{name}</Typography>
        <MainCard content={false} sx={{ bgcolor: 'secondary.lighter', p: 1.5 }}>
          <Stack sx={{ gap: 1 }}>
            <LinearProgress variant="determinate" value={percentage} color="secondary" />
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="body2">{percentage}%</Typography>
              <Typography variant="subtitle2">${money}</Typography>
            </Stack>
          </Stack>
        </MainCard>
      </Stack>
    </MainCard>
  );
}

// ===========================|| FINANCE - MONEY SPENT ||=========================== //

export default function MoneySpentCard() {
  return (
    <MainCard>
      <Stack sx={{ gap: 2.5 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          sx={{ gap: 1, alignItems: { xs: 'start', sm: 'center' }, justifyContent: 'space-between' }}
        >
          <Typography variant="h5">Where your money go ?</Typography>
          <Button color="primary" size="small" startIcon={<Add />} variant="contained">
            Add Item
          </Button>
        </Stack>
        <Grid container spacing={1.5}>
          {cards.map((card, index) => (
            <Grid key={index} size={{ xs: 12, sm: 6, lg: 3 }}>
              <SpentCard {...card} />
            </Grid>
          ))}
        </Grid>
      </Stack>
    </MainCard>
  );
}
