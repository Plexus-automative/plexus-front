import { useRouter } from 'next/navigation';

// material-ui
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project-imports
import Avatar from 'components/@extended/Avatar';
import MainCard from 'components/MainCard';

// types
import { TicketCommonCardProps } from 'types/helpdesk';

// assets
import { Calendar, Eye, Heart, Lock1, MessageText, Trash } from '@wandersonalwes/iconsax-react';

// ==============================|| TICKET COMMON CARD ||============================== //

export default function TicketCommonCard({
  borderLeft = false,
  borderColor,
  showAvatarStack = true,
  showBox = true,
  customerAvatar,
  ticketCount,
  likes,
  customerName,
  chipLabel,
  productAvatar,
  productName,
  supporterAvatar,
  supporterName,
  updateTime,
  messageCount,
  issueTitle,
  addCode,
  removeCode,
  drawerOpen
}: TicketCommonCardProps) {
  const router = useRouter();

  const avatarStyle = {
    height: 20,
    width: 20
  };

  return (
    <MainCard sx={{ borderLeft: borderLeft ? 3 : 1, borderLeftColor: borderLeft ? borderColor : 'divider' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ gap: { xs: 2, sm: 3 } }}>
        <Stack direction={{ xs: 'row', sm: 'column' }} sx={{ gap: 1, alignItems: { xs: 'center', sm: 'flex-start' } }}>
          <Avatar sx={{ height: 60, width: 60 }} src={customerAvatar} />
          <Stack sx={{ alignItems: { xs: 'flex-start', sm: 'center' } }}>
            <Typography sx={{ color: 'text.secondary' }}>{ticketCount} Ticket</Typography>
            <Typography sx={{ color: 'error.main', display: 'flex', gap: 0.5, alignItems: 'center' }}>
              <Heart size={16} variant="Bold" /> {likes}
            </Typography>
          </Stack>
        </Stack>
        <Stack sx={{ gap: 1, width: 1 }}>
          <Stack direction="row" onClick={drawerOpen} sx={{ gap: 1, alignItems: 'flex-start', cursor: 'pointer' }}>
            <Typography variant="h5">{customerName}</Typography>
            <Chip size="small" label={chipLabel} sx={{ color: 'text.secondary' }} />
          </Stack>

          {showAvatarStack && (
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              onClick={drawerOpen}
              sx={{ gap: 1, alignItems: { xs: 'flex-start', sm: 'center', cursor: 'pointer' } }}
            >
              <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
                <Avatar variant="rounded" color="success" sx={avatarStyle}>
                  {productAvatar}
                </Avatar>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  {productName}
                </Typography>
              </Stack>
              <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
                <Avatar variant="rounded" src={supporterAvatar} color="success" sx={avatarStyle} />
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  assigned to
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {supporterName}
                </Typography>
              </Stack>
              <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
                <Calendar size={14} />
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  Updated {updateTime}
                </Typography>
              </Stack>
              <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
                <MessageText size={14} />
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  {messageCount}
                </Typography>
              </Stack>
            </Stack>
          )}

          <Stack direction="row" sx={{ gap: 0.5, alignItems: 'center' }}>
            <Lock1 size={16} />
            <Typography variant="h5">{issueTitle}</Typography>
          </Stack>

          {showBox && (
            <Box onClick={drawerOpen} sx={{ p: 2, bgcolor: 'secondary.lighter', borderRadius: 1, mb: 1, cursor: 'pointer' }}>
              <Stack direction="row" sx={{ gap: 1, alignItems: 'center', mb: 1 }}>
                <Avatar variant="rounded" src={supporterAvatar} color="success" sx={avatarStyle} />
                <Typography component="div" variant="body1" sx={{ fontWeight: 600, display: 'flex', gap: 0.5 }}>
                  Last comment from
                  <Typography sx={{ color: 'text.secondary' }}>{supporterName}:</Typography>
                </Typography>
              </Stack>
              <Stack>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  hello {customerName},
                </Typography>
                <Typography variant="body1">
                  you need to create <span style={{ fontWeight: 600 }}> {addCode} </span> once in a page in your code,
                  <br />
                  {removeCode} <br /> just remove those things and also in option button add
                </Typography>
              </Stack>
            </Box>
          )}

          <Stack direction="row" sx={{ gap: 1.5 }}>
            <Button
              startIcon={<Eye />}
              variant="dashed"
              sx={{ border: 'none' }}
              color="primary"
              onClick={() => router.push('/admin-panel/helpdesk/ticket/details')}
            >
              View Ticket
            </Button>
            <Button startIcon={<Trash />} variant="dashed" sx={{ border: 'none' }} color="error">
              Delete
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </MainCard>
  );
}
