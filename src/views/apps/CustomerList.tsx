'use client';

import { useMemo, useState, Fragment, MouseEvent } from 'react';

// material-ui
import { alpha } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
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
import { PatternFormat } from 'react-number-format';
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
import Avatar from 'components/@extended/Avatar';
import IconButton from 'components/@extended/IconButton';
import MainCard from 'components/MainCard';

import {
  CSVExport,
  DebouncedInput,
  HeaderSort,
  IndeterminateCheckbox,
  RowSelection,
  SelectColumnSorting,
  TablePagination
} from 'components/third-party/react-table';

import AlertCustomerDelete from 'sections/apps/customer/AlertCustomerDelete';
import CustomerModal from 'sections/apps/customer/CustomerModal';
import CustomerView from 'sections/apps/customer/CustomerView';
import EmptyTables from 'views/forms-tables/tables/react-table/EmptyTable';

import { useGetCustomer } from 'api/customer';

// types
import { CustomerList } from 'types/customer';

// assets
import { Add, Edit, Eye, Trash } from '@wandersonalwes/iconsax-react';

const avatarImage = '/assets/images/users';

interface Props {
  columns: ColumnDef<CustomerList>[];
  data: CustomerList[];
  modalToggler: () => void;
}

// ==============================|| REACT TABLE - LIST ||============================== //

function ReactTable({ data, columns, modalToggler }: Props) {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'name', desc: false }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | number>('');

  const filteredData = useMemo(() => {
    if (statusFilter === '') return data;
    return data.filter((customer) => customer.status === statusFilter);
  }, [statusFilter, data]);

  const table = useReactTable({
    data: filteredData,
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
        sx={(theme) => ({
          gap: 2,
          justifyContent: 'space-between',
          p: 3,
          [theme.breakpoints.down('sm')]: { '& .MuiOutlinedInput-root, & .MuiFormControl-root': { width: '100%' } }
        })}
      >
        <DebouncedInput
          value={globalFilter ?? ''}
          onFilterChange={(value) => setGlobalFilter(String(value))}
          placeholder={`Search ${data.length} records...`}
        />

        <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ gap: 2, alignItems: 'center' }}>
          <Select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            displayEmpty
            slotProps={{ input: { 'aria-label': 'Status Filter' } }}
          >
            <MenuItem value="">All Status</MenuItem>
            <MenuItem value={1}>Verified</MenuItem>
            <MenuItem value={2}>Pending</MenuItem>
            <MenuItem value={3}>Rejected</MenuItem>
          </Select>
          <SelectColumnSorting {...{ getState: table.getState, getAllColumns: table.getAllColumns, setSorting }} />
          <Stack direction="row" sx={{ gap: 2, alignItems: 'center' }}>
            <Button variant="contained" startIcon={<Add />} onClick={modalToggler} size="large">
              Add Customer
            </Button>
            <CSVExport
              {...{
                data:
                  table.getSelectedRowModel().flatRows.map((row) => row.original).length === 0
                    ? data
                    : table.getSelectedRowModel().flatRows.map((row) => row.original),
                headers,
                filename: 'customer-list.csv'
              }}
            />
          </Stack>
        </Stack>
      </Stack>
      <Stack>
        <RowSelection selected={Object.keys(rowSelection).length} />
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
                            <Box>{flexRender(header.column.columnDef.header, header.getContext())}</Box>
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
                  {row.getIsExpanded() && (
                    <TableRow
                      sx={(theme) => ({
                        bgcolor: alpha(theme.palette.primary.lighter, 0.1),
                        ...theme.applyStyles('dark', { bgcolor: alpha(theme.palette.secondary.light, 0.25) }),
                        '&:hover': {
                          bgcolor: `${alpha(theme.palette.primary.lighter, 0.1)} !important`,
                          ...theme.applyStyles('dark', { bgcolor: `${alpha(theme.palette.secondary.light, 0.25)} !important` })
                        }
                      })}
                    >
                      <TableCell colSpan={row.getVisibleCells().length} sx={{ p: 2.5, overflow: 'hidden' }}>
                        <CustomerView data={row.original} />
                      </TableCell>
                    </TableRow>
                  )}
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
// ==============================|| CUSTOMER LIST ||============================== //

export default function CustomerListPage() {
  const { customersLoading: loading, customers: lists } = useGetCustomer();

  const [open, setOpen] = useState<boolean>(false);

  const [customerModal, setCustomerModal] = useState<boolean>(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerList | null>(null);
  const [customerDeleteId, setCustomerDeleteId] = useState<any>('');

  const handleClose = () => {
    setOpen(!open);
  };

  const columns = useMemo<ColumnDef<CustomerList>[]>(
    () => [
      {
        id: 'Row Selection',
        header: ({ table }) => (
          <IndeterminateCheckbox
            {...{
              checked: table.getIsAllRowsSelected(),
              indeterminate: table.getIsSomeRowsSelected(),
              onChange: table.getToggleAllRowsSelectedHandler()
            }}
          />
        ),
        cell: ({ row }) => (
          <IndeterminateCheckbox
            {...{
              checked: row.getIsSelected(),
              disabled: !row.getCanSelect(),
              indeterminate: row.getIsSomeSelected(),
              onChange: row.getToggleSelectedHandler()
            }}
          />
        )
      },
      { header: '#', accessorKey: 'id', meta: { align: 'center' } },
      {
        header: 'Customer Name',
        accessorKey: 'name',
        cell: ({ row, getValue }) => (
          <Stack direction="row" sx={{ gap: 1.5, alignItems: 'center' }}>
            <Avatar alt="Avatar" size="sm" src={`${avatarImage}/avatar-${!row.original.avatar ? 1 : row.original.avatar}.png`} />
            <Stack>
              <Typography variant="subtitle1">{getValue() as string}</Typography>
              <Typography sx={{ color: 'text.secondary' }}>{row.original.email as string}</Typography>
            </Stack>
          </Stack>
        )
      },
      {
        header: 'Contact',
        accessorKey: 'contact',
        cell: ({ getValue }) => <PatternFormat displayType="text" format="+1 (###) ###-####" mask="_" defaultValue={getValue() as number} />
      },
      { header: 'Age', accessorKey: 'age', meta: { align: 'right' } },
      { header: 'Country', accessorKey: 'country' },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: (cell) => {
          switch (cell.getValue()) {
            case 3:
              return <Chip color="error" label="Rejected" size="small" variant="light" />;
            case 1:
              return <Chip color="success" label="Verified" size="small" variant="light" />;
            case 2:
            default:
              return <Chip color="info" label="Pending" size="small" variant="light" />;
          }
        }
      },
      {
        header: 'Actions',
        meta: { align: 'center' },
        disableSortBy: true,
        cell: ({ row }) => {
          const collapseIcon =
            row.getCanExpand() && row.getIsExpanded() ? (
              <Box component="span" sx={{ color: 'error.main' }}>
                <Add style={{ transform: 'rotate(45deg)' }} />
              </Box>
            ) : (
              <Eye />
            );
          return (
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'center' }}>
              <Tooltip title="View">
                <IconButton color="secondary" onClick={row.getToggleExpandedHandler()}>
                  {collapseIcon}
                </IconButton>
              </Tooltip>
              <Tooltip title="Edit">
                <IconButton
                  color="primary"
                  sx={(theme) => ({ ':hover': { ...theme.applyStyles('dark', { color: 'text.primary' }) } })}
                  onClick={(e: MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                    setSelectedCustomer(row.original);
                    setCustomerModal(true);
                  }}
                >
                  <Edit />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton
                  color="error"
                  sx={(theme) => ({ ':hover': { ...theme.applyStyles('dark', { color: 'text.primary' }) } })}
                  onClick={(e: MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                    handleClose();
                    setCustomerDeleteId(Number(row.original.id));
                  }}
                >
                  <Trash />
                </IconButton>
              </Tooltip>
            </Stack>
          );
        }
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  if (loading) return <EmptyTables />;

  return (
    <>
      <ReactTable
        {...{
          data: lists,
          columns,
          modalToggler: () => {
            setCustomerModal(true);
            setSelectedCustomer(null);
          }
        }}
      />
      <AlertCustomerDelete id={Number(customerDeleteId)} title={customerDeleteId} open={open} handleClose={handleClose} />
      <CustomerModal open={customerModal} modalToggler={setCustomerModal} customer={selectedCustomer} />
    </>
  );
}
