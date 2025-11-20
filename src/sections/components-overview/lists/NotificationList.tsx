'use client';

// material-ui
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';

// project-imports
import AntAvatar from 'components/@extended/Avatar';
import MainCard from 'components/MainCard';

// assets
const avatarImage = '/assets/images/users';

// sx styles
const actionSX = {
  mt: '6px',
  ml: 1,
  top: 'auto',
  right: 'auto',
  alignSelf: 'flex-start',

  transform: 'none'
};

// ==============================|| LIST - NOTIFICATION ||============================== //

export default function NotificationList() {
  const notificationListCodeString = `<List
  component="nav"
  sx={{
    p: 0,
    '& .MuiListItemButton-root': {
      py: 0.5,
      '& .MuiListItemSecondaryAction-root': { ...actionSX, position: 'relative' }
    }
  }}
>
  <ListItemButton divider>
    <ListItemAvatar>
      <AntAvatar alt="Avatar" src={'${avatarImage}/avatar-1.png'} />
    </ListItemAvatar>
    <ListItemText
      primary={
        <Typography variant="h6">
          It&apos;s{' '}
          <Typography component="span" variant="subtitle1">
            Cristina danny&apos;s
          </Typography>{' '}
          birthday today.
        </Typography>
      }
      secondary="2 min ago"
    />
    <ListItemSecondaryAction>
      <Typography variant="caption" noWrap>
        3:00 AM
      </Typography>
    </ListItemSecondaryAction>
  </ListItemButton>
  <ListItemButton divider>
    <ListItemAvatar>
      <AntAvatar alt="Avatar" src={'${avatarImage}/avatar-2.png'} />
    </ListItemAvatar>
    <ListItemText
      primary={
        <Typography variant="h6">
          <Typography component="span" variant="subtitle1">
            Aida Burg
          </Typography>{' '}
          commented your post.
        </Typography>
      }
      secondary="5 August"
    />
    <ListItemSecondaryAction>
      <Typography variant="caption" noWrap>
        6:00 PM
      </Typography>
    </ListItemSecondaryAction>
  </ListItemButton>
  <ListItemButton divider>
    <ListItemAvatar>
      <AntAvatar alt="Avatar" src={'${avatarImage}/avatar-3.png'} />
    </ListItemAvatar>
    <ListItemText
      primary={
        <Typography variant="h6">
          Profile Complete
          <Typography component="span" variant="subtitle1">
            60%
          </Typography>{' '}
        </Typography>
      }
      secondary="7 hours ago"
    />
    <ListItemSecondaryAction>
      <Typography variant="caption" noWrap>
        2:45 PM
      </Typography>
    </ListItemSecondaryAction>
  </ListItemButton>
  <ListItemButton>
    <ListItemAvatar>
      <AntAvatar alt="Avatar" src={'${avatarImage}/avatar-4.png'} />
    </ListItemAvatar>
    <ListItemText
      primary={
        <Typography variant="h6">
          <Typography component="span" variant="subtitle1">
            Cristina Danny
          </Typography>{' '}
          invited to join{' '}
          <Typography component="span" variant="subtitle1">
            Meeting.
          </Typography>
        </Typography>
      }
      secondary="Daily scrum meeting time"
    />
    <ListItemSecondaryAction>
      <Typography variant="caption" noWrap>
        9:10 PM
      </Typography>
    </ListItemSecondaryAction>
  </ListItemButton>
</List>`;

  return (
    <MainCard content={false} codeString={notificationListCodeString}>
      <List
        component="nav"
        sx={{
          p: 0,
          '& .MuiListItemButton-root': {
            py: 0.5,
            px: 2,
            my: 0,
            borderRadius: 0,
            '& .MuiListItemSecondaryAction-root': { ...actionSX, position: 'relative' }
          }
        }}
      >
        <ListItem
          component={ListItemButton}
          secondaryAction={
            <Typography variant="caption" noWrap>
              3:00 AM
            </Typography>
          }
          divider
        >
          <ListItemAvatar>
            <AntAvatar alt="Avatar" src={`${avatarImage}/avatar-1.png`} />
          </ListItemAvatar>
          <ListItemText
            primary={
              <Typography variant="h6">
                It&apos;s{' '}
                <Typography component="span" variant="subtitle1">
                  Cristina danny&apos;s
                </Typography>{' '}
                birthday today.
              </Typography>
            }
            secondary="2 min ago"
          />
        </ListItem>
        <ListItem
          component={ListItemButton}
          secondaryAction={
            <Typography variant="caption" noWrap>
              6:00 PM
            </Typography>
          }
          divider
        >
          <ListItemAvatar>
            <AntAvatar alt="Avatar" src={`${avatarImage}/avatar-2.png`} />
          </ListItemAvatar>
          <ListItemText
            primary={
              <Typography variant="h6">
                <Typography component="span" variant="subtitle1">
                  Aida Burg
                </Typography>{' '}
                commented your post.
              </Typography>
            }
            secondary="5 August"
          />
        </ListItem>
        <ListItem
          component={ListItemButton}
          secondaryAction={
            <Typography variant="caption" noWrap>
              2:45 PM
            </Typography>
          }
          divider
        >
          <ListItemAvatar>
            <AntAvatar alt="Avatar" src={`${avatarImage}/avatar-3.png`} />
          </ListItemAvatar>
          <ListItemText
            primary={
              <Typography variant="h6">
                Profile Complete
                <Typography component="span" sx={{ mx: 1 }} variant="subtitle1">
                  60%
                </Typography>{' '}
              </Typography>
            }
            secondary="7 hours ago"
          />
        </ListItem>
        <ListItem
          component={ListItemButton}
          secondaryAction={
            <Typography variant="caption" noWrap>
              9:10 PM
            </Typography>
          }
        >
          <ListItemAvatar>
            <AntAvatar alt="Avatar" src={`${avatarImage}/avatar-4.png`} />
          </ListItemAvatar>
          <ListItemText
            primary={
              <Typography variant="h6">
                <Typography component="span" variant="subtitle1">
                  Cristina Danny
                </Typography>{' '}
                invited to join{' '}
                <Typography component="span" variant="subtitle1">
                  Meeting.
                </Typography>
              </Typography>
            }
            secondary="Daily scrum meeting time"
          />
        </ListItem>
      </List>
    </MainCard>
  );
}
