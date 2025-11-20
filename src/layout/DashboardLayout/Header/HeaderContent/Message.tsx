import { useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import Drawer from '@mui/material/Drawer';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project-imports
import MessageCard from 'components/cards/statistics/MessageCard';
import IconButton from 'components/@extended/IconButton';
import MainCard from 'components/MainCard';
import SimpleBar from 'components/third-party/SimpleBar';
import { ThemeMode } from 'config';

// assets
import { Add, NotificationStatus } from '@wandersonalwes/iconsax-react';

const message1Light = '/assets/images/widget/message/message1Light.svg';
const message1Dark = '/assets/images/widget/message/message1Dark.svg';
const message2Light = '/assets/images/widget/message/message2Light.svg';
const message2Dark = '/assets/images/widget/message/message2Dark.svg';
const message3Light = '/assets/images/widget/message/message3Light.svg';
const message3Dark = '/assets/images/widget/message/message3Dark.svg';
const message4Light = '/assets/images/widget/message/message4Light.svg';
const message4Dark = '/assets/images/widget/message/message4Dark.svg';

// ==============================|| HEADER CONTENT - CUSTOMIZATION ||============================== //

export default function Customization() {
  const theme = useTheme();

  const message1 = theme.palette.mode === ThemeMode.DARK ? message1Dark : message1Light;
  const message2 = theme.palette.mode === ThemeMode.DARK ? message2Dark : message2Light;
  const message3 = theme.palette.mode === ThemeMode.DARK ? message3Dark : message3Light;
  const message4 = theme.palette.mode === ThemeMode.DARK ? message4Dark : message4Light;

  const [open, setOpen] = useState(false);
  const handleToggle = () => {
    setOpen(!open);
  };

  return (
    <>
      <Box sx={{ flexShrink: 0, ml: 0.75 }}>
        <IconButton
          color="secondary"
          variant="light"
          onClick={handleToggle}
          aria-label="settings toggler"
          size="large"
          sx={(theme) => ({
            p: 1,
            color: 'secondary.main',
            bgcolor: open ? 'secondary.200' : 'secondary.100',
            ...theme.applyStyles('dark', { bgcolor: open ? 'background.paper' : 'background.default' })
          })}
        >
          <NotificationStatus variant="Bulk" />
        </IconButton>
      </Box>
      <Drawer
        sx={{ zIndex: 2001 }}
        anchor="right"
        onClose={handleToggle}
        open={open}
        slotProps={{ paper: { sx: { width: { xs: 350, sm: 474 } } } }}
      >
        {open && (
          <MainCard content={false} sx={{ border: 'none', borderRadius: 0, height: '100vh' }}>
            <SimpleBar
              sx={{
                '& .simplebar-content': {
                  display: 'flex',
                  flexDirection: 'column'
                }
              }}
            >
              <Box sx={{ p: 2.5 }}>
                <Stack direction="row" sx={{ gap: 1.5, alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="h5">What’s new announcement?</Typography>
                  <IconButton color="error" sx={{ p: 0 }} onClick={handleToggle}>
                    <Add size={28} style={{ transform: 'rotate(45deg)' }} />
                  </IconButton>
                </Stack>
                <Grid container spacing={1.5} sx={{ mt: 2 }}>
                  <Grid size={12}>
                    <Typography variant="h6">Today</Typography>
                  </Grid>
                  <Grid size={12}>
                    <MessageCard
                      status={{ label: 'New Feature', color: 'success' }}
                      time="just now"
                      title="Select Business Unit"
                      message="You can use the Analytics Dashboard to explore how many new users download reports daily and monthly"
                      src={message1}
                      actions={[
                        {
                          label: 'Skip Intro',
                          button: { variant: 'outlined', color: 'secondary', fullWidth: true }
                        },
                        {
                          label: 'Next',
                          button: { variant: 'contained', fullWidth: true }
                        }
                      ]}
                    />
                  </Grid>
                  <Grid size={12}>
                    <MessageCard
                      status={{ label: 'Meeting', color: 'warning' }}
                      time="2 min ago"
                      title="General Meeting for update"
                      message="You can use the Dashboard to explore how many new users download reports daily and monthly"
                      src={message2}
                    />
                  </Grid>
                  <Grid sx={{ my: 1.25 }} size={12}>
                    <Typography variant="h6">Yesterday</Typography>
                  </Grid>
                  <Grid size={12}>
                    <MessageCard
                      status={{ label: 'Improvement', color: 'primary' }}
                      time="2 hours ago"
                      title="Widgets update"
                      message="We've made some updates to the emendable widget which we think you are going to love."
                      src={message3}
                    />
                  </Grid>
                  <Grid size={12}>
                    <MessageCard
                      status={{ label: 'Improvement', color: 'primary' }}
                      time="1 day ago"
                      title="Coming soon dark mode"
                      message="We've made some updates to the emendable widget which we think you are going to love."
                      src={message4}
                    />
                  </Grid>
                </Grid>
              </Box>
            </SimpleBar>
          </MainCard>
        )}
      </Drawer>
    </>
  );
}
