'use client';

import { useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import CardMedia from '@mui/material/CardMedia';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project-imports
import MainCard from 'components/MainCard';
import Dot from 'components/@extended/Dot';

// assets
import { Star1 } from '@wandersonalwes/iconsax-react';
const Business = '/assets/images/online-panel/business.svg';
const Free = '/assets/images/online-panel/free.svg';
const Pro = '/assets/images/online-panel/pro.svg';
const Regular = '/assets/images/online-panel/regular.svg';

interface Plan {
  id: string;
  image: string;
  title: string;
  feature: string;
  amount: number;
  isTrending?: boolean;
  description: string[];
}

const plans: Plan[] = [
  {
    id: 'Plan_1',
    image: Free,
    title: 'FREE',
    feature: 'Basic Features',
    amount: 0,
    description: ['One End Product', 'No attribution required', 'TypeScript']
  },
  {
    id: 'Plan_2',
    image: Regular,
    title: 'REGULAR',
    feature: 'Trending',
    amount: 99,
    isTrending: true,
    description: ['One End Product', 'No attribution required', 'TypeScript', 'Figma Design Resources', 'Create Multiple Products']
  },
  {
    id: 'Plan_3',
    image: Pro,
    title: 'PRO',
    feature: 'For advanced',
    amount: 199,
    description: [
      'One End Product',
      'No attribution required',
      'TypeScript',
      'Figma Design Resources',
      'Create Multiple Products',
      'Create a SaaS Project'
    ]
  },
  {
    id: 'Plan_4',
    image: Business,
    title: 'Business',
    feature: 'For advanced',
    amount: 299,
    description: [
      'One End Product',
      'No attribution required',
      'TypeScript',
      'Figma Design Resources',
      'Create Multiple Products',
      'Create a SaaS Project',
      'Resale Product',
      'Separate sale of our UI Elements'
    ]
  }
];

// ==============================|| PRICING ||============================== //

export default function Pricing() {
  const theme = useTheme();
  const iconColor = theme.palette.warning.light;

  const [selectedPlan, setSelectedPlan] = useState(plans[0]);

  const handlePlanSelect = (plan: (typeof plans)[0]) => {
    setSelectedPlan(plan);
  };

  return (
    <Stack direction="row" sx={{ justifyContent: 'center' }}>
      <Stack sx={{ gap: 2.5, width: 770 }}>
        <MainCard>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Stack sx={{ gap: 2 }}>
                <CardMedia component="img" sx={{ width: 140, height: 133 }} src={selectedPlan.image} alt={selectedPlan.title} />
                <Stack sx={{ gap: 0.5 }}>
                  {selectedPlan.description.map((detail, index) => (
                    <Stack key={index} direction="row" sx={{ alignItems: 'center', gap: 1 }}>
                      <Dot size={5} color="secondary" />
                      <Typography key={index} variant="h5" sx={{ alignItems: 'center', gap: 1 }}>
                        {detail}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Stack sx={{ gap: 1.5, alignItems: 'center' }}>
                <FormControl component="fieldset" sx={{ width: 1 }}>
                  <RadioGroup
                    value={selectedPlan.id}
                    onChange={(event) => {
                      const selectedPlan = plans.find((plan) => plan.id === event.target.value);
                      if (selectedPlan) {
                        handlePlanSelect(selectedPlan);
                      }
                    }}
                    sx={{ width: 1, gap: 1.5 }}
                  >
                    {plans.map((plan) => (
                      <FormControlLabel
                        key={plan.id}
                        value={plan.id}
                        control={<Radio sx={{ display: 'none' }} />}
                        slotProps={{ typography: { sx: { width: 1 } } }}
                        label={
                          <Stack
                            direction="row"
                            sx={{
                              width: 1,
                              justifyContent: 'space-between',
                              px: 3,
                              py: 1.5,
                              borderRadius: 1.5,
                              border: '1px solid',
                              borderColor: 'secondary.light',
                              color: selectedPlan.id === plan.id ? 'background.default' : 'text.primary',
                              backgroundColor: selectedPlan.id === plan.id ? 'primary.main' : 'background.paper',

                              '&:hover': {
                                color: selectedPlan.id === plan.id ? 'background.default' : 'text.primary',
                                backgroundColor: selectedPlan.id === plan.id ? 'primary.main' : 'primary.lighter'
                              }
                            }}
                          >
                            <Stack sx={{ gap: 1.25 }}>
                              <Typography variant="h4">{plan.title}</Typography>
                              <Chip
                                size="small"
                                {...(plan.isTrending && { icon: <Star1 style={{ color: iconColor, fill: iconColor }} /> })}
                                sx={{
                                  typography: 'subtitle2',
                                  borderRadius: 0.5,
                                  color: selectedPlan.id === plan.id ? 'background.default' : 'text.primary',
                                  '.MuiChip-icon': { width: 14, height: 14 }
                                }}
                                label={plan.feature}
                              />
                            </Stack>
                            <Stack direction="row" sx={{ alignItems: 'center' }}>
                              <Typography variant="h3">{plan.amount}$/</Typography>
                              <Typography variant="h5" sx={{ mt: 0.75, fontWeight: 'bold', textTransform: 'none' }}>
                                mo
                              </Typography>
                            </Stack>
                          </Stack>
                        }
                        sx={{ width: 1, m: 0 }}
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
              </Stack>
            </Grid>
          </Grid>
        </MainCard>
        <Button variant="contained" sx={{ width: 'fit-content', alignSelf: 'end' }}>
          Buy Now
        </Button>
      </Stack>
    </Stack>
  );
}
