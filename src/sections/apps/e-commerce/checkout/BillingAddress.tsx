import { ReactElement, useEffect, useState } from 'react';

// next
import Link from 'next/link';

// material-ui
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project-imports
import AddressCard from './AddressCard';
import CartDiscount from './CartDiscount';
import OrderSummary from './OrderSummery';
import MainCard from 'components/MainCard';
import Avatar from 'components/@extended/Avatar';
import IconButton from 'components/@extended/IconButton';

import { useGetAddress } from 'api/address';
import { GRID_COMMON_SPACING } from 'config';

// types
import { CartCheckoutStateProps } from 'types/cart';
import { Address } from 'types/e-commerce';

// assets
import { ArrowLeft2, CallCalling, Trash } from '@wandersonalwes/iconsax-react';

const prodImage = '/assets/images/e-commerce';

interface BillingAddressProps {
  checkout: CartCheckoutStateProps;
  onBack: () => void;
  billingAddressHandler: (billingAddress: Address | null) => void;
}

// ==============================|| CHECKOUT - BILLING ADDRESS ||============================== //

export default function BillingAddress({ checkout, onBack, billingAddressHandler }: BillingAddressProps) {
  const [rows, setRows] = useState(checkout.products);
  const { addressLoading, address } = useGetAddress();
  useEffect(() => {
    setRows(checkout.products);
  }, [checkout.products]);

  let addressResult: ReactElement | ReactElement[] = (
    <>
      {[1, 2].map((index) => (
        <Grid key={index} size={{ xs: 12, lg: 6 }}>
          <MainCard>
            <Grid container spacing={0.5}>
              <Grid size={12}>
                <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                  <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
                    <Skeleton variant="text" sx={{ fontSize: '0.875rem' }} width={150} />
                    <Skeleton variant="text" sx={{ fontSize: '0.75rem' }} width={50} />
                  </Stack>
                </Stack>
              </Grid>
              <Grid size={12}>
                <Stack sx={{ gap: 2 }}>
                  <Box>
                    <Skeleton variant="text" sx={{ fontSize: '0.875rem' }} />
                    <Skeleton variant="text" sx={{ fontSize: '0.875rem' }} width="40%" />
                  </Box>
                  <Skeleton variant="text" sx={{ fontSize: '0.75rem' }} />
                </Stack>
              </Grid>
            </Grid>
          </MainCard>
        </Grid>
      ))}
    </>
  );
  if (address && !addressLoading) {
    addressResult = address.map((address: Address, index: number) => (
      <Grid key={index} size={{ xs: 12, lg: 6 }}>
        <AddressCard address={address} billingAddressHandler={billingAddressHandler} />
      </Grid>
    ));
  }

  return (
    <Grid container spacing={GRID_COMMON_SPACING}>
      <Grid size={{ xs: 12, md: 8 }}>
        <Stack sx={{ gap: 2, alignItems: 'flex-end' }}>
          <MainCard title="Shipping information">
            <Stack sx={{ gap: 4 }}>
              <Grid container spacing={2}>
                {addressResult}
              </Grid>
              <Grid container rowSpacing={2}>
                <Grid size={12}>
                  <Grid container sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                    <Grid size={3}>
                      <Stack>
                        <InputLabel>First Name :</InputLabel>
                      </Stack>
                    </Grid>
                    <Grid size={9}>
                      <TextField fullWidth placeholder="Enter your first name" />
                    </Grid>
                  </Grid>
                </Grid>
                <Grid size={12}>
                  <Grid container sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                    <Grid size={3}>
                      <Stack>
                        <InputLabel>Last Name :</InputLabel>
                      </Stack>
                    </Grid>
                    <Grid size={9}>
                      <TextField fullWidth placeholder=" Enter your last name" />
                    </Grid>
                  </Grid>
                </Grid>
                <Grid size={12}>
                  <Grid container sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                    <Grid size={3}>
                      <Stack>
                        <InputLabel>Email Id :</InputLabel>
                      </Stack>
                    </Grid>
                    <Grid size={9}>
                      <TextField fullWidth type="email" placeholder="Enter Email id" />
                    </Grid>
                  </Grid>
                </Grid>
                <Grid size={12}>
                  <Grid container sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                    <Grid size={3}>
                      <Stack>
                        <InputLabel>Date of Birth :</InputLabel>
                      </Stack>
                    </Grid>
                    <Grid size={9}>
                      <Grid container spacing={2}>
                        <Grid size={4}>
                          <Stack direction="row" sx={{ gap: 2, alignItems: 'center' }}>
                            <TextField fullWidth placeholder="31" />
                            <Typography>/</Typography>
                          </Stack>
                        </Grid>
                        <Grid size={4}>
                          <Stack direction="row" sx={{ gap: 2, alignItems: 'center' }}>
                            <TextField fullWidth placeholder="12" />
                            <Typography>/</Typography>
                          </Stack>
                        </Grid>
                        <Grid size={4}>
                          <TextField fullWidth placeholder="2021" />
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid size={12}>
                  <Grid container sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                    <Grid size={3}>
                      <Stack>
                        <InputLabel>Phone number :</InputLabel>
                      </Stack>
                    </Grid>
                    <Grid size={9}>
                      <Stack direction="row" sx={{ gap: 2 }}>
                        <Grid size={2}>
                          <TextField placeholder="+91" />
                        </Grid>
                        <Grid size={10}>
                          <TextField
                            fullWidth
                            type="number"
                            placeholder="Enter the Phone number"
                            slotProps={{
                              input: {
                                endAdornment: (
                                  <InputAdornment position="end" sx={{ opacity: 0.5, display: { xs: 'none', sm: 'flex' } }}>
                                    <CallCalling />
                                  </InputAdornment>
                                )
                              }
                            }}
                          />
                        </Grid>
                      </Stack>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid size={12}>
                  <Grid container sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                    <Grid size={3}>
                      <Stack>
                        <InputLabel>City :</InputLabel>
                      </Stack>
                    </Grid>
                    <Grid size={9}>
                      <TextField fullWidth placeholder="Enter City name" />
                    </Grid>
                  </Grid>
                </Grid>
                <Grid size={12}>
                  <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
                    <Checkbox defaultChecked sx={{ p: 0 }} />
                    <Typography>Save this new address for future shipping</Typography>
                  </Stack>
                </Grid>
                <Grid size={12}>
                  <Stack direction="row" sx={{ gap: 1, alignItems: 'center', justifyContent: 'flex-end' }}>
                    <Button variant="outlined" color="secondary">
                      Cancel
                    </Button>
                    <Button variant="contained" color="primary">
                      Save
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </Stack>
          </MainCard>
          <Button variant="text" color="secondary" startIcon={<ArrowLeft2 />} onClick={onBack}>
            <Typography variant="h6" sx={{ color: 'text.primary' }}>
              Back to Cart
            </Typography>
          </Button>
        </Stack>
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
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
                      <IconButton size="medium" color="secondary" sx={{ opacity: 0.5, '&:hover': { bgcolor: 'transparent' } }}>
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
          <Button variant="contained" fullWidth sx={{ textTransform: 'none' }} onClick={() => billingAddressHandler(null)}>
            Process to Checkout
          </Button>
        </Stack>
      </Grid>
    </Grid>
  );
}
