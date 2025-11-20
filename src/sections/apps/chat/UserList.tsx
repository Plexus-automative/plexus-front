import { Fragment, useEffect, useState } from 'react';

// material-ui
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// third-party
import { Chance } from 'chance';

// project-imports
import UserAvatar from './UserAvatar';
import Dot from 'components/@extended/Dot';
import { useGetUsers } from 'api/chat';

// assets
import { TickCircle } from '@wandersonalwes/iconsax-react';

// types
import { UserProfile } from 'types/user-profile';
import { KeyedObject } from 'types/root';

const chance = new Chance();

// ==============================|| CHAT - USER LIST ||============================== //

interface UserListProps {
  setUser: (u: UserProfile) => void;
  search?: string;
  selectedUser: string | null;
}

interface UserListItemProps {
  user: UserProfile;
  setUser: (u: UserProfile) => void;
  selectedUser: string | null;
}

// ==============================|| CHAT - USER ||============================== //

function UserListItem({ user, setUser, selectedUser }: UserListItemProps) {
  // chance.bool() - use for last send msg was read or unread
  const [read, setRead] = useState<boolean>(chance.bool());

  return (
    <ListItemButton
      sx={{ pl: 1, borderRadius: 0, '&:hover': { borderRadius: 1 } }}
      onClick={() => {
        setUser(user);
        setRead(true);
      }}
      selected={user.id === selectedUser}
    >
      <ListItemAvatar>
        <UserAvatar user={user} />
      </ListItemAvatar>
      <ListItemText
        primary={
          <Stack direction="row" sx={{ gap: 1, alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography
              variant="subtitle1"
              sx={{ color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            >
              {user.name}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {user.lastMessage}
            </Typography>
          </Stack>
        }
        secondary={
          <Typography
            sx={{
              color: 'text.secondary',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <>{user.status}</>
            <>
              {user.unReadChatCount ? (
                <Dot />
              ) : (
                <Box component="span" sx={{ color: read ? 'secondary.400' : 'primary.main', display: 'flex', alignItems: 'center' }}>
                  <TickCircle size={16} />
                </Box>
              )}
            </>
          </Typography>
        }
      />
    </ListItemButton>
  );
}

export default function UserList({ setUser, search, selectedUser }: UserListProps) {
  const [data, setData] = useState<UserProfile[]>([]);

  const { usersLoading: loading, users } = useGetUsers();

  useEffect(() => {
    if (!loading) {
      let result = users;
      if (search) {
        result = users.filter((row: KeyedObject) => {
          let matches = true;

          const properties: string[] = ['name'];
          let containsQuery = false;

          properties.forEach((property) => {
            if (row[property].toString().toLowerCase().includes(search.toString().toLowerCase())) {
              containsQuery = true;
            }
          });

          if (!containsQuery) {
            matches = false;
          }
          return matches;
        });
      }
      setData(result);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, search]);

  if (loading)
    return (
      <List>
        {[1, 2, 3, 4, 5].map((index: number) => (
          <ListItem key={index} divider>
            <ListItemAvatar>
              <Skeleton variant="circular" width={40} height={40} />
            </ListItemAvatar>
            <ListItemText
              primary={<Skeleton animation="wave" height={24} />}
              secondary={<Skeleton animation="wave" height={16} width="60%" />}
            />
          </ListItem>
        ))}
      </List>
    );

  return (
    <List component="nav">
      {data.map((user) => (
        <Fragment key={user.id}>
          <UserListItem user={user} selectedUser={selectedUser} setUser={setUser} />
          <Divider />
        </Fragment>
      ))}
    </List>
  );
}
