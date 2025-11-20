'use client';

import Link from 'next/link';
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
import { LabelKeyObject } from 'react-csv/lib/core';

// project-import
import MainCard from 'components/MainCard';
import Avatar from 'components/@extended/Avatar';
import IconButton from 'components/@extended/IconButton';
import EmptyReactTable from 'views/forms-tables/tables/react-table/EmptyTable';

import { CSVExport, DebouncedInput, HeaderSort, RowSelection, TablePagination } from 'components/third-party/react-table';

import { useGetCustomer } from 'api/customer';

// types
import { CustomerList } from 'types/customer';

// assets
import { Add, Edit, Eye, Trash } from '@wandersonalwes/iconsax-react';

const avatarImage = '/assets/images/users';

interface Props {
  columns: ColumnDef<CustomerList>[];
  data: CustomerList[];
}

// ==============================|| REACT TABLE ||============================== //

function ReactTable({ data, columns }: Props) {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'date', desc: true }]);
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
      <Stack direction="row" sx={{ gap: 2, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', p: 3 }}>
        <DebouncedInput
          value={globalFilter ?? ''}
          onFilterChange={(value) => setGlobalFilter(String(value))}
          placeholder={`Search ${data.length} records...`}
        />

        <Stack direction="row" sx={{ gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <Button size="large" variant="outlined" component={Link} href={'/admin-panel/online-course/student/apply'}>
            Applied Student List
          </Button>
          <Button variant="contained" startIcon={<Add />} size="large" component={Link} href={'/admin-panel/online-course/student/add'}>
            Add Student
          </Button>
          <CSVExport
            {...{
              data: table.getSelectedRowModel().flatRows.map((row) => row.original),
              headers,
              filename: 'student-list.csv'
            }}
          />
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

// ==============================|| ONLINE COURSES - STUDENT LIST ||============================== //

export default function StudentList() {
  const { customersLoading: loading, customers: lists } = useGetCustomer();

  const columns = useMemo<ColumnDef<CustomerList>[]>(
    () => [
      {
        header: 'Name',
        accessorKey: 'name',
        cell: ({ row, getValue }) => (
          <Stack direction="row" sx={{ gap: 1.5, alignItems: 'center' }}>
            <Avatar alt="Avatar" src={`${avatarImage}/avatar-${!row.original.avatar ? 1 : row.original.avatar}.png`} />
            <Typography>{getValue() as string}</Typography>
          </Stack>
        )
      },
      {
        header: 'Mobile',
        accessorKey: 'contact',
        cell: ({ getValue }) => <PatternFormat displayType="text" format="+1 (###) ###-####" mask="_" defaultValue={getValue() as number} />
      },
      { header: 'Email', accessorKey: 'email' },
      {
        header: 'Admission Date',
        accessorKey: 'date',
        cell: ({ getValue }) => <PatternFormat displayType="text" format="##/##/####" mask="/" defaultValue={getValue() as number} />
      },
      {
        header: 'Actions',
        meta: { align: 'center' },
        disableSortBy: true,
        cell: () => (
          <Stack direction="row" sx={{ gap: 0.5, alignItems: 'center', justifyContent: 'center' }}>
            <Tooltip title="View">
              <IconButton color="secondary">
                <Eye />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit">
              <IconButton color="primary">
                <Edit />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton color="error">
                <Trash />
              </IconButton>
            </Tooltip>
          </Stack>
        )
      }
    ],
    []
  );

  if (loading) return <EmptyReactTable />;

  return <ReactTable {...{ data: lists, columns }} />;
}
