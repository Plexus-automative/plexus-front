'use client';

import { useMemo, useState, Fragment, MouseEvent, useEffect } from 'react';
import axios from 'axios';
import { useIntl } from 'react-intl';
// material-ui
import { alpha } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

// third-party
import { ColumnDef, flexRender, getCoreRowModel, getPaginationRowModel, useReactTable, SortingState, ColumnFiltersState } from '@tanstack/react-table';

// project imports
import MainCard from 'components/MainCard';
import DebouncedInput from 'components/third-party/react-table/DebouncedInput';
import CSVExport from 'components/third-party/react-table/CSVExport';
import HeaderSort from 'components/third-party/react-table/HeaderSort';
import TablePagination from 'components/third-party/react-table/TablePagination';

// icons
import { ShoppingCart } from "@wandersonalwes/iconsax-react";
// ==============================|| TYPES ||============================== //

interface Item {
  id: string;
  number: string;
  description: string;
  quantity: number;
  vendor: string;
  price: number;
}

// ==============================|| REACT TABLE COMPONENT ||============================== //

interface ReactTableProps {
  columns: ColumnDef<Item>[];
  data: Item[];
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  isAdaptable: boolean;
  setIsAdaptable: (value: boolean) => void;
}

function ReactTable({ columns, data, searchTerm, setSearchTerm, isAdaptable, setIsAdaptable }: ReactTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState(searchTerm);
  const intl = useIntl();

  const table = useReactTable({
    data,
    columns,
    state: { sorting, rowSelection, globalFilter },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  });

  const headers = columns.map((col) => ({
    label: typeof col.header === 'string' ? col.header : '#',
    key: (col as { accessorKey?: string }).accessorKey ?? ''
  }));

  return (
    <MainCard content={false}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        sx={(theme) => ({
          gap: 2,
          justifyContent: 'space-between',
          p: 3,
          alignItems: 'center',
          [theme.breakpoints.down('sm')]: { '& .MuiOutlinedInput-root, & .MuiFormControl-root': { width: '100%' } }
        })}
      >
        <Stack direction="row" sx={{ alignItems: 'center', gap: 2 }}>
          <DebouncedInput
            value={globalFilter ?? ''}
            onFilterChange={(value) => setSearchTerm(String(value))}
            placeholder={intl.formatMessage({ id: 'search_placeholder', defaultMessage: 'Search {count} items...' }, { count: data.length })}
          />
          <FormControlLabel
            control={<Checkbox checked={isAdaptable} onChange={(e) => setIsAdaptable(e.target.checked)} sx={{ color: (t) => t.palette.primary.main }} />}
            label={intl.formatMessage({ id: 'add-adaptable-items' })}
            sx={{ mr: 0 }}
          />
        </Stack>
        <CSVExport data={data} headers={headers} filename="items-list.csv" />
      </Stack>

      <TableContainer>
        <Table>
          <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableCell key={header.id} {...header.column.columnDef.meta}>
                    {header.isPlaceholder ? null : (
                      <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
                        <Box>{flexRender(header.column.columnDef.header, header.getContext())}</Box>
                        {header.column.getCanSort() && <HeaderSort column={header.column} />}
                      </Stack>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>

          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <Fragment key={row.id}>
                <TableRow>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} {...cell.column.columnDef.meta}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Divider />
      <Box sx={{ p: 2 }}>
        <TablePagination
          setPageSize={table.setPageSize}
          setPageIndex={table.setPageIndex}
          getState={table.getState}
          getPageCount={table.getPageCount}
        />
      </Box>
    </MainCard>
  );
}

// ==============================|| ARTICLES LIST PAGE ||============================== //

export default function ArticlesListPage() {
  const theme = useTheme();
  const intl = useIntl();
  const [items, setItems] = useState<Item[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [isAdaptable, setIsAdaptable] = useState<boolean>(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  const handleOpenModal = (item: Item) => {
    setSelectedItem(item);
    setQuantity(1);
    setIsAdaptable(false);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedItem(null);
    setQuantity(1);
    setIsAdaptable(false);
  };

  const handleAddToCart = async () => {
  if (!selectedItem || quantity <= 0) return;

  try {
    const today = new Date().toISOString().split('T')[0];

    const baseUrl = `https://api.businesscentral.dynamics.com/v2.0/235ce906-04c4-4ee5-a705-c904b1fa3167/Plexus/api/NEL/AcessPurchasesAPI/v2.0/companies(683ADB98-EA07-F111-8405-7CED8D83AA60)`;

    // ================================
    // 1️⃣ CREATE PURCHASE HEADER
    // ================================
    const headerPayload = {
      vendorNumber: selectedItem.number,
      orderDate: today,
      postingDate: today,
      ShippingAdvice: "Attente",
      Delivred: "Non",
      QtyReceived: "Non"
    };

    const headerResponse = await axios.post(
      `${baseUrl}/PlexuspurchaseOrders`,
      headerPayload,
      {
        headers: {
          Authorization: `Bearer ${process.env.TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const purchaseOrderId = headerResponse.data.id; // 🔥 THIS IS IMPORTANT

    console.log("Purchase Header Created:", purchaseOrderId);

    // ================================
    // 2️⃣ CREATE PURCHASE LINE
    // ================================
    const linePayload = {
      lineType: "Item",
      lineObjectNumber: searchTerm, // <-- your searched reference
      quantity: quantity
    };

    await axios.post(
      `${baseUrl}/PlexuspurchaseOrders(${purchaseOrderId})/PlexuspurchaseOrderLines`,
      linePayload,
      {
        headers: {
          Authorization: `Bearer ${process.env.TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log("Purchase Line Created");

    setShowSuccessAlert(true);
    handleCloseModal();

  } catch (error) {
    console.error("Error creating purchase order:", error);
  }
};


  const columns = useMemo<ColumnDef<Item>[]>(
    () => [
      { header: 'Number', accessorKey: 'number' },
      { header: 'Description', accessorKey: 'description' },
      { header: 'Vendor', accessorKey: 'vendor' },
      { header: 'Price', accessorKey: 'price' },
      {
        header: 'Actions',
        meta: { align: 'center' },
        disableSortBy: true,
        cell: ({ row }) => (
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'center' }}>
            <IconButton
              color="primary"
              onClick={() => handleOpenModal(row.original)}
              size="small"
            >
              <ShoppingCart size={26} />
            </IconButton>
          </Stack>
        )
      }
    ],
    []
  );

  useEffect(() => {
    if (!searchTerm) return setItems([]);

    const fetchItems = async () => {
      setLoading(true);
      try {
        const url = `https://api.businesscentral.dynamics.com/v2.0/235ce906-04c4-4ee5-a705-c904b1fa3167/Plexus/api/NEL/AcessSystemAPI/v1.0/companies(FDCEC2EC-FCB9-F011-AF5F-6045BDC898A3)/ItemVendors?$filter=itemNo eq '${searchTerm}'`;
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${process.env.TOKEN}`, // <-- replace with valid token
            'Content-Type': 'application/json'
          }
        });
        const data = response.data.value.map((item: any) => ({
          number: item.vendorNo,
          vendorName: item.vendorName,
          description: item.ItemDescription,
          vendor: item.vendorName || '',
          price: item.unitPrice || 0
        }));
        setItems(data);
      } catch (err) {
        console.error(err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [searchTerm]);

  return (
    <>
      <ReactTable
        columns={columns}
        data={items}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        isAdaptable={isAdaptable}
        setIsAdaptable={setIsAdaptable}
      />

      {/* Quantity Modal */}
      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
            backdropFilter: 'blur(10px)',
            animation: 'slideUp 0.3s ease-out',
            '@keyframes slideUp': {
              from: {
                opacity: 0,
                transform: 'translateY(20px)'
              },
              to: {
                opacity: 1,
                transform: 'translateY(0)'
              }
            }
          }
        }}
      >
        <DialogTitle
          sx={{
            fontSize: '1.75rem',
            fontWeight: 700,
            pb: 2.5,
            pt: 3,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: 'white',
            textAlign: 'center',
            letterSpacing: 0.5
          }}
        >
          ✓ {intl.formatMessage({ id: 'add-to-basket' })}
        </DialogTitle>
        <DialogContent sx={{ pt: 4, pb: 3 }}>
          <Stack spacing={3.5}>
            {/* Item Details Card */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                bgcolor: theme.palette.primary.lighter,
                borderRadius: 2.5,
                backdropFilter: 'blur(8px)',
                border: `1.5px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  boxShadow: `0 10px 30px ${alpha(theme.palette.primary.main, 0.15)}`,
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <Stack spacing={2.5}>
                {/* Item Number */}
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: theme.palette.primary.main,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: 1,
                      fontSize: '0.75rem',
                      opacity: 0.8
                    }}
                  >
                    {intl.formatMessage({ id: 'information' })}
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, mt: 0.8, color: theme.palette.secondary[800] }}>
                    {selectedItem?.number}
                  </Typography>
                </Box>

                <Divider sx={{ opacity: 0.5 }} />

                {/* Description */}
                <Box>
                  <Typography
                    variant="body1"
                    sx={{
                      mt: 0.5,
                      color: theme.palette.secondary[800],
                      lineHeight: 1.7,
                      fontSize: '0.95rem'
                    }}
                  >
                    {selectedItem?.description}
                  </Typography>
                </Box>

                <Divider sx={{ opacity: 0.5 }} />

                {/* Vendor Name */}
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: theme.palette.primary.main,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: 1,
                      fontSize: '0.75rem',
                      opacity: 0.8
                    }}
                  >
                    {intl.formatMessage({ id: 'vendor' })}
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 0.8, color: theme.palette.secondary[800], fontWeight: 500 }}>
                    {selectedItem?.vendor}
                  </Typography>
                </Box>

                <Divider sx={{ opacity: 0.5 }} />

                {/* Price */}
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: theme.palette.primary.main,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: 1,
                      fontSize: '0.75rem',
                      opacity: 0.8
                    }}
                  >
                    {intl.formatMessage({ id: 'unit-price' })}
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      mt: 0.8,
                      fontWeight: 700,
                      color: theme.palette.primary.main,
                      fontSize: '1.5rem'
                    }}
                  >
                    ${parseFloat(String(selectedItem?.price)).toFixed(2)}
                  </Typography>
                </Box>
              </Stack>
            </Paper>

            {/* Quantity Input */}
            <Box>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 700,
                  mb: 1.5,
                  color: theme.palette.secondary[800],
                  fontSize: '0.9rem'
                }}
              >
                {intl.formatMessage({ id: 'quantity' })}
              </Typography>
              <TextField
                autoFocus
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                inputProps={{ min: 1 }}
                fullWidth
                placeholder={intl.formatMessage({ id: 'enter-quantity' })}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontSize: '1.2rem',
                    fontWeight: 600,
                    borderRadius: 2,
                    transition: 'all 0.3s ease-in-out',
                    backgroundColor: `${alpha(theme.palette.primary.main, 0.05)}`,
                    '& fieldset': {
                      borderColor: `${alpha(theme.palette.primary.main, 0.2)}`,
                      borderWidth: 1.5
                    },
                    '&:hover fieldset': {
                      borderColor: theme.palette.primary.light,
                      transition: 'all 0.2s ease-in-out'
                    },
                    '&.Mui-focused': {
                      backgroundColor: `${alpha(theme.palette.primary.main, 0.08)}`,
                      '& fieldset': {
                        borderColor: theme.palette.primary.main,
                        borderWidth: 2,
                        boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`
                      }
                    }
                  }
                }}
              />
            </Box>

            {/* (moved) adaptable checkbox is now next to search */}

            {/* Total Price */}
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.primary.dark, 0.05)} 100%)`,
                borderRadius: 2.5,
                border: `1.5px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.12)}`,
                  transform: 'translateY(-1px)'
                }
              }}
            >
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 700,
                    color: theme.palette.secondary[800],
                    fontSize: '0.95rem'
                  }}
                >
                  {intl.formatMessage({ id: 'total-price' })}
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: theme.palette.primary.main,
                    fontSize: '1.4rem'
                  }}
                >
                  ${(parseFloat(String(selectedItem?.price)) * quantity).toFixed(2)}
                </Typography>
              </Stack>
            </Paper>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1.5, justifyContent: 'center' }}>
          <Button
            onClick={handleCloseModal}
            size="large"
            sx={{
              px: 4,
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '1rem',
              transition: 'all 0.2s ease-in-out',
              color: theme.palette.secondary[800],
              border: `1.5px solid ${alpha(theme.palette.secondary[800]!, 0.2)}`,
              borderRadius: 2,
              '&:hover': {
                backgroundColor: `${alpha(theme.palette.secondary[800]!, 0.05)}`,
                borderColor: theme.palette.secondary[800],
                transform: 'translateY(-2px)',
                boxShadow: `0 4px 12px ${alpha(theme.palette.secondary[800]!, 0.1)}`
              }
            }}
          >
            {intl.formatMessage({ id: 'cancel' })}
          </Button>
          <Button
            onClick={handleAddToCart}
            variant="contained"
            size="large"
            sx={{
              px: 6,
              fontWeight: 700,
              textTransform: 'none',
              fontSize: '1rem',
              borderRadius: 2,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.35)}`,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.5)}`,
                transform: 'translateY(-3px)',
                background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`
              },
              '&:active': {
                transform: 'translateY(-1px)',
                boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.3)}`
              }
            }}
          >
            ✓ {intl.formatMessage({ id: 'add-to-basket' })}
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
          {intl.formatMessage({ id: 'add-to-basket-success', defaultMessage: 'Commande créée avec succès!' })}
        </Alert>
      </Snackbar>
    </>
  );
}


