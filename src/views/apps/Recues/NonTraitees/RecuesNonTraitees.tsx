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
    MenuItem,
    Snackbar
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
import { Eye, Edit, Trash } from '@wandersonalwes/iconsax-react';

import { fetchNonTraitees } from 'app/api/services/Recues/NonTraiteeRecues';
import { NonTraitee, PurchaseOrderLine } from 'types/NonTraitee';

// Extend the PurchaseOrderLine type to include local UI properties
interface ExtendedPurchaseOrderLine extends PurchaseOrderLine {
    deliveryQuantity?: number;
    deliveryDate?: string;
    confirmationStatus?: string;
    OldRemplacementItemNo?: string;
    OldUnitPrice?: number; // Add this field to store original price
}

// Extend NonTraitee to use the extended line type
interface ExtendedNonTraitee extends Omit<NonTraitee, 'plexuspurchaseOrderLines'> {
    plexuspurchaseOrderLines?: ExtendedPurchaseOrderLine[];
}

export default function RecuesNonTraitees() {
    const [data, setData] = useState<NonTraitee[]>([]);
    const [expandedRows, setExpandedRows] = useState<{ [key: string]: 'view' | 'edit' | null }>({});
    const [sorting, setSorting] = useState<SortingState>([
        { id: 'orderDate', desc: true }
    ]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [rowSelection, setRowSelection] = useState({});
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [editOrder, setEditOrder] = useState<ExtendedNonTraitee | null>(null);
    const [editedOrderLocal, setEditedOrderLocal] = useState<ExtendedNonTraitee | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);

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

                // Fetch with proper pagination
                const sort = sorting[0];

                const result = await fetchNonTraitees(
                    token,
                    pageIndex,
                    pageSize,
                    sort?.id,
                    sort?.desc
                );
                setData(
                    result.data.map((o: NonTraitee, index: number) => ({
                        id: o.id,
                        number: o.number,
                        orderDate: o.orderDate,
                        vendorName: o.vendorName,
                        payToVendorNumber: o.payToVendorNumber || '',
                        fullyReceived: o.fullyReceived ?? false,
                        ShippingAdvice: o.ShippingAdvice,
                        status: o.status,
                        SellToCustomerNo: (o as any).SellToCustomerNo || '',
                        shipToName: (o as any).shipToName || '',
                        lastModifiedDateTime: o.lastModifiedDateTime || new Date().toISOString(),
                        plexuspurchaseOrderLines: o.plexuspurchaseOrderLines || []
                    }))
                );
                setTotalCount(result.totalCount || 0);
                console.log('Fetched data:', result.data);
            } catch (err: any) {
                setError('Try Again Later');
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
            // Initialize deliveryQuantity for each line based on confirmation status
            const orderWithDeliveryQty = {
                ...editOrder,
                plexuspurchaseOrderLines: editOrder.plexuspurchaseOrderLines?.map(line => ({
                    ...line,
                    deliveryQuantity: line.confirmationStatus === 'Non Disponible' ? 0 : (line.deliveryQuantity || line.quantity || 0),
                    OldRemplacementItemNo: line.OldRemplacementItemNo || '',
                    OldUnitPrice: line.directUnitCost // Capture the original unit price
                }))
            };
            setEditedOrderLocal(orderWithDeliveryQty);
        } else {
            setEditedOrderLocal(null);
        }
    }, [editOrder]);

    const columns = useMemo<ColumnDef<NonTraitee>[]>(() => [
        
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
                const status = getValue<string>();
                switch (status) {
                    case 'Released':
                        return <Chip color="success" label="Released" size="small" variant="light" />;
                    case 'Open':
                        return <Chip color="info" label="Open" size="small" variant="light" />;
                    case 'Attente':
                        return <Chip color="warning" label="En Attente" size="small" variant="light" />;
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
                    <Tooltip title="Valide">
                        <IconButton
                            color="primary"
                            onClick={() => setEditOrder(row.original as ExtendedNonTraitee)}
                        >
                            <Edit />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                        <IconButton color="error">
                            <Trash />
                        </IconButton>
                    </Tooltip>
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
                                                        <Collapse in={!!mode} timeout="auto" unmountOnExit>
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
                                                                                <TableCell>Quantité livrée</TableCell>
                                                                                <TableCell>Confirmé?</TableCell>
                                                                                <TableCell>Quantité à livrer</TableCell>
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
            <Dialog open={!!editOrder} onClose={() => setEditOrder(null)} fullWidth maxWidth="lg">
                <DialogTitle>Valide Article</DialogTitle>
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

                            <strong>Purchase Order Lines</strong>

                            {editedOrderLocal.plexuspurchaseOrderLines && editedOrderLocal.plexuspurchaseOrderLines.length > 0 ? (
                                <Table size="small" sx={{ mt: 2 }}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Num article</TableCell>
                                            <TableCell>Description</TableCell>
                                            <TableCell>Quantité</TableCell>
                                            <TableCell>Prix unitaire</TableCell>
                                            <TableCell>Qté disponible</TableCell>
                                            <TableCell>Quantité livrée</TableCell>
                                            <TableCell>Confirmé?</TableCell>
                                            <TableCell>Quantité à livrer</TableCell>
                                            <TableCell>Code remplacement</TableCell>
                                        </TableRow>
                                    </TableHead>

                                    <TableBody>
                                        {editedOrderLocal.plexuspurchaseOrderLines.map((line: ExtendedPurchaseOrderLine, idx: number) => {
                                            return (
                                                <TableRow key={line.id || idx}>
                                                    <TableCell>{line.lineObjectNumber}</TableCell>
                                                    <TableCell>{line.description ?? ''}</TableCell>
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
                                                            value={line.confirmationStatus ?? ''}
                                                            onChange={(e) => {
                                                                const v = e.target.value;
                                                                setEditedOrderLocal(prev => {
                                                                    if (!prev) return prev;
                                                                    const copy = { ...prev };
                                                                    copy.plexuspurchaseOrderLines = copy.plexuspurchaseOrderLines?.map((l: ExtendedPurchaseOrderLine) => {
                                                                        if (l.id === line.id) {
                                                                            const updatedLine = { ...l, confirmationStatus: v };
                                                                            if (v === 'Non Disponible') {
                                                                                updatedLine.deliveryQuantity = 0;
                                                                            }
                                                                            return updatedLine;
                                                                        }
                                                                        return l;
                                                                    });
                                                                    return copy;
                                                                });
                                                            }}
                                                            sx={{ width: 150 }}
                                                        >
                                                            <MenuItem value="">--</MenuItem>
                                                            <MenuItem value="Disponible">Disponible</MenuItem>
                                                            <MenuItem value="Non Disponible">Non Disponible</MenuItem>
                                                            <MenuItem value="Liv pevu a date">Liv pevu a date</MenuItem>
                                                        </TextField>
                                                    </TableCell>
                                                    <TableCell>
                                                        <TextField
                                                            size="small"
                                                            type="number"
                                                            value={line.deliveryQuantity ?? (line.confirmationStatus === 'Non Disponible' ? 0 : line.quantity ?? 0)}
                                                            disabled={line.confirmationStatus === 'Non Disponible'}
                                                            onChange={(e) => {
                                                                const v = e.target.value;
                                                                const numValue = Number(v);
                                                                const maxQty = Number(line.quantity) || 0;
                                                                if (numValue > maxQty) return;
                                                                setEditedOrderLocal(prev => {
                                                                    if (!prev) return prev;
                                                                    const copy = { ...prev };
                                                                    copy.plexuspurchaseOrderLines = copy.plexuspurchaseOrderLines?.map((l: ExtendedPurchaseOrderLine) =>
                                                                        l.id === line.id ? { ...l, deliveryQuantity: numValue } : l
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
                                                            value={line.OldRemplacementItemNo ?? ''}
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
                                                            placeholder="Code remplacement"
                                                            sx={{ width: 150 }}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            ) : (
                                <Box mt={2}>
                                    <Alert severity="info">No purchase lines available</Alert>
                                </Box>
                            )}
                        </>
                    ) : null}
                </DialogContent>
                <DialogActions>
                    <Button variant="outlined" onClick={() => { setEditOrder(null); setEditedOrderLocal(null); }}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={async () => {
                            if (!editedOrderLocal) return;

                            try {
                                const orderId = editedOrderLocal.id;

                                // Always set ShippingAdvice to "ConfirmationPartielle"
                                const shippingAdvice = 'ConfirmationPartielle';

                                // Prepare the update object for the main order
                                const orderUpdateBody: any = {
                                    ShippingAdvice: shippingAdvice
                                };

                                // Update the main order
                                await fetch(
                                    `http://localhost:8080/api/purchase-orders/${orderId}`,
                                    {
                                        method: 'PATCH',
                                        headers: {
                                            'Content-Type': 'application/json',
                                        },
                                        body: JSON.stringify(orderUpdateBody)
                                    }
                                );

                                // Update individual lines
                                if (editedOrderLocal.plexuspurchaseOrderLines) {
                                    for (const line of editedOrderLocal.plexuspurchaseOrderLines) {
                                        const originalLine = editOrder?.plexuspurchaseOrderLines?.find(
                                            (l: ExtendedPurchaseOrderLine) => l.id === line.id
                                        );

                                        if (!originalLine) continue;

                                        // Prepare line update body
                                        const lineUpdateBody: any = {};

                                        // Check if quantity changed
                                        if (Number(line.deliveryQuantity) !== Number(originalLine.quantity)) {
                                            lineUpdateBody.receiveQuantity = Number(line.deliveryQuantity);
                                        }

                                        // Check if unit cost changed and track old price
                                        if (line.directUnitCost !== originalLine.directUnitCost) {
                                            lineUpdateBody.directUnitCost = Number(line.directUnitCost);
                                            lineUpdateBody.OldUnitPrice = originalLine.directUnitCost; // Send old price
                                        }

                                        // Check if description changed
                                        if (line.description !== originalLine.description) {
                                            lineUpdateBody.description = line.description;
                                        }

                                        // Check if replacement code changed
                                        if (line.OldRemplacementItemNo !== originalLine.OldRemplacementItemNo) {
                                            lineUpdateBody.OldRemplacementItemNo = line.OldRemplacementItemNo || '';
                                        }

                                        // Check if QuantityAvailable changed
                                        if (line.QuantityAvailable !== originalLine.QuantityAvailable) {
                                            lineUpdateBody.QuantityAvailable = Number(line.QuantityAvailable);
                                        }

                                        // Add Decision field based on confirmation status
                                        if (line.confirmationStatus) {
                                            switch (line.confirmationStatus) {
                                                case 'Disponible':
                                                    lineUpdateBody.Decision = 'Disponible';
                                                    break;
                                                case 'Non Disponible':
                                                    lineUpdateBody.Decision = 'NonDisponible';
                                                    break;
                                                case 'Liv pevu a date':
                                                    lineUpdateBody.Decision = 'LivPrevuaDate';
                                                    // Add delivery date to the line if this is the Liv pevu a date line
                                                    if (line.deliveryDate) {
                                                        lineUpdateBody.expectedReceiptDate = line.deliveryDate;
                                                        console.log('Adding delivery date to line:', line.id, line.deliveryDate);
                                                    }
                                                    break;
                                            }
                                        }

                                        // Only update if there are changes
                                        if (Object.keys(lineUpdateBody).length === 0) continue;

                                        await fetch(
                                            `http://localhost:8080/api/purchase-orders/lines/${line.id}`,
                                            {
                                                method: 'PATCH',
                                                headers: {
                                                    'Content-Type': 'application/json',
                                                },
                                                body: JSON.stringify(lineUpdateBody)
                                            }
                                        );
                                    }
                                }

                                // Update UI - remove from table for snappy UX
                                setData(prev =>
                                    prev.filter(d => d.id !== editedOrderLocal.id)
                                );
                                setTotalCount(prev => prev - 1);

                                setEditOrder(null);
                                setEditedOrderLocal(null);
                                setShowSuccessAlert(true);

                            } catch (error) {
                                console.error('PATCH ERROR:', error);
                                alert('Error while updating order');
                            }
                        }}
                    >
                        Valide
                    </Button>
                </DialogActions>
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