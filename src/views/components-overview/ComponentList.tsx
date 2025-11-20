// material-ui
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project-imports
import ComponentHeader from 'components/cards/ComponentHeader';
import { GRID_COMMON_SPACING } from 'config';

import ComponentWrapper from 'sections/components-overview/ComponentWrapper';
import BasicList from 'sections/components-overview/lists/BasicList';
import InteractiveList from 'sections/components-overview/lists/InteractiveList';
import NestedList from 'sections/components-overview/lists/NestedList';
import SelectedList from 'sections/components-overview/lists/SelectedList';
import AlignList from 'sections/components-overview/lists/AlignList';
import ScrollableList from 'sections/components-overview/lists/ScrollableList';
import FolderList from 'sections/components-overview/lists/FolderList';
import TransactionList from 'sections/components-overview/lists/TransactionList';
import NotificationList from 'sections/components-overview/lists/NotificationList';
import UserList from 'sections/components-overview/lists/UserList';

// ==============================|| COMPONENTS - LIST ||============================== //

export default function ComponentList() {
  return (
    <>
      <ComponentHeader
        title="Lists"
        caption="Lists are continuous, vertical indexes of text or images."
        directory="src/pages/components-overview/lists"
        link="https://mui.com/material-ui/react-list/"
      />
      <ComponentWrapper>
        <Grid container spacing={GRID_COMMON_SPACING}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack sx={{ gap: GRID_COMMON_SPACING }}>
              <Stack sx={{ gap: 1 }}>
                <Typography variant="h5">Basic</Typography>
                <BasicList />
              </Stack>
              <Stack sx={{ gap: 1 }}>
                <Typography variant="h5">Interactive</Typography>
                <InteractiveList />
              </Stack>
              <Stack sx={{ gap: 1 }}>
                <Typography variant="h5">Scrollable</Typography>
                <ScrollableList />
              </Stack>
              <Stack sx={{ gap: 1 }}>
                <Typography variant="h5">Notification</Typography>
                <NotificationList />
              </Stack>
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack sx={{ gap: GRID_COMMON_SPACING }}>
              <Stack sx={{ gap: 1 }}>
                <Typography variant="h5">Nested</Typography>
                <NestedList />
              </Stack>
              <Stack sx={{ gap: 1 }}>
                <Typography variant="h5">Selected</Typography>
                <SelectedList />
              </Stack>
              <Stack sx={{ gap: 1 }}>
                <Typography variant="h5">Align Item</Typography>
                <AlignList />
              </Stack>
              <Stack sx={{ gap: 1 }}>
                <Typography variant="h5">Folder</Typography>
                <FolderList />
              </Stack>
              <Stack sx={{ gap: 1 }}>
                <Typography variant="h5">Transaction History</Typography>
                <TransactionList />
              </Stack>
              <Stack sx={{ gap: 1 }}>
                <Typography variant="h5">Users</Typography>
                <UserList />
              </Stack>
            </Stack>
          </Grid>
        </Grid>
      </ComponentWrapper>
    </>
  );
}
