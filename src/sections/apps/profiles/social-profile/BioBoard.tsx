// material-ui
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project-imports
import { bioBoardData } from './data/bio-board';
import SocialActions from './SocialActions';
import Avatar from 'components/@extended/Avatar';
import MainCard from 'components/MainCard';

// types
import { ColorProps } from 'types/extended';

// ==============================|| SOCIAL PROFILE - BIO BOARD ||============================== //

export default function BioBoard() {
  return (
    <MainCard title="Bio" secondary={<SocialActions />}>
      {bioBoardData.map((data, index) => (
        <Box key={index}>
          <Typography sx={{ mb: 2 }}>{data.description}</Typography>
          <Divider sx={{ opacity: 0.5, my: 2 }} />
          <List sx={{ py: 0 }}>
            {data.contactInfo.map((contact, idx) => {
              const AvatarIcon = contact.icon;

              return (
                <ListItem key={idx} disableGutters disablePadding sx={{ mb: 1 }}>
                  <ListItemAvatar sx={{ minWidth: 43 }}>
                    <Avatar variant="rounded" sx={{ bgcolor: 'secondary.200', color: 'secondary.main', width: 32, height: 32 }}>
                      <AvatarIcon variant="TwoTone" />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={contact.label.split(' ').map((part, i) => {
                      const isURL = part.startsWith('http://') || part.startsWith('https://');
                      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(part);

                      if (isURL) {
                        return (
                          <Link
                            key={i}
                            href={part}
                            target="_blank"
                            sx={{ mr: 1, color: 'secondary.main', '&:hover': { color: 'primary.main', textDecoration: 'none' } }}
                          >
                            {part}
                          </Link>
                        );
                      } else if (isEmail) {
                        return (
                          <Link
                            key={i}
                            href={`mailto:${part}`}
                            sx={{ mr: 1, color: 'secondary.main', '&:hover': { color: 'primary.main', textDecoration: 'none' } }}
                          >
                            {part}
                          </Link>
                        );
                      } else {
                        return (
                          <Typography key={i} sx={{ color: 'secondary.main' }}>
                            {part}
                          </Typography>
                        );
                      }
                    })}
                  />
                </ListItem>
              );
            })}
          </List>

          <Divider sx={{ opacity: 0.5, my: 2 }} />
          <Grid container spacing={2}>
            {data.socialStats.map((stat, idx) => {
              const SocialIcon = stat.icon;

              return (
                <Grid key={idx} size={6}>
                  <Stack direction="row" sx={{ gap: 1.5 }}>
                    <Avatar variant="rounded" color={stat.color as ColorProps}>
                      <SocialIcon width={20} height={20} />
                    </Avatar>
                    <Stack>
                      <Typography variant="h5">{stat.value}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {stat.label}
                      </Typography>
                    </Stack>
                  </Stack>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      ))}
    </MainCard>
  );
}
