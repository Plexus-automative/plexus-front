'use client';

// material-ui
import { alpha, useTheme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project-imports
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import MainCard from 'components/MainCard';
import { APP_DEFAULT_PATH, GRID_COMMON_SPACING } from 'config';
import { pricingData } from 'data/membership';

// assets
import { TickCircle } from '@wandersonalwes/iconsax-react';

// ==============================|| MEMBERSHIP - PRICING ||============================== //

export default function MembershipPricing() {
  const theme = useTheme();

  const colors: { [key: string]: string } = {
    primary: theme.palette.primary.main,
    success: theme.palette.success.main,
    warning: theme.palette.warning.main
  };

  const breadcrumbLinks = [
    { title: 'home', to: APP_DEFAULT_PATH },
    { title: 'membership', to: '/admin-panel/membership/pricing' },
    { title: 'pricing' }
  ];

  return (
    <>
      <Breadcrumbs custom heading="pricing" links={breadcrumbLinks} />
      <MainCard>
        <Grid container spacing={GRID_COMMON_SPACING} sx={{ p: { xs: 0, sm: 3.5 } }}>
          {pricingData.map((item, index) => (
            <Grid key={index} size={{ xs: 12, sm: 6, md: 4 }}>
              <MainCard content={false} sx={{ height: 1, p: 2.5, borderColor: alpha(colors[item.color], 0.5) }}>
                <MainCard content={false} border={false} sx={{ height: 1, bgcolor: alpha(colors[item.color], 0.1), p: 2.5 }}>
                  <Stack sx={{ height: 1, gap: 2.5 }}>
                    <Stack sx={{ alignItems: 'center', gap: 1.25 }}>
                      <Typography variant="h3" sx={{ color: colors[item.color] }}>
                        {item.title}
                      </Typography>
                      <Typography variant="h1" sx={{ display: 'flex', alignItems: 'flex-end' }}>
                        ${item.price}/
                        <Typography variant="h4" component="span" sx={{ color: 'text.secondary', fontWeight: 400, ml: 1 }}>
                          Month
                        </Typography>
                      </Typography>
                    </Stack>
                    <Stack sx={{ justifyContent: 'space-between', height: 1, gap: 2.5 }}>
                      <List disablePadding sx={{ '& .MuiListItem-root': { pt: 0.625, pb: 0.625, px: 1.25 } }}>
                        {item.features.map((feature, i) => (
                          <ListItem key={i}>
                            <ListItemIcon sx={{ minWidth: 'inherit', pr: 1.25 }}>
                              <TickCircle color={colors[item.color]} size={16} variant="Outline" />
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                                  {feature.text}
                                </Typography>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                      <Stack sx={{ alignItems: 'center' }}>
                        <Button color="secondary" variant="contained" sx={{ px: 4 }}>
                          Buy Now
                        </Button>
                      </Stack>
                    </Stack>
                  </Stack>
                </MainCard>
              </MainCard>
            </Grid>
          ))}
        </Grid>
      </MainCard>
    </>
  );
}
