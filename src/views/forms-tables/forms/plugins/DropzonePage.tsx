'use client';

import { useState } from 'react';

// material-ui
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import FormHelperText from '@mui/material/FormHelperText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// third-party
import { Formik } from 'formik';
import * as yup from 'yup';

// project-imports
import IconButton from 'components/@extended/IconButton';
import MainCard from 'components/MainCard';
import UploadAvatar from 'components/third-party/dropzone/Avatar';
import UploadMultiFile from 'components/third-party/dropzone/MultiFile';
import UploadSingleFile from 'components/third-party/dropzone/SingleFile';
import { GRID_COMMON_SPACING } from 'config';

// assets
import { Category, TableDocument } from '@wandersonalwes/iconsax-react';

// ==============================|| PLUGIN - DROPZONE ||============================== //

export default function DropzonePage() {
  const [list, setList] = useState(false);

  return (
    <Grid container spacing={GRID_COMMON_SPACING}>
      <Grid size={12}>
        <MainCard
          title="Upload Multiple File"
          secondary={
            <Stack direction="row" sx={{ gap: 1.25, alignItems: 'center' }}>
              <IconButton color={list ? 'secondary' : 'primary'} size="small" onClick={() => setList(false)}>
                <TableDocument style={{ fontSize: '1.15rem' }} />
              </IconButton>
              <IconButton color={list ? 'primary' : 'secondary'} size="small" onClick={() => setList(true)}>
                <Category style={{ fontSize: '1.15rem' }} />
              </IconButton>
            </Stack>
          }
        >
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
                        showList={list}
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
        </MainCard>
      </Grid>
      <Grid size={12}>
        <MainCard title="Upload Single File">
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
                      <UploadSingleFile setFieldValue={setFieldValue} file={values.files} error={touched.files && !!errors.files} />
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
        </MainCard>
      </Grid>
      <Grid size={12}>
        <MainCard title="Upload Avatar">
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
                    <Stack sx={{ alignItems: 'center' }}>
                      <Stack sx={{ gap: 1.5, alignItems: 'center' }}>
                        <UploadAvatar setFieldValue={setFieldValue} file={values.files} error={touched.files && !!errors.files} />
                        <Stack>
                          <Typography align="center" variant="caption" color="secondary">
                            Allowed &apos;image/*&apos;
                          </Typography>
                          <Typography align="center" variant="caption" color="secondary">
                            *.png, *.jpeg, *.jpg, *.gif
                          </Typography>
                        </Stack>
                      </Stack>
                      {touched.files && errors.files && (
                        <FormHelperText error id="standard-weight-helper-text-password-login">
                          {errors.files as string}
                        </FormHelperText>
                      )}
                    </Stack>
                  </Grid>
                  <Grid size={12}>
                    <Stack direction="row" sx={{ gap: 2, justifyContent: 'flex-end', alignItems: 'center' }}>
                      <Button color="error" onClick={() => setFieldValue('files', null)}>
                        Cancel
                      </Button>
                      <Button type="submit" variant="contained">
                        Submit
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>
              </form>
            )}
          </Formik>
        </MainCard>
      </Grid>
    </Grid>
  );
}
