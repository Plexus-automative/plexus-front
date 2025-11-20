// project-imports
import { NavItemType } from 'types/menu';

// ==============================|| MENU ITEMS - COMPONENTS ||============================== //

const menuItems: NavItemType[] = [
  {
    id: 'group-inputs',
    title: 'inputs',
    type: 'group',
    children: [
      {
        id: 'autocomplete',
        search: 'autocomplete, combo box, country select, grouped, multi select',
        title: 'autocomplete',
        type: 'item',
        url: '/components-overview/autocomplete'
      },
      {
        id: 'buttons',
        search: 'buttons, button group, icon button, toggle button, loading button',
        title: 'button',
        type: 'item',
        url: '/components-overview/buttons'
      },
      {
        id: 'checkbox',
        search: 'checkbox, indeterminate',
        title: 'checkbox',
        type: 'item',
        url: '/components-overview/checkbox'
      },
      {
        id: 'radio',
        search: 'radio',
        title: 'radio',
        type: 'item',
        url: '/components-overview/radio'
      },
      {
        id: 'rating',
        search: 'rating, star rating, feedback',
        title: 'rating',
        type: 'item',
        url: '/components-overview/rating'
      },
      {
        id: 'switch',
        search: 'switch',
        title: 'switch',
        type: 'item',
        url: '/components-overview/switch'
      },
      {
        id: 'select',
        search: 'select, multi-select',
        title: 'select',
        type: 'item',
        url: '/components-overview/select'
      },
      {
        id: 'slider',
        search: 'slider, range',
        title: 'slider',
        type: 'item',
        url: '/components-overview/slider'
      },
      {
        id: 'textfield',
        search: 'textfield, input, form input, search',
        title: 'text-field',
        type: 'item',
        url: '/components-overview/textfield'
      }
    ]
  },
  {
    id: 'data-display',
    title: 'data-display',
    type: 'group',
    children: [
      {
        id: 'avatars',
        search: 'avatars, fallbacks, group avatar',
        title: 'avatar',
        type: 'item',
        url: '/components-overview/avatars'
      },
      {
        id: 'badges',
        search: 'badges',
        title: 'badges',
        type: 'item',
        url: '/components-overview/badges'
      },
      {
        id: 'chips',
        search: 'chips, tags, ',
        title: 'chip',
        type: 'item',
        url: '/components-overview/chips'
      },
      {
        id: 'lists',
        search: 'lists, folder list, nested list',
        title: 'list',
        type: 'item',
        url: '/components-overview/lists'
      },
      {
        id: 'tooltip',
        search: 'tooltip',
        title: 'tooltip',
        type: 'item',
        url: '/components-overview/tooltip'
      },
      {
        id: 'typography',
        search: 'typography, h1, h2,h3, h4, h5, h6, caption, subtitle, body',
        title: 'typography',
        type: 'item',
        url: '/components-overview/typography'
      }
    ]
  },
  {
    id: 'feedback',
    title: 'feedback',
    type: 'group',
    children: [
      {
        id: 'alert',
        search: 'alert',
        title: 'alert',
        type: 'item',
        url: '/components-overview/alert'
      },
      {
        id: 'dialogs',
        search: 'dialogs, modal, sweetalert, confirmation box',
        title: 'dialogs',
        type: 'item',
        url: '/components-overview/dialogs'
      },
      {
        id: 'progress',
        search: 'progress, circular, linear, buffer',
        title: 'progress',
        type: 'item',
        url: '/components-overview/progress'
      },
      {
        id: 'snackbar',
        search: 'snackbar, notification, notify',
        title: 'snackbar',
        type: 'item',
        url: '/components-overview/snackbar'
      }
    ]
  },
  {
    id: 'navigation',
    title: 'navigation',
    type: 'group',
    children: [
      {
        id: 'breadcrumbs',
        search: 'breadcrumbs',
        title: 'breadcrumb',
        type: 'item',
        url: '/components-overview/breadcrumbs'
      },
      {
        id: 'pagination',
        search: 'pagination, table pagination',
        title: 'pagination',
        type: 'item',
        url: '/components-overview/pagination'
      },
      {
        id: 'speeddial',
        search: 'speeddial, speed dial, quick access button, fab button',
        title: 'speed-dial',
        type: 'item',
        url: '/components-overview/speeddial'
      },
      {
        id: 'stepper',
        search: 'stepper, form wizard, vertical stepper, vertical wizard',
        title: 'stepper',
        type: 'item',
        url: '/components-overview/stepper'
      },
      {
        id: 'tabs',
        search: 'tabs, vertical tab',
        title: 'tabs',
        type: 'item',
        url: '/components-overview/tabs'
      }
    ]
  },
  {
    id: 'surfaces',
    title: 'surfaces',
    type: 'group',
    children: [
      {
        id: 'accordion',
        search: 'accordion',
        title: 'accordion',
        type: 'item',
        url: '/components-overview/accordion'
      },
      {
        id: 'cards',
        search: 'cards',
        title: 'cards',
        type: 'item',
        url: '/components-overview/cards'
      }
    ]
  },
  {
    id: 'utils',
    title: 'utils',
    type: 'group',
    children: [
      {
        id: 'color',
        search: 'color',
        title: 'color',
        type: 'item',
        url: '/components-overview/color'
      },
      {
        id: 'date-time-picker',
        search: 'datetime, date, time date time, picker, date range picker',
        title: 'datetime',
        type: 'item',
        url: '/components-overview/date-time-picker'
      },
      {
        id: 'modal',
        search: 'modal, dialog',
        title: 'modal',
        type: 'item',
        url: '/components-overview/modal'
      },
      {
        id: 'shadows',
        search: 'shadows, color shadow',
        title: 'shadow',
        type: 'item',
        url: '/components-overview/shadows'
      },
      {
        id: 'timeline',
        search: 'timeline, list of event',
        title: 'timeline',
        type: 'item',
        url: '/components-overview/timeline'
      },
      {
        id: 'treeview',
        search: 'treeview, email clone',
        title: 'treeview',
        type: 'item',
        url: '/components-overview/treeview'
      }
    ]
  }
];

export default menuItems;
