'use client';

import { useMemo, useEffect, useState, ChangeEvent } from 'react';

// next
import { useRouter } from 'next/navigation';

// material-ui
import { useTheme, PaletteColor } from '@mui/material/styles';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import LinearProgress, { LinearProgressProps } from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { TableCellProps } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tabs from '@mui/material/Tabs';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// third-party
import { rankItem } from '@tanstack/match-sorter-utils';
import { LabelKeyObject } from 'react-csv/lib/core';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  useReactTable,
  SortingState,
  FilterFn,
  ColumnFiltersState
} from '@tanstack/react-table';

// project-imports
import Avatar from 'components/@extended/Avatar';
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import IconButton from 'components/@extended/IconButton';
import InvoiceCard from 'components/cards/invoice/InvoiceCard';
import InvoiceChart from 'components/cards/invoice/InvoiceChart';
import MainCard from 'components/MainCard';

import {
  CSVExport,
  DebouncedInput,
  HeaderSort,
  IndeterminateCheckbox,
  RowSelection,
  SelectColumnSorting,
  TablePagination
} from 'components/third-party/react-table';
import EmptyTables from 'views/forms-tables/tables/react-table/EmptyTable';
import AlertProductDelete from 'sections/apps/invoice/AlertProductDelete';

import { handlerDelete, deleteInvoice, useGetInvoice, useGetInvoiceMaster } from 'api/invoice';
import { openSnackbar } from 'api/snackbar';
import { APP_DEFAULT_PATH, GRID_COMMON_SPACING } from 'config';

// types
import { InvoiceList } from 'types/invoice';
import { SnackbarProps } from 'types/snackbar';

// assets
import { Edit, Eye, InfoCircle, ProfileTick, Trash } from '@wandersonalwes/iconsax-react';

const fuzzyFilter: FilterFn<InvoiceList> = (row, columnId, value, addMeta) => {
  // rank the item
  const itemRank = rankItem(row.getValue(columnId), value);

  // store the ranking info
  addMeta(itemRank);

  // return if the item should be filtered in/out
  return itemRank.passed;
};

const exactValueFilter: FilterFn<InvoiceList> = (row, columnId, filterValue) => {
  return String(row.getValue(columnId)) === String(filterValue);
};

function ExactValueFilter({ column: { filterValue, setFilter } }: any) {
  return (
    <input value={filterValue || ''} onChange={(e) => setFilter(e.target.value || undefined)} placeholder="Filter by exact value..." />
  );
}

interface TableCellWithFilterProps extends TableCellProps {
  filterComponent?: any;
}

function TableCellWithFilterComponent({ filterComponent, ...props }: TableCellWithFilterProps) {
  return <TableCell {...props} />;
}

interface InvoiceWidgets {
  title: string;
  count: string;
  percentage: number;
  isLoss: boolean;
  invoice: string;
  color: PaletteColor;
  chartData: number[];
}

const avatarImage = '/assets/images/users';

interface Props {
  data: InvoiceList[];
  columns: ColumnDef<InvoiceList>[];
}

// ==============================|| REACT TABLE - LIST ||============================== //

function ReactTable({ data, columns }: Props) {
  const groups = ['All', ...new Set(data.map((item: InvoiceList) => item.status))];

  const countGroup = data.map((item: InvoiceList) => item.status);
  const counts = countGroup.reduce(
    (acc: any, value: any) => ({
      ...acc,
      [value]: (acc[value] || 0) + 1
    }),
    {}
  );

  const [activeTab, setActiveTab] = useState(groups[0]);
  const [sorting, setSorting] = useState<SortingState>([{ id: 'customer_name', desc: false }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');

  const table = useReactTable({
    data,
    columns,
    state: { columnFilters, sorting, rowSelection, globalFilter },
    enableRowSelection: true,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    getRowCanExpand: () => true,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: fuzzyFilter,
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

  useEffect(() => {
    setColumnFilters(activeTab === 'All' ? [] : [{ id: 'status', value: activeTab }]);
  }, [activeTab]);

  return (
    <MainCard content={false}>
      <Box sx={{ p: 2.5, pb: 0, width: 1 }}>
        <Tabs
          value={activeTab}
          onChange={(e: ChangeEvent<unknown>, value: string) => setActiveTab(value)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
          variant="scrollable"
          scrollButtons="auto"
        >
          {groups.map((status: string, index: number) => (
            <Tab
              key={index}
              label={status}
              value={status}
              icon={
                <Chip
                  label={
                    status === 'All'
                      ? data.length
                      : status === 'Paid'
                        ? counts.Paid
                        : status === 'Unpaid'
                          ? counts.Unpaid
                          : counts.Cancelled
                  }
                  color={status === 'All' ? 'primary' : status === 'Paid' ? 'success' : status === 'Unpaid' ? 'warning' : 'error'}
                  variant="light"
                  size="small"
                />
              }
              iconPosition="end"
            />
          ))}
        </Tabs>
      </Box>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        sx={{ gap: 2, alignItems: 'center', justifyContent: 'space-between', padding: 2.5, width: 1 }}
      >
        <DebouncedInput
          value={globalFilter ?? ''}
          onFilterChange={(value) => setGlobalFilter(String(value))}
          placeholder={`Search ${data.length} records...`}
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        />

        <Stack direction="row" sx={{ width: 1, gap: 2, alignItems: 'center', justifyContent: { xs: 'space-between', sm: 'flex-end' } }}>
          <SelectColumnSorting {...{ getState: table.getState, getAllColumns: table.getAllColumns, setSorting }} />
          <CSVExport
            {...{ data: table.getSelectedRowModel().flatRows.map((row) => row.original), headers, filename: 'customer-list.csv' }}
          />
        </Stack>
      </Stack>
      <Stack>
        <RowSelection selected={Object.keys(rowSelection).length} />
        <TableContainer>
          <Table>
            <TableHead>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableCellWithFilterComponent key={header.id} {...header.column.columnDef.meta}>
                        {header.isPlaceholder ? null : (
                          <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {header.column.getCanSort() && <HeaderSort column={header.column} />}
                          </Stack>
                        )}
                      </TableCellWithFilterComponent>
                    );
                  })}
                </TableRow>
              ))}
            </TableHead>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCellWithFilterComponent key={cell.id} {...cell.column.columnDef.meta}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCellWithFilterComponent>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <>
          <Divider />
          <Box sx={{ p: 2 }}>
            <TablePagination
              {...{
                setPageSize: table.setPageSize,
                setPageIndex: table.setPageIndex,
                getState: table.getState,
                getPageCount: table.getPageCount,
                initialPageSize: 5
              }}
            />
          </Box>
        </>
      </Stack>
    </MainCard>
  );
}

// ==============================|| INVOICE - LIST ||============================== //

export default function List() {
  const { invoiceLoading, invoice: list } = useGetInvoice();
  const { invoiceMaster } = useGetInvoiceMaster();
  const [invoiceId, setInvoiceId] = useState(0);

  const handleClose = (status: boolean) => {
    if (status) {
      deleteInvoice(invoiceId);
      openSnackbar({
        open: true,
        message: 'Column deleted successfully',
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
        variant: 'alert',
        alert: { color: 'success' }
      } as SnackbarProps);
    }
    handlerDelete(false);
  };
  const router = useRouter();

  const columns = useMemo<ColumnDef<InvoiceList>[]>(
    () => [
      {
        id: 'Row Selection',
        header: ({ table }) => (
          <IndeterminateCheckbox
            {...{
              checked: table.getIsAllRowsSelected(),
              indeterminate: table.getIsSomeRowsSelected(),
              onChange: table.getToggleAllRowsSelectedHandler()
            }}
          />
        ),
        cell: ({ row }) => (
          <IndeterminateCheckbox
            {...{
              checked: row.getIsSelected(),
              disabled: !row.getCanSelect(),
              indeterminate: row.getIsSomeSelected(),
              onChange: row.getToggleSelectedHandler()
            }}
          />
        )
      },
      { header: 'Invoice Id', accessorKey: 'id', meta: { align: 'center' } },
      {
        header: 'User Info',
        accessorKey: 'customer_name',
        cell: ({ row, getValue }) => (
          <Stack direction="row" sx={{ gap: 1.5, alignItems: 'center' }}>
            <Avatar alt="Avatar" size="sm" src={`${avatarImage}/avatar-${!row.original.avatar ? 1 : row.original.avatar}.png`} />
            <Stack>
              <Typography variant="subtitle1">{getValue() as string}</Typography>
              <Typography sx={{ color: 'text.secondary' }}>{row.original.email as string}</Typography>
            </Stack>
          </Stack>
        )
      },
      { header: 'Create Date', accessorKey: 'date' },
      { header: 'Due Date', accessorKey: 'due_date' },
      { header: 'Quantity', accessorKey: 'quantity' },
      {
        header: 'Status',
        accessorKey: 'status',
        filterFn: exactValueFilter,
        cell: (cell) => {
          switch (cell.getValue()) {
            case 'Cancelled':
              return <Chip color="error" label="Cancelled" size="small" variant="light" />;
            case 'Paid':
              return <Chip color="success" label="Paid" size="small" variant="light" />;
            case 'Unpaid':
            default:
              return <Chip color="info" label="Unpaid" size="small" variant="light" />;
          }
        },
        meta: { filterComponent: ExactValueFilter }
      },
      {
        header: 'Actions',
        meta: { align: 'center' },
        disableSortBy: true,
        cell: ({ row }) => {
          return (
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'center' }}>
              <Tooltip title="View">
                <IconButton
                  color="secondary"
                  onClick={(e: any) => {
                    e.stopPropagation();
                    router.push(`/apps/invoice/details/${row?.original?.id}`);
                  }}
                >
                  <Eye />
                </IconButton>
              </Tooltip>
              <Tooltip title="Edit">
                <IconButton
                  color="primary"
                  onClick={(e: any) => {
                    e.stopPropagation();
                    router.push(`/apps/invoice/edit/${row?.original?.id}`);
                  }}
                >
                  <Edit />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton
                  color="error"
                  onClick={(e: any) => {
                    e.stopPropagation();
                    setInvoiceId(row?.original?.id);
                    handlerDelete(true);
                  }}
                >
                  <Trash />
                </IconButton>
              </Tooltip>
            </Stack>
          );
        }
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const theme = useTheme();

  const widgetsData: InvoiceWidgets[] = [
    {
      title: 'Paid',
      count: '$7,825',
      percentage: 70.5,
      isLoss: false,
      invoice: '9',
      color: theme.palette.success,
      chartData: [200, 600, 100, 400, 300, 400, 50]
    },
    {
      title: 'Unpaid',
      count: '$1,880',
      percentage: 27.4,
      isLoss: true,
      invoice: '6',
      color: theme.palette.warning,
      chartData: [100, 550, 300, 350, 200, 100, 300]
    },
    {
      title: 'Overdue',
      count: '$3,507',
      percentage: 27.4,
      isLoss: true,
      invoice: '4',
      color: theme.palette.error,
      chartData: [100, 550, 200, 300, 100, 200, 300]
    }
  ];

  const breadcrumbLinks = [{ title: 'home', to: APP_DEFAULT_PATH }, { title: 'invoice', to: '/apps/invoice/dashboard' }, { title: 'list' }];

  return (
    <>
      <Breadcrumbs custom heading="invoice-list" links={breadcrumbLinks} />
      <Grid container spacing={GRID_COMMON_SPACING} sx={{ pb: 2 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Grid container direction="row" spacing={GRID_COMMON_SPACING}>
            {widgetsData.map((widget: InvoiceWidgets, index: number) => (
              <Grid key={index} size={{ xs: 12, sm: 4 }}>
                <MainCard>
                  <InvoiceCard
                    title={widget.title}
                    count={widget.count}
                    percentage={widget.percentage}
                    isLoss={widget.isLoss}
                    invoice={widget.invoice}
                    color={widget.color.main}
                  >
                    <InvoiceChart color={widget.color} data={widget.chartData} />
                  </InvoiceCard>
                </MainCard>
              </Grid>
            ))}
          </Grid>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Box
            sx={(theme) => ({
              p: 1.75,
              borderRadius: 1,
              color: 'background.paper',
              ...theme.applyStyles('dark', { color: 'text.primary' }),
              background: `linear-gradient(to right, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`
            })}
          >
            <Stack direction="row" sx={{ gap: 1, alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap' }}>
              <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
                <Avatar alt="Natasha" variant="rounded" type="filled" sx={{ color: 'inherit' }}>
                  <ProfileTick style={{ fontSize: '20px' }} />
                </Avatar>
                <Box>
                  <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
                    <Typography variant="body1">Total Receivables</Typography>
                    <InfoCircle />
                  </Stack>
                  <Stack direction="row" sx={{ gap: 1 }}>
                    <Typography variant="body2">Current</Typography>
                    <Typography variant="body1">109.1k</Typography>
                  </Stack>
                </Box>
              </Stack>
              <Stack direction="row" sx={{ gap: 1 }}>
                <Typography variant="body2">Overdue</Typography>
                <Typography variant="body1">62k</Typography>
              </Stack>
            </Stack>
            <Typography variant="h4" sx={{ pt: 2, pb: 1, zIndex: 1 }}>
              $43,078
            </Typography>
            <Box sx={{ maxWidth: '100%', '& .MuiTypography-root': { color: 'inherit' } }}>
              <LinearWithLabel value={90} />
            </Box>
          </Box>
        </Grid>
        <Grid size={12}>
          {invoiceLoading ? <EmptyTables /> : <ReactTable {...{ data: list, columns }} />}
          <AlertProductDelete
            title={invoiceId.toString()}
            open={invoiceMaster ? invoiceMaster.alertPopup : false}
            handleClose={handleClose}
          />
        </Grid>
      </Grid>
    </>
  );
}

function LinearWithLabel({ value, ...others }: LinearProgressProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box sx={{ width: '100%', mr: 1 }}>
        <LinearProgress color="warning" variant="determinate" value={value} {...others} />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" color="white">{`${Math.round(value!)}%`}</Typography>
      </Box>
    </Box>
  );
}
