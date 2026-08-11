"use client";

import { useEffect, useMemo, useState, Fragment, MouseEvent, useCallback } from "react";
import { alpha } from "@mui/material/styles";
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
  CircularProgress,
  Tabs,
  Tab,
} from "@mui/material";
import { Typography } from "@mui/material";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState,
  PaginationState,
} from "@tanstack/react-table";

import MainCard from "components/MainCard";
import {
  DebouncedInput,
  HeaderSort,
  IndeterminateCheckbox,
  RowSelection,
  TablePagination,
} from "components/third-party/react-table";

import IconButton from "components/@extended/IconButton";
import LastPriceUpdate from "components/prix/LastPriceUpdate";
import {
  Eye,
  Edit,
  Trash,
  DocumentDownload,
  ArrowCircleRight,
  Printer,
  CloseCircle,
  TickCircle,
} from "@wandersonalwes/iconsax-react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { CSVLink } from "react-csv";

import { fetchEncours } from "app/api/services/Emises/EncoursEmises";
import axiosServices from "utils/axios";
import { Encours, PurchaseOrderLine } from "types/Encours";
import { printOrder } from "utils/printOrder";

// Extend the PurchaseOrderLine type to include local UI properties
interface ExtendedPurchaseOrderLine extends PurchaseOrderLine {
  deliveryQuantity?: number;
  deliveryDate?: string;
  confirmationStatus?: string;
  OldRemplacementItemNo?: string;
  OldUnitPrice?: number; // Field to store original price
  AdaptableItemNo?: string;
  AdaptablePrice?: number;
}

// Extend Encours to use the extended line type
interface ExtendedEncours extends Omit<Encours, "plexuspurchaseOrderLines"> {
  plexuspurchaseOrderLines?: ExtendedPurchaseOrderLine[];
}

function EmisesEncours() {
  const searchParams = useSearchParams();
  const highlightId = searchParams.get("highlight");
  const urlTab = searchParams.get("tab");
  const { data: session } = useSession();

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
  const [expandedRows, setExpandedRows] = useState<{
    [key: string]: "view" | "edit" | null;
  }>({});
  const [sorting, setSorting] = useState<SortingState>([
    { id: "number", desc: true },
  ]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [registrationFilter, setRegistrationFilter] = useState("");
  const [rowSelection, setRowSelection] = useState({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [editOrder, setEditOrder] = useState<ExtendedEncours | null>(null);
  const [editedOrderLocal, setEditedOrderLocal] =
    useState<ExtendedEncours | null>(null);
  const [lineSelections, setLineSelections] = useState<Record<number, 'original' | 'adaptable'>>({});
  const [adaptableModalOpen, setAdaptableModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [viewDetailSearch, setViewDetailSearch] = useState<{
    [key: string]: string;
  }>({});
  const [editLinesSearch, setEditLinesSearch] = useState("");

  // BL Download states
  const [blDialogOpen, setBlDialogOpen] = useState(false);
  const [blPdfBlob, setBlPdfBlob] = useState<Blob | null>(null);
  const [blFilename, setBlFilename] = useState("BL.pdf");
  const [livPrevuaModalOpen, setLivPrevuaModalOpen] = useState(false);

  // Cancellation modal states
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  // Use pagination state from TanStack Table
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [totalCount, setTotalCount] = useState(0);

  // Reset to page 0 when filters or tab change
  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [globalFilter, registrationFilter, activeTab]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchEncours(
        pageIndex,
        pageSize,
        sorting[0]?.id,
        sorting[0]?.desc,
        globalFilter,
        registrationFilter,
        activeTab,
      );
      setData(
        result.data.map((o: Encours, index: number) => ({
          id: o.id,
          number: o.number,
          orderDate: o.orderDate,
          vendorName:
            o.vendorName ||
            (o as any).payToName ||
            (o as any).buyFromVendorName ||
            o.payToVendorNumber ||
            "-",
          payToVendorNumber: o.payToVendorNumber || "",
          fullyReceived: o.QtyReceived === "Oui",
          status: o.status,
          ShippingAdvice: (o as any).ShippingAdvice || "",
          SellToCustomerNo: (o as any).SellToCustomerNo || "",
          shipToName: (o as any).shipToName || "",
          shipToAddressLine1: (o as any).shipToAddressLine1 || "",
          shipToAddressLine2: (o as any).shipToAddressLine2 || "",
          shipToCity: (o as any).shipToCity || "",
          shipToPostCode: (o as any).shipToPostCode || "",
          shipToContact: (o as any).shipToContact || "",
          shipToPhone: (o as any).shipToPhone || "",
          RegistrationNumber: o.RegistrationNumber || "",
          MatriculeFiscale: (o as any).MatriculeFiscale || "",
          SellToPhoneNo: (o as any).SellToPhoneNo || "",
          PhoneNo: (o as any).PhoneNo || "",
          postingDate: o.postingDate || o.orderDate,
          RegistrationNumber: o.RegistrationNumber || "",
          VIN: (o as any).VIN || (o as any).vin || "",
          lastModifiedDateTime:
            o.lastModifiedDateTime || new Date().toISOString(),
          plexuspurchaseOrderLines: o.plexuspurchaseOrderLines || [],
        })),
      );
      setTotalCount(result.totalCount || 0);
    } catch (err: any) {
      setError(err.message || "Failed to fetch data");
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  }, [pageIndex, pageSize, sorting, globalFilter, registrationFilter, activeTab]);

  // Fetch data when pageIndex, pageSize, or sorting changes
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Export headers
  const csvHeaders = [
    { label: "Nom", key: "description" },
    { label: "Reference", key: "lineObjectNumber" },
    { label: "Prix Unit HT", key: "directUnitCost" },
    { label: "TVA", key: "taxPercent" },
    { label: "Disponiblite", key: "QuantityAvailable" },
    { label: "Nature", key: "nature" },
  ];

  const getExportDataForOrder = (order: Encours) => {
    const allLines: any[] = [];
    if (order.plexuspurchaseOrderLines) {
      order.plexuspurchaseOrderLines.forEach((l) => {
        allLines.push({
          ...l,
          description: l.description || "",
          lineObjectNumber: l.lineObjectNumber || "",
          directUnitCost: l.directUnitCost || 0,
          taxPercent: l.taxPercent || 0,
          QuantityAvailable: l.QuantityAvailable || 0,
          nature:
            (l as any).nature?.toLowerCase() === "adaptable"
              ? 2
              : (l as any).nature?.toLowerCase() === "casse"
                ? 3
                : 1,
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
        plexuspurchaseOrderLines: editOrder.plexuspurchaseOrderLines?.map(
          (line) => ({
            ...line,
            deliveryQuantity: line.quantity || 0,
            QuantityAvailable: line.QuantityAvailable || line.quantity || 0,
            receiveQuantity: line.receiveQuantity || line.quantity || 0,
            OldRemplacementItemNo: line.OldRemplacementItemNo || "",
          }),
        ),
      };
      setEditedOrderLocal(orderWithExtras);
    } else {
      setEditedOrderLocal(null);
    }
  }, [editOrder]);

  useEffect(() => {
    if (editOrder?.plexuspurchaseOrderLines) {
      const initial: Record<number, 'original' | 'adaptable'> = {};
      editOrder.plexuspurchaseOrderLines.forEach(l => {
        initial[l.id] = 'original';
      });
      setLineSelections(initial);
    }
  }, [editOrder]);

  const handleLeDisponibleAction = async (splitRequested = false, customLines?: ExtendedPurchaseOrderLine[]) => {
    if (!editedOrderLocal) return;

    setLoading(true);
    try {
      const rawLines = customLines || editedOrderLocal.plexuspurchaseOrderLines || [];
      const mappedLines = rawLines.map((l) => {
        if (l.AdaptableItemNo) {
          if (lineSelections[l.id] === 'adaptable') {
            return { ...l, Decision: 'Adaptable' };
          } else {
            return { ...l, Decision: 'Disponible', AdaptableItemNo: null };
          }
        }
        return l;
      });

      const payload = {
        splitRequested,
        customerNo: (session?.user as any)?.customerNo || "",
        lines: mappedLines,
        originalOrder: editedOrderLocal,
      };

      await axiosServices.post(
        `/api/purchase-orders/${editedOrderLocal.id}/split-le-disponible`,
        payload,
      );

      setLivPrevuaModalOpen(false);
      setEditOrder(null);
      setEditedOrderLocal(null);
      setShowSuccessAlert(true);

      // Refresh after a small delay to let BC index changes
      await new Promise(r => setTimeout(r, 800));
      await loadData();
    } catch (error) {
      console.error("Split operation error:", error);
      alert("Error while processing order split");
    } finally {
      setLoading(false);
    }
  };

  const handleLivPrevuaYes = () => {
    const hasAdaptable = Object.values(lineSelections).includes('adaptable');
    if (hasAdaptable) {
      setAdaptableModalOpen(true);
    } else {
      handleLeDisponibleAction(true);
    }
  };

  const handleLivPrevuaNo = () => handleLeDisponibleAction(false);

  // Function to cancel changes (annuler)
  const handleAnnuler = () => {
    setEditOrder(null);
    setEditedOrderLocal(null);
  };

  const columns = useMemo<ColumnDef<Encours>[]>(
    () => [
      {
        header: "Num Commande",
        accessorKey: "number",
        enableSorting: true,
      },
      {
        header: "Date",
        accessorKey: "orderDate",
        enableSorting: true,
      },
      {
        header: "Fournisseur",
        accessorKey: "vendorName",
        enableSorting: false,
      },
      {
        header: "Immatriculation",
        accessorKey: "RegistrationNumber",
        enableSorting: true,
        cell: ({ getValue }) => {
          const value = getValue<string>();
          return (
            <Typography variant="body2" fontWeight={500}>
              {value || "-"}
            </Typography>
          );
        },
      },
      {
        header: "Status",
        accessorKey: "ShippingAdvice",
        enableSorting: false,
        cell: ({ getValue }) => {
          const advice = getValue<string>();
          switch (advice) {
            case "Attente":
              return (
                <Chip
                  color="warning"
                  label="En Attente"
                  size="small"
                  variant="light"
                />
              );
            case "ConfirmationPartielle":
              return (
                <Chip
                  color="info"
                  label="Confirmation Partielle"
                  size="small"
                  variant="light"
                />
              );
            case "Confirmé":
              return (
                <Chip
                  color="success"
                  label="Confirmé"
                  size="small"
                  variant="light"
                />
              );
            case "Totalité":
              return (
                <Chip
                  label="Livrer la totalité"
                  size="small"
                  sx={{
                    bgcolor: "rgba(76, 175, 80, 0.15)",
                    color: "#2E7D32",
                    fontWeight: 600,
                  }}
                />
              );
            case "LivraisonDispo":
              return (
                <Chip
                  label="Livrer le disponible"
                  size="small"
                  sx={{
                    bgcolor: "rgba(255, 193, 7, 0.2)",
                    color: "#795548",
                    fontWeight: 600,
                  }}
                />
              );
            default:
              return (
                <Chip color="default" label={advice || "-"} size="small" />
              );
          }
        },
      },
      {
        header: "Actions",
        id: "actions",
        meta: { align: "center" },
        enableSorting: false,
        cell: ({ row }) => {
          const ShippingAdvice = (row.original as any).ShippingAdvice;
          return (
            <Stack
              direction="row"
              gap={1}
              justifyContent="center"
              alignItems="center"
            >
              <Tooltip title="View">
                <IconButton
                  color="secondary"
                  onClick={(e: MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                    setExpandedRows((p) =>
                      p[row.id] === "view" ? {} : { [row.id]: "view" },
                    );
                  }}
                >
                  <Eye style={{ width: 36, height: 36 }} />
                </IconButton>
              </Tooltip>
              {ShippingAdvice === "ConfirmationPartielle" && (
                <Tooltip title="Valide">
                  <IconButton
                    color="primary"
                    onClick={() =>
                      setEditOrder(row.original as ExtendedEncours)
                    }
                  >
                    <Edit style={{ width: 36, height: 36 }} />
                  </IconButton>
                </Tooltip>
              )}
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
                <span
                  style={{ display: "inline-flex", verticalAlign: "middle" }}
                >
                  <CSVLink
                    data={getExportDataForOrder(row.original)}
                    headers={csvHeaders}
                    filename={`Commandes_${row.original.number.replace(/\//g, "-")}_${new Date().toISOString().split("T")[0]}.csv`}
                    style={{ textDecoration: "none", display: "flex" }}
                  >
                    <IconButton color="success">
                      <DocumentDownload style={{ width: 36, height: 36 }} />
                    </IconButton>
                  </CSVLink>
                </span>
              </Tooltip>
            </Stack>
          );
        },
      },
    ],
    [],
  );

  const table = useReactTable({
    data,
    columns,
    pageCount: Math.ceil(totalCount / pageSize),

    state: {
      sorting,
      globalFilter,
      rowSelection,
      columnFilters,
      pagination: { pageIndex, pageSize },
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
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems="center"
        gap={2}
        sx={{ px: 3, py: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}
      >
        <DebouncedInput
          value={globalFilter}
          onFilterChange={(v) => setGlobalFilter(String(v))}
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

        <DebouncedInput
          value={registrationFilter}
          onFilterChange={(v) => setRegistrationFilter(String(v))}
          placeholder="Chercher par immatriculation..."
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
                {table.getHeaderGroups().map((hg) => (
                  <TableRow key={hg.id}>
                    {hg.headers.map((h) => (
                      <TableCell key={h.id} {...h.column.columnDef.meta}>
                        <Stack direction="row" gap={1} alignItems="center">
                          {flexRender(
                            h.column.columnDef.header,
                            h.getContext(),
                          )}
                          {h.column.getCanSort() && (
                            <HeaderSort column={h.column} />
                          )}
                        </Stack>
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableHead>

              <TableBody>
                {table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map((row) => {
                    const mode = expandedRows[row.id];
                    const isHighlighted =
                      highlightId === String((row.original as Encours).id);
                    const status = (row.original as any).ShippingAdvice;
                    const statusBg =
                      status === "Totalité"
                        ? "rgba(76, 175, 80, 0.08)"
                        : status === "LivraisonDispo"
                          ? "rgba(255, 193, 7, 0.08)"
                          : "transparent";
                    return (
                      <Fragment key={row.id}>
                        <TableRow
                          hover
                          sx={{
                            bgcolor: isHighlighted
                              ? (theme) =>
                                alpha(theme.palette.primary.main, 0.1)
                              : statusBg,
                            ...(isHighlighted && {
                              borderLeft: (theme) =>
                                `4px solid ${theme.palette.primary.main}`,
                            }),
                          }}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext(),
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                        <TableRow>
                          <TableCell
                            colSpan={row.getVisibleCells().length}
                            sx={{ p: 0 }}
                          >
                            <Collapse
                              in={mode === "view"}
                              timeout="auto"
                              unmountOnExit
                            >
                              <Box
                                sx={{
                                  p: 2,
                                  bgcolor: (t) =>
                                    alpha(t.palette.primary.lighter, 0.1),
                                }}
                              >
                                <Stack
                                  direction="row"
                                  justifyContent="flex-end"
                                  alignItems="center"
                                  mb={2}
                                >
                                  <TextField
                                    size="small"
                                    label="Chercher"
                                    value={viewDetailSearch[row.id] || ""}
                                    onChange={(e) =>
                                      setViewDetailSearch((prev) => ({
                                        ...prev,
                                        [row.id]: e.target.value,
                                      }))
                                    }
                                  />
                                </Stack>

                                {row.original.plexuspurchaseOrderLines &&
                                  row.original.plexuspurchaseOrderLines.length >
                                  0 ? (
                                  (() => {
                                    const lines = row.original
                                      .plexuspurchaseOrderLines as ExtendedPurchaseOrderLine[];
                                    const term = (
                                      viewDetailSearch[row.id] || ""
                                    )
                                      .toLowerCase()
                                      .trim();
                                    const cleanTerm = term.replace(/[^a-z0-9]/g, "");

                                    const filteredLines = term
                                      ? lines.filter((line) => {
                                        const haystack = [
                                          line.sequence,
                                          line.lineObjectNumber,
                                          line.description,
                                          line.Decision,
                                        ]
                                          .filter(Boolean)
                                          .join(" ")
                                          .toLowerCase();

                                        const cleanHaystack = haystack.replace(/[^a-z0-9]/g, "");
                                        return cleanHaystack.includes(cleanTerm);
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
                                            <TableCell>
                                              Quantité disponible
                                            </TableCell>
                                            <TableCell>
                                              Quantité validée
                                            </TableCell>
                                            <TableCell>
                                              Quantité expédiée
                                            </TableCell>
                                            <TableCell>
                                              Quantité Reçue
                                            </TableCell>
                                            <TableCell>Confirmation</TableCell>
                                            <TableCell>
                                              Date Livraison
                                            </TableCell>
                                          </TableRow>
                                        </TableHead>
                                        <TableBody>
                                          {filteredLines.length > 0 ? (
                                            filteredLines.map(
                                              (
                                                line: ExtendedPurchaseOrderLine,
                                              ) => (
                                                <Fragment key={line.id}>
                                                  <TableRow
                                                    sx={{
                                                      bgcolor:
                                                        line.Decision ===
                                                          "NonDisponible"
                                                          ? (theme) =>
                                                            alpha(
                                                              theme.palette
                                                                .error.main,
                                                              0.12,
                                                            )
                                                          : "inherit",
                                                      borderLeft: line.AdaptableItemNo
                                                        ? (theme) => `4px solid ${theme.palette.info.light}`
                                                        : "none",
                                                    }}
                                                  >
                                                    <TableCell>
                                                      <Typography
                                                        variant="body2"
                                                        sx={{
                                                          color: "text.primary",
                                                          fontWeight: "bold",
                                                        }}
                                                      >
                                                        {line.lineObjectNumber}
                                                      </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                      {line.description}
                                                    </TableCell>
                                                    <TableCell>
                                                      {line.quantity}
                                                    </TableCell>
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
                                                    <TableCell>
                                                      {line.QuantityAvailable ||
                                                        "-"}
                                                    </TableCell>
                                                    <TableCell>
                                                      {line.receiveQuantity || 0}
                                                    </TableCell>
                                                    <TableCell>
                                                      {(line as any)
                                                        .quantityShipped || 0}
                                                    </TableCell>
                                                    <TableCell>
                                                      {line.receivedQuantity || 0}
                                                    </TableCell>
                                                    <TableCell>
                                                      {line.Decision === "LivPrevuaDate" ? "LivraisonPrevuDate" : (line.Decision || "-")}
                                                    </TableCell>
                                                    <TableCell>
                                                      {line.DeliveryDate || "-"}
                                                    </TableCell>
                                                  </TableRow>

                                                  {/* Plexus Offer Data Row (Grouped, nested visually, no full-width separator) */}
                                                  {line.AdaptableItemNo && line.Decision !== "Disponible" && line.Decision !== "NonDisponible" && line.Decision !== "LivPrevuaDate" && (
                                                    <TableRow
                                                      sx={{
                                                        bgcolor: (theme) =>
                                                          alpha(theme.palette.success.main, 0.02),
                                                        borderLeft: (theme) =>
                                                          `4px solid ${theme.palette.success.light}`,
                                                      }}
                                                    >
                                                      <TableCell sx={{ pl: 3 }}>
                                                        <Stack direction="row" alignItems="center" gap={1}>
                                                          <Typography
                                                            variant="body2"
                                                            sx={{
                                                              color: "success.main",
                                                              fontWeight: "bold",
                                                            }}
                                                          >
                                                            {line.AdaptableItemNo}
                                                          </Typography>
                                                          <Chip
                                                            label="Plexus"
                                                            size="small"
                                                            variant="outlined"
                                                            color="success"
                                                            sx={{
                                                              height: 18,
                                                              fontSize: "0.6rem",
                                                              fontWeight: "bold",
                                                              textTransform: "uppercase",
                                                            }}
                                                          />
                                                        </Stack>
                                                      </TableCell>
                                                      <TableCell sx={{ color: "text.secondary", fontStyle: "italic" }}>
                                                        {line.description}
                                                      </TableCell>
                                                      <TableCell sx={{ color: "text.secondary" }}>
                                                        {line.quantity}
                                                      </TableCell>
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
                                                          <Stack direction="row" alignItems="center" gap={1}>
                                                            <Typography variant="body2" sx={{ color: "success.main", fontWeight: "bold" }}>
                                                              {line.AdaptablePrice?.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}
                                                            </Typography>
                                                            <LastPriceUpdate itemNo={line.AdaptableItemNo} dense />
                                                          </Stack>
                                                        </Stack>
                                                      </TableCell>
                                                      <TableCell>
                                                        {line.QuantityAvailable || "-"}
                                                      </TableCell>
                                                      <TableCell>
                                                        {line.receiveQuantity || 0}
                                                      </TableCell>
                                                      <TableCell>
                                                        {(line as any).quantityShipped || 0}
                                                      </TableCell>
                                                      <TableCell>
                                                        {line.receivedQuantity || 0}
                                                      </TableCell>
                                                      <TableCell>
                                                        {"Disponible"}
                                                      </TableCell>
                                                      <TableCell>
                                                        {line.DeliveryDate || "-"}
                                                      </TableCell>
                                                    </TableRow>
                                                  )}
                                                </Fragment>
                                              ),
                                            )
                                          ) : (
                                            <TableRow>
                                              <TableCell
                                                colSpan={10}
                                                align="center"
                                              >
                                                No lines found
                                              </TableCell>
                                            </TableRow>
                                          )}
                                        </TableBody>
                                      </Table>
                                    );
                                  })()
                                ) : (
                                  <Box mt={2}>
                                    <Alert severity="info">
                                      Aucune ligne d'achat disponible
                                    </Alert>
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
                    <TableCell
                      colSpan={columns.length}
                      align="center"
                      sx={{ py: 4 }}
                    >
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
      <Dialog
        open={!!editOrder}
        onClose={() => setEditOrder(null)}
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle>Modifier la commande</DialogTitle>
        <DialogContent dividers>
          {editedOrderLocal ? (
            <>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                gap={2}
                mb={2}
                flexWrap="wrap"
              >
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

              {editedOrderLocal.plexuspurchaseOrderLines &&
                editedOrderLocal.plexuspurchaseOrderLines.length > 0 ? (
                (() => {
                  const lines =
                    editedOrderLocal.plexuspurchaseOrderLines as ExtendedPurchaseOrderLine[];
                  const term = editLinesSearch.toLowerCase().trim();
                  const filteredLines = term
                    ? lines.filter((line) => {
                      const haystack = [
                        line.lineObjectNumber,
                        line.description,
                        line.Decision,
                      ]
                        .filter(Boolean)
                        .join(" ")
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
                          <TableCell>Quantité disponible</TableCell>
                          <TableCell>Quantité validée</TableCell>
                          <TableCell>Quantité expédiée</TableCell>
                          <TableCell>Quantité Reçue</TableCell>
                          <TableCell>Confirmation</TableCell>
                          <TableCell>Date Livraison</TableCell>
                          {filteredLines.some((l: any) => l.AdaptableItemNo) && (
                            <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Choix</TableCell>
                          )}
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {filteredLines.length > 0 ? (
                          filteredLines.map(
                            (line: ExtendedPurchaseOrderLine, idx: number) => (
                              <Fragment key={line.id || idx}>
                                <TableRow
                                  key={line.id || idx}
                                  sx={{
                                    bgcolor: (theme) => {
                                      if (line.Decision === "NonDisponible") {
                                        return alpha(theme.palette.error.main, 0.15);
                                      }
                                      return lineSelections[line.id] === 'original'
                                        ? "inherit"
                                        : alpha(theme.palette.action.disabledBackground, 0.1);
                                    },
                                    opacity: line.Decision === 'NonDisponible' ? 1 : (lineSelections[line.id] === 'original' ? 1 : 0.6),
                                  }}
                                >
                                  <TableCell>
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        color: "text.primary",
                                        fontWeight: "bold",
                                      }}
                                    >
                                      {line.lineObjectNumber}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="body2">
                                      {line.description || ""}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <TextField
                                      size="small"
                                      value={line.quantity ?? ""}
                                      disabled
                                      InputProps={{
                                        readOnly: true,
                                      }}
                                    />
                                  </TableCell>

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
                                      <Typography variant="body2" sx={{ color: "#2e7d32", fontWeight: "bold" }}>
                                        {line.directUnitCost}
                                      </Typography>
                                      <LastPriceUpdate itemNo={line.lineObjectNumber} />
                                    </Stack>
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
                                        const maxQty =
                                          Number(line.QuantityAvailable) || 0;

                                        if (numValue > maxQty) {
                                          return;
                                        }

                                        setEditedOrderLocal((prev) => {
                                          if (!prev) return prev;
                                          const copy = { ...prev };
                                          copy.plexuspurchaseOrderLines =
                                            copy.plexuspurchaseOrderLines?.map(
                                              (l: ExtendedPurchaseOrderLine) =>
                                                l.id === line.id
                                                  ? {
                                                    ...l,
                                                    QuantityAvailable: numValue,
                                                  }
                                                  : l,
                                            );
                                          return copy;
                                        });
                                      }}
                                      inputProps={{
                                        min: 0,
                                        max: line.quantity || 0,
                                      }}
                                      error={
                                        Number(line.deliveryQuantity) >
                                        Number(line.quantity)
                                      }
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
                                        setEditedOrderLocal((prev) => {
                                          if (!prev) return prev;
                                          const copy = { ...prev };
                                          copy.plexuspurchaseOrderLines =
                                            copy.plexuspurchaseOrderLines?.map(
                                              (l: ExtendedPurchaseOrderLine) =>
                                                l.id === line.id
                                                  ? {
                                                    ...l,
                                                    invoiceQuantity: numValue,
                                                  }
                                                  : l,
                                            );
                                          return copy;
                                        });
                                      }}
                                      inputProps={{
                                        min: 0,
                                        max: line.QuantityAvailable || 0,
                                      }}
                                      error={
                                        Number(line.invoiceQuantity) >
                                        Number(line.quantity)
                                      }
                                      sx={{
                                        "& .MuiInputBase-input": {
                                          WebkitTextFillColor: "#1976d2",
                                          fontWeight: "bold",
                                          color: "#1976d2",
                                        },
                                      }}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="body2">
                                      {(line as any).receivedQuantity ?? "-"}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="body2">
                                      {line.receivedQuantity ?? "-"}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="body2">
                                      {line.Decision === "LivPrevuaDate" ? "LivraisonPrevuDate" : (line.Decision || "-")}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="body2">
                                      {line.DeliveryDate || "-"}
                                    </Typography>
                                  </TableCell>
                                  {filteredLines.some((l: any) => l.AdaptableItemNo) && (
                                    <TableCell sx={{ textAlign: 'center' }}>
                                      {line.AdaptableItemNo && (
                                        <Radio
                                          checked={lineSelections[line.id] === 'original' || !lineSelections[line.id]}
                                          onChange={() => {
                                            setLineSelections(prev => ({ ...prev, [line.id]: 'original' }));
                                            setEditedOrderLocal(prev => {
                                              if (!prev) return prev;
                                              return {
                                                ...prev,
                                                plexuspurchaseOrderLines: prev.plexuspurchaseOrderLines?.map(l =>
                                                  l.id === line.id ? { ...l, invoiceQuantity: l.Decision === 'NonDisponible' ? 0 : (l.QuantityAvailable ?? l.quantity) } : l
                                                )
                                              };
                                            });
                                          }}
                                          size="small"
                                          color="primary"
                                        />
                                      )}
                                    </TableCell>
                                  )}
                                </TableRow>

                                {/* Plexus Offer Data Row in Edit (Grouped, nested visually, active/faded selection styling) */}
                                {line.AdaptableItemNo && (
                                  <TableRow
                                    sx={{
                                      borderLeft: (theme) => `4px solid ${theme.palette.success.main}`,
                                      bgcolor: (theme) => {
                                        const isSelected = lineSelections[line.id] === 'adaptable';
                                        return isSelected
                                          ? alpha(theme.palette.success.main, 0.08)
                                          : alpha(theme.palette.success.main, 0.01);
                                      },
                                      opacity: 1,
                                      transition: 'opacity 0.2s, background-color 0.2s',
                                    }}
                                  >
                                    <TableCell sx={{ pl: 3 }}>
                                      <Stack direction="row" alignItems="center" gap={1}>
                                        <Typography
                                          variant="body2"
                                          sx={{
                                            color: "success.main",
                                            fontWeight: "bold",
                                          }}
                                        >
                                          {line.AdaptableItemNo}
                                        </Typography>
                                        <Chip
                                          label="Plexus"
                                          size="small"
                                          color="success"
                                          sx={{
                                            height: 18,
                                            fontSize: "0.6rem",
                                            fontWeight: "bold",
                                            textTransform: "uppercase",
                                          }}
                                        />
                                      </Stack>
                                    </TableCell>
                                    <TableCell sx={{ color: "text.secondary", fontStyle: "italic" }}>
                                      <Typography variant="caption">{line.description}</Typography>
                                    </TableCell>
                                    <TableCell>
                                      <TextField
                                        size="small"
                                        value={line.quantity ?? ""}
                                        disabled
                                        InputProps={{ readOnly: true }}
                                      />
                                    </TableCell>
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
                                        <Typography variant="body2" sx={{ color: "success.main", fontWeight: "bold" }}>
                                          {line.AdaptablePrice?.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}
                                        </Typography>
                                        <LastPriceUpdate itemNo={line.AdaptableItemNo} dense />
                                      </Stack>
                                    </TableCell>
                                    <TableCell>
                                      <TextField
                                        size="small"
                                        value={line.QuantityAvailable ?? 0}
                                        disabled
                                        InputProps={{ readOnly: true }}
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <TextField
                                        size="small"
                                        value={line.invoiceQuantity || 0}
                                        disabled
                                        InputProps={{
                                          readOnly: true,
                                          style: { color: "#1976d2", fontWeight: "bold" }
                                        }}
                                        sx={{
                                          "& .MuiInputBase-input.Mui-disabled": {
                                            WebkitTextFillColor: "#1976d2",
                                            fontWeight: "bold",
                                          },
                                        }}
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Typography variant="body2">{(line as any).receivedQuantity ?? "-"}</Typography>
                                    </TableCell>
                                    <TableCell>
                                      <Typography variant="body2">{line.receivedQuantity ?? "-"}</Typography>
                                    </TableCell>
                                    <TableCell>
                                      <Typography variant="body2">{"Disponible"}</Typography>
                                    </TableCell>
                                    <TableCell>
                                      <Typography variant="body2">{line.DeliveryDate || "-"}</Typography>
                                    </TableCell>
                                    {filteredLines.some((l: any) => l.AdaptableItemNo) && (
                                      <TableCell sx={{ textAlign: 'center' }}>
                                        <Radio
                                          checked={lineSelections[line.id] === 'adaptable'}
                                          onChange={() => {
                                            setLineSelections(prev => ({ ...prev, [line.id]: 'adaptable' }));
                                            setEditedOrderLocal(prev => {
                                              if (!prev) return prev;
                                              return {
                                                ...prev,
                                                plexuspurchaseOrderLines: prev.plexuspurchaseOrderLines?.map(l =>
                                                  l.id === line.id ? { ...l, invoiceQuantity: l.quantity || 1 } : l
                                                )
                                              };
                                            });
                                          }}
                                          size="small"
                                          color="success"
                                        />
                                      </TableCell>
                                    )}
                                  </TableRow>
                                )}
                              </Fragment>
                            ),
                          )
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
                })()
              ) : (
                <Box mt={2}>
                  <Alert severity="info">
                    Aucune ligne de commande disponible
                  </Alert>
                </Box>
              )}
            </>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          {editedOrderLocal?.plexuspurchaseOrderLines?.some(l => !!l.AdaptableItemNo) ? (
            <>
              <Button
                variant="contained"
                color="primary"
                size="large"
                sx={{ borderRadius: '10px', px: 4, fontWeight: 600 }}
                onClick={async () => {
                  if (!editedOrderLocal) return;

                  // Check if any adaptable selection is made
                  const hasAdaptableSelection = editedOrderLocal.plexuspurchaseOrderLines?.some(
                    (l) => lineSelections[l.id] === 'adaptable'
                  );

                  if (hasAdaptableSelection) {
                    setAdaptableModalOpen(true);
                  } else {
                    const hasLivPrevuaDate = editedOrderLocal.plexuspurchaseOrderLines?.some(
                      (l) => l.Decision === "LivPrevuaDate"
                    );

                    if (hasLivPrevuaDate) {
                      setLivPrevuaModalOpen(true);
                    } else {
                      handleLeDisponibleAction();
                    }
                  }
                }}
              >
                {loading ? <CircularProgress size={20} color="inherit" /> : "Valider le disponible"}
              </Button>
              <Button
                variant="contained"
                color="error"
                size="large"
                sx={{ borderRadius: '10px', px: 4, fontWeight: 600 }}
                onClick={() => setCancelModalOpen(true)}
              >
                Annulation commande
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="contained"
                disabled={loading}
                onClick={async () => {
                  if (!editedOrderLocal) return;
                  setLoading(true);
                  try {
                    const orderId = editedOrderLocal.id;
                    const shippingAdvice = "Totalité";

                    // Update main order
                    await axiosServices.patch(
                      `/api/purchase-orders/${orderId}`,
                      { ShippingAdvice: shippingAdvice }
                    );

                    // Update lines
                    if (editedOrderLocal.plexuspurchaseOrderLines) {
                      for (const line of editedOrderLocal.plexuspurchaseOrderLines) {
                        const originalLine = editOrder?.plexuspurchaseOrderLines?.find(
                          (l: ExtendedPurchaseOrderLine) => l.id === line.id
                        );

                        if (!originalLine) continue;

                        if (line.Decision === "NonDisponible" || Number(line.invoiceQuantity) === 0) {
                          // The line disappears with the request, so the journal would only
                          // ever see its id: tell it what is being removed, and why.
                          const removed = [
                            `Réf. ${line.lineObjectNumber || '-'}`,
                            line.description,
                            `qté ${line.quantity}`,
                            `commande ${editedOrderLocal.number || orderId}`,
                            line.Decision === "NonDisponible" ? "non disponible" : "quantité à facturer nulle"
                          ]
                            .filter(Boolean)
                            .join(' · ');
                          await axiosServices.delete(`/api/purchase-orders/lines/${line.id}`, {
                            headers: { 'X-Activity-Context': encodeURIComponent(removed) }
                          });
                          continue;
                        }

                        const lineUpdateBody: any = {
                          receiveQuantity: Number(line.invoiceQuantity ?? line.quantity),
                          Decision: line.Decision === "LivPrevuaDate" ? "LivPrevuaDate" : "Disponible"
                        };

                        await axiosServices.patch(`/api/purchase-orders/lines/${line.id}`, lineUpdateBody);
                      }
                    }

                    setEditOrder(null);
                    setEditedOrderLocal(null);
                    setShowSuccessAlert(true);

                    // Refresh after a small delay to let BC index changes
                    await new Promise(r => setTimeout(r, 800));
                    await loadData();
                  } catch (error) {
                    console.error("TOTALITE ERROR:", error);
                    alert("Error while updating order");
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                {loading ? <CircularProgress size={20} color="inherit" /> : "Totalité de disponible"}
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={async () => {
                  if (!editedOrderLocal) return;

                  // Check if any adaptable selection is made
                  const hasAdaptableSelection = editedOrderLocal.plexuspurchaseOrderLines?.some(
                    (l) => lineSelections[l.id] === 'adaptable'
                  );

                  if (hasAdaptableSelection) {
                    setAdaptableModalOpen(true);
                  } else {
                    const hasLivPrevuaDate = editedOrderLocal.plexuspurchaseOrderLines?.some(
                      (l) => l.Decision === "LivPrevuaDate"
                    );

                    if (hasLivPrevuaDate) {
                      setLivPrevuaModalOpen(true);
                    } else {
                      handleLeDisponibleAction();
                    }
                  }
                }}
              >
                Le disponible
              </Button>
              <Button variant="outlined" onClick={() => setCancelModalOpen(true)}>
                Annuler
              </Button>
              <Button onClick={handleAnnuler} variant="contained" color="error">
                Quitter
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* BL Download Dialog */}
      <Dialog
        open={blDialogOpen}
        onClose={() => setBlDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent sx={{ textAlign: "center", py: 4 }}>
          <Alert severity="success" sx={{ mb: 3, justifyContent: "center" }}>
            Commande validée avec succès, veuillez télécharger le BL!
          </Alert>
          <Button
            variant="outlined"
            size="large"
            startIcon={<DocumentDownload />}
            onClick={() => {
              if (!blPdfBlob) return;
              const url = window.URL.createObjectURL(blPdfBlob);
              const link = document.createElement("a");
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
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setShowSuccessAlert(false)}
          severity="success"
          sx={{ width: "100%", borderRadius: 2 }}
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
            borderRadius: "16px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle sx={{ pb: 0, pt: 3, px: 3 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: "error.main",
              letterSpacing: "-0.5px",
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
                {
                  group: "Annulation par l'expert:",
                  options: ["Prix", "Réparation", "Autres"],
                  key: "Expert",
                },
                {
                  group: "Annulation par le client:",
                  options: ["Prix", "Disponibilité", "Autres"],
                  key: "Client",
                },
                {
                  group: "Annulation par l'adhérant :",
                  options: [
                    "Prix",
                    "Temps de réponse",
                    "Service fournisseur",
                    "Erreur",
                  ],
                  key: "Adhérant",
                },
                {
                  group: "Annulation par l'assurance:",
                  options: ["EPAVE", "Autres"],
                  key: "Assurance",
                },
              ].map((section, sIdx) => (
                <Box key={section.key} sx={{ mb: sIdx === 3 ? 0 : 2.5 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 700,
                      color: "text.secondary",
                      mb: 1,
                      textTransform: "uppercase",
                      fontSize: "0.75rem",
                      letterSpacing: "1px",
                    }}
                  >
                    {section.group}
                  </Typography>
                  <Stack direction="row" flexWrap="wrap" gap={1}>
                    {section.options.map((opt) => (
                      <Paper
                        key={opt}
                        elevation={0}
                        sx={{
                          border: "1px solid",
                          borderColor:
                            cancelReason === `${section.key} - ${opt}`
                              ? "primary.main"
                              : "divider",
                          borderRadius: "8px",
                          bgcolor:
                            cancelReason === `${section.key} - ${opt}`
                              ? alpha("#1890ff", 0.05)
                              : "transparent",
                          transition: "all 0.2s",
                          "&:hover": {
                            borderColor: "primary.main",
                            bgcolor: alpha("#1890ff", 0.02),
                          },
                        }}
                      >
                        <FormControlLabel
                          value={`${section.key} - ${opt}`}
                          control={<Radio size="small" sx={{ ml: 1 }} />}
                          label={opt}
                          sx={{
                            m: 0,
                            pr: 2,
                            "& .MuiTypography-root": {
                              fontSize: "0.9rem",
                              fontWeight:
                                cancelReason === `${section.key} - ${opt}`
                                  ? 600
                                  : 400,
                            },
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
        <DialogActions
          sx={{ p: 3, pt: 1, backgroundColor: alpha("#f4f6f8", 0.5) }}
        >
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
                  ShippingAdvice: "Annulation",
                  CauseofCancellation: cancelReason,
                });

                // Remove from local UI
                setData((prev) => prev.filter((d) => d.id !== orderId));
                setTotalCount((prev) => prev - 1);

                setCancelModalOpen(false);
                setEditOrder(null);
                setEditedOrderLocal(null);
                setCancelReason("");
                setShowSuccessAlert(true);
              } catch (error) {
                console.error("CANCELLATION ERROR:", error);
                alert("Error while cancelling order");
              }
            }}
            startIcon={<ArrowCircleRight variant="Bold" />}
            sx={{
              borderRadius: "12px",
              py: 1.5,
              fontWeight: 600,
              fontSize: "1rem",
              textTransform: "none",
              boxShadow: "0 4px 12px rgba(46, 125, 50, 0.2)",
              bgcolor: "#5eb432",
              "&:hover": {
                bgcolor: "#4e9a2a",
                boxShadow: "0 6px 16px rgba(46, 125, 50, 0.3)",
              },
              "&.Mui-disabled": {
                bgcolor: alpha("#5eb432", 0.1),
                color: alpha("#000", 0.2),
              },
            }}
          >
            Confirmer l'annulation
          </Button>
        </DialogActions>
      </Dialog>
      {/* LivPrevuaDate Confirmation Modal */}
      <Dialog
        open={livPrevuaModalOpen}
        onClose={() => setLivPrevuaModalOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: "center", pt: 3 }}> Confirmation </DialogTitle>
        <DialogContent sx={{ textAlign: "center", py: 2 }}>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            Voulez vous enregistrer les lignes qui sont disponible à date dans une nouvelle commande?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 3, gap: 2 }}>
          <Button
            variant="contained"
            color="success"
            onClick={handleLivPrevuaYes}
            disabled={loading}
            startIcon={
              loading ? <CircularProgress size={16} color="inherit" /> : null
            }
            sx={{ px: 4 }}
          >
            Oui
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleLivPrevuaNo}
            disabled={loading}
            startIcon={
              loading ? <CircularProgress size={16} color="inherit" /> : null
            }
            sx={{ px: 4 }}
          >
            Non
          </Button>
        </DialogActions>
      </Dialog>

      {/* Adaptable Confirmation Dialog - Refined Pro Version */}
      <Dialog
        open={adaptableModalOpen}
        onClose={() => setAdaptableModalOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                bgcolor: alpha('#5eb432', 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                animation: 'pulse 2s infinite'
              }}
            >
              <TickCircle size={48} color="#5eb432" variant="Bold" />
            </Box>
            <Typography variant="h4" sx={{ mb: 2, fontWeight: 700, color: 'text.primary' }}>
              Confirmation de l'offre
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.6, px: 2 }}>
              Les lignes choisies des articles adaptables seront créées dans une <Box component="span" sx={{ color: 'success.main', fontWeight: 600 }}>nouvelle commande</Box> !
            </Typography>
          </Box>
          <Box
            sx={{
              p: 3,
              bgcolor: alpha('#f4f6f8', 0.5),
              display: 'flex',
              justifyContent: 'center',
              gap: 2,
              borderTop: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Button
              variant="outlined"
              size="large"
              fullWidth
              onClick={() => setAdaptableModalOpen(false)}
              sx={{
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
                color: 'text.secondary',
                borderColor: 'divider',
                '&:hover': { bgcolor: 'action.hover', borderColor: 'text.secondary' }
              }}
            >
              Retour
            </Button>
            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={async () => {
                setAdaptableModalOpen(false);
                if (editedOrderLocal?.plexuspurchaseOrderLines) {
                  // Mark the selected lines as "Adaptable" in the local state
                  const updatedLines = editedOrderLocal.plexuspurchaseOrderLines.map((l) => {
                    if (lineSelections[l.id] === "adaptable") {
                      return { ...l, Decision: "Adaptable" };
                    }
                    return l;
                  });

                  // Update the local order state with the new decisions
                  setEditedOrderLocal({
                    ...editedOrderLocal,
                    plexuspurchaseOrderLines: updatedLines,
                  });

                  // Trigger the split action (same as "Le Disponible")
                  handleLeDisponibleAction(true, updatedLines);
                }
              }}
              startIcon={<TickCircle variant="Bold" />}
              sx={{
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 700,
                bgcolor: '#5eb432',
                boxShadow: '0 8px 16px rgba(94, 180, 50, 0.24)',
                '&:hover': {
                  bgcolor: '#4e9a2a',
                  boxShadow: '0 12px 20px rgba(94, 180, 50, 0.32)'
                }
              }}
            >
              Continuer
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </MainCard>
  )
}

export default EmisesEncours;