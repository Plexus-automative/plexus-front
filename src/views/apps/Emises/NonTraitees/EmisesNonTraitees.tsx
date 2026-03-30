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
    TextField
} from '@mui/material';

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
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
import { Eye, Edit, Trash } from '@wandersonalwes/iconsax-react';

import { fetchNonTraitees } from 'app/api/services/Emises/NonTraiteeEmises';
import { NonTraitee } from 'types/NonTraitee';

export default function EmisesNonTraitees() {
    const [data, setData] = useState<NonTraitee[]>([]);
    const [expandedRows, setExpandedRows] = useState<{ [key: string]: 'view' | 'edit' | null }>({});
    const [sorting, setSorting] = useState<SortingState>([
        { id: 'orderDate', desc: true }
    ]); const [globalFilter, setGlobalFilter] = useState('');
    const [rowSelection, setRowSelection] = useState({});
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [editOrder, setEditOrder] = useState<NonTraitee | null>(null);
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
                        id: o.id || String(pageIndex * pageSize + index + 1),
                        number: o.number,
                        orderDate: o.orderDate,
                        vendorName: o.vendorName || (o as any).payToName || (o as any).buyFromVendorName || o.payToVendorNumber || '-',
                        payToVendorNumber: o.payToVendorNumber || '',
                        fullyReceived: o.fullyReceived === true || o.QtyReceived === 'Oui',
                        ShippingAdvice: o.ShippingAdvice,
                        status: o.status,
                        postingDate: o.postingDate || o.orderDate,
                        lastModifiedDateTime: o.lastModifiedDateTime || new Date().toISOString(),
                        plexuspurchaseOrderLines: o.plexuspurchaseOrderLines || [] // ✅ ADD THIS

                    }))
                );
                setTotalCount(result.totalCount || 0);

            } catch (err: any) {
                setError('Try Again Later');
                console.error('Error loading data:', err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [pageIndex, pageSize, sorting, globalFilter]);

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
            header: 'Fournisseur',
            accessorKey: 'vendorName',
            enableSorting: false
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
                                                                <Stack direction="row" justifyContent="flex-end" alignItems="center" mb={2}>
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

                                                                {row.original.plexuspurchaseOrderLines &&
                                                                    row.original.plexuspurchaseOrderLines.length > 0 ? (() => {
                                                                        const lines = row.original.plexuspurchaseOrderLines;
                                                                        const term = (detailSearch[row.id] || '').toLowerCase().trim();
                                                                        const filteredLines = term
                                                                            ? lines.filter((line) => {
                                                                                const haystack = [
                                                                                    line.sequence,
                                                                                    line.lineObjectNumber,
                                                                                    line.description
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
                                                                                        <TableCell>Quantité livree</TableCell>
                                                                                        <TableCell>Confirmation</TableCell>
                                                                                        <TableCell>Date Livraison</TableCell>
                                                                                    </TableRow>
                                                                                </TableHead>

                                                                                <TableBody>
                                                                                    {filteredLines.length > 0 ? (
                                                                                        filteredLines.map((line) => (
                                                                                            <TableRow key={line.id}>
                                                                                                <TableCell>{line.lineObjectNumber}</TableCell>
                                                                                                <TableCell>{line.description}</TableCell>
                                                                                                <TableCell>{line.quantity}</TableCell>
                                                                                                <TableCell>{line.receivedQuantity}</TableCell>
                                                                                                <TableCell>{line.Decision != "" ? line.Decision : '-'}</TableCell>
                                                                                                <TableCell>{line.DeliveryDate != "" ? line.DeliveryDate : '-'}</TableCell>
                                                                                            </TableRow>
                                                                                        ))
                                                                                    ) : (
                                                                                        <TableRow>
                                                                                            <TableCell colSpan={8} align="center">
                                                                                                Aucun ligne trouvée                                                                                            </TableCell>
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