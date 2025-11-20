import { useEffect, useState } from 'react';

// next
import Link from 'next/link';

// material-ui
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

// third-party
import { sum } from 'lodash-es';
import currency from 'currency.js';

// project-imports
import CartDiscount from './CartDiscount';
import OrderSummary from './OrderSummery';
import ColorOptions from '../products/ColorOptions';
import IconButton from 'components/@extended/IconButton';
import Avatar from 'components/@extended/Avatar';
import MainCard from 'components/MainCard';
import { GRID_COMMON_SPACING } from 'config';

// assets
import { Add, ArrowLeft2, Minus, Trash } from '@wandersonalwes/iconsax-react';

// types
import { CartCheckoutStateProps, CartProductStateProps } from 'types/cart';

const prodImage = '/assets/images/e-commerce';

// product color select
function getColor(color: string) {
  return ColorOptions.filter((item) => item.value === color);
}

interface IncrementProps {
  itemId: string | number | undefined;
  quantity: number;
  updateQuantity: (id: string | number | undefined, quantity: number) => void;
}

// ==============================|| CART - INCREMENT QUANTITY ||============================== //

function Increment({ itemId, quantity, updateQuantity }: IncrementProps) {
  const [value, setValue] = useState(quantity);

  const incrementHandler = () => {
    setValue(value - 1);
    updateQuantity(itemId, value - 1);
  };

  const decrementHandler = () => {
    setValue(value + 1);
    updateQuantity(itemId, value + 1);
  };

  return (
    <Stack direction="row">
      <Button
        key="three"
        variant="text"
        disabled={value <= 1}
        onClick={incrementHandler}
        sx={{ pr: 0.75, pl: 0.75, minWidth: '0px !important', '&:hover': { bgcolor: 'transparent' } }}
      >
        <Minus style={{ fontSize: 'inherit' }} />
      </Button>
      <Typography key="two" sx={{ p: '9px 15px', border: '1px solid', borderColor: 'secondary.200' }}>
        {value}
      </Typography>
      <Button
        key="one"
        variant="text"
        onClick={decrementHandler}
        sx={{ pl: 0.75, pr: 0.75, minWidth: '0px !important', '&:hover': { bgcolor: 'transparent' } }}
      >
        <Add style={{ fontSize: 'inherit' }} />
      </Button>
    </Stack>
  );
}

interface CartProps {
  checkout: CartCheckoutStateProps;
  onNext: () => void;
  removeProduct: (id: string | number | undefined) => void;
  updateQuantity: (id: string | number | undefined, quantity: number) => void;
}

// ==============================|| CHECKOUT - CART ||============================== //

export default function Cart({ checkout, onNext, removeProduct, updateQuantity }: CartProps) {
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [rows, setRows] = useState(checkout.products);

  useEffect(() => {
    setRows(checkout.products);
    setTotalQuantity(sum(checkout.products.map((item: any) => item.quantity)));
  }, [checkout.products]);

  return (
    <Grid container spacing={GRID_COMMON_SPACING}>
      <Grid size={{ xs: 12, md: 8 }}>
        <Stack sx={{ gap: 2 }}>
          <MainCard content={false}>
            <Grid container>
              <Grid sx={{ py: 2.5, pl: 2.5 }} size={12}>
                <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
                  <Typography variant="subtitle1">Cart</Typography>
                  <Avatar color="secondary" size="xs">
                    {totalQuantity}
                  </Avatar>
                </Stack>
              </Grid>
              <Grid size={12}>
                <Divider />
              </Grid>
              <Grid size={12}>
                <TableContainer>
                  <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableBody>
                      {rows.map((row: CartProductStateProps, index: number) => {
                        const colorsData = row.color ? getColor(row.color) : false;
                        return (
                          <TableRow key={index} sx={{ '&:last-of-type td, &:last-of-type th': { border: 0 } }}>
                            <TableCell component="th" scope="row">
                              <Grid container spacing={2} sx={{ alignItems: 'center' }}>
                                <Grid>
                                  <Avatar
                                    size="lg"
                                    variant="rounded"
                                    color="secondary"
                                    type="combined"
                                    src={row.image ? `${prodImage}/thumbs/${row.image}` : ''}
                                  />
                                </Grid>
                                <Grid>
                                  <Stack>
                                    <Typography
                                      component={Link}
                                      href={`/apps/e-commerce/product-details/${row.id}`}
                                      target="_blank"
                                      variant="subtitle1"
                                      sx={{ color: 'text.primary', textDecoration: 'none' }}
                                    >
                                      {row.name}
                                    </Typography>
                                    <Typography sx={{ color: 'text.secondary' }}>
                                      {' '}
                                      {colorsData ? colorsData[0].label : 'Multicolor'}
                                    </Typography>
                                  </Stack>
                                </Grid>
                              </Grid>
                            </TableCell>
                            <TableCell align="right">
                              <Stack sx={{ alignItems: 'center' }}>
                                {row.offerPrice && row.quantity && (
                                  <Typography variant="subtitle1">{currency(row.offerPrice * row.quantity).format()}</Typography>
                                )}
                              </Stack>
                            </TableCell>
                            <TableCell align="right">
                              <Increment quantity={row.quantity} itemId={row.itemId} updateQuantity={updateQuantity} />
                            </TableCell>
                            <TableCell align="right">
                              <IconButton
                                color="error"
                                onClick={() => removeProduct(row.itemId)}
                                size="small"
                                sx={{ opacity: 0.75, '&:hover': { bgcolor: 'transparent' } }}
                              >
                                <Trash variant="Bold" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          </MainCard>
          <Grid sx={{ textAlign: 'right' }}>
            <Button color="secondary" component={Link} href="/apps/e-commerce/products" variant="text" startIcon={<ArrowLeft2 />}>
              <Typography variant="h6" sx={{ color: 'text.primary' }}>
                Back to Shopping
              </Typography>
            </Button>
          </Grid>
        </Stack>
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <Stack sx={{ gap: GRID_COMMON_SPACING }}>
          <MainCard>
            <CartDiscount />
          </MainCard>
          <OrderSummary checkout={checkout} show />
          <Button variant="contained" sx={{ textTransform: 'none' }} fullWidth onClick={onNext}>
            Process to Checkout
          </Button>
        </Stack>
      </Grid>
    </Grid>
  );
}
