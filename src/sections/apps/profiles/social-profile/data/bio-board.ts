// assets
import { Global, Home2, Calendar, Sms, Profile2User, EmojiHappy, Heart, DocumentText } from '@wandersonalwes/iconsax-react';

export const bioBoardData = [
  {
    description:
      'It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.',
    contactInfo: [
      { icon: Global, label: 'https://phoenixcoded.net/' },
      { icon: Home2, label: 'Hanoi,Vietnam' },
      { icon: Calendar, label: 'Auguest,21,1996' },
      { icon: Sms, label: 'demo123@mail.com' }
    ],
    socialStats: [
      { icon: Profile2User, color: 'primary', label: 'Followers', value: '239k' },
      { icon: EmojiHappy, color: 'warning', label: 'Following', value: '539k' },
      { icon: Heart, color: 'error', label: 'Like', value: '539k' },
      { icon: DocumentText, color: 'success', label: 'Post', value: '400' }
    ]
  }
];
