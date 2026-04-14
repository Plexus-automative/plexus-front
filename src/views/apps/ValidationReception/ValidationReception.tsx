'use client';

import { useEffect, useMemo, useState } from 'react';
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
    Box,
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

import { Eye, SearchNormal1, TickCircle, Warning2, CloseCircle } from '@wandersonalwes/iconsax-react';
import { useSearchParams } from 'next/navigation';

import { fetchReceptionOrders } from 'app/api/services/ValidationReception/ValidationReceptionService';
import axiosServices from 'utils/axios';
import { Encours, PurchaseOrderLine } from 'types/Encours';

interface ExtendedLine extends PurchaseOrderLine {
    editedReceivedQty?: number;
}

export default function ValidationReception() {
    const searchParams = useSearchParams();
    const highlightId = searchParams.get('highlight');

    const [data, setData] = useState<Encours[]>([]);
    const [sorting, setSorting] = useState<SortingState>([
        { id: 'number', desc: true }
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

    // Réclamation dialog
    const [reclamationOpen, setReclamationOpen] = useState(false);
    const [reclamationText, setReclamationText] = useState('');

    // Alerts
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [customers, setCustomers] = useState<{ [key: string]: string }>({});

    // Fetch customers
    useEffect(() => {
        const loadCustomers = async () => {
            try {
                const res = await axiosServices.get('/api/purchase-orders/customers');
                if (res.data && res.data.value) {
                    const map: { [key: string]: string } = {};
                    res.data.value.forEach((c: any) => {
                        map[c.number] = c.displayName;
                    });
                    setCustomers(map);
                }
            } catch (err) {
                console.error('Error fetching customers:', err);
            }
        };
        loadCustomers();
    }, []);

    // Fetch data
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError(null);
            try {
                const result = await fetchReceptionOrders(pageIndex, pageSize);
                setData(
                    result.data.map((o: Encours) => ({
                        id: o.id,
                        number: o.number,
                        orderDate: o.orderDate,
                        vendorName: o.vendorName || (o as any).payToName || (o as any).buyFromVendorName || o.payToVendorNumber || '-',
                        payToVendorNumber: o.payToVendorNumber || '',
                        fullyReceived: o.QtyReceived === 'Oui',
                        status: o.status,
                        ShippingAdvice: o.ShippingAdvice || '',
                        SellToCustomerNo: (o as any).SellToCustomerNo || '',
                        shipToName: (o as any).shipToName || '',
                        postingDate: o.postingDate || o.orderDate,
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
    const handleValidate = async (withReclamation: boolean, reclamation?: string) => {
        if (!selectedOrder) return;
        setValidating(true);
        try {
            // Call confirm-reception endpoint (sets QtyReceived + ReceivedPurchaseHeader)
            const res = await axiosServices.post(`/api/purchase-orders/confirm-reception`, {
                id: selectedOrder.id,
                withReclamation,
                reclamationText: reclamation || ''
            });

            // Note: res is the axios response object, the data is in res.data
            // However, the original code used response.ok from fetch.
            // axios throws for non-2xx by default.

            // res.data check if needed, but axios throws on error

            // Remove from local state immediately for snappy UX
            setData(prev => prev.filter(o => o.id !== selectedOrder.id));
            setTotalCount(prev => prev - 1);
            setSelectedOrder(null);
            setReclamationOpen(false);
            setReclamationText('');

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
                const clientName = customers[no] || name || no || '-';
                return (
                    <Typography variant="body2" fontWeight={500}>{clientName}</Typography>
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
    ], [customers]);

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
                                    table.getRowModel().rows.map(row => {
                                        const isHighlighted = highlightId === String((row.original as Encours).id);
                                        return (
                                            <TableRow
                                                key={row.id}
                                                hover
                                                sx={{
                                                    ...(isHighlighted && {
                                                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                                                        borderLeft: (theme) => `4px solid ${theme.palette.primary.main}`
                                                    })
                                                }}
                                            >
                                                {row.getVisibleCells().map(cell => (
                                                    <TableCell key={cell.id}>
                                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        );
                                    })
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
                                            <TableCell>{line.DeliveryDate || '-'}</TableCell>
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
                        startIcon={<Warning2 />}
                        disabled={validating}
                        onClick={() => {
                            setReclamationText('');
                            setReclamationOpen(true);
                        }}
                    >
                        Valider avec réclamation
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

            {/* Réclamation Dialog */}
            <Dialog
                open={reclamationOpen}
                onClose={() => !validating && setReclamationOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ fontWeight: 'bold' }}>Saisir la réclamation</DialogTitle>
                <DialogContent dividers>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                        Veuillez décrire votre réclamation concernant la commande N° <strong>{selectedOrder?.number}</strong>.
                    </Typography>
                    <TextField
                        autoFocus
                        multiline
                        rows={4}
                        fullWidth
                        label="Motif de la réclamation"
                        placeholder="Ex: Quantité reçue incorrecte, articles endommagés..."
                        value={reclamationText}
                        onChange={e => setReclamationText(e.target.value)}
                        disabled={validating}
                    />
                </DialogContent>
                <DialogActions sx={{ gap: 1, p: 2 }}>
                    <Button
                        variant="contained"
                        color="warning"
                        startIcon={validating ? <CircularProgress size={16} /> : <Warning2 />}
                        disabled={validating || !reclamationText.trim()}
                        onClick={() => handleValidate(true, reclamationText)}
                    >
                        {validating ? 'Validation...' : 'Confirmer la réclamation'}
                    </Button>
                    <Button
                        variant="outlined"
                        disabled={validating}
                        onClick={() => setReclamationOpen(false)}
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
