// next
import Link from 'next/link';

// material-ui
import Badge from '@mui/material/Badge';
import Fab from '@mui/material/Fab';

// third-party
import { sum } from 'lodash-es';

// project-imports
import { useGetCart } from 'api/cart';
import IconButton from 'components/@extended/IconButton';

// types
import { CartProductStateProps } from 'types/cart';

// assets
import { ShoppingCart } from '@wandersonalwes/iconsax-react';

// ==============================|| CART ITEMS - FLOATING BUTTON ||============================== //

export default function FloatingCart() {
  const { cart } = useGetCart();

  let totalQuantity: number = 0;
  if (cart && cart.products && cart.products.length > 0) {
    totalQuantity = sum(cart.products.map((item: CartProductStateProps) => item.quantity));
  }

  return (
    <Fab
      component={Link}
      href="/apps/e-commerce/checkout"
      size="large"
      variant="circular"
      sx={(theme) => ({
        borderRadius: 0,
        borderTopLeftRadius: '50%',
        borderBottomLeftRadius: '50%',
        borderTopRightRadius: '4px',
        borderBottomRightRadius: '4px',
        top: '65%',
        position: 'fixed',
        right: 0,
        zIndex: theme.zIndex.speedDial,
        boxShadow: theme.customShadows.z1,
        bgcolor: 'background.paper',
        border: `4px solid ${theme.palette.background.paper}`,
        borderRight: 'none',
        '&:hover': {
          bgcolor: 'warning.lighter'
        }
      })}
    >
      <IconButton
        aria-label="settings toggler"
        size="large"
        sx={{ p: 0, width: 30, height: 30, '& svg': { width: 26, height: 26 }, color: 'warning.dark' }}
        color="warning"
      >
        <Badge showZero badgeContent={totalQuantity} color="error">
          <ShoppingCart variant="Bulk" />
        </Badge>
      </IconButton>
    </Fab>
  );
}
