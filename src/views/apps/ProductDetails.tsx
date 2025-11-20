'use client';

import { useEffect, useState, SyntheticEvent, useMemo } from 'react';

// material-ui
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// types
import { Products, TabsProps } from 'types/e-commerce';

// project-imports
import MainCard from 'components/MainCard';
import { GRID_COMMON_SPACING } from 'config';

import CircularLoader from 'components/CircularLoader';
import FloatingCart from 'components/cards/e-commerce/FloatingCart';
import ProductFeatures from 'sections/apps/e-commerce/product-details/ProductFeatures';
import ProductImages from 'sections/apps/e-commerce/product-details/ProductImages';
import ProductInfo from 'sections/apps/e-commerce/product-details/ProductInfo';
import ProductReview from 'sections/apps/e-commerce/product-details/ProductReview';
import ProductSpecifications from 'sections/apps/e-commerce/product-details/ProductSpecifications';
import RelatedProducts from 'sections/apps/e-commerce/product-details/RelatedProducts';

import { resetCart, useGetCart } from 'api/cart';
import { handlerActiveItem, useGetMenuMaster } from 'api/menu';
import { useGetProducts } from 'api/products';

function TabPanel({ children, value, index, ...other }: TabsProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`product-details-tabpanel-${index}`}
      aria-labelledby={`product-details-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `product-details-tab-${index}`,
    'aria-controls': `product-details-tabpanel-${index}`
  };
}

// ==============================|| PRODUCT DETAILS - MAIN ||============================== //

type Props = {
  id: string;
};

export default function ProductDetails({ id }: Props) {
  const { menuMaster } = useGetMenuMaster();
  const { productsLoading, products } = useGetProducts();
  const [product, setProduct] = useState<Products | null>(null);

  const { cart } = useGetCart();

  useEffect(() => {
    if (menuMaster.openedItem !== 'product-details') handlerActiveItem('product-details');
    if (id && !productsLoading) {
      setProduct(products.filter((item: Products) => item.id!.toString() === id)[0] || products[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, productsLoading]);

  // product description tabs
  const [value, setValue] = useState(0);

  const handleChange = (event: SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  useEffect(() => {
    // clear cart if complete order
    if (cart && cart.step > 2) {
      resetCart();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const productImages = useMemo(() => <ProductImages product={product!} />, [product]);
  const relatedProducts = useMemo(() => <RelatedProducts id={id} />, [id]);

  const loader = (
    <Box sx={{ height: 504 }}>
      <CircularLoader />
    </Box>
  );

  const isLoader = productsLoading || product === null;

  return (
    <>
      <Grid container spacing={GRID_COMMON_SPACING}>
        <Grid size={12}>
          {isLoader && <MainCard>{loader}</MainCard>}
          {!isLoader && (
            <Grid container spacing={GRID_COMMON_SPACING}>
              <Grid size={{ xs: 12, sm: 8, md: 5, lg: 4 }}>{productImages}</Grid>
              <Grid size={{ xs: 12, md: 7, lg: 8 }}>
                <MainCard border={false} sx={{ height: '100%', bgcolor: 'secondary.lighter' }}>
                  <ProductInfo product={product} />
                </MainCard>
              </Grid>
            </Grid>
          )}
        </Grid>
        <Grid size={{ xs: 12, md: 7, xl: 8 }}>
          <MainCard>
            <Stack sx={{ gap: 3 }}>
              <Stack>
                <Tabs
                  value={value}
                  indicatorColor="primary"
                  onChange={handleChange}
                  aria-label="product description tabs example"
                  variant="scrollable"
                >
                  <Tab label="Features" {...a11yProps(0)} />
                  <Tab label="Specifications" {...a11yProps(1)} />
                  <Tab label="Overview" {...a11yProps(2)} />
                  <Tab
                    label={
                      <Stack direction="row" sx={{ alignItems: 'center' }}>
                        Reviews{' '}
                        <Chip
                          label={isLoader ? <Skeleton width={30} /> : String(product.offerPrice?.toFixed(0))}
                          size="small"
                          color={value === 3 ? 'primary' : 'default'}
                          sx={{ ml: 0.5, borderRadius: '10px' }}
                        />
                      </Stack>
                    }
                    {...a11yProps(3)}
                  />
                </Tabs>
                <Divider />
              </Stack>
              <TabPanel value={value} index={0}>
                <ProductFeatures />
              </TabPanel>
              <TabPanel value={value} index={1}>
                <ProductSpecifications />
              </TabPanel>
              <TabPanel value={value} index={2}>
                <Stack sx={{ gap: 2.5 }}>
                  <Typography sx={{ color: 'text.secondary' }}>
                    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard
                    dummy text ever since the 1500s,{' '}
                    <Typography component="span" variant="subtitle1">
                      {' '}
                      &ldquo;When an unknown printer took a galley of type and scrambled it to make a type specimen book.&rdquo;
                    </Typography>{' '}
                    It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.
                    It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently
                    with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
                  </Typography>
                  <Typography sx={{ color: 'text.secondary' }}>
                    It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently
                    with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
                  </Typography>
                </Stack>
              </TabPanel>
              <TabPanel value={value} index={3}>
                {!isLoader && <ProductReview product={product} />}
              </TabPanel>
            </Stack>
          </MainCard>
        </Grid>
        <Grid sx={{ position: 'relative' }} size={{ xs: 12, md: 5, xl: 4 }}>
          <MainCard
            title="Related Products"
            sx={{ height: 'calc(100% - 16px)', position: { xs: 'relative', md: 'absolute' }, left: 0, right: 0 }}
            content={false}
          >
            {relatedProducts}
          </MainCard>
        </Grid>
      </Grid>

      <FloatingCart />
    </>
  );
}
