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
import { friendRequestData } from './data/tab-friend-request';
import MainCard from 'components/MainCard';

// ==============================|| SOCIAL PROFILE - TAB FRIEND REQUEST ||============================== //

export default function TabFriendRequest() {
  return (
    <MainCard
      content={false}
      title={
        <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
          <Typography variant="subtitle1">Friends Request</Typography>
          <Chip label="30" size="small" color="primary" />
        </Stack>
      }
    >
      <List disablePadding sx={{ '& .MuiListItem-root': { px: 3, py: 1.5 } }}>
        {friendRequestData.map((friend, index) => (
          <ListItem key={index} divider sx={{ alignItems: { xs: 'flex-start', sm: 'center' } }}>
            <ListItemAvatar>
              <Badge
                color={friend.status as BadgeProps['color']}
                overlap="circular"
                variant="dot"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              >
                <Avatar alt={friend.name} src={friend.profile} />
              </Badge>
            </ListItemAvatar>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              sx={{ flexGrow: 1, gap: { xs: 1, sm: 0 }, alignItems: { xs: 'flex-start', sm: 'center' } }}
            >
              <ListItemText
                primary={<Typography variant="subtitle1">{friend.name}</Typography>}
                secondary={<Typography>{friend.username}</Typography>}
              />
              <Stack direction="row" sx={{ gap: 1 }}>
                <Button variant="outlined" color="secondary">
                  Decline
                </Button>
                <Button variant="contained" color="primary">
                  Accept
                </Button>
              </Stack>
            </Stack>
          </ListItem>
        ))}
      </List>
    </MainCard>
  );
}
