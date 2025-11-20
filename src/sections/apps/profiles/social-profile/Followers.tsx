import { useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import { followersProfile, followersData } from './data/followers';
import MainCard from 'components/MainCard';

// ==============================|| SOCIAL PROFILE - FOLLOWERS ||============================== //

export default function Followers() {
  const theme = useTheme();
  const [show, setShow] = useState<boolean>(false);
  const profile = followersProfile[0];

  const textColor = theme.palette.mode === 'dark' ? 'common.white' : 'text.secondary';

  return (
    <MainCard sx={{ position: 'relative', bgcolor: 'primary.lighter', overflow: 'hidden' }}>
      <Box sx={{ position: 'absolute', filter: 'blur(51px)' }}>
        <Box
          sx={(theme) => ({
            width: 150,
            height: 150,
            borderRadius: '50%',
            bgcolor: 'warning.lighter',
            position: 'absolute',
            left: { xs: 205, sm: 530, md: 205 },
            bottom: -43,
            opacity: 1,
            ...theme.applyStyles('dark', { opacity: 0.8 })
          })}
        />
        <Box
          sx={(theme) => ({
            width: 100,
            height: 100,
            borderRadius: '50%',
            bgcolor: 'error.light',
            position: 'absolute',
            bottom: -217,
            left: -100,
            opacity: 1,
            ...theme.applyStyles('dark', { opacity: 0.8 })
          })}
        />
      </Box>
      <Box sx={{ width: 164 }}>
        <Tooltip
          open={show}
          placement="top-end"
          title={
            <AvatarGroup max={10} sx={{ '& .MuiAvatarGroup-avatar': { ml: -1.75 } }}>
              <Avatar alt="Trevor Henderson" src={profile.avatar5} />
              <Avatar alt="Jone Doe" src={profile.avatar6} />
              <Avatar alt="Lein Ket" src={profile.avatar7} />
              <Avatar alt="Stebin Ben" src={profile.avatar8} />
              <Avatar alt="Wungh Tend" src={profile.avatar9} />
              <Avatar alt="Trevor Das" src={profile.avatar10} />
            </AvatarGroup>
          }
        >
          <AvatarGroup
            sx={{ '& .MuiAvatarGroup-avatar': { ml: -1.75, bgcolor: 'primary.lighter', color: textColor, cursor: 'pointer' } }}
            slotProps={{ surplus: { onMouseEnter: () => setShow(true), onMouseLeave: () => setShow(false) } }}
          >
            <Avatar alt="Remy Sharp" src={profile.avatar1} />
            <Avatar alt="Travis Howard" src={profile.avatar2} />
            <Avatar alt="Cindy Baker" src={profile.avatar3} />
            <Avatar alt="Agnes Walker" src={profile.avatar4} />
            <Avatar alt="Trevor Henderson" src={profile.avatar5} />
            <Avatar alt="Jone Doe" src={profile.avatar6} />
            <Avatar alt="Lein Ket" src={profile.avatar7} />
            <Avatar alt="Stebin Ben" src={profile.avatar8} />
            <Avatar alt="Wungh Tend" src={profile.avatar9} />
            <Avatar alt="Trevor Das" src={profile.avatar10} />
          </AvatarGroup>
        </Tooltip>
      </Box>

      <Stack sx={{ color: textColor, gap: 2, mt: 1 }}>
        <Typography variant="h3">
          {followersData.followerCount}{' '}
          <Typography component="span" variant="h4">
            Followers
          </Typography>
        </Typography>
        <Typography variant="h5">{followersData.description}</Typography>
      </Stack>
    </MainCard>
  );
}
