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
    Typography,
    TextField
} from '@mui/material';
import { Traitee } from 'types/Traitee';
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
import { InfoCircle, DocumentDownload } from '@wandersonalwes/iconsax-react';
import { CSVLink } from "react-csv";

import { fetchTraitees } from 'app/api/services/Recues/TraiteeRecues';
import axiosServices from 'utils/axios';

export default function RecuesTraitees() {
    const [data, setData] = useState<Traitee[]>([]);
    const [customers, setCustomers] = useState<{ [key: string]: string }>({});
    const [expandedRows, setExpandedRows] = useState<{ [key: string]: 'view' | 'edit' | null }>({});
    const [sorting, setSorting] = useState<SortingState>([
        { id: 'orderDate', desc: true }
    ]); const [globalFilter, setGlobalFilter] = useState('');
    const [rowSelection, setRowSelection] = useState({});
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [editOrder, setEditOrder] = useState<Traitee | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [detailSearch, setDetailSearch] = useState<{ [key: string]: string }>({});

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

    // Fetch data when pageIndex or pageSize changes
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch with proper pagination
                const result = await fetchTraitees(
                    pageIndex,
                    pageSize,
                    globalFilter
                );
                setData(
                    result.data.map((o: Traitee, index: number) => ({
                        id: o.id || String(pageIndex * pageSize + index + 1),
                        number: o.number,
                        orderDate: o.orderDate,
                        vendorName: o.vendorName,
                        payToVendorNumber: o.payToVendorNumber || '',
                        fullyReceived: o.fullyReceived === true || o.QtyReceived === 'Oui',
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
                console.error('Error loading data:', err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [pageIndex, pageSize, sorting, globalFilter]);

    // Fetch customers lookup data
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

    // Export headers
    const csvHeaders = [
        { label: "Nom", key: "description" },
        { label: "Reference", key: "lineObjectNumber" },
        { label: "Prix Unit HT", key: "directUnitCost" },
        { label: "TVA", key: "taxPercent" },
        { label: "Disponiblite", key: "QuantityAvailable" },
        { label: "Nature", key: "nature" }
    ];

    const getExportDataForOrder = (order: Traitee) => {
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
                const value = getValue<string>() || 'Confirmé';
                return <Chip color="success" label={value} size="small" variant="light" />;
            }
        },
        {
            header: 'Actions',
            meta: { align: 'center' },
            enableSorting: false,
            cell: ({ row }) => (
                <Stack direction="row" gap={1} justifyContent="center" alignItems="center">
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
                    <Tooltip title="Exporter Excel">
                        <span style={{ display: 'inline-flex', verticalAlign: 'middle' }}>
                            <CSVLink
                                data={getExportDataForOrder(row.original)}
                                headers={csvHeaders}
                                filename={`Commandes_${row.original.number.replace(/\//g, '-')}_${new Date().toISOString().split('T')[0]}.csv`}
                                style={{ textDecoration: 'none', display: 'flex' }}
                            >
                                <IconButton color="success">
                                    <DocumentDownload size={22} />
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
                                                                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                                                                    <strong>Détails des lignes</strong>
                                                                    <TextField
                                                                        size="small"
                                                                        label="Chercher"
                                                                        value={detailSearch[row.id] || ''}
                                                                        onChange={(e) =>
                                                                            setDetailSearch(prev => ({
                                                                                ...prev,
                                                                                [row.id]: e.target.value
                                                                            }))
                                                                        }
                                                                    />
                                                                </Stack>

                                                                {row.original.plexuspurchaseOrderLines && row.original.plexuspurchaseOrderLines.length > 0 ? (() => {
                                                                    const lines = row.original.plexuspurchaseOrderLines as any[];
                                                                    const term = (detailSearch[row.id] || '').toLowerCase().trim();
                                                                    const filteredLines = term
                                                                        ? lines.filter((line) => {
                                                                            const haystack = [
                                                                                line.lineObjectNumber,
                                                                                line.description,
                                                                                line.Decision,
                                                                                line.expectedReceiptDate
                                                                            ]
                                                                                .filter(Boolean)
                                                                                .join(' ')
                                                                                .toLowerCase();
                                                                            return haystack.includes(term);
                                                                        })
                                                                        : lines;

                                                                    return (
                                                                        <Table size="small">
                                                                            <TableHead>
                                                                                <TableRow>
                                                                                    <TableCell sx={{ fontWeight: 'bold' }}>Num article</TableCell>
                                                                                    <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                                                                                    <TableCell sx={{ fontWeight: 'bold' }}>Quantité</TableCell>
                                                                                    <TableCell sx={{ fontWeight: 'bold' }}>Quantité livrée</TableCell>
                                                                                    <TableCell sx={{ fontWeight: 'bold' }}>Quantité recue</TableCell>
                                                                                    <TableCell sx={{ fontWeight: 'bold' }}>Confirmation</TableCell>
                                                                                    <TableCell sx={{ fontWeight: 'bold' }}>Date Livraison</TableCell>
                                                                                </TableRow>
                                                                            </TableHead>
                                                                            <TableBody>
                                                                                {filteredLines.length > 0 ? (
                                                                                    filteredLines.map((line: any, idx: number) => (
                                                                                        <TableRow key={line.id || idx}>
                                                                                            <TableCell>{line.lineObjectNumber}</TableCell>
                                                                                            <TableCell>{line.description}</TableCell>
                                                                                            <TableCell>{line.quantity}</TableCell>
                                                                                            <TableCell>{line.receivedQuantity || '-'}</TableCell>
                                                                                            <TableCell>{line.receivedQuantity || '-'}</TableCell>
                                                                                            <TableCell>{line.Decision || '-'}</TableCell>
                                                                                            <TableCell>{line.DeliveryDate || '-'}</TableCell>
                                                                                        </TableRow>
                                                                                    ))
                                                                                ) : (
                                                                                    <TableRow>
                                                                                        <TableCell colSpan={6} align="center">
                                                                                            Aucune ligne trouvée
                                                                                        </TableCell>
                                                                                    </TableRow>
                                                                                )}
                                                                            </TableBody>
                                                                        </Table>
                                                                    );
                                                                })() : (
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
            <Dialog open={!!editOrder} onClose={() => setEditOrder(null)} fullWidth maxWidth="md">
                <DialogTitle>Valide Article</DialogTitle>
                <DialogContent dividers>
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" onClick={() => setEditOrder(null)}>Close</Button>
                </DialogActions>
            </Dialog>
        </MainCard>
    );
}