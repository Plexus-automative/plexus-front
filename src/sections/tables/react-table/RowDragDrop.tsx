'use client';

import { CSSProperties, useMemo, useState } from 'react';

// material-ui
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

// third-party
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  TouchSensor,
  DragEndEvent,
  UniqueIdentifier,
  MouseSensor,
  KeyboardSensor
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ColumnDef, Row, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';

// project-imports
import LinearWithLabel from 'components/@extended/progress/LinearWithLabel';
import MainCard from 'components/MainCard';
import { CSVExport, StatusPill } from 'components/third-party/react-table';
import makeData from 'data/react-table';

// types
import { TableDataProps } from 'types/table';
import { LabelKeyObject } from 'react-csv/lib/core';

// assets
import { HambergerMenu } from '@wandersonalwes/iconsax-react';

interface ReactTableProps {
  defaultColumns: ColumnDef<TableDataProps>[];
  defaultData: TableDataProps[];
}

// ==============================|| DRAGGABLE ROW ||============================== //

function DraggableRow({ row }: { row: Row<TableDataProps> }) {
  const { transform, transition, setNodeRef, isDragging, attributes, listeners, setActivatorNodeRef } = useSortable({
    id: row.original.id
  });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
    position: 'relative'
  };

  return (
    <TableRow ref={setNodeRef} style={style}>
      {row.getVisibleCells().map((cell) => {
        if (cell.column.id === 'drag-handle') {
          return (
            <TableCell key={cell.id} sx={{ width: 58 }}>
              <IconButton
                {...attributes}
                {...listeners}
                ref={setActivatorNodeRef}
                size="small"
                sx={{ p: 0, width: 24, height: 24, fontSize: '1rem', cursor: isDragging ? 'grabbing' : 'grab' }}
              >
                <HambergerMenu size="32" variant="Outline" />
              </IconButton>
            </TableCell>
          );
        }

        return (
          <TableCell key={cell.id} {...cell.column.columnDef.meta}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        );
      })}
    </TableRow>
  );
}

// ==============================|| REACT TABLE ||============================== //

function ReactTable({ defaultColumns, defaultData }: ReactTableProps) {
  const [columns] = useState(() => [...defaultColumns]);
  const [data, setData] = useState([...defaultData]);

  const dataIds = useMemo<UniqueIdentifier[]>(() => data?.map(({ id }) => id), [data]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id.toString(), // good to have guaranteed unique row ids/keys for rendering
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

  // reorder rows after drag & drop
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id);
        const newIndex = dataIds.indexOf(over.id);
        return arrayMove(data, oldIndex, newIndex);
      });
    }
  }

  return (
    <MainCard
      title="Row Drag & Drop"
      content={false}
      secondary={
        <CSVExport {...{ data: table.getRowModel().flatRows.map((row) => row.original), headers, filename: 'row-dragable.csv' }} />
      }
    >
      <DndContext collisionDetection={closestCenter} modifiers={[restrictToVerticalAxis]} onDragEnd={handleDragEnd} sensors={sensors}>
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
              <SortableContext items={dataIds} strategy={verticalListSortingStrategy}>
                {table.getRowModel().rows.map((row) => (
                  <DraggableRow key={row.id} row={row} />
                ))}
              </SortableContext>
            </TableBody>
          </Table>
        </TableContainer>
      </DndContext>
    </MainCard>
  );
}

// ==============================|| ROW - DRAG & DROP ||============================== //

export default function RowDragDrop() {
  const data = useMemo(() => makeData(10), []);

  const defaultColumns: ColumnDef<TableDataProps>[] = [
    { id: 'drag-handle' },
    { id: 'id', header: '#', accessorKey: 'id' },
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

  return <ReactTable {...{ defaultColumns, defaultData: data }} />;
}
