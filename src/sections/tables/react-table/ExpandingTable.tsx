'use client';

import { Fragment, useEffect, useMemo, useState } from 'react';

// material-ui
import { alpha } from '@mui/material/styles';
import Skeleton from '@mui/material/Skeleton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

// third-party
import { flexRender, useReactTable, ColumnDef, getExpandedRowModel, getCoreRowModel } from '@tanstack/react-table';

// project-imports
import IconButton from 'components/@extended/IconButton';
import LinearWithLabel from 'components/@extended/progress/LinearWithLabel';
import MainCard from 'components/MainCard';
import { CSVExport, StatusPill } from 'components/third-party/react-table';
import makeData from 'data/react-table';
import mockData from 'utils/mock-data';

// types
import { TableDataProps } from 'types/table';
import { LabelKeyObject } from 'react-csv/lib/core';

// assets
import { ArrowDown2, ArrowRight2, MinusCirlce } from '@wandersonalwes/iconsax-react';

const numRows = mockData(1);

// ==============================|| RENDER - SUB TABLE ||============================== //

function RenderSubComponent() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<[]>([]);

  const columns = useMemo<ColumnDef<TableDataProps>[]>(
    () => [
      { header: 'First Name', accessorKey: 'firstName' },
      { header: 'Last Name', accessorKey: 'lastName' },
      { header: 'Email', accessorKey: 'email' },
      { header: 'Age', accessorKey: 'age', meta: { align: 'right' } },
      { header: 'Visits', accessorKey: 'visits', meta: { align: 'right' } },
      { header: 'Status', accessorKey: 'status', cell: (cell) => <StatusPill status={cell.getValue() as string} /> },
      {
        header: 'Profile Progress',
        accessorKey: 'progress',
        cell: (cell) => <LinearWithLabel value={cell.getValue() as number} sx={{ minWidth: 75 }} />
      }
    ],
    []
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setData(makeData(numRows.number.status(1, 5)));
      setLoading(false);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return <TableSubRows {...{ columns, data, loading }} />;
}

// ==============================|| REACT TABLE ||============================== //

interface ReactSubTableProps {
  columns: ColumnDef<TableDataProps>[];
  data: TableDataProps[];
  loading?: boolean;
}

function TableSubRows({ columns, data, loading }: ReactSubTableProps) {
  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });

  return loading
    ? Array.from({ length: 3 }).map((_, rowIdx) => (
        <TableRow key={rowIdx}>
          <TableCell />
          {Array.from({ length: 5 }).map((_, colIdx) => (
            <TableCell key={colIdx}>
              <Skeleton animation="wave" />
            </TableCell>
          ))}
        </TableRow>
      ))
    : table.getRowModel().rows.map((row, index) => (
        <TableRow
          sx={(theme) => ({
            bgcolor: alpha(theme.palette.primary.lighter, 0.35),
            ...theme.applyStyles('dark', { bgcolor: alpha(theme.palette.secondary.light, 0.25) })
          })}
          key={index}
        >
          <TableCell />
          {row.getVisibleCells().map((cell) => (
            <TableCell key={cell.id} {...cell.column.columnDef.meta}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCell>
          ))}
        </TableRow>
      ));
}
interface ReactTableProps {
  columns: ColumnDef<TableDataProps>[];
  data: TableDataProps[];
}

function ReactTable({ columns, data }: ReactTableProps) {
  const table = useReactTable({
    data,
    columns,
    getRowCanExpand: () => true,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel()
  });

  const headers = useMemo<LabelKeyObject[]>(
    () =>
      table.getAllColumns().map((column) => ({
        label: typeof column.columnDef.header === 'string' ? column.columnDef.header : '#',
        key: (column.columnDef as { accessorKey?: string }).accessorKey ?? ''
      })),
    [table]
  );

  return (
    <MainCard title="Expanding Row" content={false} secondary={<CSVExport {...{ data, headers, filename: 'expanding.csv' }} />}>
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
              <Fragment key={row.id}>
                <TableRow>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} {...cell.column.columnDef.meta}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
                {row.getIsExpanded() && <RenderSubComponent />}
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </MainCard>
  );
}

// ==============================|| REACT TABLE - EXPANDING SUB TABLE ||============================== //

export default function ExpandingSubTable() {
  const data: TableDataProps[] = makeData(10);

  const columns = useMemo<ColumnDef<TableDataProps>[]>(
    () => [
      {
        id: 'expander',
        header: () => null,
        cell: ({ row }) => {
          return row.getCanExpand() ? (
            <IconButton
              disableRipple
              sx={{
                color: row.getIsExpanded() ? 'primary.main' : 'secondary.main',
                '&:hover': { background: 'none', color: 'primary.main' }
              }}
              onClick={row.getToggleExpandedHandler()}
              size="small"
            >
              {row.getIsExpanded() ? <ArrowDown2 size="32" variant="Outline" /> : <ArrowRight2 size="32" variant="Outline" />}
            </IconButton>
          ) : (
            <IconButton color="secondary" size="small" disabled>
              <MinusCirlce />
            </IconButton>
          );
        },
        meta: { sx: { width: 58 } }
      },
      { header: 'First Name', accessorKey: 'firstName' },
      { header: 'Last Name', accessorKey: 'lastName' },
      { header: 'Email', accessorKey: 'email' },
      { header: 'Age', accessorKey: 'age', meta: { align: 'right' } },
      { header: 'Visits', accessorKey: 'visits', meta: { align: 'right' } },
      { header: 'Status', accessorKey: 'status', cell: (cell) => <StatusPill status={cell.getValue() as string} /> },
      {
        header: 'Profile Progress',
        accessorKey: 'progress',
        cell: (cell) => <LinearWithLabel value={cell.getValue() as number} sx={{ minWidth: 75 }} />
      }
    ],
    []
  );

  return <ReactTable {...{ columns, data }} />;
}
