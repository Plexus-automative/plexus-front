'use client';

import { useState, useMemo, useCallback, Fragment } from 'react';
import {
    Box,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Select,
    MenuItem,
    Tooltip,
    Divider,
    Button
} from '@mui/material';

import MainCard from 'components/MainCard';
import {
    DebouncedInput,
    HeaderSort,
    IndeterminateCheckbox,
    RowSelection,
    TablePagination
} from 'components/third-party/react-table';

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    getPaginationRowModel,
    SortingState,
    useReactTable
} from '@tanstack/react-table';

import IconButton from 'components/@extended/IconButton';
import { Add, Trash } from '@wandersonalwes/iconsax-react';

interface ReferenceLine {
    reference: string;
    designation: string;
    marque: string;
}

export default function ReferenceTablePage() {
    const [rows, setRows] = useState<ReferenceLine[]>([
        { reference: '', designation: '', marque: '' }
    ]);

    const [sorting, setSorting] = useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [rowSelection, setRowSelection] = useState({});

    // Use useCallback to memoize the update function
    const update = useCallback((index: number, key: keyof ReferenceLine, value: string) => {
        setRows(prevRows => {
            const copy = [...prevRows];
            copy[index][key] = value;
            return copy;
        });
    }, []);

    // Use useCallback to memoize the removeRow function
    const removeRow = useCallback((index: number) => {
        setRows(prevRows => prevRows.filter((_, i) => i !== index));
    }, []);

    const addRow = useCallback(() => {
        setRows(prevRows => [...prevRows, { reference: '', designation: '', marque: '' }]);
    }, []);

    // TABLE COLUMNS
    const columns = useMemo<ColumnDef<ReferenceLine>[]>(() => [
        {
            id: 'select',
            header: ({ table }) => (
                <IndeterminateCheckbox
                    checked={table.getIsAllRowsSelected()}
                    indeterminate={table.getIsSomeRowsSelected()}
                    onChange={table.getToggleAllRowsSelectedHandler()}
                />
            ),
            cell: ({ row }) => (
                <IndeterminateCheckbox
                    checked={row.getIsSelected()}
                    onChange={row.getToggleSelectedHandler()}
                />
            ),
            size: 40
        },
        {
            header: 'Référence *',
            accessorKey: 'reference',
            cell: ({ row }) => (
                <TextField
                    fullWidth
                    size="small"
                    value={row.original.reference}
                    onChange={(e) =>
                        update(row.index, 'reference', e.target.value)
                    }
                />
            )
        },
        {
            header: 'Désignation *',
            accessorKey: 'designation',
            cell: ({ row }) => (
                <TextField
                    fullWidth
                    size="small"
                    value={row.original.designation}
                    onChange={(e) =>
                        update(row.index, 'designation', e.target.value)
                    }
                />
            )
        },
        {
            header: 'Marque *',
            accessorKey: 'marque',
            cell: ({ row }) => (
                <Select
                    fullWidth
                    size="small"
                    value={row.original.marque}
                    onChange={(e) =>
                        update(row.index, 'marque', e.target.value)
                    }
                    displayEmpty
                >
                    <MenuItem value="">Choisir la marque</MenuItem>
                    <MenuItem value="HYUNDAI">HYUNDAI</MenuItem>
                    <MenuItem value="KIA">KIA</MenuItem>
                    <MenuItem value="FORD">FORD</MenuItem>
                    <MenuItem value="TOYOTA">TOYOTA</MenuItem>
                </Select>
            )
        },
        {
            header: 'Actions',
            meta: { align: 'center' },
            cell: ({ row }) => (
                <Tooltip title="Supprimer">
                    <IconButton color="error" onClick={() => removeRow(row.index)}>
                        <Trash />
                    </IconButton>
                </Tooltip>
            ),
            size: 60
        }
    ], [update, removeRow]); // Only depend on update and removeRow, not rows

    // REACT TABLE CONFIG
    const table = useReactTable<ReferenceLine>({
        data: rows,
        columns,
        state: { sorting, globalFilter, rowSelection },
        onSortingChange: setSorting,
        onRowSelectionChange: setRowSelection,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        autoResetPageIndex: false,
    });

    return (
        <MainCard content={false}>
            <Stack direction="row" justifyContent="space-between" p={3} alignItems="center">
                <DebouncedInput
                    value={globalFilter}
                    onFilterChange={(v) => setGlobalFilter(String(v))}
                    placeholder={`Search ${rows.length} lignes...`}
                />

                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={addRow}
                >
                    Ajouter une ligne
                </Button>
            </Stack>

            {/* ROW SELECTION COUNTER */}
            <RowSelection selected={Object.keys(rowSelection).length} />

            {/* TABLE */}
            <TableContainer>
                <Table size="small">
                    <TableHead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableCell key={header.id} {...header.column.columnDef.meta}>
                                        <Stack direction="row" gap={1} alignItems="center">
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                            {header.column.getCanSort() && (
                                                <HeaderSort column={header.column} />
                                            )}
                                        </Stack>
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

            <Divider />

            {/* PAGINATION */}
            <Box p={2}>
                <TablePagination
                    setPageSize={table.setPageSize}
                    setPageIndex={table.setPageIndex}
                    getState={table.getState}
                    getPageCount={table.getPageCount}
                />
            </Box>
        </MainCard>
    );
}