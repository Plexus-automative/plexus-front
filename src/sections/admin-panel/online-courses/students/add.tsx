'use client';

import { useState } from 'react';

// material-ui
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// project-imports
import MainCard from 'components/MainCard';

// ==============================|| ONLINE COURSES - ADD STUDENT ||============================== //

export default function AddStudent() {
  const [value, setValue] = useState('male');
  const [course, setCourse] = useState('course');

  const handleChange = (event: SelectChangeEvent) => {
    setValue(event.target.value);
  };

  const handleCourse = (event: SelectChangeEvent) => {
    setCourse(event.target.value);
  };

  return (
    <MainCard title="Basic Information" contentSX={{ p: 2.5 }}>
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Stack sx={{ gap: 1 }}>
            <InputLabel htmlFor="first-name">First Name</InputLabel>
            <TextField fullWidth id="first-name" placeholder="Enter first name" autoFocus />
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Stack sx={{ gap: 1 }}>
            <InputLabel htmlFor="last-name">Last Name</InputLabel>
            <TextField fullWidth id="last-name" placeholder="Enter last name" />
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Stack sx={{ gap: 1 }}>
            <InputLabel htmlFor="email">Email</InputLabel>
            <TextField fullWidth id="email" placeholder="Enter email" type="email" />
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Stack sx={{ gap: 1 }}>
            <InputLabel>Registration Date</InputLabel>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker />
            </LocalizationProvider>
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Stack sx={{ gap: 1 }}>
            <InputLabel htmlFor="id-number">ID Number</InputLabel>
            <TextField fullWidth id="id-number" placeholder="Enter ID Number" type="number" />
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Stack sx={{ gap: 1 }}>
            <InputLabel id="course-select">Course</InputLabel>
            <Select value={course} onChange={handleCourse} labelId="course-select">
              <MenuItem value="course">Course</MenuItem>
              <MenuItem value="course1">Course1</MenuItem>
              <MenuItem value="course2">Course2</MenuItem>
            </Select>
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Stack sx={{ gap: 1 }}>
            <InputLabel htmlFor="mobile-number">Mobile Number</InputLabel>
            <TextField fullWidth id="mobile-number" placeholder="Enter mobile number" type="tel" />
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Stack sx={{ gap: 1 }}>
            <InputLabel id="gender-label">Gender</InputLabel>
            <Select value={value} onChange={handleChange} id="gender" labelId="gender-label">
              <MenuItem value="female">Female</MenuItem>
              <MenuItem value="male">Male</MenuItem>
            </Select>
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Stack sx={{ gap: 1 }}>
            <InputLabel htmlFor="parent-name">Parents Name</InputLabel>
            <TextField fullWidth id="parent-name" placeholder="Enter parents name" />
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Stack sx={{ gap: 1 }}>
            <InputLabel htmlFor="parent-mobile">Parents Mobile Number</InputLabel>
            <TextField fullWidth id="parent-mobile" placeholder="Enter parents mobile number" type="tel" />
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Stack sx={{ gap: 1 }}>
            <InputLabel>Date of Birth</InputLabel>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker />
            </LocalizationProvider>
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Stack sx={{ gap: 1 }}>
            <InputLabel htmlFor="blood-group">Blood Group</InputLabel>
            <TextField fullWidth id="blood-group" placeholder="Enter blood group" />
          </Stack>
        </Grid>
        <Grid size={12}>
          <Stack sx={{ gap: 1 }}>
            <InputLabel htmlFor="residence-add">Residence Address</InputLabel>
            <TextField fullWidth id="residence-add" placeholder="Enter address" multiline rows={2} />
          </Stack>
        </Grid>
        <Grid size={12}>
          <Stack sx={{ gap: 1 }}>
            <InputLabel>Photo</InputLabel>
            <TextField fullWidth type="file" />
          </Stack>
        </Grid>
        <Grid size={12} sx={{ textAlign: 'end' }}>
          <Button variant="contained">Submit</Button>
        </Grid>
      </Grid>
    </MainCard>
  );
}
