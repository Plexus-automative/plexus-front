'use client';

import { useMemo, useState, Fragment, MouseEvent } from 'react';

// material-ui
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
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
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import Dot from 'components/@extended/Dot';
import IconButton from 'components/@extended/IconButton';
import MainCard from 'components/MainCard';

import {
  CSVExport,
  DebouncedInput,
  HeaderSort,
  RowSelection,
  SelectColumnSorting,
  TablePagination
} from 'components/third-party/react-table';

import { useGetCustomer } from 'api/customer';
import { APP_DEFAULT_PATH } from 'config';
import EmptyReactTable from 'views/forms-tables/tables/react-table/EmptyTable';
import AlertMembershipDelete from 'sections/admin-panel/membership/list/AlertMembershipDelete';

// types
import { CustomerList } from 'types/customer';

// assets
import { Add, Edit, Eye, Trash } from '@wandersonalwes/iconsax-react';

const avatarImage = '/assets/images/users';

interface Props {
  columns: ColumnDef<CustomerList>[];
  data: CustomerList[];
}

// ==============================|| REACT TABLE - LIST ||============================== //

function ReactTable({ data, columns }: Props) {
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
          <SelectColumnSorting {...{ getState: table.getState, getAllColumns: table.getAllColumns, setSorting }} />
          <Button variant="contained" startIcon={<Add />} size="large">
            Add
          </Button>
          <CSVExport {...{ data: table.getRowModel().flatRows.map((row) => row.original), headers, filename: 'membership-list.csv' }} />
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

// ==============================|| MEMBERSHIP LIST ||============================== //

export default function MembershipList() {
  const { customersLoading: loading, customers: lists } = useGetCustomer();

  const [open, setOpen] = useState<boolean>(false);
  const [membershipDeleteId, setMembershipDeleteId] = useState<any>('');

  const handleClose = () => {
    setOpen(!open);
  };

  const columns = useMemo<ColumnDef<CustomerList>[]>(
    () => [
      {
        header: 'Name',
        accessorKey: 'name',
        cell: ({ row, getValue }) => (
          <Stack direction="row" sx={{ gap: 1.5, alignItems: 'center' }}>
            <Avatar alt="Avatar" size="md" src={`${avatarImage}/avatar-${!row.original.avatar ? 1 : row.original.avatar}.png`} />
            <Typography variant="body1">{getValue() as string}</Typography>
          </Stack>
        )
      },
      {
        header: 'Mobile',
        accessorKey: 'contact',
        cell: ({ getValue }) => <PatternFormat displayType="text" format="(###) ### ####" mask="_" defaultValue={getValue() as number} />
      },
      {
        header: 'Start Date',
        accessorKey: 'date',
        cell: ({ getValue }) => (
          <Stack>
            <PatternFormat displayType="text" format="##/##/####" mask="/" defaultValue={getValue() as number} />
            <Typography variant="caption" sx={{ color: 'secondary.500' }}>
              <PatternFormat displayType="text" format="0#:#5 PM" mask="_" defaultValue={getValue() as number} />
            </Typography>
          </Stack>
        )
      },
      {
        header: 'Status',
        accessorKey: 'progress',
        cell: ({ row }) => (
          <Stack direction="row" sx={{ gap: 0.5, alignItems: 'center' }}>
            <Dot color={row.original.progress > 50 ? 'success' : 'secondary'} size={6} />
            <Typography sx={{ color: row.original.progress > 50 ? 'success.main' : 'secondary.main' }} variant="caption">
              {row.original.progress > 50 ? 'Active' : 'Inactive'}
            </Typography>
          </Stack>
        )
      },
      {
        header: 'Plan',
        accessorKey: 'status',
        cell: (cell) => {
          switch (cell.getValue()) {
            case 3:
              return <Chip variant="light" color="warning" label="Diehard" size="small" />;
            case 1:
              return <Chip variant="light" color="success" label="Casual" size="small" />;
            case 2:
            default:
              return <Chip variant="light" color="primary" label="Addicted" size="small" />;
          }
        }
      },
      {
        header: 'Actions',
        meta: { align: 'center' },
        disableSortBy: true,
        cell: ({ row }) => {
          return (
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'center' }}>
              <Tooltip title="View">
                <IconButton color="secondary" shape="rounded">
                  <Eye />
                </IconButton>
              </Tooltip>
              <Tooltip title="Edit">
                <IconButton color="primary" shape="rounded">
                  <Edit />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton
                  color="error"
                  onClick={(e: MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                    handleClose();
                    setMembershipDeleteId(Number(row.original.id));
                  }}
                  shape="rounded"
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

  if (loading) return <EmptyReactTable />;

  const breadcrumbLinks = [
    { title: 'home', to: APP_DEFAULT_PATH },
    { title: 'membership', to: '/admin-panel/membership/dashboard' },
    { title: 'list' }
  ];

  return (
    <>
      <Breadcrumbs custom heading="membership list" links={breadcrumbLinks} />
      <ReactTable {...{ data: lists, columns }} />
      <AlertMembershipDelete id={Number(membershipDeleteId)} open={open} handleClose={handleClose} />
    </>
  );
}
