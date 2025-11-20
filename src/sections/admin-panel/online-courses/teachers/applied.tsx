'use client';

import { useMemo, useState, Fragment } from 'react';

// material-ui
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import CardMedia from '@mui/material/CardMedia';
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
import { useGetCustomer } from 'api/customer';

import Avatar from 'components/@extended/Avatar';
import IconButton from 'components/@extended/IconButton';
import MoreIcon from 'components/@extended/MoreIcon';
import MainCard from 'components/MainCard';

import EmptyReactTable from 'views/forms-tables/tables/react-table/EmptyTable';

import { CSVExport, DebouncedInput, HeaderSort, RowSelection, TablePagination } from 'components/third-party/react-table';

// types
import { CustomerList } from 'types/customer';

// assets
import { Add } from '@wandersonalwes/iconsax-react';
const CheckIcon = '/assets/images/online-panel/check2.svg';

const avatarImage = '/assets/images/users';

interface Props {
  columns: ColumnDef<CustomerList>[];
  data: CustomerList[];
}

// ==============================|| REACT TABLE ||============================== //

function ReactTable({ data, columns }: Props) {
  const downMD = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));

  const [sorting, setSorting] = useState<SortingState>([{ id: 'date', desc: false }]);
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
      <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', p: 3 }}>
        <DebouncedInput
          value={globalFilter ?? ''}
          onFilterChange={(value) => setGlobalFilter(String(value))}
          placeholder={`Search ${data.length} records...`}
          {...(downMD && { size: 'small' })}
        />
        <CSVExport
          {...{
            data: table.getSelectedRowModel().flatRows.map((row) => row.original),
            headers,
            filename: 'teacher-applied.csv'
          }}
        />
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

// ==============================|| ONLINE COURSES - APPLIED TEACHER ||============================== //

export default function AppliedTeacher() {
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
      { header: 'Department', accessorKey: 'role' },
      {
        header: 'Mobile',
        accessorKey: 'contact',
        cell: ({ getValue }) => <PatternFormat displayType="text" format="+1 (###) ###-####" mask="_" defaultValue={getValue() as number} />
      },
      {
        header: 'Date/Time',
        accessorKey: 'date',
        cell: ({ getValue }) => (
          <Stack>
            <PatternFormat displayType="text" format="##/##/####" mask="/" defaultValue={getValue() as number} />
            <Typography variant="caption" sx={{ color: 'secondary.500' }}>
              <PatternFormat displayType="text" format="0#:#5 AM" mask="_" defaultValue={getValue() as number} />
            </Typography>
          </Stack>
        )
      },
      {
        header: 'Actions',
        meta: { align: 'center' },
        disableSortBy: true,
        cell: () => (
          <Stack direction="row" sx={{ gap: 0.5, alignItems: 'center', justifyContent: 'center' }}>
            <Tooltip title="Accept">
              <IconButton color="success" sx={{ '&:hover': { bgcolor: 'transparent' } }}>
                <CardMedia component="img" sx={{ width: 16, height: 16 }} src={CheckIcon} alt="check" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Reject">
              <IconButton color="error" sx={{ '&:hover': { bgcolor: 'transparent' } }}>
                <Add style={{ transform: 'rotate(45deg)' }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="More">
              <IconButton color="secondary" sx={{ '&:hover': { bgcolor: 'transparent' } }}>
                <MoreIcon />
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
