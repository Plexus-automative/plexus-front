'use client';

import { useMemo } from 'react';

// material-ui
import Link from '@mui/material/Link';
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
import { flexRender, useReactTable, ColumnDef, getCoreRowModel } from '@tanstack/react-table';
import { LabelKeyObject } from 'react-csv/lib/core';

// project-imports
import Avatar from 'components/@extended/Avatar';
import MainCard from 'components/MainCard';
import { HeaderSort } from 'components/third-party/react-table';

import makeData from 'data/react-table';

// types
import { TableDataProps } from 'types/table';

const avatarImage = '/assets/images/users';

interface ReactTableProps {
  columns: ColumnDef<TableDataProps>[];
  data: TableDataProps[];
}

// ==============================|| REACT TABLE ||============================== //

function ReactTable({ columns, data }: ReactTableProps) {
  const table = useReactTable({
    data,
    columns,
    enableRowSelection: true,
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
      title="Latest Signup List"
      content={false}
      divider={false}
      secondary={
        <Link href="#" variant="h6" color="primary">
          View all
        </Link>
      }
    >
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

// ==========================|| MEMBERSHIP - DASHBOARD - LATEST SIGNUP LIST ||========================== //

export default function LatestSignupList() {
  const data: TableDataProps[] = makeData(5);

  const columns = useMemo<ColumnDef<TableDataProps>[]>(
    () => [
      {
        header: 'Name',
        accessorKey: 'fullName',
        cell: ({ row }) => {
          return (
            <Stack direction="row" sx={{ flexWrap: 'nowrap', gap: 2, alignItems: 'center' }}>
              <Avatar alt="Avatar" src={`${avatarImage}/avatar-${!row.original.avatar ? 1 : row.original.avatar}.png`} />
              <Typography variant="body1">{row.original.fullName}</Typography>
            </Stack>
          );
        }
      },
      {
        header: 'Email',
        accessorKey: 'email',
        cell: ({ row }) => <Typography variant="body1">{row.original.email}</Typography>
      },
      {
        header: 'Joining Date',
        accessorKey: 'date',
        cell: ({ row }) => <Typography variant="body1">{row.original.date}</Typography>
      }
    ],

    []
  );

  return <ReactTable columns={columns} data={data} />;
}
