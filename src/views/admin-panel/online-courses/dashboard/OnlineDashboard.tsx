'use client';

// material-ui
import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';

// project-imports
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import CourseCard from 'components/cards/online-courses/CourseCard';
import { APP_DEFAULT_PATH, GRID_COMMON_SPACING } from 'config';

import ActivityCard from 'sections/admin-panel/online-courses/dashboard/Activity';
import ActivityTableCard from 'sections/admin-panel/online-courses/dashboard/ActivityTable';
import CoursesCard from 'sections/admin-panel/online-courses/dashboard/CoursesCard';
import CourseListCard from 'sections/admin-panel/online-courses/dashboard/CourseListCard';
import CourseStatesCard from 'sections/admin-panel/online-courses/dashboard/CourseStates';
import DashboardCalendar from 'sections/admin-panel/online-courses/dashboard/DashboardCalendar';
import EarningCourseCard from 'sections/admin-panel/online-courses/dashboard/EarningCourses';
import InviteGoalCard from 'sections/admin-panel/online-courses/dashboard/InviteGoal';
import NotificationCard from 'sections/admin-panel/online-courses/dashboard/Notifications';
import StatisticsCard from 'sections/admin-panel/online-courses/dashboard/Statistics';
import StudentStatesCard from 'sections/admin-panel/online-courses/dashboard/StudentStates';
import StudentQueriesCard from 'sections/admin-panel/online-courses/dashboard/StudentQueries';
import TotalCard from 'sections/admin-panel/online-courses/dashboard/TotalCard';
import VisitorsCard from 'sections/admin-panel/online-courses/dashboard/Visitors';

// assets
import { Profile2User, Eye, DocumentText1, Card } from '@wandersonalwes/iconsax-react';
const Bootstrap = '/assets/images/online-panel/img-bootstrap.svg';
const Php = '/assets/images/online-panel/img-php.svg';
const UIUX = '/assets/images/online-panel/img-ux.svg';
const WebDesign = '/assets/images/online-panel/img-web.svg';
const CDesign = '/assets/images/online-panel/img-c.svg';

const cardData = [
  { title: 'New Students', icon: Profile2User, counter: '400+', percentage: 45.6, color: 'primary.darker', bgcolor: 'primary.lighter' },
  { title: 'Total Course', icon: DocumentText1, counter: '520+', percentage: 37.4, color: 'warning.darker', bgcolor: 'warning.lighter' },
  { title: 'New Visitor', icon: Eye, counter: '800+', percentage: 55.8, color: 'success.darker', bgcolor: 'success.lighter' },
  { title: 'Total Sale', icon: Card, counter: '1065', percentage: 78.95, color: 'error.darker', bgcolor: 'error.lighter' }
];

// ==============================|| DASHBOARD ||============================== //

export default function Dashboard() {
  const theme = useTheme();
  const breadcrumbLinks = [{ title: 'home', to: APP_DEFAULT_PATH }, { title: 'online-courses' }, { title: 'dashboard' }];

  return (
    <>
      <Breadcrumbs custom heading="dashboard" links={breadcrumbLinks} />
      <Grid container spacing={GRID_COMMON_SPACING}>
        {cardData.map((card, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, lg: 3 }}>
            <CourseCard
              title={card.title}
              icon={card.icon}
              counter={card.counter}
              percentage={card.percentage}
              color={card.color}
              bgcolor={card.bgcolor}
            />
          </Grid>
        ))}

        {/* row 2 */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <StatisticsCard />
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <InviteGoalCard />
        </Grid>

        {/* row 3 */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <CourseListCard
            title="Upcoming Course"
            data={[
              { image: Bootstrap, title: 'Bootstrap 5 Beginner Course' },
              { image: Php, title: 'PHP Training Course' },
              { image: UIUX, title: 'UI/UX Training Course' },
              { image: WebDesign, title: 'Web Designing Course' }
            ]}
          />
        </Grid>
        <Grid size={{ xs: 12, lg: 7 }}>
          <CoursesCard />
        </Grid>

        {/* row 4 */}
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <Stack sx={{ gap: 2.5 }}>
            <TotalCard
              title="Total Revenue"
              amount={7265}
              percentage={11.02}
              color={theme.palette.success.main}
              data={[5, 25, 3, 29, 4, 15]}
            />
            <TotalCard
              title="Total Subscription"
              amount={5326}
              percentage={-9.58}
              color={theme.palette.error.main}
              data={[21, 5, 18, 10, 27, 4]}
            />
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <StudentStatesCard />
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <StudentQueriesCard />
        </Grid>

        {/* row 5 */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <ActivityCard />
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <DashboardCalendar />
        </Grid>

        {/* row 6 */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <ActivityTableCard />
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <CourseListCard
            title="Trending Course"
            data={[
              { image: Bootstrap, title: 'Bootstrap 5 Beginner Course' },
              { image: Php, title: 'PHP Training Course' },
              { image: UIUX, title: 'UI/UX Training Course' },
              { image: WebDesign, title: 'Web Designing Course' },
              { image: CDesign, title: 'C Training Course' }
            ]}
          />
        </Grid>

        {/* row 7 */}
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <VisitorsCard />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <EarningCourseCard />
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <NotificationCard />
        </Grid>

        {/* row 8 */}
        <Grid size={12}>
          <CourseStatesCard />
        </Grid>
      </Grid>
    </>
  );
}
