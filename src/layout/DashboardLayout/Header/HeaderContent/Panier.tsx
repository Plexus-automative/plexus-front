import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

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
import ListItemText from '@mui/material/ListItemText';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';

// project imports
import IconButton from 'components/@extended/IconButton';
import Avatar from 'components/@extended/Avatar';
import MainCard from 'components/MainCard';
import Transitions from 'components/@extended/Transitions';
import SimpleBar from 'components/third-party/SimpleBar';

// icons
import { ShoppingCart, Trash } from '@wandersonalwes/iconsax-react';

// context
import { useCart } from 'contexts/CartContext';

// ==============================|| HEADER CONTENT - PANIER ||============================== //

export default function Panier() {
  const router = useRouter();
  const downMD = useMediaQuery((theme: any) => theme.breakpoints.down('md'));
  const anchorRef = useRef<any>(null);
  const [open, setOpen] = useState(false);

  const { cartItems, totalItems, removeFromCart, clearCart } = useCart();

  const handleToggle = () => {
    setOpen((prev) => !prev);
  };

  const handleClose = (event: MouseEvent | TouchEvent) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) return;
    setOpen(false);
  };

  const handleViewAll = () => {
    router.push('/panier');
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
          badgeContent={totalItems}
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
                      <Typography variant="h5">Panier ({totalItems})</Typography>
                      {cartItems.length > 0 && (
                        <Link component="button" variant="h6" color="error" onClick={clearCart}>
                          Vider
                        </Link>
                      )}
                    </Stack>

                    <SimpleBar style={{ maxHeight: 'calc(100vh - 180px)' }}>
                      <List component="nav" sx={{ mt: 1 }}>
                        {cartItems.length === 0 ? (
                          <Typography variant="body2" color="textSecondary" align="center" sx={{ py: 3 }}>
                            Votre panier est vide.
                          </Typography>
                        ) : (
                          cartItems.map((item) => (
                            <ListItem
                              key={item.id}
                              sx={{
                                my: 1,
                                border: '1px solid',
                                borderColor: 'divider',
                                '&:hover': { bgcolor: 'primary.lighter', borderColor: 'primary.light' }
                              }}
                              secondaryAction={
                                <IconButton edge="end" aria-label="delete" onClick={() => removeFromCart(item.id)} size="small" color="error">
                                  <Trash size={18} variant="Bulk" />
                                </IconButton>
                              }
                            >
                              <ListItemAvatar>
                                <Avatar type="combined">{item.description ? item.description[0] : 'I'}</Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={
                                  <Typography variant="subtitle1" noWrap>
                                    {item.description || item.number}
                                  </Typography>
                                }
                                secondary={
                                  <Typography variant="body2" color="textSecondary">
                                    Qté: {item.quantity} | {item.price} Dhs
                                  </Typography>
                                }
                              />
                            </ListItem>
                          ))
                        )}
                      </List>
                    </SimpleBar>

                    <Stack direction="row" sx={{ justifyContent: 'center', mt: 1.5 }}>
                      <Button variant="contained" fullWidth onClick={handleViewAll} disabled={cartItems.length === 0}>
                        Voir tout / Valider
                      </Button>
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
