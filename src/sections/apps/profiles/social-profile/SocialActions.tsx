import { useState } from 'react';

// material-ui
import IconButton from '@mui/material/IconButton';
import ListItemButton from '@mui/material/ListItemButton';
import Menu from '@mui/material/Menu';

// project-imports
import MoreIcon from 'components/@extended/MoreIcon';

// ==============================|| SOCIAL PROFILE - SOCIAL ACTIONS ||============================== //

export default function SocialActions() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton onClick={handleClick}>
        <MoreIcon />
      </IconButton>
      <Menu
        id="menu-list"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{ list: { 'aria-labelledby': 'menu-button', sx: { p: 1.25, minWidth: 150 } } }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <ListItemButton onClick={handleClose}>Edit</ListItemButton>
        <ListItemButton onClick={handleClose}>Delete</ListItemButton>
      </Menu>
    </>
  );
}
