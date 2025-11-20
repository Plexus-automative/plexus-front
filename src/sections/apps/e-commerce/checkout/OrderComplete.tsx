// next
import Link from 'next/link';

// material-ui
import useMediaQuery from '@mui/material/useMediaQuery';
import Button from '@mui/material/Button';
import CardMedia from '@mui/material/CardMedia';
import Dialog from '@mui/material/Dialog';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// third-party
import { Chance } from 'chance';

// project-imports
import { PopupTransition } from 'components/@extended/Transitions';
import MainCard from 'components/MainCard';

// assets
const completed = '/assets/images/e-commerce/completed.png';

const chance = new Chance();

// ==============================|| CHECKOUT - ORDER COMPLETE ||============================== //

export default function OrderComplete({ open }: { open: boolean }) {
  const downMD = useMediaQuery((theme) => theme.breakpoints.down('md'));

  return (
    <Dialog
      open={open}
      fullScreen
      slots={{ transition: PopupTransition }}
      slotProps={{ paper: { sx: { bgcolor: 'background.paper', backgroundImage: 'none' } } }}
    >
      <Grid container sx={{ justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Grid>
          <MainCard border={false}>
            <Stack sx={{ gap: 2, alignItems: 'center' }}>
              <Box sx={{ position: 'relative', width: { xs: 320, sm: 500 } }}>
                <CardMedia component="img" src={completed} alt="Order Complete" />
              </Box>
              <Typography variant={downMD ? 'h3' : 'h1'} align="center">
                Thank you for Purchase!
              </Typography>
              <Box sx={{ px: 2.5 }}>
                <Typography align="center" sx={{ color: 'text.secondary' }}>
                  We will send a process notification, before it delivered.
                </Typography>
                <Typography align="center" sx={{ color: 'text.secondary' }}>
                  Your order id:{' '}
                  <Typography variant="subtitle1" component="span" color="primary">
                    {chance.guid()}
                  </Typography>
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ py: { xs: 1, sm: 3 } }}>
                (219) 404-5468
              </Typography>
              <Stack direction="row" sx={{ gap: 3, justifyContent: 'center' }}>
                <Button
                  component={Link}
                  href="/apps/e-commerce/products"
                  variant="outlined"
                  color="secondary"
                  size={downMD ? 'small' : 'medium'}
                >
                  Continue Shopping
                </Button>
                <Button
                  component={Link}
                  href="/apps/e-commerce/products"
                  variant="contained"
                  color="primary"
                  size={downMD ? 'small' : 'medium'}
                >
                  Download Invoice
                </Button>
              </Stack>
            </Stack>
          </MainCard>
        </Grid>
      </Grid>
    </Dialog>
  );
}
