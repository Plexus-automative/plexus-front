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
import { teamPagesData } from './data/team-pages';
import Avatar from 'components/@extended/Avatar';
import MainCard from 'components/MainCard';

// ==============================|| SOCIAL PROFILE - TEAM PAGES ||============================== //

export default function TeamPages() {
  return (
    <MainCard
      content={false}
      title={
        <Stack direction="row" sx={{ gap: 1 }}>
          <Typography variant="subtitle1">Your page</Typography>
          <Chip label="2" size="small" />
        </Stack>
      }
      secondary={<Button>See All</Button>}
    >
      <List disablePadding>
        {teamPagesData.map((members, index) => {
          const { icon: Icon, color } = members.avatar;

          return (
            <ListItem divider key={index} sx={{ px: 3, py: 2 }}>
              <ListItemAvatar>
                <Avatar {...{ color }}>
                  <Icon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary={members.title} />
            </ListItem>
          );
        })}
      </List>
    </MainCard>
  );
}
