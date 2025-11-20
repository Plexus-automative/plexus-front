'use client';

import { useState, Fragment } from 'react';

// material-ui
import { alpha } from '@mui/material/styles';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Chip from '@mui/material/Chip';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// assets
import { InfoCircle, TickSquare } from '@wandersonalwes/iconsax-react';

// project-imports
import MainCard from 'components/MainCard';
import { useBuyNowLink } from 'hooks/getBuyNowLink';
import { GRID_COMMON_SPACING } from 'config';

// plan list
const plans = [
  {
    active: false,
    title: 'Basic',
    description: '03 Services',
    price: 69,
    permission: [0, 1, 2]
  },
  {
    active: true,
    title: 'Standard',
    description: '05 Services',
    price: 129,
    permission: [0, 1, 2, 3, 4]
  },
  {
    active: false,
    title: 'Premium',
    description: '08 Services',
    price: 599,
    permission: [0, 1, 2, 3, 4, 5, 6, 7]
  }
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

// ==============================|| PRICING ||============================== //

export default function Pricing() {
  const { buyNowLink } = useBuyNowLink();

  const [timePeriod, setTimePeriod] = useState(true);

  const priceListDisable = {
    opacity: 0.4,
    textDecoration: 'line-through'
  };

  const [price, setPrice] = useState('Standard');
  const handlePriceMethod = (value: string) => {
    setPrice(value);
  };

  return (
    <Grid container spacing={GRID_COMMON_SPACING}>
      <Grid size={12}>
        <Alert
          severity="warning"
          variant="border"
          icon={<InfoCircle variant="Bold" />}
          sx={(theme) => ({ '&.MuiAlert-colorWarning': { backgroundColor: alpha(theme.palette.warning.lighter, 0.15) } })}
        >
          <AlertTitle sx={{ fontWeight: 500, color: 'warning.dark' }}>Note</AlertTitle>
          <Typography variant="h6">
            The pricing provided is for demonstration purposes only. For actual product pricing, please refer to the official{' '}
            <Link color="warning.dark" underline="hover" variant="subtitle1" target="_blank" href={buyNowLink}>
              Pricing Page
            </Link>
          </Typography>
        </Alert>
      </Grid>
      <Grid size={12}>
        <Stack direction={{ xs: 'column', md: 'row' }} sx={{ gap: 2, justifyContent: 'space-between' }}>
          <Stack>
            <Typography variant="h5">Quality is never an accident. It is always the result of intelligent effort</Typography>
            <Typography color="text.secondary">It makes no difference what the price is, it all makes senses to us.</Typography>
          </Stack>
          <Stack direction="row" sx={{ gap: 1.5, alignItems: 'center' }}>
            <Typography variant="subtitle1" color={timePeriod ? 'text.secondary' : 'text.primary'}>
              Billed Yearly
            </Typography>
            <Switch checked={timePeriod} onChange={() => setTimePeriod(!timePeriod)} slotProps={{ input: { 'aria-label': 'container' } }} />
            <Typography variant="subtitle1" color={timePeriod ? 'text.primary' : 'text.secondary'}>
              Billed Monthly
            </Typography>
          </Stack>
        </Stack>
      </Grid>
      <Grid size={12}>
        <Grid container spacing={GRID_COMMON_SPACING}>
          <Grid size={{ xs: 12, md: 6, lg: 7 }}>
            <MainCard>
              {plans.map((plan, index) => (
                <Box key={index} sx={{ display: price === plan.title ? 'block' : 'none' }}>
                  <List
                    sx={{
                      m: 0,
                      p: 0,
                      '&> li': {
                        px: 0,
                        py: 0.625
                      }
                    }}
                    component="ul"
                  >
                    {planList.map((list, i) => (
                      <Fragment key={i}>
                        <ListItem sx={!plan.permission.includes(i) ? priceListDisable : {}} divider>
                          <ListItemIcon sx={{ color: plan.permission.includes(i) ? 'success.main' : 'secondary.main' }}>
                            <TickSquare size="16" />
                          </ListItemIcon>
                          <ListItemText primary={list} />
                        </ListItem>
                      </Fragment>
                    ))}
                  </List>
                </Box>
              ))}
            </MainCard>
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 5 }}>
            <MainCard>
              <RadioGroup
                aria-label="delivery-options"
                value={price}
                onChange={(e) => handlePriceMethod(e.target.value)}
                name="Price-options"
              >
                <Stack sx={{ gap: 2 }}>
                  {plans.map((plan, index) => (
                    <Box
                      key={index}
                      sx={{
                        padding: 3,
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                        bgcolor: price === plan.title ? 'primary.lighter' : 'background.paper'
                      }}
                    >
                      <FormControlLabel
                        value={plan.title}
                        control={<Radio />}
                        label={
                          <Stack direction="row" sx={{ gap: 0.5, alignItems: 'center', justifyContent: 'space-between', width: 1 }}>
                            <Stack>
                              <Stack direction="row" sx={{ gap: 1 }}>
                                <Typography variant="h5">{plan.title}</Typography>
                                {plan.active && <Chip label="Popular" size="small" color="success" />}
                              </Stack>
                              <Typography>{plan.description}</Typography>
                            </Stack>
                            <Stack alignItems="flex-end" direction={{ sm: 'row', xs: 'column' }}>
                              {timePeriod && <Typography variant="h4">${plan.price}</Typography>}
                              {!timePeriod && <Typography variant="h4">${plan.price * 12 - 99}</Typography>}
                              <Typography variant="h6" color="text.secondary">
                                /Lifetime
                              </Typography>
                            </Stack>
                          </Stack>
                        }
                        sx={{
                          width: '100%',
                          alignItems: 'flex-start',
                          '& .MuiSvgIcon-root': { fontSize: 32 },
                          '& .MuiRadio-root': { p: 0, pl: 1, pr: 1, pt: 0.5 }
                        }}
                        slotProps={{ typography: { sx: { width: 1 } } }}
                      />
                    </Box>
                  ))}
                </Stack>
              </RadioGroup>
            </MainCard>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
