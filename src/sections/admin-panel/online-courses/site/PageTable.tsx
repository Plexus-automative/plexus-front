import { useMemo, useState } from 'react';

// material-ui
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
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
import { ColumnDef, flexRender, getCoreRowModel, getSortedRowModel, useReactTable, SortingState } from '@tanstack/react-table';
import { HeaderSort } from 'components/third-party/react-table';

// assets
import { Edit, Eye, Trash } from '@wandersonalwes/iconsax-react';

interface PageProps {
  title: string;
  url: string;
  status: string;
}

const pagesData: PageProps[] = [
  { title: 'Main Page', url: '/main.page', status: 'Published' },
  { title: 'Login Page', url: '/login-page.design', status: 'Published' },
  { title: 'Privacy Policy', url: '/privacy-policy', status: 'Unpublished' },
  { title: 'Home', url: '/home.design', status: 'Published' },
  { title: 'Untitled 1', url: '/untitled-1', status: 'Published' },
  { title: 'Contact Us', url: '/contact-us', status: 'Published' },
  { title: 'Untitled 2', url: '/untitled-2', status: 'Unpublished' }
];

// ==========================|| PAGE TABLE ||========================== //

export default function PageTable() {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'title', desc: false }]);

  const columns = useMemo<ColumnDef<PageProps>[]>(
    () => [
      {
        header: 'Page Title',
        accessorKey: 'title',
        cell: ({ getValue }) => <Typography>{getValue() as string}</Typography>
      },
      {
        header: 'Url',
        accessorKey: 'url',
        cell: ({ getValue }) => <Typography>{getValue() as string}</Typography>
      },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: ({ getValue }) => <Chip size="small" color={getValue() === 'Published' ? 'success' : 'error'} label={getValue() as string} />
      },
      {
        header: 'Actions',
        disableSortBy: true,
        cell: () => (
          <Stack direction="row" sx={{ alignItems: 'center' }}>
            <Tooltip title="View">
              <IconButton color="secondary">
                <Eye />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit">
              <IconButton color="secondary">
                <Edit />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton color="secondary">
                <Trash />
              </IconButton>
            </Tooltip>
          </Stack>
        )
      }
    ],
    []
  );

  const table = useReactTable({
    data: pagesData,
    columns,
    state: { sorting },
    enableRowSelection: true,
    onSortingChange: setSorting,
    getRowCanExpand: () => true,
    getSortedRowModel: getSortedRowModel(),
    getCoreRowModel: getCoreRowModel(),
    debugTable: true
  });

  return (
    <TableContainer>
      <Table sx={{ minWidth: 560 }}>
        <TableHead>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableCell key={header.id}>
                  {header.isPlaceholder ? null : (
                    <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
                      <Box>{flexRender(header.column.columnDef.header, header.getContext())}</Box>
                      {header.column.getCanSort() && <HeaderSort sort column={header.column} />}
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
  );
}
