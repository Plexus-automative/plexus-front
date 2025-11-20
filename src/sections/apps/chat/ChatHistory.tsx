import { useEffect, useRef } from 'react';

// material-ui
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project-imports
import UserAvatar from './UserAvatar';
import ChatMessageAction from './ChatMessageAction';
import { useGetUserChat } from 'api/chat';
import IconButton from 'components/@extended/IconButton';
import CircularLoader from 'components/CircularLoader';

// assets
import { Edit } from '@wandersonalwes/iconsax-react';

// types
import { UserProfile } from 'types/user-profile';

interface ChatHistoryProps {
  user: UserProfile;
}

// ==============================|| CHAT - HISTORY ||============================== //

export default function ChatHistory({ user }: ChatHistoryProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const { chat, chatLoading } = useGetUserChat(user.name!);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [chat]);

  if (chatLoading) <CircularLoader />;

  return (
    <Grid container spacing={2.5}>
      {chat.map((history, index) => (
        <Grid key={index} size={12}>
          {history.from !== user.name ? (
            <Stack direction="row" sx={{ gap: 1.25, alignItems: 'flex-start' }}>
              <Grid container size={12} sx={{ justifyContent: 'flex-end' }}>
                <Grid size={{ xs: 2, md: 3, xl: 4 }} />

                <Grid size={{ xs: 10, md: 9, xl: 8 }}>
                  <Stack direction="row" sx={{ justifyContent: 'flex-end', alignItems: 'flex-start' }}>
                    <ChatMessageAction index={index} />
                    <IconButton size="small" color="secondary">
                      <Edit />
                    </IconButton>
                    <Card
                      sx={{
                        display: 'inline-block',
                        float: 'right',
                        bgcolor: 'primary.main',
                        boxShadow: 'none',
                        ml: 1
                      }}
                    >
                      <CardContent sx={{ p: 1, pb: '8px !important', width: 'fit-content', ml: 'auto' }}>
                        <Grid container spacing={1}>
                          <Grid size={12}>
                            <Typography
                              variant="h6"
                              sx={(theme) => ({
                                overflowWrap: 'anywhere',
                                color: 'background.default',
                                ...theme.applyStyles('dark', { color: 'text.primary' })
                              })}
                            >
                              {history.text}
                            </Typography>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Stack>
                </Grid>
                <Grid sx={{ mt: 1 }} size={12}>
                  <Typography align="right" variant="subtitle2" sx={{ color: 'text.secondary' }}>
                    {history.time}
                  </Typography>
                </Grid>
              </Grid>
              <UserAvatar user={{ online_status: 'available', avatar: 'avatar-1.png', name: 'User 1' }} />
            </Stack>
          ) : (
            <Stack direction="row" sx={{ gap: 1.25, alignItems: 'flex-start' }}>
              <UserAvatar user={{ online_status: user.online_status, avatar: user.avatar, name: user.name }} />

              <Grid container size={12}>
                <Grid size={{ xs: 12, sm: 7 }}>
                  <Card
                    sx={{
                      display: 'inline-block',
                      float: 'left',
                      bgcolor: 'background.paper',
                      boxShadow: 'none'
                    }}
                  >
                    <CardContent sx={{ p: 1, pb: '8px !important' }}>
                      <Grid container spacing={1}>
                        <Grid size={12}>
                          <Typography variant="h6" sx={{ color: 'text.primary', overflowWrap: 'anywhere' }}>
                            {history.text}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid sx={{ mt: 1 }} size={12}>
                  <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                    {history.time}
                  </Typography>
                </Grid>
              </Grid>
            </Stack>
          )}
        </Grid>
      ))}
      <Grid ref={bottomRef} />
    </Grid>
  );
}
