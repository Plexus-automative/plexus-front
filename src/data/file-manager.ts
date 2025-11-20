// types
import { FileItem, FilterData } from 'types/file-manager';

// assets
import { FolderOpen, Image, Note1, VideoPlay } from '@wandersonalwes/iconsax-react';

const Doc = '/assets/images/file-manager/file-docs.svg';
const Xls = '/assets/images/file-manager/file-xls.svg';
const PDF = '/assets/images/file-manager/file-pdf.svg';
const rar = '/assets/images/file-manager/file-rar.svg';
const Image1 = '/assets/images/file-manager/file-demo.jpg';
const PPT = '/assets/images/file-manager/file-ppt.svg';
const AI = '/assets/images/file-manager/file-ai.svg';
const Txt = '/assets/images/file-manager/file-ai.svg';
const Gallery = '/assets/images/file-manager/file-ai.svg';

const Avatar1 = '/assets/images/users/avatar-1.png';
const Avatar2 = '/assets/images/users/avatar-2.png';
const Avatar3 = '/assets/images/users/avatar-3.png';
const Avatar4 = '/assets/images/users/avatar-4.png';
const Avatar5 = '/assets/images/users/avatar-5.png';

// quick filter data
export const quickFilterData: FilterData[] = [
  { title: 'Documents', files: 100, storageData: '15 GB', icon: Note1, color: 'primary' },
  { title: 'Videos', files: 100, storageData: '2.4 GB', icon: VideoPlay, color: 'error' },
  { title: 'Images', files: 100, storageData: '2.4 GB', icon: Image, color: 'success' }
];

// recent files data
export const recentFilesData: FilterData[] = [
  { title: 'Documents', files: 24, icon: FolderOpen },
  { title: 'Root', files: 50, icon: FolderOpen },
  { title: 'Images', files: 100, icon: FolderOpen },
  { title: 'Music and video', files: 100, icon: FolderOpen }
];

export const FileData: FileItem[] = [
  {
    id: 1,
    name: 'Project-Report.docx',
    category: 'Documents',
    date: '12 Jan 2023',
    img: Doc,
    size: '1.2 MB',
    avatar: [Avatar3, Avatar1, Avatar2]
  },
  {
    id: 2,
    name: 'Meeting-Notes.pdf',
    category: 'Documents',
    date: '28 Feb 2023',
    img: Xls,
    size: '500 KB',
    avatar: [Avatar1, Avatar2]
  },
  {
    id: 3,
    name: 'Invoice-June.xlsx',
    category: 'Documents',
    date: '16 Mar 2023',
    img: PDF,
    users: [Avatar1, Avatar2, Avatar3],
    size: '2.3 MB',
    avatar: [Avatar4, Avatar1, Avatar2, Avatar3],
    selected: true
  },
  {
    id: 4,
    name: 'Presentation-Q2.pptx',
    category: 'Documents',
    date: '05 Apr 2023',
    img: Xls,
    size: '1.5 MB',
    avatar: [Avatar3, Avatar1, Avatar4, Avatar5, Avatar2]
  },
  {
    id: 5,
    name: 'Product-Launch.mp4',
    category: 'Videos',
    date: '21 May 2023',
    img: rar,
    size: '10 MB',
    avatar: [Avatar1, Avatar4, Avatar5]
  },
  {
    id: 6,
    name: 'Demo-Reel.mov',
    category: 'Gallery',
    date: '10 Jun 2023',
    img: Image1,
    size: '15 MB',
    avatar: [Avatar2, Avatar5],
    selected: true
  },
  {
    id: 7,
    name: 'Training-Session.avi',
    category: 'Videos',
    date: '17 Jul 2023',
    img: PPT,
    size: '20 MB',
    avatar: [Avatar1, Avatar2, Avatar3, Avatar4]
  },
  {
    id: 8,
    name: 'Company-Overview.mkv',
    category: 'Videos',
    date: '23 Aug 2023',
    img: AI,
    size: '25 MB',
    avatar: [Avatar1, Avatar2, Avatar3, Avatar4, Avatar5]
  },
  {
    id: 9,
    name: 'Team-Photo.jpg',
    category: 'Images',
    date: '04 Sep 2023',
    img: PPT,
    size: '3 MB',
    avatar: [Avatar4, Avatar1, Avatar3, Avatar5],
    selected: true
  },
  {
    id: 10,
    name: 'Logo-Design.png',
    category: 'Images',
    date: '22 Oct 2023',
    img: Txt,
    users: [Avatar3, Avatar2, Avatar1, Avatar4, Avatar5],
    size: '500 KB',
    avatar: [Avatar5, Avatar4, Avatar3, Avatar2, Avatar1]
  },
  {
    id: 11,
    name: 'Banner-Final.webp',
    category: 'Images',
    date: '30 Nov 2023',
    img: Gallery,
    size: '1.8 MB',
    avatar: [Avatar1, Avatar3, Avatar2, Avatar4],
    selected: true
  },
  {
    id: 12,
    name: 'Office-Render.tiff',
    category: 'Images',
    date: '14 Dec 2023',
    img: Doc,
    size: '2.1 MB',
    avatar: [Avatar2, Avatar3, Avatar5]
  },
  {
    id: 13,
    name: 'Podcast-Ep1.mp3',
    category: 'Audio',
    date: '08 Jan 2024',
    img: rar,
    size: '50 MB',
    avatar: [Avatar4, Avatar2]
  },
  {
    id: 14,
    name: 'Soundtrack.wav',
    category: 'Documents',
    date: '19 Feb 2024',
    img: Doc,
    size: '30 MB',
    avatar: [Avatar1, Avatar3, Avatar5],
    selected: true
  },
  {
    id: 15,
    name: 'Voice-Note.m4a',
    category: 'Audio',
    date: '25 Mar 2024',
    img: PPT,
    size: '10 MB',
    avatar: [Avatar2, Avatar3, Avatar4, Avatar1]
  },
  {
    id: 16,
    name: 'Audio-Clip.aac',
    category: 'Audio',
    date: '01 Apr 2024',
    img: AI,
    size: '5 MB',
    avatar: [Avatar1, Avatar2, Avatar3, Avatar4, Avatar5],
    selected: true
  }
];

// user data
export const usersData = [
  {
    name: 'Addie Bass',
    role: 'Owner',
    avatar: Avatar1,
    disabled: false
  },
  {
    name: 'Mark E. Kinder',
    role: '',
    avatar: Avatar2,
    permission: 'Can Edit',
    disabled: true
  },
  {
    name: 'Quentin',
    role: '',
    avatar: 'Q',
    permission: 'Can Edit',
    disabled: false
  },
  {
    name: 'Richard J. Doran',
    role: '',
    avatar: Avatar4,
    permission: 'Can View',
    disabled: false
  }
];

// user list data
export const users = [
  {
    name: 'John Doe',
    email: 'John_Doe@ablepro.io',
    avatar: Avatar1
  },
  {
    name: 'Addie Bass',
    email: 'Addie_B@ablepro.io',
    avatar: Avatar2
  },
  {
    name: 'Alberta Robbins',
    email: 'Addie_B@ablepro.io',
    avatar: Avatar3
  },
  {
    name: 'Agnes McGee',
    email: 'Agnes.Gee@ablepro.io',
    avatar: Avatar4
  }
];
