// material-ui
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';

// project-imports
import MainCard from 'components/MainCard';

// ==============================|| DASHBOARD - CALENDAR ||============================== //

export default function DashboardCalendar() {
  return (
    <MainCard content={false} sx={{ height: 1 }}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DateCalendar />
      </LocalizationProvider>
    </MainCard>
  );
}
