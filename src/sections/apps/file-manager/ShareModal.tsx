import { useState } from 'react';

// material-ui
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Modal from '@mui/material/Modal';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

// third-party
import copy from 'copy-to-clipboard';

// project-imports
import MainCard from 'components/MainCard';
import { usersData } from 'data/file-manager';

// assets
import { Add } from '@wandersonalwes/iconsax-react';

interface ShareModalProps {
  setOpenModal: (open: boolean) => void;
  openModal: boolean;
}

const permissionOptions = ['Can View', 'Can Edit'];

// ==============================|| FILE MANAGER - SHARE MODAL ||============================== //

export default function ShareModal({ setOpenModal, openModal }: ShareModalProps) {
  const [users, setUsers] = useState(usersData);
  const [link, setLink] = useState('https://www.figma.com/file/');

  const handleCopy = () => {
    copy(link);
  };

  const handlePermissionChange = (index: number, value: string) => {
    const updatedUsers = [...users];
    updatedUsers[index].permission = value;
    setUsers(updatedUsers);
  };

  return (
    <Modal
      open={openModal}
      onClose={() => setOpenModal(false)}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <MainCard
        sx={{ width: `calc(100% - 48px)`, minWidth: 300, maxWidth: 500, height: 'auto', maxHeight: 'calc(100vh - 32px)', overflow: 'auto' }}
        modal
        content={false}
      >
        <DialogTitle>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
              Share
            </Typography>
            <IconButton aria-label="close" color="secondary" sx={{ p: 0.2 }} onClick={() => setOpenModal(false)}>
              <Add style={{ transform: 'rotate(45deg)', width: 45, height: 45 }} />
            </IconButton>
          </Stack>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <TextField
            fullWidth
            type="email"
            placeholder="Email"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Typography variant="h5" sx={{ cursor: 'default' }}>
                      Invite People
                    </Typography>
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Select
                      displayEmpty
                      variant="standard"
                      disableUnderline
                      defaultValue={1}
                      inputProps={{ 'aria-label': 'Status Filter' }}
                    >
                      <MenuItem value={1}>View</MenuItem>
                      <MenuItem value={2}>Edit</MenuItem>
                    </Select>
                  </InputAdornment>
                )
              }
            }}
          />
          <List>
            {users.map((user, index) => (
              <ListItem
                key={index}
                sx={{ px: 0, py: 1 }}
                secondaryAction={
                  user.role === 'Owner' ? (
                    <Typography variant="h6" color="primary">
                      {user.role}
                    </Typography>
                  ) : (
                    <Select
                      disabled={user.disabled}
                      size="small"
                      value={user.permission || ''}
                      displayEmpty
                      sx={{ width: 120 }}
                      onChange={(e) => handlePermissionChange(index, e.target.value)}
                    >
                      {user.permission === 'Owner' ? (
                        <MenuItem value="Owner">Owner</MenuItem>
                      ) : (
                        permissionOptions.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                  )
                }
              >
                <ListItemAvatar>
                  <Avatar src={user.avatar} alt={user.name} />
                </ListItemAvatar>
                <ListItemText
                  primary={user.name}
                  sx={{
                    '.MuiTypography-root': {
                      width: { xs: 80, sm: 'auto' },
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }
                  }}
                />
              </ListItem>
            ))}
          </List>
          <Divider sx={{ mb: 2 }} />
          <TextField
            fullWidth
            placeholder="Enter URL"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start" onClick={handleCopy}>
                    <Button color="secondary" size="small">
                      Copy Link
                    </Button>
                    <Divider orientation="vertical" sx={{ ml: 1.25, height: 25 }} />
                  </InputAdornment>
                )
              }
            }}
          />
        </DialogContent>
      </MainCard>
    </Modal>
  );
}
