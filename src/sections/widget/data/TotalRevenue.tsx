'use client';

// material-ui
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project-imports
import MainCard from 'components/MainCard';
import SimpleBar from 'components/third-party/SimpleBar';

// assets
import { ArrowDown2, ArrowUp2 } from '@wandersonalwes/iconsax-react';

// ===========================|| DATA WIDGET - TOTAL REVENUE ||=========================== //

export default function TotalRevenue() {
  return (
    <MainCard title="Total Revenue" content={false}>
      <SimpleBar sx={{ height: 334 }}>
        <List
          disablePadding
          component="nav"
          aria-label="main mailbox folders"
          sx={{
            '& .MuiListItemButton-root': { borderRadius: 0, my: 0, py: 1.5 },
            '& .MuiListItemText-root': { color: 'text.primary' },
            '& svg': { mr: { xs: 1, sm: 4, md: 8, lg: 12 } }
          }}
        >
          <ListItemButton>
            <ListItemIcon sx={{ color: 'success.main' }}>
              <ArrowUp2 variant="Bold" size={20} />
            </ListItemIcon>
            <ListItemText
              primary={
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Bitcoin</span>
                  <Typography variant="subtitle1" sx={{ color: 'success.main' }}>
                    + $145.85
                  </Typography>
                </Stack>
              }
            />
          </ListItemButton>
          <Divider />
          <ListItemButton>
            <ListItemIcon sx={{ color: 'error.main' }}>
              <ArrowDown2 variant="Bold" size={20} />
            </ListItemIcon>
            <ListItemText
              primary={
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Ethereum</span>
                  <Typography variant="subtitle1" sx={{ color: 'error.main' }}>
                    - $6.368
                  </Typography>
                </Stack>
              }
            />
          </ListItemButton>
          <Divider />
          <ListItemButton>
            <ListItemIcon sx={{ color: 'success.main' }}>
              <ArrowUp2 variant="Bold" size={20} />
            </ListItemIcon>
            <ListItemText
              primary={
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Ripple</span>
                  <Typography variant="subtitle1" sx={{ color: 'success.main' }}>
                    + $458.63
                  </Typography>
                </Stack>
              }
            />
          </ListItemButton>
          <Divider />
          <ListItemButton>
            <ListItemIcon sx={{ color: 'error.main' }}>
              <ArrowDown2 variant="Bold" size={20} />
            </ListItemIcon>
            <ListItemText
              primary={
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Neo</span>
                  <Typography variant="subtitle1" sx={{ color: 'error.main' }}>
                    - $5.631
                  </Typography>
                </Stack>
              }
            />
          </ListItemButton>
          <Divider />
          <ListItemButton>
            <ListItemIcon sx={{ color: 'error.main' }}>
              <ArrowDown2 variant="Bold" size={20} />
            </ListItemIcon>
            <ListItemText
              primary={
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Ethereum</span>
                  <Typography variant="subtitle1" sx={{ color: 'error.main' }}>
                    - $6.368
                  </Typography>
                </Stack>
              }
            />
          </ListItemButton>
          <Divider />
          <ListItemButton>
            <ListItemIcon sx={{ color: 'success.main' }}>
              <ArrowUp2 variant="Bold" size={20} />
            </ListItemIcon>
            <ListItemText
              primary={
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Ripple</span>
                  <Typography variant="subtitle1" sx={{ color: 'success.main' }}>
                    + $458.63
                  </Typography>
                </Stack>
              }
            />
          </ListItemButton>
          <Divider />
          <ListItemButton>
            <ListItemIcon sx={{ color: 'error.main' }}>
              <ArrowDown2 variant="Bold" size={20} />
            </ListItemIcon>
            <ListItemText
              primary={
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Neo</span>
                  <Typography variant="subtitle1" sx={{ color: 'error.main' }}>
                    - $5.631
                  </Typography>
                </Stack>
              }
            />
          </ListItemButton>
          <Divider />
          <ListItemButton>
            <ListItemIcon sx={{ color: 'error.main' }}>
              <ArrowDown2 variant="Bold" size={20} />
            </ListItemIcon>
            <ListItemText
              primary={
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Ethereum</span>
                  <Typography variant="subtitle1" sx={{ color: 'error.main' }}>
                    - $6.368
                  </Typography>
                </Stack>
              }
            />
          </ListItemButton>
          <Divider />
          <ListItemButton>
            <ListItemIcon sx={{ color: 'success.main' }}>
              <ArrowUp2 variant="Bold" size={20} />
            </ListItemIcon>
            <ListItemText
              primary={
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Ripple</span>
                  <Typography variant="subtitle1" sx={{ color: 'success.main' }}>
                    + $458.63
                  </Typography>
                </Stack>
              }
            />
          </ListItemButton>
          <Divider />
          <ListItemButton>
            <ListItemIcon sx={{ color: 'error.main' }}>
              <ArrowDown2 variant="Bold" size={20} />
            </ListItemIcon>
            <ListItemText
              primary={
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Neo</span>
                  <Typography variant="subtitle1" sx={{ color: 'error.main' }}>
                    - $5.631
                  </Typography>
                </Stack>
              }
            />
          </ListItemButton>
        </List>
      </SimpleBar>
    </MainCard>
  );
}
