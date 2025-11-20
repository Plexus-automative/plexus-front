// material-ui
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';

// project-imports
import Avatar from 'components/@extended/Avatar';
import MainCard from 'components/MainCard';

// assets
import { Camera, DocumentFilter, Gps } from '@wandersonalwes/iconsax-react';

// ==============================|| LIST - FOLDER ||============================== //

export default function FolderList() {
  const folderListCodeString = `<List sx={{ width: '100%', bgcolor: 'background.paper' }}>
  <ListItem>
    <ListItemAvatar>
      <Avatar alt="Basic" type="combined" color="warning">
        <Camera />
      </Avatar>
    </ListItemAvatar>
    <ListItemText primary="Photos" secondary="Jan 9, 2014" />
  </ListItem>
  <ListItem>
    <ListItemAvatar>
      <Avatar alt="Basic" type="combined">
        <DocumentFilter />
      </Avatar>
    </ListItemAvatar>
    <ListItemText primary="Work" secondary="Jan 7, 2014" />
  </ListItem>
  <ListItem>
    <ListItemAvatar>
      <Avatar alt="Basic" type="combined" color="info">
        <Gps />
      </Avatar>
    </ListItemAvatar>
    <ListItemText primary="Vacation" secondary="July 20, 2014" />
  </ListItem>
</List>`;

  return (
    <MainCard content={false} codeString={folderListCodeString}>
      <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
        <ListItem>
          <ListItemAvatar>
            <Avatar alt="Basic" type="combined" color="warning">
              <Camera variant="Bold" />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary="Photos" secondary="Jan 9, 2014" />
        </ListItem>
        <ListItem>
          <ListItemAvatar>
            <Avatar alt="Basic" type="combined">
              <DocumentFilter variant="Bold" />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary="Work" secondary="Jan 7, 2014" />
        </ListItem>
        <ListItem>
          <ListItemAvatar>
            <Avatar alt="Basic" type="combined" color="info">
              <Gps variant="Bold" />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary="Vacation" secondary="July 20, 2014" />
        </ListItem>
      </List>
    </MainCard>
  );
}
