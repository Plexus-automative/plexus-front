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
import { Eye, Edit, Trash, DocumentDownload } from '@wandersonalwes/iconsax-react';
import { CSVLink } from "react-csv";
import { useSearchParams } from 'next/navigation';

import { fetchNonTraitees } from 'app/api/services/Recues/NonTraiteeRecues';
import axiosServices from 'utils/axios';
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
    const searchParams = useSearchParams();
    const highlightId = searchParams.get('highlight');

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
    const [viewDetailSearch, setViewDetailSearch] = useState<{ [key: string]: string }>({});
    const [editLinesSearch, setEditLinesSearch] = useState('');
    const [customers, setCustomers] = useState<{ [key: string]: string }>({});

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

    // Fetch data when pageIndex or pageSize changes
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch with proper pagination
                const sort = sorting[0];

                const result = await fetchNonTraitees(
                    pageIndex,
                    pageSize,
                    sort?.id,
                    sort?.desc,
                    globalFilter
                );
                setData(
                    result.data.map((o: NonTraitee, index: number) => ({
                        id: o.id,
                        number: o.number,
                        orderDate: o.orderDate,
                        vendorName: o.vendorName,
                        payToVendorNumber: o.payToVendorNumber || '',
                        fullyReceived: o.fullyReceived === true || o.QtyReceived === 'Oui',
                        ShippingAdvice: o.ShippingAdvice,
                        status: o.status,
                        SellToCustomerNo: (o as any).SellToCustomerNo || '',
                        shipToName: (o as any).shipToName || '',
                        postingDate: o.postingDate || o.orderDate,
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
    }, [pageIndex, pageSize, sorting, globalFilter]);

    // Export headers
    const csvHeaders = [
        { label: "Nom", key: "description" },
        { label: "Reference", key: "lineObjectNumber" },
        { label: "Prix Unit HT", key: "directUnitCost" },
        { label: "TVA", key: "taxPercent" },
        { label: "Disponiblite", key: "QuantityAvailable" },
        { label: "Nature", key: "nature" }
    ];

    const getExportDataForOrder = (order: NonTraitee) => {
        const allLines: any[] = [];
        if (order.plexuspurchaseOrderLines) {
            order.plexuspurchaseOrderLines.forEach(l => {
                allLines.push({
                    ...l,
                    description: l.description || '',
                    lineObjectNumber: l.lineObjectNumber || '',
                    directUnitCost: l.directUnitCost || 0,
                    taxPercent: (l as any).taxPercent || 0,
                    QuantityAvailable: (l as any).QuantityAvailable || l.quantity || 0,
                    nature: (l as any).nature?.toLowerCase() === 'adaptable' ? 2 : (l as any).nature?.toLowerCase() === 'casse' ? 3 : 1
                });
            });
        }
        return allLines;
    };

    // Mirror editOrder into a local editable copy
    useEffect(() => {
        if (editOrder) {
            // Initialize deliveryQuantity for each line based on confirmation status
            const orderWithDeliveryQty = {
                ...editOrder,
                plexuspurchaseOrderLines: editOrder.plexuspurchaseOrderLines?.map(line => ({
                    ...line,
                    deliveryQuantity: 0,
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
                const clientName = customers[no] || name || no || '-';
                return (
                    <Typography variant="body2" fontWeight={500}>{clientName}</Typography>
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
                <Stack direction="row" gap={1} justifyContent="center" alignItems="center">
                    <Tooltip title="View">
                        <IconButton
                            color="secondary"
                            onClick={(e: MouseEvent<HTMLButtonElement>) => {
                                e.stopPropagation();
                                setExpandedRows(p => ({ ...p, [row.id]: p[row.id] === 'view' ? null : 'view' }));
                            }}
                        >
                            <Eye style={{ width: 36, height: 36 }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Valide">
                        <IconButton
                            color="primary"
                            onClick={() => setEditOrder(row.original as ExtendedNonTraitee)}
                        >
                            <Edit style={{ width: 36, height: 36 }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Exporter Excel">
                        <span style={{ display: 'inline-flex', verticalAlign: 'middle' }}>
                            <CSVLink
                                data={getExportDataForOrder(row.original)}
                                headers={csvHeaders}
                                filename={`Commandes_${row.original.number.replace(/\//g, '-')}_${new Date().toISOString().split('T')[0]}.csv`}
                                style={{ textDecoration: 'none', display: 'flex' }}
                            >
                                <IconButton color="success">
                                    <DocumentDownload style={{ width: 36, height: 36 }} />
                                </IconButton>
                            </CSVLink>
                        </span>
                    </Tooltip>
                </Stack>
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
                                        const isHighlighted = highlightId === String((row.original as NonTraitee).id);
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
                                                        <Collapse in={!!mode} timeout="auto" unmountOnExit>
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
                                                                                    line.lineObjectNumber,
                                                                                    line.description,
                                                                                    line.Decision,
                                                                                    line.OldRemplacementItemNo
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

                                                                                        <TableCell>Quantité livrée</TableCell>
                                                                                        <TableCell>Confirmé?</TableCell>
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

                                                                                                <TableCell>{line.receivedQuantity ?? 0}</TableCell>
                                                                                                <TableCell>{line.Decision || '-'}</TableCell>
                                                                                                <TableCell>{line.deliveryDate || '-'}</TableCell>
                                                                                            </TableRow>
                                                                                        ))
                                                                                    ) : (
                                                                                        <TableRow>
                                                                                            <TableCell colSpan={6} align="center">
                                                                                                Aucun ligne trouvée
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
                                            No commandes trouvées
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
                                            line.Decision,
                                            line.OldRemplacementItemNo
                                        ]
                                            .filter(Boolean)
                                            .join(' ')
                                            .toLowerCase();
                                        return haystack.includes(term);
                                    })
                                    : lines;

                                const showDateColumn = filteredLines.some((l: ExtendedPurchaseOrderLine) => l.confirmationStatus === 'Liv pevu a date');

                                return (
                                    <Table size="small" sx={{ mt: 2 }}>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Num article</TableCell>
                                                <TableCell>Description</TableCell>
                                                <TableCell>Quantité</TableCell>
                                                <TableCell>Prix unitaire</TableCell>
                                                <TableCell>Quantité livrée</TableCell>
                                                <TableCell>Confirmé?</TableCell>
                                                <TableCell>Quantité à livrer</TableCell>
                                                {showDateColumn && <TableCell>Date de livraison</TableCell>}
                                                <TableCell>Code remplacement</TableCell>
                                            </TableRow>
                                        </TableHead>

                                        <TableBody>
                                            {filteredLines.length > 0 ? (
                                                filteredLines.map((line: ExtendedPurchaseOrderLine, idx: number) => {
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
                                                                                    if (v === 'Disponible' || v === 'Liv pevu a date') {
                                                                                        updatedLine.deliveryQuantity = l.quantity;
                                                                                    } else if (v === 'Non Disponible') {
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
                                                            {showDateColumn && (
                                                                <TableCell>
                                                                    {line.confirmationStatus === 'Liv pevu a date' && (
                                                                        <TextField
                                                                            size="small"
                                                                            type="date"
                                                                            value={line.deliveryDate || ''}
                                                                            onChange={(e) => {
                                                                                const v = e.target.value;
                                                                                setEditedOrderLocal(prev => {
                                                                                    if (!prev) return prev;
                                                                                    const copy = { ...prev };
                                                                                    copy.plexuspurchaseOrderLines = copy.plexuspurchaseOrderLines?.map((l: ExtendedPurchaseOrderLine) =>
                                                                                        l.id === line.id ? { ...l, deliveryDate: v } : l
                                                                                    );
                                                                                    return copy;
                                                                                });
                                                                            }}
                                                                            sx={{ width: 130 }}
                                                                            InputLabelProps={{ shrink: true }}
                                                                        />
                                                                    )}
                                                                </TableCell>
                                                            )}
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
                                                })
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={showDateColumn ? 9 : 8} align="center">
                                                        Aucun ligne trouvée
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

                                const orderUpdateBody: any = {
                                    ShippingAdvice: "ConfirmationPartielle"
                                };

                                // Update the main order
                                await axiosServices.patch(`/api/purchase-orders/${orderId}`, orderUpdateBody);

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

                                        // Patch QuantityAvailable with the value from Quantité à livrer
                                        lineUpdateBody.QuantityAvailable = Number(line.deliveryQuantity);
                                        console.log(lineUpdateBody);
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

                                        await axiosServices.patch(`/api/purchase-orders/lines/${line.id}`, lineUpdateBody);
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