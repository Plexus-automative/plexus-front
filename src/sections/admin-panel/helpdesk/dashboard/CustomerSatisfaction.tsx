// material-ui
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project-imports
import CustomerSatisfactionChart from './CustomerSatisfactionChart';
import MainCard from 'components/MainCard';

// ==============================|| DASHBOARD - CUSTOMER SATISFACTION ||============================== //

export default function CustomerSatisfaction() {
  return (
    <MainCard>
      <Stack>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Customer Satisfaction
        </Typography>
        <Typography variant="body1">
          It takes continuous effort to maintain high customer satisfaction levels.Internal and external quality measures are often tied
          together as the opinion...
        </Typography>
        <Link href="#">Learn More..</Link>
      </Stack>
      <CustomerSatisfactionChart />
    </MainCard>
  );
}
