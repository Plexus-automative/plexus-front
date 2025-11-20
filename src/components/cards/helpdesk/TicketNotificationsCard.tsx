// material-ui
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project-imports
import Avatar from 'components/@extended/Avatar';
import MainCard from 'components/MainCard';

// types
import { ColorProps } from 'types/extended';
import { TicketNotificationsCardProps } from 'types/helpdesk';

// ==========================|| TICKET - NOTIFICATIONS CARD ||========================== //

export default function TicketNotificationsCard({ title, tickets }: TicketNotificationsCardProps) {
  const avatarStyle = { height: 20, width: 20 };

  return (
    <MainCard title={title} content={false}>
      <List disablePadding component="nav" aria-label="main mailbox folders">
        {tickets.map((ticket, index) => (
          <ListItem
            key={index}
            divider
            sx={{ px: 3, py: 2 }}
            {...(ticket.badges && {
              secondaryAction: (
                <Stack direction="row" sx={{ gap: 1 }}>
                  {ticket.badges.primary && <Chip label={ticket.badges.primary} size="small" variant="light" color="error" />}
                  {ticket.badges.secondary && <Chip label={ticket.badges.secondary} size="small" />}
                </Stack>
              )
            })}
          >
            <ListItemAvatar sx={{ minWidth: 'inherit', pr: 1 }}>
              <Avatar variant="rounded" src={ticket.avatar} sx={avatarStyle} color={ticket.color as ColorProps}>
                {ticket.avatar}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              sx={{ my: 0 }}
              primary={
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  {ticket.name}
                </Typography>
              }
            />
          </ListItem>
        ))}
      </List>
    </MainCard>
  );
}
