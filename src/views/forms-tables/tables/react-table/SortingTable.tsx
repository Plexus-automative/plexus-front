'use client';

import { useMemo, useState } from 'react';

// material-ui
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

// third-party
import { getCoreRowModel, getSortedRowModel, flexRender, useReactTable, ColumnDef, SortingState } from '@tanstack/react-table';

// project-imports
import LinearWithLabel from 'components/@extended/progress/LinearWithLabel';
import MainCard from 'components/MainCard';
import { CSVExport, HeaderSort, SelectColumnSorting, StatusPill } from 'components/third-party/react-table';
import makeData from 'data/react-table';

// types
import { LabelKeyObject } from 'react-csv/lib/core';
import { TableDataProps } from 'types/table';

interface ReactTableProps {
  columns: ColumnDef<TableDataProps>[];
  data: TableDataProps[];
}

// ==============================|| REACT TABLE ||============================== //

function ReactTable({ columns, data }: ReactTableProps) {
  const downSM = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));
  const [sorting, setSorting] = useState<SortingState>([{ id: 'age', desc: false }]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel()
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
    <MainCard
      title={downSM ? 'Sorting' : 'Sorting Table'}
      content={false}
      secondary={
        <Stack direction="row" sx={{ gap: { xs: 1, sm: 2 }, alignItems: 'center' }}>
          <SelectColumnSorting getState={table.getState} getAllColumns={table.getAllColumns} setSorting={setSorting} />
          <CSVExport {...{ data: table.getSortedRowModel().rows.map((d) => d.original), headers, filename: 'sorting.csv' }} />
        </Stack>
      }
    >
      <TableContainer>
        <Table>
          <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableCell key={header.id} {...header.column.columnDef.meta}>
                    {header.isPlaceholder ? null : (
                      <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && <HeaderSort column={header.column} />}
                      </Stack>
                    )}
                  </TableCell>
                ))}
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
          </TableBody>
        </Table>
      </TableContainer>
    </MainCard>
  );
}

// ==============================|| REACT TABLE - SORTING ||============================== //

export default function SortingTable() {
  const data: TableDataProps[] = makeData(10);

  const columns = useMemo<ColumnDef<TableDataProps>[]>(
    () => [
      { header: 'First Name', accessorKey: 'firstName' },
      { header: 'Last Name', accessorKey: 'lastName' },
      { header: 'Email', accessorKey: 'email' },
      { header: 'Age', accessorKey: 'age', meta: { align: 'right' } },
      { header: 'Role', accessorKey: 'role' },
      { header: 'Visits', accessorKey: 'visits', meta: { align: 'right' } },
      { header: 'Status', accessorKey: 'status', cell: (cell) => <StatusPill status={cell.getValue() as string} /> },
      {
        header: 'Profile Progress',
        accessorKey: 'progress',
        cell: (props) => <LinearWithLabel value={props.getValue() as number} sx={{ minWidth: 75 }} />
      }
    ],
    []
  );

  return <ReactTable {...{ data, columns }} />;
}
