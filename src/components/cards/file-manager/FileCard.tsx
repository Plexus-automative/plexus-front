import { MouseEvent, useState } from 'react';

// material-ui
import { alpha } from '@mui/material/styles';
import AvatarGroup from '@mui/material/AvatarGroup';
import CardMedia from '@mui/material/CardMedia';
import IconButton from '@mui/material/IconButton';
import ListItemButton from '@mui/material/ListItemButton';
import Menu from '@mui/material/Menu';
import Radio from '@mui/material/Radio';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project-imports
import MoreIcon from 'components/@extended/MoreIcon';
import Avatar from 'components/@extended/Avatar';
import MainCard from 'components/MainCard';
import { ThemeMode } from 'config';

// types
import { FileItem } from 'types/file-manager';

// assets
import { UserAdd } from '@wandersonalwes/iconsax-react';

interface FileCardProps extends FileItem {
  selected: boolean;
  onSelect: () => void;
  openDrawer: boolean;
  setOpenModal: (open: boolean) => void;
  setOpenDrawer: (open: boolean) => void;
}

// ==============================|| FILE MANAGER - CARD VIEW ||============================== //

export default function CardView({
  name,
  category,
  date,
  img,
  users,
  selected,
  onSelect,
  openDrawer,
  setOpenModal,
  setOpenDrawer
}: FileCardProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setAnchorEl(null);
  };

  return (
    <MainCard
      sx={(theme) => ({
        cursor: 'pointer',
        '&:hover': { boxShadow: theme.customShadows.z1 },
        ...(selected && {
          boxShadow: `0 0 0 1px ${theme.palette.primary.main}, 0px 8px 24px ${alpha(theme.palette.primary.lighter, 0.4)}`,
          borderColor: 'primary.main',
          bgcolor: theme.palette.mode === ThemeMode.DARK ? theme.palette.background.default : alpha(theme.palette.primary.lighter, 0.4)
        })
      })}
    >
      <Stack
        gap={2}
        onClick={() => {
          setOpenDrawer(!openDrawer);
          onSelect();
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Radio checked={selected} onChange={onSelect} value={name} name="file-radio-group" sx={{ p: 0 }} />
          <IconButton
            color="secondary"
            id="wallet-button"
            onClick={handleClick}
            aria-controls={open ? 'wallet-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
          >
            <MoreIcon />
          </IconButton>
          <Menu
            id="recent-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            slotProps={{
              list: { 'aria-labelledby': 'recent-menu', sx: { p: 1.25, minWidth: 150 } }
            }}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <ListItemButton onClick={(e) => handleClose(e)}>Edit</ListItemButton>
            <ListItemButton onClick={(e) => handleClose(e)}>Delete</ListItemButton>
          </Menu>
        </Stack>

        <Stack direction="row" justifyContent="center" alignItems="center">
          <CardMedia
            component="img"
            src={img}
            sx={{
              height: 1,
              width: 'auto',
              ...(category === 'Gallery' && { borderRadius: 1 })
            }}
          />
        </Stack>

        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack>
            <Typography variant="subtitle1">{name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {date}
            </Typography>
          </Stack>
          {users ? (
            <Box sx={{ width: 80 }}>
              <AvatarGroup
                max={4}
                sx={{ cursor: 'pointer', '.MuiAvatarGroup-avatar': { width: 24, height: 24, fontSize: '0.75rem' } }}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenDrawer(false);
                  setOpenModal(true);
                }}
              >
                {users?.map((avatar, index) => (
                  <Avatar size="xs" key={index} alt={`User ${index + 1}`} src={avatar} />
                ))}
              </AvatarGroup>
            </Box>
          ) : (
            <IconButton
              color="secondary"
              size="large"
              onClick={(e) => {
                e.stopPropagation();
                setOpenDrawer(false);
                setOpenModal(true);
              }}
            >
              <UserAdd variant="Bulk" />
            </IconButton>
          )}
        </Stack>
      </Stack>
    </MainCard>
  );
}
