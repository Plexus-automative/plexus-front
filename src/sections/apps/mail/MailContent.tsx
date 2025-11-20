import { useEffect, useState } from 'react';

// material-ui
import Stack from '@mui/material/Stack';

// project-imports
import MailToolbar from './MailToolbar';
import MailList from './MailList';

// types
import { InboxTab, MailItem } from 'types/mail';

interface MailContentProps {
  toggleDrawer: () => void;
  mails: MailItem[] | Record<InboxTab, MailItem[]>;
  selectedMenu: string;
  isDetailOpen: boolean;
  openDetail: () => void;
  closeDetail: () => void;
}

// ==============================|| MAIL CONTENT ||============================== //

export default function MailContent({ toggleDrawer, mails, selectedMenu, isDetailOpen, openDetail, closeDetail }: MailContentProps) {
  const [searchText, setSearchText] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [filter, setFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<InboxTab>('primary');
  const [fullRow, setFullRow] = useState<boolean>(true);
  const itemsPerPage = 10;

  const mailsData = Array.isArray(mails) ? mails : mails?.[activeTab] || [];

  const filteredData = mailsData
    .filter((file) => {
      let matchesFilter = false;
      switch (filter) {
        case 'isStarred':
          matchesFilter = file.isStarred === true;
          break;
        case 'read':
          matchesFilter = file.read === false;
          break;
        case 'all':
        case 'from':
        case 'date':
        default:
          matchesFilter = true;
          break;
      }
      const matchesSearch = file.from.toLowerCase().includes(searchText.toLowerCase());
      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => {
      if (filter === 'from') return a.from.localeCompare(b.from);
      if (filter === 'date') return new Date(a.date).getTime() - new Date(b.date).getTime();
      return 0;
    });

  const paginatedData = filteredData.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  useEffect(() => {
    setPage(1);
  }, [searchText, filter, activeTab]);

  return (
    <Stack sx={{ gap: 2.5 }}>
      <MailToolbar
        toggleDrawer={toggleDrawer}
        searchText={searchText}
        setSearchText={setSearchText}
        setFilter={setFilter}
        page={page}
        setPage={setPage}
        totalCount={filteredData.length}
        rowsPerPage={itemsPerPage}
        setFullRow={setFullRow}
        fullRow={fullRow}
      />
      <MailList
        fullRow={fullRow}
        mails={paginatedData}
        setActiveTab={setActiveTab}
        activeTab={activeTab}
        selectedMenu={selectedMenu}
        closeDetail={closeDetail}
        isDetailOpen={isDetailOpen}
        openDetail={openDetail}
      />
    </Stack>
  );
}
