// types
import type { AccordionItem, AccordionSection } from 'types/mail';

// assets
import { DirectInbox, DocumentText1, Flag, Send2, Star1, Trash, Warning2 } from '@wandersonalwes/iconsax-react';

export const mainItems: AccordionItem[] = [
  { label: 'Inbox', icon: DirectInbox, count: 4 },
  { label: 'Sent', icon: Send2 },
  { label: 'Draft', icon: DocumentText1 },
  { label: 'Spam', icon: Warning2 },
  { label: 'Trash', icon: Trash, count: 2 }
];

export const accordions: AccordionSection[] = [
  {
    title: 'Filters',
    items: [
      { label: 'Starred', icon: Star1 },
      { label: 'Important', icon: Flag, count: 2 }
    ]
  },
  {
    title: 'Label',
    items: [
      { label: 'Promotions', icon: Flag, color: 'primary.main', count: 3 },
      { label: 'Forums', icon: Flag, color: 'warning.main', count: 1 }
    ]
  }
];
