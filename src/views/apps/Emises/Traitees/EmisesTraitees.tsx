'use client';

import { useEffect, useMemo, useState, Fragment, MouseEvent } from 'react';
import { alpha } from '@mui/material/styles';
import {
    Button,
    Chip,
    Divider,
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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
    Alert,
    Typography
} from '@mui/material';

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getFilteredRowModel,
    useReactTable,
    SortingState,
    ColumnFiltersState,
    PaginationState // Add this import
} from '@tanstack/react-table';

import MainCard from 'components/MainCard';
import {
    DebouncedInput,
    HeaderSort,
    IndeterminateCheckbox,
    RowSelection,
    TablePagination
} from 'components/third-party/react-table';

import IconButton from 'components/@extended/IconButton';
import { InfoCircle } from '@wandersonalwes/iconsax-react';
// project-imports

import { fetchTraitees } from 'app/api/services/Emises/TraiteeEmises';
import { Traitee, TraiteeLine } from 'types/Traitee';

export default function EmisesTraitees() {
    const [data, setData] = useState<Traitee[]>([]);
    const [expandedRows, setExpandedRows] = useState<{ [key: string]: 'view' | 'edit' | null }>({});
    const [sorting, setSorting] = useState<SortingState>([
        { id: 'orderDate', desc: true }
    ]); const [globalFilter, setGlobalFilter] = useState('');
    const [rowSelection, setRowSelection] = useState({});
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [editOrder, setEditOrder] = useState<Traitee | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Use pagination state from TanStack Table
    const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    const [totalCount, setTotalCount] = useState(0);

    // Fetch data when pageIndex or pageSize changes
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = process.env.TOKEN || '';

                const result = await fetchTraitees(
                    token,
                    pageIndex,
                    pageSize
                );
                setData(
                    result.data.map((o: Traitee, index: number) => ({
                        id: o.id || String(pageIndex * pageSize + index + 1),
                        number: o.number,
                        orderDate: o.orderDate,
                        vendorName: o.vendorName,
                        payToVendorNumber: o.payToVendorNumber || '',
                        fullyReceived: o.fullyReceived ?? false,
                        status: o.status,
                        ShippingAdvice: o.ShippingAdvice || '',
                        lastModifiedDateTime: o.lastModifiedDateTime || new Date().toISOString(),
                        plexuspurchaseOrderLines: o.plexuspurchaseOrderLines || []
                    }))
                );
                setTotalCount(result.totalCount || 0);

            } catch (err: any) {
                setError(err.message || 'Failed to fetch data');
                console.error('Error loading data:', err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [pageIndex, pageSize, sorting]);

    const columns = useMemo<ColumnDef<Traitee>[]>(() => [
        
        {
            header: 'N° Commande',
            accessorKey: 'number',
            enableSorting: true,
            cell: ({ getValue }) => <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{getValue<string>()}</Typography>
        },
        {
            header: 'Date',
            accessorKey: 'orderDate',
            enableSorting: true
        },
        {
            header: 'Fournisseur',
            accessorKey: 'vendorName',
            enableSorting: false
        },
        {
            header: 'N° BL',
            enableSorting: false,
            cell: ({ row }) => {
                const num = row.original.number || '';
                const base = num.replace(/[^0-9]/g, '');
                return <Chip label={`BL-${base.slice(-6)}`} size="small" color="secondary" variant="outlined" />;
            }
        },
        {
            header: 'Statut',
            accessorKey: 'ShippingAdvice',
            enableSorting: false,
            cell: ({ getValue }) => {
                const value = getValue<string>() || 'Confirmé';
                return <Chip color="success" label={value} size="small" variant="light" />;
            }
        },
        {
            header: 'Actions',
            meta: { align: 'center' },
            enableSorting: false,
            cell: ({ row }) => (
                <Tooltip title="Détails">
                    <IconButton
                        color="primary"
                        onClick={(e: MouseEvent<HTMLButtonElement>) => {
                            e.stopPropagation();
                            setExpandedRows(p => ({ ...p, [row.id]: p[row.id] === 'view' ? null : 'view' }));
                        }}
                    >
                        <InfoCircle />
                    </IconButton>
                </Tooltip>
            )
        }
    ], []);

    const table = useReactTable({
        data,
        columns,
        pageCount: Math.ceil(totalCount / pageSize),

        state: {
            sorting,
            globalFilter,
            rowSelection,
            columnFilters,
            pagination: { pageIndex, pageSize }
        },

        manualPagination: true,
        manualSorting: true, // 👈 ADD THIS

        onPaginationChange: setPagination,
        onSortingChange: setSorting,

        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        onGlobalFilterChange: setGlobalFilter,
        onColumnFiltersChange: setColumnFilters,

        getCoreRowModel: getCoreRowModel(),


        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),

        autoResetPageIndex: false,
    });


    return (
        <MainCard content={false}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={2} p={3}>
                <DebouncedInput
                    value={globalFilter}
                    onFilterChange={v => setGlobalFilter(String(v))}
                    placeholder={`Search ${totalCount} records...`}
                />
            </Stack>

            <RowSelection selected={Object.keys(rowSelection).length} />

            {loading && (
                <Box display="flex" justifyContent="center" p={4}>
                    <CircularProgress />
                </Box>
            )}

            {error && (
                <Box p={2}>
                    <Alert severity="error">{error}</Alert>
                </Box>
            )}

            {!loading && !error && (
                <>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                {table.getHeaderGroups().map(hg => (
                                    <TableRow key={hg.id}>
                                        {hg.headers.map(h => (
                                            <TableCell key={h.id} {...h.column.columnDef.meta}>
                                                <Stack direction="row" gap={1} alignItems="center">
                                                    {flexRender(h.column.columnDef.header, h.getContext())}
                                                    {h.column.getCanSort() && <HeaderSort column={h.column} />}
                                                </Stack>
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableHead>

                            <TableBody>
                                {table.getRowModel().rows.length > 0 ? (
                                    table.getRowModel().rows.map(row => {
                                        const mode = expandedRows[row.id];
                                        return (
                                            <Fragment key={row.id}>
                                                <TableRow hover>
                                                    {row.getVisibleCells().map(cell => (
                                                        <TableCell key={cell.id}>
                                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                        </TableCell>
                                                    ))}
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell colSpan={row.getVisibleCells().length} sx={{ p: 0 }}>
                                                        <Collapse in={!!mode} timeout="auto" unmountOnExit>
                                                            <Box
                                                                sx={{
                                                                    p: 2,
                                                                    bgcolor: t => alpha(t.palette.primary.lighter, 0.1)
                                                                }}
                                                            >
                                                                {row.original.plexuspurchaseOrderLines && row.original.plexuspurchaseOrderLines.length > 0 ? (
                                                                    <Table size="small">
                                                                        <TableHead>
                                                                            <TableRow>
                                                                                <TableCell sx={{ fontWeight: 'bold' }}>Num article</TableCell>
                                                                                <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                                                                                <TableCell sx={{ fontWeight: 'bold' }}>Quantité</TableCell>
                                                                                <TableCell sx={{ fontWeight: 'bold' }}>Quantité livrée</TableCell>
                                                                                <TableCell sx={{ fontWeight: 'bold' }}>Quantité Reçue</TableCell>
                                                                                <TableCell sx={{ fontWeight: 'bold' }}>Confirmation</TableCell>
                                                                                <TableCell sx={{ fontWeight: 'bold' }}>Date Livraison</TableCell>
                                                                            </TableRow>
                                                                        </TableHead>
                                                                        <TableBody>
                                                                            {row.original.plexuspurchaseOrderLines.map((line: TraiteeLine, idx: number) => (
                                                                                <TableRow key={line.id || idx}>
                                                                                    <TableCell>{line.lineObjectNumber}</TableCell>
                                                                                    <TableCell>{line.description}</TableCell>
                                                                                    <TableCell>{line.quantity}</TableCell>
                                                                                    <TableCell>{line.receiveQuantity ?? line.quantity}</TableCell>
                                                                                    <TableCell>{line.receivedQuantity ?? line.quantity}</TableCell>
                                                                                    <TableCell>{line.Decision || '-'}</TableCell>
                                                                                    <TableCell>{line.expectedReceiptDate || '-'}</TableCell>
                                                                                </TableRow>
                                                                            ))}
                                                                        </TableBody>
                                                                    </Table>
                                                                ) : (
                                                                    <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>Aucune ligne</Box>
                                                                )}
                                                            </Box>
                                                        </Collapse>
                                                    </TableCell>
                                                </TableRow>
                                            </Fragment>
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={columns.length} align="center" sx={{ py: 4 }}>
                                            No records found
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Divider />

                    <Box p={2}>
                        <TablePagination
                            {...{
                                setPageIndex: table.setPageIndex,
                                setPageSize: table.setPageSize,
                                getPageCount: table.getPageCount,
                                getState: table.getState,
                            }}
                        />
                    </Box>
                </>
            )}
            <Dialog open={!!editOrder} onClose={() => setEditOrder(null)} fullWidth maxWidth="md">
                <DialogTitle>Edit Order</DialogTitle>
                <DialogContent dividers>
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" onClick={() => setEditOrder(null)}>Close</Button>
                </DialogActions>
            </Dialog>
        </MainCard>
    );
}