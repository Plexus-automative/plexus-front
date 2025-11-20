// assets
import { Story, Fatrows, PresentionChart } from '@wandersonalwes/iconsax-react';

// types
import { NavItemType } from 'types/menu';

// icons
const icons = {
  widgets: Story,
  statistics: Story,
  data: Fatrows,
  chart: PresentionChart
};

// ==============================|| MENU ITEMS - WIDGETS ||============================== //

const widget: NavItemType = {
  id: 'group-widget',
  title: 'widgets',
  icon: icons.widgets,
  type: 'group',
  children: [
    {
      id: 'statistics',
      title: 'statistics',
      type: 'item',
      url: '/widget/statistics',
      icon: icons.statistics
    },
    {
      id: 'data',
      title: 'data',
      type: 'item',
      url: '/widget/data',
      icon: icons.data
    },
    {
      id: 'chart',
      title: 'chart',
      type: 'item',
      url: '/widget/chart',
      icon: icons.chart
    }
  ]
};

export default widget;
