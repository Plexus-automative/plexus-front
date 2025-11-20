// types
import { ColorProps } from 'types/extended';

// assets
import { Bookmark2, Money, ProfileDelete, RefreshCircle } from '@wandersonalwes/iconsax-react';
const Avatar1 = '/assets/images/users/avatar-1.png';
const Avatar2 = '/assets/images/users/avatar-2.png';
const Avatar3 = '/assets/images/users/avatar-3.png';
const Avatar4 = '/assets/images/users/avatar-4.png';
const Avatar5 = '/assets/images/users/avatar-5.png';
const Avatar6 = '/assets/images/users/avatar-6.png';

interface Feature {
  text: string;
  iconColor: ColorProps;
}

interface GridDataItem {
  title: string;
  price: number;
  color: 'primary' | 'success' | 'warning';
  features: Feature[];
}

// pricing data
export const pricingData: GridDataItem[] = [
  {
    title: 'Casual',
    price: 50,
    color: 'success',
    features: [
      { text: 'Full Facility Access', iconColor: 'secondary' },
      { text: 'Meals plans', iconColor: 'secondary' },
      { text: '10% Discounts', iconColor: 'secondary' },
      { text: 'Cancel anytime', iconColor: 'secondary' }
    ]
  },
  {
    title: 'Addicted',
    price: 150,
    color: 'primary',
    features: [
      { text: 'Full Facility Access', iconColor: 'primary' },
      { text: 'Meals plans', iconColor: 'primary' },
      { text: '50% Discounts', iconColor: 'primary' },
      { text: 'Cancel anytime', iconColor: 'primary' },
      { text: 'Basic feature', iconColor: 'primary' }
    ]
  },
  {
    title: 'Diehard',
    price: 200,
    color: 'warning',
    features: [
      { text: 'Full Facility Access', iconColor: 'secondary' },
      { text: 'Meals plans', iconColor: 'secondary' },
      { text: '75% Discounts', iconColor: 'secondary' },
      { text: 'Primmum feature', iconColor: 'secondary' },
      { text: 'Cancel anytime', iconColor: 'secondary' },
      { text: 'Online booking', iconColor: 'secondary' }
    ]
  }
];

// dashboard widget card data
export const dashboardWidgetData = [
  {
    primary: 'Registrations',
    secondary: '980+',
    content: 'May 23 - June 01 (2018)',
    iconPrimary: Bookmark2,
    color: 'primary.darker',
    bgcolor: 'primary.lighter'
  },
  {
    primary: 'Renewals',
    secondary: '1,563',
    content: 'May 23 - June 01 (2018)',
    iconPrimary: RefreshCircle,
    color: 'success.darker',
    bgcolor: 'success.lighter'
  },
  {
    primary: 'Revenue',
    secondary: '42.6%',
    content: 'May 23 - June 01 (2018)',
    iconPrimary: Money,
    color: 'warning.darker',
    bgcolor: 'warning.lighter'
  },
  {
    primary: 'Cancelations',
    secondary: '32.4%',
    content: 'May 23 - June 01 (2018)',
    iconPrimary: ProfileDelete,
    color: 'error.darker',
    bgcolor: 'error.lighter'
  }
];

// calendar data
export const calendarData = [
  {
    primaryText: 'Realize offers!',
    secondaryText: '16:00',
    borderColor: 'success.dark'
  },
  {
    primaryText: 'Add new members.',
    secondaryText: '14:00',
    borderColor: 'warning.dark'
  },
  {
    primaryText: 'Add new benefit list.',
    secondaryText: '13:00',
    borderColor: 'primary.main'
  },
  {
    primaryText: 'Second offer is end!',
    secondaryText: '09:00',
    borderColor: 'error.dark'
  }
];

// notification data
export const notificationsData = [
  { avatar: Avatar1, text: 'Brieley joined casual membership', timeStamp: 'Today | 9:00 AM' },
  { avatar: Avatar2, text: 'Ashton end membership planing', timeStamp: 'Yesterday | 6:30 PM' },
  { avatar: Avatar3, text: 'Airi canceled membership', timeStamp: '05 Feb | 3:45 PM' },
  { avatar: Avatar4, text: 'Colleen join Addicted membership', timeStamp: '05 Feb | 4:00 PM' },
  { avatar: Avatar5, text: 'David renewed premium', timeStamp: 'Last Week | 5:00 PM' },
  { avatar: Avatar6, text: 'John end membership planing', timeStamp: '05 Feb | 4:00 PM' }
];

// membership plan data
export const membershipPlans = [
  {
    title: 'Membership Plan',
    plan: 'Addicted $150',
    linkText: 'See more plan'
  },
  {
    title: 'Renewal Date',
    plan: '120 November, 2024',
    linkText: 'View payment method'
  },
  {
    title: 'Manage',
    plan: 'Membership',
    linkText: 'Update, Cancel and more'
  }
];
