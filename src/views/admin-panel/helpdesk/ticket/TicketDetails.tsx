// material-ui
import Grid from '@mui/material/Grid';

// project-imports
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import { APP_DEFAULT_PATH, GRID_COMMON_SPACING } from 'config';

import TicketDetailsCard from 'sections/admin-panel/helpdesk/ticket/details/TicketDetailsCard';
import TicketDetailsSideCard from 'sections/admin-panel/helpdesk/ticket/details/TicketDetailsSideCard';

// ==============================|| HELPDESK - TICKET DETAILS ||============================== //

export default function TicketDetails() {
  const breadcrumbLinks = [
    { title: 'home', to: APP_DEFAULT_PATH },
    { title: 'helpdesk', to: '/admin-panel/helpdesk/ticket/details' },
    { title: 'ticket details' }
  ];

  return (
    <>
      <Breadcrumbs custom heading="ticket details" links={breadcrumbLinks} />
      <Grid container spacing={GRID_COMMON_SPACING}>
        <Grid size={{ xs: 12, md: 8 }}>
          <TicketDetailsCard />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <TicketDetailsSideCard />
        </Grid>
      </Grid>
    </>
  );
}
