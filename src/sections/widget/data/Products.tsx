'use client';

import { useMemo, useState } from 'react';

// material-ui
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// third-party
import {
  flexRender,
  useReactTable,
  ColumnDef,
  getCoreRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
  getPaginationRowModel
} from '@tanstack/react-table';

// project-imports
import Avatar from 'components/@extended/Avatar';
import MainCard from 'components/MainCard';
import { TablePagination, HeaderSort, DebouncedInput } from 'components/third-party/react-table';
import makeData from 'data/react-table';

// types
import { LabelKeyObject } from 'react-csv/lib/core';
import { TableDataProps } from 'types/table';

// assets
import { ArrowDown, ArrowUp, Star1 } from '@wandersonalwes/iconsax-react';

const productImage = '/assets/images/widget';

interface ReactTableProps {
  columns: ColumnDef<TableDataProps>[];
  data: TableDataProps[];
  title?: string;
}

// ==============================|| REACT TABLE ||============================== //

function ReactTable({ columns, data, title }: ReactTableProps) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');
  const table = useReactTable({
    data,
    columns,
    state: { columnFilters, rowSelection, globalFilter },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
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

  const [age, setAge] = useState('10');
  const handleChange = (event: SelectChangeEvent) => {
    setAge(event.target.value as string);
  };

  return (
    <MainCard content={false} title={title}>
      <Box sx={{ p: 3, pb: 0 }}>
        <Stack direction="row" sx={{ gap: 1, alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h5">Products</Typography>
          <Box sx={{ minWidth: 120 }}>
            <FormControl fullWidth>
              <Select id="demo-simple-select" value={age} onChange={handleChange}>
                <MenuItem value={10}>Today</MenuItem>
                <MenuItem value={20}>Weekly</MenuItem>
                <MenuItem value={30}>Monthly</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Stack>
      </Box>
      <Box sx={{ p: 2.5 }}>
        <DebouncedInput
          value={globalFilter ?? ''}
          onFilterChange={(value) => setGlobalFilter(String(value))}
          placeholder={`Search ${data.length} records...`}
        />
      </Box>
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
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} {...cell.column.columnDef.meta}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
              <TableRow sx={{ '&:hover': { bgcolor: 'transparent !important' } }}>
                <TableCell sx={{ p: 2, py: 3 }} colSpan={9}>
                  <TablePagination
                    {...{
                      setPageSize: table.setPageSize,
                      setPageIndex: table.setPageIndex,
                      getState: table.getState,
                      getPageCount: table.getPageCount,
                      initialPageSize: 4
                    }}
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    </MainCard>
  );
}

// ==============================|| REACT TABLE - BASIC ||============================== //

export default function Products() {
  const data: TableDataProps[] = makeData(10);

  function randomIntFromInterval(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  const columns = useMemo<ColumnDef<TableDataProps>[]>(
    () => [
      {
        header: 'Products',
        accessorKey: 'fatherName',
        cell: ({ row }) => {
          return (
            <Stack direction="row" sx={{ gap: 1.5, alignItems: 'center' }}>
              <Avatar alt="Avatar 1" size="lg" variant="rounded" src={`${productImage}/img-prod-${randomIntFromInterval(1, 4)}.jpg`} />
              <Stack>
                <Typography variant="subtitle1">{row.original.fatherName}</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: { xs: 'none', lg: 'inherit' } }}>
                  Leather panels. Laces. Rounded toe.
                </Typography>
              </Stack>
            </Stack>
          );
        }
      },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: (cell) => {
          switch (cell.getValue()) {
            case 'Complicated':
              return <Chip color="error" label="Close" size="small" sx={{ borderRadius: 1 }} />;
            case 'Relationship':
              return <Chip color="success" label="Active" size="small" sx={{ borderRadius: 1 }} />;
            case 'Single':
            default:
              return <Chip color="warning" label="Pending" size="small" sx={{ borderRadius: 1 }} />;
          }
        }
      },
      {
        header: 'Price',
        accessorKey: 'age',
        cell: ({ row }) => <Typography variant="subtitle1">${row.original.age}</Typography>
      },
      {
        header: 'Sales',
        accessorKey: 'visits',
        cell: ({ row }) => {
          return (
            <Stack direction="row" sx={{ gap: 0.75, alignItems: 'center' }}>
              <Typography variant="subtitle1">{row.original.visits}</Typography>
              <>
                {row.original?.age > 30 ? (
                  <Typography variant="caption" sx={{ color: 'success.main', display: 'flex', alignItems: 'center', gap: 0.25 }}>
                    +{(row.original.age * 3) / 10}
                    <ArrowUp size={12} />
                  </Typography>
                ) : (
                  <Typography variant="caption" sx={{ color: 'error.dark', display: 'flex', alignItems: 'center', gap: 0.25 }}>
                    -{(row.original.age * 3) / 10}
                    <ArrowDown size={12} />
                  </Typography>
                )}
              </>
              <Typography></Typography>
            </Stack>
          );
        }
      },
      {
        header: 'Rating',
        accessorKey: 'progress',
        cell: ({ row }) => {
          return (
            <Stack direction="row" sx={{ gap: 0.5, alignItems: 'center', color: 'warning.main' }}>
              <Star1 variant="Bold" size={18} />
              <Typography variant="subtitle1" sx={{ color: 'text.primary' }}>
                {randomIntFromInterval(1, 10) / 2}
              </Typography>
              <Typography sx={{ color: 'text.secondary' }}>({row.original.progress})</Typography>
            </Stack>
          );
        }
      }
    ],
    []
  );

  return (
    <MainCard content={false}>
      <ReactTable columns={columns} data={data} />
    </MainCard>
  );
}
