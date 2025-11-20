import { Fragment } from 'react/jsx-runtime';

// next
import Image from 'next/image';

// material-ui
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project-imports
import { users } from 'data/file-manager';
import SimpleBar from 'components/third-party/SimpleBar';
import AntAvatar from 'components/@extended/Avatar';

// assets
import { Add } from '@wandersonalwes/iconsax-react';

// types
import { FileItem } from 'types/file-manager';

interface FilePreviewProps {
  openDrawer: boolean;
  setOpenDrawer: (value: boolean) => void;
  selectedFile: FileItem | null;
}

// ==============================|| FILE MANAGER - FILE PREVIEW ||============================== //

export default function FilePreview({ openDrawer, setOpenDrawer, selectedFile }: FilePreviewProps) {
  return (
    <Drawer
      anchor="right"
      onClose={() => setOpenDrawer(!openDrawer)}
      open={openDrawer}
      slotProps={{ paper: { sx: { width: 360, overflowY: 'hidden' } } }}
    >
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', p: 2.5 }}>
        <Typography variant="h5">File Preview</Typography>
        <IconButton color="error" sx={{ p: 0 }} onClick={() => setOpenDrawer(false)}>
          <Add size={28} style={{ transform: 'rotate(45deg)' }} />
        </IconButton>
      </Stack>
      <Box sx={{ height: 'calc(100vh - 76px)' }}>
        <SimpleBar sx={{ '& .simplebar-content': { display: 'flex', flexDirection: 'column' } }}>
          <Box sx={{ p: 2.5 }}>
            <Stack sx={{ justifyContent: 'center', alignItems: 'center', gap: 2, my: 2 }}>
              <Image
                src={selectedFile?.img ?? ''}
                alt="upload-image"
                style={{ width: selectedFile?.img?.toLowerCase().endsWith('.jpg') ? '100%' : 100 }}
              />
              <Stack sx={{ gap: 0.25 }}>
                <Typography variant="h5">{selectedFile?.name}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                  {selectedFile?.date}
                </Typography>
              </Stack>
            </Stack>
            <Divider sx={{ my: 3, borderColor: 'divider', opacity: 0.5 }} />
            <Typography variant="h5">File share with</Typography>
            <List sx={{ width: 1, bgcolor: 'background.paper' }}>
              {users.map((user, index) => (
                <Fragment key={index}>
                  <ListItem alignItems="flex-start">
                    <ListItemAvatar sx={{ minWidth: 48 }}>
                      <AntAvatar alt={user.name} src={user.avatar} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={<Typography variant="subtitle1">{user.name}</Typography>}
                      secondary={
                        <Typography variant="body2" sx={{ color: 'text.primary', display: 'inline' }}>
                          {user.email}
                        </Typography>
                      }
                    />
                  </ListItem>
                  {index !== users.length - 1 && <Divider />}
                </Fragment>
              ))}
            </List>
            <Divider sx={{ my: 3, borderColor: 'divider', opacity: 0.5 }} />
            <Stack sx={{ gap: 1.5 }}>
              <Button variant="contained">Share</Button>
              <Stack direction="row" sx={{ gap: 1.5, justifyContent: 'space-between', alignItems: 'center' }}>
                <Button variant="dashed" color="secondary" sx={{ width: 1, border: 'none' }}>
                  Edit
                </Button>
                <Button variant="dashed" color="error" sx={{ width: 1, border: 'none' }}>
                  Delete
                </Button>
              </Stack>
            </Stack>
          </Box>
        </SimpleBar>
      </Box>
    </Drawer>
  );
}
