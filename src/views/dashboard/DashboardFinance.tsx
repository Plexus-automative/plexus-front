'use client';

// material-ui
import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Grid';

// project-imports
import { GRID_COMMON_SPACING } from 'config';

import AccountsCard from 'sections/dashboard/finance/Accounts';
import BalanceCard from 'sections/dashboard/finance/BalanceCard';
import CategoryCard from 'sections/dashboard/finance/Category';
import CashflowChartCard from 'sections/dashboard/finance/CashflowChartCard';
import MoneySpentCard from 'sections/dashboard/finance/MoneySpent';
import Transactions from 'sections/dashboard/finance/Transactions';
import TransactionCard from 'sections/dashboard/finance/TransactionsCard';
import TransactionHistoryCard from 'sections/dashboard/finance/TransactionHistory';
import QuickTransferCard from 'sections/dashboard/finance/QuickTransfer';

// ==============================|| DASHBOARD - FINANCE ||============================== //

export default function DashboardFinance() {
  const theme = useTheme();

  return (
    <Grid container spacing={GRID_COMMON_SPACING}>
      <Grid size={{ xs: 12, lg: 4 }}>
        <Grid container spacing={GRID_COMMON_SPACING}>
          <Grid size={{ xs: 12, sm: 6, lg: 12 }}>
            <BalanceCard />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 12 }}>
            <Transactions />
          </Grid>
        </Grid>
      </Grid>
      <Grid size={{ xs: 12, lg: 8 }}>
        <Grid container spacing={GRID_COMMON_SPACING}>
          <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
            <TransactionCard
              title="Total Balance"
              caption="Apr 01 - Mar 31 (2023)"
              color={theme.palette.primary.main}
              data={[0, 70, 70, 120, 120, 120, 80, 80, 0, 0, 130, 130, 199, 199, 199]}
              amount="650k"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
            <TransactionCard
              title="Total Expends"
              caption="Apr 01 - Mar 31 (2023)"
              color={theme.palette.success.main}
              data={[180, 110, 110, 50, 50, 80, 80, 80, 100, 100, 199, 50, 50, 0, 0]}
              amount="510k"
            />
          </Grid>
          <Grid size={{ xs: 12, lg: 4 }}>
            <TransactionCard
              title="Total Expends"
              caption="Apr 01 - Mar 31 (2023)"
              color={theme.palette.error.main}
              data={[70, 199, 199, 130, 130, 130, 0, 140, 140, 80, 80, 20, 70, 70]}
              amount="862k"
            />
          </Grid>
          <Grid size={12}>
            <CashflowChartCard />
          </Grid>
          <Grid size={12}>
            <MoneySpentCard />
          </Grid>
        </Grid>
      </Grid>
      <Grid size={{ xs: 12, lg: 4 }}>
        <AccountsCard />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
        <QuickTransferCard />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
        <CategoryCard />
      </Grid>
      <Grid size={{ xs: 12, lg: 12 }}>
        <TransactionHistoryCard />
      </Grid>
    </Grid>
  );
}
