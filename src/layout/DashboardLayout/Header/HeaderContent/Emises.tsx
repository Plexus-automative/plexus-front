import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axiosServices from 'utils/axios';

// material-ui
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import Badge from '@mui/material/Badge';
import IconButton from 'components/@extended/IconButton';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import CardContent from '@mui/material/CardContent';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Link from '@mui/material/Link';

// project imports
import MainCard from 'components/MainCard';
import Transitions from 'components/@extended/Transitions';
import SimpleBar from 'components/third-party/SimpleBar';
import Avatar from 'components/@extended/Avatar';

// icons
import { Box as BoxIcon } from '@wandersonalwes/iconsax-react'; // box icon for orders

// ==============================|| HEADER CONTENT - COMMANDES ÉMISES ||============================== //

export default function Emises() {
  const downMD = useMediaQuery((theme: any) => theme.breakpoints.down('md'));
  const router = useRouter();
  const anchorRef = useRef<any>(null);
  const [open, setOpen] = useState(false);

  const [ordersCount, setOrdersCount] = useState(0);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const response = await axiosServices.get('/api/purchase-orders/emises/non-traitee?skip=0&top=5');

        if (response.data && response.data['@odata.count'] !== undefined) {
          setOrdersCount(response.data['@odata.count']);
        }

        if (response.data && response.data.value) {
          setOrders(response.data.value);
          if (response.data['@odata.count'] === undefined) {
            setOrdersCount(response.data.value.length);
          }
        }
      } catch (error) {
        console.error('Failed to fetch emises count:', error);
      }
    };

    fetchCount();
    const intervalId = setInterval(fetchCount, 60000);
    return () => clearInterval(intervalId);
  }, []);

  const handleToggle = () => setOpen((prev) => !prev);
  const handleClose = (event: MouseEvent | TouchEvent) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) return;
    setOpen(false);
  };
  const getOrderStatusLabel = (order: any) => {
    const rawStatus = order.ShippingAdvice || order.shippingAdvice || order.status;
    if (!rawStatus) return 'Pending';
    return rawStatus.toLowerCase() === 'attente' ? 'En attente' : rawStatus;
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 0.5 }}>
      <IconButton
        color="secondary"
        variant="light"
        aria-label="open commandes"
        ref={anchorRef}
        aria-controls={open ? 'commandes-grow' : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
        size="large"
        sx={(theme: any) => ({
          p: 1,
          color: 'secondary.main',
          bgcolor: open ? 'secondary.200' : 'secondary.100',
          ...theme.applyStyles('dark', { bgcolor: open ? 'background.paper' : 'background.default' })
        })}
      >
        <Badge badgeContent={ordersCount > 9 ? '+9' : ordersCount} color="success">
          <BoxIcon size={26} variant="Bulk" />
        </Badge>
      </IconButton>

      <Popper
        placement={downMD ? 'bottom' : 'bottom-end'}
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        popperOptions={{ modifiers: [{ name: 'offset', options: { offset: [downMD ? -5 : 0, 9] } }] }}
      >
        {({ TransitionProps }) => (
          <Transitions type="grow" position={downMD ? 'top' : 'top-right'} in={open} {...TransitionProps}>
            <Paper sx={{ boxShadow: 3, borderRadius: 1.5, width: { xs: 280, sm: 360 } }}>
              <ClickAwayListener onClickAway={handleClose}>
                <MainCard border={false} content={false}>
                  <CardContent>
                    <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="h5">Commandes Émises</Typography>
                      <Link href="#" variant="h6" color="primary">
                        Clear
                      </Link>
                    </Stack>

                    <SimpleBar style={{ maxHeight: 'calc(100vh - 180px)' }}>
                      <List component="nav" sx={{ mt: 1 }}>
                        {orders.map((order: any, index: number) => (
                          <ListItem
                            key={order.id || index}
                            component={ListItemButton}
                            onClick={() => {
                              router.push(`/pages/commandes-emis/non-traitees?highlight=${order.id}`);
                              setOpen(false);
                            }}
                            sx={{ my: 1, border: '1px solid', borderColor: 'divider' }}
                          >
                            <ListItemAvatar>
                              <Avatar type="combined">{order.number ? order.number[0] : 'O'}</Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={<Typography variant="h6">{order.number || `Order #${order.id}`}</Typography>}
                              secondary={`${getOrderStatusLabel(order)} • ${order.orderDate ? new Date(order.orderDate).toLocaleDateString() : ''}`}
                            />
                          </ListItem>
                        ))}
                        {orders.length === 0 && (
                          <Typography variant="body2" color="textSecondary" align="center" sx={{ py: 2 }}>
                            Aucune commande à afficher.
                          </Typography>
                        )}
                      </List>
                    </SimpleBar>

                    <Stack direction="row" sx={{ justifyContent: 'center', mt: 1.5 }}>
                      <Link href="#" variant="h6" color="primary">
                        View all
                      </Link>
                    </Stack>
                  </CardContent>
                </MainCard>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>
    </Box>
  );
}
