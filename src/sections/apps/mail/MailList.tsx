import { SyntheticEvent, useEffect, useMemo, useState } from 'react';

// material-ui
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';

// project-imports
import MailDetail from './MailDetail';
import MailListTable from './MailListTable';
import MailEmptyState from './MailEmptyState';
import MainCard from 'components/MainCard';
import SimpleBar from 'components/third-party/SimpleBar';

// types
import { InboxTab, MailItem } from 'types/mail';

// assets
import { DocumentText1, Lock1, Personalcard, Profile2User, User } from '@wandersonalwes/iconsax-react';

interface MailListProps {
  mails: MailItem[] | Record<InboxTab, MailItem[]>;
  activeTab: InboxTab;
  setActiveTab: (tab: InboxTab) => void;
  selectedMenu: string;
  fullRow: boolean;
  isDetailOpen: boolean;
  openDetail: () => void;
  closeDetail: () => void;
}

// ==============================|| MAIL LIST ||============================== //

export default function MailList({
  mails,
  activeTab,
  setActiveTab,
  selectedMenu,
  fullRow,
  isDetailOpen,
  openDetail,
  closeDetail
}: MailListProps) {
  const [tabIndex, setTabIndex] = useState<number>(0);
  const [detailData, setDetailData] = useState<MailItem | undefined>();

  const tabKeys: InboxTab[] = ['primary', 'promotions', 'social', 'updates', 'announcement'];

  const handleTabChange = (_: SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
    setActiveTab(tabKeys[newValue]);
  };

  const mailsData = useMemo<MailItem[]>(() => {
    return Array.isArray(mails) ? mails : mails?.[activeTab] || [];
  }, [mails, activeTab]);

  const [data, setData] = useState<MailItem[]>([]);

  useEffect(() => {
    setData(mailsData);
  }, [mailsData]);

  const toggleStar = (id: number) => {
    setData((prev) => prev.map((m) => (m.id === id ? { ...m, isStarred: !m.isStarred } : m)));
    if (detailData?.id === id) {
      setDetailData((prev) => prev && { ...prev, isStarred: !prev.isStarred });
    }
  };

  const toggleImportant = (id: number) => {
    setData((prev) => prev.map((m) => (m.id === id ? { ...m, important: !m.important } : m)));
    if (detailData?.id === id) {
      setDetailData((prev) => prev && { ...prev, important: !prev.important });
    }
  };

  return (
    <MainCard sx={{ p: 0 }} content={false}>
      {isDetailOpen ? (
        <SimpleBar sx={{ height: 640, my: 3 }}>
          <MailDetail detailData={detailData} toggleStar={toggleStar} toggleImportant={toggleImportant} closeDetail={closeDetail} />
        </SimpleBar>
      ) : (
        <Stack gap={1.5}>
          {selectedMenu === 'inbox' && (
            <Tabs
              value={tabIndex}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons={false}
              aria-label="mail tabs"
              textColor="primary"
              sx={{ p: 3, pb: 0 }}
            >
              <Tab icon={<User />} iconPosition="start" label="Primary" />
              <Tab icon={<DocumentText1 />} iconPosition="start" label="Promotions" />
              <Tab icon={<Personalcard />} iconPosition="start" label="Social" />
              <Tab icon={<Lock1 />} iconPosition="start" label="Updates" />
              <Tab icon={<Profile2User />} iconPosition="start" label="Announcement" />
            </Tabs>
          )}

          <SimpleBar sx={{ height: 640, my: 3, ...(selectedMenu === 'inbox' && { mt: 0 }) }}>
            <Box sx={{ px: 3 }}>
              {mailsData.length > 0 ? (
                <MailListTable
                  data={data}
                  toggleStar={toggleStar}
                  toggleImportant={toggleImportant}
                  fullRow={fullRow}
                  setDetailData={setDetailData}
                  openDetail={openDetail}
                />
              ) : (
                <MailEmptyState />
              )}
            </Box>
          </SimpleBar>
        </Stack>
      )}
    </MainCard>
  );
}
