import { useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import InputLabel from '@mui/material/InputLabel';
import Link from '@mui/material/Link';
import Modal from '@mui/material/Modal';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

// project-imports
import MainCard from 'components/MainCard';
import IconButton from 'components/@extended/IconButton';
import ReactQuillDemo from 'components/third-party/ReactQuill';
import SimpleBar from 'components/third-party/SimpleBar';
import { ThemeMode } from 'config';

// assets
import { AddCircle, AttachSquare, CloseCircle, DocumentUpload, Maximize1 } from '@wandersonalwes/iconsax-react';

// ==============================|| COMPOSE MAIL ||============================== //

export default function ComposeMail() {
  const theme = useTheme();
  const [openModal, setOpenModal] = useState(false);
  const [ccBccValue, setCcBccValue] = useState<boolean>(false);
  const [text, setText] = useState<string>();
  const [position, setPosition] = useState(false);

  const handleCcBccChange = (event: React.MouseEvent<HTMLSpanElement> | undefined) => {
    setCcBccValue((prev) => !prev);
  };

  const handleChange = (value: string) => {
    setText(value);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  return (
    <>
      <Button variant="contained" color="primary" startIcon={<AddCircle />} onClick={() => setOpenModal(true)}>
        Compose Mail
      </Button>
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="modal-add-message-label"
        aria-describedby="modal-add-message-description"
        sx={{ '& .MuiPaper-root:focus': { outline: 'none' } }}
      >
        <MainCard sx={{ p: 0, width: position ? 'calc(100% - 40px)' : { xs: 320, sm: 500 }, overflow: 'auto' }} modal content={false}>
          <DialogTitle>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h5" sx={{ color: 'text.primary' }}>
                New Message
              </Typography>
              <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
                <IconButton color="secondary" onClick={() => setPosition(!position)}>
                  <Maximize1 variant="Bulk" {...(position && { style: { transform: 'rotate(180deg)' } })} />
                </IconButton>
                <IconButton aria-label="close" color="error" onClick={handleCloseModal}>
                  <CloseCircle style={{ width: 18, height: 18 }} />
                </IconButton>
              </Stack>
            </Stack>
          </DialogTitle>
          <Divider />
          <SimpleBar
            sx={{
              overflowX: 'hidden',
              ...(ccBccValue && { height: { xs: 'calc(100vh - 275px)', sm: 'auto' } }),
              ...(position && { height: 'calc(100vh - 205px)' })
            }}
          >
            <DialogContent sx={{ overflow: 'hidden' }}>
              <Stack direction="row" sx={{ justifyContent: 'flex-end' }}>
                <Link
                  href="#"
                  onClick={handleCcBccChange}
                  color={theme.palette.mode === ThemeMode.DARK ? 'primary' : 'secondary'}
                  underline="none"
                >
                  CC & BCC
                </Link>
              </Stack>
              <Stack sx={{ gap: 2.5 }}>
                <Stack sx={{ gap: 1 }}>
                  <InputLabel htmlFor="user-to">To</InputLabel>
                  <TextField fullWidth id="user-to" placeholder="Recipients" autoFocus />
                </Stack>
                <Stack sx={{ gap: 1 }}>
                  <InputLabel htmlFor="subject">Subject</InputLabel>
                  <TextField fullWidth id="subject" placeholder="Subject" />
                </Stack>
                {ccBccValue && (
                  <>
                    <Stack sx={{ gap: 1 }}>
                      <InputLabel htmlFor="cc-mail">Cc</InputLabel>
                      <TextField fullWidth id="cc-mail" placeholder="Enter Cc email" autoFocus />
                    </Stack>
                    <Stack sx={{ gap: 1 }}>
                      <InputLabel htmlFor="bcc-mail">Bcc</InputLabel>
                      <TextField fullWidth id="bcc-mail" placeholder="Enter Bcc email" />
                    </Stack>
                  </>
                )}
                <ReactQuillDemo
                  borderRadius={1}
                  value={text}
                  onChange={handleChange}
                  placeholder="Type your text here..."
                  sx={{
                    ...(position && {
                      height: { xs: 'calc(100vh - 415px)', sm: 'calc(100vh - 440px)' },
                      '.quill': { height: 'calc(100vh - 480px)' }
                    })
                  }}
                />
              </Stack>
            </DialogContent>
          </SimpleBar>
          <Divider />
          <DialogActions sx={{ p: 2 }}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', width: 1 }}>
              <Stack direction="row" sx={{ justifyContent: 'space-between', gap: 1 }}>
                <IconButton color="secondary">
                  <DocumentUpload />
                </IconButton>
                <IconButton color="secondary">
                  <AttachSquare />
                </IconButton>
              </Stack>
              <Button variant="contained" onClick={handleCloseModal}>
                Reply
              </Button>
            </Stack>
          </DialogActions>
        </MainCard>
      </Modal>
    </>
  );
}
