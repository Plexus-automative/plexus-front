'use client';

import { CSSProperties, useMemo, useState } from 'react';

// material-ui
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Box from '@mui/material/Box';

// third-party
import { DndContext, closestCenter, useSensor, useSensors, TouchSensor, DragEndEvent, MouseSensor, KeyboardSensor } from '@dnd-kit/core';
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers';
import { arrayMove, horizontalListSortingStrategy, SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Cell, ColumnDef, ColumnOrderState, flexRender, getCoreRowModel, Header, useReactTable } from '@tanstack/react-table';

// project-imports
import LinearWithLabel from 'components/@extended/progress/LinearWithLabel';
import MainCard from 'components/MainCard';
import { CSVExport, StatusPill } from 'components/third-party/react-table';
import makeData from 'data/react-table';

// types
import { TableDataProps } from 'types/table';
import { LabelKeyObject } from 'react-csv/lib/core';

interface ReactTableProps {
  defaultColumns: ColumnDef<TableDataProps>[];
  data: TableDataProps[];
}

// ==============================|| DRAGGABLE HEADER ||============================== //

const DraggableTableHeader = ({ header }: { header: Header<TableDataProps, unknown> }) => {
  const { attributes, isDragging, listeners, setNodeRef, transform } = useSortable({
    id: header.column.id
  });

  const style: CSSProperties = {
    opacity: isDragging ? 0.7 : 1,
    position: 'relative',
    transform: CSS.Translate.toString(transform),
    transition: 'width transform 0.2s ease-in-out',
    whiteSpace: 'nowrap',
    width: header.column.getSize(),
    zIndex: isDragging ? 1 : 0
  };

  return (
    <TableCell colSpan={header.colSpan} ref={setNodeRef} style={style} {...header.column.columnDef.meta}>
      {header.isPlaceholder ? null : (
        <Box {...attributes} {...listeners} sx={{ width: 'fit-content', cursor: isDragging ? 'grabbing' : 'grab' }}>
          {flexRender(header.column.columnDef.header, header.getContext())}
        </Box>
      )}
    </TableCell>
  );
};

// ==============================|| DRAGGABLE CELL ||============================== //

function DragAlongCell({ cell }: { cell: Cell<TableDataProps, unknown> }) {
  const { isDragging, setNodeRef, transform } = useSortable({
    id: cell.column.id
  });

  const style: CSSProperties = {
    opacity: isDragging ? 0.7 : 1,
    position: 'relative',
    transform: CSS.Translate.toString(transform),
    transition: 'width transform 0.2s ease-in-out',
    zIndex: isDragging ? 1 : 0
  };

  return (
    <TableCell style={style} ref={setNodeRef} {...cell.column.columnDef.meta}>
      {flexRender(cell.column.columnDef.cell, cell.getContext())}
    </TableCell>
  );
}

// ==============================|| REACT TABLE ||============================== //

function ReactTable({ defaultColumns, data }: ReactTableProps) {
  const [columns] = useState(() => [...defaultColumns]);

  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(
    columns.map((column) => column.id as string) // must start out with populated columnOrder so we can splice
  );

  const table = useReactTable({
    data,
    columns,
    state: { columnOrder },
    onColumnOrderChange: setColumnOrder,
    getCoreRowModel: getCoreRowModel(),
    debugTable: true,
    debugHeaders: true,
    debugColumns: true
  });

  const headers: LabelKeyObject[] = [];
  table.getAllColumns().map((column) => {
    const accessorKey = (column.columnDef as { accessorKey?: string }).accessorKey;
    headers.push({
      label: typeof column.columnDef.header === 'string' ? column.columnDef.header : '#',
      key: accessorKey ?? ''
    });
  });

  const sensors = useSensors(useSensor(MouseSensor, {}), useSensor(TouchSensor, {}), useSensor(KeyboardSensor, {}));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setColumnOrder((columnOrder) => {
        const oldIndex = columnOrder.indexOf(active.id as string);
        const newIndex = columnOrder.indexOf(over.id as string);
        return arrayMove(columnOrder, oldIndex, newIndex);
      });
    }
  }

  return (
    <MainCard
      title="Column Drag & Drop (Ordering)"
      content={false}
      secondary={<CSVExport {...{ data, headers, filename: 'column-dragable.csv' }} />}
    >
      <DndContext collisionDetection={closestCenter} modifiers={[restrictToHorizontalAxis]} onDragEnd={handleDragEnd} sensors={sensors}>
        <TableContainer>
          <Table>
            <TableHead>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  <SortableContext items={columnOrder} strategy={horizontalListSortingStrategy}>
                    {headerGroup.headers.map((header) => (
                      <DraggableTableHeader key={header.id} header={header} />
                    ))}
                  </SortableContext>
                </TableRow>
              ))}
            </TableHead>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <SortableContext key={cell.id} items={columnOrder} strategy={horizontalListSortingStrategy}>
                      <DragAlongCell key={cell.id} cell={cell} />
                    </SortableContext>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DndContext>
    </MainCard>
  );
}

// ==============================|| COLUMN - DRAG & DROP ||============================== //

export default function ColumnDragDrop() {
  const data = useMemo(() => makeData(9), []);

  const defaultColumns: ColumnDef<TableDataProps>[] = [
    { id: 'firstName', header: 'First Name', accessorKey: 'firstName' },
    { id: 'lastName', header: 'Last Name', accessorKey: 'lastName' },
    { id: 'email', header: 'Email', accessorKey: 'email' },
    { id: 'age', header: 'Age', accessorKey: 'age', meta: { align: 'right' } },
    { id: 'visits', header: 'Visits', accessorKey: 'visits', meta: { align: 'right' } },
    { id: 'status', header: 'Status', accessorKey: 'status', cell: (cell) => <StatusPill status={cell.getValue() as string} /> },
    {
      id: 'progress',
      header: 'Profile Progress',
      accessorKey: 'progress',
      cell: (props) => <LinearWithLabel value={props.getValue() as number} sx={{ minWidth: 75 }} />
    }
  ];

  return <ReactTable {...{ defaultColumns, data }} />;
}
