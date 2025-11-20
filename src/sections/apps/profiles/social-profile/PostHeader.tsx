// material-ui
import Badge, { BadgeProps } from '@mui/material/Badge';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project-imports
import Avatar from 'components/@extended/Avatar';

interface PostHeaderProps {
  header: string;
  subHeader: string;
  avatarImg: string;
  status: string;
}

// ==============================|| SOCIAL PROFILE - POST HEADER ||============================== //

export default function PostHeader({ header, subHeader, avatarImg, status }: PostHeaderProps) {
  return (
    <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
      <Badge
        color={status as BadgeProps['color']}
        overlap="circular"
        variant="dot"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Avatar alt={'User'} src={avatarImg} />
      </Badge>
      <Stack>
        <Typography variant="h5">{header}</Typography>
        <Typography variant="caption">{subHeader}</Typography>
      </Stack>
    </Stack>
  );
}
