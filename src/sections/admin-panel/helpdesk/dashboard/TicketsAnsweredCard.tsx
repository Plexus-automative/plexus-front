// material-ui
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project-imports
import MainCard from 'components/MainCard';

// assets
import { Book1 } from '@wandersonalwes/iconsax-react';

// ==============================|| DASHBOARD - TICKET ANSWERED CARD ||============================== //

export default function TicketsAnsweredCard() {
  return (
    <MainCard content={false}>
      <Stack direction="row" sx={{ gap: 1.5 }}>
        <Stack
          sx={(theme) => ({
            justifyContent: 'center',
            alignItems: 'center',
            px: 6,
            py: 4,
            bgcolor: 'primary.main',
            color: 'background.paper',
            ...theme.applyStyles('dark', { color: 'text.primary' })
          })}
        >
          <Book1 size={50} />
        </Stack>
        <Stack sx={{ py: 3, gap: 1.25 }}>
          <Typography variant="h2">379</Typography>
          <Typography component="div" variant="body1" sx={{ color: 'text.secondary' }}>
            Tickets
            <Link href="#" sx={{ ml: 0.5 }}>
              Answered
            </Link>
          </Typography>
        </Stack>
      </Stack>
    </MainCard>
  );
}
