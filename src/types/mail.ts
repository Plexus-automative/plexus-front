import type { ElementType } from 'react';

export interface Comment {
  id: number;
  from: string;
  text: string;
  avatar: string;
  forwarded?: ForwardedMail;
}

export interface ForwardedMail {
  from: string;
  fromEmail: string;
  date: string;
  to: string;
  toEmail: string;
  body: string;
}

export interface MailItem {
  id: number;
  from: string;
  subject: string;
  snippet: string;
  date: string;
  read: boolean;
  isStarred: boolean;
  avatar: string;
  label?: string[];
  important?: boolean;
  mail: string;
  to: string;
  attachments: string[];
  comments: Comment[];
}

export type InboxTab = 'primary' | 'promotions' | 'social' | 'updates' | 'announcement';

export type MailSection = 'sent' | 'draft' | 'spam' | 'trash' | 'starred' | 'important' | 'promotions' | 'forums';

export type MailListProp = {
  inbox: Record<InboxTab, MailItem[]>;
} & Partial<Record<MailSection, MailItem[]>>;

export interface AccordionItem {
  label: string;
  icon: ElementType;
  color?: string;
  count?: number;
}

export interface AccordionSection {
  title: string;
  items: AccordionItem[];
}
