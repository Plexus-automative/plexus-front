'use client';

// material-ui
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';

// project-imports
import { GRID_COMMON_SPACING } from 'config';

import NewOrders from 'sections/widget/chart/NewOrders';
import NewUsers from 'sections/widget/chart/NewUsers';
import Visitors from 'sections/widget/chart/Visitors';

import DropboxStorage from 'sections/widget/statistics/DropboxStorage';
import SwitchBalanace from 'sections/widget/statistics/SwitchBalanace';

import ProjectAnalytics from 'sections/widget/chart/ProjectAnalytics';

import EcommerceIncome from 'sections/widget/chart/EcommerceIncome';
import LanguagesSupport from 'sections/widget/chart/LanguagesSupport';

import ProductOverview from 'sections/widget/chart/ProductOverview';

import PaymentHistory from 'sections/widget/data/PaymentHistory';
import EcommerceRadial from 'sections/widget/chart/EcommerceRadial';

// ==============================|| DASHBOARD - ANALYTICS ||============================== //

export default function DashboardAnalytics() {
  return (
    <Grid container spacing={GRID_COMMON_SPACING}>
      {/* row 1 */}
      <Grid size={{ xs: 12, md: 4, lg: 3 }}>
        <NewOrders />
      </Grid>
      <Grid size={{ xs: 12, md: 4, lg: 3 }}>
        <NewUsers />
      </Grid>
      <Grid size={{ xs: 12, md: 4, lg: 3 }}>
        <Visitors />
      </Grid>
      <Grid size={{ xs: 12, md: 4, lg: 3 }}>
        <Grid container spacing={GRID_COMMON_SPACING}>
          <Grid size={12}>
            <DropboxStorage />
          </Grid>
          <Grid size={12}>
            <SwitchBalanace />
          </Grid>
        </Grid>
      </Grid>
      {/* row 2 */}
      <Grid size={12}>
        <ProjectAnalytics />
      </Grid>
      {/* row 3 */}
      <Grid size={{ xs: 12, lg: 3 }}>
        <Grid container spacing={GRID_COMMON_SPACING}>
          <Grid size={{ xs: 12, md: 6, lg: 12 }}>
            <EcommerceIncome />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 12 }}>
            <LanguagesSupport />
          </Grid>
        </Grid>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <ProductOverview />
      </Grid>
      <Grid size={{ xs: 12, lg: 3 }}>
        <Grid container spacing={GRID_COMMON_SPACING}>
          <Grid size={{ xs: 12, md: 6, lg: 12 }}>
            <PaymentHistory />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 12 }}>
            <Stack sx={{ gap: GRID_COMMON_SPACING }}>
              <EcommerceRadial color="primary.main" />
              <EcommerceRadial color="error.dark" />
            </Stack>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
