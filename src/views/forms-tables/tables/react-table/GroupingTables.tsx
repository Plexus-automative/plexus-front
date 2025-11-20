'use client';

import { useMemo, useRef, useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

// third-party
import {
  ColumnDef,
  flexRender,
  useReactTable,
  GroupingState,
  getGroupedRowModel,
  getExpandedRowModel,
  getCoreRowModel,
  Row
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';

// project-imports
import IconButton from 'components/@extended/IconButton';
import LinearWithLabel from 'components/@extended/progress/LinearWithLabel';
import MainCard from 'components/MainCard';
import { CSVExport, StatusPill } from 'components/third-party/react-table';
import makeData from 'data/react-table';

// assets
import { ArrowDown2, ArrowRight2, Command, TableDocument } from '@wandersonalwes/iconsax-react';

// types
import { LabelKeyObject } from 'react-csv/lib/core';
import { TableDataProps } from 'types/table';

interface ReactTableProps {
  columns: ColumnDef<TableDataProps>[];
  data: TableDataProps[];
}

// ==============================|| LEGEND ||============================== //

function Legend() {
  return (
    <Stack direction="row" sx={{ gap: 1, alignItems: 'center', justifyContent: 'flex-end', display: { xs: 'none', sm: 'flex' } }}>
      <Chip color="success" variant="light" label="Grouped" size="small" />
      <Chip color="warning" variant="light" label="Aggregated" size="small" />
      <Chip color="error" variant="light" label="Repeated" size="small" />
    </Stack>
  );
}

// ==============================|| REACT TABLE ||============================== //

function ReactTable({ columns, data }: ReactTableProps) {
  const theme = useTheme();
  const [grouping, setGrouping] = useState<GroupingState>(['age']);

  const table = useReactTable({
    data,
    columns,
    state: { grouping },
    onGroupingChange: setGrouping,
    getExpandedRowModel: getExpandedRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getCoreRowModel: getCoreRowModel(),
    debugTable: true
  });

  const tableContainerRef = useRef<HTMLDivElement>(null);

  const { rows } = table.getRowModel();

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 34,
    overscan: 10
  });

  const virtualRows = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();

  const paddingTop = virtualRows.length > 0 ? virtualRows?.[0]?.start || 0 : 0;
  const paddingBottom = virtualRows.length > 0 ? totalSize - (virtualRows?.[virtualRows.length - 1]?.end || 0) : 0;

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
      title="Grouping With Seperate Column"
      secondary={
        <Stack direction="row" sx={{ gap: 2 }}>
          <Legend />
          <CSVExport {...{ data: table.getGroupedRowModel().rows.map((row) => row.original), headers, filename: 'grouping.csv' }} />
        </Stack>
      }
    >
      <TableContainer ref={tableContainerRef} sx={{ height: 544 }}>
        <Table stickyHeader>
          <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableCell key={header.id} {...header.column.columnDef.meta}>
                    {header.isPlaceholder ? null : (
                      <Stack direction="row" sx={{ alignItems: 'center' }}>
                        {header.column.getCanGroup() && (
                          <IconButton
                            color={header.column.getIsGrouped() ? 'error' : 'primary'}
                            onClick={header.column.getToggleGroupingHandler()}
                            size="small"
                            sx={{ p: 0, width: 24, height: 24, fontSize: '1rem', mr: 0.75 }}
                          >
                            {header.column.getIsGrouped() ? (
                              <TableDocument size="32" variant="Outline" />
                            ) : (
                              <Command size="32" variant="Outline" />
                            )}
                          </IconButton>
                        )}
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </Stack>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {paddingTop > 0 && (
              <TableRow>
                <TableCell sx={{ height: `${paddingTop}px` }} />
              </TableRow>
            )}
            {virtualRows.map((virtualRow) => {
              const row = rows[virtualRow.index] as Row<TableDataProps>;
              return (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      {...{
                        style: {
                          background: cell.getIsGrouped()
                            ? theme.palette.success.lighter
                            : cell.getIsAggregated()
                              ? theme.palette.warning.lighter
                              : cell.getIsPlaceholder()
                                ? theme.palette.error.lighter
                                : theme.palette.background.paper
                        }
                      }}
                      {...cell.column.columnDef.meta}
                    >
                      {cell.getIsGrouped() ? (
                        <Stack direction="row" sx={{ gap: 0.5, alignItems: 'center' }}>
                          <IconButton
                            color="secondary"
                            onClick={row.getToggleExpandedHandler()}
                            size="small"
                            sx={{ p: 0, width: 24, height: 24 }}
                          >
                            {row.getIsExpanded() ? <ArrowDown2 size="32" variant="Outline" /> : <ArrowRight2 size="32" variant="Outline" />}
                          </IconButton>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}&nbsp;({row.subRows.length})
                        </Stack>
                      ) : cell.getIsAggregated() ? (
                        flexRender(cell.column.columnDef.aggregatedCell ?? cell.column.columnDef.cell, cell.getContext())
                      ) : cell.getIsPlaceholder() ? null : (
                        flexRender(cell.column.columnDef.cell, cell.getContext())
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
            {paddingBottom > 0 && (
              <TableRow>
                <TableCell sx={{ height: `${paddingBottom}px` }} />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </MainCard>
  );
}

// ==============================|| REACT TABLE - GROUPING ||============================== //

export default function Grouping() {
  const data: TableDataProps[] = makeData(100);

  const columns = useMemo<ColumnDef<TableDataProps>[]>(
    () => [
      { header: 'First Name', accessorKey: 'firstName', enableGrouping: false },
      { header: 'Last Name', accessorKey: 'lastName', enableGrouping: false },
      { header: 'Email', accessorKey: 'email', enableGrouping: false },
      { header: 'Age', accessorKey: 'age', meta: { align: 'right' } },
      { header: 'Visits', accessorKey: 'visits', enableGrouping: false, meta: { align: 'right' } },
      { header: 'Status', accessorKey: 'status', cell: (cell) => <StatusPill status={cell.getValue() as string} /> },
      {
        header: 'Profile Progress',
        accessorKey: 'progress',
        cell: (cell) => <LinearWithLabel value={cell.getValue() as number} sx={{ minWidth: 75 }} />,
        enableGrouping: false
      }
    ],
    []
  );

  return <ReactTable {...{ data, columns }} />;
}
