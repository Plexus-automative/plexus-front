import { useEffect, useState, ChangeEvent, MouseEvent } from 'react';

// next
import Link from 'next/link';

// material-ui
import Divider from '@mui/material/Divider';
import FormLabel from '@mui/material/FormLabel';
import Grid from '@mui/material/Grid';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project-imports
import ProfileTab from './ProfileTab';
import Avatar from 'components/@extended/Avatar';
import MoreIcon from 'components/@extended/MoreIcon';
import IconButton from 'components/@extended/IconButton';
import MainCard from 'components/MainCard';
import { facebookColor, linkedInColor } from 'config';

// assets
import { Apple, Camera, Facebook, Google } from '@wandersonalwes/iconsax-react';
const avatarImage = '/assets/images/users';

interface Props {
  focusInput: () => void;
}

// ==============================|| USER PROFILE - TABS ||============================== //

export default function ProfileTabs({ focusInput }: Props) {
  const [selectedImage, setSelectedImage] = useState<File | undefined>(undefined);
  const [avatar, setAvatar] = useState<string | undefined>(`${avatarImage}/default.png`);

  useEffect(() => {
    if (selectedImage) {
      setAvatar(URL.createObjectURL(selectedImage));
    }
  }, [selectedImage]);

  const [anchorEl, setAnchorEl] = useState<Element | (() => Element) | null | undefined>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: MouseEvent<HTMLButtonElement> | undefined) => {
    setAnchorEl(event?.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <MainCard>
      <Grid container spacing={6}>
        <Grid size={12}>
          <Stack direction="row" sx={{ justifyContent: 'flex-end' }}>
            <IconButton
              variant="light"
              color="secondary"
              id="basic-button"
              aria-controls={open ? 'basic-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
              onClick={handleClick}
              sx={{ transform: 'rotate(90deg)' }}
            >
              <MoreIcon />
            </IconButton>
            <Menu
              id="basic-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              slotProps={{ list: { 'aria-labelledby': 'basic-button' } }}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <MenuItem
                component={Link}
                href="/apps/profiles/user/personal"
                onClick={() => {
                  handleClose();
                  setTimeout(() => {
                    focusInput();
                  });
                }}
              >
                Edit
              </MenuItem>
              <MenuItem onClick={handleClose} disabled>
                Delete
              </MenuItem>
            </Menu>
          </Stack>
          <Stack sx={{ gap: 2.5, alignItems: 'center' }}>
            <FormLabel
              htmlFor="change-avatar"
              sx={{
                position: 'relative',
                borderRadius: '50%',
                overflow: 'hidden',
                '&:hover .MuiBox-root': { opacity: 1 },
                cursor: 'pointer'
              }}
            >
              <Avatar alt="Avatar 1" src={avatar} sx={{ width: 124, height: 124, border: '1px dashed' }} />
              <Box
                sx={(theme) => ({
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  bgcolor: 'rgba(0,0,0,.65)',
                  ...theme.applyStyles('dark', { bgcolor: 'rgba(255, 255, 255, .75)' }),
                  width: '100%',
                  height: '100%',
                  opacity: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                })}
              >
                <Stack sx={{ gap: 0.5, alignItems: 'center', color: 'secondary.lighter' }}>
                  <Camera style={{ fontSize: '2rem' }} />
                  <Typography>Upload</Typography>
                </Stack>
              </Box>
            </FormLabel>
            <TextField
              type="file"
              id="change-avatar"
              placeholder="Outlined"
              variant="outlined"
              sx={{ display: 'none' }}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSelectedImage(e.target.files?.[0])}
            />
            <Stack sx={{ gap: 0.5, alignItems: 'center' }}>
              <Typography variant="h5">Stebin Ben</Typography>
              <Typography color="secondary">Full Stack Developer</Typography>
            </Stack>
            <Stack direction="row" sx={{ gap: 3, '& svg': { fontSize: '1.15rem', cursor: 'pointer' }, color: 'error.main' }}>
              <Google variant="Bold" />
              <Facebook variant="Bold" color={facebookColor} />
              <Apple variant="Bold" color={linkedInColor} />
            </Stack>
          </Stack>
        </Grid>
        <Grid sx={{ display: { sm: 'block', md: 'none' } }} size={{ sm: 3 }} />
        <Grid size={{ xs: 12, sm: 6, md: 12 }}>
          <Stack direction="row" sx={{ justifyContent: 'space-around', alignItems: 'center' }}>
            <Stack sx={{ gap: 0.5, alignItems: 'center' }}>
              <Typography variant="h5">86</Typography>
              <Typography color="secondary">Post</Typography>
            </Stack>
            <Divider orientation="vertical" flexItem />
            <Stack sx={{ gap: 0.5, alignItems: 'center' }}>
              <Typography variant="h5">40</Typography>
              <Typography color="secondary">Project</Typography>
            </Stack>
            <Divider orientation="vertical" flexItem />
            <Stack sx={{ gap: 0.5, alignItems: 'center' }}>
              <Typography variant="h5">4.5K</Typography>
              <Typography color="secondary">Members</Typography>
            </Stack>
          </Stack>
        </Grid>
        <Grid size={12}>
          <ProfileTab />
        </Grid>
      </Grid>
    </MainCard>
  );
}
