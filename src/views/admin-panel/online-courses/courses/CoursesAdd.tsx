'use client';

import { useCallback, useEffect, useState } from 'react';

// material-ui
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import CardMedia from '@mui/material/CardMedia';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Box from '@mui/material/Box';

import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// third-party
import { useDropzone } from 'react-dropzone';

// project-imports
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import MainCard from 'components/MainCard';
import { APP_DEFAULT_PATH } from 'config';

// assets
import { DocumentUpload, Trash } from '@wandersonalwes/iconsax-react';

const DropzoneContainer = styled(Box)(({ theme }) => ({
  border: '2px dashed',
  borderColor: theme.palette.secondary[500],
  height: 120,
  borderRadius: '8px',
  padding: '20px',
  display: 'flex',
  gap: 8,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette.background.default,
  color: theme.palette.text.secondary,
  cursor: 'pointer',
  '&:hover': { color: theme.palette.primary.main }
}));

// ==============================|| COURSE - ADD ||============================== //

export default function CoursesAddPage() {
  const [status, setStatus] = useState('Deactive');

  const handleChange = (event: SelectChangeEvent) => {
    setStatus(event.target.value);
  };

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setUploadedFile(file);
      setPreview(URL.createObjectURL(file)); // Create preview URL
    }
  }, []);

  useEffect(() => {
    // Cleanup preview URL when component unmounts or file changes
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'image/*': [] }
  });

  const onRemove = () => {
    setPreview(null);
  };

  const breadcrumbLinks = [{ title: 'home', to: APP_DEFAULT_PATH }, { title: 'online-courses' }, { title: 'courses' }, { title: 'add' }];
  return (
    <>
      <Breadcrumbs custom heading="add" links={breadcrumbLinks} />
      <MainCard title="Add Course" contentSX={{ p: 2.5 }}>
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="course-name">Course Name</InputLabel>
              <TextField fullWidth id="course-name" placeholder="Enter course name" autoFocus />
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="course-code">Course Code</InputLabel>
              <TextField fullWidth id="course-code" placeholder="Enter course code" />
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel>Start From</InputLabel>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker />
              </LocalizationProvider>
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="course-duration">Course Duration</InputLabel>
              <TextField fullWidth id="course-duration" placeholder="Enter course duration" />
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="course-price">Course Price</InputLabel>
              <TextField fullWidth id="course-price" placeholder="Enter course price" type="number" />
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="teacher-name">Teacher Name</InputLabel>
              <TextField fullWidth id="teacher-name" placeholder="Enter teacher name" />
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="max-student">Maximum Students</InputLabel>
              <TextField fullWidth id="max-student" placeholder="Enter maximum students" type="number" />
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel>Course Status</InputLabel>
              <Select value={status} onChange={handleChange}>
                <MenuItem value="Deactive">Deactive</MenuItem>
                <MenuItem value="Active">Active</MenuItem>
              </Select>
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="course-details">Course Details</InputLabel>
              <TextField fullWidth id="course-details" placeholder="Enter course details" multiline rows={3} />
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <DropzoneContainer {...getRootProps()} sx={{ justifyContent: preview ? 'space-between' : 'center' }}>
              {preview ? (
                <CardMedia
                  component="img"
                  alt={uploadedFile?.name}
                  src={preview}
                  sx={{ borderRadius: 8, width: 80, height: 80, objectFit: 'cover' }}
                />
              ) : (
                <>
                  <input {...getInputProps()} />
                  <DocumentUpload fontSize="large" />
                  <Typography variant="body1">Choose Photo</Typography>
                </>
              )}
              {preview && preview.length > 0 && (
                <Stack direction="row" sx={{ position: 'relative', top: -36 }}>
                  <IconButton color="error" onClick={onRemove}>
                    <Trash size={20} />
                  </IconButton>
                </Stack>
              )}
            </DropzoneContainer>
          </Grid>
          <Grid size={12} sx={{ textAlign: 'end' }}>
            <Button variant="contained">Create Course</Button>
          </Grid>
        </Grid>
      </MainCard>
    </>
  );
}
