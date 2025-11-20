'use client';

import { useRef, useState } from 'react';

// material-ui
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import Link from '@mui/material/Link';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// third-party
import { useFormik } from 'formik';
import * as yup from 'yup';

// project-imports
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import IconButton from 'components/@extended/IconButton';
import MainCard from 'components/MainCard';

import { openSnackbar } from 'api/snackbar';
import { APP_DEFAULT_PATH, GRID_COMMON_SPACING } from 'config';
import { membershipPlans } from 'data/membership';

// types
import { SnackbarProps } from 'types/snackbar';

// assets
import { ArrowRight2, Edit, Eye, EyeSlash, GalleryAdd, Save2 } from '@wandersonalwes/iconsax-react';

const validationSchema = yup.object({
  email: yup.string().email('Enter a valid email').required('Email is required'),
  newPassword: yup.string().min(8, 'Password should be of minimum 8 characters length').required('New password is required'),
  currentPassword: yup.string().min(8, 'Password should be of minimum 8 characters length').required('Current password is required')
});

// ==============================|| MEMBERSHIP - SETTING ||============================== //

export default function MembershipSetting() {
  const textFieldRef = useRef<HTMLInputElement>(null);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handleClickShowCurrentPassword = () => setShowCurrentPassword((show) => !show);
  const handleClickShowNewPassword = () => setShowNewPassword((show) => !show);

  const breadcrumbLinks = [
    { title: 'home', to: APP_DEFAULT_PATH },
    { title: 'membership', to: '/admin-panel/membership/setting' },
    { title: 'setting' }
  ];

  const handleEditClick = () => {
    if (textFieldRef.current) {
      textFieldRef.current.focus();
    }
  };

  const formik = useFormik({
    initialValues: { email: '', newPassword: '', currentPassword: '' },
    validationSchema,
    onSubmit: () => {
      openSnackbar({
        open: true,
        message: 'Password Saved!',
        variant: 'alert',
        alert: { color: 'success' }
      } as SnackbarProps);
    }
  });

  return (
    <>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Breadcrumbs custom heading="setting" links={breadcrumbLinks} />
        <IconButton size="large" shape="rounded" sx={{ color: 'secondary.500' }}>
          <Save2 />
        </IconButton>
      </Stack>
      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={GRID_COMMON_SPACING}>
          <Grid size={12}>
            <MainCard
              title={
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  sx={{ gap: 2.5, py: 1.25, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' } }}
                >
                  <Stack direction="row" sx={{ gap: 2.5, alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: 'secondary.200', width: 84, height: 84, color: 'inherit' }}>
                      <GalleryAdd />
                    </Avatar>
                    <Stack>
                      <Typography variant="subtitle1">Airi Satou</Typography>
                      <Typography variant="subtitle1">Maiduguri, Borno State</Typography>
                    </Stack>
                  </Stack>
                  <Button variant="outlined" startIcon={<Edit />} color="secondary">
                    Edit
                  </Button>
                </Stack>
              }
              content={false}
            >
              <Grid container spacing={2.5} sx={{ p: 2.5 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <MainCard sx={{ height: 1, p: 2.5 }} content={false}>
                    <Stack sx={{ gap: 2.5 }}>
                      <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                        <Typography variant="h5">Email Address</Typography>
                        <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                          <Button variant="outlined" onClick={handleEditClick} startIcon={<Edit />} color="secondary" size="small">
                            Edit
                          </Button>
                        </Box>
                      </Stack>
                      <Stack sx={{ gap: 0.75 }}>
                        <InputLabel>Your Email address is</InputLabel>
                        <TextField
                          fullWidth
                          placeholder="emails@private.com"
                          id="email"
                          name="email"
                          value={formik.values.email}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          error={formik.touched.email && Boolean(formik.errors.email)}
                          helperText={formik.touched.email && formik.errors.email}
                          inputRef={textFieldRef}
                        />
                      </Stack>
                    </Stack>
                  </MainCard>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <MainCard sx={{ minHeight: 256, p: 2.5 }} content={false}>
                    <Stack sx={{ gap: 2.5, alignItems: 'flex-start' }}>
                      <Typography variant="h5">Password</Typography>
                      <Stack sx={{ gap: 2.5 }} direction={{ xs: 'column', sm: 'row' }}>
                        <Stack sx={{ gap: 0.75 }}>
                          <InputLabel>New Password</InputLabel>
                          <OutlinedInput
                            fullWidth
                            endAdornment={
                              <InputAdornment position="end">
                                <IconButton size="small" onClick={handleClickShowNewPassword}>
                                  {showNewPassword ? <Eye size={14} /> : <EyeSlash size={14} />}
                                </IconButton>
                              </InputAdornment>
                            }
                            type={showNewPassword ? 'text' : 'password'}
                            id="newPassword"
                            name="newPassword"
                            placeholder="Enter new password"
                            value={formik.values.newPassword}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.newPassword && Boolean(formik.errors.newPassword)}
                          />
                          {formik.touched.newPassword && formik.errors.newPassword && (
                            <FormHelperText error={true}>{formik.errors.newPassword}</FormHelperText>
                          )}
                        </Stack>
                        <Stack sx={{ gap: 0.75 }}>
                          <InputLabel>Current Password</InputLabel>
                          <OutlinedInput
                            fullWidth
                            endAdornment={
                              <InputAdornment position="end">
                                <IconButton size="small" onClick={handleClickShowCurrentPassword}>
                                  {showCurrentPassword ? <Eye size={14} /> : <EyeSlash size={14} />}
                                </IconButton>
                              </InputAdornment>
                            }
                            type={showCurrentPassword ? 'text' : 'password'}
                            id="currentPassword"
                            name="currentPassword"
                            placeholder="Enter current password"
                            value={formik.values.currentPassword}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.currentPassword && Boolean(formik.errors.currentPassword)}
                          />
                          {formik.touched.currentPassword && formik.errors.currentPassword && (
                            <FormHelperText error={true}>{formik.errors.currentPassword}</FormHelperText>
                          )}
                        </Stack>
                      </Stack>
                      <Typography component="div" variant="body1">
                        Can’t Remember your current password? <Link href="#">Reset your password</Link>
                      </Typography>
                      <Button variant="contained" type="submit">
                        Save Password
                      </Button>
                    </Stack>
                  </MainCard>
                </Grid>
              </Grid>
            </MainCard>
          </Grid>
          {membershipPlans.map((plan, index) => (
            <Grid key={index} size={{ xs: 12, sm: 6, md: 4 }}>
              <MainCard>
                <Stack sx={{ gap: 1.25, alignItems: 'flex-start' }}>
                  <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    {plan.title}
                  </Typography>
                  <Typography variant="h4">{plan.plan}</Typography>
                  <Link href="#" variant="body2" sx={{ mt: 1.25, color: 'primary.main', display: 'flex', alignItems: 'center' }}>
                    {plan.linkText} <ArrowRight2 style={{ marginLeft: 8 }} size={14} />
                  </Link>
                </Stack>
              </MainCard>
            </Grid>
          ))}
          <Grid size={12}>
            <MainCard sx={{ minHeight: 148, p: 2.5 }} content={false}>
              <Stack sx={{ gap: 2.5, alignItems: 'flex-start' }}>
                <Typography variant="h5">Delete Account</Typography>
                <Stack>
                  <Typography variant="h4">Would you like to delete your account?</Typography>
                  <Typography variant="body1">Deleting your account will remove all the content associated with it.</Typography>
                </Stack>
                <Button variant="contained" color="error">
                  Delete Account
                </Button>
              </Stack>
            </MainCard>
          </Grid>
        </Grid>
      </form>
    </>
  );
}
