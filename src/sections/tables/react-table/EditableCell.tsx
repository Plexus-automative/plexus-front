'use client';

import { Dispatch, SetStateAction, useMemo, useState } from 'react';

// material-ui
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

// third-party
import { ColumnDef, useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';

// project-imports
import MainCard from 'components/MainCard';
import { CSVExport, EditCell } from 'components/third-party/react-table';
import makeData from 'data/react-table';

// types
import { TableDataProps } from 'types/table';
import { LabelKeyObject } from 'react-csv/lib/core';

interface ReactTableProps {
  columns: ColumnDef<TableDataProps>[];
  data: TableDataProps[];
  setData: Dispatch<SetStateAction<TableDataProps[]>>;
}

// ==============================|| REACT TABLE ||============================== //

function ReactTable({ columns, data, setData }: ReactTableProps) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
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
    <MainCard
      content={false}
      title="Editable Cell"
      secondary={
        <CSVExport {...{ data: table.getRowModel().flatRows.map((row) => row.original), headers, filename: 'editable-cell.csv' }} />
      }
    >
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
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <EditCell
                    key={cell.id}
                    cell={cell}
                    onSave={(updatedValue) => {
                      setData((prevData) =>
                        prevData.map((item) => (item.id === row.original.id ? { ...item, [cell.column.id]: updatedValue } : item))
                      );
                    }}
                  />
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </MainCard>
  );
}

// ==============================|| REACT TABLE - EDITABLE CELL ||============================== //

export default function EditableCell() {
  const [data, setData] = useState<TableDataProps[]>(() => makeData(10));

  const columns = useMemo<ColumnDef<TableDataProps>[]>(
    () => [
      { header: 'First Name', accessorKey: 'firstName', dataType: 'text' },
      { header: 'Last Name', accessorKey: 'lastName', dataType: 'text' },
      { header: 'Email', accessorKey: 'email', dataType: 'text' },
      { header: 'Age', accessorKey: 'age', dataType: 'number', meta: { align: 'right' } },
      { header: 'Visits', accessorKey: 'visits', dataType: 'number', meta: { align: 'right' } },
      { header: 'Status', accessorKey: 'status', dataType: 'select' },
      { header: 'Profile Progress', accessorKey: 'progress', dataType: 'progress' }
    ],
    []
  );

  return <ReactTable {...{ data, columns, setData }} />;
}
