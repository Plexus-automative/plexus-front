// next
import Link from 'next/link';

// material-ui
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Links from '@mui/material/Link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project-imports
import IconButton from 'components/@extended/IconButton';
import MainCard from 'components/MainCard';
import { calendarData } from 'data/membership';

// assets
import { ArrowLeft2, ArrowRight2 } from '@wandersonalwes/iconsax-react';

// ==============================|| MEMBERSHIP - DASHBOARD - CALENDAR ||============================== //

export default function CalendarEventsCard() {
  const iconButtonSx = { border: 1, borderColor: 'divider', height: 20, width: 20, p: 0.25, borderRadius: 0.5 };

  return (
    <MainCard>
      <Typography variant="h5">Calendar</Typography>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mt: 1, mb: 2.5 }}>
        <Typography component="div" sx={{ color: 'secondary.500' }} variant="body1">
          Aug 10, Mon
          <Chip label="TODAY" sx={{ ml: 0.5, height: 'auto' }} color="primary" variant="filled" size="small" />
        </Typography>
        <Stack direction="row" sx={{ gap: 1 }}>
          <IconButton color="secondary" size="small" sx={iconButtonSx}>
            <ArrowLeft2 />
          </IconButton>
          <IconButton color="secondary" size="small" sx={iconButtonSx}>
            <ArrowRight2 />
          </IconButton>
        </Stack>
      </Stack>
      <List disablePadding sx={{ mb: 2.5 }}>
        {calendarData.map((data, index) => (
          <Box key={index} sx={{ border: 1, borderColor: 'divider', borderRadius: 1, mt: 1.25 }}>
            <ListItem sx={{ px: 2, py: 1.25, my: 0, borderLeft: 4, borderRadius: 1, borderLeftColor: data.borderColor }}>
              <ListItemText
                sx={{ my: 0 }}
                primary={<Typography variant="body1">{data.primaryText}</Typography>}
                secondary={
                  <Typography variant="body2" component="span" sx={{ color: 'secondary.500' }}>
                    {data.secondaryText}
                  </Typography>
                }
              />
            </ListItem>
          </Box>
        ))}
      </List>
      <Divider sx={{ mx: -3 }} />
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'center', mt: 2.5 }}>
        <Links component={Link} href="/apps/calendar" color="primary" sx={{ display: 'flex', alignItems: 'center' }}>
          See full calendar <ArrowRight2 size={14} />
        </Links>
      </Stack>
    </MainCard>
  );
}
