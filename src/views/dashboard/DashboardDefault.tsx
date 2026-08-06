'use client';

import { useEffect, useState } from 'react';

// material-ui
import { useTheme, styled, alpha } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Backdrop from '@mui/material/Backdrop';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Collapse from '@mui/material/Collapse';
import axiosServices from 'utils/axios';
import { openSnackbar } from 'api/snackbar';

// project-imports
import { GRID_COMMON_SPACING } from 'config';
import useUser from 'hooks/useUser';
import { fetchDashboardStats, DashboardStats, fetchTopCustomers, fetchTopVendors, TopCustomer, TopVendor, fetchTopArticles, fetchTopBrands, TopArticle, TopBrand, fetchCommandeVsFacture, CommandeVsFacture, DailyPoint, fetchMargin, MarginStats, fetchMarginLines, fetchMarginSeries } from 'app/api/services/DashboardService';
import MainCard from 'components/MainCard';

// next
import { useRouter } from 'next/navigation';

// third-party
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import { motion } from 'framer-motion';
import * as XLSX from 'xlsx';
import { signOut } from 'next-auth/react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

// assets
import {
  ArrowDown2,
  ArrowRight2,
  DocumentDownload,
  ShieldTick,
  Activity
} from '@wandersonalwes/iconsax-react';

// --- Styled Components ---

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

const OverlapContainer = styled(Stack)(() => ({
  flexDirection: 'row',
  alignItems: 'stretch',
  overflow: 'visible',
  position: 'relative',
  // 4 cartes tiennent sur un écran large ; en dessous elles passent à la ligne plutôt que de
  // déborder horizontalement de la colonne.
  flexWrap: 'wrap'
}));

const OverlapCard = styled(motion.div)<{ bg: string; textcolor: string }>(({ bg, textcolor }) => ({
  background: bg,
  color: textcolor,
  borderRadius: '28px',
  padding: '32px',
  flex: 1,
  // 190 et non 220 : la ligne porte 4 cartes depuis l'ajout de la marge. Les cartes du bandeau
  // de droite écrasent cette valeur via style={{ minWidth: 0 }}.
  minWidth: '190px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  position: 'relative',
  zIndex: 2,
  boxShadow: '0 20px 40px -15px rgba(0,0,0,0.04)',
  border: '1px solid rgba(255, 255, 255, 0.4)',
  transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease',
  '&:hover': {
    transform: 'translateY(-12px) scale(1.02)',
    zIndex: 10,
    boxShadow: '0 30px 60px -20px rgba(0,0,0,0.1)'
  }
}));

const PremiumCard = styled(MainCard)(({ theme }) => ({
  borderRadius: '28px',
  border: 'none',
  background: theme.palette.mode === 'dark' ? '#111827' : '#ffffff',
  boxShadow: theme.palette.mode === 'dark'
    ? '0 12px 48px -8px rgba(0, 0, 0, 0.3)'
    : '0 12px 48px -8px rgba(17, 24, 39, 0.02)',
  overflow: 'hidden',
  '& .MuiCardHeader-root': {
    padding: '28px 32px 8px 32px'
  },
  '& .MuiCardContent-root': {
    padding: '8px 32px 32px 32px'
  }
}));









// ==============================|| DASHBOARD - DEFAULT ||============================== //

const parseLocalDate = (dateStr: string) => {
  const parts = dateStr.split('-');
  return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
};

const formatLocalDate = (date: Date | null) => {
  if (!date) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const formatDate = (dateStr: string | null) => {
  if (!dateStr || dateStr === 'null') return '-';
  try {
    const clean = dateStr.trim();
    if (clean.length >= 10) {
      const yyyy = clean.substring(0, 4);
      const mm = clean.substring(5, 7);
      const dd = clean.substring(8, 10);
      return `${dd}-${mm}-${yyyy}`;
    }
  } catch (e) {
    // ignore
  }
  return dateStr;
};

// Affiché à la place d'une courbe quand /dashboard/daily-series ne renvoie rien : mieux vaut
// dire que la série manque que dessiner une courbe à zéro, qu'on lirait comme une activité nulle.
const SeriesUnavailable = ({ height }: { height: number }) => (
  <Box
    sx={{
      height,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      px: 3,
      gap: 0.75
    }}
  >
    <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.secondary' }}>
      Série indisponible
    </Typography>
    <Typography variant="caption" color="text.secondary">
      Les totaux de la période restent exacts. Le détail par période nécessite l&apos;extension
      Business Central 1.1.1.471 ou supérieure.
    </Typography>
  </Box>
);

const CollapsibleRow = ({ row, type }: { row: any; type: string }) => {
  const [open, setOpen] = useState<boolean>(false);
  const theme = useTheme();

  const lines = (row.salesInvoiceLines || row.purchaseInvoiceLines || row.PlexuspurchaseOrderLines || row.plexuspurchaseOrderLines || [])
    .filter((line: any) => {
      const desc = (line.description || '').toLowerCase();
      return !desc.includes('expédition') && !desc.includes('expedition');
    });

  return (
    <>
      <TableRow hover sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell width="40px" sx={{ py: 1 }}>
          {lines.length > 0 && (
            <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
              {open ? <ArrowDown2 size="16" /> : <ArrowRight2 size="16" />}
            </IconButton>
          )}
        </TableCell>
        {type === 'ca' && (
          <>
            <TableCell sx={{ fontWeight: 600, py: 1 }}>{row.number}</TableCell>
            <TableCell sx={{ py: 1 }}>{row.customerName}</TableCell>
            <TableCell sx={{ py: 1 }}>{formatDate(row.postingDate || row.invoiceDate)}</TableCell>
            <TableCell sx={{ fontWeight: 700, py: 1 }} align="right">{(row.totalAmountExcludingTax || 0).toLocaleString()} DT</TableCell>
            <TableCell sx={{ py: 1 }}>{row.status}</TableCell>
          </>
        )}
        {type === 'achat' && (
          <>
            <TableCell sx={{ fontWeight: 600, py: 1 }}>{row.number}</TableCell>
            <TableCell sx={{ py: 1 }}>{row.vendorName}</TableCell>
            <TableCell sx={{ py: 1 }}>{formatDate(row.postingDate || row.invoiceDate)}</TableCell>
            <TableCell sx={{ fontWeight: 700, py: 1 }} align="right">{(row.totalAmountExcludingTax || 0).toLocaleString()} DT</TableCell>
            <TableCell sx={{ py: 1 }}>{row.status}</TableCell>
          </>
        )}
        {type === 'commandes' && (
          <>
            <TableCell sx={{ fontWeight: 600, py: 1 }}>{row.number}</TableCell>
            <TableCell sx={{ py: 1 }}>{row.vendorName}</TableCell>
            <TableCell sx={{ py: 1 }}>{formatDate(row.orderDate)}</TableCell>
            <TableCell sx={{ fontWeight: 700, py: 1 }} align="right">{(row.totalAmountExcludingTax || 0).toLocaleString()} DT</TableCell>
            <TableCell sx={{ py: 1 }}>{row.InsuranceName || '-'}</TableCell>
          </>
        )}
        {type === 'non-payees' && (
          <>
            <TableCell sx={{ fontWeight: 600, py: 1 }}>{row.number}</TableCell>
            <TableCell sx={{ py: 1 }}>{row.customerName}</TableCell>
            <TableCell sx={{ py: 1 }}>{formatDate(row.dueDate)}</TableCell>
            <TableCell sx={{ fontWeight: 700, py: 1 }} align="right">{(row.totalAmountExcludingTax || 0).toLocaleString()} DT</TableCell>
            <TableCell sx={{ fontWeight: 700, color: 'error.main', py: 1 }} align="right">{(row.remainingAmount || 0).toLocaleString()} DT</TableCell>
          </>
        )}
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2, bgcolor: theme.palette.mode === 'dark' ? '#182235' : '#f1f5f9', p: 2, borderRadius: '12px' }}>
              <Typography variant="subtitle2" gutterBottom component="div" sx={{ fontWeight: 800 }}>
                Articles / Lignes ({lines.length})
              </Typography>
              <Table size="small" aria-label="lines">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">Quantité</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">Montant HT</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {lines.map((lineRow: any, lIdx: number) => {
                    const amt = lineRow.lineAmountExcludingTax || lineRow.amountExcludingTax || 0;
                    return (
                      <TableRow key={lIdx} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell sx={{ py: 0.75 }}>{lineRow.description || 'Sans description'}</TableCell>
                        <TableCell sx={{ py: 0.75 }} align="right">{lineRow.quantity}</TableCell>
                        <TableCell sx={{ py: 0.75 }} align="right">{amt.toLocaleString()} DT</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

export default function DashboardDefault() {
  const theme = useTheme();
  const router = useRouter();
  const user = useUser();

  // Dashboard is visible only to client C0082. IMPORTANT: every hook below must run on
  // every render — the access guard (return null) is placed AFTER all hooks, further down,
  // so React always sees the same hook order. This fixes the "rendered more hooks than
  // during the previous render" crash (useUser returns false then the user object).
  const isDashboardUser = !!user && user.customerNo === 'C0082';

  // Auto-redirect non-dashboard users to the articles search
  useEffect(() => {
    if (user && user.customerNo !== 'C0082') {
      router.push('/pages/articles');
    }
  }, [user, router]);

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);
  const [topVendors, setTopVendors] = useState<TopVendor[]>([]);
  const [topArticles, setTopArticles] = useState<TopArticle[]>([]);
  const [topBrands, setTopBrands] = useState<TopBrand[]>([]);
  const [commandeVsFacture, setCommandeVsFacture] = useState<CommandeVsFacture | null>(null);
  const [dailySeries, setDailySeries] = useState<DailyPoint[]>([]);
  const [margin, setMargin] = useState<MarginStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [exportLoading, setExportLoading] = useState<boolean>(false);
  const [exportStatusLabel, setExportStatusLabel] = useState<string>('');
  const [exportProgress, setExportProgress] = useState<string>('');
  const [detailsOpen, setDetailsOpen] = useState<boolean>(false);
  const [detailsTitle, setDetailsTitle] = useState<string>('');
  const [detailsType, setDetailsType] = useState<string>('');
  const [detailsLoading, setDetailsLoading] = useState<boolean>(false);
  const [detailsData, setDetailsData] = useState<any[]>([]);
  const [articlesTab, setArticlesTab] = useState<'revenue' | 'quantity'>('quantity');
  const [brandsTab, setBrandsTab] = useState<'revenue' | 'quantity'>('revenue');
  // Modale "Voir plus" du top articles (top 100 sur commandes validées)
  const [articlesModalOpen, setArticlesModalOpen] = useState<boolean>(false);

  // Default date filter: start of current year to today's date
  const currentYear = new Date().getFullYear();
  const todayStr = formatLocalDate(new Date());
  const [startDate, setStartDate] = useState<string>(`${currentYear}-01-01`);
  const [endDate, setEndDate] = useState<string>(todayStr);

  // Temp date filter bounds to inputs (not auto-triggering fetch)
  const [tempStartDate, setTempStartDate] = useState<string>(`${currentYear}-01-01`);
  const [tempEndDate, setTempEndDate] = useState<string>(todayStr);

  useEffect(() => {
    // Only the dashboard user (C0082) should fetch — others are being redirected away.
    if (!isDashboardUser) return;
    async function loadStats() {
      setLoading(true);
      const data = await fetchDashboardStats(startDate, endDate);
      setStats(data);
      const customers = await fetchTopCustomers(startDate, endDate);
      const sortedCustomers = [...customers].sort((c1, c2) => {
        const val1 = Math.abs(c1.paymentsLCY || c1.salesLCY || 0);
        const val2 = Math.abs(c2.paymentsLCY || c2.salesLCY || 0);
        return val2 - val1;
      });
      setTopCustomers(sortedCustomers);

      const vendors = await fetchTopVendors(startDate, endDate);
      const sortedVendors = [...vendors].sort((v1, v2) => {
        const val1 = Math.abs(v1.paymentsLCY || v1.purchaseLCY || 0);
        const val2 = Math.abs(v2.paymentsLCY || v2.purchaseLCY || 0);
        return val2 - val1;
      });
      setTopVendors(sortedVendors);

      // Top articles restreint aux commandes validées ('Validees' = Confirmé + Totalité +
      // LivraisonDispo, hors Attente et Annulation) ; top 100 pour la modale, 5 pour le graphe.
      const articles = await fetchTopArticles(startDate, endDate, 'Validees', 100);
      setTopArticles(articles);

      const brands = await fetchTopBrands(startDate, endDate);
      setTopBrands(brands);

      // Série appariée des courbes Cash Flow / Trends : ventes et coût d'achat des MÊMES
      // dossiers, au grain jour, regroupée à l'affichage selon la plage choisie.
      setDailySeries(await fetchMarginSeries(startDate, endDate));
      setLoading(false);

      // Indicateur commandé/facturé : chargé après le rendu, il balaie toutes les lignes
      fetchCommandeVsFacture(startDate, endDate).then(setCommandeVsFacture);

      // Marge réelle : la base de coût remonte 24 mois d'achats, donc hors du chemin critique
      setMargin(null);
      fetchMargin(startDate, endDate).then(setMargin);
    }
    loadStats();
  }, [startDate, endDate, isDashboardUser]);

  // Access guard — placed AFTER all hooks so the hook order never changes between renders.
  // Renders nothing for non-C0082 users (who are redirected by the effect above).
  if (!isDashboardUser) {
    return null;
  }

  const formatExcelDate = (raw: string) => {
    if (!raw) return '';
    try {
      const d = new Date(raw);
      if (isNaN(d.getTime())) return raw;
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      return `${dd}-${mm}-${yyyy}`;
    } catch { return raw; }
  };

  // Export Excel de TOUS les articles achetés sur la période (le tableau à l'écran
  // reste limité au top 100). Le backend renvoie l'agrégat complet avec top=0.
  const handleExportArticlesExcel = async () => {
    setExportStatusLabel('Top Articles');
    setExportLoading(true);
    setExportProgress('Téléchargement des articles...');
    try {
      // 5 min de marge : sur une large plage, BC pagine des milliers de lignes
      const allArticles = await fetchTopArticles(startDate, endDate, 'Validees', 0, 300000);

      if (allArticles.length === 0) {
        openSnackbar({
          open: true,
          message: 'Aucun article à exporter sur cette période.',
          variant: 'alert',
          alert: { color: 'warning' },
          close: true
        } as any);
        return;
      }

      setExportProgress(`Génération Excel (${allArticles.length} articles)...`);

      // Même tri que l'onglet actif, pour que le fichier reflète ce qui est affiché
      const sorted = [...allArticles].sort((a1, a2) => {
        if (articlesTab === 'quantity') {
          return Math.abs(a2.purchasesQty || 0) - Math.abs(a1.purchasesQty || 0);
        }
        return Math.abs(a2.purchasesLCY || 0) - Math.abs(a1.purchasesLCY || 0);
      });

      const rows: any[][] = [
        ['Rang', 'Référence', 'Désignation', 'Groupe remise', 'Marque', 'Quantité', 'PU moyen (DT)', 'Total HT (DT)']
      ];
      sorted.forEach((article, idx) => {
        const qty = Math.abs(article.purchasesQty || 0);
        const amount = Math.abs(article.purchasesLCY || 0);
        rows.push([
          idx + 1,
          article.number || '',
          article.description || '',
          article.discountGroup || '',
          article.discountGroupName || '',
          qty,
          article.unitPrice ?? (qty > 0 ? amount / qty : 0),
          amount
        ]);
      });

      const ws = XLSX.utils.aoa_to_sheet(rows);
      ws['!cols'] = [8, 20, 40, 16, 24, 12, 16, 18].map((w) => ({ wch: w }));
      ws['!freeze'] = { xSplit: 0, ySplit: 1 };

      for (let rowIdx = 1; rowIdx < rows.length; rowIdx++) {
        const puCell = ws[XLSX.utils.encode_col(6) + (rowIdx + 1)];
        if (puCell) puCell.z = '0.000';
        const totalCell = ws[XLSX.utils.encode_col(7) + (rowIdx + 1)];
        if (totalCell) totalCell.z = '0.000';
      }

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Articles');
      XLSX.writeFile(wb, `Articles_Commandes_Validees_${startDate}_${endDate}.xlsx`);
    } catch (error) {
      console.error('Failed to export articles excel:', error);
      openSnackbar({
        open: true,
        message: "Échec de l'export Excel des articles. Aucun fichier partiel n'a été généré — veuillez réessayer.",
        variant: 'alert',
        alert: { color: 'error' },
        close: true
      } as any);
    } finally {
      setExportLoading(false);
      setExportProgress('');
    }
  };

  // Export de contrôle de la marge : une ligne par article facturé, avec de part et d'autre le
  // tarif catalogue et les deux remises. C'est le document qui permet à la comptabilité de
  // refaire le calcul à la main et de pointer où nos chiffres divergent des siens.
  const handleExportMarge = async () => {
    setExportStatusLabel('Détail Marge');
    setExportLoading(true);
    setExportProgress('Récupération du détail ligne à ligne...');
    try {
      const lines = await fetchMarginLines(startDate, endDate);

      if (lines.length === 0) {
        openSnackbar({
          open: true,
          message: 'Aucune ligne de marge sur cette période.',
          variant: 'alert',
          alert: { color: 'warning' },
          close: true
        } as any);
        return;
      }

      // Seules les lignes réellement appariées entrent dans le calcul de la carte : les
      // exporter toutes ferait un total qui ne retombe pas dessus (du CA sans coût en face
      // gonflerait la marge). Les autres partent dans un onglet séparé — écartées du calcul,
      // jamais escamotées.
      const matched = lines.filter((l) => (l.purchaseAmount || 0) !== 0 && !!l.purchaseOrderNo);
      const unmatched = lines.filter((l) => (l.purchaseAmount || 0) === 0 || !l.purchaseOrderNo);

      setExportProgress(`Génération Excel (${matched.length} lignes appariées)...`);

      const header = [
        'N° Facture Vente', 'Date', 'Client',
        'N° Commande Achat', 'Fournisseur',
        'Référence', 'Désignation', 'Quantité',
        'PU Catalogue HT',
        '% Remise Vente', 'PU Vente HT', 'Montant Vente HT',
        '% Remise Achat', 'PU Achat HT', 'Montant Achat HT',
        'Source du coût', 'Marge DT', 'Marge %'
      ];
      const rows: any[][] = [header];

      let totalVente = 0;
      let totalAchat = 0;
      matched.forEach((l) => {
        const qty = l.quantity || 0;
        const puVente = qty !== 0 ? (l.salesAmount || 0) / qty : 0;
        totalVente += l.salesAmount || 0;
        totalAchat += l.purchaseAmount || 0;
        rows.push([
          l.documentNo || '',
          formatDate(l.postingDate),
          l.customerName || '',
          l.purchaseOrderNo || '',
          l.vendorName || '',
          l.itemNo || '',
          l.description || '',
          qty,
          l.unitPrice || 0,
          l.salesDiscountPct || 0,
          puVente,
          l.salesAmount || 0,
          l.purchaseDiscountPct || 0,
          l.purchaseUnitCost || 0,
          l.purchaseAmount || 0,
          l.costSource || '',
          l.marginAmount || 0,
          l.marginPct || 0
        ]);
      });

      rows.push([]);
      rows.push([
        'TOTAL LIGNES APPARIÉES', '', '', '', '', '', '', '', '', '', '',
        totalVente, '', '', totalAchat, '',
        totalVente - totalAchat,
        totalVente !== 0 ? ((totalVente - totalAchat) / totalVente) * 100 : 0
      ]);

      // Réconciliation avec la carte du dashboard : les avoirs ne sont pas des lignes de
      // facture, ils sont déduits après coup. Sans ce bloc l'export s'arrête à la marge avant
      // avoirs et ne retombe pas sur le taux affiché.
      if (margin) {
        // Un champ absent (backend pas encore redémarré) donnait "NaN" en cascade dans toute la
        // colonne achat. On neutralise, et surtout on le DIT : un zéro silencieux ferait croire
        // que les retours n'ont pas de coût, ce qui gonflerait la marge de l'export.
        const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
        const creditsReturned = num(margin.creditsReturned) ?? 0;
        const creditsOther = num(margin.creditsOther) ?? 0;
        const costBack = num(margin.creditsCostBack);
        const vendorRebates = num(margin.vendorRebates) ?? 0;

        const caRetenu = totalVente - (creditsReturned + creditsOther);
        const coutRetenu = totalAchat - (costBack ?? 0) - vendorRebates;

        rows.push([]);
        rows.push(['RÉCONCILIATION AVEC LA CARTE DASHBOARD']);
        rows.push(['Ventes appariées', '', '', '', '', '', '', '', '', '', '', totalVente]);
        rows.push(['− Avoirs : marchandise reprise', '', '', '', '', '', '', '', '', '', '', -creditsReturned]);
        rows.push(['− Avoirs : RRR et gestes commerciaux', '', '', '', '', '', '', '', '', '', '', -creditsOther]);
        rows.push(['= CA retenu', '', '', '', '', '', '', '', '', '', '', caRetenu]);
        rows.push([]);
        rows.push(['Achats appariés', '', '', '', '', '', '', '', '', '', '', '', '', '', totalAchat]);
        rows.push(['− Coût des retours annulé', '', '', '', '', '', '', '', '', '', '', '', '', '', -(costBack ?? 0)]);
        rows.push(['− RRR obtenus des fournisseurs', '', '', '', '', '', '', '', '', '', '', '', '', '', -vendorRebates]);
        rows.push(['= Coût retenu', '', '', '', '', '', '', '', '', '', '', '', '', '', coutRetenu]);
        rows.push([]);
        rows.push([
          'MARGE', '', '', '', '', '', '', '', '', '', '',
          caRetenu, '', '', coutRetenu, '',
          caRetenu - coutRetenu,
          caRetenu !== 0 ? ((caRetenu - coutRetenu) / caRetenu) * 100 : 0
        ]);
        if (costBack === null) {
          rows.push([]);
          rows.push([
            "ATTENTION : le coût des retours n'a pas été renvoyé par le serveur (backend à redémarrer). "
            + "Il est compté pour 0, donc la marge ci-dessus est légèrement SURESTIMÉE."
          ]);
        }
      }

      const ws = XLSX.utils.aoa_to_sheet(rows);
      ws['!cols'] = [16, 12, 26, 16, 24, 18, 34, 10, 16, 14, 14, 16, 14, 14, 16, 20, 14, 10].map((w) => ({ wch: w }));
      ws['!freeze'] = { xSplit: 0, ySplit: 1 };

      // 3 décimales sur les montants (les prix Plexus sont au millime), 2 sur les pourcentages
      const money = [8, 10, 11, 13, 14, 16];
      const pct = [9, 12, 17];
      for (let rowIdx = 1; rowIdx < rows.length; rowIdx++) {
        money.forEach((c) => {
          const cell = ws[XLSX.utils.encode_col(c) + (rowIdx + 1)];
          if (cell) cell.z = '0.000';
        });
        pct.forEach((c) => {
          const cell = ws[XLSX.utils.encode_col(c) + (rowIdx + 1)];
          if (cell) cell.z = '0.00';
        });
      }

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Détail Marge');

      // Onglet des lignes écartées : elles ne portent aucun coût, donc les compter
      // inventerait de la marge. Elles restent visibles pour qu'on sache ce qui manque.
      if (unmatched.length > 0) {
        const uRows: any[][] = [
          ['N° Facture Vente', 'Date', 'Client', 'N° Commande Achat', 'Référence', 'Désignation',
            'Quantité', 'Montant Vente HT', 'Motif']
        ];
        let uTotal = 0;
        unmatched.forEach((l) => {
          uTotal += l.salesAmount || 0;
          uRows.push([
            l.documentNo || '',
            formatDate(l.postingDate),
            l.customerName || '',
            l.purchaseOrderNo || '',
            l.itemNo || '',
            l.description || '',
            l.quantity || 0,
            l.salesAmount || 0,
            l.purchaseOrderNo ? "Article absent de la commande achat" : 'Aucune commande achat rattachée'
          ]);
        });
        uRows.push([]);
        uRows.push(['TOTAL ÉCARTÉ', '', '', '', '', '', '', uTotal]);
        const uWs = XLSX.utils.aoa_to_sheet(uRows);
        uWs['!cols'] = [16, 12, 26, 16, 18, 34, 10, 16, 34].map((w) => ({ wch: w }));
        uWs['!freeze'] = { xSplit: 0, ySplit: 1 };
        for (let rowIdx = 1; rowIdx < uRows.length; rowIdx++) {
          const cell = uWs[XLSX.utils.encode_col(7) + (rowIdx + 1)];
          if (cell) cell.z = '0.000';
        }
        XLSX.utils.book_append_sheet(wb, uWs, 'Lignes écartées');
      }

      XLSX.writeFile(wb, `Marge_Detail_${startDate}_${endDate}.xlsx`);
    } catch (error) {
      console.error('Failed to export margin detail:', error);
      openSnackbar({
        open: true,
        message: "Échec de l'export du détail de marge. Aucun fichier partiel n'a été généré — veuillez réessayer.",
        variant: 'alert',
        alert: { color: 'error' },
        close: true
      } as any);
    } finally {
      setExportLoading(false);
      setExportProgress('');
    }
  };

  const handleExportExcel = async (statusKey: string, statusLabel: string) => {
    setExportStatusLabel(statusLabel);
    setExportLoading(true);
    setExportProgress('');
    try {
      // Single call for the whole range — the backend pages through BC server-side.
      setExportProgress('Téléchargement des commandes...');
      const resp = await axiosServices.get(
        `/api/purchase-orders/export-data?status=${statusKey}&startDate=${startDate}&endDate=${endDate}`,
        { timeout: 300000 }
      );
      const allOrders: any[] = Array.isArray(resp.data) ? resp.data : [];

      setExportProgress(`Génération Excel (${allOrders.length} commandes)...`);

      // Build rows — one row per article line
      const rows: any[][] = [];
      const headers = [
        'N° Commande', 'Montant Commande', 'Article (Réf & Désignation)', 'Origine', 'Quantité', 'Prix HT',
        'Marque', 'Statut', "Cause d'annulation", 'Client',
        'Date Document', 'Assurance'
      ];
      rows.push(headers);

      for (const order of allOrders) {
        const numCmd = order.number || '';
        // Same header total the dashboard sums — SUM of this column matches the dashboard amount
        const montant = order.totalAmount || 0;
        const statut = order.ShippingAdvice || order.shippingAdvice || '';
        const causeAnnulation = order.CauseofCancellation || order.cancellationReason || '';
        const clientName = order.clientName || order.vendorName || '';
        const dateDocument = formatExcelDate(order.orderDate || '');
        const assurance = order.InsuranceName || order.insuranceName || '';
        const lines: any[] = order.lines || [];

        if (lines.length === 0) {
          rows.push([numCmd, montant, '', '', 0, 0, '', statut, causeAnnulation, clientName, dateDocument, assurance]);
        } else {
          let isFirst = true;
          for (const line of lines) {
            const lineObjNo = line.lineObjectNumber || '';
            const description = line.description || '';
            const article = `${lineObjNo} - ${description}`;
            const origine = lineObjNo.startsWith('PLX') ? 'Adaptable' : 'Original';
            const qty = line.quantity || 0;
            const price = line.amountExcludingTax || 0;
            const brand = line.brand || 'Sans Marque';
            rows.push([
              isFirst ? numCmd : '',
              isFirst ? montant : '',
              article, origine, qty, price, brand,
              isFirst ? statut : '',
              isFirst ? causeAnnulation : '',
              isFirst ? clientName : '',
              isFirst ? dateDocument : '',
              isFirst ? assurance : ''
            ]);
            isFirst = false;
          }
        }
      }

      // Generate Excel workbook with professional formatting
      const ws = XLSX.utils.aoa_to_sheet(rows);

      // Set column widths and freeze header row
      const colWidths = [18, 16, 40, 12, 10, 12, 18, 20, 25, 25, 16, 18];
      ws['!cols'] = colWidths.map(w => ({ wch: w }));
      ws['!freeze'] = { xSplit: 0, ySplit: 1 };

      // Format number columns (Montant and Prix HT) as numbers with 2 decimals
      const numberFormat = '0.00';
      for (let rowIdx = 1; rowIdx < rows.length; rowIdx++) {
        // Format Montant Commande (column B, index 1)
        const montantCell = ws[XLSX.utils.encode_col(1) + (rowIdx + 1)];
        if (montantCell) montantCell.z = numberFormat;

        // Format Prix HT (column F, index 5)
        const priceCell = ws[XLSX.utils.encode_col(5) + (rowIdx + 1)];
        if (priceCell) priceCell.z = numberFormat;
      }

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, `Commandes - ${statusLabel}`);
      XLSX.writeFile(wb, `Commandes_${statusKey}_${startDate}_${endDate}.xlsx`);
    } catch (error) {
      console.error('Failed to export excel:', error);
      openSnackbar({
        open: true,
        message: `Échec de l'export Excel (${statusLabel}). Aucun fichier partiel n'a été généré — veuillez réessayer.`,
        variant: 'alert',
        alert: { color: 'error' },
        close: true
      } as any);
    } finally {
      setExportLoading(false);
      setExportProgress('');
    }
  };

  const handleOpenDetails = async (type: string, title: string) => {
    setDetailsType(type);
    setDetailsTitle(title);
    setDetailsOpen(true);
    setDetailsLoading(true);
    setDetailsData([]);
    try {
      const response = await axiosServices.get(`/api/purchase-orders/dashboard/cue-details?type=${type}`);
      const val = response.data.value || response.data || [];
      setDetailsData(val);
    } catch (error) {
      console.error('Failed to load cue details:', error);
    } finally {
      setDetailsLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '600px' }}>
        <Stack spacing={2} alignItems="center">
          <CircularProgress size={45} thickness={4.5} sx={{ color: 'primary.main' }} />
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
            Initialisation du tableau de bord financier...
          </Typography>
        </Stack>
      </Box>
    );
  }

  if (!stats) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="error" variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
          Erreur de Chargement API
        </Typography>
        <Typography color="text.secondary">
          Impossible de se connecter aux API Business Central.
        </Typography>
      </Box>
    );
  }

  const userObj = user && typeof user !== 'boolean' ? user : null;
  const isC0082 = userObj?.customerNo === 'C0082';
  const role = userObj ? userObj.role : 'Client';
  const showSales = role === 'Client' || role === 'Client and Fournisseur' || isC0082;
  const isChef = role === 'Client and Fournisseur' || isC0082;

  // --- FACTURATION DE LA PÉRIODE ---
  // ATTENTION : ces deux montants ne sont PAS appariés. caVentes = Σ Cust. Ledger Entry
  // "Sales (LCY)" et caAchats = Σ Vendor Ledger Entry "Purchase (LCY)", chacun filtré sur sa
  // propre Posting Date (voir PlexusCueRefreshMgt.RefreshSalesCues). Comme la facture
  // fournisseur d'une commande arrive 1 à 2 mois après la facture client, une période donnée
  // compare des ventes et des achats qui ne concernent pas les mêmes dossiers. Leur différence
  // est un écart de facturation (indicateur de trésorerie), jamais une marge commerciale :
  // mesurée sur 2026, elle oscille entre 5,6 % et 46,1 % d'un mois à l'autre.
  // La vraie marge suppose un COGS apparié (Value Entry) — indisponible tant que le coût
  // article n'est pas propagé aux ventes dans BC.
  const caVentes = stats.caAnnuel;
  const caAchats = stats.achatsAnnuel || 0;
  const ecartFacturation = caVentes - caAchats;

  // --- CASH FLOW / TRENDS : regroupement de la série journalière réelle ---
  // dailySeries vient de /dashboard/margin-series : par jour, le CA des factures rapprochées et
  // le coût d'achat des MÊMES dossiers, avoirs déduits des deux côtés. La série se totalise donc
  // sur la carte "Marge Commerciale" — et non sur "Ventes/Achats Facturés", qui comptent tout ce
  // qui est facturé, apparié ou non.
  // Le grain d'affichage suit la plage choisie (jour / semaine / mois / année) ; les buckets
  // sont générés depuis la plage pour que l'axe reste continu même sur une période creuse.
  const getCashFlowChartData = () => {
    const start = parseLocalDate(startDate);
    const end = parseLocalDate(endDate);
    const diffDays = Math.round((end.getTime() - start.getTime()) / 86400000) + 1;
    const monthLabels = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];

    const grain: 'year' | 'month' | 'week' | 'day' =
      start.getFullYear() !== end.getFullYear() ? 'year' : diffDays <= 10 ? 'day' : diffDays <= 60 ? 'week' : 'month';

    // Buckets ordonnés couvrant toute la plage : [clé, libellé]
    const buckets: { key: string; label: string }[] = [];
    if (grain === 'year') {
      for (let y = start.getFullYear(); y <= end.getFullYear(); y++) {
        buckets.push({ key: String(y), label: String(y) });
      }
    } else if (grain === 'month') {
      const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
      while (cursor <= end) {
        buckets.push({
          key: `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`,
          label: monthLabels[cursor.getMonth()]
        });
        cursor.setMonth(cursor.getMonth() + 1);
      }
    } else if (grain === 'week') {
      const cursor = new Date(start);
      let idx = 0;
      while (cursor <= end) {
        buckets.push({
          key: `w${idx}`,
          label: `Sem. ${cursor.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}`
        });
        cursor.setDate(cursor.getDate() + 7);
        idx++;
      }
    } else {
      const cursor = new Date(start);
      while (cursor <= end) {
        buckets.push({
          key: formatLocalDate(cursor),
          label: cursor.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
        });
        cursor.setDate(cursor.getDate() + 1);
      }
    }

    // Une date comptable -> la clé de son bucket
    const keyOf = (isoDate: string) => {
      if (grain === 'year') return isoDate.slice(0, 4);
      if (grain === 'month') return isoDate.slice(0, 7);
      if (grain === 'day') return isoDate;
      const offset = Math.floor((parseLocalDate(isoDate).getTime() - start.getTime()) / 86400000);
      return `w${Math.floor(offset / 7)}`;
    };

    const totals = new Map<string, { sales: number; purchases: number }>();
    buckets.forEach((b) => totals.set(b.key, { sales: 0, purchases: 0 }));
    dailySeries.forEach((point) => {
      const slot = totals.get(keyOf(point.date));
      // hors plage (ne devrait pas arriver, le backend filtre déjà) -> ignoré
      if (!slot) return;
      slot.sales += point.sales || 0;
      slot.purchases += point.purchases || 0;
    });

    return {
      categories: buckets.map((b) => b.label),
      salesData: buckets.map((b) => totals.get(b.key)!.sales),
      purchaseData: buckets.map((b) => totals.get(b.key)!.purchases)
    };
  };

  const { categories, salesData, purchaseData } = getCashFlowChartData();
  // Le backend ne renvoie rien tant que l'extension AL 1.1.1.462+ n'est pas publiée : on le dit
  // au lieu d'afficher des courbes plates qui passeraient pour une activité nulle.
  const hasDailySeries = dailySeries.length > 0;

  const getWorkingDaysCount = () => {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    let count = 0;
    const curDate = new Date(start.getTime());
    while (curDate <= end) {
      const dayOfWeek = curDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // 0 = Sunday, 6 = Saturday
        count++;
      }
      curDate.setDate(curDate.getDate() + 1);
    }
    return count > 0 ? count : 1;
  };
  const daysCount = getWorkingDaysCount();

  // --- MOCKUP THEME COLOR PALETTE (PONTEO STYLE) ---
  const lavenderBg = theme.palette.mode === 'dark' ? 'rgba(99, 102, 241, 0.12)' : '#f3e8ff';
  const lavenderText = theme.palette.mode === 'dark' ? '#c7d2fe' : '#6b21a8';

  const peachBg = theme.palette.mode === 'dark' ? 'rgba(236, 72, 153, 0.12)' : '#fce7f3';
  const peachText = theme.palette.mode === 'dark' ? '#fbcfe8' : '#be185d';

  const mintBg = theme.palette.mode === 'dark' ? 'rgba(16, 185, 129, 0.12)' : '#d1fae5';
  const mintText = theme.palette.mode === 'dark' ? '#a7f3d0' : '#047857';

  const skyBg = theme.palette.mode === 'dark' ? 'rgba(14, 165, 233, 0.12)' : '#e0f2fe';
  const skyText = theme.palette.mode === 'dark' ? '#bae6fd' : '#0369a1';

  const amberBg = theme.palette.mode === 'dark' ? 'rgba(245, 158, 11, 0.12)' : '#fef3c7';
  const amberText = theme.palette.mode === 'dark' ? '#fde68a' : '#b45309';

  const indigoBg = theme.palette.mode === 'dark' ? 'rgba(99, 102, 241, 0.12)' : '#e0e7ff';
  const indigoText = theme.palette.mode === 'dark' ? '#c7d2fe' : '#4338ca';

  const roseBg = theme.palette.mode === 'dark' ? 'rgba(244, 63, 94, 0.12)' : '#ffe4e6';
  const roseText = theme.palette.mode === 'dark' ? '#fecdd3' : '#be123c';

  // --- ECHARTS CASH FLOW (DOUBLE LINE GRADIENT WAVE - MOCKUP 4 STYLE) ---
  const cashFlowOption = {
    animation: true,
    animationDuration: 1200,
    animationEasing: 'cubicOut',
    animationDurationUpdate: 800,
    tooltip: {
      trigger: 'axis',
      backgroundColor: theme.palette.mode === 'dark' ? '#1f2937' : '#ffffff',
      borderColor: 'rgba(0,0,0,0.05)',
      borderWidth: 1,
      textStyle: { color: theme.palette.text.primary, fontSize: 13, fontFamily: 'Inter' }
    },
    legend: {
      data: ['Ventes appariées', "Coût d'achat"],
      textStyle: { color: theme.palette.text.secondary, fontWeight: 600, fontFamily: 'Inter' },
      bottom: '2%',
      icon: 'circle'
    },
    grid: {
      left: '2%',
      right: '2%',
      bottom: '12%',
      top: '5%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: categories,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: theme.palette.text.secondary, fontWeight: 500, fontSize: 11 }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: theme.palette.divider, type: 'dashed' } },
      axisLabel: { color: theme.palette.text.secondary, fontWeight: 500, fontSize: 11 }
    },
    series: [
      {
        name: 'Ventes appariées',
        data: salesData,
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: {
          color: '#6366f1',
          width: 4
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(99, 102, 241, 0.25)' },
            { offset: 1, color: 'rgba(99, 102, 241, 0)' }
          ])
        }
      },
      {
        name: "Coût d'achat",
        data: purchaseData,
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: {
          color: '#06b6d4',
          width: 4
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(6, 182, 212, 0.2)' },
            { offset: 1, color: 'rgba(6, 182, 212, 0)' }
          ])
        }
      }
    ]
  };

  // --- ECHARTS TRENDS CYLINDERS (MONTHLY GROSS MARGIN) ---
  const getCylinderChartData = () => {
    const cylinderData = categories.map((_, i) => {
      const salesVal = salesData[i] || 0;
      const purchaseVal = purchaseData[i] || 0;
      return salesVal - purchaseVal;
    });
    return { cylinderData };
  };

  const { cylinderData } = getCylinderChartData();

  const trendsCylindersOption = {
    animation: true,
    animationDuration: 1200,
    animationEasing: 'cubicOut',
    animationDurationUpdate: 800,
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: '{b} : {c} DT'
    },
    grid: { left: '3%', right: '3%', bottom: '5%', top: '5%', containLabel: true },
    xAxis: {
      type: 'category',
      data: categories,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: theme.palette.text.secondary, fontWeight: 500 }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: theme.palette.divider, type: 'dashed' } }
    },
    series: [
      {
        name: 'Marge',
        type: 'bar',
        barWidth: '40%',
        data: cylinderData,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#8b5cf6' },
            { offset: 1, color: '#3b82f6' }
          ]),
          borderRadius: [12, 12, 0, 0]
        }
      }
    ]
  };

  // 1. Horizontal Bar Chart for Top Articles
  const getSortedArticles = () => {
    if (articlesTab === 'quantity') {
      return [...topArticles].sort((a1, a2) => {
        const q1 = Math.abs(a1.purchasesQty || 0);
        const q2 = Math.abs(a2.purchasesQty || 0);
        return q2 - q1;
      });
    } else {
      return [...topArticles].sort((a1, a2) => {
        const v1 = Math.abs(a1.purchasesLCY || 0);
        const v2 = Math.abs(a2.purchasesLCY || 0);
        return v2 - v1;
      });
    }
  };

  const currentTopArticles = getSortedArticles();
  // Le graphe montre le top 5 (inversé : ECharts empile les barres du bas vers le haut)
  const chartArticles = currentTopArticles.slice(0, 5).reverse();

  const articlesBarOption = {
    animation: true,
    animationDuration: 1200,
    animationEasing: 'cubicOut',
    animationDurationUpdate: 800,
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        const item = params[0];
        const article = chartArticles[item.dataIndex];
        if (!article) return item.name;
        const qty = Math.abs(article.purchasesQty || 0);
        const amount = Math.abs(article.purchasesLCY || 0);
        return `<b>${article.number || ''}</b><br/>${article.description || ''}<br/>`
          + `Groupe remise: <b>${article.discountGroupName || article.discountGroup || '-'}</b>`
          + `${article.discountGroupName && article.discountGroup ? ` (${article.discountGroup})` : ''}<br/>`
          + `Quantité: <b>${qty.toLocaleString()} unités</b><br/>`
          + `PU moyen: <b>${(article.unitPrice ?? (qty > 0 ? amount / qty : 0)).toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })} DT</b><br/>`
          + `Total: <b>${amount.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })} DT</b>`;
      }
    },
    grid: {
      left: '3%',
      right: '6%',
      bottom: '3%',
      top: '5%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      axisLabel: {
        color: theme.palette.text.secondary,
        formatter: (val: number) => {
          if (val >= 1000) return (val / 1000) + 'k';
          return val;
        }
      },
      splitLine: {
        lineStyle: {
          color: theme.palette.divider,
          type: 'dashed'
        }
      }
    },
    yAxis: {
      type: 'category',
      data: chartArticles.map(item => {
        const desc = item.description || item.number || '';
        return desc.length > 20 ? desc.substring(0, 20) + '...' : desc;
      }),
      axisLabel: {
        color: theme.palette.text.primary,
        fontWeight: 600
      },
      axisLine: { show: false },
      axisTick: { show: false }
    },
    series: [
      {
        name: articlesTab === 'quantity' ? 'Quantité' : 'Achats',
        type: 'bar',
        barWidth: '55%',
        itemStyle: {
          borderRadius: [0, 8, 8, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: articlesTab === 'quantity' ? '#10b981' : '#f43f5e' },
            { offset: 1, color: articlesTab === 'quantity' ? '#06b6d4' : '#ec4899' }
          ])
        },
        data: chartArticles.map(item => {
          return articlesTab === 'quantity' ? Math.abs(item.purchasesQty || 0) : Math.abs(item.purchasesLCY || 0);
        })
      }
    ]
  };

  // 2. Donut Chart for Top Brands
  const getSortedBrands = () => {
    if (brandsTab === 'quantity') {
      return [...topBrands].sort((b1, b2) => {
        const q1 = Math.abs(b1.purchasesQty || 0);
        const q2 = Math.abs(b2.purchasesQty || 0);
        return q2 - q1;
      });
    } else {
      return [...topBrands].sort((b1, b2) => {
        const v1 = Math.abs(b1.purchasesLCY || 0);
        const v2 = Math.abs(b2.purchasesLCY || 0);
        return v2 - v1;
      });
    }
  };

  const currentTopBrands = getSortedBrands();
  const totalBrandsPurchases = currentTopBrands.slice(0, 5).reduce((acc, curr) => {
    return acc + Math.abs(brandsTab === 'quantity' ? (curr.purchasesQty || 0) : (curr.purchasesLCY || 0));
  }, 0);

  const brandsDonutOption = {
    animation: true,
    animationDuration: 1200,
    animationEasing: 'cubicOut',
    animationDurationUpdate: 800,
    title: {
      text: brandsTab === 'quantity' ? 'Quantité' : 'Achats',
      subtext: totalBrandsPurchases.toLocaleString() + (brandsTab === 'quantity' ? ' unités' : ' DT'),
      left: '27%',
      top: '41%',
      textAlign: 'center',
      textStyle: {
        fontSize: 11,
        color: theme.palette.text.secondary,
        fontWeight: 600,
        fontFamily: 'Inter'
      },
      subtextStyle: {
        fontSize: 14,
        color: theme.palette.text.primary,
        fontWeight: 800,
        fontFamily: 'Inter'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const unit = brandsTab === 'quantity' ? 'unités' : 'DT';
        return `${params.name}: <b>${params.value.toLocaleString()} ${unit}</b> (${params.percent}%)`;
      }
    },
    legend: {
      orient: 'vertical',
      left: '58%',
      top: 'center',
      formatter: (name: string) => {
        const item = currentTopBrands.find(b => b.brand === name);
        if (item) {
          const val = Math.abs(brandsTab === 'quantity' ? (item.purchasesQty || 0) : (item.purchasesLCY || 0));
          const unit = brandsTab === 'quantity' ? ' unités' : ' DT';
          return `${name}: ${val.toLocaleString()}${unit}`;
        }
        return name;
      },
      textStyle: {
        color: theme.palette.text.primary,
        fontWeight: 600,
        fontFamily: 'Inter'
      }
    },
    series: [
      {
        name: 'Top Marques',
        type: 'pie',
        radius: ['50%', '72%'],
        center: ['28%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: theme.palette.background.paper,
          borderWidth: 2
        },
        label: {
          show: true,
          position: 'inside',
          formatter: '{d}%',
          color: '#ffffff',
          fontWeight: 700,
          fontSize: 10
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '14',
            fontWeight: 'bold',
            formatter: (params: any) => {
              return `${params.name}\n${params.percent}%`;
            },
            color: theme.palette.text.primary
          }
        },
        labelLine: {
          show: false
        },
        data: currentTopBrands.slice(0, 5).map((item, idx) => {
          const colors = brandsTab === 'quantity'
            ? ['#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6']
            : ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e'];
          return {
            value: Math.abs(brandsTab === 'quantity' ? (item.purchasesQty || 0) : (item.purchasesLCY || 0)),
            // libellé complet du groupe remise quand BC le fournit, sinon le code
            name: item.brandName || item.brand,
            itemStyle: { color: colors[idx % colors.length] }
          };
        })
      }
    ]
  };






  return (
    <PageContainer>

      {/* Behance-Style Dashboard Header Section */}
      <HeaderRow>
        <Stack spacing={0.5}>
          <Typography variant="h2" sx={{ fontWeight: 800, letterSpacing: '-1.5px', color: 'text.primary' }}>
            Payments & Financials
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
            Indicateurs consolidés de facturation, encaissements et marges
          </Typography>
        </Stack>

        <Stack direction="row" spacing={2.5} alignItems="center">
          {/* Date Picker Filter */}
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <DatePicker
                label="Du"
                value={parseLocalDate(tempStartDate)}
                maxDate={new Date()}
                onChange={(newValue) => {
                  if (newValue) {
                    setTempStartDate(formatLocalDate(newValue));
                  }
                }}
                slotProps={{
                  textField: {
                    size: 'small',
                    sx: {
                      width: 160,
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
                onChange={(newValue) => {
                  if (newValue) {
                    setTempEndDate(formatLocalDate(newValue));
                  }
                }}
                slotProps={{
                  textField: {
                    size: 'small',
                    sx: {
                      width: 160,
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
                  '&:hover': {
                    background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)'
                  }
                }}
              >
                Filtrer
              </Button>
            </Box>
          </LocalizationProvider>

          {/* Export de contrôle : permet de confronter la marge affichée au calcul manuel de
              la comptabilité, ligne par ligne, avec les deux remises en regard. */}
          {margin && (
            <Button
              variant="outlined"
              color="success"
              startIcon={<DocumentDownload size="18" variant="Outline" />}
              onClick={handleExportMarge}
              disabled={exportLoading}
              sx={{
                borderRadius: '50px',
                textTransform: 'none',
                fontWeight: 700,
                px: 3,
                py: 1,
                whiteSpace: 'nowrap'
              }}
            >
              Détail marge
            </Button>
          )}

          <Button
            variant="contained"
            startIcon={<ShieldTick size="18" variant="Bold" />}
            onClick={() => router.push('/pages/dashboard-assurance')}
            sx={{
              borderRadius: '50px',
              textTransform: 'none',
              fontWeight: 700,
              px: 3,
              py: 1,
              background: 'linear-gradient(135deg, #06b6d4 0%, #10b981 100%)',
              boxShadow: '0 4px 12px rgba(6, 182, 212, 0.25)',
              '&:hover': {
                background: 'linear-gradient(135deg, #0891b2 0%, #059669 100%)'
              }
            }}
          >
            Dashboard Assurances
          </Button>

          {/* Journal d'activité: traçabilité, réservée au compte admin (C0082) */}
          {isC0082 && (
            <Button
              variant="contained"
              startIcon={<Activity size="18" variant="Bold" />}
              onClick={() => router.push('/pages/journal-activite')}
              sx={{
                borderRadius: '50px',
                textTransform: 'none',
                fontWeight: 700,
                px: 3,
                py: 1,
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)'
                }
              }}
            >
              Journal d&apos;activité
            </Button>
          )}

          {isC0082 && (
            <Button
              variant="contained"
              onClick={async () => { await signOut({ redirect: false }); window.location.href = '/login'; }}
              sx={{
                borderRadius: '50px',
                textTransform: 'none',
                fontWeight: 700,
                px: 3.5,
                py: 1,
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'
                }
              }}
            >
              Déconnexion
            </Button>
          )}
        </Stack>
      </HeaderRow>

      {/* Main Grid Layout */}
      <Grid container spacing={GRID_COMMON_SPACING}>

        {/* LEFT COLUMN (Main Charts & Data) - takes 8 grid cols */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Grid container spacing={GRID_COMMON_SPACING}>

            {/* ROW 1: Overlapping Oval Cards (Behance Style) */}
            {showSales && (
              <Grid size={12}>
                <OverlapContainer direction="row" spacing={-3}>

                  {/* Card 1: CA Ventes */}
                  <OverlapCard
                    bg={lavenderBg}
                    textcolor={lavenderText}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                  >
                    <Stack spacing={1}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.7 }}>
                        Ventes Facturées
                      </Typography>
                      <Typography variant="h2" sx={{ fontWeight: 900, letterSpacing: '-1.5px' }}>
                        {caVentes.toLocaleString()} DT
                      </Typography>
                    </Stack>
                    <Typography variant="caption" sx={{ fontWeight: 600, opacity: 0.8 }}>
                      Factures clients comptabilisées sur la période
                    </Typography>
                  </OverlapCard>

                  {/* Card 2: CA Achats */}
                  <OverlapCard
                    bg={peachBg}
                    textcolor={peachText}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    style={{ zIndex: 3 }}
                  >
                    <Stack spacing={1}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.7 }}>
                        Achats Facturés
                      </Typography>
                      <Typography variant="h2" sx={{ fontWeight: 900, letterSpacing: '-1.5px' }}>
                        {caAchats.toLocaleString()} DT
                      </Typography>
                    </Stack>
                    <Typography variant="caption" sx={{ fontWeight: 600, opacity: 0.8 }}>
                      Factures fournisseurs comptabilisées sur la période
                    </Typography>
                  </OverlapCard>

                  {/* Card 3: Écart de facturation — volontairement PAS présenté comme une marge,
                      les deux montants n'étant pas appariés (cf. commentaire plus haut). */}
                  <OverlapCard
                    bg={mintBg}
                    textcolor={mintText}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    style={{ zIndex: 4 }}
                  >
                    <Stack spacing={1}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.7 }}>
                        Écart de Facturation
                      </Typography>
                      <Typography variant="h2" sx={{ fontWeight: 900, letterSpacing: '-1.5px' }}>
                        {ecartFacturation.toLocaleString()} DT
                      </Typography>
                    </Stack>
                    <Tooltip title="Les factures fournisseurs d'une commande sont comptabilisées 1 à 2 mois après la facture client. Sur une période donnée, ventes et achats ne portent donc pas sur les mêmes dossiers : leur différence mesure un décalage de facturation, pas une rentabilité.">
                      <Typography variant="caption" sx={{ fontWeight: 600, opacity: 0.8, cursor: 'help', textDecoration: 'underline dotted' }}>
                        Ventes − achats facturés · ce n&apos;est pas une marge commerciale
                      </Typography>
                    </Tooltip>
                  </OverlapCard>

                  {/* Card 4: LA marge — seul indicateur de rentabilité de cette ligne.
                      Écart de remise vente/achat, dossier par dossier : on vend à -15 % ce qu'on
                      achète à -18 %, le gain est l'écart. Le taux est mis en avant, et juste en
                      dessous les deux montants qui le produisent, pour qu'on puisse refaire la
                      soustraction de tête. Absente tant que /dashboard/margin ne répond pas
                      (extension AL 1.1.1.470+ : coût au prix facturé fournisseur, avoirs déduits,
                      export ligne à ligne). */}
                  {margin && (
                    <OverlapCard
                      bg={skyBg}
                      textcolor={skyText}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                      style={{ zIndex: 5 }}
                    >
                      <Stack spacing={1}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.7 }}>
                          Marge Commerciale
                        </Typography>
                        <Stack direction="row" spacing={1.5} alignItems="baseline">
                          <Typography variant="h2" sx={{ fontWeight: 900, letterSpacing: '-1.5px' }}>
                            {margin.marginRate.toFixed(2)}%
                          </Typography>
                          <Typography variant="h5" sx={{ fontWeight: 800, opacity: 0.9 }}>
                            {margin.margin.toLocaleString(undefined, { maximumFractionDigits: 0 })} DT
                          </Typography>
                        </Stack>
                        {/* les deux termes du calcul, explicitement */}
                        <Stack spacing={0.25} sx={{ opacity: 0.85 }}>
                          <Typography variant="caption" sx={{ fontWeight: 700 }}>
                            Vendu&nbsp;: {margin.coveredRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })} DT
                          </Typography>
                          <Typography variant="caption" sx={{ fontWeight: 700 }}>
                            Acheté&nbsp;: {margin.cogs.toLocaleString(undefined, { maximumFractionDigits: 0 })} DT
                          </Typography>
                        </Stack>
                      </Stack>
                      <Tooltip title={`Écart entre la remise de vente et la remise d'achat, dossier par dossier : chaque facture vente est rapprochée de sa commande achat, ligne à ligne. Calculée sur ${margin.invoicesCovered} factures rattachées à une commande achat sur ${margin.invoicesTotal}${margin.uncoveredRevenue > 0 ? ` (${margin.uncoveredRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })} DT de lignes sans contrepartie à l'achat)` : ''}. ${margin.creditNotes > 0 ? `Avoirs déduits : ${margin.creditsReturned.toLocaleString(undefined, { maximumFractionDigits: 0 })} DT de marchandise reprise (vente et coût annulés) et ${margin.creditsOther.toLocaleString(undefined, { maximumFractionDigits: 0 })} DT de RRR et gestes commerciaux, en perte sèche.` : 'Aucun avoir sur la période.'}`}>
                        <Typography variant="caption" sx={{ fontWeight: 600, opacity: 0.8, cursor: 'help', textDecoration: 'underline dotted' }}>
                          {margin.invoicesCovered}/{margin.invoicesTotal} factures rapprochées
                        </Typography>
                      </Tooltip>
                    </OverlapCard>
                  )}

                </OverlapContainer>
              </Grid>
            )}





            {/* ROW 2: Cash Flow Wave Lines (Mockup 4 style) */}
            <Grid size={12}>
              <PremiumCard
                title="Ventes & Coût d'achat"
                subheader="Mêmes dossiers des deux côtés : l'écart entre les deux courbes est la marge"
              >
                {hasDailySeries ? (
                  <ReactECharts option={cashFlowOption} style={{ height: '330px', width: '100%' }} notMerge={true} />
                ) : (
                  <SeriesUnavailable height={330} />
                )}
              </PremiumCard>
            </Grid>

            {/* ROW 3: Top Clients & Suppliers side-by-side lists */}
            {isChef && (
              <Grid size={12}>
                <PremiumCard
                  title="Performance Partenaires"
                  subheader="Classement des principaux clients et fournisseurs par volume d'affaires (Chiffre d'affaires / Achats)"
                >
                  <Grid container spacing={4} sx={{ mt: 0.5 }}>
                    {/* Left Column: Top Clients B2B */}
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#8b5cf6' }} />
                        Top Clients
                      </Typography>
                      <Stack spacing={3}>
                        {topCustomers.length === 0 ? (
                          <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                            Aucun client disponible
                          </Typography>
                        ) : (
                          topCustomers.slice(0, 5).map((item, index) => {
                            const val = Math.abs(item.paymentsLCY || item.salesLCY || 0);
                            const percentage = caVentes > 0 ? Math.round((val / caVentes) * 100) : 0;
                            const colors = ['#8b5cf6', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b'];
                            const color = colors[index % colors.length];
                            return (
                              <Stack key={index} spacing={1}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                  <Stack direction="row" spacing={1.5} alignItems="center">
                                    <Box sx={{
                                      width: 28,
                                      height: 28,
                                      borderRadius: '50%',
                                      bgcolor: 'action.hover',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: '0.75rem',
                                      fontWeight: 700,
                                      color: 'text.secondary'
                                    }}>
                                      {index + 1}
                                    </Box>
                                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                                      {item.name}
                                    </Typography>
                                  </Stack>
                                  <Typography variant="body2" sx={{ fontWeight: 800, color: color }}>
                                    {val.toLocaleString()} DT ({percentage}%)
                                  </Typography>
                                </Stack>
                                <Box sx={{ width: '100%', height: '8px', bgcolor: theme.palette.mode === 'dark' ? '#1e293b' : '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                                  <Box sx={{ width: `${percentage}%`, height: '100%', bgcolor: color, borderRadius: '4px' }} />
                                </Box>
                              </Stack>
                            );
                          })
                        )}
                      </Stack>
                    </Grid>

                    {/* Right Column: Top Suppliers */}
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#06b6d4' }} />
                        Top Fournisseurs
                      </Typography>
                      <Stack spacing={3}>
                        {topVendors.length === 0 ? (
                          <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                            Aucun fournisseur disponible
                          </Typography>
                        ) : (
                          topVendors.slice(0, 5).map((item, index) => {
                            const val = Math.abs(item.paymentsLCY || item.purchaseLCY || 0);
                            const percentage = caAchats > 0 ? Math.round((val / caAchats) * 100) : 0;
                            const colors = ['#06b6d4', '#10b981', '#f59e0b', '#6366f1', '#f43f5e'];
                            const color = colors[index % colors.length];
                            return (
                              <Stack key={index} spacing={1}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                  <Stack direction="row" spacing={1.5} alignItems="center">
                                    <Box sx={{
                                      width: 28,
                                      height: 28,
                                      borderRadius: '50%',
                                      bgcolor: 'action.hover',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: '0.75rem',
                                      fontWeight: 700,
                                      color: 'text.secondary'
                                    }}>
                                      {index + 1}
                                    </Box>
                                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                                      {item.name}
                                    </Typography>
                                  </Stack>
                                  <Typography variant="body2" sx={{ fontWeight: 800, color: color }}>
                                    {val.toLocaleString()} DT ({percentage}%)
                                  </Typography>
                                </Stack>
                                <Box sx={{ width: '100%', height: '8px', bgcolor: theme.palette.mode === 'dark' ? '#1e293b' : '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                                  <Box sx={{ width: `${percentage}%`, height: '100%', bgcolor: color, borderRadius: '4px' }} />
                                </Box>
                              </Stack>
                            );
                          })
                        )}
                      </Stack>
                    </Grid>
                  </Grid>
                </PremiumCard>
              </Grid>
            )}

            {/* ROW 4: Top Articles & Brands side-by-side lists */}
            {isChef && (
              <Grid size={12}>
                <PremiumCard
                  title="Performance Produits & Marques"
                  subheader="Classement des principaux articles et des marques les plus utilisées par volume d'achats"
                >
                  <Grid container spacing={4} sx={{ mt: 0.5 }}>
                    {/* Left Column: Top Articles Bar Chart */}
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: articlesTab === 'quantity' ? '#10b981' : '#f43f5e' }} />
                          Top Articles (Commandes validées)
                        </Typography>
                        <Tabs
                          value={articlesTab}
                          onChange={(_, val) => setArticlesTab(val)}
                          sx={{
                            minHeight: 'auto',
                            '& .MuiTab-root': {
                              minHeight: 'auto',
                              py: 0.5,
                              px: 1.5,
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              textTransform: 'none',
                              borderRadius: '20px'
                            },
                            '& .MuiTabs-indicator': {
                              display: 'none'
                            },
                            '& .Mui-selected': {
                              backgroundColor: theme.palette.mode === 'dark' ? '#1e293b' : '#e2e8f0',
                              color: theme.palette.text.primary + ' !important'
                            }
                          }}
                        >
                          <Tab value="quantity" label="Quantité" />
                          <Tab value="revenue" label="Chiffre d'affaires" />
                        </Tabs>
                      </Stack>
                      {topArticles.length === 0 ? (
                        <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                          Aucun article disponible
                        </Typography>
                      ) : (
                        <>
                          <ReactECharts option={articlesBarOption} style={{ height: '300px', width: '100%' }} notMerge={true} />
                          <Stack direction="row" justifyContent="flex-end" sx={{ mt: 1 }}>
                            <Button
                              size="small"
                              variant="text"
                              onClick={() => setArticlesModalOpen(true)}
                              sx={{ fontWeight: 800, textTransform: 'none' }}
                            >
                              Voir plus ({Math.min(currentTopArticles.length, 100)} articles)
                            </Button>
                          </Stack>
                        </>
                      )}
                    </Grid>

                    {/* Right Column: Top Brands Donut Chart */}
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: brandsTab === 'quantity' ? '#10b981' : '#3b82f6' }} />
                          Top Marques
                        </Typography>
                        <Tabs
                          value={brandsTab}
                          onChange={(_, val) => setBrandsTab(val)}
                          sx={{
                            minHeight: 'auto',
                            '& .MuiTab-root': {
                              minHeight: 'auto',
                              py: 0.5,
                              px: 1.5,
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              textTransform: 'none',
                              borderRadius: '20px'
                            },
                            '& .MuiTabs-indicator': {
                              display: 'none'
                            },
                            '& .Mui-selected': {
                              backgroundColor: theme.palette.mode === 'dark' ? '#1e293b' : '#e2e8f0',
                              color: theme.palette.text.primary + ' !important'
                            }
                          }}
                        >
                          <Tab value="revenue" label="Chiffre d'affaires" />
                          <Tab value="quantity" label="Quantité" />
                        </Tabs>
                      </Stack>
                      {topBrands.length === 0 ? (
                        <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                          Aucune marque disponible
                        </Typography>
                      ) : (
                        <ReactECharts option={brandsDonutOption} style={{ height: '300px', width: '100%' }} notMerge={true} />
                      )}
                    </Grid>
                  </Grid>
                </PremiumCard>
              </Grid>
            )}

          </Grid>
        </Grid>

        {/* RIGHT COLUMN (Trends) - takes 4 grid cols */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={GRID_COMMON_SPACING}>

            {/* Today & Backlog KPIs (2 per row) */}
            {stats && (
              <Grid container spacing={2}>
                {/* Card 1: CA Aujourd'hui */}
                <Grid size={6}>
                  <OverlapCard
                    bg={skyBg}
                    textcolor={skyText}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    style={{ minWidth: 0, padding: '20px 24px', height: '100%', borderRadius: '20px', cursor: 'pointer' }}
                    onClick={() => handleOpenDetails('ca', "Chiffre d'Affaires - Aujourd'hui")}
                  >
                    <Stack spacing={0.5}>
                      <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.8 }}>
                        CA Aujourd'hui
                      </Typography>
                      <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-0.5px', fontSize: '1.2rem' }}>
                        {(stats.caAujourdhui || 0).toLocaleString()} DT
                      </Typography>
                    </Stack>
                  </OverlapCard>
                </Grid>

                {/* Card 2: Achat Aujourd'hui */}
                <Grid size={6}>
                  <OverlapCard
                    bg={amberBg}
                    textcolor={amberText}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    style={{ minWidth: 0, padding: '20px 24px', height: '100%', borderRadius: '20px', cursor: 'pointer' }}
                    onClick={() => handleOpenDetails('achat', "Achats - Aujourd'hui")}
                  >
                    <Stack spacing={0.5}>
                      <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.8 }}>
                        Achat Aujourd'hui
                      </Typography>
                      <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-0.5px', fontSize: '1.2rem' }}>
                        {(stats.amtFacturesAchatAujourd || 0).toLocaleString()} DT
                      </Typography>
                      <Typography variant="caption" sx={{ fontSize: '0.7rem', opacity: 0.8, mt: 0.5 }}>
                        {(stats.facturesAchatAujourdhui || 0)} facture(s)
                      </Typography>
                    </Stack>
                  </OverlapCard>
                </Grid>

                {/* Card 3: Nouvelle Commande */}
                <Grid size={6}>
                  <OverlapCard
                    bg={indigoBg}
                    textcolor={indigoText}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    style={{ minWidth: 0, padding: '20px 24px', height: '100%', borderRadius: '20px', cursor: 'pointer' }}
                    onClick={() => handleOpenDetails('commandes', "Nouvelles Commandes - Aujourd'hui")}
                  >
                    <Stack spacing={0.5}>
                      <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.8 }}>
                        Commandes
                      </Typography>
                      <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-0.5px', fontSize: '1.2rem' }}>
                        {(stats.amtCommandesAujourdhui || 0).toLocaleString()} DT
                      </Typography>
                      <Typography variant="caption" sx={{ fontSize: '0.7rem', opacity: 0.8, mt: 0.5 }}>
                        {(stats.commandesAujourdhui || 0)} commande(s)
                      </Typography>
                    </Stack>
                  </OverlapCard>
                </Grid>

                {/* Card 4: Factures Non Payées */}
                <Grid size={6}>
                  <OverlapCard
                    bg={roseBg}
                    textcolor={roseText}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    style={{ minWidth: 0, padding: '20px 24px', height: '100%', borderRadius: '20px', cursor: 'pointer' }}
                    onClick={() => handleOpenDetails('non-payees', "Factures Clients Non Payées")}
                  >
                    <Stack spacing={0.5}>
                      <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.8 }}>
                        Non Payées
                      </Typography>
                      <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-0.5px', fontSize: '1.2rem' }}>
                        {(stats.amtFacturesNonPayees || 0).toLocaleString()} DT
                      </Typography>
                      <Typography variant="caption" sx={{ fontSize: '0.7rem', opacity: 0.8, mt: 0.5 }}>
                        {(stats.facturesNonPayees || 0)} facture(s) client
                      </Typography>
                    </Stack>
                  </OverlapCard>
                </Grid>
              </Grid>
            )}

            {/* Averages KPIs (2 per row) */}
            {stats && (
              <Stack spacing={1.5} sx={{ mt: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8, fontSize: '0.75rem', pl: 0.5 }}>
                  Moyennes Journalières ({daysCount} jours)
                </Typography>
                <Grid container spacing={2}>
                  {/* Card 1: Moy. Perte Affaire */}
                  <Grid size={6}>
                    <OverlapCard
                      bg={roseBg}
                      textcolor={roseText}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      style={{ minWidth: 0, padding: '18px 20px', height: '100%', borderRadius: '20px' }}
                    >
                      <Stack spacing={0.5}>
                        <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.8, fontSize: '0.7rem' }}>
                          Moy. Perte Affaire
                        </Typography>
                        <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-0.5px', fontSize: '1.1rem' }}>
                          {((stats.amountAnnulees || 0) / daysCount).toLocaleString(undefined, { maximumFractionDigits: 0 })} DT/jour
                        </Typography>
                      </Stack>
                    </OverlapCard>
                  </Grid>

                  {/* Card 2: Moy. Nouvelle Commande */}
                  <Grid size={6}>
                    <OverlapCard
                      bg={skyBg}
                      textcolor={skyText}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      style={{ minWidth: 0, padding: '18px 20px', height: '100%', borderRadius: '20px' }}
                    >
                      <Stack spacing={0.5}>
                        <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.8, fontSize: '0.7rem' }}>
                          Moy. Nvl Cmd
                        </Typography>
                        <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-0.5px', fontSize: '1.1rem' }}>
                          {(((stats.enAttente || 0) + (stats.confirmationClient || 0) + (stats.commandeFerme || 0) + (stats.receptionnees || 0) + (stats.annulees || 0)) / daysCount).toFixed(1)} commandes/jour
                        </Typography>
                      </Stack>
                    </OverlapCard>
                  </Grid>

                  {/* Card 3: Moy. Commande Confirmée */}
                  <Grid size={6}>
                    <OverlapCard
                      bg={mintBg}
                      textcolor={mintText}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      style={{ minWidth: 0, padding: '18px 20px', height: '100%', borderRadius: '20px' }}
                    >
                      <Stack spacing={0.5}>
                        <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.8, fontSize: '0.7rem' }}>
                          Moy. Confirmée
                        </Typography>
                        <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-0.5px', fontSize: '1.1rem' }}>
                          {((stats.receptionnees || 0) / daysCount).toFixed(1)} commandes/jour
                        </Typography>
                      </Stack>
                    </OverlapCard>
                  </Grid>

                  {/* Card 4: Moy. Commande Annulée */}
                  <Grid size={6}>
                    <OverlapCard
                      bg={amberBg}
                      textcolor={amberText}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                      style={{ minWidth: 0, padding: '18px 20px', height: '100%', borderRadius: '20px' }}
                    >
                      <Stack spacing={0.5}>
                        <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.8, fontSize: '0.7rem' }}>
                          Moy. Annulée
                        </Typography>
                        <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-0.5px', fontSize: '1.1rem' }}>
                          {((stats.annulees || 0) / daysCount).toFixed(1)} commandes/jour
                        </Typography>
                      </Stack>
                    </OverlapCard>
                  </Grid>
                </Grid>
              </Stack>
            )}

            {/* CARD 1: marge par période — ventes appariées − coût d'achat du même bucket,
                sur la même série que la courbe du dessus. Depuis que la série est appariée
                dossier par dossier, cet écart EST la marge (avant, il ne l'était pas). */}
            <PremiumCard
              title="Marge par période"
              subheader="Ventes appariées − coût d'achat des mêmes dossiers"
            >
              {hasDailySeries ? (
                <ReactECharts option={trendsCylindersOption} style={{ height: '240px', width: '100%' }} notMerge={true} />
              ) : (
                <SeriesUnavailable height={240} />
              )}
            </PremiumCard>

            {/* CARD 2: Statut des Commandes - Premium Vertical Pipeline Timeline */}
            {stats && (
              <PremiumCard
                title="Pipeline des Commandes"
                subheader="Flux d'exécution de l'ERP en temps réel"
              >
                <Stack spacing={3} sx={{ position: 'relative', pl: 1 }}>
                  {/* Vertical connector line */}
                  <Box sx={{
                    position: 'absolute',
                    left: 17,
                    top: 20,
                    bottom: 20,
                    width: 2,
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'
                  }} />

                  {[
                    { label: 'En Attente', statusKey: 'Attente', count: stats.enAttente, amount: stats.amountAttente, color: '#f59e0b', desc: 'Commandes en attente de traitement' },
                    { label: 'Confirmation Partielle', statusKey: 'ConfirmationPartielle', count: stats.confirmationClient, amount: stats.amountConfirmation, color: '#3b82f6', desc: 'Confirmées par le client' },
                    { label: 'Fermes', statusKey: 'Fermes', count: stats.commandeFerme, amount: stats.amountFerme, color: '#8b5cf6', desc: 'Confirmées par le fournisseur' },
                    { label: 'Confirmé', statusKey: 'Confirme', count: stats.receptionnees, amount: stats.amountReceptionnees, color: '#10b981', desc: 'Livraisons terminées et clôturées dans l\'ERP' },
                    { label: 'Annulées', statusKey: 'Annulation', count: stats.annulees, amount: stats.amountAnnulees, color: '#f43f5e', desc: 'Commandes annulées' }
                  ].map((step, idx) => (
                    <Stack key={idx} direction="row" spacing={3} sx={{ position: 'relative' }}>
                      {/* Node circle */}
                      <Box sx={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        bgcolor: theme.palette.background.paper,
                        border: `4px solid ${step.color}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 2,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                      }} />

                      <Stack spacing={0.5} sx={{ flex: 1 }}>
                        {/* Top Row: Status (Left) and Count + Export Icon (Right) */}
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary' }}>
                            {step.label}
                          </Typography>
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Typography variant="body2" sx={{ fontWeight: 800, color: step.color }}>
                              {step.count}
                            </Typography>
                            <Tooltip title="Exporter sous Excel">
                              <IconButton
                                size="small"
                                onClick={() => handleExportExcel(step.statusKey, step.label)}
                                sx={{
                                  color: 'text.secondary',
                                  p: '2px',
                                  '&:hover': {
                                    color: '#10b981',
                                    backgroundColor: 'rgba(16, 185, 129, 0.08)'
                                  }
                                }}
                              >
                                <DocumentDownload size="13" variant="Outline" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </Stack>

                        {/* Bottom Row: Description (Left) and Amount (Right) */}
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem', pr: 2 }}>
                            {step.desc}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                            {step.amount.toLocaleString()} DT
                          </Typography>
                        </Stack>
                      </Stack>
                    </Stack>
                  ))}

                </Stack>
              </PremiumCard>
            )}

            {/* CARD 3: Commandé vs Facturé — ce qui a réellement été facturé par le fournisseur */}
            {commandeVsFacture && commandeVsFacture.available && commandeVsFacture.ordered > 0 && (
              <PremiumCard
                title="Commandé vs Facturé"
                subheader="Part des commandes réellement facturées par le fournisseur (hors annulées)"
              >
                <Stack spacing={2.5}>
                  {[
                    { label: 'Commandé', value: commandeVsFacture.ordered, pct: 100, color: '#6366f1' },
                    { label: 'Réceptionné', value: commandeVsFacture.received, pct: commandeVsFacture.pctReceived, color: '#0ea5e9' },
                    { label: 'Facturé', value: commandeVsFacture.invoiced, pct: commandeVsFacture.pctInvoiced, color: '#10b981' }
                  ].map((row) => (
                    <Box key={row.label}>
                      <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: 0.75 }}>
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>
                          {row.label}
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="baseline">
                          <Typography variant="body2" sx={{ fontWeight: 900 }}>
                            {row.value.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })} DT
                          </Typography>
                          <Typography variant="caption" sx={{ fontWeight: 800, color: row.color }}>
                            {row.pct.toFixed(1)}%
                          </Typography>
                        </Stack>
                      </Stack>
                      <Box sx={{ height: 8, borderRadius: 4, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }}>
                        <Box
                          sx={{
                            height: '100%',
                            width: `${Math.min(Math.max(row.pct, 0), 100)}%`,
                            borderRadius: 4,
                            bgcolor: row.color,
                            transition: 'width 0.6s ease'
                          }}
                        />
                      </Box>
                    </Box>
                  ))}

                  <Box
                    sx={{
                      mt: 1,
                      p: 2,
                      borderRadius: 3,
                      bgcolor: alpha(theme.palette.error.main, 0.06),
                      border: `1px solid ${alpha(theme.palette.error.main, 0.15)}`
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'error.main', display: 'block' }}>
                      RESTE À FACTURER
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 900, mt: 0.5 }}>
                      {commandeVsFacture.notInvoiced.toLocaleString(undefined, {
                        minimumFractionDigits: 3,
                        maximumFractionDigits: 3
                      })} DT
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      {commandeVsFacture.linesNotInvoiced.toLocaleString()} ligne(s) jamais facturée(s) sur{' '}
                      {commandeVsFacture.lines.toLocaleString()} · {commandeVsFacture.orders.toLocaleString()} commande(s),
                      dont {commandeVsFacture.ordersPartiallyInvoiced.toLocaleString()} partiellement facturée(s)
                    </Typography>
                  </Box>
                </Stack>
              </PremiumCard>
            )}

          </Stack>
        </Grid>

      </Grid>

      {/* C0082 Bottom Logout Option (For redundancy) */}
      {isC0082 && (
        <Box sx={{ display: 'none' }}>
          <Button onClick={async () => { await signOut({ redirect: false }); window.location.href = '/login'; }} />
        </Box>
      )}

      {/* Glassmorphic Loading Backdrop for Excel Export */}
      <Backdrop
        open={exportLoading}
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 999,
          backdropFilter: 'blur(8px)',
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
          transition: 'all 0.3s ease'
        }}
      >
        <Box
          sx={{
            bgcolor: theme.palette.mode === 'dark' ? '#1e293b' : '#ffffff',
            color: 'text.primary',
            p: 4,
            borderRadius: '24px',
            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.15), 0 8px 10px -6px rgb(0 0 0 / 0.15)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            maxWidth: '380px',
            textAlign: 'center',
            border: '1px solid',
            borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'
          }}
        >
          <CircularProgress size={40} thickness={4.5} sx={{ color: '#10b981', mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.5px' }}>
            Génération du rapport
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, lineHeight: 1.5 }}>
            Préparation du fichier Excel pour le statut <strong>{exportStatusLabel}</strong> en cours. Veuillez patienter...
          </Typography>
          {exportProgress && (
            <Typography variant="caption" sx={{ mt: 1.5, color: '#10b981', fontWeight: 700, letterSpacing: '0.3px' }}>
              {exportProgress}
            </Typography>
          )}
        </Box>
      </Backdrop>

      {/* Top 100 articles sur commandes validées */}
      <Dialog
        open={articlesModalOpen}
        onClose={() => setArticlesModalOpen(false)}
        maxWidth="md"
        fullWidth
        slotProps={{
          backdrop: {
            sx: { backdropFilter: 'blur(8px)', backgroundColor: 'rgba(15, 23, 42, 0.3)' }
          }
        }}
        PaperProps={{ sx: { borderRadius: '20px' } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 900 }}>
                Top 100 Articles
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block' }}>
                Commandes validées du {startDate} au {endDate}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Articles sans montant (lignes non valorisées ou vidées) exclus
              </Typography>
            </Box>
            <Tabs
              value={articlesTab}
              onChange={(_, val) => setArticlesTab(val)}
              sx={{
                minHeight: 'auto',
                '& .MuiTab-root': {
                  minHeight: 'auto',
                  py: 0.5,
                  px: 1.5,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  borderRadius: '20px'
                },
                '& .MuiTabs-indicator': { display: 'none' },
                '& .Mui-selected': {
                  backgroundColor: theme.palette.mode === 'dark' ? '#1e293b' : '#e2e8f0',
                  color: theme.palette.text.primary + ' !important'
                }
              }}
            >
              <Tab value="quantity" label="Quantité" />
              <Tab value="revenue" label="Chiffre d'affaires" />
            </Tabs>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, maxHeight: 520 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 900, width: 60 }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 900 }}>Référence</TableCell>
                  <TableCell sx={{ fontWeight: 900 }}>Désignation</TableCell>
                  <TableCell sx={{ fontWeight: 900 }}>Groupe remise</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 900 }}>Quantité</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 900 }}>PU moyen (DT)</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 900 }}>Total (DT)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentTopArticles.slice(0, 100).map((article, idx) => (
                  <TableRow key={`${article.number}-${idx}`} hover>
                    <TableCell sx={{ fontWeight: 800, color: 'text.secondary' }}>{idx + 1}</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontFamily: 'monospace' }}>{article.number}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{article.description || '-'}</TableCell>
                    <TableCell>
                      {article.discountGroup ? (
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Box
                            component="span"
                            sx={{
                              px: 1,
                              py: 0.25,
                              borderRadius: 1,
                              fontSize: '0.7rem',
                              fontWeight: 800,
                              bgcolor: theme.palette.mode === 'dark' ? '#1e293b' : '#e2e8f0',
                              color: 'text.primary',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {article.discountGroup}
                          </Box>
                          {article.discountGroupName && (
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                              {article.discountGroupName}
                            </Typography>
                          )}
                        </Stack>
                      ) : (
                        <Typography variant="caption" color="text.secondary">-</Typography>
                      )}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800, color: articlesTab === 'quantity' ? '#10b981' : 'inherit' }}>
                      {Math.abs(article.purchasesQty || 0).toLocaleString()}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                      {(
                        article.unitPrice ??
                        (Math.abs(article.purchasesQty || 0) > 0
                          ? Math.abs(article.purchasesLCY || 0) / Math.abs(article.purchasesQty || 0)
                          : 0)
                      ).toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800, color: articlesTab === 'revenue' ? '#f43f5e' : 'inherit' }}>
                      {Math.abs(article.purchasesLCY || 0).toLocaleString(undefined, {
                        minimumFractionDigits: 3,
                        maximumFractionDigits: 3
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
          <Button
            onClick={handleExportArticlesExcel}
            disabled={exportLoading}
            variant="outlined"
            color="success"
            sx={{ borderRadius: 2, fontWeight: 800 }}
          >
            {exportLoading ? 'Export en cours...' : 'Exporter Excel (tous les articles)'}
          </Button>
          <Button onClick={() => setArticlesModalOpen(false)} variant="contained" sx={{ borderRadius: 2, fontWeight: 800 }}>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog showing Cue Details */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
        slotProps={{
          backdrop: {
            sx: {
              backdropFilter: 'blur(8px)',
              backgroundColor: 'rgba(15, 23, 42, 0.3)'
            }
          }
        }}
        PaperProps={{
          sx: {
            borderRadius: '20px',
            boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
            border: '1px solid',
            borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.25rem', pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
          {detailsTitle}
        </DialogTitle>
        <DialogContent sx={{ p: 3, minHeight: '200px', display: 'flex', flexDirection: 'column' }}>
          {detailsLoading ? (
            <Box sx={{ display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center', py: 6 }}>
              <CircularProgress size={35} sx={{ color: 'primary.main' }} />
            </Box>
          ) : detailsData.length === 0 ? (
            <Box sx={{ display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center', py: 6 }}>
              <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                Aucun document trouvé pour cette catégorie aujourd'hui.
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} sx={{ mt: 1, maxHeight: '60vh', overflowY: 'auto', boxShadow: 'none', border: '1px solid', borderColor: 'divider', borderRadius: '12px' }}>
              <Table size="small" stickyHeader>
                <TableHead sx={{ bgcolor: theme.palette.mode === 'dark' ? '#1e293b' : '#f8fafc' }}>
                  <TableRow>
                    <TableCell width="40px" />
                    {detailsType === 'ca' && (
                      <>
                        <TableCell sx={{ fontWeight: 800 }}>N° Facture</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>Client</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>Date Facture</TableCell>
                        <TableCell sx={{ fontWeight: 800 }} align="right">Total HT</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>Statut</TableCell>
                      </>
                    )}
                    {detailsType === 'achat' && (
                      <>
                        <TableCell sx={{ fontWeight: 800 }}>N° Facture</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>Fournisseur</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>Date Facture</TableCell>
                        <TableCell sx={{ fontWeight: 800 }} align="right">Total HT</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>Statut</TableCell>
                      </>
                    )}
                    {detailsType === 'commandes' && (
                      <>
                        <TableCell sx={{ fontWeight: 800 }}>N° Commande</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>Fournisseur</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>Date Document</TableCell>
                        <TableCell sx={{ fontWeight: 800 }} align="right">Total HT</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>Assurance</TableCell>
                      </>
                    )}
                    {detailsType === 'non-payees' && (
                      <>
                        <TableCell sx={{ fontWeight: 800 }}>N° Facture</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>Client</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>Date Échéance</TableCell>
                        <TableCell sx={{ fontWeight: 800 }} align="right">Total HT</TableCell>
                        <TableCell sx={{ fontWeight: 800 }} align="right">Reste à Payer</TableCell>
                      </>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {detailsData.map((row, idx) => (
                    <CollapsibleRow key={idx} row={row} type={detailsType} />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button variant="outlined" color="secondary" onClick={() => setDetailsOpen(false)} sx={{ borderRadius: '10px', px: 3 }}>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>

    </PageContainer>
  );
}


