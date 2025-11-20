import { ElementType } from 'react';

// assets
import { Brush2, Colorfilter } from '@wandersonalwes/iconsax-react';

// types
import { ColorProps } from 'types/extended';

export interface TeamPageData {
  title: string;
  avatar: {
    icon: ElementType;
    color: ColorProps;
  };
}

export const teamPagesData: TeamPageData[] = [
  {
    title: 'UI Design Team',
    avatar: {
      icon: Brush2,
      color: 'primary'
    }
  },
  {
    title: 'Creative Team',
    avatar: {
      icon: Colorfilter,
      color: 'warning'
    }
  }
];
