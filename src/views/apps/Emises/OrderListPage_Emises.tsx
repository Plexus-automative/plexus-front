'use client';

import { useMemo, useState, Fragment, MouseEvent } from 'react';
import { alpha } from '@mui/material/styles';
import {
    Button,
    Chip,
    Divider,
    MenuItem,
    Select,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Box,
    Collapse,
    DialogActions,
    DialogContent,
    DialogTitle,
    Dialog
} from '@mui/material';

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    getPaginationRowModel,
    getFilteredRowModel,
    useReactTable,
    SortingState,
    ColumnFiltersState
} from '@tanstack/react-table';

import MainCard from 'components/MainCard';
import { CSVExport, DebouncedInput, HeaderSort, IndeterminateCheckbox, RowSelection, SelectColumnSorting, TablePagination } from 'components/third-party/react-table';
import IconButton from 'components/@extended/IconButton';
import { Add, Edit, Eye, Trash } from '@wandersonalwes/iconsax-react';
import OrderEdit from './OrderEdit_Emises';
import OrderTable from './OrderTable_Emises';
import { Order } from 'types/order';

export default function OrderListPage_Emises() {
    const [orders] = useState<Order[]>([
        {
            id: 1,
            name: 'ORD-001',
            dateCommande: '2025-11-28',
            fournisseur: 'Supplier A',
            status: 1,
            lines: [
                {
                    numArticle: '98087474XT',
                    description: 'PROTECTEUR D',
                    prixUnitaire: 115.787,
                    quantite: 1,
                    quantiteDisponible: 1,
                    quantiteValidee: 1,
                    quantiteLivree: 0,
                    confirmation: 'Disponible',
                    dateLivraison: '-'
                },
                {
                    numArticle: '98087470XT',
                    description: 'PROTECTEUR D',
                    prixUnitaire: 115.787,
                    quantite: 1,
                    quantiteDisponible: 1,
                    quantiteValidee: 1,
                    quantiteLivree: 0,
                    confirmation: 'Disponible',
                    dateLivraison: '-'
                }
            ]
        },
        {
            id: 2,
            name: 'ORD-002',
            dateCommande: '2025-11-28',
            fournisseur: 'Supplier B',
            status: 2,
            lines: [
                {
                    numArticle: '9811893580',
                    description: 'PORTE AV D ASS',
                    prixUnitaire: 1743.713,
                    quantite: 2,
                    quantiteDisponible: 2,
                    quantiteValidee: 2,
                    quantiteLivree: 0,
                    confirmation: 'Disponible',
                    dateLivraison: '-'
                }
            ]
        }
    ]);

    const [expandedRows, setExpandedRows] = useState<{ [key: string]: 'view' | 'edit' | null }>({});
    const [statusFilter, setStatusFilter] = useState<number | ''>('');
    const [sorting, setSorting] = useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [rowSelection, setRowSelection] = useState({});
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [editOrder, setEditOrder] = useState<Order | null>(null);

    const filteredData = useMemo(() => {
        if (statusFilter === '') return orders;
        return orders.filter(order => order.status === statusFilter);
    }, [statusFilter, orders]);

    const columns = useMemo<ColumnDef<Order>[]>(() => [
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
                    disabled={!row.getCanSelect()}
                    indeterminate={row.getIsSomeSelected()}
                    onChange={row.getToggleSelectedHandler()}
                />
            )
        },
        { header: '#', accessorKey: 'id', meta: { align: 'center' } },
        { header: 'Num Commande', accessorKey: 'name' },
        { header: 'Date Commande', accessorKey: 'dateCommande' },
        { header: 'Fournisseur', accessorKey: 'fournisseur' },
        {
            header: 'Status',
            accessorKey: 'status',
            cell: (cell) => {
                switch (cell.getValue()) {
                    case 1: return <Chip color="success" label="Verified" size="small" variant="light" />;
                    case 2: return <Chip color="info" label="Pending" size="small" variant="light" />;
                    case 3: return <Chip color="error" label="Rejected" size="small" variant="light" />;
                    default: return null;
                }
            }
        },
        {
            header: 'Actions',
            meta: { align: 'center' },
            cell: ({ row }) => (
                <Stack direction="row" gap={1} justifyContent="center" alignItems="center">
                    <Tooltip title="View">
                        <IconButton color="secondary" onClick={(e: MouseEvent<HTMLButtonElement>) => {
                            e.stopPropagation();
                            setExpandedRows(prev => ({
                                ...prev,
                                [row.id]: prev[row.id] === 'view' ? null : 'view'
                            }));
                        }}>
                            <Eye style={{ width: 36, height: 36 }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                        <IconButton
                            color="primary"
                            onClick={(e: MouseEvent<HTMLButtonElement>) => {
                                e.stopPropagation();
                                setEditOrder(row.original);   // open modal
                            }}
                        >
                            <Edit style={{ width: 36, height: 36 }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                        <IconButton color="error">
                            <Trash style={{ width: 36, height: 36 }} />
                        </IconButton>
                    </Tooltip>
                </Stack>
            )
        }
    ], []);

    const table = useReactTable({
        data: filteredData,
        columns,
        state: { sorting, globalFilter, rowSelection, columnFilters },
        enableRowSelection: true,
        onSortingChange: setSorting,
        onRowSelectionChange: setRowSelection,
        onGlobalFilterChange: setGlobalFilter,
        onColumnFiltersChange: setColumnFilters,
        getRowCanExpand: () => true,
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel()
    });

    const headers = table.getAllColumns().map(col => ({
        label: typeof col.columnDef.header === 'string' ? col.columnDef.header : '#',
        key: (col.columnDef as any).accessorKey ?? ''
    }));

    const handleCloseExpanded = (rowId: string) => {
        setExpandedRows(prev => ({ ...prev, [rowId]: null }));
    };

    return (
        <MainCard content={false}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={2} p={3}>
                <DebouncedInput value={globalFilter} onFilterChange={v => setGlobalFilter(String(v))} placeholder={`Search ${orders.length} records...`} />
            </Stack>

            <Stack>
                <RowSelection selected={Object.keys(rowSelection).length} />
                <TableContainer>
                    <Table>
                        <TableHead>
                            {table.getHeaderGroups().map(headerGroup => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                        <TableCell key={header.id} {...header.column.columnDef.meta}>
                                            {header.isPlaceholder ? null : (
                                                <Stack direction="row" gap={1} alignItems="center">
                                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                                    {header.column.getCanSort() && <HeaderSort column={header.column} />}
                                                </Stack>
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHead>
                        <TableBody>
                            {table.getRowModel().rows.map(row => {
                                const mode = expandedRows[row.id];

                                return (
                                    <Fragment key={row.id}>
                                        <TableRow hover>
                                            {row.getVisibleCells().map(cell => (
                                                <TableCell key={cell.id} {...cell.column.columnDef.meta}>
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </TableCell>
                                            ))}
                                        </TableRow>

                                        <TableRow>
                                            <TableCell colSpan={row.getVisibleCells().length} sx={{ p: 0, borderBottom: 'none' }}>
                                                <Collapse in={mode === 'view' || mode === 'edit'} timeout="auto" unmountOnExit>
                                                    <Box
                                                        sx={{
                                                            p: 2,
                                                            bgcolor: (theme) => alpha(theme.palette.primary.lighter, 0.1),
                                                            transition: 'all 0.3s ease', 
                                                        }}
                                                    >
                                                        {mode === 'edit' ? (
                                                            <OrderEdit lines={row.original.lines} onClose={() => handleCloseExpanded(row.id)} />
                                                        ) : (
                                                            <OrderTable lines={row.original.lines} onClose={() => handleCloseExpanded(row.id)} />
                                                        )}
                                                    </Box>
                                                </Collapse>
                                            </TableCell>
                                        </TableRow>
                                    </Fragment>
                                );
                            })}
                        </TableBody>

                    </Table>
                </TableContainer>
                <Divider />
                <Box p={2}>
                    <TablePagination
                        setPageSize={table.setPageSize}
                        setPageIndex={table.setPageIndex}
                        getState={table.getState}
                        getPageCount={table.getPageCount}
                    />
                </Box>
            </Stack>

            <Dialog
                open={editOrder !== null}
                onClose={() => setEditOrder(null)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Edit Order</DialogTitle>

                <DialogContent dividers>
                    {editOrder && (
                        <OrderEdit
                            lines={editOrder.lines}
                            onClose={() => setEditOrder(null)}
                        />
                    )}
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => setEditOrder(null)} variant="contained">Close</Button>
                </DialogActions>
            </Dialog>

        </MainCard>
    );
}
