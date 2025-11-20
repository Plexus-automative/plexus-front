// This is example of menu item without group for horizontal layout. There will be no children.

// assets
import { DocumentCode2 } from '@wandersonalwes/iconsax-react';

// types
import { NavItemType } from 'types/menu';

// icons
const icons = {
  samplePage: DocumentCode2
};

// ==============================|| MENU ITEMS - SAMPLE PAGE ||============================== //

const samplePage: NavItemType = {
  id: 'sample-page',
  title: 'sample-page',
  type: 'group',
  url: '/sample-page',
  icon: icons.samplePage
};

export default samplePage;
