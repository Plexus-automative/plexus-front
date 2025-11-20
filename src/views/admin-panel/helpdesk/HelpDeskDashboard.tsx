'use client';

// material-ui
import Grid from '@mui/material/Grid';

// project-imports
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import SupportCard from 'components/cards/helpdesk/SupportCard';
import SocialSourceCard from 'components/cards/helpdesk/SocialSourceCard';

import CustomerSatisfaction from 'sections/admin-panel/helpdesk/dashboard/CustomerSatisfaction';
import LatestActivity from 'sections/admin-panel/helpdesk/dashboard/LatestActivity';
import TicketsAnsweredCard from 'sections/admin-panel/helpdesk/dashboard/TicketsAnsweredCard';

import { APP_DEFAULT_PATH, GRID_COMMON_SPACING } from 'config';
import { sourceData, supportData } from 'data/helpdesk';

// ==============================|| HELPDESK - DASHBOARD ||============================== //

export default function HelpDeskDashboard() {
  const breadcrumbLinks = [
    { title: 'home', to: APP_DEFAULT_PATH },
    { title: 'helpdesk', to: '/admin-panel/helpdesk/dashboard' },
    { title: 'dashboard' }
  ];

  return (
    <>
      <Breadcrumbs custom heading="dashboard" links={breadcrumbLinks} />
      <Grid container spacing={GRID_COMMON_SPACING}>
        {/* row 1 */}
        {supportData.map((data, index) => (
          <Grid key={index} size={{ xs: 12, sm: data.fullWidth ? 12 : 6, lg: 4 }}>
            <SupportCard
              count={data.count}
              title={data.title}
              details={data.details}
              color={data.color}
              openValue={data.open}
              runningValue={data.running}
              solvedValue={data.solved}
              chartData={data.chartData}
            />
          </Grid>
        ))}

        {/* row 2 */}
        <Grid size={{ xs: 12, sm: 6, lg: 7 }}>
          <Grid container spacing={GRID_COMMON_SPACING}>
            <Grid size={12}>
              <CustomerSatisfaction />
            </Grid>
            {sourceData.map((source, index) => (
              <Grid key={index} size={{ xs: 12, lg: 6 }}>
                <SocialSourceCard color={source.color} title={source.title} progressData={source.progressData} />
              </Grid>
            ))}
          </Grid>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 5 }}>
          <Grid container spacing={GRID_COMMON_SPACING}>
            <Grid size={12}>
              <LatestActivity />
            </Grid>
            <Grid size={12}>
              <TicketsAnsweredCard />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
