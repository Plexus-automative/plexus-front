// assets
import { DocumentText1, Notification, ShoppingCart } from '@wandersonalwes/iconsax-react';

const Avatar1 = '/assets/images/users/avatar-1.png';
const Avatar2 = '/assets/images/users/avatar-2.png';
const Avatar3 = '/assets/images/users/avatar-3.png';
const Avatar4 = '/assets/images/users/avatar-4.png';
const Avatar5 = '/assets/images/users/avatar-5.png';

const Image1 = '/assets/images/widget/dashborad-1.jpg';
const Image2 = '/assets/images/widget/dashborad-2.jpg';
const Image3 = '/assets/images/widget/dashborad-3.jpg';

// message card data
export const messageData = [
  {
    avatar: Avatar2,
    supportAgentName: 'Michael',
    customerName: 'John Luis',
    likes: 4,
    chipLabel: 'replied',
    timeAgo: '1 day ago on Wednesday at 8:18am',
    message: `<p>you need to create&nbsp;<strong>"toolbar-options" div only once</strong>&nbsp;in a page in your code, this div fill found&nbsp;<strong>every "td"</strong>&nbsp;tag in your page, just remove those things.</p><p><br></p><p>and also</p><p><br></p><p>in option button add&nbsp;<strong>"p-0" class in "I"</strong> tag&nbsp;to</p><p><br></p><p>Thanks...</p>`,
    images: [],
    ticketNumber: null,
    codeString: `<pre>
    <code class="language-css">
      p {
          color: #1abc9c
      }
    </code>
  </pre>`
  },
  {
    avatar: Avatar1,
    likes: 4,
    supportAgentName: 'Robert Alia',
    customerName: 'John Luis',
    chipLabel: 'replied',
    timeAgo: '1 day ago on Wednesday at 8:18am',
    message: `<p>you need to create&nbsp;<strong>"toolbar-options" div only once</strong>&nbsp;in a page in your code, this div fill found&nbsp;<strong>every "td"</strong>&nbsp;tag in your page, just remove those things.</p><p><br></p><p>and also</p><p><br></p><p>in option button add&nbsp;<strong>"p-0" class in "I"</strong> tag&nbsp;to</p><p><br></p><p>Thanks...</p>`,
    images: [Image1, Image2, Image3, Image1, Image2],
    ticketNumber: 1,
    codeString: false
  },
  {
    avatar: Avatar2,
    likes: 4,
    supportAgentName: 'Michael',
    customerName: 'John Luis',
    chipLabel: 'replied',
    timeAgo: '1 day ago on Wednesday at 8:18am',
    message: `<p>you need to create&nbsp;<strong>"toolbar-options" div only once</strong>&nbsp;in a page in your code, this div fill found&nbsp;<strong>every "td"</strong>&nbsp;tag in your page, just remove those things.</p><p><br></p><p>and also</p><p><br></p><p>in option button add&nbsp;<strong>"p-0" class in "I"</strong> tag&nbsp;to</p><p><br></p><p>Thanks...</p>`,
    images: [],
    ticketNumber: null,
    codeString: `<pre>
    <code class="language-css">
      p {
          color: #1abc9c
      }
    </code>
  </pre>`
  }
];

// support card data
export const supportData = [
  {
    count: 350,
    title: 'Support Requests',
    details: 'Total number of support requests that come in.',
    color: 'info.main',
    open: 10,
    running: 5,
    solved: 3,
    fullWidth: false,
    chartData: [0, 20, 10, 45, 30, 55, 20, 30, 0]
  },
  {
    count: 500,
    title: 'Agent Response',
    details: 'Total number of support requests that come in.',
    color: 'primary.main',
    open: 50,
    running: 75,
    solved: 30,
    fullWidth: false,
    chartData: [0, 20, 10, 45, 30, 55, 20, 30, 0]
  },
  {
    count: 800,
    title: 'Support Resolved',
    details: 'Total number of support requests that come in.',
    color: 'success.main',
    open: 80,
    running: 60,
    solved: 90,
    fullWidth: true,
    chartData: [0, 20, 10, 45, 30, 55, 20, 30, 0]
  }
];

// social source data
export const sourceData = [
  {
    title: 'Facebook Source',
    color: 'primary',
    progressData: [
      { label: 'Page Profile', value: 25 },
      { label: 'Favorite', value: 80 },
      { label: 'Like Story', value: 70 }
    ]
  },
  {
    title: 'Twitter Source',
    color: 'error',
    progressData: [
      { label: 'Wall Profile', value: 85 },
      { label: 'Favorite', value: 25 },
      { label: 'Like Tweets', value: 70 }
    ]
  }
];

// ticket data
export const ticketData = [
  {
    chipLabel: 'Replied',
    customerName: 'John Lui',
    ticketCount: 1,
    issueTitle: 'Theme customization issue',
    likes: 3,
    customerAvatar: Avatar1,
    productAvatar: 'A',
    productName: 'Piaf able',
    supporterAvatar: Avatar2,
    supporterName: 'Tom Hae',
    updateTime: '22 hours ago',
    addCode: '"toolbar-options" div only',
    removeCode: 'this div fill found every "td" tag in your page,',
    borderLeft: false,
    messageCount: 9
  },
  {
    chipLabel: 'Replied',
    customerName: 'John Lui',
    ticketCount: 1,
    issueTitle: 'Theme customization issue',
    likes: 3,
    customerAvatar: Avatar1,
    productAvatar: 'A',
    productName: 'Piaf able',
    supporterAvatar: Avatar2,
    supporterName: 'Tom Hae',
    updateTime: '22 hours ago',
    messageCount: 9,
    addCode: '"toolbar-options" div only',
    removeCode: 'this div fill found every "td" tag in your page,',
    borderLeft: true,
    borderColor: 'error.main'
  },
  {
    chipLabel: 'Replied',
    customerName: 'John Lui',
    ticketCount: 1,
    issueTitle: 'Theme customization issue',
    likes: 3,
    customerAvatar: Avatar1,
    productAvatar: 'A',
    productName: 'Piaf able',
    supporterAvatar: Avatar2,
    supporterName: 'Tom Hae',
    updateTime: '22 hours ago',
    messageCount: 9,
    addCode: '"toolbar-options" div only',
    removeCode: 'this div fill found every "td" tag in your page,',
    borderLeft: true,
    borderColor: 'success.main'
  }
];

// ticket notifications data
export const ticketNotificationsData = [
  {
    title: 'Ticket Categories',
    notifications: [
      { avatar: 'A', color: 'success', name: 'Piaf able', badges: { primary: '1', secondary: '3' } },
      { avatar: 'B', color: 'primary', name: 'Pro able', badges: { secondary: '3' } },
      { avatar: 'C', color: 'info', name: 'CRM admin', badges: { primary: '1', secondary: '3' } },
      { avatar: 'D', color: 'warning', name: 'Alpha pro', badges: { secondary: '3' } },
      { avatar: 'E', color: 'error', name: 'Carbon able', badges: { secondary: '3' } }
    ]
  },
  {
    title: 'Support Aggent',
    notifications: [
      { avatar: Avatar1, color: 'success', name: 'Tom Cook', badges: { primary: '1', secondary: '3' } },
      { avatar: Avatar2, color: 'primary', name: 'Brad Larry', badges: { primary: '1', secondary: '3' } },
      { avatar: Avatar3, color: 'info', name: 'Jhon White', badges: { secondary: '3' } },
      { avatar: Avatar4, color: 'warning', name: 'Mark Jobs', badges: { secondary: '3' } },
      { avatar: Avatar5, color: 'error', name: 'John lui', badges: { secondary: '3' } }
    ]
  }
];

// ticket details list data
export const listData = [
  {
    primary: 'Customer',
    secondaryText: 'Jack Pall',
    avatar: { src: Avatar2, alt: 'Customer Avatar' }
  },
  {
    primary: 'Contact',
    secondaryText: 'mail@mail.com',
    icon: 'MessageText'
  },
  {
    primary: 'Category',
    secondaryText: 'able pro',
    avatar: { text: 'A', color: 'success' }
  },
  {
    primary: 'Assigned',
    secondaryText: 'Lina Hop',
    avatar: { src: Avatar3, alt: 'Assigned Avatar' }
  },
  {
    primary: 'Created',
    secondaryText: 'Date',
    icon: 'Calendar'
  },
  {
    primary: 'Response',
    secondaryText: 'Time',
    icon: 'Clock'
  }
];

// activity data
export const activityData = [
  { avatar: Notification, color: 'primary', text: 'You have 3 pending tasks.', timeStamp: 'Just Now' },
  { avatar: ShoppingCart, color: 'error', text: 'New order received', timeStamp: 'Just Now' },
  { avatar: DocumentText1, color: 'success', text: 'You have 2 pending tasks. ', timeStamp: 'Just Now' },
  { avatar: ShoppingCart, color: 'warning', text: 'New order received', timeStamp: 'Just Now' },
  { avatar: Notification, color: 'primary', text: 'You have 3 pending tasks.', timeStamp: 'Just Now' },
  { avatar: ShoppingCart, color: 'error', text: 'New order received', timeStamp: 'Just Now' },
  { avatar: Notification, color: 'primary', text: 'You have 3 pending tasks.', timeStamp: 'Just Now' },
  { avatar: ShoppingCart, color: 'error', text: 'New order received', timeStamp: 'Just Now' },
  { avatar: DocumentText1, color: 'success', text: 'You have 2 pending tasks. ', timeStamp: 'Just Now' },
  { avatar: ShoppingCart, color: 'warning', text: 'New order received', timeStamp: 'Just Now' }
];
