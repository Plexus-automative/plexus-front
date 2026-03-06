'use client';

import { useEffect, useMemo, useState, Fragment, MouseEvent } from 'react';
import axios from 'axios';
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
    MenuItem,
    Snackbar,
    Checkbox,
    Input,
    Paper
} from '@mui/material';
import { Typography } from '@mui/material';

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
import { Eye, Edit, DocumentDownload } from '@wandersonalwes/iconsax-react';

import { fetchEncours } from 'app/api/services/Recues/EncoursRecues';
import { Encours, PurchaseOrderLine } from 'types/Encours';

// Extend the PurchaseOrderLine type to include local UI properties
interface ExtendedPurchaseOrderLine extends PurchaseOrderLine {
    // Keep local extensions if needed, otherwise this can be omitted or merged
}

// Extend Encours to use the extended line type
interface ExtendedEncours extends Omit<Encours, 'plexuspurchaseOrderLines'> {
    plexuspurchaseOrderLines?: ExtendedPurchaseOrderLine[];
}

export default function RecuesEncours() {
    const [data, setData] = useState<Encours[]>([]);
    const [expandedRows, setExpandedRows] = useState<{ [key: string]: 'view' | 'edit' | null }>({});
    const [sorting, setSorting] = useState<SortingState>([
        { id: 'orderDate', desc: true }
    ]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [rowSelection, setRowSelection] = useState({});
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [editOrder, setEditOrder] = useState<ExtendedEncours | null>(null);
    const [editedOrderLocal, setEditedOrderLocal] = useState<ExtendedEncours | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);

    // BL Download states
    const [blDialogOpen, setBlDialogOpen] = useState(false);
    const [blPdfBlob, setBlPdfBlob] = useState<Blob | null>(null);
    const [blFilename, setBlFilename] = useState('BL.pdf');
    const [validating, setValidating] = useState(false);

    // Use pagination state from TanStack Table
    const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    const [totalCount, setTotalCount] = useState(0);

    // Fetch data when pageIndex, pageSize, or sorting changes
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = process.env.TOKEN || '';

                // Fetch with proper pagination
                const result = await fetchEncours(
                    token,
                    pageIndex,
                    pageSize
                );
                setData(
                    result.data.map((o: Encours, index: number) => ({
                        id: o.id,
                        number: o.number,
                        orderDate: o.orderDate,
                        vendorName: o.vendorName,
                        payToVendorNumber: o.payToVendorNumber || '',
                        fullyReceived: o.fullyReceived ?? false,
                        ShippingAdvice: (o as any).ShippingAdvice || '',
                        status: o.status,
                        SellToCustomerNo: (o as any).SellToCustomerNo || '',
                        shipToName: (o as any).shipToName || '',
                        lastModifiedDateTime: o.lastModifiedDateTime || new Date().toISOString(),
                        plexuspurchaseOrderLines: o.plexuspurchaseOrderLines || []
                    }))
                );
                setTotalCount(result.totalCount || 0);
                console.log('Data loaded:', result.data);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch data');
                console.error('Error loading data:', err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [pageIndex, pageSize, sorting]);

    // Mirror editOrder into a local editable copy
    useEffect(() => {
        if (editOrder) {
            // Initialize deliveryQuantity
            const orderWithExtras = {
                ...editOrder,
                plexuspurchaseOrderLines: editOrder.plexuspurchaseOrderLines?.map(line => ({
                    ...line,
                    deliveryQuantity: line.quantity || 0,
                    QuantityAvailable: line.QuantityAvailable || line.quantity || 0,
                    receiveQuantity: line.receiveQuantity || line.quantity || 0,
                    OldRemplacementItemNo: line.OldRemplacementItemNo || ''
                }))
            };
            setEditedOrderLocal(orderWithExtras);
        } else {
            setEditedOrderLocal(null);
        }
    }, [editOrder]);

    // Function to set all delivery quantities to available quantity (le disponible)
    const handleSetDisponible = () => {
        if (!editedOrderLocal) return;

        setEditedOrderLocal(prev => {
            if (!prev) return prev;
            const copy = { ...prev };
            copy.plexuspurchaseOrderLines = copy.plexuspurchaseOrderLines?.map(line => ({
                ...line,
                deliveryQuantity: line.quantity || 0 // Set to original quantity (assuming this is "le disponible")
            }));
            return copy;
        });
    };

    // Function to set all delivery quantities to total available (totalite de disponible)


    // Function to cancel changes (annuler)
    const handleAnnuler = () => {
        setEditOrder(null);
        setEditedOrderLocal(null);
    };

    // === VALIDER: Update order in BC + Generate BL PDF ===
    const handleValider = async () => {
        if (!editedOrderLocal) return;
        setValidating(true);
        try {
            // Send full order data including id for the PATCH
            const response = await axios.post(
                'http://localhost:8080/api/purchase-orders/validate-order',
                editedOrderLocal,
                { responseType: 'blob' }
            );

            const blob = new Blob([response.data], { type: 'application/pdf' });
            const filename = 'BL_' + (editedOrderLocal.number || '').replace(/\//g, '-') + '.pdf';
            setBlPdfBlob(blob);
            setBlFilename(filename);

            // Close edit dialog, open BL download dialog
            setEditOrder(null);
            setEditedOrderLocal(null);
            setBlDialogOpen(true);

            // Remove from local state immediately for snappy UX
            setData(prev => prev.filter(o => o.id !== editedOrderLocal.id));
            setTotalCount(prev => prev - 1);
        } catch (err: any) {
            console.error('Error validating order:', err);
            setError('Erreur lors de la validation: ' + (err.message || 'Erreur inconnue'));
        } finally {
            setValidating(false);
        }
    };

    const handleDownloadBL = () => {
        if (!blPdfBlob) return;
        const url = window.URL.createObjectURL(blPdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = blFilename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

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
            header: 'Num Commande',
            accessorKey: 'number',
            enableSorting: true
        },
        {
            header: 'Date',
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
            header: 'Status',
            accessorKey: 'ShippingAdvice',
            enableSorting: false,
            cell: ({ getValue }) => {
                const ShippingAdvice = getValue<string>();
                switch (ShippingAdvice) {
                    case 'Totalité':
                        return <Chip color="success" label="Totalité" size="small" variant="light" />;
                    case 'ConfirmationPartielle':
                        return <Chip color="info" label="Confirmation Partielle" size="small" variant="light" />;
                    case 'Draft':
                        return <Chip color="warning" label="Draft" size="small" variant="light" />;
                    default:
                        return <Chip color="default" label={status} size="small" />;
                }
            }
        },
        {
            header: 'Actions',
            meta: { align: 'center' },
            enableSorting: false,
            cell: ({ row }) => (
                <Stack direction="row" gap={1} justifyContent="center">
                    <Tooltip title="View">
                        <IconButton
                            color="secondary"
                            onClick={(e: MouseEvent<HTMLButtonElement>) => {
                                e.stopPropagation();
                                setExpandedRows(p => ({ ...p, [row.id]: p[row.id] === 'view' ? null : 'view' }));
                            }}
                        >
                            <Eye />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                        <IconButton
                            color="primary"
                            onClick={() => setEditOrder(row.original as ExtendedEncours)}
                        >
                            <Edit />
                        </IconButton>
                    </Tooltip>
                    {/* Delete action removed */}
                </Stack>
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
                                                        <Collapse in={mode === 'view'} timeout="auto" unmountOnExit>
                                                            <Box
                                                                sx={{
                                                                    p: 2,
                                                                    bgcolor: t => alpha(t.palette.primary.lighter, 0.1)
                                                                }}
                                                            >

                                                                {row.original.plexuspurchaseOrderLines &&
                                                                    row.original.plexuspurchaseOrderLines.length > 0 ? (
                                                                    <Table size="small" sx={{ mt: 2 }}>
                                                                        <TableHead>
                                                                            <TableRow>
                                                                                <TableCell>Num article</TableCell>
                                                                                <TableCell>Description</TableCell>
                                                                                <TableCell>Quantité</TableCell>
                                                                                <TableCell>Prix unitaire</TableCell>
                                                                                <TableCell>Qté disponible</TableCell>
                                                                                <TableCell>Qté livrée</TableCell>
                                                                                <TableCell>Confirmé?</TableCell>
                                                                                <TableCell>Qté à livrer</TableCell>
                                                                                <TableCell>Code remplacement</TableCell>
                                                                            </TableRow>
                                                                        </TableHead>
                                                                        <TableBody>
                                                                            {row.original.plexuspurchaseOrderLines.map((line: ExtendedPurchaseOrderLine) => (
                                                                                <TableRow key={line.id}>
                                                                                    <TableCell>{line.lineObjectNumber}</TableCell>
                                                                                    <TableCell>{line.description}</TableCell>
                                                                                    <TableCell>{line.quantity}</TableCell>
                                                                                    <TableCell>{line.directUnitCost}</TableCell>
                                                                                    <TableCell>{line.QuantityAvailable ?? 0}</TableCell>
                                                                                    <TableCell>{line.receivedQuantity ?? 0}</TableCell>
                                                                                    <TableCell>{line.Decision || '-'}</TableCell>
                                                                                    <TableCell sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                                                                                        {line.receiveQuantity ?? 0}
                                                                                    </TableCell>
                                                                                    <TableCell>{line.OldRemplacementItemNo || '-'}</TableCell>
                                                                                </TableRow>
                                                                            ))}
                                                                        </TableBody>
                                                                    </Table>
                                                                ) : (
                                                                    <Box mt={2}>
                                                                        <Alert severity="info">No purchase lines available</Alert>
                                                                    </Box>
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

            {/* Edit Dialog */}
            <Dialog open={!!editOrder} onClose={() => setEditOrder(null)} fullWidth maxWidth="lg">
                <DialogTitle>Modifier la commande</DialogTitle>
                <DialogContent dividers>
                    {editedOrderLocal ? (
                        <>
                            <Stack direction={{ xs: 'column', sm: 'row' }} gap={2} mb={2} flexWrap="wrap">
                                <Typography variant="subtitle2">Num Commande:</Typography>
                                <Typography>{editedOrderLocal.number}</Typography>
                                <Typography variant="subtitle2">Date:</Typography>
                                <Typography>{editedOrderLocal.orderDate}</Typography>
                                <Typography variant="subtitle2">Fournisseur:</Typography>
                                <Typography>{editedOrderLocal.vendorName}</Typography>
                            </Stack>



                            <strong>Lignes de commande</strong>

                            {editedOrderLocal.plexuspurchaseOrderLines && editedOrderLocal.plexuspurchaseOrderLines.length > 0 ? (
                                <Table size="small" sx={{ mt: 2 }}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Num article</TableCell>
                                            <TableCell>Description</TableCell>
                                            <TableCell>Quantité</TableCell>
                                            <TableCell>Prix unitaire</TableCell>
                                            <TableCell>Qté disponible</TableCell>
                                            <TableCell>Qté livrée</TableCell>
                                            <TableCell>Confirmé?</TableCell>
                                            <TableCell>Qté à livrer</TableCell>
                                            <TableCell>Code remplacement</TableCell>
                                        </TableRow>
                                    </TableHead>

                                    <TableBody>
                                        {editedOrderLocal.plexuspurchaseOrderLines.map((line: ExtendedPurchaseOrderLine, idx: number) => (
                                            <TableRow key={line.id || idx}>
                                                <TableCell>{line.lineObjectNumber}</TableCell>
                                                <TableCell>{line.description || ''}</TableCell>
                                                <TableCell>
                                                    <TextField
                                                        size="small"
                                                        value={line.quantity ?? ''}
                                                        disabled
                                                        sx={{ width: 80 }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        size="small"
                                                        type="number"
                                                        value={line.directUnitCost ?? ''}
                                                        onChange={(e) => {
                                                            const v = e.target.value;
                                                            setEditedOrderLocal(prev => {
                                                                if (!prev) return prev;
                                                                const copy = { ...prev };
                                                                copy.plexuspurchaseOrderLines = copy.plexuspurchaseOrderLines?.map((l: ExtendedPurchaseOrderLine) =>
                                                                    l.id === line.id ? { ...l, directUnitCost: Number(v) } : l
                                                                );
                                                                return copy;
                                                            });
                                                        }}
                                                        sx={{ width: 100 }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        size="small"
                                                        type="number"
                                                        value={line.QuantityAvailable ?? 0}
                                                        onChange={(e) => {
                                                            const v = e.target.value;
                                                            setEditedOrderLocal(prev => {
                                                                if (!prev) return prev;
                                                                const copy = { ...prev };
                                                                copy.plexuspurchaseOrderLines = copy.plexuspurchaseOrderLines?.map((l: ExtendedPurchaseOrderLine) =>
                                                                    l.id === line.id ? { ...l, QuantityAvailable: Number(v) } : l
                                                                );
                                                                return copy;
                                                            });
                                                        }}
                                                        sx={{ width: 100 }}
                                                    />
                                                </TableCell>
                                                <TableCell>{line.receivedQuantity ?? 0}</TableCell>
                                                <TableCell>
                                                    <TextField
                                                        select
                                                        size="small"
                                                        value={line.Decision || ''}
                                                        onChange={(e) => {
                                                            const v = e.target.value;
                                                            setEditedOrderLocal(prev => {
                                                                if (!prev) return prev;
                                                                const copy = { ...prev };
                                                                copy.plexuspurchaseOrderLines = copy.plexuspurchaseOrderLines?.map((l: ExtendedPurchaseOrderLine) =>
                                                                    l.id === line.id ? { ...l, Decision: v } : l
                                                                );
                                                                return copy;
                                                            });
                                                        }}
                                                        sx={{ width: 150 }}
                                                    >
                                                        <MenuItem value="">--</MenuItem>
                                                        <MenuItem value="Disponible">Disponible</MenuItem>
                                                        <MenuItem value="Réclamation">Réclamation</MenuItem>
                                                        <MenuItem value="Remplacement">Remplacement</MenuItem>
                                                    </TextField>
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        size="small"
                                                        type="number"
                                                        value={line.receiveQuantity ?? 0}
                                                        onChange={(e) => {
                                                            const v = e.target.value;
                                                            setEditedOrderLocal(prev => {
                                                                if (!prev) return prev;
                                                                const copy = { ...prev };
                                                                copy.plexuspurchaseOrderLines = copy.plexuspurchaseOrderLines?.map((l: ExtendedPurchaseOrderLine) =>
                                                                    l.id === line.id ? { ...l, receiveQuantity: Number(v) } : l
                                                                );
                                                                return copy;
                                                            });
                                                        }}
                                                        sx={{ width: 100 }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        size="small"
                                                        value={line.OldRemplacementItemNo || ''}
                                                        placeholder="Code remplacement"
                                                        onChange={(e) => {
                                                            const v = e.target.value;
                                                            setEditedOrderLocal(prev => {
                                                                if (!prev) return prev;
                                                                const copy = { ...prev };
                                                                copy.plexuspurchaseOrderLines = copy.plexuspurchaseOrderLines?.map((l: ExtendedPurchaseOrderLine) =>
                                                                    l.id === line.id ? { ...l, OldRemplacementItemNo: v } : l
                                                                );
                                                                return copy;
                                                            });
                                                        }}
                                                        sx={{ width: 150 }}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <Box mt={2}>
                                    <Alert severity="info">Aucune ligne de commande disponible</Alert>
                                </Box>
                            )}
                        </>
                    ) : null}
                </DialogContent>
                <DialogActions>
                    <Button
                        variant="contained"
                        onClick={handleValider}
                        disabled={validating}
                        startIcon={validating ? <CircularProgress size={16} /> : undefined}
                    >
                        {validating ? 'Génération...' : 'Valider'}
                    </Button>

                    <Button variant="outlined" onClick={handleAnnuler}>
                        Annuler
                    </Button>
                </DialogActions>
            </Dialog>

            {/* BL Download Dialog */}
            <Dialog open={blDialogOpen} onClose={() => setBlDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogContent sx={{ textAlign: 'center', py: 4 }}>
                    <Alert severity="success" sx={{ mb: 3, justifyContent: 'center' }}>
                        Modifications effectuées avec succès, veuillez télécharger le BL!
                    </Alert>
                    <Button
                        variant="outlined"
                        size="large"
                        startIcon={<DocumentDownload />}
                        onClick={handleDownloadBL}
                        sx={{ px: 4, py: 1.5 }}
                    >
                        Télécharger BL
                    </Button>
                </DialogContent>
            </Dialog>

            {/* Success Alert */}
            <Snackbar
                open={showSuccessAlert}
                autoHideDuration={3000}
                onClose={() => setShowSuccessAlert(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setShowSuccessAlert(false)}
                    severity="success"
                    sx={{ width: '100%', borderRadius: 2 }}
                >
                    Commande mise à jour avec succès!
                </Alert>
            </Snackbar>
        </MainCard>
    );
}