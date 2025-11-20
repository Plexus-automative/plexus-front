'use client';

import { useRouter } from 'next/navigation';

import { ReactElement, useEffect, useState } from 'react';

// material-ui
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Rating from '@mui/material/Rating';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project-imports
import Avatar from 'components/@extended/Avatar';
import IconButton from 'components/@extended/IconButton';
import SimpleBar from 'components/third-party/SimpleBar';

import { useGetRelatedProducts } from 'api/products';
import { openSnackbar } from 'api/snackbar';

// assets
import { Heart } from '@wandersonalwes/iconsax-react';

// types
import { Products } from 'types/e-commerce';
import { SnackbarProps } from 'types/snackbar';

function ListProduct({ product }: { product: Products }) {
  const [wishlisted, setWishlisted] = useState<boolean>(false);
  const addToFavourite = () => {
    setWishlisted(!wishlisted);
    openSnackbar({
      open: true,
      message: !wishlisted ? 'Added to favourites' : 'Removed from favourites',
      variant: 'alert',
      alert: {
        color: 'success'
      }
    } as SnackbarProps);
  };

  const router = useRouter();

  return (
    <ListItem
      component={ListItemButton}
      secondaryAction={
        <IconButton
          size="medium"
          color={wishlisted ? 'error' : 'secondary'}
          sx={{ opacity: wishlisted ? 1 : 0.5, '&:hover': { bgcolor: 'transparent' }, mt: -1 }}
          onClick={addToFavourite}
        >
          <Heart variant={wishlisted ? 'Bold' : 'Linear'} style={{ fontSize: '1.15rem' }} />
        </IconButton>
      }
      divider
      onClick={() => router?.push(`/apps/e-commerce/product-details/${product.id}`)}
    >
      <ListItemAvatar>
        <Avatar
          alt="Avatar"
          size="xl"
          color="secondary"
          variant="rounded"
          type="combined"
          src={product.image ? `/assets/images/e-commerce/thumbs/${product.image}` : ''}
          sx={{ borderColor: 'divider', mr: 1.15 }}
        />
      </ListItemAvatar>
      <ListItemText
        disableTypography
        primary={<Typography variant="h5">{product.name}</Typography>}
        secondary={
          <Stack sx={{ gap: 1 }}>
            <Typography color="text.secondary">{product.description}</Typography>
            <Stack sx={{ gap: 1 }}>
              <Stack direction="row" sx={{ gap: 0.5, alignItems: 'center' }}>
                <Typography variant="h5">{product.salePrice ? `$${product.salePrice}` : `$${product.offerPrice}`}</Typography>
                {product.salePrice && (
                  <Typography variant="h6" sx={{ color: 'text.secondary', textDecoration: 'line-through' }}>
                    ${product.offerPrice}
                  </Typography>
                )}
              </Stack>
              <Rating
                name="simple-controlled"
                value={product.rating! < 4 ? product.rating! + 1 : product.rating}
                readOnly
                precision={0.1}
              />
            </Stack>
          </Stack>
        }
        sx={{ mt: 0 }}
      />
    </ListItem>
  );
}

// ==============================|| PRODUCT DETAILS - RELATED PRODUCTS ||============================== //

export default function RelatedProducts({ id }: { id?: string }) {
  const { relatedProductsLoading, relatedProducts } = useGetRelatedProducts(id!);

  const [related, setRelated] = useState<Products[]>(relatedProducts);

  useEffect(() => {
    if (!relatedProductsLoading) {
      setRelated(relatedProducts);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, relatedProductsLoading]);

  let productResult: ReactElement | ReactElement[] = (
    <List>
      {[1, 2, 3].map((index: number) => (
        <ListItem key={index}>
          <ListItemAvatar sx={{ minWidth: 72 }}>
            <Skeleton variant="rectangular" width={62} height={62} />
          </ListItemAvatar>
          <ListItemText
            primary={<Skeleton animation="wave" height={22} />}
            secondary={
              <>
                <Skeleton animation="wave" height={14} width="60%" />
                <Skeleton animation="wave" height={18} width="20%" />
                <Skeleton animation="wave" height={14} width="35%" />
              </>
            }
          />
        </ListItem>
      ))}
    </List>
  );

  if (related && !relatedProductsLoading) {
    productResult = (
      <List
        component="nav"
        sx={{
          '& .MuiListItemButton-root': {
            borderRadius: 0,
            my: 0,
            px: 3,
            py: 2,
            alignItems: 'flex-start',
            '& .MuiListItemSecondaryAction-root': {
              alignSelf: 'flex-start',
              ml: 1,
              position: 'relative',
              right: 'auto',
              top: 'auto',
              transform: 'none'
            },
            '& .MuiListItemAvatar-root': { mr: '7px', mt: 0.75 }
          },
          p: 0
        }}
      >
        {related.map((product: Products, index) => (
          <ListProduct key={index} product={product} />
        ))}
      </List>
    );
  }

  return (
    <SimpleBar sx={{ height: { xs: '100%', md: 'calc(100% - 62px)' } }}>
      <Grid>
        <Stack>
          {productResult}
          <Button color="secondary" variant="outlined" sx={{ mx: 2, my: 4, textTransform: 'none' }}>
            View all Products
          </Button>
        </Stack>
      </Grid>
    </SimpleBar>
  );
}
