'use client';

import { useState, useMemo } from 'react';

// material-ui
import { styled } from '@mui/material/styles';
import Stack from '@mui/material/Stack';

// project-imports
import MailContent from 'sections/apps/mail/MailContent';
import MailDrawer from 'sections/apps/mail/MailDrawer';
import { useMailDrawer } from 'sections/apps/mail/useMailDrawer';
import { mailList } from 'sections/apps/mail/data/mail-list';

// drawer content element
const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{ open: boolean }>(({ theme, open }) => ({
  width: 'calc(100% - 300px)',
  flexGrow: 1,
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.shorter
  }),
  marginLeft: `-${300}px`,
  [theme.breakpoints.down('xl')]: {
    paddingLeft: 0,
    marginLeft: 0
  },
  ...(open && {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.shorter
    }),
    marginLeft: 0
  })
}));

type MailMenuKey = keyof typeof mailList | keyof typeof labelFilters;

const getAllMails = (): any[] =>
  Object.values(mailList).flatMap((box: any) =>
    Array.isArray(box) ? box : Object.values(box).flatMap((arr: any) => (Array.isArray(arr) ? arr : []))
  );

const hasLabel = (mail: any, labelName: string) =>
  Array.isArray(mail.label)
    ? mail.label.some((l: string) => String(l).toLowerCase() === labelName)
    : typeof mail.label === 'string' && mail.label.toLowerCase() === labelName;

const hasFlag = (mail: any, ...keys: string[]) => keys.some((k) => Boolean(mail?.[k]) || String(mail?.[k]).toLowerCase() === 'true');

const labelFilters = {
  starred: (mail: any) => hasFlag(mail, 'isStarred', 'starred'),
  important: (mail: any) => hasFlag(mail, 'isImportant', 'important') || hasLabel(mail, 'important'),
  promotions: (mail: any) => hasLabel(mail, 'promotions'),
  forums: (mail: any) => hasLabel(mail, 'forums')
};

// ==============================|| MAIL PAGE ||============================== //

export default function Mail() {
  const { openDrawer, setOpenDrawer, toggleDrawer } = useMailDrawer(true);
  const [selectedMenu, setSelectedMenu] = useState<MailMenuKey>('inbox');
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const openDetail = () => setIsDetailOpen(true);
  const closeDetail = () => setIsDetailOpen(false);

  const handleSelect = (menu: string) => setSelectedMenu(menu.toLowerCase() as MailMenuKey);

  const mails = useMemo(() => {
    if (selectedMenu in labelFilters) {
      return getAllMails().filter(labelFilters[selectedMenu as keyof typeof labelFilters]);
    }
    if (selectedMenu === 'inbox') {
      return mailList.inbox;
    }
    const category = mailList[selectedMenu as keyof typeof mailList];
    return Array.isArray(category) ? category : Object.values(category || {}).flatMap((arr: any) => (Array.isArray(arr) ? arr : []));
  }, [selectedMenu]);

  const getCount = (label: string): number => {
    const key = label.toLowerCase();
    if (key in labelFilters) {
      return getAllMails().filter(labelFilters[key as keyof typeof labelFilters]).length;
    }
    const category = mailList[key as keyof typeof mailList];
    if (key === 'inbox' && typeof category === 'object' && category !== null) {
      return Object.keys(category).length;
    }
    return Array.isArray(category) ? category.length : 0;
  };

  return (
    <Stack direction="row" sx={{ gap: openDrawer ? 2.5 : 0, overflow: 'hidden' }}>
      <MailDrawer
        openDrawer={openDrawer}
        setOpenDrawer={setOpenDrawer}
        onSelect={handleSelect}
        getCount={getCount}
        closeDetail={closeDetail}
      />
      <Main open={openDrawer}>
        <MailContent
          toggleDrawer={toggleDrawer}
          mails={mails}
          selectedMenu={selectedMenu}
          isDetailOpen={isDetailOpen}
          openDetail={openDetail}
          closeDetail={closeDetail}
        />
      </Main>
    </Stack>
  );
}
