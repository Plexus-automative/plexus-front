"use client";

import { useEffect, useMemo, useState, Fragment, MouseEvent } from "react";
import axiosServices from "utils/axios";
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
import {
  Eye,
  Edit,
  DocumentDownload,
  Printer,
} from "@wandersonalwes/iconsax-react";
import { CSVLink } from "react-csv";

import { fetchEncours } from "app/api/services/Recues/EncoursRecues";
import { Encours, PurchaseOrderLine } from "types/Encours";
import { printOrder } from "utils/printOrder";

// Extend the PurchaseOrderLine type to include local UI properties
interface ExtendedPurchaseOrderLine extends PurchaseOrderLine {
  selected?: boolean;
}

// Extend Encours to use the extended line type
interface ExtendedEncours extends Omit<Encours, "plexuspurchaseOrderLines"> {
  plexuspurchaseOrderLines?: ExtendedPurchaseOrderLine[];
}

export default function RecuesEncours() {
  const [data, setData] = useState<Encours[]>([]);
  const [expandedRows, setExpandedRows] = useState<{
    [key: string]: "view" | "edit" | null;
  }>({});
  const [sorting, setSorting] = useState<SortingState>([
    { id: "number", desc: true },
  ]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowSelection, setRowSelection] = useState({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [editOrder, setEditOrder] = useState<ExtendedEncours | null>(null);
  const [editedOrderLocal, setEditedOrderLocal] =
    useState<ExtendedEncours | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [lineSearch, setLineSearch] = useState("");
  const [viewDetailSearch, setViewDetailSearch] = useState<{
    [key: string]: string;
  }>({});
  const [customers, setCustomers] = useState<{ [key: string]: string }>({});

  // BL Download states
  const [blDialogOpen, setBlDialogOpen] = useState(false);
  const [blPdfBlob, setBlPdfBlob] = useState<Blob | null>(null);
  const [blFilename, setBlFilename] = useState("BL.pdf");
  const [validating, setValidating] = useState(false);

  // Use pagination state from TanStack Table
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [totalCount, setTotalCount] = useState(0);

  // Reset to page 0 when filter changes
  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [globalFilter]);

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const res = await axiosServices.get("/api/purchase-orders/customers");
        if (res.data && res.data.value) {
          const map: { [key: string]: string } = {};
          res.data.value.forEach((c: any) => {
            map[c.number] = c.displayName;
          });
          setCustomers(map);
        }
      } catch (err) {
        console.error("Error fetching customers:", err);
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
        );
        setData(
          result.data.map((o: Encours, index: number) => ({
            id: o.id,
            number: o.number,
            orderDate: o.orderDate,
            vendorName: o.vendorName,
            payToVendorNumber: o.payToVendorNumber || "",
            fullyReceived: o.QtyReceived === "Oui",
            ShippingAdvice: (o as any).ShippingAdvice || "",
            status: o.status,
            SellToCustomerNo: (o as any).SellToCustomerNo || "",
            shipToName: (o as any).shipToName || "",
            postingDate: o.postingDate || o.orderDate,
            lastModifiedDateTime:
              o.lastModifiedDateTime || new Date().toISOString(),
            plexuspurchaseOrderLines: o.plexuspurchaseOrderLines || [],
          })),
        );
        setTotalCount(result.totalCount || 0);
        console.log("Data loaded:", result.data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch data");
        console.error("Error loading data:", err);
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
            selected: true,
            deliveryQuantity: line.quantity || 0,
            QuantityAvailable: line.QuantityAvailable,
            Decision: line.Decision,
            receiveQuantity: line.receiveQuantity || line.quantity || 0,
            OldRemplacementItemNo: line.OldRemplacementItemNo || "",
            DeliveryDate: line.DeliveryDate || "",
          }),
        ),
      };
      setEditedOrderLocal(orderWithExtras);
    } else {
      setEditedOrderLocal(null);
    }
  }, [editOrder]);

  // Function to set all delivery quantities to available quantity (le disponible)
  const handleSetDisponible = () => {
    if (!editedOrderLocal) return;

    setEditedOrderLocal((prev) => {
      if (!prev) return prev;
      const copy = { ...prev };
      copy.plexuspurchaseOrderLines = copy.plexuspurchaseOrderLines?.map(
        (line) => ({
          ...line,
          deliveryQuantity: line.quantity || 0, // Set to original quantity (assuming this is "le disponible")
        }),
      );
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
      const selectedLines =
        editedOrderLocal.plexuspurchaseOrderLines?.filter(
          (line) => line.selected !== false,
        ) || [];
      if (selectedLines.length === 0) {
        setError("Veuillez sélectionner au moins une ligne à valider.");
        setValidating(false);
        return;
      }

      // For each selected line, if invoiceQuantity (Quantité à livrer) differs from quantity,
      // copy it into receiveQuantity and QuantityAvailable so the backend uses the correct value.
      const orderToSubmit = {
        ...editedOrderLocal,
        ShippingAdvice: "Confirmé",
        plexuspurchaseOrderLines: selectedLines.map((line) => {
          const qty = Number(line.invoiceQuantity ?? line.quantity ?? 0);
          return {
            ...line,
            quantity: qty,
            receiveQuantity: qty,
            QuantityAvailable: qty,
          };
        }),
      };

      // Send full order data including id for the PATCH
      const response = await axiosServices.post(
        `/api/purchase-orders/validate-order`,
        orderToSubmit,
        { responseType: "blob" },
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const filename =
        "BL_" + (editedOrderLocal.number || "").replace(/\//g, "-") + ".pdf";
      setBlPdfBlob(blob);
      setBlFilename(filename);

      // Close edit dialog, open BL download dialog
      setEditOrder(null);
      setEditedOrderLocal(null);
      setBlDialogOpen(true);

      // Remove from local state immediately for snappy UX
      setData((prev) => prev.filter((o) => o.id !== editedOrderLocal.id));
      setTotalCount((prev) => prev - 1);
    } catch (err: any) {
      console.error("Error validating order:", err);
      setError(
        "Erreur lors de la validation: " + (err.message || "Erreur inconnue"),
      );
    } finally {
      setValidating(false);
    }
  };
  const filteredLines = useMemo(() => {
    if (!editedOrderLocal?.plexuspurchaseOrderLines) return [];

    return editedOrderLocal.plexuspurchaseOrderLines.filter(
      (line) =>
        (line.lineObjectNumber || "")
          .toLowerCase()
          .includes(lineSearch.toLowerCase()) ||
        (line.description || "")
          .toLowerCase()
          .includes(lineSearch.toLowerCase()),
    );
  }, [lineSearch, editedOrderLocal]);
  const handleDownloadBL = () => {
    if (!blPdfBlob) return;
    const url = window.URL.createObjectURL(blPdfBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = blFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
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
        header: "Client",
        id: "client",
        enableSorting: false,
        cell: ({ row }) => {
          const name = (row.original as any).shipToName;
          const no = (row.original as any).SellToCustomerNo;
          const clientName = customers[no] || name || no || "-";
          return (
            <Typography variant="body2" fontWeight={500}>
              {clientName}
            </Typography>
          );
        },
      },
      {
        header: "Status",
        accessorKey: "ShippingAdvice",
        enableSorting: false,
        cell: ({ getValue }) => {
          const ShippingAdvice = getValue<string>();
          switch (ShippingAdvice) {
            case "Totalité":
              return (
                <Chip
                  label="Totalité"
                  size="small"
                  sx={{
                    bgcolor: "rgba(76, 175, 80, 0.15)",
                    color: "#2E7D32",
                    fontWeight: 600,
                  }}
                />
              );
            case "ConfirmationPartielle":
              return (
                <Chip
                  color="warning"
                  label="Confirmation Partielle"
                  size="small"
                  variant="light"
                />
              );
            case "Draft":
              return (
                <Chip
                  color="warning"
                  label="Draft"
                  size="small"
                  variant="light"
                />
              );
            case "Livrer Disponible":
            case "LivraisonDispo":
              return (
                <Chip
                  label="Livraison Dispo"
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
                <Chip color="default" label={ShippingAdvice} size="small" />
              );
          }
        },
      },
      {
        header: "Actions",
        meta: { align: "center" },
        id: "actions",
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
                    setExpandedRows((p) => {
                      if (p[row.id] === "view") {
                        return { ...p, [row.id]: null };
                      }
                      return { [row.id]: "view" };
                    });
                  }}
                >
                  <Eye style={{ width: 36, height: 36 }} />
                </IconButton>
              </Tooltip>
              {(ShippingAdvice === "Totalité" ||
                ShippingAdvice === "LivraisonDispo" ||
                ShippingAdvice === "Livrer Disponible") && (
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
    [customers],
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
        gap={2}
        p={3}
      >
        <DebouncedInput
          value={globalFilter}
          onFilterChange={(v) => setGlobalFilter(String(v))}
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
                    const status = (row.original as any).ShippingAdvice;
                    const rowBg =
                      status === "Totalité"
                        ? "rgba(76, 175, 80, 0.08)"
                        : status === "LivraisonDispo" ||
                            status === "Livrer Disponible"
                          ? "rgba(255, 193, 7, 0.08)"
                          : "transparent";
                    return (
                      <Fragment key={row.id}>
                        <TableRow hover sx={{ bgcolor: rowBg }}>
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
                                    const filteredLines = term
                                      ? lines.filter((line) => {
                                          const haystack = [
                                            line.lineObjectNumber,
                                            line.description,
                                            line.Decision,
                                            line.OldRemplacementItemNo,
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
                                            <TableCell>Prix unitaire</TableCell>
                                            <TableCell>Ancienne prix</TableCell>

                                            <TableCell>Quantité</TableCell>
                                            <TableCell>
                                              Quantité disponible
                                            </TableCell>
                                            <TableCell>
                                              Quantité validée par le client
                                            </TableCell>
                                            <TableCell>
                                              Quantité livrée
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
                                                <TableRow
                                                  key={line.id}
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
                                                  }}
                                                >
                                                  <TableCell>
                                                    {line.lineObjectNumber}
                                                  </TableCell>
                                                  <TableCell>
                                                    {line.description}
                                                  </TableCell>
                                                  <TableCell>
                                                    {line.directUnitCost}
                                                  </TableCell>
                                                  <TableCell>
                                                    {line.OldUnitPrice || "-"}
                                                  </TableCell>
                                                  <TableCell>
                                                    {line.quantity}
                                                  </TableCell>
                                                  <TableCell
                                                    sx={{
                                                      color: "primary.main",
                                                      fontWeight: "bold",
                                                    }}
                                                  >
                                                    {line.QuantityAvailable ??
                                                      0}
                                                  </TableCell>
                                                  <TableCell>
                                                    {line.invoiceQuantity}
                                                  </TableCell>
                                                  <TableCell>0</TableCell>
                                                  <TableCell>
                                                    {line.Decision ===
                                                    "LivPrevuaDate"
                                                      ? "LivraisonPrevuDate"
                                                      : line.Decision || "-"}
                                                  </TableCell>

                                                  <TableCell>
                                                    {line.Decision ===
                                                    "LivPrevuaDate"
                                                      ? line.expectedReceiptDate ||
                                                        "-"
                                                      : line.DeliveryDate ||
                                                        "-"}
                                                  </TableCell>
                                                </TableRow>
                                              ),
                                            )
                                          ) : (
                                            <TableRow>
                                              <TableCell
                                                colSpan={9}
                                                align="center"
                                              >
                                                Aucun ligne trouvée
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
      <Dialog
        open={!!editOrder}
        onClose={() => setEditOrder(null)}
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle>Valide la commande</DialogTitle>
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

              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <strong>Détails des lignes</strong>
                <TextField
                  size="small"
                  label="Chercher"
                  value={lineSearch}
                  onChange={(e) => setLineSearch(e.target.value)}
                />
              </Stack>
              {editedOrderLocal.plexuspurchaseOrderLines &&
              editedOrderLocal.plexuspurchaseOrderLines.length > 0 ? (
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
                      {filteredLines.some(
                        (l: ExtendedPurchaseOrderLine) =>
                          l.Decision === "LivPrevuaDate",
                      ) && <TableCell>Date Livraison</TableCell>}
                      <TableCell>
                        <Stack
                          direction="row"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <Checkbox size="small" checked={true} disabled />
                        </Stack>
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {filteredLines.map(
                      (line: ExtendedPurchaseOrderLine, idx: number) => {
                        return (
                          <TableRow
                            key={line.id || idx}
                            sx={{
                              bgcolor:
                                line.Decision === "NonDisponible"
                                  ? (theme) =>
                                      alpha(theme.palette.error.main, 0.12)
                                  : "inherit",
                            }}
                          >
                            <TableCell>{line.lineObjectNumber}</TableCell>
                            <TableCell>{line.description || ""}</TableCell>
                            <TableCell>
                              <TextField
                                size="small"
                                type="number"
                                value={line.directUnitCost ?? ""}
                                onChange={(e) => {
                                  const v = e.target.value;
                                  setEditedOrderLocal((prev) => {
                                    if (!prev) return prev;
                                    const copy = { ...prev };
                                    copy.plexuspurchaseOrderLines =
                                      copy.plexuspurchaseOrderLines?.map(
                                        (l: ExtendedPurchaseOrderLine) =>
                                          l.id === line.id
                                            ? {
                                                ...l,
                                                directUnitCost: Number(v),
                                              }
                                            : l,
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
                            <TableCell>
                              {line.Decision === "LivPrevuaDate"
                                ? "LivraisonPrevuDate"
                                : line.Decision || ""}
                            </TableCell>
                            <TableCell>
                              <TextField
                                size="small"
                                type="number"
                                value={line.invoiceQuantity ?? 0}
                                disabled
                                onChange={(e) => {
                                  const v = e.target.value;
                                  setEditedOrderLocal((prev) => {
                                    if (!prev) return prev;
                                    const copy = { ...prev };
                                    copy.plexuspurchaseOrderLines =
                                      copy.plexuspurchaseOrderLines?.map(
                                        (l: ExtendedPurchaseOrderLine) =>
                                          l.id === line.id
                                            ? {
                                                ...l,
                                                QuantityAvailable: Number(v),
                                              }
                                            : l,
                                      );
                                    return copy;
                                  });
                                }}
                                sx={{ width: 100 }}
                              />
                            </TableCell>
                            {filteredLines.some(
                              (l: ExtendedPurchaseOrderLine) =>
                                l.Decision === "LivPrevuaDate",
                            ) && (
                              <TableCell>
                                {line.Decision === "LivPrevuaDate" && (
                                  <TextField
                                    size="small"
                                    type="date"
                                    value={line.DeliveryDate || ""}
                                    onChange={(e) => {
                                      const v = e.target.value;
                                      setEditedOrderLocal((prev) => {
                                        if (!prev) return prev;
                                        const copy = { ...prev };
                                        copy.plexuspurchaseOrderLines =
                                          copy.plexuspurchaseOrderLines?.map(
                                            (l: ExtendedPurchaseOrderLine) =>
                                              l.id === line.id
                                                ? { ...l, DeliveryDate: v }
                                                : l,
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
                              <Stack
                                direction="row"
                                alignItems="center"
                                justifyContent="center"
                              >
                                <Checkbox
                                  size="small"
                                  checked={line.selected !== false}
                                  onChange={(e) => {
                                    const checked = e.target.checked;
                                    setEditedOrderLocal((prev) => {
                                      if (!prev) return prev;
                                      const copy = { ...prev };
                                      copy.plexuspurchaseOrderLines =
                                        copy.plexuspurchaseOrderLines?.map(
                                          (l: ExtendedPurchaseOrderLine) =>
                                            l.id === line.id
                                              ? { ...l, selected: checked }
                                              : l,
                                        );
                                      return copy;
                                    });
                                  }}
                                />
                              </Stack>
                            </TableCell>
                          </TableRow>
                        );
                      },
                    )}
                  </TableBody>
                </Table>
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
        <DialogActions>
          <Button
            variant="contained"
            onClick={handleValider}
            disabled={validating}
            startIcon={validating ? <CircularProgress size={16} /> : undefined}
          >
            {validating ? "Génération..." : "Valider"}
          </Button>

          <Button variant="outlined" onClick={handleAnnuler}>
            Annuler
          </Button>
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
    </MainCard>
  );
}
