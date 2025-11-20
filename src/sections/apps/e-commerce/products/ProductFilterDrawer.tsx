// material-ui
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Drawer from '@mui/material/Drawer';
import Stack from '@mui/material/Stack';

// project-imports
import ProductFilter from './ProductFilter';
import ProductFilterView from './ProductFilterView';
import MainCard from 'components/MainCard';
import SimpleBar from 'components/third-party/SimpleBar';
import { HEADER_HEIGHT } from 'config';
import useConfig from 'hooks/useConfig';

// types
import { ProductsFilter } from 'types/e-commerce';

interface FilterDrawerProps {
  filter: ProductsFilter;
  initialState: ProductsFilter;
  handleDrawerOpen: () => void;
  openFilterDrawer: boolean | undefined;
  setFilter: (filter: ProductsFilter) => void;
  setLoading: (flag: boolean) => void;
}

// ==============================|| PRODUCT - FILTER DRAWER ||============================== //

export default function ProductFilterDrawer({
  filter,
  initialState,
  handleDrawerOpen,
  openFilterDrawer,
  setFilter,
  setLoading
}: FilterDrawerProps) {
  const { container } = useConfig();
  const downLG = useMediaQuery((theme) => theme.breakpoints.down('lg'));
  const theme = useTheme();

  const filterIsEqual = (a1: ProductsFilter, a2: ProductsFilter) =>
    a1 === a2 ||
    (a1.length === a2.length &&
      a1.search === a2.search &&
      a1.sort === a2.sort &&
      a1.price === a2.price &&
      a1.rating === a2.rating &&
      JSON.stringify(a1.gender) === JSON.stringify(a2.gender) &&
      JSON.stringify(a1.categories) === JSON.stringify(a2.categories) &&
      JSON.stringify(a1.colors) === JSON.stringify(a2.colors));

  const handleFilter = (type: string, params: string, rating?: number) => {
    setLoading(true);
    switch (type) {
      case 'gender':
        if (filter.gender.some((item) => item === params)) {
          setFilter({ ...filter, gender: filter.gender.filter((item) => item !== params) });
        } else {
          setFilter({ ...filter, gender: [...filter.gender, params] });
        }
        break;
      case 'categories':
        if (filter.categories.some((item) => item === params)) {
          setFilter({ ...filter, categories: filter.categories.filter((item) => item !== params) });
        } else if (filter.categories.some((item) => item === 'all') || params === 'all') {
          setFilter({ ...filter, categories: [params] });
        } else {
          setFilter({ ...filter, categories: [...filter.categories, params] });
        }

        break;
      case 'colors':
        if (filter.colors.some((item) => item === params)) {
          setFilter({ ...filter, colors: filter.colors.filter((item) => item !== params) });
        } else {
          setFilter({ ...filter, colors: [...filter.colors, params] });
        }
        break;
      case 'price':
        setFilter({ ...filter, price: params });
        break;
      case 'search':
        setFilter({ ...filter, search: params });
        break;
      case 'sort':
        setFilter({ ...filter, sort: params });
        break;
      case 'rating':
        setFilter({ ...filter, rating: rating! });
        break;
      case 'reset':
        setFilter(initialState);
        break;
      default:
      // no options
    }
  };

  const drawerContent = (
    <Stack sx={{ gap: 0.5, p: 3 }}>
      <ProductFilterView filter={filter} filterIsEqual={filterIsEqual} handleFilter={handleFilter} initialState={initialState} />
      <ProductFilter filter={filter} handleFilter={handleFilter} />
    </Stack>
  );

  return (
    <Drawer
      sx={(theme) => ({
        width: 320,
        ...(container && { [theme.breakpoints.only('lg')]: { width: 240 } }),
        flexShrink: 0,
        zIndex: { xs: 1200, lg: 0 },
        mr: 0,
        ...(openFilterDrawer && { [theme.breakpoints.up('md')]: { mr: 2.5 } })
      })}
      slotProps={{
        paper: {
          sx: {
            height: { xs: 1, lg: 'auto' },
            width: 320,
            ...(container && { [theme.breakpoints.only('lg')]: { width: 240 } }),
            boxSizing: 'border-box',
            position: 'relative',
            boxShadow: 'none'
          }
        }
      }}
      variant={downLG ? 'temporary' : 'persistent'}
      anchor="left"
      open={openFilterDrawer}
      ModalProps={{ keepMounted: true }}
      onClose={handleDrawerOpen}
    >
      <MainCard title="Filter" sx={{ borderRadius: '4px 0 0 4px', borderRight: 'none' }} border={!downLG} content={false}>
        {downLG && <SimpleBar sx={{ height: `calc(100vh - ${HEADER_HEIGHT}px)` }}>{drawerContent}</SimpleBar>}
        {!downLG && drawerContent}
      </MainCard>
    </Drawer>
  );
}
