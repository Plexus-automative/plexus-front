import { useState, ChangeEvent, MouseEvent } from 'react';

// material-ui
import useMediaQuery from '@mui/material/useMediaQuery';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

// types
import { ProductsFilter } from 'types/e-commerce';

// project-imports
import MainCard from 'components/MainCard';
import SortOptions from 'sections/apps/e-commerce/products/SortOptions';

// assets
import { ArrowDown2, FilterSearch, SearchNormal1 } from '@wandersonalwes/iconsax-react';

interface ProductHeaderProps {
  handleDrawerOpen: () => void;
  setFilter: (filter: ProductsFilter) => void;
  filter: ProductsFilter;
}

// ==============================|| PRODUCT - HEADER ||============================== //

export default function ProductsHeader({ filter, handleDrawerOpen, setFilter }: ProductHeaderProps) {
  const downSM = useMediaQuery((theme) => theme.breakpoints.down('sm'));

  // sort options
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openSort = Boolean(anchorEl);
  const handleClickListItem = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // search filter
  const handleSearch = async (event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement> | undefined) => {
    const newString = event?.target.value;
    setFilter({ ...filter, search: newString! });
  };

  // sort filter
  const handleMenuItemClick = (event: MouseEvent<HTMLElement>, index: string) => {
    setFilter({ ...filter, sort: index });
    setAnchorEl(null);
  };

  const sortLabel = SortOptions.filter((items) => items.value === filter.sort);

  return (
    <MainCard content={false}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ alignItems: { xs: 'space-between', sm: 'center' }, justifyContent: { xs: 'center', sm: 'space-between' }, p: 2 }}
      >
        <Stack direction="row" sx={{ gap: 0.5, alignItems: 'center', justifyContent: 'space-between' }}>
          <Button onClick={handleDrawerOpen} color="secondary" startIcon={<FilterSearch style={{ color: 'secondary.200' }} />} size="large">
            Filter
          </Button>

          <TextField
            value={filter.search}
            placeholder="Search Product"
            size="medium"
            onChange={handleSearch}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchNormal1 size={18} />
                  </InputAdornment>
                )
              },
              htmlInput: { sx: { pl: 0 } }
            }}
          />
        </Stack>
        <Button
          id="demo-positioned-button"
          aria-controls="demo-positioned-menu"
          aria-haspopup="true"
          aria-expanded={openSort ? 'true' : undefined}
          onClick={handleClickListItem}
          variant="outlined"
          size="large"
          color="secondary"
          endIcon={<ArrowDown2 style={{ fontSize: 'small' }} />}
          sx={{ color: 'text.primary' }}
        >
          {sortLabel.length > 0 && sortLabel[0].label}
        </Button>
        <Menu
          id="demo-positioned-menu"
          aria-labelledby="demo-positioned-button"
          anchorEl={anchorEl}
          open={openSort}
          onClose={handleClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: downSM ? 'center' : 'right' }}
          transformOrigin={{
            vertical: 'top',
            horizontal: downSM ? 'center' : 'right'
          }}
        >
          {SortOptions.map((option, index) => (
            <MenuItem
              sx={{ p: 1.5 }}
              key={index}
              selected={option.value === filter.sort}
              onClick={(event) => handleMenuItemClick(event, option.value)}
            >
              {option.label}
            </MenuItem>
          ))}
        </Menu>
      </Stack>
    </MainCard>
  );
}
