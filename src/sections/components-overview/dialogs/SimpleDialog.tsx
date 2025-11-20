'use client';

import { useState } from 'react';

// material-ui
import Avatar from '@mui/material/Avatar';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import List from '@mui/material/List';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';

// project-imports
import IconButton from 'components/@extended/IconButton';

// assets
import { Add } from '@wandersonalwes/iconsax-react';

const emails = ['username@gmail.com', 'user02@gmail.com'];
const avatarImage = '/assets/images/users';

interface Props {
  open: boolean;
  selectedValue: string;
  onClose: (value: string) => void;
}

// ==============================|| DIALOG - SIMPLE ||============================== //

function SimpleDialog({ onClose, selectedValue, open }: Props) {
  const handleClose = () => {
    onClose(selectedValue);
  };

  const handleListItemClick = (value: string) => {
    onClose(value);
  };

  return (
    <Dialog onClose={handleClose} open={open}>
      <Grid
        container
        spacing={2}
        sx={{ justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}
      >
        <Grid>
          <DialogTitle>Set backup account</DialogTitle>
        </Grid>
        <Grid sx={{ mr: 1.5 }}>
          <IconButton color="secondary" onClick={handleClose}>
            <Add style={{ transform: 'rotate(45deg)' }} />
          </IconButton>
        </Grid>
      </Grid>
      <List sx={{ p: 2.5 }}>
        {emails.map((email, index) => (
          <ListItemButton onClick={() => handleListItemClick(email)} key={email} selected={selectedValue === email} sx={{ p: 1.25 }}>
            <ListItemAvatar>
              <Avatar src={`${avatarImage}/avatar-${index + 1}.png`} />
            </ListItemAvatar>
            <ListItemText primary={email} />
          </ListItemButton>
        ))}
        <ListItemButton autoFocus onClick={() => handleListItemClick('addAccount')} sx={{ p: 1.25 }}>
          <ListItemAvatar>
            <Avatar sx={{ bgcolor: 'primary.lighter', color: 'primary.main', width: 32, height: 32 }}>
              <Add style={{ fontSize: '0.625rem' }} />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary="Add Account" />
        </ListItemButton>
      </List>
    </Dialog>
  );
}

export default function SimpleDialogDemo() {
  const [open, setOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(emails[1]);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = (value: string) => {
    setOpen(false);
    setSelectedValue(value);
  };

  return (
    <>
      <Button variant="contained" onClick={handleClickOpen}>
        Open simple dialog
      </Button>
      <SimpleDialog selectedValue={selectedValue} open={open} onClose={handleClose} />
    </>
  );
}
