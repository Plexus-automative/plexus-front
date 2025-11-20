'use client';

import { useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project-imports
import EcommerceDataChart from './EcommerceDataChart';
import MainCard from 'components/MainCard';

// assets
import { ArrowUp } from '@wandersonalwes/iconsax-react';

// ==============================|| CHART WIDGETS - NEW ORDER ||============================== //

export default function NewOrders() {
  const theme = useTheme();

  const [age, setAge] = useState('30');
  const handleChange = (event: SelectChangeEvent) => {
    setAge(event.target.value as string);
  };

  return (
    <MainCard>
      <Grid container spacing={2}>
        <Grid size={12}>
          <Stack direction="row" sx={{ gap: 1, alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h5">New Orders</Typography>
            <Box sx={{ minWidth: 120 }}>
              <FormControl fullWidth size="small">
                <Select id="demo-simple-select" value={age} onChange={handleChange}>
                  <MenuItem value={10}>Today</MenuItem>
                  <MenuItem value={20}>Weekly</MenuItem>
                  <MenuItem value={30}>Monthly</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Stack>
        </Grid>
        <Grid size={12}>
          <EcommerceDataChart color={theme.palette.primary.main} height={86} />
        </Grid>
        <Grid size={12}>
          <Stack direction="row" sx={{ gap: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="subtitle1">$30,200</Typography>
            <Typography color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 500 }}>
              <ArrowUp size={14} style={{ transform: 'rotate(45deg)' }} />
              30.6%
            </Typography>
          </Stack>
        </Grid>
        <Grid size={12}>
          <Button fullWidth variant="outlined" color="secondary">
            View more
          </Button>
        </Grid>
      </Grid>
    </MainCard>
  );
}
