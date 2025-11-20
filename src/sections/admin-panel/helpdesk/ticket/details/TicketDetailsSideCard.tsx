'use client';

import { useState } from 'react';

// material-ui
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project-imports
import Avatar from 'components/@extended/Avatar';
import MainCard from 'components/MainCard';
import { listData } from 'data/helpdesk';

// assets
import { Calendar, Clock, Like1, MessageText, TickCircle, Trash } from '@wandersonalwes/iconsax-react';

// Define a type for the icon keys
type IconName = 'Calendar' | 'Clock' | 'MessageText';

// Utility to map icon names to actual components
const getIcon = (iconName: IconName) => {
  const icons: Record<IconName, React.JSX.Element> = {
    Calendar: <Calendar size={16} style={{ marginRight: 4 }} />,
    Clock: <Clock size={16} style={{ marginRight: 4 }} />,
    MessageText: <MessageText size={16} style={{ marginRight: 4 }} />
  };
  return icons[iconName];
};

// ==============================|| TICKET DETAILS - SIDE CARD ||============================== //

export default function TicketDetailsSideCard() {
  const [status, setStatus] = useState('open');
  const [person, setPerson] = useState('John david');
  const [product, setProduct] = useState('Piaf able');

  const handleStatusChange = (event: SelectChangeEvent) => {
    setStatus(event.target.value as string);
  };

  const handlePersonChange = (event: SelectChangeEvent) => {
    setPerson(event.target.value as string);
  };

  const handleProductChange = (event: SelectChangeEvent) => {
    setProduct(event.target.value as string);
  };

  return (
    <MainCard title="Ticket Details" content={false}>
      <Stack sx={{ gap: 2, p: 3 }}>
        <Alert
          icon={<TickCircle fontSize="inherit" />}
          variant="border"
          sx={{ width: 1, px: 2, py: 0.75, justifyContent: 'center', alignItems: 'center' }}
          severity="success"
          slotProps={{ message: { sx: { mt: 0 } } }}
        >
          VERIFIED PURCHASE
        </Alert>
        <Stack sx={{ gap: 1 }}>
          <Select value={status} onChange={handleStatusChange}>
            <MenuItem value="open">Open</MenuItem>
            <MenuItem value="closed">Closed</MenuItem>
            <MenuItem value="closedForever">Closed Forever</MenuItem>
          </Select>

          <Select value={person} onChange={handlePersonChange}>
            <MenuItem value="John david">John david</MenuItem>
            <MenuItem value="Jane daniel">Jane daniel</MenuItem>
            <MenuItem value="Mike luis">Mike luis</MenuItem>
            <MenuItem value="Susan singh">Susan singh</MenuItem>
            <MenuItem value="David aslam">David aslam</MenuItem>
          </Select>

          <Select value={product} onChange={handleProductChange}>
            <MenuItem value="Piaf able">Piaf able</MenuItem>
            <MenuItem value="Able Pro">Able Pro</MenuItem>
            <MenuItem value="Goru dash">Able admin</MenuItem>
            <MenuItem value="headphones">Goru dash</MenuItem>
            <MenuItem value="Mash able">Mash able</MenuItem>
          </Select>
        </Stack>
      </Stack>
      <Divider />
      <List disablePadding sx={{ '& .MuiListItem-root': { px: 3, py: 2, '& .MuiListItemText-root': { my: 0 } } }}>
        {listData.map((item, index) => (
          <ListItem key={index} divider>
            <ListItemText
              primary={
                <Stack direction="row">
                  <Typography variant="body1" sx={{ width: 1, maxWidth: 140, minWidth: 50 }}>
                    {item.primary}
                  </Typography>
                  <Typography component="div" sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                    {item.icon && getIcon(item.icon as IconName)}
                    {item.avatar && item.avatar.src && (
                      <Avatar variant="rounded" alt={item.avatar.alt} src={item.avatar.src} sx={{ height: 20, width: 20, mr: 0.5 }} />
                    )}
                    {item.avatar && item.avatar.text && (
                      <Avatar
                        variant="rounded"
                        sx={{
                          height: 20,
                          width: 20,
                          mr: 0.5,
                          bgcolor: item.avatar.color ? `palette.${item.avatar.color}.main` : undefined
                        }}
                      >
                        {item.avatar.text}
                      </Avatar>
                    )}
                    {item.secondaryText}
                  </Typography>
                </Stack>
              }
            />
          </ListItem>
        ))}
      </List>
      <Stack direction="row" sx={{ gap: 2, px: 3, py: 2 }}>
        <Button color="warning" startIcon={<Like1 />} sx={{ border: 'none' }} variant="dashed">
          Make private
        </Button>
        <Button color="error" size="small" startIcon={<Trash />} sx={{ border: 'none' }} variant="dashed">
          Delete
        </Button>
      </Stack>
    </MainCard>
  );
}
