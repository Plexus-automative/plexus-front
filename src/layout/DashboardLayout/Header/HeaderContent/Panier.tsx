import { useRef, useState } from 'react';

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
import { ShoppingCart } from '@wandersonalwes/iconsax-react';

// ==============================|| HEADER CONTENT - PANIER ||============================== //

export default function Panier() {
  const downMD = useMediaQuery((theme: any) => theme.breakpoints.down('md'));
  const anchorRef = useRef<any>(null);
  const [open, setOpen] = useState(false);

  // Fake cart items
  const fakePanierItems = [
    { id: 1, name: 'Service A', qty: 1 },
    { id: 2, name: 'Service B', qty: 2 }
  ];

  const panierCount = fakePanierItems.reduce((acc, item) => acc + item.qty, 0);

  const handleToggle = () => {
    setOpen((prev) => !prev);
  };

  const handleClose = (event: MouseEvent | TouchEvent) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) return;
    setOpen(false);
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 0.5 }}>
      <IconButton
        color="secondary"
        variant="light"
        aria-label="open panier"
        ref={anchorRef}
        aria-controls={open ? 'panier-grow' : undefined}
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
        <Badge
          badgeContent={panierCount}
          color="success"
          slotProps={{ badge: { sx: { top: 2, right: 4 } } }}
        >
          <ShoppingCart size={26} variant="Bulk" />
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
            <Paper sx={{ boxShadow: 2, borderRadius: 1.5, width: { xs: 280, sm: 360 } }}>
              <ClickAwayListener onClickAway={handleClose}>
                <MainCard border={false} content={false}>
                  <CardContent>
                    <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="h5">Panier</Typography>
                      <Link href="#" variant="h6" color="primary">
                        Clear
                      </Link>
                    </Stack>

                    <SimpleBar style={{ maxHeight: 'calc(100vh - 180px)' }}>
                      <List component="nav" sx={{ mt: 1 }}>
                        {fakePanierItems.map((item) => (
                          <ListItem
                            key={item.id}
                            component={ListItemButton}
                            sx={{
                              my: 1,
                              border: '1px solid',
                              borderColor: 'divider',
                              '&:hover': { bgcolor: 'primary.lighter', borderColor: 'primary.light' }
                            }}
                          >
                            <ListItemAvatar>
                              <Avatar type="combined">{item.name[0]}</Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Typography variant="h6">
                                  {item.name} <Typography component="span" variant="subtitle1">x{item.qty}</Typography>
                                </Typography>
                              }
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
