import { useState } from 'react';

// material-ui
import Button from '@mui/material/Button';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';

// third-party
import { Formik } from 'formik';
import * as yup from 'yup';
import copy from 'copy-to-clipboard';

// project-imports
import MainCard from 'components/MainCard';
import UploadMultiFile from 'components/third-party/dropzone/MultiFile';

// assets
import { Add } from '@wandersonalwes/iconsax-react';

interface UploadFileProps {
  openUpload: boolean;
  setOpenUpload: (open: boolean) => void;
}

// ==============================|| FILE MANAGER - UPLOAD FILE ||============================== //

export default function UploadFile({ openUpload, setOpenUpload }: UploadFileProps) {
  const [link, setLink] = useState('https://www.figma.com/file/');

  const handleCopy = () => {
    copy(link);
  };

  return (
    <Modal
      open={openUpload}
      onClose={() => setOpenUpload(false)}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <MainCard
        sx={{
          width: `calc(100% - 48px)`,
          minWidth: 300,
          maxWidth: 500,
          height: 'auto',
          maxHeight: 'calc(100vh - 32px)',
          overflow: 'auto'
        }}
        modal
        content={false}
      >
        <DialogTitle>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
              Upload Files
            </Typography>
            <IconButton aria-label="close" color="secondary" sx={{ p: 0.2 }} onClick={() => setOpenUpload(false)}>
              <Add style={{ transform: 'rotate(45deg)', width: 45, height: 45 }} />
            </IconButton>
          </Stack>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Stack sx={{ gap: 2 }}>
            <Formik
              initialValues={{ files: null }}
              onSubmit={() => {
                // submit form
              }}
              validationSchema={yup.object().shape({
                files: yup.mixed().required('Avatar is a required.')
              })}
            >
              {({ values, handleSubmit, setFieldValue, touched, errors }) => (
                <form onSubmit={handleSubmit}>
                  <Grid container spacing={3}>
                    <Grid size={12}>
                      <Stack sx={{ gap: 1.5, alignItems: 'center' }}>
                        <UploadMultiFile
                          sx={{ '.MuiCardMedia-root': { width: { md: 317 } } }}
                          setFieldValue={setFieldValue}
                          files={values.files}
                          error={touched.files && !!errors.files}
                        />
                      </Stack>
                      {touched.files && errors.files && (
                        <FormHelperText error id="standard-weight-helper-text-password-login">
                          {errors.files as string}
                        </FormHelperText>
                      )}
                    </Grid>
                  </Grid>
                </form>
              )}
            </Formik>
            <TextField
              fullWidth
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="Enter URL"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start" onClick={handleCopy}>
                      <Button color="secondary" size="small">
                        Copy Link
                      </Button>
                      <Divider orientation="vertical" sx={{ ml: 1.25, height: 25 }} />
                    </InputAdornment>
                  )
                }
              }}
            />
          </Stack>
        </DialogContent>
        <Divider />
        <Stack direction="row" sx={{ gap: 1, justifyContent: 'flex-end', px: 2.5, py: 2 }}>
          <Button variant="contained" color="secondary" onClick={() => setOpenUpload(false)}>
            Cancel
          </Button>
          <Button type="submit" variant="contained">
            Add Files
          </Button>
        </Stack>
      </MainCard>
    </Modal>
  );
}
