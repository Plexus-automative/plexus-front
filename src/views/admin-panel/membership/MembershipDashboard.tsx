// material-ui
import Grid from '@mui/material/Grid';

// project-imports
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import RoundIconCard from 'components/cards/statistics/RoundIconCard';

import { APP_DEFAULT_PATH, GRID_COMMON_SPACING } from 'config';
import { dashboardWidgetData } from 'data/membership';

import Activity from 'sections/admin-panel/membership/dashboard/Activity';
import CalendarEventsCard from 'sections/admin-panel/membership/dashboard/CalendarEventsCard';
import LatestSignupList from 'sections/admin-panel/membership/dashboard/LatestSignupList';
import MembershipState from 'sections/admin-panel/membership/dashboard/MembershipState';
import Notifications from 'sections/admin-panel/membership/dashboard/Notifications';
import RevenueAnalytics from 'sections/admin-panel/membership/dashboard/RevenueAnalytics';

// ==============================|| MEMBERSHIP - DASHBOARD ||============================== //

export default function MembershipDashboard() {
  const breadcrumbLinks = [
    { title: 'home', to: APP_DEFAULT_PATH },
    { title: 'membership', to: '/admin-panel/membership/dashboard' },
    { title: 'dashboard' }
  ];

  return (
    <>
      <Breadcrumbs custom heading="dashboard" links={breadcrumbLinks} />
      <Grid container spacing={GRID_COMMON_SPACING}>
        {/* row 1 */}
        {dashboardWidgetData.map((card, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, xl: 3 }}>
            <RoundIconCard
              primary={card.primary}
              secondary={card.secondary}
              content={card.content}
              iconPrimary={card.iconPrimary}
              color={card.color}
              bgcolor={card.bgcolor}
              avatarSize="md"
              circular
            />
          </Grid>
        ))}

        {/* row 2 */}
        <Grid size={{ xs: 12, md: 7 }}>
          <RevenueAnalytics />
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <CalendarEventsCard />
        </Grid>

        {/* row 3 */}
        <Grid size={{ xs: 12, md: 6, lg: 5 }}>
          <MembershipState />
        </Grid>
        <Grid size={{ xs: 12, md: 6, lg: 7 }}>
          <Activity />
        </Grid>

        {/* row 4 */}
        <Grid size={{ xs: 12, md: 7 }}>
          <LatestSignupList />
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <Notifications />
        </Grid>
      </Grid>
    </>
  );
}
