// material-ui
import Avatar from '@mui/material/Avatar';
import Badge, { BadgeProps } from '@mui/material/Badge';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project-imports
import { friendsData } from './data/tab-friends';
import MainCard from 'components/MainCard';

// ==============================|| SOCIAL PROFILE - TAB FRIENDS ||============================== //

export default function TabFriends() {
  return (
    <MainCard
      content={false}
      title={
        <Stack direction="row" sx={{ gap: 1 }}>
          <Typography variant="subtitle1">Friends</Typography>
          <Chip label="99" size="small" color="primary" />
        </Stack>
      }
    >
      <List disablePadding>
        {friendsData.map((friend, index) => (
          <ListItem
            key={index}
            divider
            secondaryAction={
              <Button variant="outlined" color="secondary" sx={{ mr: 1 }}>
                Follow
              </Button>
            }
            sx={{ px: 3, py: 1.5 }}
          >
            <ListItemAvatar>
              <Badge
                color={friend.status as BadgeProps['color']}
                overlap="circular"
                variant="dot"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              >
                <Avatar alt={friend.name || 'User'} src={friend.profile} />
              </Badge>
            </ListItemAvatar>
            <ListItemText
              primary={friend.name}
              secondary={friend.username}
              slotProps={{ primary: { variant: 'subtitle1' }, secondary: { sx: { mt: 0.25 } } }}
            />
          </ListItem>
        ))}
      </List>
    </MainCard>
  );
}
