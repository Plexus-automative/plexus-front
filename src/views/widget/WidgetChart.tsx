'use client';

import { useState, MouseEvent } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project-imports
import IconButton from 'components/@extended/IconButton';
import MainCard from 'components/MainCard';
import { GRID_COMMON_SPACING } from 'config';

import SalesChart from 'sections/dashboard/SalesChart';
import AcquisitionChannels from 'sections/dashboard/analytics/AcquisitionChannels';

import EcommerceDataCard from 'components/cards/statistics/EcommerceDataCard';
import EcommerceDataChart from 'sections/widget/chart/EcommerceDataChart';

import RepeatCustomerRate from 'sections/widget/chart/RepeatCustomerRate';
import ProjectOverview from 'sections/widget/chart/ProjectOverview';
import EcommerceIncome from 'sections/widget/chart/EcommerceIncome';
import EcommerceRadial from 'sections/widget/chart/EcommerceRadial';

import NewOrders from 'sections/widget/chart/NewOrders';
import NewUsers from 'sections/widget/chart/NewUsers';
import Visitors from 'sections/widget/chart/Visitors';

import ProjectAnalytics from 'sections/widget/chart/ProjectAnalytics';

import ProductOverview from 'sections/widget/chart/ProductOverview';
import TotalIncome from 'sections/widget/chart/TotalIncome';

import LanguagesSupport from 'sections/widget/chart/LanguagesSupport';
import MonthlyReport from 'sections/widget/chart/MonthlyReport';

import IncomeChart from 'sections/dashboard/analytics/IncomeChart';

// assets
import { ArrowDown, ArrowDown2, ArrowUp, Book, Calendar, CloudChange, DocumentDownload, Wallet3 } from '@wandersonalwes/iconsax-react';

// ==============================|| WIDGET - CHARTS ||============================== //

export default function WidgetChart() {
  const theme = useTheme();
  const [slot, setSlot] = useState('week');
  const [quantity, setQuantity] = useState('By volume');

  const handleQuantity = (e: SelectChangeEvent) => {
    setQuantity(e.target.value as string);
  };

  const handleChange = (event: MouseEvent<HTMLElement>, newAlignment: string) => {
    if (newAlignment) setSlot(newAlignment);
  };

  return (
    <Grid container spacing={GRID_COMMON_SPACING}>
      {/* row 1 */}
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <EcommerceDataCard
          title="All Earnings"
          count="$3200"
          iconPrimary={<Wallet3 />}
          percentage={
            <Typography color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <ArrowUp size={16} style={{ transform: 'rotate(45deg)' }} /> 30.6%
            </Typography>
          }
        >
          <EcommerceDataChart color={theme.palette.primary.main} />
        </EcommerceDataCard>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <EcommerceDataCard
          title="Page Views"
          count="290+"
          color="warning"
          iconPrimary={<Book />}
          percentage={
            <Typography sx={{ color: 'warning.main', display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <ArrowDown size={16} style={{ transform: 'rotate(-45deg)' }} /> 30.6%
            </Typography>
          }
        >
          <EcommerceDataChart color={theme.palette.warning.main} />
        </EcommerceDataCard>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <EcommerceDataCard
          title="Total Task"
          count="1468"
          color="success"
          iconPrimary={<Calendar />}
          percentage={
            <Typography sx={{ color: 'success.main', display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <ArrowUp size={16} style={{ transform: 'rotate(45deg)' }} /> 30.6%
            </Typography>
          }
        >
          <EcommerceDataChart color={theme.palette.success.main} />
        </EcommerceDataCard>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <EcommerceDataCard
          title="Download"
          count="$300"
          color="error"
          iconPrimary={<CloudChange />}
          percentage={
            <Typography sx={{ color: 'error.dark', display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <ArrowDown size={16} style={{ transform: 'rotate(45deg)' }} /> 30.6%
            </Typography>
          }
        >
          <EcommerceDataChart color={theme.palette.error.dark} />
        </EcommerceDataCard>
      </Grid>
      {/* row 2 */}
      <Grid size={{ xs: 12, md: 8, lg: 9 }}>
        <Grid container spacing={GRID_COMMON_SPACING}>
          <Grid size={12}>
            <RepeatCustomerRate />
          </Grid>
          <Grid size={12}>
            <ProjectOverview />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <EcommerceIncome />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack sx={{ gap: 3, height: 1, justifyContent: 'space-between' }}>
              <EcommerceRadial color="primary.main" />
              <EcommerceRadial color="error.dark" />
            </Stack>
          </Grid>
        </Grid>
      </Grid>
      <Grid size={{ xs: 12, md: 4, lg: 3 }}>
        <Stack sx={{ gap: GRID_COMMON_SPACING }}>
          <NewOrders />
          <NewUsers />
          <Visitors />
        </Stack>
      </Grid>
      {/* row 3 */}
      <Grid size={12}>
        <ProjectAnalytics />
      </Grid>
      {/* row 4 */}
      <Grid size={{ xs: 12, md: 6 }}>
        <ProductOverview />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TotalIncome />
      </Grid>
      {/* row 5 */}
      <Grid size={{ xs: 12, md: 4 }}>
        <LanguagesSupport />
      </Grid>
      <Grid size={{ xs: 12, md: 8 }}>
        <MonthlyReport />
      </Grid>
      {/* row 6 */}
      <Grid size={{ xs: 12, md: 7, lg: 8 }}>
        <Grid container spacing={GRID_COMMON_SPACING}>
          <Grid size={12}>
            <SalesChart />
          </Grid>
          <Grid size={12}>
            <MainCard>
              <Grid container>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Stack sx={{ alignItems: { xs: 'center', sm: 'flex-start' } }}>
                    <Typography variant="h5">Income Overview</Typography>
                    <Stack direction="row" sx={{ alignItems: 'center', mt: 2, color: 'error.main' }}>
                      <ArrowDown2 variant="Bold" style={{ paddingRight: '4px' }} />
                      <Typography>$1,12,900 (45.67%)</Typography>
                    </Stack>
                    <Typography sx={{ color: 'text.secondary', display: 'block' }}>Compare to : 01 Dec 2021-08 Jan 2022</Typography>
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Stack direction="row" sx={{ gap: 1, alignItems: 'center', justifyContent: { xs: 'center', sm: 'flex-end' }, mr: 2 }}>
                    <ToggleButtonGroup exclusive onChange={handleChange} value={slot}>
                      <ToggleButton
                        disabled={slot === 'week'}
                        value="week"
                        sx={{ px: 2, py: 0.5, '&.Mui-disabled': { color: 'secondary.main' } }}
                      >
                        Week
                      </ToggleButton>
                      <ToggleButton
                        disabled={slot === 'month'}
                        value="month"
                        sx={{ px: 2, py: 0.5, '&.Mui-disabled': { color: 'secondary.main' } }}
                      >
                        Month
                      </ToggleButton>
                    </ToggleButtonGroup>
                    <Select value={quantity} onChange={handleQuantity} size="small">
                      <MenuItem value="By volume">By Volume</MenuItem>
                      <MenuItem value="By margin">By Margin</MenuItem>
                      <MenuItem value="By sales">By Sales</MenuItem>
                    </Select>
                    <IconButton
                      sx={{
                        color: 'secondary.darker',
                        border: '1px solid',
                        borderColor: 'secondary.400',
                        '&:hover': { backgroundColor: 'transparent' }
                      }}
                    >
                      <DocumentDownload />
                    </IconButton>
                  </Stack>
                </Grid>
              </Grid>
              <Box sx={{ pt: 1 }}>
                <IncomeChart slot={slot} quantity={quantity} />
              </Box>
            </MainCard>
          </Grid>
        </Grid>
      </Grid>
      <Grid size={{ xs: 12, md: 5, lg: 4 }}>
        <AcquisitionChannels />
      </Grid>
    </Grid>
  );
}
