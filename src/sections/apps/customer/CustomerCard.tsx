import { useState } from 'react';

// material-ui
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Fade from '@mui/material/Fade';
import Grid from '@mui/material/Grid';
import Menu from '@mui/material/Menu';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// third-party
import { PatternFormat } from 'react-number-format';
import { PDFDownloadLink } from '@react-pdf/renderer';

// project-imports
import AlertCustomerDelete from './AlertCustomerDelete';
import CustomerModal from './CustomerModal';
import CustomerPreview from './CustomerPreview';
import ListSmallCard from './export-pdf/ListSmallCard';
import Avatar from 'components/@extended/Avatar';
import IconButton from 'components/@extended/IconButton';
import MoreIcon from 'components/@extended/MoreIcon';
import MainCard from 'components/MainCard';

// assets
import { CallCalling, Link2, Location, Sms } from '@wandersonalwes/iconsax-react';
const avatarImage = '/assets/images/users';

// types
import { CustomerList } from 'types/customer';

// ==============================|| CUSTOMER - CARD ||============================== //

export default function CustomerCard({ customer }: { customer: CustomerList }) {
  const [open, setOpen] = useState(false);
  const [customerModal, setCustomerModal] = useState<boolean>(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerList | null>(null);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const [openAlert, setOpenAlert] = useState(false);

  const handleAlertClose = () => {
    setOpenAlert(!openAlert);
    handleMenuClose();
  };

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const editCustomer = () => {
    setSelectedCustomer(customer);
    setCustomerModal(true);
  };

  return (
    <>
      <MainCard sx={{ height: 1, '.MuiCardContent-root': { height: 1, display: 'flex', flexDirection: 'column' } }}>
        <Grid id="print" container spacing={2.25}>
          <Grid size={12}>
            <List sx={{ width: 1, p: 0 }}>
              <ListItem
                disablePadding
                secondaryAction={
                  <IconButton
                    edge="end"
                    aria-label="comments"
                    color="secondary"
                    onClick={handleMenuClick}
                    sx={{ transform: 'rotate(90deg)' }}
                  >
                    <MoreIcon />
                  </IconButton>
                }
              >
                <ListItemAvatar>
                  <Avatar alt={customer.name} src={`${avatarImage}/avatar-${!customer.avatar ? 1 : customer.avatar}.png`} />
                </ListItemAvatar>
                <ListItemText
                  primary={<Typography variant="subtitle1">{customer.name}</Typography>}
                  secondary={<Typography sx={{ color: 'text.secondary' }}>{customer.role}</Typography>}
                />
              </ListItem>
            </List>
            <Menu
              id="fade-menu"
              slotProps={{ list: { 'aria-labelledby': 'fade-button' } }}
              anchorEl={anchorEl}
              open={openMenu}
              onClose={handleMenuClose}
              slots={{ transition: Fade }}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <MenuItem sx={{ a: { textDecoration: 'none', color: 'inherit' } }}>
                <PDFDownloadLink document={<ListSmallCard customer={customer} />} fileName={`Customer-${customer.name}.pdf`}>
                  Export PDF
                </PDFDownloadLink>
              </MenuItem>
              <MenuItem onClick={editCustomer}>Edit</MenuItem>
              <MenuItem onClick={handleAlertClose}>Delete</MenuItem>
            </Menu>
          </Grid>
          <Grid size={12}>
            <Divider />
          </Grid>
          <Grid size={12}>
            <Typography>Hello, {customer.about}</Typography>
          </Grid>
          <Grid size={12}>
            <Grid container spacing={1} direction={{ xs: 'column', md: 'row' }}>
              <Grid size={6}>
                <List
                  sx={{
                    p: 0,
                    overflow: 'hidden',
                    '& .MuiListItem-root': { px: 0, py: 0.5 },
                    '& .MuiListItemIcon-root': { minWidth: 28 }
                  }}
                >
                  <ListItem alignItems="flex-start">
                    <ListItemIcon>
                      <Sms size={18} />
                    </ListItemIcon>
                    <ListItemText primary={<Typography sx={{ color: 'text.secondary' }}>{customer.email}</Typography>} />
                  </ListItem>
                  <ListItem alignItems="flex-start">
                    <ListItemIcon>
                      <CallCalling size={18} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography sx={{ color: 'text.secondary' }}>
                          <PatternFormat displayType="text" format="+1 (###) ###-####" mask="_" defaultValue={customer.contact} />
                        </Typography>
                      }
                    />
                  </ListItem>
                </List>
              </Grid>
              <Grid size={6}>
                <List
                  sx={{ p: 0, overflow: 'hidden', '& .MuiListItem-root': { px: 0, py: 0.5 }, '& .MuiListItemIcon-root': { minWidth: 28 } }}
                >
                  <ListItem alignItems="flex-start">
                    <ListItemIcon>
                      <Location size={18} />
                    </ListItemIcon>
                    <ListItemText primary={<Typography sx={{ color: 'text.secondary' }}>{customer.country}</Typography>} />
                  </ListItem>
                  <ListItem alignItems="flex-start">
                    <ListItemIcon>
                      <Link2 size={18} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Link href="https://google.com" target="_blank" sx={{ textTransform: 'lowercase' }}>
                          https://{customer.firstName}.en
                        </Link>
                      }
                    />
                  </ListItem>
                </List>
              </Grid>
            </Grid>
          </Grid>
          <Grid size={12}>
            <Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', listStyle: 'none', p: 0.5, m: 0 }} component="ul">
                {customer.skills.map((skill: string, index: number) => (
                  <ListItem disablePadding key={index} sx={{ width: 'auto', pr: 0.75, pb: 0.75 }}>
                    <Chip color="secondary" variant="outlined" size="small" label={skill} sx={{ color: 'text.secondary' }} />
                  </ListItem>
                ))}
              </Box>
            </Box>
          </Grid>
        </Grid>
        <Stack
          direction="row"
          className="hideforPDf"
          sx={{ gap: 1, alignItems: 'center', justifyContent: 'space-between', mt: 'auto', mb: 0, pt: 2.25 }}
        >
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Updated in {customer.time}
          </Typography>
          <Button variant="outlined" size="small" onClick={handleClickOpen}>
            Preview
          </Button>
        </Stack>
      </MainCard>
      <CustomerPreview customer={customer} open={open} onClose={handleClose} editCustomer={editCustomer} />
      <AlertCustomerDelete id={customer.id!} title={customer.name} open={openAlert} handleClose={handleAlertClose} />
      <CustomerModal open={customerModal} modalToggler={setCustomerModal} customer={selectedCustomer} />
    </>
  );
}
