// material-ui
import Autocomplete from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import CardMedia from '@mui/material/CardMedia';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';

// third-party
import { Chance } from 'chance';
import { useFormik } from 'formik';
import * as yup from 'yup';

// project-imports
import { addItem, useGetBacklogs } from 'api/kanban';
import { openSnackbar } from 'api/snackbar';
import IconButton from 'components/@extended/IconButton';
import AnimateButton from 'components/@extended/AnimateButton';
import UploadMultiFile from 'components/third-party/dropzone/MultiFile';
import SimpleBar from 'components/third-party/SimpleBar';
import { DropzopType } from 'config';

// assets
import { Add, Calendar } from '@wandersonalwes/iconsax-react';
const avatarImage = '/assets/images/users';

// types
import { SnackbarProps } from 'types/snackbar';
import { KanbanProfile, KanbanColumn } from 'types/kanban';

interface Props {
  open: boolean;
  handleDrawerOpen: () => void;
  storyId: string;
}

const chance = new Chance();
const validationSchema = yup.object({
  title: yup.string().required('Task title is required'),
  dueDate: yup.date().required('Due date is required').nullable()
});

// ==============================|| KANBAN BACKLOGS - ADD ITEM ||============================== //

export default function AddItem({ open, handleDrawerOpen, storyId }: Props) {
  const { backlogs } = useGetBacklogs();

  const formik = useFormik({
    initialValues: {
      id: '',
      title: '',
      assign: null,
      priority: 'low',
      dueDate: null,
      description: '',
      commentIds: '',
      image: false,
      storyId: '',
      columnId: backlogs?.columns[0]?.id,
      files: []
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: (values, { resetForm }) => {
      const item: any = {
        id: values.id || `${chance.integer({ min: 1000, max: 9999 })}`,
        title: values.title,
        assign: values.assign,
        priority: values.priority,
        dueDate: values.dueDate ? new Date(values.dueDate) : new Date(),
        description: values.description,
        commentIds: values.commentIds,
        image: values.image
      };
      addItem(values.columnId, item, storyId);
      openSnackbar({
        open: true,
        message: 'Submit Success',
        variant: 'alert',
        alert: { color: 'success' }
      } as SnackbarProps);
      handleDrawerOpen();
      resetForm();
    }
  });

  return (
    <Drawer
      sx={{ ml: open ? 3 : 0, flexShrink: 0, zIndex: 1200, overflowX: 'hidden', width: { xs: 320, md: 450 } }}
      slotProps={{ paper: { sx: { width: { xs: 320, md: 450 }, border: 'none', borderRadius: '0px' } } }}
      variant="temporary"
      anchor="right"
      open={open}
      ModalProps={{ keepMounted: true }}
      onClose={handleDrawerOpen}
    >
      {open && (
        <SimpleBar sx={{ overflowX: 'hidden', height: '100vh' }}>
          <Box sx={{ p: 3 }}>
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h4">Add Task</Typography>
              <Tooltip title="Close">
                <IconButton color="secondary" onClick={handleDrawerOpen} size="small" sx={{ fontSize: '0.875rem' }}>
                  <Add style={{ transform: 'rotate(49deg)' }} />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>
          <Divider />
          <Box sx={{ p: 3 }}>
            <form onSubmit={formik.handleSubmit}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <Grid container spacing={2.5}>
                  <Grid size={12}>
                    <Stack sx={{ gap: 1 }}>
                      <InputLabel>Title</InputLabel>
                      <TextField
                        fullWidth
                        id="title"
                        name="title"
                        placeholder="Title"
                        value={formik.values.title}
                        onChange={formik.handleChange}
                        error={formik.touched.title && Boolean(formik.errors.title)}
                        helperText={formik.touched.title && formik.errors.title}
                      />
                    </Stack>
                  </Grid>
                  <Grid size={12}>
                    <Stack sx={{ gap: 1 }}>
                      <InputLabel>Assign to</InputLabel>
                      <Autocomplete
                        id="assign"
                        value={backlogs?.profiles.find((profile: KanbanProfile) => profile.id === formik.values.assign) || null}
                        onChange={(event, value) => {
                          formik.setFieldValue('assign', value?.id);
                        }}
                        options={backlogs?.profiles}
                        fullWidth
                        autoHighlight
                        getOptionLabel={(option) => option.name}
                        isOptionEqualToValue={(option) => option.id === formik.values.assign}
                        renderOption={(props, option) => (
                          <Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>
                            <CardMedia
                              component="img"
                              loading="lazy"
                              sx={{ width: 20 }}
                              src={`${avatarImage}/${option.avatar}`}
                              alt="avatar"
                            />
                            {option.name}
                          </Box>
                        )}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            placeholder="Choose a assignee"
                            slotProps={{
                              htmlInput: {
                                ...params.inputProps,
                                autoComplete: 'new-password' // disable autocomplete and autofill
                              }
                            }}
                          />
                        )}
                      />
                    </Stack>
                  </Grid>
                  <Grid size={12}>
                    <Stack sx={{ gap: 1 }}>
                      <InputLabel>Prioritize</InputLabel>
                      <FormControl>
                        <RadioGroup
                          row
                          aria-label="color"
                          value={formik.values.priority}
                          onChange={formik.handleChange}
                          name="priority"
                          id="priority"
                        >
                          <FormControlLabel value="low" control={<Radio color="primary" sx={{ color: 'primary.main' }} />} label="Low" />
                          <FormControlLabel
                            value="medium"
                            control={<Radio color="warning" sx={{ color: 'warning.main' }} />}
                            label="Medium"
                          />
                          <FormControlLabel value="high" control={<Radio color="error" sx={{ color: 'error.main' }} />} label="High" />
                        </RadioGroup>
                      </FormControl>
                    </Stack>
                  </Grid>
                  <Grid size={12}>
                    <Stack sx={{ gap: 1 }}>
                      <InputLabel>Due date</InputLabel>
                      <DesktopDatePicker
                        value={formik.values.dueDate}
                        format="dd/MM/yyyy"
                        onChange={(date) => {
                          formik.setFieldValue('dueDate', date);
                        }}
                        slots={{ openPickerIcon: () => <Calendar /> }}
                      />
                    </Stack>
                    {formik.touched.dueDate && formik.errors.dueDate && (
                      <FormHelperText error={true}>{formik.errors.dueDate as string}</FormHelperText>
                    )}
                  </Grid>
                  <Grid size={12}>
                    <Stack sx={{ gap: 1 }}>
                      <InputLabel>Description</InputLabel>
                      <TextField
                        fullWidth
                        id="description"
                        name="description"
                        multiline
                        rows={3}
                        value={formik.values.description}
                        onChange={formik.handleChange}
                        error={formik.touched.description && Boolean(formik.errors.description)}
                        helperText={formik.touched.description && formik.errors.description}
                      />
                    </Stack>
                  </Grid>
                  <Grid size={12}>
                    <Stack sx={{ gap: 1 }}>
                      <InputLabel>State</InputLabel>
                      <FormControl fullWidth>
                        <Select
                          id="columnId"
                          name="columnId"
                          displayEmpty
                          value={formik.values.columnId}
                          onChange={formik.handleChange}
                          slotProps={{ input: { 'aria-label': 'Without label' } }}
                        >
                          {backlogs?.columns.map((column: KanbanColumn, index: number) => (
                            <MenuItem key={index} value={column.id}>
                              {column.title}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Stack>
                  </Grid>
                  <Grid size={12}>
                    <Grid container spacing={1}>
                      <Grid size={12}>
                        <InputLabel sx={{ mt: 0.5 }}>Attachments:</InputLabel>
                      </Grid>
                      <Grid size={12}>
                        <UploadMultiFile
                          type={DropzopType.standard}
                          showList={true}
                          setFieldValue={formik.setFieldValue}
                          files={formik.values.files}
                          error={formik.touched.files && !!formik.errors.files}
                        />
                      </Grid>
                      {formik.touched.files && formik.errors.files && (
                        <Grid size={12}>
                          <FormHelperText error id="standard-weight-helper-text-password-login">
                            {formik.errors.files}
                          </FormHelperText>
                        </Grid>
                      )}
                    </Grid>
                  </Grid>
                  <Grid size={12}>
                    <AnimateButton>
                      <Button fullWidth variant="contained" type="submit">
                        Save
                      </Button>
                    </AnimateButton>
                  </Grid>
                </Grid>
              </LocalizationProvider>
            </form>
          </Box>
        </SimpleBar>
      )}
    </Drawer>
  );
}
