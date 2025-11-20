// material-ui
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';

// project-imports
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import MainCard from 'components/MainCard';
import { APP_DEFAULT_PATH } from 'config';

const breadcrumbLinks = [
  { title: 'home', to: APP_DEFAULT_PATH },
  { title: 'online-courses' },
  { title: 'setting' },
  { title: 'notifications' }
];

const notification = [
  {
    title: 'Enrollment Notifications',
    description: 'Get notified via email whenever a student enrolls in your school and/or courses.',
    details: [
      { label: 'When a new student joins the school', switch: true },
      { label: 'When a student enrolls in a paid course', switch: true },
      { label: 'When a student enrolls in a free course', switch: false }
    ]
  },
  {
    title: 'Comment Notifications',
    description: 'Get alerted via email whenever someone engages in a commenting action.',
    details: [
      { label: 'When a new comment is posted that requires moderation', switch: true },
      { label: 'When a new comment is posted on one of your courses', switch: false },
      { label: `When a new comment is posted in a thread you've commented on`, switch: true }
    ]
  },
  {
    title: 'Subscription Notifications',
    description: 'Get email notifications for specific subscription events.',
    details: [
      { label: 'When a subscription payment fails or a subscription is canceled due to non-payment', switch: true },
      { label: 'When a student cancels their subscription to one of your courses', switch: false }
    ]
  }
];

// ==============================|| SETTING - NOTIFICATION ||============================== //

export default function SettingNotificationPage() {
  return (
    <>
      <Breadcrumbs custom heading="notifications" links={breadcrumbLinks} />
      <MainCard title="Notifications">
        <Stack sx={{ gap: 3 }}>
          {notification.map((value, index) => (
            <Stack key={index} sx={{ gap: 2.5 }}>
              <Stack sx={{ gap: 0.5 }}>
                <Typography variant="h5">{value.title}</Typography>
                <Typography sx={{ color: 'text.secondary' }}>{value.description}</Typography>
              </Stack>
              <MainCard content={false} sx={{ p: 2.5 }}>
                <Stack sx={{ gap: 1 }}>
                  {value.details.map((item, index) => (
                    <Stack key={index} direction="row" sx={{ justifyContent: 'space-between', gap: 1 }}>
                      <Typography>{item.label}</Typography>
                      <Switch defaultChecked={item.switch} sx={{ m: 0.5 }} size="small" />
                    </Stack>
                  ))}
                </Stack>
              </MainCard>
            </Stack>
          ))}
        </Stack>
      </MainCard>
    </>
  );
}
