'use client';

import { useState, useEffect } from 'react';

// material-ui
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Pagination from '@mui/material/Pagination';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Slide from '@mui/material/Slide';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project-imports
import EmptyUserCard from 'components/cards/skeleton/EmptyUserCard';
import { DebouncedInput } from 'components/third-party/react-table';
import CustomerCard from 'sections/apps/customer/CustomerCard';
import CustomerModal from 'sections/apps/customer/CustomerModal';

import { useGetCustomer } from 'api/customer';
import { GRID_COMMON_SPACING } from 'config';
import usePagination from 'hooks/usePagination';

// assets
import { Add, SearchNormal1 } from '@wandersonalwes/iconsax-react';

// types
import { CustomerList } from 'types/customer';

// ==============================|| CUSTOMER - CARD ||============================== //

const allColumns = [
  { id: 1, header: 'Default' },
  { id: 2, header: 'Customer Name' },
  { id: 3, header: 'Email' },
  { id: 4, header: 'Contact' },
  { id: 5, header: 'Age' },
  { id: 6, header: 'Country' },
  { id: 7, header: 'Status' }
];

function dataSort(data: CustomerList[], sortBy: string) {
  return [...data].sort((a, b) => {
    switch (sortBy) {
      case 'Customer Name':
        return (a.name ?? '').localeCompare(b.name ?? '');
      case 'Email':
        return (a.email ?? '').localeCompare(b.email ?? '');
      case 'Contact':
        return (a.contact ?? '').localeCompare(b.contact ?? '');
      case 'Age':
        return (a.age ?? 0) - (b.age ?? 0);
      case 'Country':
        return (a.country ?? '').localeCompare(b.country ?? '');
      case 'Status':
        return (a.status ?? 0) - (b.status ?? 0);
      default:
        return 0;
    }
  });
}

export default function CustomerCardPage() {
  const { customers: lists } = useGetCustomer();

  const [sortBy, setSortBy] = useState('Default');
  const [globalFilter, setGlobalFilter] = useState('');
  const [userCard, setUserCard] = useState<CustomerList[]>([]);
  const [page, setPage] = useState(1);
  const [customerLoading, setCustomerLoading] = useState<boolean>(true);
  const [customerModal, setCustomerModal] = useState<boolean>(false);

  const handleChange = (event: SelectChangeEvent) => {
    setSortBy(event.target.value as string);
  };

  // search
  useEffect(() => {
    setCustomerLoading(true);
    if (lists && Array.isArray(lists) && lists.length > 0) {
      const newData = lists.filter((value: CustomerList) =>
        globalFilter ? value.name?.toLowerCase().includes(globalFilter.toLowerCase()) : true
      );
      setUserCard(dataSort(newData, sortBy));
    } else {
      setUserCard([]);
    }

    setCustomerLoading(false);
  }, [globalFilter, lists, sortBy]);

  const PER_PAGE = 6;

  const count = Math.ceil(userCard.length / PER_PAGE);
  const _DATA = usePagination(userCard, PER_PAGE);

  const handleChangePage = (e: any, p: any) => {
    setPage(p);
    _DATA.jump(p);
  };

  return (
    <>
      <Box sx={{ position: 'relative', marginBottom: 3 }}>
        <Stack direction="row" sx={{ alignItems: 'center' }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ gap: 1, justifyContent: 'space-between', alignItems: 'center', width: 1 }}>
            <DebouncedInput
              value={globalFilter ?? ''}
              onFilterChange={(value) => setGlobalFilter(String(value))}
              placeholder={`Search ${userCard.length} records...`}
              startAdornment={<SearchNormal1 size={18} />}
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ gap: 1, alignItems: 'center' }}>
              <FormControl sx={{ m: '8px !important', minWidth: 120 }}>
                <Select
                  value={sortBy}
                  onChange={handleChange}
                  displayEmpty
                  slotProps={{ input: { 'aria-label': 'Without label' } }}
                  renderValue={(selected) =>
                    selected ? (
                      <Typography variant="subtitle2">Sort by ({sortBy})</Typography>
                    ) : (
                      <Typography variant="subtitle1">Sort By</Typography>
                    )
                  }
                >
                  {allColumns.map((column) => (
                    <MenuItem key={column.id} value={column.header}>
                      {column.header}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button variant="contained" onClick={() => setCustomerModal(true)} size="large" startIcon={<Add />}>
                Add Customer
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </Box>
      <Grid
        container
        spacing={GRID_COMMON_SPACING}
        sx={{ ...(!(!customerLoading && userCard.length > 0) && { justifyContent: 'center' }) }}
      >
        {!customerLoading && userCard.length > 0 ? (
          _DATA.currentData().map((user: CustomerList, index: number) => (
            <Slide key={index} direction="up" in={true} timeout={50}>
              <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                <CustomerCard customer={user} />
              </Grid>
            </Slide>
          ))
        ) : (
          <EmptyUserCard title={customerLoading ? 'Loading...' : 'You have not created any customer yet.'} />
        )}
      </Grid>
      <Stack sx={{ gap: 2, alignItems: 'flex-end', p: 2.5 }}>
        <Pagination
          sx={{ '& .MuiPaginationItem-root': { my: 0.5 } }}
          count={count}
          size="medium"
          page={page}
          showFirstButton
          showLastButton
          variant="combined"
          color="primary"
          onChange={handleChangePage}
        />
      </Stack>
      <CustomerModal open={customerModal} modalToggler={setCustomerModal} />
    </>
  );
}
