// material-ui
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project-imports
import { followersList } from './data/followers-list';
import Avatar from 'components/@extended/Avatar';
import MainCard from 'components/MainCard';

// ==============================|| SOCIAL PROFILE - FOLLOWERS LIST ||============================== //

export default function FollowersList() {
  return (
    <MainCard
      content={false}
      title={
        <Stack direction="row" sx={{ gap: 1 }}>
          <Typography variant="subtitle1">Who is follow you?</Typography>
          <Chip label="4" size="small" color="primary" />
        </Stack>
      }
      secondary={<Button>See All</Button>}
    >
      <List disablePadding>
        {followersList.map((follower, index) => (
          <ListItem key={index} divider sx={{ px: 3, py: 1.5 }}>
            <ListItemAvatar>
              <Avatar alt={follower.name || 'User'} src={follower.avatar} />
            </ListItemAvatar>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              sx={{ flexGrow: 1, gap: { xs: 1, sm: 0 }, alignItems: { xs: 'flex-start', sm: 'center' } }}
            >
              <ListItemText
                primary={follower.name}
                secondary={follower.username}
                slotProps={{ primary: { variant: 'subtitle1' }, secondary: { sx: { mt: 0.25 } } }}
              />
              <Button variant="outlined" color="secondary">
                Follow
              </Button>
            </Stack>
          </ListItem>
        ))}
      </List>
    </MainCard>
  );
}
