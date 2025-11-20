import { ElementType } from 'react';

// material-ui
import { ChipProps } from '@mui/material';

export interface FilterData {
  title: string;
  files: number;
  storageData?: string;
  icon?: ElementType;
  color?: ChipProps['color'];
}

export interface FileItem {
  id: number;
  name: string;
  category: string;
  date: string;
  img: string;
  users?: string[];
  size?: string;
  avatar?: string[];
  selected?: boolean;
}
