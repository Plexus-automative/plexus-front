'use client';

import { useState } from 'react';

// material-ui
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project-imports
import MembershipStateChart from './MembershipStateChart';
import Dot from 'components/@extended/Dot';
import MainCard from 'components/MainCard';

// ==============================|| DASHBOARD - MEMBERSHIP STATE ||============================== //

export default function MembershipState() {
  const [value, setValue] = useState('30');
  const handleChange = (event: SelectChangeEvent) => {
    setValue(event.target.value as string);
  };

  return (
    <MainCard>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
        <Typography variant="h5">Membership State</Typography>
        <FormControl size="small">
          <Select id="demo-simple-select" value={value} onChange={handleChange}>
            <MenuItem value={10}>Today</MenuItem>
            <MenuItem value={20}>Weekly</MenuItem>
            <MenuItem value={30}>Monthly</MenuItem>
          </Select>
        </FormControl>
      </Stack>
      <Grid container spacing={{ xs: 2, sm: 0 }} sx={{ alignItems: 'center', pt: 2 }}>
        <Grid size={{ xs: 12, sm: 8, md: 6, lg: 7 }}>
          <MembershipStateChart />
          <Typography sx={{ color: 'primary', textAlign: 'center' }} variant="body1">
            Total
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 4, md: 6, lg: 5 }}>
          <Stack sx={{ gap: 1.25 }}>
            <Stack
              direction="row"
              sx={{ gap: 1, justifyContent: 'center', alignItems: 'center', p: 1, border: 1, borderColor: 'divider', borderRadius: 1 }}
            >
              <Dot color="primary" />
              <Typography variant="caption" sx={{ fontWeight: 500 }}>
                New Membership
              </Typography>
            </Stack>
            <Stack
              direction="row"
              sx={{ gap: 1, justifyContent: 'center', alignItems: 'center', p: 1, border: 1, borderColor: 'divider', borderRadius: 1 }}
            >
              <Dot sx={{ bgcolor: 'primary.100' }} />
              <Typography variant="caption" sx={{ fontWeight: 500 }}>
                Repeat Membership
              </Typography>
            </Stack>
          </Stack>
        </Grid>
      </Grid>
    </MainCard>
  );
}
