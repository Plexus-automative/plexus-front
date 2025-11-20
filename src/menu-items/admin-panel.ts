// assets
import { Book1, I24Support, Profile2User, KyberNetwork } from '@wandersonalwes/iconsax-react';

// types
import { NavItemType } from 'types/menu';

// icons
const icons = {
  dashboard: Book1,
  applications: KyberNetwork,
  membership: Profile2User,
  helpdesk: I24Support
};

// ==============================|| MENU ITEMS - ADMIN PANEL ||============================== //

const adminPanel: NavItemType = {
  id: 'group-admin-panel',
  title: 'admin-panel',
  icon: icons.applications,
  type: 'group',
  children: [
    {
      id: 'online-courses',
      title: 'online-courses',
      type: 'collapse',
      icon: icons.dashboard,
      children: [
        {
          id: 'online-dashboard',
          title: 'dashboard',
          type: 'item',
          breadcrumbs: false,
          url: '/admin-panel/online-course/dashboard'
        },
        {
          id: 'teacher',
          title: 'teacher',
          type: 'collapse',
          children: [
            {
              id: 'teacher-list',
              title: 'list',
              type: 'item',
              breadcrumbs: false,
              url: '/admin-panel/online-course/teacher/list'
            },
            {
              id: 'teacher-apply',
              title: 'apply',
              type: 'item',
              breadcrumbs: false,
              url: '/admin-panel/online-course/teacher/apply'
            },
            {
              id: 'teacher-add',
              title: 'add',
              type: 'item',
              breadcrumbs: false,
              url: '/admin-panel/online-course/teacher/add'
            }
          ]
        },
        {
          id: 'student',
          title: 'student',
          type: 'collapse',
          children: [
            {
              id: 'student-list',
              title: 'list',
              type: 'item',
              breadcrumbs: false,
              url: '/admin-panel/online-course/student/list'
            },
            {
              id: 'student-apply',
              title: 'apply',
              type: 'item',
              breadcrumbs: false,
              url: '/admin-panel/online-course/student/apply'
            },
            {
              id: 'student-add',
              title: 'add',
              type: 'item',
              breadcrumbs: false,
              url: '/admin-panel/online-course/student/add'
            }
          ]
        },
        {
          id: 'courses',
          title: 'courses',
          type: 'collapse',
          children: [
            {
              id: 'courses-view',
              title: 'view',
              type: 'item',
              breadcrumbs: false,
              url: '/admin-panel/online-course/courses/view'
            },
            {
              id: 'courses-add',
              title: 'add',
              type: 'item',
              breadcrumbs: false,
              url: '/admin-panel/online-course/courses/add'
            }
          ]
        },
        {
          id: 'pricing',
          title: 'pricing',
          type: 'item',
          breadcrumbs: false,
          url: '/admin-panel/online-course/price'
        },
        {
          id: 'site',
          title: 'site',
          type: 'item',
          breadcrumbs: false,
          url: '/admin-panel/online-course/site'
        },
        {
          id: 'online-setting',
          title: 'setting',
          type: 'collapse',
          children: [
            {
              id: 'setting-payment',
              title: 'payment',
              type: 'item',
              breadcrumbs: false,
              url: '/admin-panel/online-course/setting/payment'
            },
            {
              id: 'setting-pricing',
              title: 'pricing',
              type: 'item',
              breadcrumbs: false,
              url: '/admin-panel/online-course/setting/price'
            },
            {
              id: 'setting-notification',
              title: 'notification',
              type: 'item',
              breadcrumbs: false,
              url: '/admin-panel/online-course/setting/notification'
            }
          ]
        }
      ]
    },
    {
      id: 'membership',
      title: 'membership',
      type: 'collapse',
      icon: icons.membership,
      children: [
        {
          id: '-membership-dashboard',
          title: 'dashboard',
          type: 'item',
          url: '/admin-panel/membership/dashboard',
          breadcrumbs: false
        },
        {
          id: 'membership-list',
          title: 'list',
          type: 'item',
          url: '/admin-panel/membership/list',
          breadcrumbs: false
        },
        {
          id: 'membership-pricing',
          title: 'pricing',
          type: 'item',
          url: '/admin-panel/membership/price',
          breadcrumbs: false
        },
        {
          id: 'membership-setting',
          title: 'setting',
          type: 'item',
          url: '/admin-panel/membership/setting',
          breadcrumbs: false
        }
      ]
    },
    {
      id: 'helpdesk',
      title: 'helpdesk',
      type: 'collapse',
      icon: icons.helpdesk,
      children: [
        {
          id: 'helpdesk-dashboard',
          title: 'dashboard',
          type: 'item',
          url: '/admin-panel/helpdesk/dashboard',
          breadcrumbs: false
        },
        {
          id: 'ticket',
          title: 'ticket',
          type: 'collapse',
          children: [
            {
              id: 'create',
              title: 'create',
              type: 'item',
              url: '/admin-panel/helpdesk/ticket/create',
              breadcrumbs: false
            },
            {
              id: 'ticket-list',
              title: 'list',
              type: 'item',
              url: '/admin-panel/helpdesk/ticket/list',
              breadcrumbs: false
            },
            {
              id: 'ticket-details',
              title: 'details',
              type: 'item',
              url: '/admin-panel/helpdesk/ticket/details',
              breadcrumbs: false
            }
          ]
        },
        {
          id: 'helpdesk-customer',
          title: 'customer',
          type: 'item',
          url: '/admin-panel/helpdesk/customer',
          breadcrumbs: false
        }
      ]
    }
  ]
};

export default adminPanel;
