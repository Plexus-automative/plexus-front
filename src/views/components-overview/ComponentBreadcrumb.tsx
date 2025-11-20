'use client';

// material-ui
import Grid from '@mui/material/Grid';

// project-imports
import Breadcrumb from 'components/@extended/Breadcrumbs';
import ComponentHeader from 'components/cards/ComponentHeader';
import MainCard from 'components/MainCard';
import { GRID_COMMON_SPACING } from 'config';

import ComponentWrapper from 'sections/components-overview/ComponentWrapper';

// assets
import { Minus } from '@wandersonalwes/iconsax-react';

// ==============================|| COMPONENTS - BREADCRUMBS ||============================== //

export default function ComponentBreadcrumb() {
  return (
    <>
      <ComponentHeader
        title="Breadcrumbs"
        caption="Breadcrumbs allow users to make selections from a range of values."
        directory="src/pages/components-overview/breadcrumbs"
        link="https://mui.com/material-ui/react-breadcrumbs/"
      />
      <ComponentWrapper>
        <Grid container spacing={GRID_COMMON_SPACING}>
          <Grid size={{ xs: 12, lg: 6 }}>
            <MainCard title="Basic">
              <Breadcrumb card title={false} sx={{ mb: '0px !important', bgcolor: 'secondary.lighter' }} />
            </MainCard>
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <MainCard title="Custom Separator">
              <Breadcrumb card title={false} separator={Minus} sx={{ mb: '0px !important', bgcolor: 'secondary.lighter' }} />
            </MainCard>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <MainCard title="With Title">
              <Breadcrumb card titleBottom={false} sx={{ mb: '0px !important', bgcolor: 'secondary.lighter' }} />
            </MainCard>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <MainCard title="Title Bottom">
              <Breadcrumb card sx={{ mb: '0px !important', bgcolor: 'secondary.lighter' }} />
            </MainCard>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <MainCard title="With Icons">
              <Breadcrumb card icons titleBottom={false} sx={{ mb: '0px !important', bgcolor: 'secondary.lighter' }} />
            </MainCard>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <MainCard title="Only Dashboard Icons">
              <Breadcrumb card title icon titleBottom={false} sx={{ mb: '0px !important', bgcolor: 'secondary.lighter' }} />
            </MainCard>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <MainCard title="Collapsed Breadcrumbs">
              <Breadcrumb title maxItems={2} card titleBottom={false} sx={{ mb: '0px !important', bgcolor: 'secondary.lighter' }} />
            </MainCard>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <MainCard title="No Card with Divider">
              <Breadcrumb title divider titleBottom={false} sx={{ mb: '0px !important' }} />
            </MainCard>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <MainCard title="No Card & No Divider">
              <Breadcrumb title titleBottom={false} sx={{ mb: '0px !important' }} />
            </MainCard>
          </Grid>
        </Grid>
      </ComponentWrapper>
    </>
  );
}
