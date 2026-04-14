import { useRef, useState } from 'react';

// next
import { signOut } from 'next-auth/react';

// material-ui
import ButtonBase from '@mui/material/ButtonBase';
import CardContent from '@mui/material/CardContent';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project-imports
import Avatar from 'components/@extended/Avatar';
import IconButton from 'components/@extended/IconButton';
import Transitions from 'components/@extended/Transitions';
import MainCard from 'components/MainCard';

import useUser from 'hooks/useUser';

// assets
const avatar1 = '/assets/images/users/avatar-6.png';
import { Logout } from '@wandersonalwes/iconsax-react';

// ==============================|| HEADER CONTENT - PROFILE ||============================== //

export default function ProfilePage() {
  const user = useUser();

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' });
  };

  const anchorRef = useRef<any>(null);
  const [open, setOpen] = useState(false);
  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: MouseEvent | TouchEvent) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 0.75 }}>
      <ButtonBase
        sx={(theme) => ({
          p: 0.25,
          borderRadius: 1,
          '&:hover': { bgcolor: 'secondary.lighter', ...theme.applyStyles('dark', { bgcolor: 'secondary.light' }) },
          '&:focus-visible': {
            outline: `2px solid ${theme.palette.secondary.dark}`,
            outlineOffset: 2
          }
        })}
        aria-label="open profile"
        ref={anchorRef}
        aria-controls={open ? 'profile-grow' : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
      >
        <Avatar alt="profile user" src={avatar1} />
      </ButtonBase>
      <Popper
        placement="bottom-end"
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        popperOptions={{ modifiers: [{ name: 'offset', options: { offset: [0, 9] } }] }}
      >
        {({ TransitionProps }) => (
          <Transitions type="grow" position="top-right" in={open} {...TransitionProps}>
            <Paper
              sx={(theme) => ({
                boxShadow: theme.customShadows.z1,
                width: 290,
                minWidth: 240,
                maxWidth: 290,
                [theme.breakpoints.down('md')]: { maxWidth: 250 },
                borderRadius: 1.5
              })}
            >
              <ClickAwayListener onClickAway={handleClose}>
                <MainCard border={false} content={false}>
                  <CardContent sx={{ px: 2.5, pt: 3 }}>
                    <Grid container sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                      <Grid>
                        <Stack direction="row" sx={{ gap: 1.25, alignItems: 'center' }}>
                          <Avatar alt="profile user" src={avatar1} />
                          <Stack>
                            <Typography variant="subtitle1">{user ? user?.name : ''}</Typography>
                            <Typography variant="body2" color="secondary">
                              {user ? user.role : 'User'}
                            </Typography>
                          </Stack>
                        </Stack>
                      </Grid>
                      <Grid>
                        <Tooltip title="Déconnexion">
                          <IconButton size="large" color="error" sx={{ p: 1 }} onClick={handleLogout}>
                            <Logout variant="Bulk" />
                          </IconButton>
                        </Tooltip>
                      </Grid>
                    </Grid>
                  </CardContent>
                </MainCard>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>
    </Box>
  );
}
