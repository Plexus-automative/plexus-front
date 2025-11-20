// material-ui
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

// project-imports
import MainCard from 'components/MainCard';

// ==============================|| DATE PICKER - NATIVE ||============================== //

export default function NativePickers() {
  const nativeDatepickerCodeString = `<TextField
  id="date"
  placeholder="Birthday"
  type="date"
  defaultValue="2017-05-24"
  sx={{ width: 220 }}
  slotProps={{ inputLabel: { shrink: true } }}
/>
<TextField
  id="time"
  placeholder="Alarm Clock"
  type="time"
  defaultValue="07:30"
  slotProps={{ htmlInput: { step: 300 }, inputLabel: { shrink: true } }}
  sx={{ width: 150 }}
/>
<TextField
  id="datetime-local"
  placeholder="Next Appointment"
  type="datetime-local"
  defaultValue="2017-05-24T10:30"
  sx={{ width: 250 }}
  slotProps={{ inputLabel: { shrink: true } }}
/>`;

  return (
    <MainCard title="Native Picker" codeString={nativeDatepickerCodeString}>
      <Stack component="form" noValidate sx={{ gap: 3 }}>
        <TextField
          id="date"
          placeholder="Birthday"
          type="date"
          defaultValue="2017-05-24"
          sx={{ width: 220 }}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField
          id="time"
          placeholder="Alarm Clock"
          type="time"
          defaultValue="07:30"
          sx={{ width: 150 }}
          slotProps={{ htmlInput: { step: 300 }, inputLabel: { shrink: true } }}
        />
        <TextField
          id="datetime-local"
          placeholder="Next Appointment"
          type="datetime-local"
          defaultValue="2017-05-24T10:30"
          sx={{ width: 250 }}
          slotProps={{ inputLabel: { shrink: true } }}
        />
      </Stack>
    </MainCard>
  );
}
