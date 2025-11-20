// material-ui
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project-imports
import Avatar from 'components/@extended/Avatar';
import MainCard from 'components/MainCard';

// assets
import { ArchiveBook, CloseCircle, DocumentText, DollarCircle, FilterSquare, ShoppingBag } from '@wandersonalwes/iconsax-react';

// ==============================|| INVOICE - CARD ||============================== //

export default function InvoiceCard() {
  return (
    <MainCard>
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 4, sm: 2, lg: 6 }}>
          <MainCard sx={{ height: 1 }}>
            <Stack sx={{ gap: 2, alignItems: 'center' }}>
              <Avatar size="md" type="filled">
                <DocumentText variant="Bold" />
              </Avatar>
              <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
                All Invoices
              </Typography>
            </Stack>
          </MainCard>
        </Grid>
        <Grid size={{ xs: 4, sm: 2, lg: 6 }}>
          <MainCard sx={{ height: 1 }}>
            <Stack sx={{ gap: 2, alignItems: 'center' }}>
              <Avatar size="md" type="filled" color="info">
                <ArchiveBook variant="Bold" />
              </Avatar>
              <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
                Reports
              </Typography>
            </Stack>
          </MainCard>
        </Grid>
        <Grid size={{ xs: 4, sm: 2, lg: 6 }}>
          <MainCard sx={{ height: 1 }}>
            <Stack sx={{ gap: 2, alignItems: 'center' }}>
              <Avatar size="md" type="filled" color="success">
                <DollarCircle variant="Bold" />
              </Avatar>
              <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
                Paid
              </Typography>
            </Stack>
          </MainCard>
        </Grid>
        <Grid size={{ xs: 4, sm: 2, lg: 6 }}>
          <MainCard sx={{ height: 1 }}>
            <Stack sx={{ gap: 2, alignItems: 'center' }}>
              <Avatar size="md" type="filled" color="warning">
                <FilterSquare variant="Bold" />
              </Avatar>
              <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
                Pending
              </Typography>
            </Stack>
          </MainCard>
        </Grid>
        <Grid size={{ xs: 4, sm: 2, lg: 6 }}>
          <MainCard sx={{ height: 1 }}>
            <Stack sx={{ gap: 2, alignItems: 'center' }}>
              <Avatar size="md" type="filled" color="error">
                <CloseCircle variant="Bold" />
              </Avatar>
              <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
                Cancelled
              </Typography>
            </Stack>
          </MainCard>
        </Grid>
        <Grid size={{ xs: 4, sm: 2, lg: 6 }}>
          <MainCard sx={{ height: 1 }}>
            <Stack sx={{ gap: 2, alignItems: 'center' }}>
              <Avatar size="md" type="filled">
                <ShoppingBag variant="Bold" />
              </Avatar>
              <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
                Draft
              </Typography>
            </Stack>
          </MainCard>
        </Grid>
      </Grid>
    </MainCard>
  );
}
