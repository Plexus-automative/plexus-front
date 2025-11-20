// material-ui
import Grid from '@mui/material/Grid';

// project-imports
import MainCard from 'components/MainCard';
import { GRID_COMMON_SPACING } from 'config';

// charts
import ApexAreaChart from 'sections/charts/apexchart/ApexAreaChart';
import ApexBarChart from 'sections/charts/apexchart/ApexBarChart';
import ApexColumnChart from 'sections/charts/apexchart/ApexColumnChart';
import ApexLineChart from 'sections/charts/apexchart/ApexLineChart';
import ApexMixedChart from 'sections/charts/apexchart/ApexMixedChart';
import ApexPieChart from 'sections/charts/apexchart/ApexPieChart';
import ApexPolarChart from 'sections/charts/apexchart/ApexPolarChart';
import ApexRedialChart from 'sections/charts/apexchart/ApexRadialChart';

// ==============================|| APEX CHARTS ||============================== //

export default function Apexchart() {
  return (
    <Grid container spacing={GRID_COMMON_SPACING}>
      <Grid size={{ xs: 12, md: 6 }}>
        <MainCard title="Column Chart">
          <ApexColumnChart />
        </MainCard>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <MainCard title="Bar Chart">
          <ApexBarChart />
        </MainCard>
      </Grid>
      <Grid size={{ xs: 12, md: 6, lg: 6 }}>
        <MainCard title="Line Chart">
          <ApexLineChart />
        </MainCard>
      </Grid>
      <Grid size={{ xs: 12, md: 6, lg: 6 }}>
        <MainCard title="Area Chart">
          <ApexAreaChart />
        </MainCard>
      </Grid>
      <Grid size={{ xs: 12, md: 6, lg: 8 }}>
        <MainCard title="Mixed Chart">
          <ApexMixedChart />
        </MainCard>
      </Grid>
      <Grid size={{ xs: 12, md: 6, lg: 4 }}>
        <MainCard title="Redial Chart">
          <ApexRedialChart />
        </MainCard>
      </Grid>
      <Grid size={{ xs: 12, md: 6, xl: 4 }}>
        <MainCard title="Polar Chart">
          <ApexPolarChart />
        </MainCard>
      </Grid>
      <Grid size={{ xs: 12, md: 6, xl: 4 }}>
        <MainCard title="Pie Chart">
          <ApexPieChart />
        </MainCard>
      </Grid>
    </Grid>
  );
}
