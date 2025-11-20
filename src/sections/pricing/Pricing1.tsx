'use client';

import { useState, Fragment } from 'react';

// material-ui
import Button from '@mui/material/Button';
import Chip, { ChipProps } from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project-imports
import MainCard from 'components/MainCard';
import { GRID_COMMON_SPACING } from 'config';

interface DetailProps {
  title: string;
  description: string;
}

interface PlanTimeProps {
  value: string;
  label: string;
  chip?: ChipProps;
}

// plan list
const plans = [
  { active: false, title: 'Basic', description: '03 Services', price: 69, permission: [0, 1, 2] },
  { active: true, title: 'Standard', description: '05 Services', price: 129, permission: [0, 1, 2, 3, 4] },
  { active: false, title: 'Premium', description: '08 Services', price: 599, permission: [0, 1, 2, 3, 4, 5, 6, 7] }
];

const planList = [
  'One End Product', // 0
  'No attribution required', // 1
  'TypeScript', // 2
  'Figma Design Resources', // 3
  'Create Multiple Products', // 4
  'Create a SaaS Project', // 5
  'Resale Product', // 6
  'Separate sale of our UI Elements?' // 7
];

const priceListDisable = {
  opacity: 0.4,
  textDecoration: 'line-through'
};

const price = {
  fontSize: '40px',
  fontWeight: 700,
  lineHeight: 1
};

const planTime: PlanTimeProps[] = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly', chip: { label: 'Save 30%', color: 'primary' } }
];

// ==============================|| PRICING ||============================== //

export default function Pricing1({ title, description }: DetailProps) {
  const [planValidity, setPlanValidity] = useState('yearly');

  function PlanValidityCard({ value, label, chip }: PlanTimeProps) {
    return (
      <MainCard content={false} border={false} sx={{ py: 2, px: 2.5, ...(planValidity === value && { bgcolor: 'secondary.lighter' }) }}>
        <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
          <Typography variant="h5" sx={{ color: 'text.secondary' }}>
            {label}
          </Typography>
          {chip && <Chip color={chip.color} size="small" label={chip.label} sx={{ borderRadius: 0.5 }} />}
        </Stack>
      </MainCard>
    );
  }

  return (
    <Stack sx={{ gap: 5 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ gap: 2, justifyContent: 'space-between' }}>
        <Stack sx={{ gap: 1.25, maxWidth: 700 }}>
          <Typography variant="h4">{title}</Typography>
          <Typography sx={{ color: 'text.secondary' }}>{description}</Typography>
        </Stack>

        <MainCard content={false} sx={{ p: 1.25, minWidth: 310, width: 'fit-content', height: 'fit-content' }}>
          <FormControl component="fieldset" sx={{ width: 1 }}>
            <RadioGroup value={planValidity} onChange={(event) => setPlanValidity(event.target.value)} sx={{ width: 1, gap: 1.5 }}>
              <Stack direction="row" sx={{ gap: 1 }}>
                {planTime.map((plan) => (
                  <FormControlLabel
                    key={plan.value}
                    value={plan.value}
                    control={<Radio sx={{ display: 'none' }} />}
                    label={<PlanValidityCard {...plan} />}
                    sx={{ width: 1, m: 0 }}
                  />
                ))}
              </Stack>
            </RadioGroup>
          </FormControl>
        </MainCard>
      </Stack>
      <Grid container spacing={GRID_COMMON_SPACING} sx={{ alignItems: 'center' }}>
        {plans.map((plan, index) => (
          <Grid key={index} sx={{ height: { xs: 'auto', md: 1 } }} size={{ xs: 12, sm: 6, md: 4 }}>
            <MainCard sx={{ height: { xs: 'auto', md: 1 }, py: 1.5 }}>
              <MainCard
                border={false}
                sx={{ overflow: 'visible', pt: 2, mb: 3, ...(plan.active && { borderRadius: 1, bgcolor: 'primary.lighter' }) }}
              >
                <Stack sx={{ gap: 3 }}>
                  {plan.active && (
                    <Chip
                      label="Popular"
                      color="success"
                      sx={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)' }}
                    />
                  )}
                  <Stack sx={{ textAlign: 'center' }}>
                    <Typography variant="h4">{plan.title}</Typography>
                    <Typography>{plan.description}</Typography>
                  </Stack>
                  <Stack sx={{ alignItems: 'center' }}>
                    <Typography variant="h2" sx={price}>
                      ${planValidity === 'yearly' ? plan.price * 12 - 99 : plan.price}
                    </Typography>
                    <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                      Lifetime
                    </Typography>
                  </Stack>
                  <Button color={plan.active ? 'primary' : 'secondary'} variant={plan.active ? 'contained' : 'outlined'} fullWidth>
                    Order Now
                  </Button>
                </Stack>
              </MainCard>
              <List sx={{ m: 0, p: 0, '&> li': { px: 0, py: 0.625 } }} component="ul">
                {planList.map((list, i) => (
                  <Fragment key={i}>
                    <ListItem sx={!plan.permission.includes(i) ? priceListDisable : {}}>
                      <ListItemText primary={list} sx={{ textAlign: 'center' }} />
                    </ListItem>
                  </Fragment>
                ))}
              </List>
            </MainCard>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}
