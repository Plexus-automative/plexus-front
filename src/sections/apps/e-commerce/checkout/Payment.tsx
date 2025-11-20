import { useEffect, useState } from 'react';

// next
import Link from 'next/link';

// material-ui
import Button from '@mui/material/Button';
import CardMedia from '@mui/material/CardMedia';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

// project-imports
import AddAddress from './AddAddress';
import AddressCard from './AddressCard';
import CartDiscount from './CartDiscount';
import OrderComplete from './OrderComplete';
import OrderSummary from './OrderSummery';
import PaymentCard from './PaymentCard';
import PaymentOptions from './PaymentOptions';
import PaymentSelect from './PaymentSelect';

import { setPaymentCard, setPaymentMethod } from 'api/cart';
import { openSnackbar } from 'api/snackbar';
import Avatar from 'components/@extended/Avatar';
import IconButton from 'components/@extended/IconButton';
import MainCard from 'components/MainCard';
import { GRID_COMMON_SPACING } from 'config';

// assets
import { ArrowLeft2, TickCircle, Trash } from '@wandersonalwes/iconsax-react';

const cvv = '/assets/images/e-commerce/cvv.png';
const lock = '/assets/images/e-commerce/lock.png';
const master = '/assets/images/e-commerce/master-card.png';
const paypalcard = '/assets/images/e-commerce/paypal.png';
const prodImage = '/assets/images/e-commerce';

// types
import { SnackbarProps } from 'types/snackbar';
import { CartCheckoutStateProps } from 'types/cart';
import { Address, PaymentOptionsProps } from 'types/e-commerce';

interface PaymentProps {
  checkout: CartCheckoutStateProps;
  onBack: () => void;
  onNext: () => void;
  removeProduct: (id: string | number | undefined) => void;
  editAddress: (address: Address) => void;
}

// ==============================|| CHECKOUT - PAYMENT ||============================== //

export default function Payment({ checkout, onBack, onNext, removeProduct, editAddress }: PaymentProps) {
  const [type, setType] = useState('visa');
  const [payment, setPayment] = useState(checkout.payment.method);
  const [rows, setRows] = useState(checkout.products);
  const [cards, setCards] = useState(checkout.payment.card);
  const [select, setSelect] = useState<Address | null>(null);

  const [open, setOpen] = useState(false);

  const handleClickOpen = (billingAddress: Address | null) => {
    setOpen(true);
    if (billingAddress) setSelect(billingAddress!);
  };

  const handleClose = () => {
    setOpen(false);
    setSelect(null);
  };

  const [complete, setComplete] = useState(false);

  useEffect(() => {
    if (checkout.step > 2) {
      setComplete(true);
    }
  }, [checkout.step]);

  useEffect(() => {
    setRows(checkout.products);
  }, [checkout.products]);

  const cardHandler = (card: string) => {
    if (payment === 'card') {
      setCards(card);
      setPaymentCard(card);
    }
  };

  const handlePaymentMethod = (value: string) => {
    if (value === 'card') {
      setType('visa');
    } else if (value === 'paypal') {
      setType('mastercard');
    } else {
      setType('cod');
    }
    setPayment(value);
    setPaymentMethod(value);
  };

  const completeHandler = () => {
    if (payment === 'card' && (cards === '' || cards === null)) {
      openSnackbar({
        open: true,
        message: 'Select Payment Card',
        variant: 'alert',
        alert: {
          color: 'error'
        }
      } as SnackbarProps);
    } else {
      onNext();
      setComplete(true);
    }
  };

  const getImage = (cardType: string) => {
    if (cardType === 'visa') {
      return <CardMedia component="img" src={master} alt="card-visa" />;
    }
    if (cardType === 'mastercard') {
      return <CardMedia component="img" src={paypalcard} alt="card-master" />;
    }
    return null;
  };

  return (
    <Grid container spacing={GRID_COMMON_SPACING}>
      <Grid size={{ xs: 12, md: 6, lg: 8, xl: 9 }}>
        <Stack sx={{ gap: 2, alignItems: 'flex-end' }}>
          <MainCard title="Payment Method">
            <Grid container spacing={3}>
              <Grid size={12}>
                <AddressCard change address={checkout.billing} handleClickOpen={handleClickOpen} />
              </Grid>
              <Grid size={12}>
                <FormControl>
                  <RadioGroup
                    aria-label="delivery-options"
                    value={payment}
                    onChange={(e) => handlePaymentMethod(e.target.value)}
                    name="delivery-options"
                  >
                    <Grid container spacing={2} sx={{ alignItems: 'center' }}>
                      {PaymentOptions.map((item: PaymentOptionsProps, index: any) => (
                        <Grid key={index} size={{ xs: 12, sm: 6, lg: 4 }}>
                          <PaymentSelect item={item} />
                        </Grid>
                      ))}
                    </Grid>
                  </RadioGroup>
                </FormControl>
              </Grid>
              {type !== 'cod' && (
                <Grid size={12}>
                  <Grid container rowSpacing={2}>
                    <Grid size={12}>
                      <Grid container>
                        <Grid size={5}>
                          <Stack>
                            <InputLabel>Card Number :</InputLabel>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: { xs: 'none', sm: 'flex' } }}>
                              Enter the 16 digit card number on the card
                            </Typography>
                          </Stack>
                        </Grid>
                        <Grid size={7}>
                          <TextField
                            fullWidth
                            type="password"
                            slotProps={{
                              input: {
                                startAdornment: type !== 'cod' ? <InputAdornment position="start">{getImage(type)}</InputAdornment> : null,
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <TickCircle />
                                  </InputAdornment>
                                )
                              }
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid size={12}>
                      <Grid container>
                        <Grid size={5}>
                          <Stack>
                            <InputLabel>Expiry Date :</InputLabel>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: { xs: 'none', sm: 'flex' } }}>
                              Enter the expiration on the card
                            </Typography>
                          </Stack>
                        </Grid>
                        <Grid size={7}>
                          <Grid container spacing={2}>
                            <Grid size={6}>
                              <Stack direction="row" sx={{ gap: 2, alignItems: 'center' }}>
                                <TextField fullWidth placeholder="12" />
                                <Typography sx={{ color: 'text.secondary' }}>/</Typography>
                              </Stack>
                            </Grid>
                            <Grid size={6}>
                              <TextField fullWidth placeholder="2021" />
                            </Grid>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid size={12}>
                      <Grid container>
                        <Grid size={5}>
                          <Stack>
                            <InputLabel>CVV Number :</InputLabel>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: { xs: 'none', sm: 'flex' } }}>
                              Enter the 3 or 4 digit number on the card
                            </Typography>
                          </Stack>
                        </Grid>
                        <Grid size={7}>
                          <TextField
                            fullWidth
                            slotProps={{
                              input: {
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <CardMedia component="img" src={cvv} alt="CVV" sx={{ width: 'auto' }} />
                                  </InputAdornment>
                                )
                              }
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid size={12}>
                      <Grid container>
                        <Grid size={5}>
                          <Stack>
                            <InputLabel>Password :</InputLabel>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: { xs: 'none', sm: 'flex' } }}>
                              Enter your dynamic password
                            </Typography>
                          </Stack>
                        </Grid>
                        <Grid size={7}>
                          <TextField
                            fullWidth
                            slotProps={{
                              input: {
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <CardMedia component="img" src={lock} alt="icon" sx={{ width: 'auto' }} />
                                  </InputAdornment>
                                )
                              }
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              )}
              {type !== 'cod' && (
                <Grid size={12}>
                  <Stack direction="row" sx={{ gap: 1, justifyContent: 'flex-end' }}>
                    <Button variant="outlined" color="secondary">
                      Cancel
                    </Button>
                    <Button variant="contained" color="primary">
                      Save
                    </Button>
                  </Stack>
                </Grid>
              )}
              <Grid size={12}>
                <Stack direction="row" sx={{ alignItems: 'center' }}>
                  <Grid size={6}>
                    <Divider />
                  </Grid>
                  <Typography sx={{ px: 1 }}>OR</Typography>
                  <Grid size={6}>
                    <Divider />
                  </Grid>
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, sm: 12, lg: 10 }}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6, lg: 5 }}>
                    <PaymentCard type="mastercard" paymentType={type} cardHandler={cardHandler} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, lg: 5 }}>
                    <PaymentCard type="visa" paymentType={type} cardHandler={cardHandler} />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </MainCard>
          <Button variant="text" color="secondary" startIcon={<ArrowLeft2 />} onClick={onBack}>
            <Typography variant="h6" sx={{ color: 'text.primary' }}>
              Back to Shipping Information
            </Typography>
          </Button>
        </Stack>
      </Grid>
      <Grid size={{ xs: 12, md: 6, lg: 4, xl: 3 }}>
        <Stack sx={{ gap: GRID_COMMON_SPACING }}>
          <MainCard>
            <CartDiscount />
          </MainCard>
          <div>
            <MainCard
              title="Order Summery"
              sx={{ borderBottom: 'none', borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
              content={false}
            >
              {rows.map((row, index) => (
                <List
                  key={index}
                  component="nav"
                  sx={{
                    '& .MuiListItemButton-root': {
                      '& .MuiListItemSecondaryAction-root': {
                        alignSelf: 'flex-start',
                        ml: 1,
                        position: 'relative',
                        right: 'auto',
                        top: 'auto',
                        transform: 'none'
                      },
                      '& .MuiListItemAvatar-root': { mr: '7px' },
                      py: 0.5,
                      pl: '15px',
                      pr: '8px'
                    },
                    p: 0
                  }}
                >
                  <ListItem
                    component={ListItemButton}
                    secondaryAction={
                      <IconButton
                        size="medium"
                        color="secondary"
                        sx={{ opacity: 0.5, '&:hover': { bgcolor: 'transparent' } }}
                        onClick={() => removeProduct(row.itemId)}
                      >
                        <Trash style={{ color: 'secondary.main' }} />
                      </IconButton>
                    }
                    divider
                  >
                    <ListItemAvatar>
                      <Avatar
                        alt="Avatar"
                        size="lg"
                        variant="rounded"
                        color="secondary"
                        type="combined"
                        src={row.image ? `${prodImage}/thumbs/${row.image}` : ''}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      disableTypography
                      primary={
                        <Typography
                          component={Link}
                          href={`/apps/e-commerce/product-details/${row.id}`}
                          target="_blank"
                          variant="subtitle1"
                          sx={{ color: 'text.primary', textDecoration: 'none' }}
                        >
                          {row.name}
                        </Typography>
                      }
                      secondary={
                        <Stack sx={{ gap: 1 }}>
                          <Typography sx={{ color: 'text.secondary' }}>{row.description}</Typography>
                          <Stack direction="row" sx={{ gap: 3, alignItems: 'center' }}>
                            <Typography>${row.offerPrice}</Typography>
                            <Typography sx={{ color: 'text.secondary' }}>{row.quantity} items</Typography>
                          </Stack>
                        </Stack>
                      }
                    />
                  </ListItem>
                </List>
              ))}
            </MainCard>
            <OrderSummary checkout={checkout} />
          </div>
          <Button variant="contained" sx={{ textTransform: 'none' }} onClick={completeHandler} fullWidth>
            Process to Checkout
          </Button>
          <OrderComplete open={complete} />
        </Stack>
      </Grid>
      <AddAddress open={open} handleClose={handleClose} address={select!} editAddress={editAddress} />
    </Grid>
  );
}
