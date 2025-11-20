// next
import Link from 'next/link';

// material-ui
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Links from '@mui/material/Link';
import Typography from '@mui/material/Typography';

// project-imports
import Avatar from 'components/@extended/Avatar';
import MoreIcon from 'components/@extended/MoreIcon';
import MainCard from 'components/MainCard';

// assets
import { DocumentDownload, DocumentText, Link1, Setting3 } from '@wandersonalwes/iconsax-react';

// ==============================|| INVOICE - NOTIFICATIONS ||============================== //

export default function InvoiceNotificationList() {
  return (
    <MainCard
      title="Notification"
      secondary={
        <IconButton edge="end" aria-label="comments" color="secondary" sx={{ transform: 'rotate(90deg)' }}>
          <MoreIcon />
        </IconButton>
      }
    >
      <Grid container spacing={3} sx={{ alignItems: 'center' }}>
        <Grid size={12}>
          <Grid container spacing={2} sx={{ alignItems: 'center' }}>
            <Grid>
              <Avatar alt="User 1" color="success">
                <DocumentDownload />
              </Avatar>
            </Grid>
            <Grid size="grow">
              <Typography variant="subtitle1">
                Johnny sent you an invoice billed{' '}
                <Links component={Link} href="#" underline="hover">
                  $1,000.
                </Links>
              </Typography>
              <Typography variant="caption" color="secondary">
                2 August
              </Typography>
            </Grid>
            <Grid sx={{ color: 'text.secondary' }}>
              <Link1 size={18} />
            </Grid>
          </Grid>
        </Grid>
        <Grid size={12}>
          <Grid container spacing={2} sx={{ alignItems: 'center' }}>
            <Grid>
              <Avatar alt="User 2">
                <DocumentText />
              </Avatar>
            </Grid>
            <Grid size="grow">
              <Typography variant="subtitle1">
                Sent an invoice to Aida Bugg amount of{' '}
                <Links component={Link} href="#" underline="hover">
                  $200.
                </Links>
              </Typography>
              <Typography variant="caption" color="secondary">
                7 hours ago
              </Typography>
            </Grid>
            <Grid sx={{ color: 'text.secondary' }}>
              <Link1 size={18} />
            </Grid>
          </Grid>
        </Grid>
        <Grid size={12}>
          <Grid container spacing={2} sx={{ alignItems: 'center' }}>
            <Grid>
              <Avatar alt="User 2" color="error">
                <Setting3 />
              </Avatar>
            </Grid>
            <Grid size="grow">
              <Typography variant="subtitle1">There was a failure to your setup</Typography>
              <Typography variant="caption" color="secondary">
                7 hours ago
              </Typography>
            </Grid>
            <Grid sx={{ color: 'text.secondary' }}>
              <Link1 size={18} />
            </Grid>
          </Grid>
        </Grid>
        <Grid size={12}>
          <Grid container spacing={2} sx={{ alignItems: 'center' }}>
            <Grid>
              <Avatar alt="User 2">C</Avatar>
            </Grid>
            <Grid size="grow">
              <Typography variant="subtitle1">Cristina danny invited to you join Meeting</Typography>
              <Typography variant="caption" color="secondary">
                7 hours ago
              </Typography>
            </Grid>
            <Grid sx={{ color: 'text.secondary' }}>
              <Link1 size={18} />
            </Grid>
          </Grid>
        </Grid>
        <Grid size={12}>
          <Grid container spacing={2} sx={{ alignItems: 'center' }}>
            <Grid>
              <Avatar alt="User 2">C</Avatar>
            </Grid>
            <Grid size="grow">
              <Typography variant="subtitle1">Cristina danny invited to you join Meeting</Typography>
              <Typography variant="caption" color="secondary">
                7 hours ago
              </Typography>
            </Grid>
            <Grid sx={{ color: 'text.secondary' }}>
              <Link1 size={18} />
            </Grid>
          </Grid>
        </Grid>

        <Grid size={12}>
          <Button fullWidth variant="outlined" color="secondary">
            View All
          </Button>
        </Grid>
      </Grid>
    </MainCard>
  );
}
