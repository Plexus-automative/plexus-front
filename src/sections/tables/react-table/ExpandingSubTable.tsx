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
import { flexRender, useReactTable, ColumnDef, getExpandedRowModel, getCoreRowModel, Row } from '@tanstack/react-table';

// project-imports
import Avatar from 'components/@extended/Avatar';
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

const avatarImage = '/assets/images/users';

const numRows = mockData(1);

// ==============================|| RENDER - SUB TABLE ||============================== //

function RenderSubComponent({ row }: { row: Row<TableDataProps> }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<[]>([]);

  const columns = useMemo<ColumnDef<TableDataProps>[]>(
    () => [
      {
        header: 'Avatar',
        accessorKey: 'avatar',
        cell: (cell) => <Avatar alt="Avatar 1" size="sm" src={`${avatarImage}/avatar-${cell.getValue()}.png`} />,
        meta: { align: 'center' }
      },
      { header: 'Name', accessorKey: 'fullName' },
      { header: 'Email', accessorKey: 'email' },
      { header: 'Role', accessorKey: 'role' },
      { header: 'Contact', accessorKey: 'contact', meta: { align: 'right' } },
      { header: 'Country', accessorKey: 'country' }
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

  const userData = row.original;

  const headers: LabelKeyObject[] = [];
  columns.forEach((column) => {
    const accessorKey = (column as { accessorKey?: string }).accessorKey;
    if (accessorKey) {
      headers.push({
        label: typeof column.header === 'string' ? column.header : '#',
        key: accessorKey ?? ''
      });
    }
  });

  return (
    <MainCard
      title={`${userData.fullName}'s Employee List`}
      secondary={<CSVExport {...{ data, headers, filename: 'expanding-sub-data.csv' }} />}
      content={false}
      sx={{ ml: { xs: 2.5, sm: 5, md: 6, lg: 10, xl: 12 } }}
    >
      <ReactTable {...{ columns, data, loading }} />
    </MainCard>
  );
}

interface ReactTableProps {
  columns: ColumnDef<TableDataProps>[];
  data: TableDataProps[];
  loading?: boolean;
}

// ==============================|| REACT TABLE ||============================== //

function ReactTable({ columns, data, loading }: ReactTableProps) {
  const table = useReactTable({
    data,
    columns,
    getRowCanExpand: () => true,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel()
  });

  if (loading) {
    return (
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
          {Array.from({ length: 3 }).map((_, rowIdx) => (
            <TableRow key={rowIdx}>
              <TableCell />
              {Array.from({ length: 5 }).map((_, colIdx) => (
                <TableCell key={colIdx}>
                  <Skeleton animation="wave" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  const headers: LabelKeyObject[] = [];
  table.getAllColumns().map((column) => {
    const accessorKey = (column.columnDef as { accessorKey?: string }).accessorKey;
    headers.push({
      label: typeof column.columnDef.header === 'string' ? column.columnDef.header : '#',
      key: accessorKey ?? ''
    });
  });

  return (
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
                  <TableCell colSpan={row.getVisibleCells().length}>
                    <RenderSubComponent {...{ row }} />
                  </TableCell>
                </TableRow>
              )}
            </Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

// ==============================|| REACT TABLE - EXPANDING SUB TABLE ||============================== //

export default function ExpandingSubTable() {
  const data: TableDataProps[] = makeData(8);

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
            <IconButton sx={{ color: 'text.secondary' }}>
              <MinusCirlce size="32" />
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

  return (
    <MainCard title="Expanding Sub Table" content={false} secondary={<CSVExport data={data} filename={'expanding-sub-table.csv'} />}>
      <ReactTable {...{ columns, data }} />
    </MainCard>
  );
}
