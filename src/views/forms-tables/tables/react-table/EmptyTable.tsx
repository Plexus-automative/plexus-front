'use client';

import { useMemo, useState } from 'react';

// material-ui
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableFooter from '@mui/material/TableFooter';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

// third-party
import {
  getCoreRowModel,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedMinMaxValues,
  getFacetedUniqueValues,
  flexRender,
  useReactTable,
  ColumnDef,
  ColumnFiltersState
} from '@tanstack/react-table';

// project-imports
import MainCard from 'components/MainCard';
import { CSVExport, DebouncedInput, EmptyTable, Filter } from 'components/third-party/react-table';
import makeData from 'data/react-table';

// types
import { TableDataProps } from 'types/table';

interface ReactTableProps {
  columns: ColumnDef<TableDataProps>[];
  data: TableDataProps[];
}

// ==============================|| REACT TABLE ||============================== //

function ReactTable({ columns, data }: ReactTableProps) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const table = useReactTable({
    data,
    columns,
    state: { columnFilters, globalFilter },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter
  });

  return (
    <MainCard content={false}>
      <Stack direction="row" sx={{ gap: 2, alignItems: 'center', justifyContent: 'space-between', padding: 2 }}>
        <DebouncedInput
          value={globalFilter ?? ''}
          onFilterChange={(value) => setGlobalFilter(String(value))}
          placeholder={`Search ${data.length} records...`}
        />
        <CSVExport data={data} filename={'empty-table.csv'} />
      </Stack>
      <TableContainer>
        <Table>
          <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableCell key={header.id} {...header.column.columnDef.meta}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableCell key={header.id} {...header.column.columnDef.meta}>
                    {header.column.getCanFilter() && <Filter column={header.column} table={table} />}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} {...cell.column.columnDef.meta}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow sx={{ '&.MuiTableRow-root:hover': { bgcolor: 'transparent' } }}>
                <TableCell colSpan={table.getAllColumns().length}>
                  <EmptyTable msg="No Data" />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          <TableFooter>
            {table.getFooterGroups().map((footerGroup) => (
              <TableRow key={footerGroup.id}>
                {footerGroup.headers.map((footer) => (
                  <TableCell key={footer.id} {...footer.column.columnDef.meta}>
                    {footer.isPlaceholder ? null : flexRender(footer.column.columnDef.header, footer.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableFooter>
        </Table>
      </TableContainer>
    </MainCard>
  );
}

// ==============================|| REACT TABLE - EMPTY ||============================== //

export default function EmptyTables() {
  const data: TableDataProps[] = useMemo(() => makeData(0), []);

  const columns = useMemo<ColumnDef<TableDataProps>[]>(
    () => [
      { header: 'First Name', footer: 'First Name', accessorKey: 'firstName' },
      { header: 'Last Name', footer: 'Last Name', accessorKey: 'lastName' },
      { header: 'Email', footer: 'Email', accessorKey: 'email' },
      { header: 'Role', footer: 'Role', accessorKey: 'role' },
      { header: 'Age', footer: 'Age', accessorKey: 'age', meta: { align: 'right' } },
      { header: 'Visits', footer: 'Visits', accessorKey: 'visits', meta: { align: 'right' } },
      { header: 'Status', footer: 'Status', accessorKey: 'status' },
      { header: 'Profile Progress', footer: 'Profile Progress', accessorKey: 'progress' }
    ],
    []
  );

  return <ReactTable columns={columns} data={data} />;
}
