import React from 'react';

// material-ui
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project-imports
import MainCard from 'components/MainCard';
import { messageData } from 'data/helpdesk';
import TicketDetailsCommonCard from './TicketDetailsCommonCard';

// assets
import { Edit, Lock1, Message, ProfileTick, Star1 } from '@wandersonalwes/iconsax-react';

// ==============================|| HELPDESK  - TICKET DETAILS CARD ||============================== //

export default function TicketDetailsCard() {
  return (
    <MainCard
      title={
        <Stack direction="row" sx={{ gap: 1, alignItems: 'center', color: 'primary.main' }}>
          <Lock1 size={20} />
          <Typography variant="h5" sx={{ color: 'text.primary' }}>
            Private Ticket #187135432
          </Typography>
        </Stack>
      }
      content={false}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, px: 3, py: 1 }}
      >
        <Typography variant="h4">Theme customization issue</Typography>
        <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
          <Button color="success" sx={{ border: 'none' }} variant="dashed">
            Mark as unread
          </Button>
          <Box component="span" sx={{ color: 'warning.main', display: 'flex', alignItems: 'center' }}>
            <Star1 style={{ cursor: 'pointer' }} size={20} />
          </Box>
        </Stack>
      </Stack>
      <Divider />
      <Stack direction="row" sx={{ gap: 1, px: 3, py: 2, flexWrap: 'wrap' }}>
        <Button color="success" startIcon={<Message />} sx={{ border: 'none' }} variant="dashed">
          Post a reply
        </Button>
        <Button color="warning" startIcon={<Edit />} sx={{ border: 'none' }} variant="dashed">
          Post a Note
        </Button>
        <Button color="error" startIcon={<ProfileTick />} sx={{ border: 'none' }} variant="dashed">
          Customer Notes
        </Button>
      </Stack>
      <Divider />
      {messageData.map((data, index) => (
        <React.Fragment key={index}>
          <TicketDetailsCommonCard
            avatar={data.avatar}
            chipLabel={data.chipLabel}
            images={data.images}
            message={data.message}
            supportAgentName={data.supportAgentName}
            customerName={data.customerName}
            timeAgo={data.timeAgo}
            codeString={data.codeString as string}
            likes={data.likes}
            ticketNumber={data.ticketNumber as number}
          />
          <Divider />
        </React.Fragment>
      ))}
    </MainCard>
  );
}
