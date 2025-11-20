import { useState } from 'react';

// material-ui
import Button from '@mui/material/Button';
import CardMedia from '@mui/material/CardMedia';
import Divider from '@mui/material/Divider';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Modal from '@mui/material/Modal';
import Stack from '@mui/material/Stack';

// third-party
import ReactQuillDemo from 'components/third-party/ReactQuill';

// project-imports
import MainCard from 'components/MainCard';

// assets
const ImgUser = '/assets/images/online-panel/img-add-user.png';

interface Props {
  open: boolean;
  modalToggler: (state: boolean) => void;
}

// ==============================|| ADD BIO - MODAL ||============================== //

export default function AddBio({ open, modalToggler }: Props) {
  const [text, setText] = useState('');

  const handleChange = (value: string) => {
    setText(value);
  };

  const closeModal = () => modalToggler(false);

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
            <DialogTitle>Profile update</DialogTitle>
            <Divider />
            <DialogContent>
              <Stack sx={{ gap: 2.5, alignItems: 'center' }}>
                <CardMedia component="img" sx={{ width: 100, height: 100 }} src={ImgUser} alt="User" />
                <Button color="secondary" variant="outlined">
                  Add Image
                </Button>
                <ReactQuillDemo value={text} onChange={handleChange} placeholder="Write your bio" sx={{ width: 1 }} />
                <Button variant="contained" onClick={closeModal}>
                  Add Bio
                </Button>
              </Stack>
            </DialogContent>
          </MainCard>
        </Modal>
      )}
    </>
  );
}
