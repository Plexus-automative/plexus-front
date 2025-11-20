import { useState } from 'react';

// next
import { useRouter } from 'next/navigation';

// material-ui
import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import Chip from '@mui/material/Chip';
import FormHelperText from '@mui/material/FormHelperText';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Rating from '@mui/material/Rating';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

// third-party
import { useFormik, Form, FormikProvider } from 'formik';
import * as yup from 'yup';

// project-imports
import ColorOptions from '../products/ColorOptions';
import { addToCart, useGetCart } from 'api/cart';
import { openSnackbar } from 'api/snackbar';
import Avatar from 'components/@extended/Avatar';

// assets
import { Add, Minus, ShopAdd, ShoppingCart } from '@wandersonalwes/iconsax-react';

// types
import { ColorsOptionsProps, Products } from 'types/e-commerce';
import { SnackbarProps } from 'types/snackbar';

// product color select
function getColor(color: string) {
  return ColorOptions.filter((item) => item.value === color);
}

const validationSchema = yup.object({
  color: yup.string().required('Color selection is required')
});

// ==============================|| COLORS OPTION ||============================== //

function Colors({ checked, colorsData }: { checked?: boolean; colorsData: ColorsOptionsProps[] }) {
  return (
    <Grid>
      <Tooltip title={colorsData.length && colorsData[0] && colorsData[0].label ? colorsData[0].label : ''}>
        <ButtonBase sx={{ borderRadius: '50%', '&:focus-visible': { outline: `2px solid secondary.dark`, outlineOffset: 2 } }}>
          <Avatar
            color="inherit"
            size="sm"
            sx={(theme) => ({
              bgcolor: colorsData[0]?.bg,
              color: 'secondary.lighter',
              ...theme.applyStyles('dark', {
                color: 'secondary.800'
              }),
              border: '3px solid',
              borderColor: checked ? 'secondary.light' : 'background.paper'
            })}
          >
            {' '}
          </Avatar>
        </ButtonBase>
      </Tooltip>
    </Grid>
  );
}

// ==============================|| PRODUCT DETAILS - INFORMATION ||============================== //

export default function ProductInfo({ product }: { product: Products }) {
  const route = useRouter();

  const [value, setValue] = useState<number>(1);
  const { cart } = useGetCart();

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      id: product.id,
      name: product.name,
      image: product.image,
      salePrice: product.salePrice,
      offerPrice: product.offerPrice,
      color: '',
      size: '',
      quantity: 1
    },
    validationSchema,
    onSubmit: (values) => {
      values.quantity = value;
      addToCart(values, cart.products);
      openSnackbar({
        open: true,
        message: 'Submit Success',
        variant: 'alert',
        alert: { color: 'success' }
      } as SnackbarProps);

      route.push('/apps/e-commerce/checkout');
    }
  });

  const { errors, values, handleSubmit, handleChange } = formik;

  const addCart = () => {
    values.color = values.color ? values.color : 'primaryDark';
    values.quantity = value;
    addToCart(values, cart.products);
    openSnackbar({
      open: true,
      message: 'Product added to cart',
      variant: 'alert',
      alert: { color: 'success' }
    } as SnackbarProps);
  };

  return (
    <Stack sx={{ gap: 1 }}>
      <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
        <Rating name="simple-controlled" value={product.rating} precision={0.1} readOnly />
        <Typography sx={{ color: 'text.secondary' }}>({product.rating?.toFixed(1)})</Typography>
      </Stack>
      <Typography variant="h3">{product.name}</Typography>
      <Chip
        size="small"
        color={product.isStock ? 'success' : 'error'}
        label={product.isStock ? 'In Stock' : 'Out of Stock'}
        variant="light"
        sx={{ width: 'fit-content', borderRadius: '4px' }}
      />
      <Typography sx={{ color: 'text.secondary' }}>{product.about}</Typography>
      <FormikProvider value={formik}>
        <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid size={12}>
              <Stack sx={{ gap: 1 }}>
                <Typography sx={{ color: 'text.secondary' }}>Color</Typography>
                <RadioGroup row value={values.color} onChange={handleChange} aria-label="colors" name="color" id="color">
                  {product.colors &&
                    product.colors.map((item, index) => {
                      const colorsData = getColor(item);
                      return (
                        <FormControlLabel
                          key={index}
                          value={item}
                          control={
                            <Radio
                              sx={{ p: 0.25 }}
                              checkedIcon={<Colors checked colorsData={colorsData} />}
                              icon={<Colors colorsData={colorsData} />}
                            />
                          }
                          label=""
                          sx={{ ml: -0.25 }}
                        />
                      );
                    })}
                </RadioGroup>
              </Stack>
              {errors.color && (
                <FormHelperText error id="standard-label-color">
                  {errors.color}
                </FormHelperText>
              )}
            </Grid>
            <Grid size={12}>
              <Stack sx={{ gap: 1, justifyContent: 'flex-end' }}>
                <Typography sx={{ color: 'text.secondary' }}>Quantity</Typography>
                <Stack direction="row">
                  <TextField
                    name="rty-incre"
                    value={value > 0 ? value : ''}
                    onChange={(e: any) => setValue(Number(e.target.value))}
                    slotProps={{ htmlInput: { sx: { p: 1.75, width: '33%' } }, input: { sx: { borderRadius: 0 } } }}
                  />
                  <Stack>
                    <Button
                      key="one"
                      color="secondary"
                      variant="outlined"
                      onClick={() => setValue(value + 1)}
                      sx={{
                        px: 0.25,
                        py: 0.25,
                        minWidth: '0px !important',
                        borderRadius: 0,
                        borderLeft: 'none',
                        borderColor: 'secondary.400',
                        '&:hover': { borderLeft: 'none', borderColor: 'secondary.400' },
                        '&.Mui-disabled': { borderLeft: 'none', borderColor: 'secondary.light' }
                      }}
                    >
                      <Add />
                    </Button>
                    <Button
                      key="three"
                      color="secondary"
                      variant="outlined"
                      disabled={value <= 1}
                      onClick={() => setValue(value - 1)}
                      sx={{
                        px: 0.5,
                        py: 0.35,
                        minWidth: '0px !important',
                        borderRadius: 0,
                        borderTop: 'none',
                        borderLeft: 'none',
                        borderColor: 'secondary.400',
                        '&:hover': { borderTop: 'none', borderLeft: 'none', borderColor: 'secondary.400' },
                        '&.Mui-disabled': { borderTop: 'none', borderLeft: 'none', borderColor: 'secondary.light' }
                      }}
                    >
                      <Minus />
                    </Button>
                  </Stack>
                </Stack>
              </Stack>
              {value === 0 && <FormHelperText sx={{ color: 'error.main' }}>Please select quantity more than 0</FormHelperText>}
            </Grid>
            <Grid size={12}>
              <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
                <Typography variant="h3">${product.offerPrice}</Typography>
                {product.salePrice && (
                  <Typography variant="h4" sx={{ color: 'text.secondary', textDecoration: 'line-through', opacity: 0.5, fontWeight: 400 }}>
                    ${product.salePrice}
                  </Typography>
                )}
              </Stack>
            </Grid>
            <Grid size={12}>
              <Stack direction="row" sx={{ gap: 2, alignItems: 'center', mt: 2 }}>
                <Button
                  type="submit"
                  disabled={value < 1 || !product.isStock}
                  color="primary"
                  variant="contained"
                  size="large"
                  startIcon={<ShoppingCart />}
                >
                  {!product.isStock ? 'Sold Out' : 'Buy Now'}
                </Button>

                {product.isStock && value > 0 && (
                  <Button color="secondary" variant="outlined" size="large" onClick={addCart} startIcon={<ShopAdd variant="Bold" />}>
                    Add to Cart
                  </Button>
                )}
              </Stack>
            </Grid>
          </Grid>
        </Form>
      </FormikProvider>
    </Stack>
  );
}
