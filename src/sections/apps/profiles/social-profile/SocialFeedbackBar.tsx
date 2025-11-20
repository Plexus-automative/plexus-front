import { useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import AvatarGroup from '@mui/material/AvatarGroup';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';

// project-imports
import Avatar from 'components/@extended/Avatar';

// assets
import { Like1, MessageText1, Save2, Share } from '@wandersonalwes/iconsax-react';

const avatar1 = '/assets/images/users/avatar-1.png';
const avatar2 = '/assets/images/users/avatar-2.png';
const avatar3 = '/assets/images/users/avatar-3.png';
const avatar4 = '/assets/images/users/avatar-4.png';
const avatar5 = '/assets/images/users/avatar-5.png';
const avatar6 = '/assets/images/users/avatar-6.png';
const avatar7 = '/assets/images/users/avatar-7.png';
const avatar8 = '/assets/images/users/avatar-8.png';
const avatar9 = '/assets/images/users/avatar-9.png';
const avatar10 = '/assets/images/users/avatar-10.png';

// ==============================|| SOCIAL PROFILE - SOCIAL FEEDBACK BAR ||============================== //

export default function SocialFeedbackBar() {
  const theme = useTheme();
  const [show, setShow] = useState<boolean>(false);

  const downSM = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Stack direction="row" sx={{ justifyContent: 'space-between', my: 3, flexWrap: 'wrap' }}>
      <Stack direction="row" sx={{ gap: { sm: 3 }, flexWrap: 'wrap' }}>
        <Button color="secondary" startIcon={<Like1 />}>
          {downSM ? '450' : '450K Likes'}
        </Button>
        <Button color="secondary" startIcon={<MessageText1 />}>
          {downSM ? '500' : '500 Comments'}
        </Button>
        <Button color="secondary" startIcon={<Share />}>
          {downSM ? '100' : '100 Share'}
        </Button>
        <Button color="secondary" startIcon={<Save2 />}>
          {downSM ? '20' : '20 Saved'}
        </Button>
      </Stack>
      <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
        <Typography>30 Comments</Typography>
        <Box>
          <Tooltip
            open={show}
            placement="top-end"
            title={
              <AvatarGroup max={10}>
                <Avatar alt="Trevor Henderson" src={avatar5} />
                <Avatar alt="Jone Doe" src={avatar6} />
                <Avatar alt="Lein Ket" src={avatar7} />
                <Avatar alt="Stebin Ben" src={avatar8} />
                <Avatar alt="Wungh Tend" src={avatar9} />
                <Avatar alt="Trevor Das" src={avatar10} />
              </AvatarGroup>
            }
          >
            <AvatarGroup
              sx={{
                '& .MuiAvatarGroup-avatar': { width: 25, height: 25, bgcolor: 'primary.main', cursor: 'pointer', fontSize: '0.875rem' }
              }}
              slotProps={{ surplus: { onMouseEnter: () => setShow(true), onMouseLeave: () => setShow(false) } }}
            >
              <Avatar alt="Remy Sharp" src={avatar1} />
              <Avatar alt="Travis Howard" src={avatar2} />
              <Avatar alt="Cindy Baker" src={avatar3} />
              <Avatar alt="Agnes Walker" src={avatar4} />
              <Avatar alt="Trevor Henderson" src={avatar5} />
              <Avatar alt="Jone Doe" src={avatar6} />
              <Avatar alt="Lein Ket" src={avatar7} />
              <Avatar alt="Stebin Ben" src={avatar8} />
              <Avatar alt="Wungh Tend" src={avatar9} />
              <Avatar alt="Trevor Das" src={avatar10} />
            </AvatarGroup>
          </Tooltip>
        </Box>
      </Stack>
    </Stack>
  );
}
