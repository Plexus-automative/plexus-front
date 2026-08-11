'use client';

import { useEffect, useMemo, useState, Fragment, MouseEvent } from 'react';
import axiosServices from 'utils/axios';
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
    Paper,
    Tabs,
    Tab
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
import LastPriceUpdate from 'components/prix/LastPriceUpdate';
import { invalidatePriceUpdate } from 'app/api/services/PriceHistoryService';
import { Eye, Edit, DocumentDownload, Printer } from '@wandersonalwes/iconsax-react';
import { CSVLink } from "react-csv";

import { fetchEncours } from 'app/api/services/Recues/EncoursRecues';
import { Encours, PurchaseOrderLine } from 'types/Encours';
import { printOrder } from 'utils/printOrder';
import { useSearchParams } from 'next/navigation';

// Extend the PurchaseOrderLine type to include local UI properties
interface ExtendedPurchaseOrderLine extends PurchaseOrderLine {
    selected?: boolean;
}

// Extend Encours to use the extended line type
interface ExtendedEncours extends Omit<Encours, 'plexuspurchaseOrderLines'> {
    plexuspurchaseOrderLines?: ExtendedPurchaseOrderLine[];
}

export default function RecuesEncours() {
    const searchParams = useSearchParams();
    const highlightId = searchParams.get('highlight');
    const urlTab = searchParams.get('tab');

    const [activeTab, setActiveTab] = useState<'validation' | 'valide'>(
        (urlTab === 'valide' || urlTab === 'validation') ? urlTab : 'validation'
    );

    // Sync activeTab if urlTab query param changes
    useEffect(() => {
        if (urlTab === 'valide' || urlTab === 'validation') {
            setActiveTab(urlTab);
        }
    }, [urlTab]);

    const [data, setData] = useState<Encours[]>([]);
    const [expandedRows, setExpandedRows] = useState<{ [key: string]: 'view' | 'edit' | null }>({});
    const [sorting, setSorting] = useState<SortingState>([
        { id: 'number', desc: true }
    ]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [registrationFilter, setRegistrationFilter] = useState('');
    const [rowSelection, setRowSelection] = useState({});
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [editOrder, setEditOrder] = useState<ExtendedEncours | null>(null);
    const [editedOrderLocal, setEditedOrderLocal] = useState<ExtendedEncours | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [lineSearch, setLineSearch] = useState('');
    const [viewDetailSearch, setViewDetailSearch] = useState<{ [key: string]: string }>({});
    const [customers, setCustomers] = useState<{ [key: string]: string }>({});

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

    // Reset to page 0 when filter or tab changes
    useEffect(() => {
        setPagination(p => ({ ...p, pageIndex: 0 }));
    }, [globalFilter, registrationFilter, activeTab]);

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

    // Fetch data when pageIndex, pageSize, or sorting changes
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch with proper pagination and sorting
                const sort = sorting[0];
                const result = await fetchEncours(
                    pageIndex,
                    pageSize,
                    sort?.id,
                    sort?.desc,
                    globalFilter,
                    registrationFilter,
                    activeTab
                );
                setData(
                    result.data.map((o: Encours, index: number) => ({
                        id: o.id,
                        number: o.number,
                        orderDate: o.orderDate,
                        vendorName: o.vendorName,
                        payToVendorNumber: o.payToVendorNumber || '',
                        fullyReceived: o.QtyReceived === 'Oui',
                        ShippingAdvice: (o as any).ShippingAdvice || '',
                        status: o.status,
                        SellToCustomerNo: (o as any).SellToCustomerNo || '',
                        shipToName: (o as any).shipToName || '',
                        shipToAddressLine1: (o as any).shipToAddressLine1 || '',
                        shipToAddressLine2: (o as any).shipToAddressLine2 || '',
                        shipToCity: (o as any).shipToCity || '',
                        shipToPostCode: (o as any).shipToPostCode || '',
                        shipToContact: (o as any).shipToContact || '',
                        RegistrationNumber: (o as any).RegistrationNumber || '',
                        VIN: (o as any).VIN || (o as any).vin || '',
                        MatriculeFiscale: (o as any).MatriculeFiscale || '',
                        SellToPhoneNo: (o as any).SellToPhoneNo || '',
                        PhoneNo: (o as any).PhoneNo || '',
                        shipToPhone: (o as any).shipToPhone || '',
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
    }, [pageIndex, pageSize, sorting, globalFilter, registrationFilter, activeTab]);

    // Export headers
    const csvHeaders = [
        { label: "Nom", key: "description" },
        { label: "Reference", key: "lineObjectNumber" },
        { label: "Prix Unit HT", key: "directUnitCost" },
        { label: "TVA", key: "taxPercent" },
        { label: "Disponiblite", key: "QuantityAvailable" },
        { label: "Nature", key: "nature" }
    ];

    const getExportDataForOrder = (order: Encours) => {
        const allLines: any[] = [];
        if (order.plexuspurchaseOrderLines) {
            order.plexuspurchaseOrderLines.forEach(l => {
                allLines.push({
                    ...l,
                    description: l.description || '',
                    lineObjectNumber: l.lineObjectNumber || '',
                    directUnitCost: l.directUnitCost || 0,
                    taxPercent: l.taxPercent || 0,
                    QuantityAvailable: l.QuantityAvailable || 0,
                    nature: (l as any).nature?.toLowerCase() === 'adaptable' ? 2 : (l as any).nature?.toLowerCase() === 'casse' ? 3 : 1
                });
            });
        }
        return allLines;
    };

    // Mirror editOrder into a local editable copy
    useEffect(() => {
        if (editOrder) {
            // Initialize deliveryQuantity
            const orderWithExtras = {
                ...editOrder,
                plexuspurchaseOrderLines: editOrder.plexuspurchaseOrderLines?.map(line => ({
                    ...line,
                    selected: true,
                    deliveryQuantity: line.quantity || 0,
                    QuantityAvailable: line.QuantityAvailable,
                    Decision: line.Decision,
                    receiveQuantity: line.receiveQuantity || line.quantity || 0,
                    OldRemplacementItemNo: line.OldRemplacementItemNo || '',
                    DeliveryDate: line.DeliveryDate || ''
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
            const allLines = editedOrderLocal.plexuspurchaseOrderLines || [];

            // Prepare lines for submission: selected lines get updated, unselected ones are marked for deletion
            const processedLines = allLines.map(line => {
                if (line.selected === false) {
                    return {
                        ...line,
                        Decision: 'NonDisponible' // Backend will delete lines with this Decision
                    };
                }
                const qty = Number(line.invoiceQuantity ?? line.quantity ?? 0);
                return {
                    ...line,
                    quantity: qty,
                    receiveQuantity: qty,
                    QuantityAvailable: qty,
                    Decision: line.Decision || 'Disponible'
                };
            });

            const orderToSubmit = {
                ...editedOrderLocal,
                ShippingAdvice: 'Confirmé',
                plexuspurchaseOrderLines: processedLines
            };

            // Send full order data including id for the PATCH
            const response = await axiosServices.post(
                `/api/purchase-orders/validate-order`,
                orderToSubmit,
                {
                    responseType: 'blob',
                    timeout: 120000 // 2 minutes to prevent automatic client-side retries
                }
            );

            // La validation peut avoir modifié des prix : BC a écrit de nouvelles entrées
            // d'historique, on vide le cache pour que les puces « MAJ prix » les relisent.
            invalidatePriceUpdate();

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
            let errorMessage = 'Erreur inconnue';
            if (err.response?.data instanceof Blob) {
                const text = await err.response.data.text();
                errorMessage = text || err.message;
            } else {
                errorMessage = err.response?.data || err.message;
            }
            setError('Erreur lors de la validation: ' + errorMessage);
        } finally {
            setValidating(false);
        }
    };
    const filteredLines = useMemo(() => {
        if (!editedOrderLocal?.plexuspurchaseOrderLines) return [];

        return editedOrderLocal.plexuspurchaseOrderLines.filter((line) =>
            (line.lineObjectNumber || '').toLowerCase().includes(lineSearch.toLowerCase()) ||
            (line.description || '').toLowerCase().includes(lineSearch.toLowerCase())
        );
    }, [lineSearch, editedOrderLocal]);
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
                const ShippingAdvice = getValue<string>();
                switch (ShippingAdvice) {
                    case 'Totalité':
                        return <Chip label="Totalité" size="small" sx={{ bgcolor: 'rgba(76, 175, 80, 0.15)', color: '#2E7D32', fontWeight: 600 }} />;
                    case 'ConfirmationPartielle':
                        return <Chip color="warning" label="Confirmation Partielle" size="small" variant="light" />;
                    case 'Draft':
                        return <Chip color="warning" label="Draft" size="small" variant="light" />;
                    case 'Livrer Disponible':
                    case 'LivraisonDispo':
                        return <Chip label="Livraison Dispo" size="small" sx={{ bgcolor: 'rgba(255, 193, 7, 0.2)', color: '#795548', fontWeight: 600 }} />;
                    default:
                        return <Chip color="default" label={ShippingAdvice} size="small" />;
                }
            }
        },
        {
            header: 'Actions',
            meta: { align: 'center' },
            id: 'actions',
            enableSorting: false,
            cell: ({ row }) => {
                const ShippingAdvice = (row.original as any).ShippingAdvice;
                return (
                    <Stack direction="row" gap={1} justifyContent="center" alignItems="center">
                        <Tooltip title="View">
                            <IconButton
                                color="secondary"
                                onClick={(e: MouseEvent<HTMLButtonElement>) => {
                                    e.stopPropagation();
                                    setExpandedRows(p => p[row.id] === 'view' ? {} : { [row.id]: 'view' });
                                }}
                            >
                                <Eye style={{ width: 36, height: 36 }} />
                            </IconButton>
                        </Tooltip>
                        {
                            (ShippingAdvice === "Totalité" || ShippingAdvice === "LivraisonDispo" || ShippingAdvice === "Livrer Disponible") && <Tooltip title="Valide">
                                <IconButton
                                    color="primary"
                                    onClick={() => setEditOrder(row.original as ExtendedEncours)}
                                >
                                    <Edit style={{ width: 36, height: 36 }} />
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
                                <Printer style={{ width: 36, height: 36 }} />
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
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" gap={2} sx={{ px: 3, py: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                <DebouncedInput
                    value={globalFilter}
                    onFilterChange={v => setGlobalFilter(String(v))}
                    placeholder="Chercher commandes..."
                />

                <Box
                    sx={{
                        display: 'inline-flex',
                        bgcolor: 'grey.100',
                        p: 0.5,
                        borderRadius: 3,
                        border: '1px solid',
                        borderColor: 'grey.200',
                    }}
                >
                    <Tabs
                        value={activeTab}
                        onChange={(e, value) => setActiveTab(value)}
                        sx={{
                            minHeight: 'auto',
                            '& .MuiTabs-indicator': {
                                height: '100%',
                                borderRadius: 2.5,
                                bgcolor: 'common.white',
                                boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
                                zIndex: 0,
                            },
                        }}
                    >
                        <Tab
                            label="En cours de validation"
                            value="validation"
                            sx={{
                                minHeight: 'auto',
                                py: 1,
                                px: 3,
                                borderRadius: 2.5,
                                fontWeight: 600,
                                textTransform: 'none',
                                transition: 'color 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                                zIndex: 1,
                                color: activeTab === 'validation' ? 'primary.main' : 'text.secondary',
                                '&.Mui-selected': {
                                    color: 'primary.main',
                                },
                                '&:hover': {
                                    color: 'primary.main',
                                },
                            }}
                        />
                        <Tab
                            label="Validées"
                            value="valide"
                            sx={{
                                minHeight: 'auto',
                                py: 1,
                                px: 3,
                                borderRadius: 2.5,
                                fontWeight: 600,
                                textTransform: 'none',
                                transition: 'color 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                                zIndex: 1,
                                color: activeTab === 'valide' ? 'primary.main' : 'text.secondary',
                                '&.Mui-selected': {
                                    color: 'primary.main',
                                },
                                '&:hover': {
                                    color: 'primary.main',
                                },
                            }}
                        />
                    </Tabs>
                </Box>
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
                                        const status = (row.original as any).ShippingAdvice;
                                        const rowBg = isHighlighted 
                                            ? (theme) => alpha(theme.palette.primary.main, 0.1)
                                            : (status === 'Totalité' ? 'rgba(76, 175, 80, 0.08)'
                                                : (status === 'LivraisonDispo' || status === 'Livrer Disponible') ? 'rgba(255, 193, 7, 0.08)'
                                                    : 'transparent');
                                        return (
                                            <Fragment key={row.id}>
                                                <TableRow 
                                                    hover 
                                                    sx={{ 
                                                        bgcolor: rowBg,
                                                        ...(isHighlighted && {
                                                            borderLeft: (theme) =>
                                                                `4px solid ${theme.palette.primary.main}`
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
                                                                                        <TableCell>Prix unitaire</TableCell>

                                                                                        <TableCell>Quantité</TableCell>
                                                                                        <TableCell>Quantité disponible</TableCell>
                                                                                        <TableCell>Quantité validée par le client</TableCell>
                                                                                        <TableCell>Quantité livrée</TableCell>
                                                                                        <TableCell>Confirmation</TableCell>
                                                                                        <TableCell>Date Livraison</TableCell>

                                                                                    </TableRow>
                                                                                </TableHead>
                                                                                <TableBody>
                                                                                    {filteredLines.length > 0 ? (
                                                                                        filteredLines.map((line: ExtendedPurchaseOrderLine) => (
                                                                                            <TableRow
                                                                                                key={line.id}
                                                                                                sx={{
                                                                                                    bgcolor: line.Decision === 'NonDisponible'
                                                                                                        ? (theme) => alpha(theme.palette.error.main, 0.12)
                                                                                                        : 'inherit'
                                                                                                }}
                                                                                            >
                                                                                                <TableCell>
                                                                                                    <Stack>
                                                                                                        {line.OldRemplacementItemNo && (
                                                                                                            <>
                                                                                                                <Typography
                                                                                                                    variant="caption"
                                                                                                                    sx={{
                                                                                                                        color: 'error.main',
                                                                                                                        textDecoration: 'line-through',
                                                                                                                        fontWeight: 'bold'
                                                                                                                    }}
                                                                                                                >
                                                                                                                    {line.lineObjectNumber}
                                                                                                                </Typography>
                                                                                                                <Typography
                                                                                                                    variant="body2"
                                                                                                                    sx={{ color: 'text.secondary' }}
                                                                                                                >
                                                                                                                    {line.OldRemplacementItemNo}
                                                                                                                </Typography>
                                                                                                            </>
                                                                                                        )}
                                                                                                        {!line.OldRemplacementItemNo && (
                                                                                                            <Typography variant="body2">
                                                                                                                {line.lineObjectNumber}
                                                                                                                </Typography>
                                                                                                        )}
                                                                                                    </Stack>
                                                                                                </TableCell>
                                                                                                <TableCell>{line.description}</TableCell>
                                                                                                <TableCell>
                                                                                                    <Stack spacing={0.5}>
                                                                                                        {line.OldUnitPrice !== undefined && line.OldUnitPrice !== null && line.OldUnitPrice !== 0 ? (
                                                                                                            <Typography
                                                                                                                variant="caption"
                                                                                                                sx={{
                                                                                                                    color: "error.main",
                                                                                                                    textDecoration: "line-through",
                                                                                                                    fontWeight: "bold",
                                                                                                                }}
                                                                                                            >
                                                                                                                {line.OldUnitPrice}
                                                                                                            </Typography>
                                                                                                        ) : null}
                                                                                                        <Typography variant="body2" sx={{ fontWeight: "bold", color: "#2e7d32" }}>
                                                                                                            {line.directUnitCost}
                                                                                                        </Typography>
                                                                                                        <LastPriceUpdate itemNo={line.lineObjectNumber} />
                                                                                                    </Stack>
                                                                                                </TableCell>
                                                                                                <TableCell>{line.quantity}</TableCell>
                                                                                                <TableCell sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                                                                                                    {line.QuantityAvailable ?? 0}
                                                                                                </TableCell>
                                                                                                <TableCell>{line.invoiceQuantity}</TableCell>
                                                                                                <TableCell>0</TableCell>
                                                                                                <TableCell>{line.Decision === "LivPrevuaDate" ? "LivraisonPrevuDate" : (line.Decision || "-")}</TableCell>
                                                                                                <TableCell>{line.DeliveryDate || "-"}</TableCell>
                                                                                            </TableRow>
                                                                                        ))
                                                                                    ) : (
                                                                                        <TableRow>
                                                                                            <TableCell colSpan={9} align="center">
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

            {/* Edit Dialog */}
            <Dialog open={!!editOrder} onClose={() => setEditOrder(null)} fullWidth maxWidth="lg">
                <DialogTitle>Valide la commande</DialogTitle>
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

                            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                                <strong>Détails des lignes</strong>
                                <TextField
                                    size="small"
                                    label="Chercher"
                                    value={lineSearch}
                                    onChange={(e) => setLineSearch(e.target.value)}
                                />
                            </Stack>
                            {editedOrderLocal.plexuspurchaseOrderLines && editedOrderLocal.plexuspurchaseOrderLines.length > 0 ? (
                                <Table size="small" sx={{ mt: 2 }}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Num article</TableCell>
                                            <TableCell>Description</TableCell>
                                            <TableCell>Prix unitaire</TableCell>
                                            <TableCell>Quantité</TableCell>
                                            <TableCell>Quantité disponible</TableCell>
                                            <TableCell>Quantité livrée</TableCell>
                                            <TableCell>Confirmation</TableCell>
                                            <TableCell>Quantité à livrer</TableCell>
                                            {filteredLines.some((l: ExtendedPurchaseOrderLine) => l.Decision === 'LivPrevuaDate') && <TableCell>Date Livraison</TableCell>}
                                            <TableCell>
                                                <Stack direction="row" alignItems="center" justifyContent="center">
                                                    <Checkbox size="small" checked={true} disabled />
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>

                                    <TableBody>
                                        {filteredLines.map((line: ExtendedPurchaseOrderLine, idx: number) => {
                                            return (
                                                <TableRow
                                                    key={line.id || idx}
                                                    sx={{
                                                        bgcolor: line.Decision === 'NonDisponible'
                                                            ? (theme) => alpha(theme.palette.error.main, 0.12)
                                                            : 'inherit'
                                                    }}
                                                >
                                                    <TableCell>
                                                        <Stack>
                                                            {line.OldRemplacementItemNo && (
                                                                <>
                                                                    <Typography
                                                                        variant="caption"
                                                                        sx={{
                                                                            color: 'error.main',
                                                                            textDecoration: 'line-through',
                                                                            fontWeight: 'bold'
                                                                        }}
                                                                    >
                                                                        {line.lineObjectNumber}
                                                                    </Typography>
                                                                    <Typography
                                                                        variant="body2"
                                                                        sx={{ color: 'text.secondary' }}
                                                                    >
                                                                        {line.OldRemplacementItemNo}
                                                                    </Typography>
                                                                </>
                                                            )}
                                                            {!line.OldRemplacementItemNo && (
                                                                <Typography variant="body2">
                                                                    {line.lineObjectNumber}
                                                                </Typography>
                                                            )}
                                                        </Stack>
                                                    </TableCell>
                                                    <TableCell>{line.description || ''}</TableCell>
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
                                                        <Box sx={{ mt: 0.5 }}>
                                                            <LastPriceUpdate itemNo={line.lineObjectNumber} />
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <TextField
                                                            size="small"
                                                            value={line.quantity ?? 0}
                                                            disabled
                                                            sx={{ width: 80 }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <TextField
                                                            size="small"
                                                            value={line.QuantityAvailable ?? 0}
                                                            disabled
                                                            sx={{ width: 80 }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <TextField
                                                            size="small"
                                                            value={line.receivedQuantity ?? 0}
                                                            disabled
                                                            sx={{ width: 80 }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>{line.Decision === "LivPrevuaDate" ? "LivraisonPrevuDate" : (line.Decision || "")}</TableCell>
                                                    <TableCell>
                                                        <TextField
                                                            size="small"
                                                            type="number"
                                                            value={line.invoiceQuantity ?? 0}
                                                            disabled
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
                                                    {filteredLines.some((l: ExtendedPurchaseOrderLine) => l.Decision === 'LivPrevuaDate') && (
                                                        <TableCell>
                                                            {line.Decision === 'LivPrevuaDate' && (
                                                                <TextField
                                                                    size="small"
                                                                    type="date"
                                                                    value={line.DeliveryDate || ''}
                                                                    onChange={(e) => {
                                                                        const v = e.target.value;
                                                                        setEditedOrderLocal(prev => {
                                                                            if (!prev) return prev;
                                                                            const copy = { ...prev };
                                                                            copy.plexuspurchaseOrderLines = copy.plexuspurchaseOrderLines?.map((l: ExtendedPurchaseOrderLine) =>
                                                                                l.id === line.id ? { ...l, DeliveryDate: v } : l
                                                                            );
                                                                            return copy;
                                                                        });
                                                                    }}
                                                                    sx={{ width: 150 }}
                                                                    InputLabelProps={{ shrink: true }}
                                                                />
                                                            )}
                                                        </TableCell>
                                                    )}
                                                    <TableCell>
                                                        <Stack direction="row" alignItems="center" justifyContent="center">
                                                            <Checkbox
                                                                size="small"
                                                                checked={line.selected !== false}
                                                                onChange={(e) => {
                                                                    const checked = e.target.checked;
                                                                    setEditedOrderLocal(prev => {
                                                                        if (!prev) return prev;
                                                                        const copy = { ...prev };
                                                                        copy.plexuspurchaseOrderLines = copy.plexuspurchaseOrderLines?.map((l: ExtendedPurchaseOrderLine) =>
                                                                            l.id === line.id ? { ...l, selected: checked } : l
                                                                        );
                                                                        return copy;
                                                                    });
                                                                }}
                                                            />
                                                        </Stack>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
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