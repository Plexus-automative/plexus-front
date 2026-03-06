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
import { Eye, Edit, Trash, DocumentDownload } from '@wandersonalwes/iconsax-react';

import { fetchEncours } from 'app/api/services/Emises/EncoursEmises';
import { Encours, PurchaseOrderLine } from 'types/Encours';

// Extend the PurchaseOrderLine type to include local UI properties
interface ExtendedPurchaseOrderLine extends PurchaseOrderLine {
    deliveryQuantity?: number;
    deliveryDate?: string;
    confirmationStatus?: string;
    OldRemplacementItemNo?: string;
    OldUnitPrice?: number; // Field to store original price
}

// Extend Encours to use the extended line type
interface ExtendedEncours extends Omit<Encours, 'plexuspurchaseOrderLines'> {
    plexuspurchaseOrderLines?: ExtendedPurchaseOrderLine[];
}

export default function EmisesEncours() {
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
                        status: o.status,
                        ShippingAdvice: (o as any).ShippingAdvice || '',
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



    // Function to set all delivery quantities to total available (totalite de disponible)


    // Function to cancel changes (annuler)
    const handleAnnuler = () => {
        setEditOrder(null);
        setEditedOrderLocal(null);
    };

    const columns = useMemo<ColumnDef<Encours>[]>(() => [
        

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
            header: 'Fournisseur',
            accessorKey: 'vendorName',
            enableSorting: false
        },
        {
            header: 'Status',
            accessorKey: 'ShippingAdvice',
            enableSorting: false,
            cell: ({ getValue }) => {
                const advice = getValue<string>();
                switch (advice) {
                    case 'Attente':
                        return <Chip color="warning" label="En Attente" size="small" variant="light" />;
                    case 'ConfirmationPartielle':
                        return <Chip color="info" label="Confirmation Partielle" size="small" variant="light" />;
                    case 'Confirmé':
                        return <Chip color="success" label="Confirmé" size="small" variant="light" />;
                    case 'Totalité':
                        return <Chip color="primary" label="Totalité" size="small" variant="light" />;
                    case 'LivraisonDispo':
                        return <Chip color="secondary" label="Livraison Dispo" size="small" variant="light" />;
                    default:
                        return <Chip color="default" label={advice || '-'} size="small" />;
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
                            onClick={() => setEditOrder(row.original as ExtendedEncours)}
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
                                                        <Collapse in={mode === 'view'} timeout="auto" unmountOnExit>
                                                            <Box
                                                                sx={{
                                                                    p: 2,
                                                                    bgcolor: t => alpha(t.palette.primary.lighter, 0.1)
                                                                }}
                                                            >
                                                                <strong>Purchase Order Lines</strong>

                                                                {row.original.plexuspurchaseOrderLines &&
                                                                    row.original.plexuspurchaseOrderLines.length > 0 ? (
                                                                    <Table size="small" sx={{ mt: 2 }}>
                                                                        <TableHead>
                                                                            <TableRow>
                                                                                <TableCell>Seq</TableCell>
                                                                                <TableCell>Item No</TableCell>
                                                                                <TableCell>Description</TableCell>
                                                                                <TableCell>Qty</TableCell>
                                                                                <TableCell>Unit Cost</TableCell>
                                                                                <TableCell>Old Unit Price</TableCell>
                                                                                <TableCell>Tax %</TableCell>
                                                                                <TableCell>Confirmation</TableCell>
                                                                                <TableCell>Total (TTC)</TableCell>
                                                                            </TableRow>
                                                                        </TableHead>
                                                                        <TableBody>
                                                                            {row.original.plexuspurchaseOrderLines.map((line: ExtendedPurchaseOrderLine) => (
                                                                                <TableRow key={line.id}>
                                                                                    <TableCell>{line.sequence}</TableCell>
                                                                                    <TableCell>{line.lineObjectNumber}</TableCell>
                                                                                    <TableCell>{line.description}</TableCell>
                                                                                    <TableCell>{line.quantity}</TableCell>
                                                                                    <TableCell>{line.directUnitCost}</TableCell>
                                                                                    <TableCell>{line.OldUnitPrice || '-'}</TableCell>
                                                                                    <TableCell>{line.taxPercent}%</TableCell>
                                                                                    <TableCell>{line.Decision}</TableCell>
                                                                                    <TableCell>{line.amountIncludingTax}</TableCell>
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
                                            <TableCell>Item No</TableCell>
                                            <TableCell>Description</TableCell>
                                            <TableCell>Qté</TableCell>
                                            <TableCell>Prix unitaire</TableCell>
                                            <TableCell>Ancien prix</TableCell>
                                            <TableCell>Qté disponible</TableCell>
                                            <TableCell>Qté valide</TableCell>
                                            <TableCell>Qté expediee</TableCell>
                                            <TableCell>Qté recue</TableCell>
                                            <TableCell>Decision</TableCell>
                                        </TableRow>
                                    </TableHead>

                                    <TableBody>
                                        {editedOrderLocal.plexuspurchaseOrderLines.map((line: ExtendedPurchaseOrderLine, idx: number) => (
                                            <TableRow key={line.id || idx}>
                                                <TableCell>{line.lineObjectNumber}</TableCell>
                                                <TableCell>
                                                    {/* Disabled but still showing text */}
                                                    <Typography variant="body2">{line.description || ''}</Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        size="small"
                                                        value={line.quantity ?? ''}
                                                        disabled
                                                        InputProps={{
                                                            readOnly: true,
                                                        }}
                                                    />
                                                </TableCell>

                                                <TableCell>
                                                    <TextField
                                                        size="small"
                                                        type="number"
                                                        value={line.directUnitCost ?? ''}
                                                        disabled
                                                        InputProps={{
                                                            readOnly: true,
                                                            style: {
                                                                color: '#2e7d32',
                                                                fontWeight: 'bold'
                                                            }
                                                        }}
                                                        sx={{
                                                            '& .MuiInputBase-input.Mui-disabled': {
                                                                WebkitTextFillColor: '#2e7d32',
                                                                fontWeight: 'bold'
                                                            }
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        size="small"
                                                        value={line.OldUnitPrice ?? ''}
                                                        disabled
                                                        InputProps={{
                                                            readOnly: true,
                                                            style: {
                                                                color: '#d32f2f',
                                                                fontWeight: 'bold'
                                                            }
                                                        }}
                                                        sx={{
                                                            '& .MuiInputBase-input.Mui-disabled': {
                                                                WebkitTextFillColor: '#d32f2f',
                                                                fontWeight: 'bold'
                                                            }
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        size="small"
                                                        type="number"
                                                        disabled
                                                        value={line.QuantityAvailable ?? 0}
                                                        onChange={(e) => {
                                                            const v = e.target.value;
                                                            const numValue = Number(v);
                                                            const maxQty = Number(line.QuantityAvailable) || 0;

                                                            // Validation: cannot exceed original quantity
                                                            if (numValue > maxQty) {
                                                                return;
                                                            }

                                                            setEditedOrderLocal(prev => {
                                                                if (!prev) return prev;
                                                                const copy = { ...prev };
                                                                copy.plexuspurchaseOrderLines = copy.plexuspurchaseOrderLines?.map((l: ExtendedPurchaseOrderLine) =>
                                                                    l.id === line.id ? { ...l, QuantityAvailable: numValue } : l
                                                                );
                                                                return copy;
                                                            });
                                                        }}
                                                        inputProps={{
                                                            min: 0,
                                                            max: line.quantity || 0,
                                                        }}
                                                        error={Number(line.deliveryQuantity) > Number(line.quantity)}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        size="small"
                                                        type="number"
                                                        value={line.receiveQuantity ?? 0}
                                                        onChange={(e) => {
                                                            const v = e.target.value;
                                                            const numValue = Number(v);
                                                            const maxQty = Number(line.quantity) || 0;

                                                            // Validation: cannot exceed original quantity
                                                            if (numValue > maxQty) {
                                                                return;
                                                            }

                                                            setEditedOrderLocal(prev => {
                                                                if (!prev) return prev;
                                                                const copy = { ...prev };
                                                                copy.plexuspurchaseOrderLines = copy.plexuspurchaseOrderLines?.map((l: ExtendedPurchaseOrderLine) =>
                                                                    l.id === line.id ? { ...l, receiveQuantity: numValue } : l
                                                                );
                                                                return copy;
                                                            });
                                                        }}
                                                        inputProps={{
                                                            min: 0,
                                                            max: line.quantity || 0,
                                                        }}
                                                        error={Number(line.receiveQuantity) > Number(line.quantity)}
                                                        sx={{
                                                            '& .MuiInputBase-input': {
                                                                WebkitTextFillColor: '#1976d2',
                                                                fontWeight: 'bold',
                                                                color: '#1976d2'
                                                            }
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        size="small"
                                                        type="number"
                                                        disabled
                                                        value={line.receivedQuantity ?? 0}
                                                        onChange={(e) => {
                                                            const v = e.target.value;
                                                            const numValue = Number(v);
                                                            const maxQty = Number(line.quantity) || 0;

                                                            // Validation: cannot exceed original quantity
                                                            if (numValue > maxQty) {
                                                                return;
                                                            }

                                                            setEditedOrderLocal(prev => {
                                                                if (!prev) return prev;
                                                                const copy = { ...prev };
                                                                copy.plexuspurchaseOrderLines = copy.plexuspurchaseOrderLines?.map((l: ExtendedPurchaseOrderLine) =>
                                                                    l.id === line.id ? { ...l, receivedQuantity: numValue } : l
                                                                );
                                                                return copy;
                                                            });
                                                        }}
                                                        inputProps={{
                                                            min: 0,
                                                            max: line.quantity || 0,
                                                        }}
                                                        error={Number(line.deliveryQuantity) > Number(line.quantity)}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        size="small"
                                                        type="number"
                                                        disabled
                                                        value={line.receivedQuantity ?? 0}
                                                        onChange={(e) => {
                                                            const v = e.target.value;
                                                            const numValue = Number(v);
                                                            const maxQty = Number(line.quantity) || 0;

                                                            // Validation: cannot exceed original quantity
                                                            if (numValue > maxQty) {
                                                                return;
                                                            }

                                                            setEditedOrderLocal(prev => {
                                                                if (!prev) return prev;
                                                                const copy = { ...prev };
                                                                copy.plexuspurchaseOrderLines = copy.plexuspurchaseOrderLines?.map((l: ExtendedPurchaseOrderLine) =>
                                                                    l.id === line.id ? { ...l, receivedQuantity: numValue } : l
                                                                );
                                                                return copy;
                                                            });
                                                        }}
                                                        inputProps={{
                                                            min: 0,
                                                            max: line.quantity || 0,
                                                        }}
                                                        error={Number(line.receivedQuantity) > Number(line.quantity)}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2">{line.Decision || ''}</Typography>

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
                        onClick={async () => {
                            if (!editedOrderLocal) return;

                            try {
                                const orderId = editedOrderLocal.id;

                                // Shipping advice = Totalité
                                const shippingAdvice = 'Totalité';

                                const orderUpdateBody: any = {
                                    ShippingAdvice: shippingAdvice
                                };

                                // Update main order
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

                                // Update lines
                                if (editedOrderLocal.plexuspurchaseOrderLines) {
                                    for (const line of editedOrderLocal.plexuspurchaseOrderLines) {
                                        const originalLine = editOrder?.plexuspurchaseOrderLines?.find(
                                            (l: ExtendedPurchaseOrderLine) => l.id === line.id
                                        );

                                        if (!originalLine) continue;

                                        const lineUpdateBody: any = {};

                                        // Send receiveQuantity and Decision
                                        if (Number(line.receiveQuantity) !== Number(originalLine.receiveQuantity)) {
                                            lineUpdateBody.receiveQuantity = Number(line.receiveQuantity);
                                        }

                                        lineUpdateBody.Decision = "Disponible";

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

                                // Update UI by removing the order from the table (snappy UX)
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
                        Totalité de disponible
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={async () => {
                            if (!editedOrderLocal) return;

                            try {
                                const orderId = editedOrderLocal.id;

                                // Shipping advice = LivraisonDispo
                                const shippingAdvice = 'LivraisonDispo';

                                await fetch(
                                    `http://localhost:8080/api/purchase-orders/${orderId}`,
                                    {
                                        method: 'PATCH',
                                        headers: {
                                            'Content-Type': 'application/json',
                                        },
                                        body: JSON.stringify({ ShippingAdvice: shippingAdvice })
                                    }
                                );

                                if (editedOrderLocal.plexuspurchaseOrderLines) {
                                    for (const line of editedOrderLocal.plexuspurchaseOrderLines) {
                                        const originalLine = editOrder?.plexuspurchaseOrderLines?.find(
                                            (l: ExtendedPurchaseOrderLine) => l.id === line.id
                                        );

                                        if (!originalLine) continue;

                                        const lineUpdateBody: any = {
                                            receiveQuantity: Number(line.quantity), // send quantity
                                            Decision: "Disponible"
                                        };

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

                                setData(prev =>
                                    prev.map(d =>
                                        d.id === editedOrderLocal.id ? editedOrderLocal as Encours : d
                                    )
                                );

                                setEditOrder(null);
                                setEditedOrderLocal(null);
                                setShowSuccessAlert(true);

                            } catch (error) {
                                console.error('PATCH ERROR:', error);
                                alert('Error while updating order');
                            }
                        }}
                    >
                        Le disponible
                    </Button>
                    <Button variant="outlined" >
                        Annuler
                    </Button>
                    <Button
                        onClick={handleAnnuler}
                        variant="contained"
                        color="error"
                    >
                        Quitter
                    </Button>

                </DialogActions>
            </Dialog>

            {/* BL Download Dialog */}
            <Dialog open={blDialogOpen} onClose={() => setBlDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogContent sx={{ textAlign: 'center', py: 4 }}>
                    <Alert severity="success" sx={{ mb: 3, justifyContent: 'center' }}>
                        Commande validée avec succès, veuillez télécharger le BL!
                    </Alert>
                    <Button
                        variant="outlined"
                        size="large"
                        startIcon={<DocumentDownload />}
                        onClick={() => {
                            if (!blPdfBlob) return;
                            const url = window.URL.createObjectURL(blPdfBlob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = blFilename;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            window.URL.revokeObjectURL(url);
                        }}
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