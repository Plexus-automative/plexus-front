import { useMemo, useState, Fragment } from 'react';

// material-ui
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
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
  SortingState
} from '@tanstack/react-table';

// project-import
import { useGetCustomer } from 'api/customer';
import Avatar from 'components/@extended/Avatar';
import IconButton from 'components/@extended/IconButton';
import MainCard from 'components/MainCard';
import { HeaderSort, TablePagination } from 'components/third-party/react-table';
import EmptyReactTable from 'views/forms-tables/tables/react-table/EmptyTable';

// types
import { CustomerList } from 'types/customer';

// assets
import { Edit, Eye, Trash } from '@wandersonalwes/iconsax-react';

const avatarImage = '/assets/images/users';

interface Props {
  columns: ColumnDef<CustomerList>[];
  data: CustomerList[];
}

// ==============================|| REACT TABLE ||============================== //

function ReactTable({ data, columns }: Props) {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'name', desc: false }]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getRowCanExpand: () => true,
    getSortedRowModel: getSortedRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    debugTable: true
  });

  return (
    <>
      <MainCard content={false} sx={{ mb: 2 }}>
        <Stack>
          <TableContainer>
            <Table>
              <TableHead sx={{ borderTop: 'none' }}>
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
                  <Fragment key={row.id}>
                    <TableRow>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} {...cell.column.columnDef.meta}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  </Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>
      </MainCard>
      <TablePagination
        {...{
          setPageSize: table.setPageSize,
          setPageIndex: table.setPageIndex,
          getState: table.getState,
          getPageCount: table.getPageCount
        }}
      />
    </>
  );
}

// ==============================|| SITE - BIO ||============================== //

export default function SiteBio() {
  const { customersLoading: loading, customers: lists } = useGetCustomer();

  const columns = useMemo<ColumnDef<CustomerList>[]>(
    () => [
      {
        header: 'Name',
        accessorKey: 'name',
        cell: ({ row, getValue }) => (
          <Stack direction="row" sx={{ gap: 1.5, alignItems: 'center' }}>
            <Avatar alt="Avatar" src={`${avatarImage}/avatar-${!row.original.avatar ? 1 : row.original.avatar}.png`} />
            <Typography>{getValue() as string}</Typography>
          </Stack>
        )
      },
      {
        header: 'Date/Time',
        accessorKey: 'date',
        cell: ({ row }) => (
          <Stack>
            <Typography>{row.original.date instanceof Date ? row.original.date.toLocaleDateString() : row.original.date}</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {row.original.time}
            </Typography>
          </Stack>
        )
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

  if (loading) return <EmptyReactTable />;

  return <ReactTable {...{ data: lists, columns }} />;
}
