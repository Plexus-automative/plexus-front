'use client';

import { useState } from 'react';

// material-ui
import Stack from '@mui/material/Stack';

import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';

// project-imports
import MainCard from 'components/MainCard';

// assets
import { Calendar, Clock } from '@wandersonalwes/iconsax-react';

// ==============================|| DATE PICKER - BASIC ||============================== //

export default function BasicDateTimePickers() {
  const [value, setValue] = useState<Date | null>(new Date('2014-08-18T21:11:54'));

  const basicDatepickerCodeString = `<LocalizationProvider dateAdapter={AdapterDateFns}>
   <Stack sx={{ gap: 3 }}>
      <DesktopDatePicker
        format="MM/dd/yyyy"
        value={value}
        onChange={(newValue) => setValue(newValue as Date | null)}
        slots={{ openPickerIcon: () => <Calendar /> }}
      />
      <MobileDatePicker
        format="MM/dd/yyyy"
        value={value}
        onChange={(newValue) => setValue(newValue as Date | null)}
        slots={{ openPickerIcon: () => <Calendar /> }}
      />
      <TimePicker
        value={value}
        onChange={(newValue) => setValue(newValue as Date | null)}
        slots={{ openPickerIcon: () => <Clock /> }}
      />
      <DateTimePicker
        value={value}
        onChange={(newValue) => setValue(newValue as Date | null)}
        slots={{ openPickerIcon: () => <Calendar /> }}
      />
    </Stack>
  </LocalizationProvider>`;

  return (
    <MainCard title="Basic Picker" codeString={basicDatepickerCodeString}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Stack sx={{ gap: 3 }}>
          <DesktopDatePicker
            format="MM/dd/yyyy"
            value={value}
            onChange={(newValue) => setValue(newValue as Date | null)}
            slots={{ openPickerIcon: () => <Calendar /> }}
          />
          <MobileDatePicker
            format="MM/dd/yyyy"
            value={value}
            onChange={(newValue) => setValue(newValue as Date | null)}
            slots={{ openPickerIcon: () => <Calendar /> }}
          />
          <TimePicker
            value={value}
            onChange={(newValue) => setValue(newValue as Date | null)}
            slots={{ openPickerIcon: () => <Clock /> }}
          />
          <DateTimePicker
            value={value}
            onChange={(newValue) => setValue(newValue as Date | null)}
            slots={{ openPickerIcon: () => <Calendar /> }}
          />
        </Stack>
      </LocalizationProvider>
    </MainCard>
  );
}
