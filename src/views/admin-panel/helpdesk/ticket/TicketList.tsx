// material-ui
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';

// project-imports
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import TicketNotificationsCard from 'components/cards/helpdesk/TicketNotificationsCard';
import TicketListCard from 'sections/admin-panel/helpdesk/ticket/list/TicketListCard';

import { APP_DEFAULT_PATH, GRID_COMMON_SPACING } from 'config';
import { ticketNotificationsData } from 'data/helpdesk';

// ==============================|| HELPDESK - TICKET LIST ||============================== //

export default function TicketList() {
  const breadcrumbLinks = [
    { title: 'home', to: APP_DEFAULT_PATH },
    { title: 'helpdesk', to: '/admin-panel/helpdesk/ticket/list' },
    { title: 'ticket list' }
  ];

  return (
    <>
      <Breadcrumbs custom heading="ticket list" links={breadcrumbLinks} />
      <Grid container spacing={GRID_COMMON_SPACING}>
        {/* row 1 */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <TicketListCard />
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack sx={{ gap: GRID_COMMON_SPACING }}>
            {ticketNotificationsData.map((data, index) => (
              <TicketNotificationsCard key={index} title={data.title} tickets={data.notifications} />
            ))}
          </Stack>
        </Grid>
      </Grid>
    </>
  );
}
