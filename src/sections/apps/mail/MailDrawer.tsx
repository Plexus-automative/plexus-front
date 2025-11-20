// material-ui
import useMediaQuery from '@mui/material/useMediaQuery';
import Drawer from '@mui/material/Drawer';
import Stack from '@mui/material/Stack';

// project-imports
import MainCard from 'components/MainCard';
import ComposeMail from './ComposeMail';
import MailNavigation from './MailNavigation';

interface MailDrawerProps {
  openDrawer: boolean;
  setOpenDrawer: (open: boolean) => void;
  onSelect: (menu: string) => void;
  getCount: (label: string) => number;
  closeDetail: () => void;
}

// ==============================|| MAIL DRAWER ||============================== //

export default function MailDrawer({ setOpenDrawer, openDrawer, onSelect, getCount, closeDetail }: MailDrawerProps) {
  const downLG = useMediaQuery((theme) => theme.breakpoints.down('lg'));

  return (
    <Drawer
      open={openDrawer}
      variant={downLG ? 'temporary' : 'persistent'}
      onClose={() => setOpenDrawer(false)}
      sx={{
        width: 300,
        flexShrink: 0,
        zIndex: { xs: 1200, xl: 0 },
        '& .MuiDrawer-paper': {
          width: 300,
          boxSizing: 'border-box',
          position: 'relative',
          borderRight: 'none',
          borderRadius: downLG ? 0 : 1.5,
          height: 'auto'
        }
      }}
      anchor="left"
      ModalProps={{ keepMounted: true }}
    >
      <MainCard sx={{ ...(downLG && { borderRadius: 0 }) }}>
        <Stack sx={{ gap: 3 }}>
          <ComposeMail />
          <MailNavigation onSelect={onSelect} getCount={getCount} closeDetail={closeDetail} />
        </Stack>
      </MainCard>
    </Drawer>
  );
}
