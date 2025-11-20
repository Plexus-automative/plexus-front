'use client';

import { useMemo, useState, Dispatch, SetStateAction } from 'react';

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
import { CSVExport, EditRow } from 'components/third-party/react-table';
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
  const table = useReactTable<TableDataProps>({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    debugTable: true
  });

  const headers: LabelKeyObject[] = [];
  table.getAllColumns().forEach((column) => {
    const accessorKey = (column.columnDef as { accessorKey?: string }).accessorKey;
    headers.push({
      label: typeof column.columnDef.header === 'string' ? column.columnDef.header : '#',
      key: accessorKey ?? ''
    });
  });

  return (
    <MainCard
      content={false}
      title="Editable Row"
      secondary={
        <CSVExport {...{ data: table.getRowModel().flatRows.map((row) => row.original), headers, filename: 'editable-row.csv' }} />
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
                <EditRow
                  row={row}
                  onSave={(updatedData) => {
                    setData((prev) => prev.map((item) => (item.id === row.original.id ? { ...item, ...updatedData } : item)));
                  }}
                />
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </MainCard>
  );
}

// ==============================|| REACT TABLE - EDITABLE ROW ||============================== //

export default function EditableRow() {
  const [data, setData] = useState<TableDataProps[]>(() => makeData(10));

  const columns = useMemo<ColumnDef<TableDataProps>[]>(
    () => [
      { header: 'First Name', accessorKey: 'firstName', dataType: 'text' },
      { header: 'Last Name', accessorKey: 'lastName', dataType: 'text' },
      { header: 'Email', accessorKey: 'email', dataType: 'text' },
      { header: 'Age', accessorKey: 'age', dataType: 'number', meta: { align: 'right' } },
      { header: 'Visits', accessorKey: 'visits', dataType: 'number', meta: { align: 'right' } },
      { header: 'Status', accessorKey: 'status', dataType: 'select' },
      { header: 'Profile Progress', accessorKey: 'progress', dataType: 'progress' },
      { id: 'actions', header: 'Actions', dataType: 'actions', meta: { align: 'center' } }
    ],
    []
  );

  return <ReactTable {...{ data, columns, setData }} />;
}
