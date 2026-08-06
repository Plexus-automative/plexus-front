'use client';

import { useEffect, useState, useMemo } from 'react';

// material-ui
import { useTheme, styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

// project-imports
import { GRID_COMMON_SPACING } from 'config';
import useUser from 'hooks/useUser';
import MainCard from 'components/MainCard';
import {
  fetchInsuranceOrders,
  fetchInsuranceDashboardAgg,
  fetchInsuranceOrderLines,
  fetchInsuranceExport,
  InsuranceOrderRow,
  InsuranceLine,
  InsuranceAggData,
  InsuranceAggCompany
} from 'app/api/services/DashboardService';

// next
import { useRouter } from 'next/navigation';

// third-party
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import * as XLSX from 'xlsx';
import { motion } from 'framer-motion';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

// assets
import { ArrowLeft2, ShieldTick, DocumentText, SearchNormal1, Money4, DocumentDownload } from '@wandersonalwes/iconsax-react';

// ==============================|| CONSTANTS ||============================== //

const PALETTE = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#3b82f6', '#ec4899'];

const STATUS_COLORS: Record<string, string> = {
  'Confirmé': '#10b981',
  ConfirmationPartielle: '#f59e0b',
  Annulation: '#f43f5e',
  LivraisonDispo: '#3b82f6',
  Attente: '#8b5cf6',
  'Totalité': '#06b6d4',
  '(vide)': '#94a3b8'
};
const statusColor = (s: string) => STATUS_COLORS[s] || '#94a3b8';

const MONTH_LABELS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];

const ALL = '__ALL__';

// STAR, STAR ASSURANCE and the SATR typo are the same company — merge to a single canonical name.
const STAR_ALIASES = ['STAR', 'STAR ASSURANCE', 'SATR'];
const canonicalInsurance = (name: string) => {
  const n = (name || '').trim();
  return STAR_ALIASES.includes(n.toUpperCase()) ? 'STAR' : n;
};

// Same STAR merge for the fast agg feed: merge companies + rewrite row insuranceName.
function normalizeAggData(agg: InsuranceAggData | null): InsuranceAggData | null {
  if (!agg) return null;
  const map = new Map<string, InsuranceAggCompany>();
  for (const c of agg.companies) {
    const key = canonicalInsurance(c.name);
    const existing = map.get(key);
    if (!existing) {
      map.set(key, {
        name: key,
        count: c.count,
        totalHT: c.totalHT,
        statusBreakdown: Object.fromEntries(Object.entries(c.statusBreakdown).map(([k, v]) => [k, { ...v }]))
      });
    } else {
      existing.count += c.count;
      existing.totalHT += c.totalHT;
      Object.entries(c.statusBreakdown).forEach(([s, v]) => {
        const cur = existing.statusBreakdown[s] || { count: 0, ht: 0 };
        existing.statusBreakdown[s] = { count: cur.count + v.count, ht: cur.ht + v.ht };
      });
    }
  }
  const companies = Array.from(map.values());
  const rows = agg.rows.map((r) => ({ ...r, insuranceName: canonicalInsurance(r.insuranceName) }));
  return {
    grandTotals: { ...agg.grandTotals, companyCount: companies.length },
    companies,
    statuses: agg.statuses,
    rows
  };
}

// ==============================|| STYLED ||============================== //

const PageContainer = styled(Box)(({ theme }) => ({
  background: theme.palette.mode === 'dark' ? '#070a13' : '#f8fafc',
  minHeight: '100vh',
  padding: theme.spacing(3.5),
  borderRadius: '32px',
  fontFamily: 'Inter, sans-serif'
}));

const HeaderRow = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(4)
}));

const PremiumCard = styled(MainCard)(({ theme }) => ({
  borderRadius: '28px',
  border: 'none',
  background: theme.palette.mode === 'dark' ? '#111827' : '#ffffff',
  boxShadow: theme.palette.mode === 'dark' ? '0 12px 48px -8px rgba(0, 0, 0, 0.3)' : '0 12px 48px -8px rgba(17, 24, 39, 0.02)',
  overflow: 'hidden',
  height: '100%',
  '& .MuiCardHeader-root': { padding: '28px 32px 8px 32px' },
  '& .MuiCardContent-root': { padding: '8px 32px 32px 32px' }
}));

const KpiCard = styled(motion.div)<{ accent: string }>(({ theme, accent }) => ({
  background: theme.palette.mode === 'dark' ? '#111827' : '#ffffff',
  borderRadius: '24px',
  padding: '26px 28px',
  height: '100%',
  position: 'relative',
  overflow: 'hidden',
  boxShadow: theme.palette.mode === 'dark' ? '0 12px 40px -12px rgba(0,0,0,0.4)' : '0 12px 40px -14px rgba(17,24,39,0.06)',
  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(17,24,39,0.03)'}`,
  transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease',
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '5px',
    height: '100%',
    background: accent
  },
  '&:hover': { transform: 'translateY(-8px)', boxShadow: '0 24px 50px -18px rgba(0,0,0,0.15)' }
}));

// ==============================|| HELPERS ||============================== //

const formatLocalDate = (date: Date | null) => {
  if (!date) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const parseLocalDate = (dateStr: string) => {
  const parts = dateStr.split('-');
  return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
};

const formatDT = (val: number) =>
  new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Math.round(val || 0)) + ' DT';

const formatInt = (val: number) => new Intl.NumberFormat('fr-FR').format(Math.round(val || 0));

const formatDisplayDate = (raw: string) => {
  if (!raw || raw === 'null') return '-';
  const clean = raw.trim();
  if (clean.length >= 10) return `${clean.substring(8, 10)}-${clean.substring(5, 7)}-${clean.substring(0, 4)}`;
  return raw;
};

const monthLabel = (ym: string) => `${MONTH_LABELS[Number(ym.substring(5, 7)) - 1]} ${ym.substring(2, 4)}`;

// ==============================|| INSURANCE DASHBOARD ||============================== //

export default function InsuranceDashboard() {
  const theme = useTheme();
  const router = useRouter();
  const user = useUser();

  useEffect(() => {
    if (user && user.customerNo !== 'C0082') {
      router.push('/pages/articles');
    }
  }, [user, router]);

  const currentYear = new Date().getFullYear();
  const todayStr = formatLocalDate(new Date());

  const [scope, setScope] = useState<string>(ALL); // ALL or an insuranceName
  const [clientScope, setClientScope] = useState<string>(ALL); // ALL or a SellToCustomerNo
  const [agg, setAgg] = useState<InsuranceAggData | null>(null); // fast aggregates
  const [raw, setRaw] = useState<InsuranceOrderRow[] | null>(null); // fast per-order rows (lazy)
  const [loadingAgg, setLoadingAgg] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Canonicalize STAR variants (STAR = STAR ASSURANCE = SATR) before any derivation.
  const aggData = useMemo(() => normalizeAggData(agg), [agg]);
  const data = useMemo(
    () => (raw ? { orders: raw.map((o) => ({ ...o, insuranceName: canonicalInsurance(o.insuranceName) })) } : null),
    [raw]
  );

  const [startDate, setStartDate] = useState(`${currentYear}-01-01`);
  const [endDate, setEndDate] = useState(todayStr);
  const [tempStartDate, setTempStartDate] = useState(`${currentYear}-01-01`);
  const [tempEndDate, setTempEndDate] = useState(todayStr);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // Row-detail modal (lines with & without remise) + Excel export
  const [modalOrder, setModalOrder] = useState<InsuranceOrderRow | null>(null);
  const [modalLines, setModalLines] = useState<InsuranceLine[] | null>(null);
  const [exportLoading, setExportLoading] = useState(false);

  // Two-phase load: fast aggregates render the KPIs/charts; the flat per-order feed streams
  // in afterwards for the dossiers table + client/vendor breakdowns + client filter.
  useEffect(() => {
    let active = true;
    setLoadingAgg(true);
    setLoadingOrders(true);
    // Clear stale results so KPIs/charts reflect the new range from the fast agg immediately.
    setAgg(null);
    setRaw(null);
    fetchInsuranceDashboardAgg(startDate, endDate).then((a) => {
      if (active) {
        setAgg(a);
        setLoadingAgg(false);
      }
    });
    fetchInsuranceOrders(startDate, endDate).then((r) => {
      if (active) {
        setRaw(r);
        setLoadingOrders(false);
      }
    });
    return () => {
      active = false;
    };
  }, [startDate, endDate]);

  const companyColor = useMemo(() => {
    const map: Record<string, string> = {};
    (aggData?.companies || []).forEach((c, i) => {
      map[c.name] = PALETTE[i % PALETTE.length];
    });
    return map;
  }, [aggData]);

  // Distinct clients (SellToCustomerNo) for the client selector, ranked by CA HT.
  const clientOptions = useMemo(() => {
    if (!data) return [] as { no: string; ht: number }[];
    const m: Record<string, number> = {};
    data.orders.forEach((o) => {
      const c = o.customerName || '(Inconnu)';
      m[c] = (m[c] || 0) + (o.totalHT || 0);
    });
    return Object.entries(m)
      .map(([no, ht]) => ({ no, ht }))
      .sort((a, b) => b.ht - a.ht);
  }, [data]);

  // Companies list for the selector/colors — from the fast agg feed.
  const companiesList = useMemo(
    () => (aggData?.companies as { name: string; count: number; totalHT: number }[]) || [],
    [aggData]
  );

  // --- unified derivations: KPIs/charts from agg (or client-filtered orders); top/dossiers from orders ---
  const scoped = useMemo(() => {
    const isAllCompany = scope === ALL;
    const isAllClient = clientScope === ALL;
    const ordersReady = !!data;

    // Chart cells: once per-order data is in, use it (keeps KPIs exactly consistent with the
    // dossiers table + TTC). Before it arrives, fall back to the fast agg feed as an instant
    // preview (agg HT = PLX_TotalAmountPhysical, ~matches but not byte-identical to the orders).
    type Cell = { ins: string; status: string; date: string; count: number; ht: number };
    let cells: Cell[] = [];
    if (data) {
      const src = isAllClient ? data.orders : data.orders.filter((o) => o.customerName === clientScope);
      cells = src.map((o) => ({ ins: o.insuranceName, status: o.shippingAdvice || '(vide)', date: o.orderDate, count: 1, ht: o.totalHT }));
    } else if (isAllClient && aggData) {
      cells = aggData.rows.map((r) => ({
        ins: r.insuranceName,
        status: r.shippingAdvice || '(vide)',
        date: r.orderDate,
        count: r.count,
        ht: r.totalHT
      }));
    }

    // Adaptive time bucket based on the selected range.
    const spanDays = Math.abs((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000);
    const periodMode: 'year' | 'month' | 'day' = spanDays > 400 ? 'year' : spanDays <= 92 ? 'day' : 'month';
    const keyOf = (d: string) =>
      periodMode === 'year' ? d.substring(0, 4) : periodMode === 'month' ? d.substring(0, 7) : d.substring(0, 10);

    // Company comparison spans all companies (client filter already applied via cells).
    const compMap: Record<string, number> = {};
    cells.forEach((c) => (compMap[c.ins] = (compMap[c.ins] || 0) + c.ht));
    const companyComparison = Object.entries(compMap).sort((a, b) => b[1] - a[1]);

    const workCells = isAllCompany ? cells : cells.filter((c) => c.ins === scope);

    let count = 0;
    let totalHT = 0;
    const statusMap: Record<string, { count: number; ht: number }> = {};
    const periodHT: Record<string, number> = {};
    const periodStatus: Record<string, Record<string, number>> = {};
    workCells.forEach((c) => {
      count += c.count;
      totalHT += c.ht;
      const sc = statusMap[c.status] || { count: 0, ht: 0 };
      statusMap[c.status] = { count: sc.count + c.count, ht: sc.ht + c.ht };
      const pk = c.date ? keyOf(c.date) : '';
      if (pk) {
        periodHT[pk] = (periodHT[pk] || 0) + c.ht;
        if (!periodStatus[pk]) periodStatus[pk] = {};
        periodStatus[pk][c.status] = (periodStatus[pk][c.status] || 0) + c.count;
      }
    });

    const statusList = Object.entries(statusMap).map(([status, v]) => ({ status, count: v.count, ht: v.ht }));
    const confirmedCount = statusMap['Confirmé']?.count || 0;
    const confirmeHT = statusMap['Confirmé']?.ht || 0;
    const annulationHT = statusMap['Annulation']?.ht || 0;
    const periodKeys = Object.keys(periodHT).sort();
    const periodLabel = (k: string) => {
      if (periodMode === 'year') return k;
      if (periodMode === 'month') return monthLabel(k);
      return `${k.substring(8, 10)} ${MONTH_LABELS[Number(k.substring(5, 7)) - 1]}`;
    };
    const periodNoun = periodMode === 'year' ? 'annuelle' : periodMode === 'day' ? 'journalière' : 'mensuelle';
    const statusesPresent = Array.from(new Set(workCells.map((c) => c.status)));
    const companyCount = new Set(cells.map((c) => c.ins)).size;

    // Per-order derivations (need the full order rows) — top clients/vendors, dossiers.
    const ordersFiltered: InsuranceOrderRow[] = ordersReady
      ? (isAllClient ? data!.orders : data!.orders.filter((o) => o.customerName === clientScope)).filter(
        (o) => isAllCompany || o.insuranceName === scope
      )
      : [];
    const repMap: Record<string, number> = {};
    const cliMap: Record<string, number> = {};
    ordersFiltered.forEach((o) => {
      const rep = o.vendorName || o.customerName || 'Inconnu';
      repMap[rep] = (repMap[rep] || 0) + (o.totalHT || 0);
      const cli = o.customerName || '(Inconnu)';
      cliMap[cli] = (cliMap[cli] || 0) + (o.totalHT || 0);
    });
    const topRepairers = Object.entries(repMap)
      .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
      .slice(0, 6)
      .reverse();
    const topClients = Object.entries(cliMap)
      .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
      .slice(0, 8)
      .reverse();

    return {
      isAllCompany,
      isAllClient,
      ordersReady,
      orders: ordersFiltered,
      totals: { count, totalHT, confirmeHT, annulationHT },
      statusList,
      confirmedCount,
      companyCount,
      periodMode,
      periodNoun,
      periodKeys,
      periodHT,
      periodStatus,
      periodLabel,
      statusesPresent,
      topRepairers,
      topClients,
      companyComparison
    };
  }, [aggData, data, scope, clientScope, startDate, endDate]);

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return scoped.orders;
    return scoped.orders.filter(
      (o) =>
        o.number.toLowerCase().includes(q) ||
        (o.registrationNumber || '').toLowerCase().includes(q) ||
        (o.vin || '').toLowerCase().includes(q) ||
        (o.sinitreNumber || '').toLowerCase().includes(q)
    );
  }, [scoped, search]);

  // Reset to first page whenever the filtered set changes.
  useEffect(() => {
    setPage(0);
  }, [search, scope, clientScope, startDate, endDate]);

  if (!user || user.customerNo !== 'C0082') return null;

  const anyReady = !!aggData || !!data;

  if (!anyReady && (loadingAgg || loadingOrders)) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '600px' }}>
        <Stack spacing={2} alignItems="center">
          <CircularProgress size={45} thickness={4.5} sx={{ color: 'primary.main' }} />
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
            Chargement des données d&apos;assurance...
          </Typography>
        </Stack>
      </Box>
    );
  }

  if (!anyReady) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="error" variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
          Erreur de chargement
        </Typography>
        <Typography color="text.secondary">Impossible de récupérer les données d&apos;assurance.</Typography>
      </Box>
    );
  }

  const scopeColor = scoped.isAllCompany ? '#6366f1' : companyColor[scope] || '#6366f1';

  // --- KPI cards ---
  const kpis = [
    {
      label: 'Total Dossiers',
      value: formatInt(scoped.totals.count),
      caption: `${scoped.confirmedCount} confirmé(s)`,
      accent: 'linear-gradient(180deg, #8b5cf6, #6366f1)',
      icon: <DocumentText size="22" color="#6366f1" variant="Bulk" />
    },
    {
      label: 'Commandes Confirmées HT',
      value: formatDT(scoped.totals.confirmeHT),
      caption: 'CA HT des commandes confirmées',
      accent: 'linear-gradient(180deg, #10b981, #059669)',
      icon: <Money4 size="22" color="#10b981" variant="Bulk" />
    },
    {
      label: 'Commandes Annulées HT',
      value: formatDT(scoped.totals.annulationHT),
      caption: 'CA HT des commandes annulées',
      accent: 'linear-gradient(180deg, #f43f5e, #ec4899)',
      icon: <Money4 size="22" color="#f43f5e" variant="Bulk" />
    },
    {
      label: scoped.isAllCompany ? 'Compagnies' : 'Statuts',
      value: scoped.isAllCompany ? formatInt(scoped.companyCount) : formatInt(scoped.statusList.length),
      caption: scoped.isAllCompany ? "Compagnies d'assurance suivies" : `Répartition des statuts — ${scope}`,
      accent: 'linear-gradient(180deg, #f59e0b, #d97706)',
      icon: <ShieldTick size="22" color="#f59e0b" variant="Bulk" />
    }
  ];

  // --- Companies comparison bar (HT) — shown when no specific company is selected ---
  const companiesSorted = [...companiesList].sort((a, b) => b.totalHT - a.totalHT);
  const comparisonOption = {
    animation: true,
    animationDuration: 1000,
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, valueFormatter: (v: number) => formatDT(v) },
    grid: { left: '2%', right: '4%', bottom: '3%', top: '6%', containLabel: true },
    xAxis: {
      type: 'value',
      axisLabel: { color: theme.palette.text.secondary, formatter: (v: number) => (v >= 1000 ? v / 1000 + 'k' : v) },
      splitLine: { lineStyle: { color: theme.palette.divider, type: 'dashed' } }
    },
    yAxis: {
      type: 'category',
      data: scoped.companyComparison.map(([name]) => name).reverse(),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: theme.palette.text.primary, fontWeight: 700 }
    },
    series: [
      {
        type: 'bar',
        barWidth: '52%',
        data: scoped.companyComparison
          .map(([name, ht]) => ({
            value: ht,
            itemStyle: { borderRadius: [0, 8, 8, 0], color: companyColor[name] || '#6366f1' }
          }))
          .reverse()
      }
    ]
  };

  // --- Top clients bar (HT) — shown when a specific company is selected ---
  const topClientsOption = {
    animation: true,
    animationDuration: 1000,
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, valueFormatter: (v: number) => formatDT(v) },
    grid: { left: '3%', right: '6%', bottom: '3%', top: '4%', containLabel: true },
    xAxis: {
      type: 'value',
      axisLabel: { color: theme.palette.text.secondary, formatter: (v: number) => (v >= 1000 ? v / 1000 + 'k' : v) },
      splitLine: { lineStyle: { color: theme.palette.divider, type: 'dashed' } }
    },
    yAxis: {
      type: 'category',
      data: scoped.topClients.map(([n]) => (n.length > 22 ? n.substring(0, 22) + '…' : n)),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: theme.palette.text.primary, fontWeight: 700 }
    },
    series: [
      {
        type: 'bar',
        barWidth: '55%',
        itemStyle: {
          borderRadius: [0, 8, 8, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#8b5cf6' },
            { offset: 1, color: '#6366f1' }
          ])
        },
        data: scoped.topClients.map(([, v]) => Math.abs(v))
      }
    ]
  };

  // --- Commandes par statut (multi-line, monthly count per status) ---
  const commandesStatutOption = {
    animation: true,
    animationDuration: 1000,
    tooltip: { trigger: 'axis' },
    legend: {
      bottom: 0,
      icon: 'circle',
      textStyle: { color: theme.palette.text.secondary, fontWeight: 600, fontFamily: 'Inter' }
    },
    grid: { left: '2%', right: '3%', bottom: '14%', top: '6%', containLabel: true },
    xAxis: {
      type: 'category',
      data: scoped.periodKeys.map(scoped.periodLabel),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: theme.palette.text.secondary, fontWeight: 500, fontSize: 11 }
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: theme.palette.divider, type: 'dashed' } },
      axisLabel: { color: theme.palette.text.secondary }
    },
    series: scoped.statusesPresent.map((s) => ({
      name: s,
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      data: scoped.periodKeys.map((k) => scoped.periodStatus[k]?.[s] || 0),
      lineStyle: { color: statusColor(s), width: 3 },
      itemStyle: { color: statusColor(s) }
    }))
  };

  // --- Status distribution donut (HT) ---
  const statusDonutOption = {
    animation: true,
    animationDuration: 1000,
    tooltip: {
      trigger: 'item',
      formatter: (p: any) => `${p.name}<br/><b>${formatDT(p.value)}</b> (${p.percent}%)`
    },
    legend: {
      bottom: 0,
      icon: 'circle',
      textStyle: { color: theme.palette.text.primary, fontWeight: 600, fontFamily: 'Inter' }
    },
    series: [
      {
        name: 'Statut',
        type: 'pie',
        radius: ['55%', '80%'],
        center: ['50%', '44%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 8, borderColor: theme.palette.background.paper, borderWidth: 3 },
        label: { show: true, position: 'inside', formatter: '{d}%', color: '#fff', fontWeight: 700, fontSize: 11 },
        data: scoped.statusList
          .filter((s) => s.ht > 0)
          .map((s) => ({ value: s.ht, name: s.status, itemStyle: { color: statusColor(s.status) } }))
      }
    ]
  };

  // --- Monthly trend (area) ---
  const monthlyOption = {
    animation: true,
    animationDuration: 1000,
    tooltip: { trigger: 'axis', valueFormatter: (v: number) => formatDT(v) },
    grid: { left: '2%', right: '3%', bottom: '8%', top: '8%', containLabel: true },
    xAxis: {
      type: 'category',
      data: scoped.periodKeys.map(scoped.periodLabel),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: theme.palette.text.secondary, fontWeight: 500, fontSize: 11 }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: theme.palette.divider, type: 'dashed' } },
      axisLabel: { color: theme.palette.text.secondary, formatter: (v: number) => (v >= 1000 ? v / 1000 + 'k' : v) }
    },
    series: [
      {
        name: 'CA HT',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        data: scoped.periodKeys.map((k) => scoped.periodHT[k]),
        lineStyle: { color: scopeColor, width: 4 },
        itemStyle: { color: scopeColor },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: scopeColor + '40' },
            { offset: 1, color: scopeColor + '00' }
          ])
        }
      }
    ]
  };

  // --- Top repairers ---
  const repairersOption = {
    animation: true,
    animationDuration: 1000,
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, valueFormatter: (v: number) => formatDT(v) },
    grid: { left: '3%', right: '6%', bottom: '3%', top: '4%', containLabel: true },
    xAxis: {
      type: 'value',
      axisLabel: { color: theme.palette.text.secondary, formatter: (v: number) => (v >= 1000 ? v / 1000 + 'k' : v) },
      splitLine: { lineStyle: { color: theme.palette.divider, type: 'dashed' } }
    },
    yAxis: {
      type: 'category',
      data: scoped.topRepairers.map(([name]) => (name.length > 18 ? name.substring(0, 18) + '…' : name)),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: theme.palette.text.primary, fontWeight: 600 }
    },
    series: [
      {
        type: 'bar',
        barWidth: '55%',
        itemStyle: {
          borderRadius: [0, 8, 8, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: scopeColor },
            { offset: 1, color: scopeColor + 'aa' }
          ])
        },
        data: scoped.topRepairers.map(([, v]) => Math.abs(v))
      }
    ]
  };

  const displayOrders = filteredOrders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const openOrderModal = async (order: InsuranceOrderRow) => {
    setModalOrder(order);
    setModalLines(null);
    const res = await fetchInsuranceOrderLines(order.number);
    setModalLines(res?.lines || []);
  };

  const handleExport = async () => {
    setExportLoading(true);
    try {
      const orders = await fetchInsuranceExport(startDate, endDate);
      if (!orders) return;
      // Respect the current view: only export the dossiers currently listed.
      const visible = new Set(filteredOrders.map((o) => o.number));
      const rows: any[][] = [];
      rows.push([
        'N° Commande', 'Date', 'Assurance', 'Client', 'Réparateur', 'Statut', 'Matricule', 'N° Sinistre',
        'Article', 'Désignation', 'Quantité', 'PU HT', 'Montant HT (sans remise)', 'Remise', 'Remise %', 'Montant Net HT (avec remise)', 'Montant Net TTC'
      ]);
      orders
        .filter((o) => visible.has(o.number))
        .forEach((o) => {
          const lines = o.lines && o.lines.length > 0 ? o.lines : [null];
          lines.forEach((l, i) => {
            rows.push([
              i === 0 ? o.number : '',
              i === 0 ? formatDisplayDate(o.orderDate) : '',
              i === 0 ? o.insuranceName : '',
              i === 0 ? o.customerName : '',
              i === 0 ? o.vendorName : '',
              i === 0 ? o.shippingAdvice : '',
              i === 0 ? o.registrationNumber : '',
              i === 0 ? o.sinitreNumber : '',
              l ? l.article : '',
              l ? l.description : '',
              l ? l.quantity : '',
              l ? l.unitPrice : '',
              l ? l.grossHT : '',
              l ? l.remise : '',
              l ? Number(l.remisePct.toFixed(2)) : '',
              l ? l.netHT : '',
              l ? l.netTTC : ''
            ]);
          });
        });
      const ws = XLSX.utils.aoa_to_sheet(rows);
      ws['!cols'] = [16, 12, 16, 26, 22, 18, 14, 18, 14, 34, 10, 12, 20, 12, 10, 22, 20].map((w) => ({ wch: w }));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Dossiers Assurance');
      XLSX.writeFile(wb, `Dossiers_Assurance_${startDate}_${endDate}.xlsx`);
    } finally {
      setExportLoading(false);
    }
  };

  const modalGross = (modalLines || []).reduce((s, l) => s + (l.grossHT || 0), 0);
  const modalRemise = (modalLines || []).reduce((s, l) => s + (l.remise || 0), 0);
  const modalNet = (modalLines || []).reduce((s, l) => s + (l.netHT || 0), 0);
  const modalNetTTC = (modalLines || []).reduce((s, l) => s + (l.netTTC || 0), 0);

  return (
    <PageContainer>
      {/* Header */}
      <HeaderRow>
        <Stack direction="row" spacing={2} alignItems="center">
          <IconButton
            onClick={() => router.push('/dashboard/default')}
            sx={{
              bgcolor: theme.palette.mode === 'dark' ? '#1e293b' : '#ffffff',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              '&:hover': { bgcolor: theme.palette.mode === 'dark' ? '#243449' : '#f1f5f9' }
            }}
          >
            <ArrowLeft2 size="20" />
          </IconButton>
          <Stack spacing={0.5}>
            <Typography variant="h2" sx={{ fontWeight: 800, letterSpacing: '-1.5px', color: 'text.primary' }}>
              Tableau de Bord Assurances
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
              Suivi des commandes par compagnie d&apos;assurance (données Business Central)
            </Typography>
          </Stack>
        </Stack>

        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <DatePicker
              label="Du"
              value={parseLocalDate(tempStartDate)}
              maxDate={new Date()}
              onChange={(v) => v && setTempStartDate(formatLocalDate(v))}
              slotProps={{
                textField: {
                  size: 'small',
                  sx: {
                    width: 150,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '50px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      backgroundColor: theme.palette.mode === 'dark' ? '#1e293b' : '#ffffff'
                    }
                  }
                }
              }}
            />
            <DatePicker
              label="Au"
              value={parseLocalDate(tempEndDate)}
              maxDate={new Date()}
              onChange={(v) => v && setTempEndDate(formatLocalDate(v))}
              slotProps={{
                textField: {
                  size: 'small',
                  sx: {
                    width: 150,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '50px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      backgroundColor: theme.palette.mode === 'dark' ? '#1e293b' : '#ffffff'
                    }
                  }
                }
              }}
            />
            <Button
              variant="contained"
              onClick={() => {
                setStartDate(tempStartDate);
                setEndDate(tempEndDate);
              }}
              sx={{
                borderRadius: '50px',
                textTransform: 'none',
                fontWeight: 700,
                px: 3,
                py: 1,
                background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                boxShadow: '0 2px 6px rgba(139, 92, 246, 0.25)',
                '&:hover': { background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)' }
              }}
            >
              Filtrer
            </Button>
          </Box>
        </LocalizationProvider>
      </HeaderRow>

      {/* Company + client selectors */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }} justifyContent="space-between" sx={{ mb: 4 }}>
        <Box sx={{ overflowX: 'auto' }}>
          <ToggleButtonGroup
            exclusive
            value={scope}
            onChange={(_, v) => v && setScope(v)}
            sx={{
              bgcolor: theme.palette.mode === 'dark' ? '#111827' : '#ffffff',
              borderRadius: '50px',
              p: 0.6,
              boxShadow: '0 8px 30px -12px rgba(0,0,0,0.1)',
              flexWrap: 'nowrap',
              '& .MuiToggleButton-root': {
                border: 'none',
                borderRadius: '50px !important',
                textTransform: 'none',
                fontWeight: 700,
                px: 3,
                py: 1,
                whiteSpace: 'nowrap',
                color: 'text.secondary',
                display: 'flex',
                gap: 1
              }
            }}
          >
            <ToggleButton
              value={ALL}
              sx={{ '&.Mui-selected, &.Mui-selected:hover': { color: '#fff', background: 'linear-gradient(135deg, #8b5cf6, #6366f1)' } }}
            >
              Toutes
            </ToggleButton>
            {companiesSorted.map((c) => (
              <ToggleButton
                key={c.name}
                value={c.name}
                sx={{
                  '&.Mui-selected, &.Mui-selected:hover': {
                    color: '#fff',
                    background: `linear-gradient(135deg, ${companyColor[c.name]}, ${companyColor[c.name]}cc)`
                  }
                }}
              >
                <ShieldTick size="18" variant="Bold" />
                {c.name}
                <Box component="span" sx={{ opacity: 0.7, fontWeight: 600, fontSize: '0.78rem' }}>
                  ({c.count})
                </Box>
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>
        <FormControl size="small" sx={{ minWidth: 240 }}>
          <InputLabel id="client-select-label">Client</InputLabel>
          <Select
            labelId="client-select-label"
            label="Client"
            value={clientScope}
            disabled={!scoped.ordersReady}
            onChange={(e) => setClientScope(String(e.target.value))}
            sx={{
              borderRadius: '50px',
              fontWeight: 600,
              backgroundColor: theme.palette.mode === 'dark' ? '#111827' : '#ffffff'
            }}
          >
            <MenuItem value={ALL}>{scoped.ordersReady ? `Tous les clients (${clientOptions.length})` : 'Tous les clients…'}</MenuItem>
            {clientOptions.map((c) => (
              <MenuItem key={c.no} value={c.no}>
                {c.no} — {formatDT(c.ht)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {/* KPI cards */}
      <Grid container spacing={GRID_COMMON_SPACING} sx={{ mb: 1 }}>
        {kpis.map((kpi, i) => (
          <Grid key={kpi.label} size={{ xs: 12, sm: 6, lg: 3 }}>
            <KpiCard accent={kpi.accent} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.08 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'text.secondary' }}>
                  {kpi.label}
                </Typography>
                <Box sx={{ p: 1, borderRadius: '12px', bgcolor: 'action.hover', display: 'flex' }}>{kpi.icon}</Box>
              </Stack>
              <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-1px', color: 'text.primary' }}>
                {kpi.value}
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 500, color: 'text.secondary' }}>
                {kpi.caption}
              </Typography>
            </KpiCard>
          </Grid>
        ))}
      </Grid>

      {/* Charts */}
      <Grid container spacing={GRID_COMMON_SPACING} sx={{ mt: 0 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <PremiumCard title={`Évolution ${scoped.periodNoun} du CA HT`} subheader={scoped.isAllCompany ? 'Toutes compagnies' : scope}>
            {scoped.periodKeys.length > 0 ? (
              <ReactECharts option={monthlyOption} style={{ height: '320px', width: '100%' }} notMerge />
            ) : (
              <Box sx={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="text.secondary">Aucune donnée sur la période</Typography>
              </Box>
            )}
          </PremiumCard>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <PremiumCard title="Commandes par statut" subheader="Montant HT par ShippingAdvice">
            <ReactECharts option={statusDonutOption} style={{ height: '320px', width: '100%' }} notMerge />
          </PremiumCard>
        </Grid>

        {/* Commandes par statut — monthly count per status */}
        <Grid size={12}>
          <PremiumCard
            title="Commandes par statut"
            subheader={`Nombre de commandes par ${scoped.periodMode === 'year' ? 'an' : scoped.periodMode === 'day' ? 'jour' : 'mois'} et par statut`}
          >
            {scoped.periodKeys.length > 0 ? (
              <ReactECharts option={commandesStatutOption} style={{ height: '320px', width: '100%' }} notMerge />
            ) : (
              <Box sx={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="text.secondary">Aucune donnée sur la période</Typography>
              </Box>
            )}
          </PremiumCard>
        </Grid>

        {/* Left chart swaps: all companies -> comparison; specific company -> top clients */}
        <Grid size={{ xs: 12, lg: 6 }}>
          {scoped.isAllCompany ? (
            <PremiumCard title="Comparaison des compagnies" subheader="CA HT par compagnie d'assurance">
              <ReactECharts option={comparisonOption} style={{ height: '320px', width: '100%' }} notMerge />
            </PremiumCard>
          ) : (
            <PremiumCard title="Top clients" subheader={`Par CA HT — ${scope}`}>
              {!scoped.ordersReady ? (
                <Box sx={{ height: 320, display: 'flex', flexDirection: 'column', gap: 1.5, alignItems: 'center', justifyContent: 'center' }}>
                  <CircularProgress size={28} thickness={4.5} />
                  <Typography color="text.secondary" variant="body2">Chargement des données détaillées…</Typography>
                </Box>
              ) : scoped.topClients.length > 0 ? (
                <ReactECharts option={topClientsOption} style={{ height: '320px', width: '100%' }} notMerge />
              ) : (
                <Box sx={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">Aucune donnée sur la période</Typography>
                </Box>
              )}
            </PremiumCard>
          )}
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <PremiumCard title="Top réparateurs / fournisseurs" subheader={`Par CA HT — ${scoped.isAllCompany ? 'toutes' : scope}`}>
            {!scoped.ordersReady ? (
              <Box sx={{ height: 320, display: 'flex', flexDirection: 'column', gap: 1.5, alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress size={28} thickness={4.5} />
                <Typography color="text.secondary" variant="body2">Chargement des données détaillées…</Typography>
              </Box>
            ) : scoped.topRepairers.length > 0 ? (
              <ReactECharts option={repairersOption} style={{ height: '320px', width: '100%' }} notMerge />
            ) : (
              <Box sx={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="text.secondary">Aucune donnée sur la période</Typography>
              </Box>
            )}
          </PremiumCard>
        </Grid>

        {/* Dossiers table */}
        <Grid size={12}>
          <PremiumCard
            title="Dossiers d'assurance"
            subheader={`${formatInt(filteredOrders.length)} dossier(s)`}
            secondary={
              <Stack direction="row" spacing={1.5} alignItems="center">
                <TextField
                  size="small"
                  placeholder="N°, matricule, VIN, sinistre..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  sx={{ width: 260, '& .MuiOutlinedInput-root': { borderRadius: '50px' } }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchNormal1 size="16" color={theme.palette.text.secondary} />
                      </InputAdornment>
                    )
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleExport}
                  disabled={exportLoading || !scoped.ordersReady}
                  startIcon={exportLoading ? <CircularProgress size={16} color="inherit" /> : <DocumentDownload size="18" />}
                  sx={{
                    borderRadius: '50px',
                    textTransform: 'none',
                    fontWeight: 700,
                    px: 2.5,
                    whiteSpace: 'nowrap',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    '&:hover': { background: 'linear-gradient(135deg, #059669 0%, #047857 100%)' }
                  }}
                >
                  {exportLoading ? 'Export…' : 'Exporter Excel'}
                </Button>
              </Stack>
            }
          >
            <TableContainer sx={{ mt: 1 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>N° Commande</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Assurance</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Client</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Statut</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Matricule</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>N° Sinistre</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">Total HT</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {!scoped.ordersReady ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                        <Stack spacing={1.5} alignItems="center">
                          <CircularProgress size={28} thickness={4.5} />
                          <Typography color="text.secondary">Chargement des dossiers…</Typography>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ) : displayOrders.length > 0 ? (
                    displayOrders.map((o) => (
                      <TableRow key={o.number} hover sx={{ cursor: 'pointer' }} onClick={() => openOrderModal(o)}>
                        <TableCell sx={{ fontWeight: 700, py: 1 }}>{o.number}</TableCell>
                        <TableCell sx={{ py: 1 }}>{formatDisplayDate(o.orderDate)}</TableCell>
                        <TableCell sx={{ py: 1 }}>
                          <Box component="span" sx={{ fontWeight: 700, color: companyColor[o.insuranceName] || 'text.primary' }}>
                            {o.insuranceName}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ py: 1 }}>{o.customerName || '-'}</TableCell>
                        <TableCell sx={{ py: 1 }}>
                          <Box
                            component="span"
                            sx={{
                              px: 1.25,
                              py: 0.4,
                              borderRadius: '20px',
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              bgcolor: statusColor(o.shippingAdvice) + '22',
                              color: statusColor(o.shippingAdvice)
                            }}
                          >
                            {o.shippingAdvice}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ py: 1 }}>{o.registrationNumber || '-'}</TableCell>
                        <TableCell sx={{ py: 1, fontFamily: 'monospace', fontSize: '0.8rem' }}>{o.sinitreNumber || '-'}</TableCell>
                        <TableCell sx={{ py: 1, fontWeight: 700 }} align="right">{formatDT(o.totalHT)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                        <Typography color="text.secondary">Aucun dossier trouvé pour ces critères.</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            {scoped.ordersReady && filteredOrders.length > 0 && (
              <TablePagination
                component="div"
                count={filteredOrders.length}
                page={page}
                onPageChange={(_, p) => setPage(p)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                rowsPerPageOptions={[10, 25, 50, 100]}
                labelRowsPerPage="Lignes par page"
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
              />
            )}
          </PremiumCard>
        </Grid>
      </Grid>

      {/* Order-detail modal: lines with & without remise */}
      <Dialog open={!!modalOrder} onClose={() => setModalOrder(null)} maxWidth="lg" fullWidth PaperProps={{ sx: { borderRadius: '20px' } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>
          Détail commande {modalOrder?.number}
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
            {modalOrder?.insuranceName} · {modalOrder?.customerName} · {formatDisplayDate(modalOrder?.orderDate || '')}
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          {modalLines === null ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress size={32} thickness={4.5} />
            </Box>
          ) : modalLines.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
              Aucune ligne pour cette commande.
            </Typography>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Article</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Désignation</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">Qté</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">PU HT</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">Montant HT (sans remise)</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">Remise</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">Montant Net HT (avec remise)</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">Montant Net TTC</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {modalLines.map((l, i) => (
                    <TableRow key={i} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{l.article}</TableCell>
                      <TableCell>{l.description}</TableCell>
                      <TableCell align="right">{l.quantity}</TableCell>
                      <TableCell align="right">{formatDT(l.unitPrice)}</TableCell>
                      <TableCell align="right">{formatDT(l.grossHT)}</TableCell>
                      <TableCell align="right" sx={{ color: l.remise > 0 ? 'error.main' : 'text.secondary' }}>
                        {l.remise > 0 ? `- ${formatDT(l.remise)} (${l.remisePct.toFixed(1)}%)` : formatDT(0)}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: 'success.main' }}>{formatDT(l.netHT)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>{formatDT(l.netTTC)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow sx={{ '& td': { borderTop: `2px solid ${theme.palette.divider}` } }}>
                    <TableCell colSpan={4} sx={{ fontWeight: 800 }}>Total</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800 }}>{formatDT(modalGross)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800, color: 'error.main' }}>
                      {modalRemise > 0 ? `- ${formatDT(modalRemise)} (${((modalRemise / modalGross) * 100).toFixed(1)}%)` : formatDT(0)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800, color: 'success.main' }}>{formatDT(modalNet)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800 }}>{formatDT(modalNetTTC)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOrder(null)} sx={{ textTransform: 'none', fontWeight: 700 }}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}
