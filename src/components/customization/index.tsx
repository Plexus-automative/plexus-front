import { useMemo, useState } from 'react';

// material-ui
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import Fab from '@mui/material/Fab';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project-imports
import ColorScheme from './ColorScheme';
import MenuCaption from './MenuCaption';
import ThemeContrast from './ThemeContrast';
import ThemeFont from './ThemeFont';
import ThemeLayout from './ThemeLayout';
import ThemeMenuDirection from './ThemeMenuDirection';
import ThemeModeComponent from './ThemeMode';
import ThemeWidth from './ThemeWidth';

import IconButton from 'components/@extended/IconButton';
import MainCard from 'components/MainCard';
import SimpleBar from 'components/third-party/SimpleBar';
import { GRID_COMMON_SPACING, HEADER_HEIGHT } from 'config';

// assets
import { Add, Setting2 } from '@wandersonalwes/iconsax-react';

// ==============================|| HEADER CONTENT - CUSTOMIZATION ||============================== //

export default function Customization() {
  const themeLayout = useMemo(() => <ThemeLayout />, []);

  const themeDirection = useMemo(() => <ThemeMenuDirection />, []);

  const themeMode = useMemo(() => <ThemeModeComponent />, []);

  const themeContrastView = useMemo(() => <ThemeContrast />, []);

  const menuCaptionView = useMemo(() => <MenuCaption />, []);

  const themeColor = useMemo(() => <ColorScheme />, []);

  const themeWidth = useMemo(() => <ThemeWidth />, []);

  const themeFont = useMemo(() => <ThemeFont />, []);

  const [open, setOpen] = useState(false);
  const handleToggle = () => {
    setOpen(!open);
  };

  return (
    <>
      <Fab
        component="div"
        onClick={handleToggle}
        size="large"
        variant="circular"
        sx={(theme) => ({
          borderRadius: 0,
          borderTopLeftRadius: '50%',
          borderBottomLeftRadius: '50%',
          borderTopRightRadius: '4px',
          borderBottomRightRadius: '4px',
          top: '14%',
          position: 'fixed',
          right: 0,
          zIndex: 1200,
          boxShadow: theme.customShadows.z1,
          bgcolor: 'background.paper',
          border: '4px solid ',
          borderColor: 'background.paper',
          borderRight: 'none',
          '&:hover': { bgcolor: 'primary.lighter' }
        })}
      >
        <IconButton
          onClick={handleToggle}
          aria-label="settings toggler"
          size="large"
          sx={{ p: 0, '& :hover': { bgcolor: 'red' }, '& svg': { width: 28, height: 28 } }}
        >
          <Setting2 variant="Bulk" />
        </IconButton>
      </Fab>
      <Drawer
        sx={{
          zIndex: 2001
        }}
        anchor="right"
        onClose={handleToggle}
        open={open}
        slotProps={{ paper: { sx: { width: 350, overflowY: 'hidden' } } }}
      >
        {open && (
          <MainCard content={false} border={false}>
            <Stack direction="row" sx={{ gap: 1.5, alignItems: 'center', justifyContent: 'space-between', p: 2.5 }}>
              <Typography variant="h5">Settings</Typography>
              <IconButton color="error" sx={{ p: 0 }} onClick={handleToggle}>
                <Add size={28} style={{ transform: 'rotate(45deg)' }} />
              </IconButton>
            </Stack>
            <Box sx={{ height: 'calc(100vh - 76px)' }}>
              <SimpleBar sx={{ '& .simplebar-content': { display: 'flex', flexDirection: 'column' } }}>
                <Box sx={{ p: 3, height: `calc(100vh - ${HEADER_HEIGHT}px)` }}>
                  <Grid container spacing={GRID_COMMON_SPACING}>
                    {/* theme-mode */}
                    <Grid size={12}>
                      <Stack>
                        <Typography variant="subtitle1" sx={{ color: 'text.primary' }}>
                          Theme Mode
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          Choose light or dark mode
                        </Typography>
                      </Stack>
                    </Grid>
                    <Grid size={12}>{themeMode}</Grid>
                    <Grid size={12}>
                      <Divider />
                    </Grid>

                    {/* theme-contrast */}
                    <Grid size={12}>
                      <Stack>
                        <Typography variant="subtitle1" sx={{ color: 'text.primary' }}>
                          Theme Contrast
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          Choose theme contrast/shadow
                        </Typography>
                      </Stack>
                    </Grid>
                    <Grid size={12}>{themeContrastView}</Grid>
                    <Grid size={12}>
                      <Divider />
                    </Grid>

                    {/* custom-theme */}
                    <Grid size={12}>
                      <Stack>
                        <Typography variant="subtitle1" sx={{ color: 'text.primary' }}>
                          Custom Theme
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          Choose your primary theme color
                        </Typography>
                      </Stack>
                    </Grid>
                    <Grid size={12}>{themeColor}</Grid>
                    <Grid size={12}>
                      <Divider />
                    </Grid>

                    {/* menu-caption */}
                    <Grid size={12}>
                      <Stack>
                        <Typography variant="subtitle1" sx={{ color: 'text.primary' }}>
                          Sidebar Caption
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          Hide your sidebar caption
                        </Typography>
                      </Stack>
                    </Grid>
                    <Grid size={12}>{menuCaptionView}</Grid>
                    <Grid size={12}>
                      <Divider />
                    </Grid>

                    {/* theme-layout */}
                    <Grid size={12}>
                      <Stack>
                        <Typography variant="subtitle1" sx={{ color: 'text.primary' }}>
                          Theme Layout
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          Choose your layout
                        </Typography>
                      </Stack>
                    </Grid>
                    <Grid size={12}>{themeLayout}</Grid>
                    <Grid size={12}>
                      <Divider />
                    </Grid>

                    {/* theme-orientation */}
                    <Grid size={12}>
                      <Stack>
                        <Typography variant="subtitle1" sx={{ color: 'text.primary' }}>
                          Menu Direction
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          Choose RTL or LTR theme direction
                        </Typography>
                      </Stack>
                    </Grid>
                    <Grid size={12}>{themeDirection}</Grid>
                    <Grid size={12}>
                      <Divider />
                    </Grid>

                    {/* theme-container */}
                    <Grid size={12}>
                      <Stack>
                        <Typography variant="subtitle1" sx={{ color: 'text.primary' }}>
                          Layout Width
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          Choose fluid or container layout
                        </Typography>
                      </Stack>
                    </Grid>
                    <Grid size={12}>{themeWidth}</Grid>
                    <Grid size={12}>
                      <Divider />
                    </Grid>

                    {/* theme-font-family */}
                    <Grid size={12}>
                      <Stack>
                        <Typography variant="subtitle1" sx={{ color: 'text.primary' }}>
                          Font Family
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          Choose your font family.
                        </Typography>
                      </Stack>
                    </Grid>
                    <Grid size={12}>{themeFont}</Grid>
                    <Grid size={12}>
                      <Divider />
                    </Grid>
                  </Grid>
                </Box>
              </SimpleBar>
            </Box>
          </MainCard>
        )}
      </Drawer>
    </>
  );
}
