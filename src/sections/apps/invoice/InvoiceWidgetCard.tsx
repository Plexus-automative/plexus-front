// material-ui
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project-imports
import MainCard from 'components/MainCard';

// assets
import { ArrowDown2, ArrowUp2 } from '@wandersonalwes/iconsax-react';

// ==============================|| INVOICE - WIDGET CARD  ||============================== //

interface Props {
  title: string;
  count: string;
  percentage?: number;
  isLoss?: boolean;
  color?: any;
  invoice: string;
  isActive: boolean;
}

function TableWidgetCard({ color, title, count, percentage, isLoss, invoice, isActive }: Props) {
  return (
    <MainCard sx={{ height: 1, ...(isActive && { bgcolor: 'secondary.lighter', borderColor: 'secondary.lighter' }) }}>
      <Grid container spacing={1.25}>
        <Grid size={12}>
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="subtitle1">{title}</Typography>
            {percentage && (
              <Stack direction="row" sx={{ gap: 0.5, alignItems: 'center', ml: 1, pl: 0.5, color: color || 'primary.main' }}>
                {!isLoss && <ArrowUp2 variant="Bold" size={16} />}
                {isLoss && <ArrowDown2 variant="Bold" size={16} />}
                <Typography color="secondary" sx={{ fontWeight: 500 }}>
                  {percentage}%
                </Typography>
              </Stack>
            )}
          </Stack>
        </Grid>
        <Grid size={12}>
          <Stack sx={{ gap: 0.25 }}>
            <Typography variant="h5">{count}</Typography>
            <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
              <Typography variant="h5">{invoice}</Typography>
              <Typography color="secondary">invoices</Typography>
            </Stack>
          </Stack>
        </Grid>
      </Grid>
    </MainCard>
  );
}

export default TableWidgetCard;
