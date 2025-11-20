import { useState } from 'react';

// material-ui
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// third-party
import { PatternFormat } from 'react-number-format';
import { PDFDownloadLink } from '@react-pdf/renderer';

// project-imports
import AlertCustomerDelete from './AlertCustomerDelete';
import ListCard from './export-pdf/ListCard';

import Avatar from 'components/@extended/Avatar';
import IconButton from 'components/@extended/IconButton';
import { PopupTransition } from 'components/@extended/Transitions';
import MainCard from 'components/MainCard';
import SimpleBar from 'components/third-party/SimpleBar';

// types
import { CustomerList } from 'types/customer';

// assets
import { DocumentDownload, Edit, Trash } from '@wandersonalwes/iconsax-react';

interface Props {
  customer: CustomerList;
  open: boolean;
  onClose: () => void;
  editCustomer: () => void;
}

const avatarImage = '/assets/images/users';

// ==============================|| CUSTOMER - PREVIEW ||============================== //

export default function CustomerPreview({ customer, open, onClose, editCustomer }: Props) {
  const [openAlert, setOpenAlert] = useState(false);

  const handleClose = () => {
    setOpenAlert(!openAlert);
    onClose();
  };

  return (
    <>
      <Dialog
        open={open}
        slots={{ transition: PopupTransition }}
        keepMounted
        onClose={onClose}
        aria-describedby="alert-dialog-slide-description"
        slotProps={{ paper: { sx: { width: 1024, maxWidth: 1, m: { xs: 1.75, sm: 2.5, md: 4 } } } }}
      >
        <Box id="PopupPrint" sx={{ px: { xs: 2, sm: 3, md: 5 }, py: 1 }}>
          <DialogTitle sx={{ px: 0 }}>
            <List sx={{ width: 1, p: 0 }}>
              <ListItem
                disablePadding
                secondaryAction={
                  <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'center' }}>
                    <PDFDownloadLink document={<ListCard customer={customer} />} fileName={`Customer-${customer.name}.pdf`}>
                      <Tooltip title="Export">
                        <IconButton color="secondary">
                          <DocumentDownload />
                        </IconButton>
                      </Tooltip>
                    </PDFDownloadLink>
                    <Tooltip title="Edit">
                      <IconButton color="secondary" onClick={editCustomer}>
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete" onClick={handleClose}>
                      <IconButton color="error">
                        <Trash />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                }
              >
                <ListItemAvatar sx={{ mr: 0.75 }}>
                  <Avatar alt={customer.name} size="lg" src={`${avatarImage}/avatar-${!customer.avatar ? 1 : customer.avatar}.png`} />
                </ListItemAvatar>
                <ListItemText
                  primary={<Typography variant="h5">{customer.name}</Typography>}
                  secondary={<Typography color="secondary">{customer.role}</Typography>}
                />
              </ListItem>
            </List>
          </DialogTitle>
          <DialogContent dividers sx={{ px: 0 }}>
            <SimpleBar sx={{ height: 'calc(100vh - 290px)' }}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 8, xl: 9 }}>
                  <Grid container spacing={2.25}>
                    <Grid size={12}>
                      <MainCard title="About me">
                        <Typography>
                          Hello, Myself {customer.name}, I’m {customer.role} in international company, {customer.about}
                        </Typography>
                      </MainCard>
                    </Grid>
                    <Grid size={12}>
                      <MainCard title="Education">
                        <List sx={{ py: 0 }}>
                          <ListItem divider>
                            <Grid container spacing={{ xs: 0.5, md: 3 }} size={12}>
                              <Grid size={{ xs: 12, md: 6 }}>
                                <Stack sx={{ gap: 0.5 }}>
                                  <Typography color="secondary">Master Degree (Year)</Typography>
                                  <Typography>2014-2017</Typography>
                                </Stack>
                              </Grid>
                              <Grid size={{ xs: 12, md: 6 }}>
                                <Stack sx={{ gap: 0.5 }}>
                                  <Typography color="secondary">Institute</Typography>
                                  <Typography>-</Typography>
                                </Stack>
                              </Grid>
                            </Grid>
                          </ListItem>
                          <ListItem divider>
                            <Grid container spacing={{ xs: 0.5, md: 3 }} size={12}>
                              <Grid size={{ xs: 12, md: 6 }}>
                                <Stack sx={{ gap: 0.5 }}>
                                  <Typography color="secondary">Bachelor (Year)</Typography>
                                  <Typography>2011-2013</Typography>
                                </Stack>
                              </Grid>
                              <Grid size={{ xs: 12, md: 6 }}>
                                <Stack sx={{ gap: 0.5 }}>
                                  <Typography color="secondary">Institute</Typography>
                                  <Typography>Imperial College London</Typography>
                                </Stack>
                              </Grid>
                            </Grid>
                          </ListItem>
                          <ListItem>
                            <Grid container spacing={{ xs: 0.5, md: 3 }} size={12}>
                              <Grid size={{ xs: 12, md: 6 }}>
                                <Stack sx={{ gap: 0.5 }}>
                                  <Typography color="secondary">School (Year)</Typography>
                                  <Typography>2009-2011</Typography>
                                </Stack>
                              </Grid>
                              <Grid size={{ xs: 12, md: 6 }}>
                                <Stack sx={{ gap: 0.5 }}>
                                  <Typography color="secondary">Institute</Typography>
                                  <Typography>School of London, England</Typography>
                                </Stack>
                              </Grid>
                            </Grid>
                          </ListItem>
                        </List>
                      </MainCard>
                    </Grid>
                    <Grid size={12}>
                      <MainCard title="Employment">
                        <List sx={{ py: 0 }}>
                          <ListItem divider>
                            <Grid container spacing={{ xs: 0.5, md: 3 }} size={12}>
                              <Grid size={{ xs: 12, md: 6 }}>
                                <Stack sx={{ gap: 0.5 }}>
                                  <Typography color="secondary">Senior UI/UX designer (Year)</Typography>
                                  <Typography>2019-Current</Typography>
                                </Stack>
                              </Grid>
                              <Grid size={{ xs: 12, md: 6 }}>
                                <Stack sx={{ gap: 0.5 }}>
                                  <Typography color="secondary">Job Responsibility</Typography>
                                  <Typography>
                                    Perform task related to project manager with the 100+ team under my observation. Team management is key
                                    role in this company.
                                  </Typography>
                                </Stack>
                              </Grid>
                            </Grid>
                          </ListItem>
                          <ListItem>
                            <Grid container spacing={{ xs: 0.5, md: 3 }} size={12}>
                              <Grid size={{ xs: 12, md: 6 }}>
                                <Stack sx={{ gap: 0.5 }}>
                                  <Typography color="secondary">Trainee cum Project Manager (Year)</Typography>
                                  <Typography>2017-2019</Typography>
                                </Stack>
                              </Grid>
                              <Grid size={{ xs: 12, md: 6 }}>
                                <Stack sx={{ gap: 0.5 }}>
                                  <Typography color="secondary">Job Responsibility</Typography>
                                  <Typography>Team management is key role in this company.</Typography>
                                </Stack>
                              </Grid>
                            </Grid>
                          </ListItem>
                        </List>
                      </MainCard>
                    </Grid>
                    <Grid size={12}>
                      <MainCard title="Skills">
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', listStyle: 'none', p: 0.5, m: 0 }} component="ul">
                          {customer.skills.map((skill: string, index: number) => (
                            <ListItem disablePadding key={index} sx={{ width: 'auto', pr: 0.75, pb: 0.75 }}>
                              <Chip color="secondary" variant="outlined" size="small" label={skill} />
                            </ListItem>
                          ))}
                        </Box>
                      </MainCard>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid size={{ xs: 12, sm: 4, xl: 3 }}>
                  <MainCard>
                    <Stack sx={{ gap: 2 }}>
                      <Stack sx={{ gap: 0.5 }}>
                        <Typography color="secondary">Father Name</Typography>
                        <Typography>
                          Mr. {customer.firstName} {customer.lastName}
                        </Typography>
                      </Stack>
                      <Stack sx={{ gap: 0.5 }}>
                        <Typography color="secondary">Email</Typography>
                        <Typography>{customer.email}</Typography>
                      </Stack>
                      <Stack sx={{ gap: 0.5 }}>
                        <Typography color="secondary">Contact</Typography>
                        <Typography>
                          <PatternFormat displayType="text" format="+1 (###) ###-####" mask="_" defaultValue={customer.contact} />
                        </Typography>
                      </Stack>
                      <Stack sx={{ gap: 0.5 }}>
                        <Typography color="secondary">Location</Typography>
                        <Typography> {customer.country} </Typography>
                      </Stack>
                      <Stack sx={{ gap: 0.5 }}>
                        <Typography color="secondary">Website</Typography>
                        <Link href="https://google.com" target="_blank" sx={{ textTransform: 'lowercase' }}>
                          https://{customer.firstName}.en
                        </Link>
                      </Stack>
                    </Stack>
                  </MainCard>
                </Grid>
              </Grid>
            </SimpleBar>
          </DialogContent>

          <DialogActions>
            <Button color="error" variant="contained" onClick={onClose}>
              Close
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
      <AlertCustomerDelete id={customer.id!} title={customer.name} open={openAlert} handleClose={handleClose} />
    </>
  );
}
