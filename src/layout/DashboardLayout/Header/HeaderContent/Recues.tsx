import { useRef, useState } from 'react';

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
import {  DocumentDownload } from '@wandersonalwes/iconsax-react'; // box icon for orders

// ==============================|| HEADER CONTENT - COMMANDES REÇUES ||============================== //

export default function Recues() {
  const downMD = useMediaQuery((theme: any) => theme.breakpoints.down('md'));
  const anchorRef = useRef<any>(null);
  const [open, setOpen] = useState(false);

  // Fake received orders
  const orders = [
    { id: 1, title: 'Order #2001', date: 'Jan 26, 2026', status: 'Pending' },
    { id: 2, title: 'Order #2002', date: 'Jan 25, 2026', status: 'Processing' },
    { id: 3, title: 'Order #2003', date: 'Jan 24, 2026', status: 'Received' }
  ];

  const ordersCount = orders.length;

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
        aria-label="open received commandes"
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
        <Badge badgeContent={ordersCount} color="success">
          <DocumentDownload size={26} variant="Bulk" />
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
                      <Typography variant="h5">Commandes Reçues</Typography>
                      <Link href="#" variant="h6" color="primary">
                        Clear
                      </Link>
                    </Stack>

                    <SimpleBar style={{ maxHeight: 'calc(100vh - 180px)' }}>
                      <List component="nav" sx={{ mt: 1 }}>
                        {orders.map((order) => (
                          <ListItem
                            key={order.id}
                            component={ListItemButton}
                            sx={{ my: 1, border: '1px solid', borderColor: 'divider' }}
                          >
                            <ListItemAvatar>
                              <Avatar type="combined">{order.title[0]}</Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={<Typography variant="h6">{order.title}</Typography>}
                              secondary={`${order.status} • ${order.date}`}
                            />
                          </ListItem>
                        ))}
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
