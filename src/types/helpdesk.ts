// ==============================|| TYPES - HELPDESK ||============================== //

type ProgressItem = {
  label: string;
  value: number;
};

export type SocialSourceCardProps = {
  title: string;
  progressData: ProgressItem[];
  color: any;
};

export interface TicketCommonCardProps {
  borderLeft?: boolean;
  borderColor?: string;
  showAvatarStack: boolean;
  showBox: boolean;
  customerAvatar: string;
  ticketCount: number;
  likes: number;
  customerName: string;
  chipLabel: string;
  productAvatar: string;
  productName: string;
  supporterAvatar: string;
  supporterName: string;
  updateTime: string;
  messageCount: number;
  issueTitle: string;
  addCode: string;
  removeCode: string;
  drawerOpen: () => void;
}

export interface TicketDetailProps {
  avatar: string;
  likes?: number;
  codeString?: string;
  ticketNumber?: number;
  supportAgentName: string;
  customerName: string;
  chipLabel: string;
  timeAgo: string;
  message: string;
  images: string[];
}

type Ticket = {
  avatar: string;
  color: string;
  name: string;
  badges?: { primary?: string; secondary?: string };
};

export type TicketNotificationsCardProps = {
  title: string;
  tickets: Ticket[];
};

export type MessageCardProps = {
  avatar: string;
  supportAgentName: string;
  customerName: string;
  role?: string;
  timeAgo: string;
  message: string;
  images?: string[];
  codeString?: string;
  onEdit?: () => void;
  onDelete?: () => void;
};
