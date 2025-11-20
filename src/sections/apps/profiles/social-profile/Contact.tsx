import { useState } from 'react';

// material-ui
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';

// project-imports
import { contactData } from './data/contact';
import SocialActions from './SocialActions';
import MainCard from 'components/MainCard';

// assets
import { More } from '@wandersonalwes/iconsax-react';

// ==============================|| SOCIAL PROFILE - CONTACT ||============================== //

export default function Contact() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <MainCard content={false} title="Contact" secondary={<SocialActions />}>
      <List disablePadding>
        {contactData.map((contact, index) => (
          <ListItem
            key={index}
            divider
            sx={{ px: 3, py: 2 }}
            secondaryAction={
              <IconButton onClick={handleClick}>
                <More />
              </IconButton>
            }
          >
            <ListItemAvatar>
              <Avatar alt={contact.name || 'profile'} src={contact.avatar} />
            </ListItemAvatar>
            <ListItemText primary={contact.name} />
          </ListItem>
        ))}
      </List>
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
    </MainCard>
  );
}
