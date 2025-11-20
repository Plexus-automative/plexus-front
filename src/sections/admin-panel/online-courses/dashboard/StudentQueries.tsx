import { MouseEvent, useState } from 'react';

// material-ui
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';

// project-imports
import MainCard from 'components/MainCard';
import Avatar from 'components/@extended/Avatar';
import IconButton from 'components/@extended/IconButton';
import MoreIcon from 'components/@extended/MoreIcon';

// assets
import { Eye, Trash } from '@wandersonalwes/iconsax-react';
const Avatar1 = '/assets/images/online-panel/avatar-1.jpg';
const Avatar2 = '/assets/images/online-panel/avatar-2.jpg';
const Avatar3 = '/assets/images/online-panel/avatar-3.jpg';
const Avatar4 = '/assets/images/online-panel/avatar-4.jpg';

const studentQueriesData = [
  { image: Avatar1, title: 'Python $ Data Manage' },
  { image: Avatar2, title: 'Website Error' },
  { image: Avatar3, title: 'How to Illustrate' },
  { image: Avatar4, title: 'PHP Learning' }
];

// ==============================|| DASHBOARD - STUDENT QUERIES ||============================== //

export default function StudentQueriesCard() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <MainCard content={false} sx={{ height: 1 }}>
      <Stack direction="row" sx={{ p: 2.5, alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h5">Student Queries</Typography>
        <IconButton
          color="secondary"
          id="student-queries-button"
          aria-controls={open ? 'student-queries-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          onClick={handleClick}
        >
          <MoreIcon />
        </IconButton>
        <Menu
          id="student-queries-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          slotProps={{ list: { 'aria-labelledby': 'student-queries-button', sx: { p: 1.25, minWidth: 150 } } }}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <ListItemButton onClick={handleClose}>Today</ListItemButton>
          <ListItemButton onClick={handleClose}>Weekly</ListItemButton>
          <ListItemButton onClick={handleClose}>Monthly</ListItemButton>
        </Menu>
      </Stack>
      <List disablePadding sx={{ pb: 1 }}>
        {studentQueriesData.map((data, index) => (
          <ListItem
            key={index}
            secondaryAction={
              <Stack direction="row" sx={{ gap: { xs: 0.5, sm: 1 } }}>
                <Tooltip title="View">
                  <IconButton variant="dashed" color="secondary" sx={{ border: 'none' }}>
                    <Eye size={20} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton variant="dashed" color="secondary" sx={{ border: 'none' }}>
                    <Trash size={20} />
                  </IconButton>
                </Tooltip>
              </Stack>
            }
            sx={{ px: 2.5 }}
          >
            <ListItemAvatar sx={{ minWidth: 40 }}>
              <Avatar alt="User Avatar" src={data.image} sx={{ background: 'none' }} />
            </ListItemAvatar>
            <ListItemText sx={{ mx: 1.25 }} primary={<Typography>{data.title}</Typography>} />
          </ListItem>
        ))}
      </List>
    </MainCard>
  );
}
