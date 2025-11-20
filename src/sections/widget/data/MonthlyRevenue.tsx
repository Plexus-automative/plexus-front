'use client';

import { useMemo, useState, MouseEvent } from 'react';

// material-ui
import Chip from '@mui/material/Chip';
import ListItemButton from '@mui/material/ListItemButton';
import Menu from '@mui/material/Menu';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

// third-party
import { flexRender, useReactTable, ColumnDef, getCoreRowModel } from '@tanstack/react-table';
import { LabelKeyObject } from 'react-csv/lib/core';

// project-imports
import Avatar from 'components/@extended/Avatar';
import IconButton from 'components/@extended/IconButton';
import MoreIcon from 'components/@extended/MoreIcon';
import MainCard from 'components/MainCard';
import makeData from 'data/react-table';

// assets
import { ArrowDown, ArrowUp, Star1, Wallet3 } from '@wandersonalwes/iconsax-react';

// types
import { TableDataProps } from 'types/table';

interface ReactTableProps {
  columns: ColumnDef<TableDataProps>[];
  data: TableDataProps[];
}

const icons = [Star1, ArrowDown, Wallet3, ArrowUp];

// ==============================|| REACT TABLE ||============================== //

function ReactTable({ columns, data }: ReactTableProps) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel()
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
                <TableCell key={cell.id} {...cell.column.columnDef.meta}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

// ==============================|| DATA - MONTHLY REVENUE ||============================== //

export default function MonthlyRevenue() {
  const data = useMemo(() => makeData(5), []);

  function randomIntFromInterval(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  const columns = useMemo<ColumnDef<TableDataProps>[]>(
    () => [
      {
        header: 'Customer',
        accessorKey: 'fatherName',
        cell: ({ row }) => {
          const Icons = icons[randomIntFromInterval(0, 3)];
          return (
            <Stack direction="row" sx={{ gap: 1.5, alignItems: 'center' }}>
              <Avatar variant="rounded" color="secondary" size="sm" sx={{ bgcolor: 'background.paper' }}>
                <Icons />
              </Avatar>
              <Typography sx={{ color: 'text.secondary' }}>{row.original.fatherName}</Typography>
            </Stack>
          );
        }
      },
      {
        header: 'Plan',
        accessorKey: 'status',
        cell: ({ getValue }) => {
          const value = getValue();
          switch (value) {
            case 'Complicated':
              return <Chip color="error" label="Team" size="small" variant="light" sx={{ borderRadius: 1 }} />;
            case 'Relationship':
              return <Chip color="success" label="Premium" size="small" variant="light" sx={{ borderRadius: 1 }} />;
            case 'Single':
            default:
              return <Chip color="info" label="Free" size="small" variant="light" sx={{ borderRadius: 1 }} />;
          }
        }
      },
      {
        header: 'MRR',
        accessorKey: 'progress',
        cell: (cell) => {
          const mrr = cell.getValue() as number;
          return (
            <>
              {mrr > 50 ? (
                <Typography variant="subtitle1">${mrr}</Typography>
              ) : (
                <Typography color="error" variant="subtitle1">
                  -${mrr}
                </Typography>
              )}
            </>
          );
        }
      }
    ],
    []
  );

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const dataTable = useMemo(() => <ReactTable columns={columns} data={data} />, [data, columns]);

  return (
    <MainCard content={false}>
      <Stack sx={{ gap: 3, p: 3 }}>
        <Stack direction="row" sx={{ gap: 1, alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h5">Monthly Revenue</Typography>
          <IconButton
            color="secondary"
            id="wallet-button"
            aria-controls={open ? 'wallet-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            onClick={handleClick}
          >
            <MoreIcon />
          </IconButton>
          <Menu
            id="wallet-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            slotProps={{ list: { 'aria-labelledby': 'wallet-button', sx: { p: 1.25, minWidth: 150 } } }}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <ListItemButton onClick={handleClose}>Today</ListItemButton>
            <ListItemButton onClick={handleClose}>Weekly</ListItemButton>
            <ListItemButton onClick={handleClose}>Monthly</ListItemButton>
          </Menu>
        </Stack>
        <Stack>
          <Stack direction="row" sx={{ gap: 0.75, alignItems: 'center' }}>
            <Typography variant="h5">$746.5k</Typography>
            <Typography variant="caption" sx={{ color: 'success.main', display: 'flex', alignItems: 'center', gap: 0.25 }}>
              +20.6
              <ArrowUp size={12} />
            </Typography>
            <Typography></Typography>
          </Stack>
          <Typography sx={{ color: 'text.secondary' }}>Past 30 days</Typography>
        </Stack>
      </Stack>
      {dataTable}
    </MainCard>
  );
}
