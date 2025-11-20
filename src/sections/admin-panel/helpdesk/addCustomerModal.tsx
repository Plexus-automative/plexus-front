// material-ui
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import Modal from '@mui/material/Modal';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

// project-imports
import MainCard from 'components/MainCard';

// assets
import { Add, User } from '@wandersonalwes/iconsax-react';

interface Props {
  open: boolean;
  modalToggler: (state: boolean) => void;
}

// ==============================|| ADD CUSTOMER - MODAL ||============================== //

export default function AddCustomerModal({ open, modalToggler }: Props) {
  const closeModal = () => modalToggler(false);
  const textColor = { color: 'text.primary' };

  return (
    <>
      {open && (
        <Modal
          open={open}
          onClose={closeModal}
          aria-labelledby="modal-customer-add-label"
          aria-describedby="modal-customer-add-description"
          sx={{ '& .MuiPaper-root:focus': { outline: 'none' } }}
        >
          <MainCard
            sx={{
              width: `calc(100% - 48px)`,
              minWidth: 340,
              maxWidth: 560,
              height: 'auto',
              maxHeight: 'calc(100vh - 32px)',
              overflow: 'auto'
            }}
            modal
            content={false}
          >
            <DialogTitle>
              <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                <Stack direction="row" sx={{ alignItems: 'center', gap: 1, color: 'primary.main' }}>
                  <User size={20} />
                  <Typography variant="h4" sx={{ color: 'text.primary' }}>
                    Add Customer
                  </Typography>
                </Stack>

                <IconButton aria-label="close" color="secondary" sx={{ p: 0.2 }} onClick={closeModal}>
                  <Add style={{ transform: 'rotate(45deg)', width: 45, height: 45 }} />
                </IconButton>
              </Stack>
            </DialogTitle>
            <Divider />
            <DialogContent dividers>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                We&apos;ll never share your email with anyone else.
              </Typography>
              <Stack sx={{ gap: 2 }}>
                <Stack sx={{ gap: 1 }}>
                  <InputLabel sx={{ ...textColor }}>First Name</InputLabel>
                  <TextField placeholder="Enter first name" fullWidth />
                </Stack>
                <Stack sx={{ gap: 1 }}>
                  <InputLabel sx={{ ...textColor }}>Last Name</InputLabel>
                  <TextField placeholder="Enter last name" fullWidth />
                </Stack>
                <Stack sx={{ gap: 1 }}>
                  <InputLabel sx={{ ...textColor }}>Email</InputLabel>
                  <TextField placeholder="Enter email" type="email" fullWidth />
                </Stack>
                <Stack sx={{ gap: 1 }}>
                  <InputLabel sx={{ ...textColor }}>Password</InputLabel>
                  <TextField placeholder="Enter password" type="password" fullWidth />
                </Stack>
                <Stack sx={{ gap: 1 }}>
                  <InputLabel sx={{ ...textColor }}>Confirm Password</InputLabel>
                  <TextField placeholder="Enter confirm password" type="password" fullWidth />
                </Stack>
              </Stack>
            </DialogContent>
            <DialogActions sx={{ py: 2, px: 2.5 }}>
              <Button onClick={closeModal} variant="contained" color="error">
                Close
              </Button>
              <Button onClick={closeModal} variant="contained">
                Save changes
              </Button>
            </DialogActions>
          </MainCard>
        </Modal>
      )}
    </>
  );
}
