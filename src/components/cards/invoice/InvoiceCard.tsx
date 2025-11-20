// material-ui
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// assets
import { ArrowDown3, ArrowUp3 } from '@wandersonalwes/iconsax-react';

interface Props {
  title: string;
  count: string;
  percentage?: number;
  isLoss?: boolean;
  color?: any;
  children: any;
  invoice: string;
}

// ==============================|| INVOICE - CARD  ||============================== //

export default function TableWidgetCard({ color, title, count, percentage, isLoss, children, invoice }: Props) {
  return (
    <Grid container direction="row" spacing={2}>
      <Grid size={{ xs: 12, md: 5 }}>
        <Stack direction="column" sx={{ gap: 2 }}>
          <Typography variant="subtitle1">{title}</Typography>
          <Stack direction="column" sx={{ gap: 1 }}>
            <Typography variant="h4" color="inherit">
              {count}
            </Typography>
            <Stack direction="row" sx={{ gap: 1 }}>
              <Typography variant="subtitle1">{invoice}</Typography>
              <Typography color="secondary">invoices</Typography>
            </Stack>
          </Stack>
        </Stack>
      </Grid>
      <Grid size={{ xs: 12, md: 7 }}>
        <Box>
          <Stack sx={{ alignItems: 'flex-end' }}>
            {percentage && (
              <Stack direction="row" sx={{ gap: 1, alignItems: 'center', ml: 1.25, pl: 1 }}>
                {!isLoss && <ArrowUp3 variant="Bold" style={{ fontSize: '0.75rem', color }} />}
                {isLoss && <ArrowDown3 variant="Bold" style={{ fontSize: '0.75rem', color }} />}
                <Typography color="secondary">{percentage}%</Typography>
              </Stack>
            )}
            <Box sx={{ width: 1, height: 1 }}>{children}</Box>
          </Stack>
        </Box>
      </Grid>
    </Grid>
  );
}
