'use client';

import { useEffect, useMemo, useState, Fragment, MouseEvent } from 'react';
import { alpha } from '@mui/material/styles';
import {
    Button,
    Chip,
    Divider,
    Stack,
    Table,
    TextField,
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
    Snackbar,
    Typography,
    InputAdornment
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
    PaginationState
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
import { Eye, SearchNormal1, TickCircle, Warning2, CloseCircle } from '@wandersonalwes/iconsax-react';

import { fetchReceptionOrders } from 'app/api/services/ValidationReception/ValidationReceptionService';
import { Encours, PurchaseOrderLine } from 'types/Encours';

interface ExtendedLine extends PurchaseOrderLine {
    editedReceivedQty?: number;
}

export default function ValidationReception() {
    const [data, setData] = useState<Encours[]>([]);
    const [sorting, setSorting] = useState<SortingState>([
        { id: 'orderDate', desc: true }
    ]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [rowSelection, setRowSelection] = useState({});
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Pagination
    const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });
    const [totalCount, setTotalCount] = useState(0);

    // Dialog state
    const [selectedOrder, setSelectedOrder] = useState<Encours | null>(null);
    const [editedLines, setEditedLines] = useState<ExtendedLine[]>([]);
    const [lineSearch, setLineSearch] = useState('');
    const [validating, setValidating] = useState(false);

    // Alerts
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    // Fetch data
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = process.env.TOKEN || '';
                const result = await fetchReceptionOrders(token, pageIndex, pageSize);
                setData(
                    result.data.map((o: Encours) => ({
                        id: o.id,
                        number: o.number,
                        orderDate: o.orderDate,
                        vendorName: o.vendorName,
                        payToVendorNumber: o.payToVendorNumber || '',
                        fullyReceived: o.fullyReceived ?? false,
                        status: o.status,
                        ShippingAdvice: o.ShippingAdvice || '',
                        SellToCustomerNo: (o as any).SellToCustomerNo || '',
                        shipToName: (o as any).shipToName || '',
                        lastModifiedDateTime: o.lastModifiedDateTime || new Date().toISOString(),
                        plexuspurchaseOrderLines: o.plexuspurchaseOrderLines || []
                    }))
                );
                setTotalCount(result.totalCount || 0);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch data');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [pageIndex, pageSize, sorting]);

    // Open dialog
    const handleOpenDialog = (order: Encours) => {
        setSelectedOrder(order);
        setEditedLines(
            (order.plexuspurchaseOrderLines || []).map(l => ({
                ...l,
                editedReceivedQty: l.receiveQuantity ?? l.quantity
            }))
        );
        setLineSearch('');
    };

    // Update line received qty
    const handleLineQtyChange = (lineId: string, value: number) => {
        setEditedLines(prev =>
            prev.map(l => l.id === lineId ? { ...l, editedReceivedQty: value } : l)
        );
    };

    // Validate order — client confirms reception
    const handleValidate = async (withReclamation: boolean) => {
        if (!selectedOrder) return;
        setValidating(true);
        try {
            // Call confirm-reception endpoint (sets QtyReceived + ReceivedPurchaseHeader)
            const res = await fetch(
                'http://localhost:8080/api/purchase-orders/confirm-reception',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: selectedOrder.id,
                        withReclamation
                    })
                }
            );

            if (!res.ok) {
                const errText = await res.text();
                throw new Error(errText);
            }

            // Remove from local state immediately for snappy UX
            setData(prev => prev.filter(o => o.id !== selectedOrder.id));
            setTotalCount(prev => prev - 1);
            setSelectedOrder(null);

            setSuccessMsg(
                withReclamation
                    ? 'Commande validée avec réclamation!'
                    : 'Commande validée avec succès!'
            );
        } catch (err: any) {
            setErrorMsg('Erreur: ' + (err.message || 'Erreur inconnue'));
        } finally {
            setValidating(false);
        }
    };

    // Table columns
    const columns = useMemo<ColumnDef<Encours>[]>(() => [
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
            )
        },
        {
            header: 'N° commande',
            accessorKey: 'number',
            enableSorting: true
        },
        {
            header: 'Date commande',
            accessorKey: 'orderDate',
            enableSorting: true
        },
        {
            header: 'Client',
            id: 'client',
            enableSorting: false,
            cell: ({ row }) => {
                const name = (row.original as any).shipToName;
                const no = (row.original as any).SellToCustomerNo;
                return (
                    <Typography variant="body2" fontWeight={500}>{name || no || '-'}</Typography>
                );
            }
        },
        {
            header: 'Statut',
            accessorKey: 'ShippingAdvice',
            enableSorting: false,
            cell: ({ getValue }) => {
                const value = getValue<string>();
                return <Chip color="success" label={value || 'Confirmé'} size="small" variant="light" />;
            }
        },
        {
            header: 'Action',
            meta: { align: 'center' },
            enableSorting: false,
            cell: ({ row }) => (
                <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Eye />}
                    onClick={() => handleOpenDialog(row.original)}
                >
                    Voir détails
                </Button>
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
        manualSorting: true,
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

    // Filter lines by search
    const filteredLines = editedLines.filter(l => {
        if (!lineSearch) return true;
        const search = lineSearch.toLowerCase();
        return (
            l.lineObjectNumber?.toLowerCase().includes(search) ||
            l.description?.toLowerCase().includes(search)
        );
    });

    return (
        <MainCard content={false}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={2} p={3}>
                <Typography variant="h5">Validation de la réception</Typography>
                <DebouncedInput
                    value={globalFilter}
                    onFilterChange={v => setGlobalFilter(String(v))}
                    placeholder={`Chercher ${totalCount} commandes...`}
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
                                            <TableCell key={h.id} {...(h.column.columnDef.meta as any)}>
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
                                    table.getRowModel().rows.map(row => (
                                        <TableRow key={row.id} hover>
                                            {row.getVisibleCells().map(cell => (
                                                <TableCell key={cell.id}>
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={columns.length} align="center" sx={{ py: 4 }}>
                                            Aucune commande en attente de validation
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

            {/* Order Detail Dialog */}
            <Dialog
                open={!!selectedOrder}
                onClose={() => !validating && setSelectedOrder(null)}
                fullWidth
                maxWidth="lg"
            >
                <DialogTitle sx={{ fontWeight: 'bold' }}>
                    Commande N°: {selectedOrder?.number}
                </DialogTitle>
                <DialogContent dividers>
                    {/* Search */}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                        <TextField
                            size="small"
                            placeholder="Chercher"
                            value={lineSearch}
                            onChange={e => setLineSearch(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchNormal1 size={16} />
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Box>

                    {/* Lines Table */}
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Num article</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Quantité</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Quantité expédiée</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Quantité reçue</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Statut</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Date livraison prévue</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredLines.length > 0 ? (
                                    filteredLines.map((line, idx) => (
                                        <TableRow key={line.id || idx}>
                                            <TableCell>{line.lineObjectNumber}</TableCell>
                                            <TableCell>{line.description}</TableCell>
                                            <TableCell>{line.quantity}</TableCell>
                                            <TableCell>{line.receiveQuantity ?? line.quantity}</TableCell>
                                            <TableCell>
                                                <TextField
                                                    type="number"
                                                    size="small"
                                                    value={line.editedReceivedQty ?? ''}
                                                    onChange={e =>
                                                        handleLineQtyChange(line.id, Number(e.target.value))
                                                    }
                                                    sx={{ width: 80 }}
                                                    inputProps={{ min: 0 }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={line.Decision || 'Disponible'}
                                                    size="small"
                                                    color={line.Decision === 'Réclamation' ? 'warning' : 'success'}
                                                    variant="light"
                                                />
                                            </TableCell>
                                            <TableCell>{line.expectedReceiptDate || '-'}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                                            Aucune ligne
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                        Lignes {filteredLines.length > 0 ? 1 : 0} à {filteredLines.length} sur {editedLines.length}
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'flex-end', gap: 1, p: 2 }}>
                    <Button
                        variant="outlined"
                        color="success"
                        startIcon={validating ? <CircularProgress size={16} /> : <TickCircle />}
                        disabled={validating}
                        onClick={() => handleValidate(false)}
                    >
                        Valider
                    </Button>
                    <Button
                        variant="outlined"
                        color="warning"
                        startIcon={validating ? <CircularProgress size={16} /> : <Warning2 />}
                        disabled={validating}
                        onClick={() => handleValidate(true)}
                    >
                        Valider avec reclamation
                    </Button>
                    <Button
                        variant="outlined"
                        color="error"
                        startIcon={<CloseCircle />}
                        disabled={validating}
                        onClick={() => setSelectedOrder(null)}
                    >
                        Annuler
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Success Snackbar */}
            <Snackbar
                open={!!successMsg}
                autoHideDuration={3000}
                onClose={() => setSuccessMsg('')}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert onClose={() => setSuccessMsg('')} severity="success" sx={{ width: '100%' }}>
                    {successMsg}
                </Alert>
            </Snackbar>

            {/* Error Snackbar */}
            <Snackbar
                open={!!errorMsg}
                autoHideDuration={5000}
                onClose={() => setErrorMsg('')}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert onClose={() => setErrorMsg('')} severity="error" sx={{ width: '100%' }}>
                    {errorMsg}
                </Alert>
            </Snackbar>
        </MainCard>
    );
}
