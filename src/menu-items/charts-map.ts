// assets
import { Graph, Chart21, Map1 } from '@wandersonalwes/iconsax-react';

// types
import { NavItemType } from 'types/menu';

// icons
const icons = {
  charts: Chart21,
  chart: Graph,
  map: Map1
};

// ==============================|| MENU ITEMS - CHARTS & MAPS ||============================== //

const chartsMap: NavItemType = {
  id: 'group-charts-map',
  title: 'charts-map',
  icon: icons.charts,
  type: 'group',
  children: [
    {
      id: 'react-chart',
      title: 'charts',
      type: 'collapse',
      icon: icons.chart,
      children: [
        {
          id: 'apexchart',
          title: 'apexchart',
          type: 'item',
          url: '/charts/apexchart'
        },
        {
          id: 'org-chart',
          title: 'org-chart',
          type: 'item',
          url: '/charts/org-chart'
        }
      ]
    },
    {
      id: 'map',
      title: 'map',
      type: 'item',
      url: '/map',
      icon: icons.map
    }
  ]
};

export default chartsMap;
