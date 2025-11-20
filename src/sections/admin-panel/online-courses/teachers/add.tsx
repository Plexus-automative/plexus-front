'use client';

import { useState } from 'react';

// material-ui
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';

import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// project-imports
import MainCard from 'components/MainCard';

// assets
import { Eye, EyeSlash } from '@wandersonalwes/iconsax-react';

// ==============================|| ONLINE COURSES - ADD TEACHER ||============================== //

export default function AddTeacher() {
  const [value, setValue] = useState('female');
  const [department, setDepartment] = useState('department');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (event: SelectChangeEvent) => {
    setValue(event.target.value);
  };

  const handleDepartment = (event: SelectChangeEvent) => {
    setDepartment(event.target.value);
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
            <InputLabel>Joining Date</InputLabel>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker />
            </LocalizationProvider>
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Stack sx={{ gap: 1 }}>
            <InputLabel htmlFor="password">Password</InputLabel>
            <OutlinedInput
              fullWidth
              id="password"
              placeholder="Enter password"
              type={showPassword ? 'text' : 'password'}
              endAdornment={
                <InputAdornment position="end">
                  <Box sx={{ display: 'flex', cursor: 'pointer' }} onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <Eye size={20} /> : <EyeSlash size={20} />}
                  </Box>
                </InputAdornment>
              }
            />
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Stack sx={{ gap: 1 }}>
            <InputLabel htmlFor="confirm-password">Confirm Password</InputLabel>
            <OutlinedInput
              fullWidth
              id="confirm-password"
              placeholder="Enter confirm password"
              type={showConfirmPassword ? 'text' : 'password'}
              endAdornment={
                <InputAdornment position="end">
                  <Box sx={{ display: 'flex', cursor: 'pointer' }} onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <Eye size={20} /> : <EyeSlash size={20} />}
                  </Box>
                </InputAdornment>
              }
            />
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
            <InputLabel htmlFor="designation">Designation</InputLabel>
            <TextField fullWidth id="designation" placeholder="Designation" />
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Stack sx={{ gap: 1 }}>
            <InputLabel>Department</InputLabel>
            <Select value={department} onChange={handleDepartment}>
              <MenuItem value="department">Department</MenuItem>
              <MenuItem value="department1">Department1</MenuItem>
              <MenuItem value="department2">Department2</MenuItem>
            </Select>
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
            <InputLabel htmlFor="education">Education</InputLabel>
            <TextField fullWidth id="education" placeholder="Education" />
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
