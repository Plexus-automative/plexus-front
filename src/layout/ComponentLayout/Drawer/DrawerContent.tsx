// material-ui
import Box from '@mui/material/Box';

// project-imports
import Navigation from './Navigation';
import SimpleBar from 'components/third-party/SimpleBar';

// ==============================|| DRWAER - CONTENT ||============================== //

export default function DrawerContent({ searchValue }: { searchValue?: string }) {
  return (
    <SimpleBar
      sx={{
        height: { xs: 'calc(100vh - 70px)', md: 'calc(100% - 70px)' },
        '& .simplebar-content': {
          display: 'flex',
          flexDirection: 'column'
        }
      }}
    >
      <Box sx={{ p: 3, pt: 1.5 }}>
        <Navigation searchValue={searchValue} />
      </Box>
    </SimpleBar>
  );
}
