import { useState } from 'react';

// material-ui
import Chip from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project-imports
import AvatarStatus from './AvatarStatus';
import MainCard from 'components/MainCard';
import Avatar from 'components/@extended/Avatar';
import MoreIcon from 'components/@extended/MoreIcon';
import IconButton from 'components/@extended/IconButton';
import SimpleBar from 'components/third-party/SimpleBar';

// types
import { UserProfile } from 'types/user-profile';

// assets
import {
  Add,
  ArrowDown2,
  ArrowRight2,
  Camera,
  Document,
  DocumentLike,
  FolderOpen,
  Image as ImageIcon,
  Link2,
  Mobile,
  Sms
} from '@wandersonalwes/iconsax-react';

const avatarImage = '/assets/images/users';

// ==============================|| CHAT - USER DETAILS ||============================== //

type Props = {
  user: UserProfile;
  onClose?: () => void;
};

export default function UserDetails({ user, onClose }: Props) {
  const [checked, setChecked] = useState(true);

  if (Object.keys(user).length === 0) return <Typography>...Loading</Typography>;

  let statusBGColor;
  let statusColor;
  if (user.online_status === 'available') {
    statusBGColor = 'success.lighter';
    statusColor = 'success.darker';
  } else if (user.online_status === 'do_not_disturb') {
    statusBGColor = 'secondary.main';
    statusColor = 'secondary.light';
  } else {
    statusBGColor = 'warning.lighter';
    statusColor = 'warning.darker';
  }

  return (
    <MainCard
      sx={{
        borderRadius: '0 12px 12px 0',
        borderLeft: 'none',
        height: 1
      }}
      content={false}
    >
      <Box sx={{ p: 3 }}>
        {onClose && (
          <IconButton size="small" sx={{ position: 'absolute', right: 8, top: 8 }} onClick={onClose} color="error">
            <Add style={{ transform: 'rotate(45deg)' }} />
          </IconButton>
        )}
        <Grid container spacing={1} sx={{ justifyContent: 'center' }}>
          <Grid size={12}>
            <Stack>
              <Avatar
                alt={user.name}
                src={user.avatar && `${avatarImage}/${user.avatar}`}
                size="xl"
                sx={{
                  m: '8px auto',
                  width: 88,
                  height: 88,
                  border: '1px solid',
                  borderColor: 'primary.main',
                  p: 1,
                  bgcolor: 'transparent'
                }}
                slotProps={{ img: { sx: { height: 88, width: 88, borderRadius: '50%' } } }}
              />
              <Typography variant="h5" align="center">
                {user.name}
              </Typography>
              <Typography variant="body2" align="center" sx={{ color: 'text.secondary' }}>
                {user.role}
              </Typography>
            </Stack>
          </Grid>
          <Grid size={12}>
            <Stack
              direction="row"
              sx={{ alignItems: 'center', justifyContent: 'center', gap: 1, mt: 0.75, '& .MuiChip-root': { height: '24px' } }}
            >
              <AvatarStatus status={user.online_status!} />
              <Chip
                label={user?.online_status && user.online_status!.replaceAll('_', ' ')}
                sx={{ bgcolor: statusBGColor, textTransform: 'capitalize', color: statusColor, '& .MuiChip-label': { px: 1 }, mb: 0.5 }}
              />
            </Stack>
          </Grid>
        </Grid>

        <Stack direction="row" sx={{ gap: 2, justifyContent: 'center', mt: 3 }}>
          <IconButton size="medium" color="secondary" sx={{ boxShadow: '0px 8px 25px rgba(0, 0, 0, 0.05)' }}>
            <Mobile />
          </IconButton>
          <IconButton size="medium" color="secondary" sx={{ boxShadow: '0px 8px 25px rgba(0, 0, 0, 0.05)' }}>
            <Sms />
          </IconButton>
          <IconButton size="medium" color="secondary" sx={{ boxShadow: '0px 8px 25px rgba(0, 0, 0, 0.05)' }}>
            <Camera />
          </IconButton>
        </Stack>
      </Box>
      <Box>
        <SimpleBar sx={{ overflowX: 'hidden', height: { xs: 'auto', md: 'calc(100vh - 397px)' }, minHeight: { xs: 0, sm: 420 } }}>
          <Stack sx={{ gap: 3 }}>
            <Stack direction="row" sx={{ gap: 1.5, justifyContent: 'center', px: 3 }}>
              <Box
                sx={(theme) => ({
                  bgcolor: 'primary.lighter',
                  color: 'primary.main',
                  ...theme.applyStyles('dark', { color: 'text.primary' }),
                  p: 2,
                  width: '50%',
                  borderRadius: 2
                })}
              >
                <Typography>All File</Typography>
                <Stack direction="row" sx={{ gap: 1, alignItems: 'center', mt: 0.5 }}>
                  <FolderOpen style={{ fontSize: '1.15em' }} />
                  <Typography variant="h4">231</Typography>
                </Stack>
              </Box>
              <Box sx={{ bgcolor: 'secondary.lighter', p: 2, width: '50%', borderRadius: 2 }}>
                <Typography>All Link</Typography>
                <Stack direction="row" sx={{ gap: 1, alignItems: 'center', mt: 0.5 }}>
                  <Link2 style={{ fontSize: '1.15em' }} />
                  <Typography variant="h4">231</Typography>
                </Stack>
              </Box>
            </Stack>
            <Box sx={{ px: 3, pb: 3 }}>
              <Grid container spacing={2}>
                <Grid size={12}>
                  <Stack
                    direction="row"
                    onClick={() => setChecked(!checked)}
                    sx={{ alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                  >
                    <Typography variant="h5">Information</Typography>
                    <IconButton size="small" color="secondary">
                      <ArrowDown2 />
                    </IconButton>
                  </Stack>
                </Grid>
                <Grid sx={{ mt: -1 }} size={12}>
                  <Divider />
                </Grid>
                <Grid size={12}>
                  <Collapse in={checked}>
                    <Stack direction="row" sx={{ justifyContent: 'space-between', mt: 1, mb: 2 }}>
                      <Typography>Address</Typography>
                      <Typography sx={{ color: 'text.secondary' }}>{user.location}</Typography>
                    </Stack>
                    <Stack direction="row" sx={{ justifyContent: 'space-between', mt: 2 }}>
                      <Typography>Email</Typography>
                      <Typography sx={{ color: 'text.secondary' }}>{user.personal_email}</Typography>
                    </Stack>
                    <Stack direction="row" sx={{ justifyContent: 'space-between', mt: 2 }}>
                      <Typography>Phone</Typography>
                      <Typography sx={{ color: 'text.secondary' }}>{user.personal_phone}</Typography>
                    </Stack>
                    <Stack direction="row" sx={{ justifyContent: 'space-between', mt: 2, mb: 2 }}>
                      <Typography>Last visited</Typography>
                      <Typography sx={{ color: 'text.secondary' }}>{user.lastMessage}</Typography>
                    </Stack>
                  </Collapse>
                </Grid>
                <Grid size={12}>
                  <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="h5">Notification</Typography>
                    <Switch defaultChecked />
                  </Stack>
                </Grid>
                <Grid sx={{ mt: -1 }} size={12}>
                  <Divider />
                </Grid>
                <Grid sx={{ mt: -1 }} size={12}>
                  <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="h5">File type</Typography>
                    <IconButton sx={{ transform: 'rotate(90deg)' }} size="medium" color="secondary">
                      <MoreIcon />
                    </IconButton>
                  </Stack>
                </Grid>
                <Grid sx={{ mt: -1 }} size={12}>
                  <Divider />
                </Grid>
                <Grid size={12}>
                  <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <Stack direction="row" sx={{ gap: 1.5, alignItems: 'center' }}>
                      <Avatar variant="rounded" color="success">
                        <DocumentLike />
                      </Avatar>
                      <Stack>
                        <Typography>Document</Typography>
                        <Typography sx={{ color: 'text.secondary' }}>123 files, 193MB</Typography>
                      </Stack>
                    </Stack>
                    <IconButton size="small" color="secondary">
                      <ArrowRight2 />
                    </IconButton>
                  </Stack>
                </Grid>

                <Grid size={12}>
                  <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <Stack direction="row" sx={{ gap: 1.5, alignItems: 'center' }}>
                      <Avatar variant="rounded" color="warning">
                        <ImageIcon />
                      </Avatar>
                      <Stack>
                        <Typography>Photos</Typography>
                        <Typography sx={{ color: 'text.secondary' }}>53 files, 321MB</Typography>
                      </Stack>
                    </Stack>
                    <IconButton size="small" color="secondary">
                      <ArrowRight2 />
                    </IconButton>
                  </Stack>
                </Grid>

                <Grid size={12}>
                  <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <Stack direction="row" sx={{ gap: 1.5, alignItems: 'center' }}>
                      <Avatar variant="rounded">
                        <Document />
                      </Avatar>
                      <Stack>
                        <Typography>Other</Typography>
                        <Typography sx={{ color: 'text.secondary' }}>49 files, 193MB</Typography>
                      </Stack>
                    </Stack>
                    <IconButton size="small" color="secondary">
                      <ArrowRight2 />
                    </IconButton>
                  </Stack>
                </Grid>
              </Grid>
            </Box>
          </Stack>
        </SimpleBar>
      </Box>
    </MainCard>
  );
}
