// material-ui
import Badge from '@mui/material/Badge';

// project-imports
import AvatarStatus from './AvatarStatus';
import Avatar from 'components/@extended/Avatar';

// types
import { UserProfile } from 'types/user-profile';

// assets
const avatarImage = '/assets/images/users';

// ==============================|| CHAT - USER AVATAR WITH STATUS ICON ||============================== //

interface UserAvatarProps {
  user: UserProfile;
}

export default function UserAvatar({ user }: UserAvatarProps) {
  return (
    <Badge
      overlap="circular"
      badgeContent={<AvatarStatus status={user.online_status!} />}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right'
      }}
      sx={(theme) => ({
        '& .MuiBox-root': { width: 6, height: 6 },
        padding: 0,
        minWidth: 12,
        '& svg': { bgcolor: 'background.paper', borderRadius: '50%', ...theme.applyStyles('dark', { bgcolor: 'text.primary' }) }
      })}
      slotProps={{ badge: { sx: { top: '3%', right: '25%' } } }}
    >
      <Avatar alt={user.name} src={user.avatar && `${avatarImage}/${user.avatar}`} />
    </Badge>
  );
}
