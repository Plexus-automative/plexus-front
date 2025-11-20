'use client';

import { useMemo, useState, Fragment } from 'react';

// material-ui
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// third-party
import { LabelKeyObject } from 'react-csv/lib/core';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState
} from '@tanstack/react-table';

// project-imports
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import IconButton from 'components/@extended/IconButton';
import MainCard from 'components/MainCard';
import { CSVExport, DebouncedInput, HeaderSort, TablePagination } from 'components/third-party/react-table';
import EmptyReactTable from 'views/forms-tables/tables/react-table/EmptyTable';
import AddCustomerModal from 'sections/admin-panel/helpdesk/addCustomerModal';

import { useGetCustomer } from 'api/customer';
import { APP_DEFAULT_PATH } from 'config';

// types
import { CustomerList } from 'types/customer';

// assets
import { Add, Edit2, Trash } from '@wandersonalwes/iconsax-react';

interface Props {
  columns: ColumnDef<CustomerList>[];
  data: CustomerList[];
  modalToggler: () => void;
}

// ==============================|| CUSTOMER - TABLE ||============================== //

function ReactTable({ data, columns, modalToggler }: Props) {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'name', desc: false }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');

  const table = useReactTable({
    data,
    columns,
    state: { columnFilters, sorting, rowSelection, globalFilter },
    enableRowSelection: true,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    getRowCanExpand: () => true,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    debugTable: true
  });

  const headers: LabelKeyObject[] = [];
  table.getAllColumns().map((column) => {
    const accessorKey = (column.columnDef as { accessorKey?: string }).accessorKey;
    headers.push({
      label: typeof column.columnDef.header === 'string' ? column.columnDef.header : '#',
      key: accessorKey ?? ''
    });
  });

  return (
    <MainCard content={false}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        sx={{ gap: 2, p: 3, alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}
      >
        <DebouncedInput
          value={globalFilter ?? ''}
          onFilterChange={(value) => setGlobalFilter(String(value))}
          placeholder={`Search ${data.length} records...`}
          sx={{ width: { xs: 1, sm: 'auto' } }}
        />
        <Stack
          direction="row"
          sx={{ width: { xs: 1, sm: 'auto' }, gap: 2, alignItems: 'center', justifyContent: { xs: 'space-between', sm: 'flex-end' } }}
        >
          <Button variant="contained" startIcon={<Add />} onClick={modalToggler} size="large">
            Add Customer
          </Button>
          <CSVExport {...{ data: table.getSelectedRowModel().flatRows.map((row) => row.original), headers, filename: 'customer.csv' }} />
        </Stack>
      </Stack>
      <Stack>
        <TableContainer>
          <Table>
            <TableHead>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableCell key={header.id} {...header.column.columnDef.meta}>
                        {header.isPlaceholder ? null : (
                          <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {header.column.getCanSort() && <HeaderSort column={header.column} />}
                          </Stack>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableHead>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <Fragment key={row.id}>
                  <TableRow>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} {...cell.column.columnDef.meta}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                </Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <>
          <Divider />
          <Box sx={{ p: 2 }}>
            <TablePagination
              {...{
                setPageSize: table.setPageSize,
                setPageIndex: table.setPageIndex,
                getState: table.getState,
                getPageCount: table.getPageCount
              }}
            />
          </Box>
        </>
      </Stack>
    </MainCard>
  );
}
// ==============================|| HELPDESK - CUSTOMER ||============================== //

export default function CustomerPage() {
  const { customersLoading: loading, customers: lists } = useGetCustomer();
  const [customerModal, setCustomerModal] = useState<boolean>(false);

  const columns = useMemo<ColumnDef<CustomerList>[]>(
    () => [
      {
        header: 'Name',
        accessorKey: 'name',
        cell: ({ getValue }) => <Typography>{getValue() as string}</Typography>
      },
      {
        header: 'Email',
        accessorKey: 'email',
        cell: ({ row }) => <Typography sx={{ color: 'text.secondary' }}>{row.original.email as string}</Typography>
      },
      {
        header: 'Account',
        cell: () => <Typography>N/A</Typography>
      },
      {
        header: 'LastLogin',
        cell: ({ row }) => (
          <Stack>
            <Typography>{row.original.date instanceof Date ? row.original.date.toLocaleDateString() : row.original.date}</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {row.original.time}
            </Typography>
          </Stack>
        )
      },
      {
        header: 'Actions',
        meta: { align: 'center' },
        disableSortBy: true,
        cell: () => {
          return (
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'center' }}>
              <Tooltip title="Edit">
                <IconButton color="primary">
                  <Edit2 />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton color="error">
                  <Trash />
                </IconButton>
              </Tooltip>
            </Stack>
          );
        }
      }
    ],
    []
  );

  const breadcrumbLinks = [
    { title: 'home', to: APP_DEFAULT_PATH },
    { title: 'helpdesk', to: '/admin-panel/helpdesk/customer' },
    { title: 'customer' }
  ];

  if (loading) return <EmptyReactTable />;

  return (
    <>
      <Breadcrumbs custom heading="helpdesk customer" links={breadcrumbLinks} />
      <ReactTable
        {...{
          data: lists,
          columns,
          modalToggler: () => {
            setCustomerModal(true);
          }
        }}
      />
      <AddCustomerModal open={customerModal} modalToggler={setCustomerModal} />
    </>
  );
}
