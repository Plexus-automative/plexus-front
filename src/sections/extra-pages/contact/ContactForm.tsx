'use client';

import { useState } from 'react';

// material-ui
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// select company-size
const sizes = [
  { value: '1', label: '1 - 5' },
  { value: '2', label: '5 - 10' },
  { value: '3', label: '10+' }
];

// ==============================|| CONTACT US - FORM ||============================== //

export default function ContactForm() {
  const [size, setSize] = useState(1);
  const handleCompanySize = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSize(Number(event.target?.value));
  };
  return (
    <Box sx={{ p: { xs: 2.5, sm: 0 } }}>
      <Grid container spacing={5} sx={{ justifyContent: 'center' }}>
        <Grid size={{ xs: 12, sm: 10, lg: 6 }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Stack sx={{ gap: 1 }}>
                <Typography variant="subtitle1" color="secondary">
                  First Name
                </Typography>
                <TextField fullWidth type="text" placeholder="First name" />
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Stack sx={{ gap: 1 }}>
                <Typography variant="subtitle1" color="secondary">
                  Last Name
                </Typography>
                <TextField fullWidth type="text" placeholder="Last name" />
              </Stack>
            </Grid>
            <Grid size={12}>
              <Stack sx={{ gap: 1 }}>
                <Typography variant="subtitle1" color="secondary">
                  Email Address
                </Typography>
                <TextField fullWidth type="email" placeholder="Email Address" />
              </Stack>
            </Grid>
            <Grid size={12}>
              <Stack sx={{ gap: 1 }}>
                <Typography variant="subtitle1" color="secondary">
                  Phone Number
                </Typography>
                <TextField fullWidth type="number" placeholder="Phone Number" />
              </Stack>
            </Grid>
            <Grid size={12}>
              <TextField select fullWidth placeholder="Company Size" value={size} onChange={handleCompanySize}>
                {sizes.map((option, index) => (
                  <MenuItem key={index} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={12}>
              <Stack direction="row" sx={{ alignItems: 'center', ml: -1 }}>
                <Checkbox sx={{ '& .css-1vjb4cj': { borderRadius: '2px' } }} defaultChecked />
                <Typography>
                  I agree to all the{' '}
                  <Typography component="span" sx={{ color: 'primary.main', cursor: 'pointer' }}>
                    Terms & Condition
                  </Typography>
                </Typography>
              </Stack>
            </Grid>
            <Grid size={12}>
              <Button variant="contained" fullWidth>
                Submit
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}
