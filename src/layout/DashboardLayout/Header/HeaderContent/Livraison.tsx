import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axiosServices from 'utils/axios';

// material-ui
import useMediaQuery from '@mui/material/useMediaQuery';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import CardContent from '@mui/material/CardContent';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Link from '@mui/material/Link';

// project imports
import IconButton from 'components/@extended/IconButton';
import Avatar from 'components/@extended/Avatar';
import MainCard from 'components/MainCard';
import Transitions from 'components/@extended/Transitions';
import SimpleBar from 'components/third-party/SimpleBar';

// icons
import { TruckTime } from '@wandersonalwes/iconsax-react'; // replace with your delivery/truck icon

// ==============================|| HEADER CONTENT - TRUCKFAST ||============================== //

export default function Livraison() {
  const downMD = useMediaQuery((theme: any) => theme.breakpoints.down('md'));
  const router = useRouter();
  const anchorRef = useRef<any>(null);
  const [open, setOpen] = useState(false);

  const [deliveryCount, setDeliveryCount] = useState(0);
  const [deliveries, setDeliveries] = useState<any[]>([]);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const response = await axiosServices.get('/api/purchase-orders/commandes-livree?skip=0&top=5');

        if (response.data && response.data['@odata.count'] !== undefined) {
          setDeliveryCount(response.data['@odata.count']);
        }

        if (response.data && response.data.value) {
          setDeliveries(response.data.value);
          if (response.data['@odata.count'] === undefined) {
            setDeliveryCount(response.data.value.length);
          }
        }
      } catch (error) {
        console.error('Failed to fetch delivery count:', error);
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

  return (
    <Box sx={{ flexShrink: 0, ml: 0.5 }}>
      <IconButton
        color="secondary"
        variant="light"
        aria-label="open deliveries"
        ref={anchorRef}
        aria-controls={open ? 'truckfast-grow' : undefined}
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
        <Badge badgeContent={deliveryCount > 9 ? '+9' : deliveryCount} color="success">
          <TruckTime size={26} variant="Bulk" />
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
                      <Typography variant="h5">Livraison</Typography>
                      <Link href="#" variant="h6" color="primary">
                        Clear
                      </Link>
                    </Stack>

                    <SimpleBar style={{ maxHeight: 'calc(100vh - 180px)' }}>
                      <List component="nav" sx={{ mt: 1 }}>
                        {deliveries.map((item: any, index: number) => (
                          <ListItem
                            key={item.id || index}
                            component={ListItemButton}
                            onClick={() => {
                              router.push(`/pages/commandes-livree?highlight=${item.id}`);
                              setOpen(false);
                            }}
                            sx={{ my: 1, border: '1px solid', borderColor: 'divider' }}
                          >
                            <ListItemAvatar>
                              <Avatar type="combined">{item.number ? item.number[0] : 'O'}</Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={<Typography variant="h6">{item.number || `Order #${item.id}`}</Typography>}
                              secondary={`${item.status || 'En attente'} • ${item.orderDate ? new Date(item.orderDate).toLocaleDateString() : ''}`}
                            />
                          </ListItem>
                        ))}
                        {deliveries.length === 0 && (
                          <Typography variant="body2" color="textSecondary" align="center" sx={{ py: 2 }}>
                            Aucune livraison à afficher.
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
