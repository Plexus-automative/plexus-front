// material-ui
import Button from '@mui/material/Button';
import DialogContent from '@mui/material/DialogContent';
import Dialog from '@mui/material/Dialog';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project-imports
import Avatar from 'components/@extended/Avatar';
import { PopupTransition } from 'components/@extended/Transitions';
import { deleteCustomer } from 'api/customer';
import { openSnackbar } from 'api/snackbar';

// assets
import { Trash } from '@wandersonalwes/iconsax-react';

// types
import { SnackbarProps } from 'types/snackbar';

interface Props {
  id: number;
  open: boolean;
  handleClose: () => void;
}

// ==============================|| MEMBERSHIP - DELETE ||============================== //

export default function AlertMembershipDelete({ id, open, handleClose }: Props) {
  const deletehandler = async () => {
    await deleteCustomer(id).then(() => {
      openSnackbar({
        open: true,
        message: 'Membership deleted successfully',
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
        variant: 'alert',
        alert: {
          color: 'success'
        }
      } as SnackbarProps);
      handleClose();
    });
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      keepMounted
      slots={{ transition: PopupTransition }}
      maxWidth="xs"
      aria-labelledby="column-delete-title"
      aria-describedby="column-delete-description"
    >
      <DialogContent sx={{ mt: 2, my: 1 }}>
        <Stack sx={{ gap: 3.5, alignItems: 'center' }}>
          <Avatar color="error" sx={{ width: 72, height: 72, fontSize: '1.75rem' }}>
            <Trash variant="Bold" />
          </Avatar>
          <Typography variant="h4" align="center">
            Are you sure you want to delete?
          </Typography>
          <Stack direction="row" sx={{ gap: 2, width: 1 }}>
            <Button fullWidth onClick={handleClose} color="secondary" variant="outlined">
              Cancel
            </Button>
            <Button fullWidth color="error" variant="contained" onClick={deletehandler} autoFocus>
              Delete
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
