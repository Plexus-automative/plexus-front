'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

// material-ui
import { styled, Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Collapse from '@mui/material/Collapse';
import Dialog from '@mui/material/Dialog';
import Grid from '@mui/material/Grid';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Popper from '@mui/material/Popper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// third-party
import EmojiPicker, { SkinTones, EmojiClickData } from 'emoji-picker-react';

// project-imports
import CircularWithPath from 'components/@extended/progress/CircularWithPath';
import IconButton from 'components/@extended/IconButton';
import MoreIcon from 'components/@extended/MoreIcon';
import { PopupTransition } from 'components/@extended/Transitions';
import MainCard from 'components/MainCard';
import SimpleBar from 'components/third-party/SimpleBar';

import ChatDrawer from 'sections/apps/chat/ChatDrawer';
import ChatHeader from 'sections/apps/chat/ChatHeader';
import ChatHistory from 'sections/apps/chat/ChatHistory';
import UserDetails from 'sections/apps/chat/UserDetails';

import { insertChat, useGetUsers } from 'api/chat';
import { openSnackbar } from 'api/snackbar';
import incrementer from 'utils/incrementer';

// assets
import {
  Add,
  Call,
  Camera,
  DocumentDownload,
  EmojiHappy,
  Image as ImageIcon,
  InfoCircle,
  Paperclip,
  Send,
  Trash,
  VolumeHigh,
  VolumeMute
} from '@wandersonalwes/iconsax-react';

// types
import { SnackbarProps } from 'types/snackbar';
import { UserProfile } from 'types/user-profile';

const drawerWidth = 320;

const Main = styled('main', { shouldForwardProp: (prop: string) => prop !== 'open' })<{ open: boolean }>(({ theme }) => ({
  flexGrow: 1,
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.shorter
  }),
  marginLeft: `-${drawerWidth}px`,
  [theme.breakpoints.down('lg')]: {
    paddingLeft: 0,
    marginLeft: 0
  },
  variants: [
    {
      props: ({ open }) => open,
      style: {
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create('margin', {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.shorter
        }),
        marginLeft: 0
      }
    }
  ]
}));

// ==============================|| APPLICATION - CHAT ||============================== //

export default function Chat() {
  const { usersLoading, users } = useGetUsers();

  const downLG = useMediaQuery((theme) => theme.breakpoints.down('lg'));
  const downMD = useMediaQuery((theme) => theme.breakpoints.down('md'));
  const [emailDetails, setEmailDetails] = useState(false);
  const [user, setUser] = useState<UserProfile>({});

  const [anchorEl, setAnchorEl] = useState<Element | (() => Element) | null | undefined>(null);

  useEffect(() => {
    if (!usersLoading) {
      const newUser = users.filter((item) => item.id?.toString() === '2')[0];
      setUser(newUser);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usersLoading]);

  const handleClickSort = (event: React.MouseEvent<HTMLButtonElement> | undefined) => {
    setAnchorEl(event?.currentTarget);
  };

  const handleCloseSort = () => {
    setAnchorEl(null);
  };

  const handleUserChange = () => {
    setEmailDetails((prev) => !prev);
  };

  const [openChatDrawer, setOpenChatDrawer] = useState(true);
  const handleDrawerOpen = () => {
    setOpenChatDrawer((prevState) => !prevState);
  };

  const [anchorElEmoji, setAnchorElEmoji] = useState<any>(); /** No single type can cater for all elements */

  const handleOnEmojiButtonClick = (event: React.MouseEvent<HTMLButtonElement> | undefined) => {
    setAnchorElEmoji(anchorElEmoji ? null : event?.currentTarget);
  };

  // handle new message form
  const [message, setMessage] = useState('');
  const textInput = useRef(null);

  const handleOnSend = () => {
    if (message.trim() === '') {
      openSnackbar({
        open: true,
        message: 'Message required',
        variant: 'alert',
        alert: {
          color: 'error'
        }
      } as SnackbarProps);
    } else {
      const d = new Date();
      const newMessage = {
        id: Number(incrementer(users.length)),
        from: 'User1',
        to: user.name,
        text: message,
        time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      insertChat(user.name!, newMessage);
    }
    setMessage('');
  };

  const handleEnter = (event: React.KeyboardEvent<HTMLDivElement> | undefined) => {
    if (event?.key !== 'Enter') {
      return;
    }
    handleOnSend();
  };

  // handle emoji
  const onEmojiClick = (emojiObject: EmojiClickData) => {
    setMessage(message + emojiObject.emoji);
  };

  const emojiOpen = Boolean(anchorElEmoji);
  const emojiId = emojiOpen ? 'simple-popper' : undefined;

  const handleCloseEmoji = () => {
    setAnchorElEmoji(null);
  };

  // close sidebar when widow size below 'md' breakpoint
  useEffect(() => {
    setOpenChatDrawer(!downLG);
  }, [downLG]);

  const chatDrawer = useMemo(
    () => (
      <ChatDrawer
        openChatDrawer={openChatDrawer}
        handleDrawerOpen={handleDrawerOpen}
        setUser={setUser}
        selectedUser={usersLoading || Object.keys(user).length === 0 ? null : user.id!}
      />
    ),
    [user, openChatDrawer, usersLoading]
  );

  return (
    <Box sx={{ display: 'flex', overflow: 'hidden' }}>
      {chatDrawer}
      <Main open={openChatDrawer} sx={{ minWidth: 0 }}>
        <Grid container sx={{ height: 1 }}>
          <Grid
            size={{ xs: 12, md: emailDetails ? 8 : 12, xl: emailDetails ? 9 : 12 }}
            sx={(theme) => ({
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.easeOut,
                duration: theme.transitions.duration.shorter + 200
              })
            })}
          >
            <MainCard
              content={false}
              sx={(theme: Theme) => ({
                height: 1,
                bgcolor: 'grey.50',
                ...theme.applyStyles('dark', { bgcolor: 'dark.main' }),
                borderRadius: 1.5,
                ...(emailDetails && !openChatDrawer && { borderRadius: '12px 0 0 12px' }),
                ...(!emailDetails && openChatDrawer && { borderRadius: '0 12px 12px 0' }),
                ...(emailDetails && openChatDrawer && { borderRadius: 0 }),
                transition: theme.transitions.create('width', {
                  easing: theme.transitions.easing.easeOut,
                  duration: theme.transitions.duration.shorter + 200
                }),
                [theme.breakpoints.down('md')]: { borderRadius: 1.5 }
              })}
            >
              <Grid container spacing={2} sx={{ height: 1 }}>
                <Grid size={12} sx={{ bgcolor: 'background.paper', p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Grid container spacing={1.5} sx={{ justifyContent: 'space-between' }}>
                    <Grid>
                      <ChatHeader loading={usersLoading} user={user} handleDrawerOpen={handleDrawerOpen} />
                    </Grid>
                    <Grid>
                      <Stack direction="row" sx={{ gap: 1, alignItems: 'center', justifyContent: 'flex-end' }}>
                        <IconButton size="large" color="secondary">
                          <Call />
                        </IconButton>
                        <IconButton size="large" color="secondary">
                          <Camera />
                        </IconButton>

                        <IconButton
                          onClick={handleUserChange}
                          size="large"
                          sx={(theme) => ({
                            '&::after': { content: 'none' },
                            ':hover': { ...theme.applyStyles('dark', { color: 'text.primary' }) }
                          })}
                          color={emailDetails ? 'error' : 'secondary'}
                        >
                          {emailDetails ? <Add style={{ transform: 'rotate(45deg)' }} /> : <InfoCircle />}
                        </IconButton>
                        <IconButton onClick={handleClickSort} sx={{ transform: 'rotate(90deg)' }} size="large" color="secondary">
                          <MoreIcon />
                        </IconButton>
                        <Menu
                          id="simple-menu"
                          anchorEl={anchorEl}
                          keepMounted
                          open={Boolean(anchorEl)}
                          onClose={handleCloseSort}
                          anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right'
                          }}
                          transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right'
                          }}
                          slotProps={{ list: { sx: { p: 0 } } }}
                        >
                          <MenuItem onClick={handleCloseSort}>
                            <DocumentDownload style={{ paddingRight: 8 }} />
                            <Typography>Archive</Typography>
                          </MenuItem>
                          <MenuItem onClick={handleCloseSort}>
                            <VolumeMute style={{ paddingRight: 8 }} />
                            <Typography>Muted</Typography>
                          </MenuItem>
                          <MenuItem onClick={handleCloseSort}>
                            <Trash style={{ paddingRight: 8 }} />
                            <Typography>Delete</Typography>
                          </MenuItem>
                        </Menu>
                      </Stack>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid size={12}>
                  <SimpleBar
                    sx={{
                      overflowX: 'hidden',
                      height: 'calc(100vh - 416px)',
                      minHeight: 420,
                      '& .simplebar-content': {
                        height: '100%'
                      }
                    }}
                  >
                    <Box sx={{ pl: 3, pr: 3, pt: 1, height: '100%' }}>
                      {usersLoading || Object.keys(user).length === 0 ? (
                        <Stack sx={{ alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                          <CircularWithPath />
                        </Stack>
                      ) : (
                        <ChatHistory user={user} />
                      )}
                    </Box>
                  </SimpleBar>
                </Grid>
                <Grid
                  size={12}
                  sx={{ height: 1, pt: 2, pl: 2, bgcolor: 'background.paper', borderTop: '1px solid ', borderTopColor: 'divider' }}
                >
                  <Stack>
                    <TextField
                      inputRef={textInput}
                      fullWidth
                      multiline
                      rows={4}
                      placeholder="Your Message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value.length <= 1 ? e.target.value.trim() : e.target.value)}
                      onKeyDown={handleEnter}
                      variant="standard"
                      slotProps={{ input: { sx: { '&:before': { borderBottomColor: 'divider' } } } }}
                    />
                    <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                      <Stack direction="row" sx={{ py: 2, ml: -1 }}>
                        <>
                          <IconButton
                            ref={anchorElEmoji}
                            aria-describedby={emojiId}
                            onClick={handleOnEmojiButtonClick}
                            sx={{ opacity: 0.5 }}
                            size="medium"
                            color="secondary"
                          >
                            <EmojiHappy />
                          </IconButton>
                          <Popper
                            id={emojiId}
                            open={emojiOpen}
                            anchorEl={anchorElEmoji}
                            disablePortal
                            style={{ zIndex: 1200 }}
                            popperOptions={{
                              modifiers: [
                                {
                                  name: 'offset',
                                  options: {
                                    offset: [-20, 125]
                                  }
                                }
                              ]
                            }}
                          >
                            <ClickAwayListener onClickAway={handleCloseEmoji}>
                              <MainCard elevation={8} content={false}>
                                <EmojiPicker onEmojiClick={onEmojiClick} defaultSkinTone={SkinTones.DARK} autoFocusSearch={false} />
                              </MainCard>
                            </ClickAwayListener>
                          </Popper>
                        </>
                        <IconButton sx={{ opacity: 0.5 }} size="medium" color="secondary">
                          <Paperclip />
                        </IconButton>
                        <IconButton sx={{ opacity: 0.5 }} size="medium" color="secondary">
                          <ImageIcon />
                        </IconButton>
                        <IconButton sx={{ opacity: 0.5 }} size="medium" color="secondary">
                          <VolumeHigh />
                        </IconButton>
                      </Stack>
                      <IconButton color="primary" onClick={handleOnSend} size="large" sx={{ mr: 1.5 }}>
                        <Send />
                      </IconButton>
                    </Stack>
                  </Stack>
                </Grid>
              </Grid>
            </MainCard>
          </Grid>
          <Grid sx={{ overflow: 'hidden', display: emailDetails ? 'flex' : 'none' }} size={{ xs: 12, md: 4, xl: 3 }}>
            <Collapse orientation="horizontal" in={emailDetails && !downMD}>
              <UserDetails user={user} onClose={handleUserChange} />
            </Collapse>
          </Grid>

          <Dialog slots={{ transition: PopupTransition }} onClose={handleUserChange} open={downMD && emailDetails} scroll="body">
            <UserDetails user={user} onClose={handleUserChange} />
          </Dialog>
        </Grid>
      </Main>
    </Box>
  );
}
