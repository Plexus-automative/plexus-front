// assets
import { Book, PasswordCheck, Next, RowVertical, CpuCharge, TableDocument, Subtitle } from '@wandersonalwes/iconsax-react';

// types
import { NavItemType } from 'types/menu';

// icons
const icons = {
  formsTable: Book,
  validation: PasswordCheck,
  wizard: Next,
  layout: RowVertical,
  plugins: CpuCharge,
  reactTables: TableDocument,
  muiTables: Subtitle
};

// ==============================|| MENU ITEMS - FORMS & TABLES ||============================== //

const formsTables: NavItemType = {
  id: 'group-forms-tables',
  title: 'forms-tables',
  icon: icons.formsTable,
  type: 'group',
  children: [
    {
      id: 'validation',
      title: 'forms-validation',
      type: 'item',
      url: '/forms/validation',
      icon: icons.validation
    },
    {
      id: 'wizard',
      title: 'forms-wizard',
      type: 'item',
      url: '/forms/wizard',
      icon: icons.wizard
    },
    {
      id: 'forms-layout',
      title: 'layout',
      type: 'collapse',
      icon: icons.layout,
      children: [
        {
          id: 'basic',
          title: 'basic',
          type: 'item',
          url: '/forms/layout/basic'
        },
        {
          id: 'multi-column',
          title: 'multi-column',
          type: 'item',
          url: '/forms/layout/multi-column'
        },
        {
          id: 'action-bar',
          title: 'action-bar',
          type: 'item',
          url: '/forms/layout/action-bar'
        },
        {
          id: 'sticky-bar',
          title: 'sticky-bar',
          type: 'item',
          url: '/forms/layout/sticky-bar'
        }
      ]
    },
    {
      id: 'forms-plugins',
      title: 'plugins',
      type: 'collapse',
      icon: icons.plugins,
      children: [
        {
          id: 'mask',
          title: 'mask',
          type: 'item',
          url: '/forms/plugins/mask'
        },
        {
          id: 'clipboard',
          title: 'clipboard',
          type: 'item',
          url: '/forms/plugins/clipboard'
        },
        {
          id: 're-captcha',
          title: 're-captcha',
          type: 'item',
          url: '/forms/plugins/re-captcha'
        },
        {
          id: 'editor',
          title: 'editor',
          type: 'item',
          url: '/forms/plugins/editor'
        },
        {
          id: 'dropzone',
          title: 'dropzone',
          type: 'item',
          url: '/forms/plugins/dropzone'
        }
      ]
    },
    {
      id: 'tanstack-tables',
      title: 'tanstack-table',
      type: 'collapse',
      icon: icons.reactTables,
      children: [
        {
          id: 'rt-table',
          title: 'basic',
          type: 'item',
          url: '/tables/react-table/basic'
        },
        {
          id: 'rt-dense',
          title: 'dense',
          type: 'item',
          url: '/tables/react-table/dense'
        },
        {
          id: 'rt-sorting',
          title: 'sorting',
          type: 'item',
          url: '/tables/react-table/sorting'
        },
        {
          id: 'rt-filtering',
          title: 'filtering',
          type: 'item',
          url: '/tables/react-table/filtering'
        },
        {
          id: 'rt-grouping',
          title: 'grouping',
          type: 'item',
          url: '/tables/react-table/grouping'
        },
        {
          id: 'rt-pagination',
          title: 'pagination',
          type: 'item',
          url: '/tables/react-table/pagination'
        },
        {
          id: 'rt-row-selection',
          title: 'row-selection',
          type: 'item',
          url: '/tables/react-table/row-selection'
        },
        {
          id: 'rt-expanding',
          title: 'expanding',
          type: 'item',
          url: '/tables/react-table/expanding'
        },
        {
          id: 'rt-editable',
          title: 'editable',
          type: 'item',
          url: '/tables/react-table/editable'
        },
        {
          id: 'rt-drag-drop',
          title: 'drag-drop',
          type: 'item',
          url: '/tables/react-table/drag-drop'
        },
        {
          id: 'rt-column-visibility',
          title: 'column-visibility',
          type: 'item',
          url: '/tables/react-table/column-visibility'
        },
        {
          id: 'rt-column-resizing',
          title: 'column-resizing',
          type: 'item',
          url: '/tables/react-table/column-resizing'
        },
        {
          id: 'rt-sticky-table',
          title: 'sticky',
          type: 'item',
          url: '/tables/react-table/sticky-table'
        },
        {
          id: 'rt-umbrella',
          title: 'umbrella',
          type: 'item',
          url: '/tables/react-table/umbrella'
        },
        {
          id: 'rt-empty',
          title: 'empty',
          type: 'item',
          url: '/tables/react-table/empty'
        },
        {
          id: 'rt-virtualized',
          title: 'virtualized',
          type: 'item',
          url: '/tables/react-table/virtualized'
        }
      ]
    },
    {
      id: 'mui-tables',
      title: 'mui-table',
      type: 'collapse',
      icon: icons.muiTables,
      children: [
        {
          id: 'mui-table',
          title: 'basic',
          type: 'item',
          url: '/tables/mui-table/basic'
        },
        {
          id: 'mui-dense',
          title: 'dense',
          type: 'item',
          url: '/tables/mui-table/dense'
        },
        {
          id: 'mui-enhanced',
          title: 'enhanced',
          type: 'item',
          url: '/tables/mui-table/enhanced'
        },
        {
          id: 'mui-data-table',
          title: 'datatable',
          type: 'item',
          url: '/tables/mui-table/datatable'
        },
        {
          id: 'mui-custom',
          title: 'custom',
          type: 'item',
          url: '/tables/mui-table/custom'
        },
        {
          id: 'mui-fixed-header',
          title: 'fixed-header',
          type: 'item',
          url: '/tables/mui-table/fixed-header'
        },
        {
          id: 'mui-collapse',
          title: 'collapse',
          type: 'item',
          url: '/tables/mui-table/collapse'
        }
      ]
    }
  ]
};

export default formsTables;
