// material-ui
import Button from '@mui/material/Button';
import CardMedia from '@mui/material/CardMedia';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project-imports
import Avatar from 'components/@extended/Avatar';
import IconButton from 'components/@extended/IconButton';
import SyntaxHighlight from 'utils/SyntaxHighlight';

// types
import { TicketDetailProps } from 'types/helpdesk';

// assets
import { Edit, Like1, Trash } from '@wandersonalwes/iconsax-react';

// ==============================|| TICKET DETAILS - COMMON CARD ||============================== //

export default function TicketDetailsCommonCard({
  avatar,
  likes,
  codeString,
  ticketNumber,
  supportAgentName,
  customerName,
  chipLabel,
  timeAgo,
  message,
  images
}: TicketDetailProps) {
  return (
    <Stack sx={{ p: 3, gap: 2 }}>
      <Stack sx={{ gap: 3 }} direction={{ xs: 'column', sm: 'row' }}>
        <Stack direction={{ xs: 'row', sm: 'column' }} sx={{ gap: 1, alignItems: 'center' }}>
          <Avatar sx={{ height: 60, width: 60 }} src={avatar} />
          {codeString ? (
            <Typography sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'primary.main' }}>
              <Like1 size={16} />
              <Typography component="span" sx={{ color: 'secondary.main' }}>
                {likes}
              </Typography>
            </Typography>
          ) : (
            <Typography component="div" sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar variant="rounded" sx={{ mr: 0.5, height: 20, width: 20 }} color="error">
                {ticketNumber}
              </Avatar>
              Ticket
            </Typography>
          )}
        </Stack>
        <Stack sx={{ gap: 2 }}>
          <Stack direction="row">
            <Stack>
              <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
                <Typography variant="h4">{supportAgentName}</Typography>
                <Chip size="small" label={chipLabel} sx={{ color: 'text.secondary' }} />
              </Stack>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                {timeAgo}
              </Typography>
            </Stack>
            <Stack direction="row" sx={{ ml: 'auto' }}>
              <Tooltip title="Edit" arrow placement="top">
                <IconButton color="success">
                  <Edit />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete" arrow placement="top">
                <IconButton color="error">
                  <Trash />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
          <Stack sx={{ gap: 2 }}>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              hello {customerName},
            </Typography>
            <Box dangerouslySetInnerHTML={{ __html: message }} sx={{ '& p': { m: 0, fontSize: '0.875rem', lineHeight: 1.5 } }} />
          </Stack>
          {images.length > 0 && (
            <Stack sx={{ gap: 2, alignItems: 'flex-start' }}>
              <Stack direction="row" sx={{ gap: 2.5, flexWrap: 'wrap' }}>
                {images.map((image, index) => (
                  <CardMedia key={index} component="img" sx={{ height: 42, width: 64 }} src={image} />
                ))}
              </Stack>
              <Button color="error" variant="dashed" sx={{ border: 'none' }} startIcon={<Like1 />}>
                Like
              </Button>
            </Stack>
          )}
          {codeString && <SyntaxHighlight customStyle={{ margin: 0 }}>{codeString}</SyntaxHighlight>}
        </Stack>
      </Stack>
    </Stack>
  );
}
