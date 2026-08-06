'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  MenuItem,
  Button,
  CircularProgress,
  Alert,
  Collapse,
  IconButton,
  Divider,
  Stack,
  useTheme
} from '@mui/material';
import {
  ArrowDown,
  ArrowUp,
  Activity,
  Calculator,
  Calendar,
  SearchNormal1,
  Category,
  Briefcase
} from '@wandersonalwes/iconsax-react';
import axiosServices from 'utils/axios';

interface OrderLine {
  lineObjectNumber: string;
  description: string;
  quantity: number;
  directUnitCost: number;
  clientDiscountPercent: number;
  clientCostUnitPrice: number;
  starUnitPrice: number;
  starGainUnitPrice: number;
  totalPublicHT: number;
  totalClientCostHT: number;
  totalStarHT: number;
  totalStarGainHT: number;
}

interface InsuranceOrder {
  id: string;
  number: string;
  orderDate: string;
  vendorName: string;
  payToVendorNumber: string;
  customerNumber: string;
  customerName: string;
  insuranceName: string;
  insuredName: string;
  registrationNumber: string;
  vin: string;
  totalPublicHT: number;
  totalClientCostHT: number;
  totalStarHT: number;
  totalStarGainHT: number;
  lines: OrderLine[];
}

interface ReportTotals {
  totalPublicHT: number;
  totalClientCostHT: number;
  totalStarHT: number;
  totalStarGainHT: number;
}

export default function InsuranceReportPage() {
  const theme = useTheme();
  const router = useRouter();

  useEffect(() => {
    router.push('/bienvenue');
  }, [router]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<InsuranceOrder[]>([]);
  const [totals, setTotals] = useState<ReportTotals>({
    totalPublicHT: 0,
    totalClientCostHT: 0,
    totalStarHT: 0,
    totalStarGainHT: 0
  });

  // Filters State
  const [insuranceName, setInsuranceName] = useState('STAR ASSURANCE');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [search, setSearch] = useState('');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const fetchReportData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let url = `/api/reports/insurance-benefits?insuranceName=${encodeURIComponent(insuranceName)}`;
      if (startDate) {
        url += `&startDate=${encodeURIComponent(startDate)}`;
      }
      if (endDate) {
        url += `&endDate=${encodeURIComponent(endDate)}`;
      }
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }

      const response = await axiosServices.get(url);
      setOrders(response.data.orders || []);
      setTotals(response.data.totals || {
        totalPublicHT: 0,
        totalClientCostHT: 0,
        totalStarHT: 0,
        totalStarGainHT: 0
      });
    } catch (err: any) {
      console.error('Error fetching report data:', err);
      setError(err.response?.data || err.message || 'Une erreur est survenue lors de la récupération du rapport.');
    } finally {
      setLoading(false);
    }
  }, [insuranceName, startDate, endDate, search]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  const handleRowClick = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const averageSavingPercent = totals.totalPublicHT > 0
    ? (totals.totalStarGainHT / totals.totalPublicHT) * 100
    : 0;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3
    }).format(val) + ' DT';
  };

  return (
    <Box sx={{ p: 3, maxWidth: '1600px', margin: '0 auto' }}>
      
      {/* Title */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
        <Box sx={{ p: 1, bgcolor: 'primary.lighter', borderRadius: 2, display: 'flex' }}>
          <Briefcase size="32" color={theme.palette.primary.main} />
        </Box>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 700 }}>
            Rapport de Suivi Partenariats Assurances
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Visualisez et suivez les avantages financiers accordés aux compagnies d'assurance.
          </Typography>
        </Box>
      </Stack>

      {/* Filters Section */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 3, boxShadow: theme.customShadows.z1 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select
              fullWidth
              label="Compagnie d'assurance"
              value={insuranceName}
              onChange={(e) => setInsuranceName(e.target.value)}
              size="small"
            >
              <MenuItem value="STAR ASSURANCE">STAR ASSURANCE</MenuItem>
              <MenuItem value="MAE ASSURANCE">MAE ASSURANCE</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={2.5}>
            <TextField
              fullWidth
              type="date"
              label="Date début"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.5}>
            <TextField
              fullWidth
              type="date"
              label="Date fin"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              placeholder="N° Commande, Matricule..."
              label="Rechercher"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              size="small"
              InputProps={{
                startAdornment: (
                  <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                    <SearchNormal1 size="18" color={theme.palette.text.secondary} />
                  </Box>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} md={1} sx={{ textAlign: 'right' }}>
            <Button
              variant="contained"
              onClick={fetchReportData}
              disabled={loading}
              sx={{ minWidth: '100px' }}
            >
              Filtrer
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Loading state */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={48} />
        </Box>
      )}

      {/* Error state */}
      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && (
        <>
          {/* KPI Dashboard Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: 'background.paper', borderRadius: 3, boxShadow: theme.customShadows.z1, borderLeft: `6px solid ${theme.palette.secondary.main}` }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Total Chiffre d'Affaires Public
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {formatCurrency(totals.totalPublicHT)}
                      </Typography>
                    </Box>
                    <Box sx={{ p: 1, bgcolor: 'secondary.lighter', borderRadius: '50%', display: 'flex' }}>
                      <Calculator size="24" color={theme.palette.secondary.main} />
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: 'background.paper', borderRadius: 3, boxShadow: theme.customShadows.z1, borderLeft: `6px solid ${theme.palette.primary.main}` }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Total Facturé à l'Assurance
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        {formatCurrency(totals.totalStarHT)}
                      </Typography>
                    </Box>
                    <Box sx={{ p: 1, bgcolor: 'primary.lighter', borderRadius: '50%', display: 'flex' }}>
                      <Activity size="24" color={theme.palette.primary.main} />
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: 'background.paper', borderRadius: 3, boxShadow: theme.customShadows.z1, borderLeft: `6px solid ${theme.palette.success.main}` }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Total Économisé par l'Assurance
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                        {formatCurrency(totals.totalStarGainHT)}
                      </Typography>
                    </Box>
                    <Box sx={{ p: 1, bgcolor: 'success.lighter', borderRadius: '50%', display: 'flex' }}>
                      <ArrowDown size="24" color={theme.palette.success.main} />
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: 'background.paper', borderRadius: 3, boxShadow: theme.customShadows.z1, borderLeft: `6px solid ${theme.palette.warning.main}` }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Économie Moyenne (%)
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                        {averageSavingPercent.toFixed(2)} %
                      </Typography>
                    </Box>
                    <Box sx={{ p: 1, bgcolor: 'warning.lighter', borderRadius: '50%', display: 'flex' }}>
                      <ArrowUp size="24" color={theme.palette.warning.main} />
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

          </Grid>

          {/* Orders detail table */}
          <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: theme.customShadows.z1 }}>
            <Table size="medium">
              <TableHead sx={{ bgcolor: 'primary.lighter' }}>
                <TableRow>
                  <TableCell />
                  <TableCell sx={{ fontWeight: 700 }}>N° Commande</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Client / Réparateur</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Immatriculation</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>N° Châssis (VIN)</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>Total Public HT</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>Total STAR HT</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>Gain Assurance HT</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <React.Fragment key={order.id}>
                      <TableRow 
                        hover 
                        onClick={() => handleRowClick(order.id)}
                        sx={{ cursor: 'pointer', '& > *': { borderBottom: 'unset' } }}
                      >
                        <TableCell>
                          <IconButton size="small">
                            {expandedOrder === order.id ? (
                              <ArrowUp size="18" color={theme.palette.text.primary} />
                            ) : (
                              <ArrowDown size="18" color={theme.palette.text.primary} />
                            )}
                          </IconButton>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{order.number}</TableCell>
                        <TableCell>{order.orderDate}</TableCell>
                        <TableCell>{order.customerName || `Client ${order.customerNumber}`}</TableCell>
                        <TableCell>{order.registrationNumber || '-'}</TableCell>
                        <TableCell sx={{ fontFamily: 'monospace' }}>{order.vin || '-'}</TableCell>
                        <TableCell align="right">{formatCurrency(order.totalPublicHT)}</TableCell>
                        <TableCell align="right" sx={{ color: 'primary.main', fontWeight: 600 }}>
                          {formatCurrency(order.totalStarHT)}
                        </TableCell>
                        <TableCell align="right" sx={{ color: 'success.main', fontWeight: 600 }}>
                          {formatCurrency(order.totalStarGainHT)}
                        </TableCell>
                      </TableRow>
                      
                      {/* Expanded Line Details Table */}
                      <TableRow>
                        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={9}>
                          <Collapse in={expandedOrder === order.id} timeout="auto" unmountOnExit>
                            <Box sx={{ margin: 2, p: 2, bgcolor: theme.palette.action.hover, borderRadius: 2 }}>
                              <Typography variant="h6" gutterBottom component="div" sx={{ fontWeight: 700, color: 'text.secondary', mb: 2 }}>
                                Détail de la commande: {order.number}
                              </Typography>
                              <Table size="small">
                                <TableHead>
                                  <TableRow sx={{ borderBottom: `2px solid ${theme.palette.divider}` }}>
                                    <TableCell sx={{ fontWeight: 700 }}>Code Article</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                                    <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Quantité</TableCell>
                                    <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>P.U Public HT</TableCell>
                                    <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Remise Réparateur</TableCell>
                                    <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>P.U Achat Réparateur</TableCell>
                                    <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>P.U Vente STAR (10% Marge)</TableCell>
                                    <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>Gain Assurance HT</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {order.lines.map((line, lidx) => (
                                    <TableRow key={line.lineObjectNumber + lidx}>
                                      <TableCell sx={{ fontWeight: 600 }}>{line.lineObjectNumber}</TableCell>
                                      <TableCell>{line.description}</TableCell>
                                      <TableCell align="center">{line.quantity}</TableCell>
                                      <TableCell align="right">{formatCurrency(line.directUnitCost)}</TableCell>
                                      <TableCell align="center">{(line.clientDiscountPercent || 0).toFixed(0)} %</TableCell>
                                      <TableCell align="right">{formatCurrency(line.clientCostUnitPrice)}</TableCell>
                                      <TableCell align="right" sx={{ color: 'primary.main', fontWeight: 600 }}>
                                        {formatCurrency(line.starUnitPrice)}
                                      </TableCell>
                                      <TableCell align="right" sx={{ color: 'success.main', fontWeight: 600 }}>
                                        {formatCurrency(line.totalStarGainHT)}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                      <Typography variant="body1" color="text.secondary">
                        Aucun dossier d'assurance trouvé pour ces critères.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

    </Box>
  );
}
