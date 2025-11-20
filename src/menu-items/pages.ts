// assets
import { Book1, I24Support, Security, MessageProgramming, DollarSquare, Airplane } from '@wandersonalwes/iconsax-react';

// types
import { NavItemType } from 'types/menu';

// icons
const icons = {
  page: Book1,
  authentication: Security,
  maintenance: MessageProgramming,
  pricing: DollarSquare,
  contactus: I24Support,
  landing: Airplane
};

// ==============================|| MENU ITEMS - PAGES ||============================== //

const pages: NavItemType = {
  id: 'group-pages',
  title: 'pages',
  type: 'group',
  icon: icons.page,
  children: [
    {
      id: 'authentication',
      title: 'authentication',
      type: 'collapse',
      icon: icons.authentication,
      children: [
        {
          id: 'authentication1',
          title: 'authentication 1',
          type: 'collapse',
          children: [
            {
              id: 'login',
              title: 'login',
              type: 'item',
              url: '/auth/login',
              target: true
            },
            {
              id: 'register',
              title: 'register',
              type: 'item',
              url: '/auth/register',
              target: true
            },
            {
              id: 'forgot-password',
              title: 'forgot-password',
              type: 'item',
              url: '/auth/forgot-password',
              target: true
            },
            {
              id: 'reset-password',
              title: 'reset-password',
              type: 'item',
              url: '/auth/reset-password',
              target: true
            },
            {
              id: 'check-mail',
              title: 'check-mail',
              type: 'item',
              url: '/auth/check-mail',
              target: true
            },
            {
              id: 'code-verification',
              title: 'code-verification',
              type: 'item',
              url: '/auth/code-verification',
              target: true
            }
          ]
        },
        {
          id: 'authentication2',
          title: 'authentication 2',
          type: 'collapse',
          children: [
            {
              id: 'login2',
              title: 'login',
              type: 'item',
              url: '/auth/login2',
              target: true
            },
            {
              id: 'register2',
              title: 'register',
              type: 'item',
              url: '/auth/register2',
              target: true
            },
            {
              id: 'forgot-password2',
              title: 'forgot-password',
              type: 'item',
              url: '/auth/forgot-password2',
              target: true
            },
            {
              id: 'reset-password2',
              title: 'reset-password',
              type: 'item',
              url: '/auth/reset-password2',
              target: true
            },
            {
              id: 'check-mail2',
              title: 'check-mail',
              type: 'item',
              url: '/auth/check-mail2',
              target: true
            },
            {
              id: 'code-verification2',
              title: 'code-verification',
              type: 'item',
              url: '/auth/code-verification2',
              target: true
            }
          ]
        },
        {
          id: 'authentication3',
          title: 'authentication 3',
          type: 'item',
          url: '/auth/login3',
          target: true
        }
      ]
    },
    {
      id: 'maintenance',
      title: 'maintenance',
      type: 'collapse',
      icon: icons.maintenance,
      isDropdown: true,
      children: [
        {
          id: 'error-404',
          title: 'error-404',
          type: 'item',
          url: '/maintenance/404',
          target: true
        },
        {
          id: 'error-500',
          title: 'error-500',
          type: 'item',
          url: '/maintenance/500',
          target: true
        },
        {
          id: 'coming-soon-collapse',
          title: 'coming-soon',
          type: 'collapse',
          children: [
            {
              id: 'coming-soon-1',
              title: 'coming-soon 1',
              type: 'item',
              url: '/maintenance/coming-soon',
              target: true
            },
            {
              id: 'coming-soon-2',
              title: 'coming-soon 2',
              type: 'item',
              url: '/maintenance/coming-soon2',
              target: true
            }
          ]
        },
        {
          id: 'under-construction-collapse',
          title: 'under-construction',
          type: 'collapse',
          children: [
            {
              id: 'under-construction-1',
              title: 'under-construction 1',
              type: 'item',
              url: '/maintenance/under-construction',
              target: true
            },
            {
              id: 'under-construction-2',
              title: 'under-construction 2',
              type: 'item',
              url: '/maintenance/under-construction2',
              target: true
            }
          ]
        }
      ]
    },
    {
      id: 'price',
      title: 'price',
      type: 'collapse',
      icon: icons.pricing,
      children: [
        {
          id: 'price1',
          title: 'price 1',
          type: 'item',
          url: '/price/price1'
        },
        {
          id: 'price2',
          title: 'price 2',
          type: 'item',
          url: '/price/price2'
        }
      ]
    },
    {
      id: 'contact-us',
      title: 'contact-us',
      type: 'item',
      url: '/contact-us',
      icon: icons.contactus,
      target: true
    },
    {
      id: 'landing',
      title: 'landing',
      type: 'item',
      icon: icons.landing,
      url: '/landing'
    }
  ]
};

export default pages;
