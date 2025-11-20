import { useRef, useState } from 'react';

// next
import Link from 'next/link';

// material-ui
import Button from '@mui/material/Button';
import CardMedia from '@mui/material/CardMedia';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project-imports
import Dot from 'components/@extended/Dot';
import IconButton from 'components/@extended/IconButton';
import Transitions from 'components/@extended/Transitions';
import AnimateButton from 'components/@extended/AnimateButton';
import MainCard from 'components/MainCard';
import { DRAWER_WIDTH } from 'config';

// assets
import { Windows, ArrowRight3 } from '@wandersonalwes/iconsax-react';
const cardBack = '/assets/images/widget/img-dropbox-bg.svg';
const imageChart = '/assets/images/mega-menu/chart.svg';

// ==============================|| HEADER CONTENT - MEGA MENU SECTION ||============================== //

export default function MegaMenuSection() {
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
      <IconButton
        color="secondary"
        variant="light"
        aria-label="open profile"
        ref={anchorRef}
        aria-controls={open ? 'profile-grow' : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
        size="large"
        sx={(theme) => ({
          p: 1,
          ml: { xs: 0, lg: -2 },
          color: 'secondary.main',
          bgcolor: open ? 'secondary.200' : 'secondary.100',
          ...theme.applyStyles('dark', { bgcolor: open ? 'background.paper' : 'background.default' })
        })}
      >
        <Windows variant="Bulk" />
      </IconButton>
      <Popper
        placement="bottom"
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        popperOptions={{
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [-180, 9]
              }
            }
          ]
        }}
      >
        {({ TransitionProps }) => (
          <Transitions type="grow" position="top" in={open} {...TransitionProps}>
            <Paper
              sx={(theme) => ({
                boxShadow: theme.customShadows.z1,
                minWidth: 750,
                width: {
                  md: `calc(100vw - 100px)`,
                  lg: `calc(100vw - ${DRAWER_WIDTH + 100}px)`,
                  xl: `calc(100vw - ${DRAWER_WIDTH + 140}px)`
                },
                maxWidth: 1024,
                borderRadius: 1.5
              })}
            >
              <ClickAwayListener onClickAway={handleClose}>
                <MainCard elevation={0} border={false} content={false}>
                  <Grid container>
                    <Grid
                      size={4}
                      sx={(theme) => ({
                        bgcolor: 'primary.darker',
                        ...theme.applyStyles('dark', { bgcolor: 'primary.400' }),
                        position: 'relative',
                        '&:after': {
                          content: '""',
                          background: `url("${cardBack}") 100% / cover no-repeat`,
                          position: 'absolute',
                          top: '41%',
                          left: 0,
                          right: 0,
                          bottom: 0,
                          zIndex: 1,
                          opacity: 0.5
                        }
                      })}
                    >
                      <Box sx={{ p: 4.5, pb: 3, position: 'inherit', zIndex: 2 }}>
                        <Stack sx={(theme) => ({ color: 'background.paper', ...theme.applyStyles('dark', { color: 'text.primary' }) })}>
                          <Typography variant="h2" sx={{ fontSize: '1.875rem', mb: 1 }}>
                            Explore Components
                          </Typography>
                          <Typography variant="h6">
                            Try Able Pro&apos;s component pages to check how it feels and suits as per your need.
                          </Typography>
                          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-end', mt: -1 }}>
                            <AnimateButton>
                              <Button
                                variant="contained"
                                color="secondary"
                                sx={{
                                  zIndex: 2,
                                  color: 'text.primary',
                                  bgcolor: 'background.paper',
                                  '&:hover': { bgcolor: 'background.paper', color: 'text.primary' },
                                  '& svg': { color: 'primary.main' }
                                }}
                                endIcon={<ArrowRight3 variant="Bulk" />}
                                component={Link}
                                href="/components-overview/buttons"
                                target="_blank"
                              >
                                View All
                              </Button>
                            </AnimateButton>
                            <CardMedia component="img" src={imageChart} alt="Chart" sx={{ mr: -2.5, mb: -2.5, width: 124 }} />
                          </Stack>
                        </Stack>
                      </Box>
                    </Grid>
                    <Grid size={8}>
                      <Box
                        sx={{
                          p: 4,
                          '& .MuiList-root': { pb: 0 },
                          '& .MuiListSubheader-root': { p: 0, pb: 1.5 },
                          '& .MuiListItemButton-root': {
                            p: 0.5,
                            '&:hover': { bgcolor: 'transparent', '& .MuiTypography-root': { color: 'primary.main' } }
                          },
                          '& .MuiListItemIcon-root': { minWidth: 16 }
                        }}
                      >
                        <Grid container spacing={6}>
                          <Grid size={4}>
                            <List
                              component="nav"
                              aria-labelledby="nested-list-user"
                              subheader={
                                <ListSubheader id="nested-list-user">
                                  <Typography variant="subtitle1" sx={{ color: 'text.primary' }}>
                                    Authentication
                                  </Typography>
                                </ListSubheader>
                              }
                            >
                              <ListItemButton disableRipple component={Link} target="_blank" href="/auth/login">
                                <ListItemIcon>
                                  <Dot size={6} color="secondary" variant="outlined" />
                                </ListItemIcon>
                                <ListItemText primary="Login" />
                              </ListItemButton>
                              <ListItemButton disableRipple component={Link} target="_blank" href="/auth/register">
                                <ListItemIcon>
                                  <Dot size={6} color="secondary" variant="outlined" />
                                </ListItemIcon>
                                <ListItemText primary="Register" />
                              </ListItemButton>
                              <ListItemButton disableRipple component={Link} target="_blank" href="/auth/reset-password">
                                <ListItemIcon>
                                  <Dot size={6} color="secondary" variant="outlined" />
                                </ListItemIcon>
                                <ListItemText primary="Reset Password" />
                              </ListItemButton>
                              <ListItemButton disableRipple component={Link} target="_blank" href="/auth/forgot-password">
                                <ListItemIcon>
                                  <Dot size={6} color="secondary" variant="outlined" />
                                </ListItemIcon>
                                <ListItemText primary="Forgot Password" />
                              </ListItemButton>
                              <ListItemButton disableRipple component={Link} target="_blank" href="/auth/code-verification">
                                <ListItemIcon>
                                  <Dot size={6} color="secondary" variant="outlined" />
                                </ListItemIcon>
                                <ListItemText primary="Verification Code" />
                              </ListItemButton>
                            </List>
                          </Grid>
                          <Grid size={4}>
                            <List
                              component="nav"
                              aria-labelledby="nested-list-user"
                              subheader={
                                <ListSubheader id="nested-list-user">
                                  <Typography variant="subtitle1" sx={{ color: 'text.primary' }}>
                                    Other Pages
                                  </Typography>
                                </ListSubheader>
                              }
                            >
                              <ListItemButton disableRipple component={Link} href="#">
                                <ListItemIcon>
                                  <Dot size={6} color="secondary" variant="outlined" />
                                </ListItemIcon>
                                <ListItemText primary="About us" />
                              </ListItemButton>
                              <ListItemButton disableRipple component={Link} href="/contact-us" target="_blank">
                                <ListItemIcon>
                                  <Dot size={6} color="secondary" variant="outlined" />
                                </ListItemIcon>
                                <ListItemText primary="Contact us" />
                              </ListItemButton>
                              <ListItemButton disableRipple component={Link} href="/price/price1">
                                <ListItemIcon>
                                  <Dot size={6} color="secondary" variant="outlined" />
                                </ListItemIcon>
                                <ListItemText primary="Pricing" />
                              </ListItemButton>
                              <ListItemButton disableRipple component={Link} href="/apps/profiles/user/payment">
                                <ListItemIcon>
                                  <Dot size={6} color="secondary" variant="outlined" />
                                </ListItemIcon>
                                <ListItemText primary="Payment" />
                              </ListItemButton>
                              <ListItemButton disableRipple component={Link} target="_blank" href="/maintenance/under-construction">
                                <ListItemIcon>
                                  <Dot size={6} color="secondary" variant="outlined" />
                                </ListItemIcon>
                                <ListItemText primary="Construction" />
                              </ListItemButton>
                              <ListItemButton disableRipple component={Link} target="_blank" href="/maintenance/coming-soon">
                                <ListItemIcon>
                                  <Dot size={6} color="secondary" variant="outlined" />
                                </ListItemIcon>
                                <ListItemText primary="Coming Soon" />
                              </ListItemButton>
                            </List>
                          </Grid>
                          <Grid size={4}>
                            <List
                              component="nav"
                              aria-labelledby="nested-list-user"
                              subheader={
                                <ListSubheader id="nested-list-user">
                                  <Typography variant="subtitle1" sx={{ color: 'text.primary' }}>
                                    SAAS Pages
                                  </Typography>
                                </ListSubheader>
                              }
                            >
                              <ListItemButton disableRipple component={Link} target="_blank" href="/maintenance/404">
                                <ListItemIcon>
                                  <Dot size={6} color="secondary" variant="outlined" />
                                </ListItemIcon>
                                <ListItemText primary="404 Error" />
                              </ListItemButton>
                              <ListItemButton disableRipple component={Link} target="_blank" href="">
                                <ListItemIcon>
                                  <Dot size={6} color="secondary" variant="outlined" />
                                </ListItemIcon>
                                <ListItemText primary="Landing" />
                              </ListItemButton>
                            </List>
                          </Grid>
                        </Grid>
                      </Box>
                    </Grid>
                  </Grid>
                </MainCard>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>
    </Box>
  );
}
