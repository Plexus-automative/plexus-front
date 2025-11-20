import { useState } from 'react';

// material-ui
import useMediaQuery from '@mui/material/useMediaQuery';
import MuiDrawer from '@mui/material/Drawer';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';

// project-imports
import DrawerContent from './DrawerContent';
import MainCard from 'components/MainCard';
import { handlerComponentDrawer, useGetMenuMaster } from 'api/menu';
import { DRAWER_WIDTH } from 'config';

// assets
import { SearchNormal1 } from '@wandersonalwes/iconsax-react';

// ==============================|| DRAWER ||============================== //

export default function Drawer() {
  const { menuMaster } = useGetMenuMaster();
  const open = menuMaster.isComponentDrawerOpened;

  const downMD = useMediaQuery((theme) => theme.breakpoints.down('md'));

  const [searchValue, setSearchValue] = useState();

  const handleSearchValue = (event: any) => {
    const search = event.target.value.trim().toLowerCase();
    setSearchValue(search);
  };

  return (
    <MuiDrawer
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        position: { xs: 'fixed', md: 'sticky' },
        top: { xs: 0, md: 84, xl: 90 },
        height: { xs: 'auto', md: 'calc(100vh - 140px)', xl: 'calc(100vh - 148px)' },
        display: { xs: open ? 'block' : 'none' }
      }}
      slotProps={{ paper: { sx: { borderRadius: { xs: 0, md: 1.5 }, position: 'relative', border: 'none' } } }}
      variant={downMD ? 'temporary' : 'persistent'}
      anchor="left"
      open={open}
      ModalProps={{ keepMounted: true }}
      onClose={() => handlerComponentDrawer(false)}
    >
      <MainCard sx={{ height: 1, borderRadius: { xs: 0, md: 1.5 } }} content={false}>
        <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
          <TextField
            fullWidth
            autoFocus
            onChange={handleSearchValue}
            slotProps={{ input: { startAdornment: <SearchNormal1 />, placeholder: 'Search Components', type: 'search' } }}
          />
        </Box>
        <DrawerContent searchValue={searchValue} />
      </MainCard>
    </MuiDrawer>
  );
}
