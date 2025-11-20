import { MouseEvent, useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import ListItemButton from '@mui/material/ListItemButton';
import Menu from '@mui/material/Menu';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project-imports
import MoreIcon from 'components/@extended/MoreIcon';
import MainCard from 'components/MainCard';

// types
import { FilterData } from 'types/file-manager';

// ==============================|| RECENT FILE CARD ||============================== //

export default function RecentFileCard({ item }: { item: FilterData }) {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);
  const IconComponent = item.icon;

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <MainCard sx={{ '&:hover': { boxShadow: theme.customShadows.z1 } }}>
      <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
        <Stack direction="row" spacing={2} alignItems="center">
          {IconComponent && <IconComponent size="40" variant="Bold" color={theme.palette.warning.main} />}
          <Stack spacing={0.25}>
            <Typography variant="h5">{item.title}</Typography>
            <Typography variant="body2">{item.files} files</Typography>
          </Stack>
        </Stack>
        <IconButton
          color="secondary"
          id="wallet-button"
          aria-controls="wallet-menu"
          aria-haspopup="true"
          aria-expanded={openMenu ? 'true' : undefined}
          onClick={handleClick}
        >
          <MoreIcon />
        </IconButton>
        <Menu
          id="recent-menu"
          anchorEl={anchorEl}
          open={openMenu}
          onClose={handleClose}
          slotProps={{ list: { 'aria-labelledby': 'recent-menu', sx: { p: 1.25, minWidth: 150 } } }}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <ListItemButton onClick={handleClose}>Edit</ListItemButton>
          <ListItemButton onClick={handleClose}>Delete</ListItemButton>
        </Menu>
      </Stack>
    </MainCard>
  );
}
