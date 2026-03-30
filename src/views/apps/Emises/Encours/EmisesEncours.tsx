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
    Radio,
    RadioGroup,
    FormControlLabel,
    FormControl,
    FormLabel,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    Snackbar,
    CircularProgress
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
import { Eye, Edit, Trash, DocumentDownload, ArrowCircleRight, Printer } from '@wandersonalwes/iconsax-react';
import { useSearchParams } from 'next/navigation';

import { fetchEncours } from 'app/api/services/Emises/EncoursEmises';
import axiosServices from 'utils/axios';
import { Encours, PurchaseOrderLine } from 'types/Encours';
import { printOrder } from 'utils/printOrder';

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
    const searchParams = useSearchParams();
    const highlightId = searchParams.get('highlight');

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
    const [viewDetailSearch, setViewDetailSearch] = useState<{ [key: string]: string }>({});
    const [editLinesSearch, setEditLinesSearch] = useState('');

    // BL Download states
    const [blDialogOpen, setBlDialogOpen] = useState(false);
    const [blPdfBlob, setBlPdfBlob] = useState<Blob | null>(null);
    const [blFilename, setBlFilename] = useState('BL.pdf');

    // Cancellation modal states
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState('');

    // Use pagination state from TanStack Table
    const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    const [totalCount, setTotalCount] = useState(0);

    // Reset to page 0 when filter changes
    useEffect(() => {
        setPagination(p => ({ ...p, pageIndex: 0 }));
    }, [globalFilter]);

    // Fetch data when pageIndex, pageSize, or sorting changes
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError(null);
            try {
                const result = await fetchEncours(
                    pageIndex,
                    pageSize,
                    undefined,
                    undefined,
                    globalFilter
                );
                setData(
                    result.data.map((o: Encours, index: number) => ({
                        id: o.id,
                        number: o.number,
                        orderDate: o.orderDate,
                        vendorName: o.vendorName || (o as any).payToName || (o as any).buyFromVendorName || o.payToVendorNumber || '-',
                        payToVendorNumber: o.payToVendorNumber || '',
                        fullyReceived: o.fullyReceived === true || o.QtyReceived === 'Oui',
                        status: o.status,
                        ShippingAdvice: (o as any).ShippingAdvice || '',
                        postingDate: o.postingDate || o.orderDate,
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
    }, [pageIndex, pageSize, sorting, globalFilter]);

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
                        return <Chip color="primary" label="Livrer la totalité" size="small" variant="light" />;
                    case 'LivraisonDispo':
                        return <Chip color="secondary" label="Livrer le disponible" size="small" variant="light" />;
                    default:
                        return <Chip color="default" label={advice || '-'} size="small" />;
                }
            }
        },
        {
            header: 'Actions',
            id: 'actions',
            meta: { align: 'center' },
            enableSorting: false,
            cell: ({ row }) => {
                const ShippingAdvice = (row.original as any).ShippingAdvice;
                return (
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
                        {
                            ShippingAdvice == "ConfirmationPartielle" &&
                            <Tooltip title="Valide">
                                <IconButton
                                    color="primary"
                                    onClick={() => setEditOrder(row.original as ExtendedEncours)}
                                >
                                    <Edit />
                                </IconButton>
                            </Tooltip>
                        }
                        <Tooltip title="Imprimer">
                            <IconButton
                                color="info"
                                onClick={(e: MouseEvent<HTMLButtonElement>) => {
                                    e.stopPropagation();
                                    printOrder(row.original);
                                }}
                            >
                                <Printer />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                )
            }
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
                                        const isHighlighted = highlightId === String((row.original as Encours).id);
                                        return (
                                            <Fragment key={row.id}>
                                                <TableRow
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
                                                <TableRow>
                                                    <TableCell colSpan={row.getVisibleCells().length} sx={{ p: 0 }}>
                                                        <Collapse in={mode === 'view'} timeout="auto" unmountOnExit>
                                                            <Box
                                                                sx={{
                                                                    p: 2,
                                                                    bgcolor: t => alpha(t.palette.primary.lighter, 0.1)
                                                                }}
                                                            >
                                                                <Stack direction="row" justifyContent="flex-end" alignItems="center" mb={2}>
                                                                    <TextField
                                                                        size="small"
                                                                        label="Chercher"
                                                                        value={viewDetailSearch[row.id] || ''}
                                                                        onChange={(e) =>
                                                                            setViewDetailSearch(prev => ({
                                                                                ...prev,
                                                                                [row.id]: e.target.value
                                                                            }))
                                                                        }
                                                                    />
                                                                </Stack>

                                                                {row.original.plexuspurchaseOrderLines &&
                                                                    row.original.plexuspurchaseOrderLines.length > 0 ? (() => {
                                                                        const lines = row.original.plexuspurchaseOrderLines as ExtendedPurchaseOrderLine[];
                                                                        const term = (viewDetailSearch[row.id] || '').toLowerCase().trim();
                                                                        const filteredLines = term
                                                                            ? lines.filter((line) => {
                                                                                const haystack = [
                                                                                    line.sequence,
                                                                                    line.lineObjectNumber,
                                                                                    line.description,
                                                                                    line.Decision
                                                                                ]
                                                                                    .filter(Boolean)
                                                                                    .join(' ')
                                                                                    .toLowerCase();
                                                                                return haystack.includes(term);
                                                                            })
                                                                            : lines;

                                                                        return (
                                                                            <Table size="small" sx={{ mt: 2 }}>
                                                                                <TableHead>
                                                                                    <TableRow>
                                                                                        <TableCell>Num article</TableCell>
                                                                                        <TableCell>Description</TableCell>
                                                                                        <TableCell>Quantité</TableCell>
                                                                                        <TableCell>Prix unitaire</TableCell>
                                                                                        <TableCell>Ancienne prix</TableCell>
                                                                                        <TableCell>Quantité disponible</TableCell>
                                                                                        <TableCell>Quantité validée</TableCell>
                                                                                        <TableCell>Quantité expédiée</TableCell>
                                                                                        <TableCell>Quantité Reçue</TableCell>
                                                                                        <TableCell>Confirmation</TableCell>
                                                                                        <TableCell>Date Livraison</TableCell>
                                                                                    </TableRow>
                                                                                </TableHead>
                                                                                <TableBody>
                                                                                    {filteredLines.length > 0 ? (
                                                                                        filteredLines.map((line: ExtendedPurchaseOrderLine) => (
                                                                                            <TableRow key={line.id}>
                                                                                                <TableCell>{line.lineObjectNumber}</TableCell>
                                                                                                <TableCell>{line.description}</TableCell>
                                                                                                <TableCell>{line.quantity}</TableCell>
                                                                                                <TableCell>{line.directUnitCost}</TableCell>
                                                                                                <TableCell>{line.OldUnitPrice || '-'}</TableCell>
                                                                                                <TableCell>{line.QuantityAvailable || '-'}</TableCell>
                                                                                                <TableCell>{line.receiveQuantity || 0}</TableCell>
                                                                                                <TableCell>{(line as any).quantityShipped || 0}</TableCell>
                                                                                                <TableCell>{line.receivedQuantity || 0}</TableCell>
                                                                                                <TableCell>{line.Decision || '-'}</TableCell>
                                                                                                <TableCell>{line.DeliveryDate || '-'}</TableCell>
                                                                                            </TableRow>
                                                                                        ))
                                                                                    ) : (
                                                                                        <TableRow>
                                                                                            <TableCell colSpan={10} align="center">
                                                                                                No lines found
                                                                                            </TableCell>
                                                                                        </TableRow>
                                                                                    )}
                                                                                </TableBody>
                                                                            </Table>
                                                                        );
                                                                    })() : (
                                                                    <Box mt={2}>
                                                                        <Alert severity="info">Aucune ligne d'achat disponible</Alert>
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

                            <Stack direction="row" justifyContent="flex-end" mb={2}>
                                <TextField
                                    size="small"
                                    label="Chercher"
                                    value={editLinesSearch}
                                    onChange={(e) => setEditLinesSearch(e.target.value)}
                                />
                            </Stack>

                            {editedOrderLocal.plexuspurchaseOrderLines && editedOrderLocal.plexuspurchaseOrderLines.length > 0 ? (() => {
                                const lines = editedOrderLocal.plexuspurchaseOrderLines as ExtendedPurchaseOrderLine[];
                                const term = editLinesSearch.toLowerCase().trim();
                                const filteredLines = term
                                    ? lines.filter((line) => {
                                        const haystack = [
                                            line.lineObjectNumber,
                                            line.description,
                                            line.Decision
                                        ]
                                            .filter(Boolean)
                                            .join(' ')
                                            .toLowerCase();
                                        return haystack.includes(term);
                                    })
                                    : lines;

                                return (
                                    <Table size="small" sx={{ mt: 2 }}>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Num article</TableCell>
                                                <TableCell>Description</TableCell>
                                                <TableCell>Quantité</TableCell>
                                                <TableCell>Prix unitaire</TableCell>
                                                <TableCell>Ancienne prix</TableCell>
                                                <TableCell>Quantité disponible</TableCell>
                                                <TableCell>Quantité validée</TableCell>
                                                <TableCell>Quantité expédiée</TableCell>
                                                <TableCell>Quantité Reçue</TableCell>
                                                <TableCell>Confirmation</TableCell>
                                                <TableCell>Date Livraison</TableCell>
                                            </TableRow>
                                        </TableHead>

                                        <TableBody>
                                            {filteredLines.length > 0 ? (
                                                filteredLines.map((line: ExtendedPurchaseOrderLine, idx: number) => (
                                                    <TableRow key={line.id || idx}>
                                                        <TableCell>{line.lineObjectNumber}</TableCell>
                                                        <TableCell>
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
                                                                type="number"
                                                                value={line.OldUnitPrice ?? ''}
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
                                                                type="number"

                                                                disabled
                                                                value={line.QuantityAvailable ?? 0}
                                                                onChange={(e) => {
                                                                    const v = e.target.value;
                                                                    const numValue = Number(v);
                                                                    const maxQty = Number(line.QuantityAvailable) || 0;

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
                                                                value={line.invoiceQuantity || 0}
                                                                onChange={(e) => {
                                                                    const v = e.target.value;
                                                                    const numValue = Number(v);
                                                                    setEditedOrderLocal(prev => {
                                                                        if (!prev) return prev;
                                                                        const copy = { ...prev };
                                                                        copy.plexuspurchaseOrderLines = copy.plexuspurchaseOrderLines?.map((l: ExtendedPurchaseOrderLine) =>
                                                                            l.id === line.id ? { ...l, invoiceQuantity: numValue } : l
                                                                        );
                                                                        console.log({ copy })
                                                                        return copy;
                                                                    });
                                                                }}
                                                                inputProps={{
                                                                    min: 0,
                                                                    max: line.QuantityAvailable || 0,
                                                                }}
                                                                error={Number(line.invoiceQuantity) > Number(line.quantity)}
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
                                                            <Typography variant="body2">{(line as any).receivedQuantity ?? '-'}</Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography variant="body2">{line.receivedQuantity ?? '-'}</Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography variant="body2">{line.Decision || '-'}</Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography variant="body2">{line.expectedReceiptDate || '-'}</Typography>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={10} align="center">
                                                        Aucune ligne trouvée
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                );
                            })() : (
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
                            console.log({ editedOrderLocal })
                            try {
                                const orderId = editedOrderLocal.id;

                                // Shipping advice = Totalité
                                const shippingAdvice = 'Totalité';

                                const orderUpdateBody: any = {
                                    ShippingAdvice: shippingAdvice
                                };

                                // Update main order
                                await axiosServices.patch(`/api/purchase-orders/${orderId}`, orderUpdateBody);

                                // Update lines
                                if (editedOrderLocal.plexuspurchaseOrderLines) {
                                    for (const line of editedOrderLocal.plexuspurchaseOrderLines) {
                                        const originalLine = editOrder?.plexuspurchaseOrderLines?.find(
                                            (l: ExtendedPurchaseOrderLine) => l.id === line.id
                                        );

                                        if (!originalLine) continue;

                                        const lineUpdateBody: any = {};

                                        // Patch receiveQuantity with the validated quantity from the UI (invoiceQuantity)
                                        lineUpdateBody.receiveQuantity = Number(line.invoiceQuantity ?? line.quantity);
                                        lineUpdateBody.Decision = "Disponible";

                                        if (Object.keys(lineUpdateBody).length === 0) continue;

                                        await axiosServices.patch(`/api/purchase-orders/lines/${line.id}`, lineUpdateBody);
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

                                await axiosServices.patch(`/api/purchase-orders/${orderId}`, { ShippingAdvice: shippingAdvice });

                                if (editedOrderLocal.plexuspurchaseOrderLines) {
                                    for (const line of editedOrderLocal.plexuspurchaseOrderLines) {
                                        const originalLine = editOrder?.plexuspurchaseOrderLines?.find(
                                            (l: ExtendedPurchaseOrderLine) => l.id === line.id
                                        );

                                        if (!originalLine) continue;

                                        const lineUpdateBody: any = {
                                            receiveQuantity: Number(line.invoiceQuantity ?? line.quantity),
                                            Decision: "Disponible"
                                        };

                                        await axiosServices.patch(`/api/purchase-orders/lines/${line.id}`, lineUpdateBody);
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
                    <Button
                        variant="outlined"
                        onClick={() => setCancelModalOpen(true)}
                    >
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

            {/* Cancellation Reason Modal - Modern Design */}
            <Dialog
                open={cancelModalOpen}
                onClose={() => setCancelModalOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: '16px',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                        overflow: 'hidden'
                    }
                }}
            >
                <DialogTitle sx={{ pb: 0, pt: 3, px: 3 }}>
                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 700,
                            color: 'error.main',
                            letterSpacing: '-0.5px'
                        }}
                    >
                        Veuillez choisir un motif d'annulation :
                    </Typography>
                </DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                    <FormControl component="fieldset" fullWidth>
                        <RadioGroup
                            aria-label="cancel-reason"
                            name="cancel-reason"
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                        >
                            {[
                                { group: "Annulation par l'expert:", options: ["Prix", "Réparation", "Autres"], key: "Expert" },
                                { group: "Annulation par le client:", options: ["Prix", "Disponibilité", "Autres"], key: "Client" },
                                { group: "Annulation par l'adhérant :", options: ["Prix", "Temps de réponse", "Service fournisseur", "Erreur"], key: "Adhérant" },
                                { group: "Annulation par l'assurance:", options: ["EPAVE", "Autres"], key: "Assurance" }
                            ].map((section, sIdx) => (
                                <Box key={section.key} sx={{ mb: sIdx === 3 ? 0 : 2.5 }}>
                                    <Typography
                                        variant="subtitle2"
                                        sx={{
                                            fontWeight: 700,
                                            color: 'text.secondary',
                                            mb: 1,
                                            textTransform: 'uppercase',
                                            fontSize: '0.75rem',
                                            letterSpacing: '1px'
                                        }}
                                    >
                                        {section.group}
                                    </Typography>
                                    <Stack direction="row" flexWrap="wrap" gap={1}>
                                        {section.options.map(opt => (
                                            <Paper
                                                key={opt}
                                                elevation={0}
                                                sx={{
                                                    border: '1px solid',
                                                    borderColor: cancelReason === `${section.key} - ${opt}` ? 'primary.main' : 'divider',
                                                    borderRadius: '8px',
                                                    bgcolor: cancelReason === `${section.key} - ${opt}` ? alpha('#1890ff', 0.05) : 'transparent',
                                                    transition: 'all 0.2s',
                                                    '&:hover': {
                                                        borderColor: 'primary.main',
                                                        bgcolor: alpha('#1890ff', 0.02)
                                                    }
                                                }}
                                            >
                                                <FormControlLabel
                                                    value={`${section.key} - ${opt}`}
                                                    control={<Radio size="small" sx={{ ml: 1 }} />}
                                                    label={opt}
                                                    sx={{
                                                        m: 0,
                                                        pr: 2,
                                                        '& .MuiTypography-root': {
                                                            fontSize: '0.9rem',
                                                            fontWeight: cancelReason === `${section.key} - ${opt}` ? 600 : 400
                                                        }
                                                    }}
                                                />
                                            </Paper>
                                        ))}
                                    </Stack>
                                </Box>
                            ))}
                        </RadioGroup>
                    </FormControl>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 1, backgroundColor: alpha('#f4f6f8', 0.5) }}>
                    <Button
                        fullWidth
                        size="large"
                        variant="contained"
                        disabled={!cancelReason}
                        onClick={async () => {
                            if (!editedOrderLocal) return;
                            try {
                                const orderId = editedOrderLocal.id;
                                await axiosServices.patch(`/api/purchase-orders/${orderId}`, {
                                    ShippingAdvice: 'Annulation',
                                    CauseofCancellation: cancelReason
                                });

                                // Remove from local UI
                                setData(prev => prev.filter(d => d.id !== orderId));
                                setTotalCount(prev => prev - 1);

                                setCancelModalOpen(false);
                                setEditOrder(null);
                                setEditedOrderLocal(null);
                                setCancelReason('');
                                setShowSuccessAlert(true);
                            } catch (error) {
                                console.error('CANCELLATION ERROR:', error);
                                alert('Error while cancelling order');
                            }
                        }}
                        startIcon={<ArrowCircleRight variant="Bold" />}
                        sx={{
                            borderRadius: '12px',
                            py: 1.5,
                            fontWeight: 600,
                            fontSize: '1rem',
                            textTransform: 'none',
                            boxShadow: '0 4px 12px rgba(46, 125, 50, 0.2)',
                            bgcolor: '#5eb432',
                            '&:hover': {
                                bgcolor: '#4e9a2a',
                                boxShadow: '0 6px 16px rgba(46, 125, 50, 0.3)'
                            },
                            '&.Mui-disabled': {
                                bgcolor: alpha('#5eb432', 0.1),
                                color: alpha('#000', 0.2)
                            }
                        }}
                    >
                        Confirmer l'annulation
                    </Button>
                </DialogActions>
            </Dialog>
        </MainCard>
    );
}