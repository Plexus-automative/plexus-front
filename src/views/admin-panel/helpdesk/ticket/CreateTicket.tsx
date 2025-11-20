'use client';

import { useState } from 'react';

// material-ui
import Button from '@mui/material/Button';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

// third-party
import { Formik } from 'formik';
import * as yup from 'yup';

// project-imports
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import MainCard from 'components/MainCard';
import ReactQuillDemo from 'components/third-party/ReactQuill';
import UploadMultiFile from 'components/third-party/dropzone/MultiFile';
import { APP_DEFAULT_PATH } from 'config';

// customer names
const names = [
  'Oliver Hansen',
  'Van Henry',
  'April Tucker',
  'Ralph Hubbard',
  'Omar Alexander',
  'Carlos Abbott',
  'Miriam Wagner',
  'Bradley Wilkerson',
  'Virginia Andrews',
  'Kelly Snyder'
];

// ==============================|| HELPDESK - CREATE TICKET ||============================== //

export default function CreateTicket() {
  const [personName, setPersonName] = useState('');
  const [category, setCategory] = useState('');
  const [text, setText] = useState('');

  const handleChange = (value: string) => {
    setText(value);
  };

  const handleNameChange = (event: SelectChangeEvent) => {
    setPersonName(event.target.value as string);
  };

  const handleChangeCategory = (event: SelectChangeEvent) => {
    setCategory(event.target.value as string);
  };

  const breadcrumbLinks = [
    { title: 'home', to: APP_DEFAULT_PATH },
    { title: 'helpdesk', to: '/admin-panel/helpdesk/dashboard' },
    { title: 'create ticket' }
  ];

  return (
    <>
      <Breadcrumbs custom heading="create ticket" links={breadcrumbLinks} />
      <MainCard>
        <Grid container rowSpacing={2} columnSpacing={2.5}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel>Customer</InputLabel>
              <Select
                labelId="demo-multiple-name-label"
                id="demo-multiple-name"
                value={personName}
                displayEmpty
                onChange={handleNameChange}
                input={<OutlinedInput />}
              >
                <MenuItem disabled defaultChecked value="" sx={{ color: 'text.secondary' }}>
                  Default select
                </MenuItem>
                {names.map((name) => (
                  <MenuItem key={name} value={name}>
                    {name}
                  </MenuItem>
                ))}
              </Select>
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel>Category</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                displayEmpty
                id="demo-simple-select"
                value={category}
                input={<OutlinedInput />}
                onChange={handleChangeCategory}
                slotProps={{ input: { placeholder: 'Age' } }}
              >
                <MenuItem disabled value="" sx={{ color: 'text.secondary' }}>
                  Default select
                </MenuItem>
                <MenuItem value={1}>Bug</MenuItem>
                <MenuItem value={2}>Modify</MenuItem>
                <MenuItem value={3}>Suggestions</MenuItem>
              </Select>
            </Stack>
          </Grid>
          <Grid size={12}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel>Subject</InputLabel>
              <TextField fullWidth id="outlined-basic" placeholder="Enter Subject" />
            </Stack>
          </Grid>

          <Grid size={12}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel>Description</InputLabel>
              <ReactQuillDemo value={text} onChange={handleChange} placeholder="Write your description" />
            </Stack>
          </Grid>
          <Grid size={12}>
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
                        <UploadMultiFile setFieldValue={setFieldValue} files={values.files} error={touched.files && !!errors.files} />
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
          </Grid>
        </Grid>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'flex-end', gap: 1, mt: 2.5 }}>
          <Button color="secondary" variant="outlined">
            Clear
          </Button>
          <Button variant="contained">Submit</Button>
        </Stack>
      </MainCard>
    </>
  );
}
