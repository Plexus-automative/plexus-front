'use client';

// material-ui
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// third-party
import { useFormik } from 'formik';
import * as yup from 'yup';

// project-imports
import { openSnackbar } from 'api/snackbar';
import AnimateButton from 'components/@extended/AnimateButton';
import MainCard from 'components/MainCard';

// types
import { SnackbarProps } from 'types/snackbar';

// assets
import { Add, ArrowDown2 } from '@wandersonalwes/iconsax-react';

const roles: string[] = ['User', 'Admin', 'Staff', 'Manager'];

const skills = ['Java', 'HTML', 'Bootstrap', 'JavaScript', 'NodeJS', 'React', 'Angular', 'CI'];

const filter = createFilterOptions<string>();
const filterSkills = createFilterOptions<string>();

const validationSchema = yup.object({
  role: yup
    .string()
    .trim()
    .required('Role selection is required')
    .matches(/^[a-z\d\-/#_\s]+$/i, 'Only alphanumerics are allowed')
    .max(50, 'Role must be at most 50 characters'),
  skills: yup
    .array()
    .of(
      yup
        .string()
        .trim()
        .required('Leading spaces found in your tag')
        .matches(/^[a-z\d\-/#.&_\s]+$/i, 'Only alphanumerics are allowed')
        .max(50, 'Skill tag field must be at most 50 characters')
    )
    .required('Skill selection is required')
    .min(3, 'Skill tags field must have at least 3 items')
    .max(15, 'Please select a maximum of 15 skills.')
});

// ==============================|| FORM VALIDATION - AUTOCOMPLETE  ||============================== //

export default function AutocompleteForms() {
  const formik = useFormik({
    initialValues: {
      role: '',
      skills: []
    },
    validationSchema,
    onSubmit: () => {
      openSnackbar({
        open: true,
        message: 'Autocomplete - Submit Success',
        variant: 'alert',
        alert: {
          color: 'success'
        }
      } as SnackbarProps);
    }
  });

  let TagsError: boolean | string | undefined = false;
  if (formik.touched.skills && typeof formik.errors.skills) {
    if (formik.touched.skills && typeof formik.errors.skills === 'string') {
      TagsError = formik.errors.skills;
    } else {
      if (formik.errors.skills && typeof formik.errors.skills !== 'string') {
        formik.errors.skills.map((item: string | object) => {
          if (typeof item === 'object' && 'label' in item) TagsError = item.label as string;
          return item;
        });
      }
    }
  }

  return (
    <MainCard title="Autocomplete">
      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>
          <Grid size={12}>
            <Autocomplete
              fullWidth
              value={formik.values.role}
              disableClearable
              onChange={(event, newValue) => {
                const jobExist = roles.includes(newValue);
                if (!jobExist) {
                  const matchData = newValue.match(/"((?:\\.|[^"\\])*)"/);
                  formik.setFieldValue('role', matchData && matchData[1]);
                } else {
                  formik.setFieldValue('role', newValue);
                }
              }}
              filterOptions={(options, params) => {
                const filtered = filter(options, params);
                const { inputValue } = params;
                const isExisting = options.some((option) => inputValue === option);
                if (inputValue !== '' && !isExisting) {
                  filtered.push(`Add "${inputValue}"`);
                }
                return filtered;
              }}
              selectOnFocus
              clearOnBlur
              autoHighlight
              handleHomeEndKeys
              id="free-solo-with-text-demo"
              options={roles}
              getOptionLabel={(option) => {
                let value = option;
                const jobExist = roles.includes(option);
                if (!jobExist) {
                  const matchData = option.match(/"((?:\\.|[^"\\])*)"/);
                  if (matchData && matchData[1]) value = matchData && matchData[1];
                }
                return value;
              }}
              renderOption={({ key, ...props }, option) => (
                <Box key={key} component="li" {...props}>
                  {option}
                </Box>
              )}
              freeSolo
              renderInput={(params) => (
                <TextField
                  {...params}
                  name="role"
                  error={formik.touched.role && Boolean(formik.errors.role)}
                  helperText={formik.touched.role && formik.errors.role && formik.errors.role}
                  placeholder="Select Role"
                  slotProps={{
                    input: {
                      ...params.InputProps,
                      endAdornment: (
                        <InputAdornment position="end">
                          <ArrowDown2 />
                          {/* <ArrowDropDown sx={{ color: 'text.primary' }} /> */}
                        </InputAdornment>
                      )
                    }
                  }}
                />
              )}
            />
          </Grid>
          <Grid size={12}>
            <Autocomplete
              id="skills"
              multiple
              fullWidth
              autoHighlight
              freeSolo
              disableCloseOnSelect
              options={skills}
              value={formik.values.skills}
              onBlur={formik.handleBlur}
              getOptionLabel={(option) => option}
              onChange={(event, newValue) => {
                const jobExist = skills.includes(newValue[newValue.length - 1]);
                if (!jobExist) {
                  formik.setFieldValue('skills', newValue);
                } else {
                  formik.setFieldValue('skills', newValue);
                }
              }}
              filterOptions={(options, params) => {
                const filtered = filterSkills(options, params);
                const { inputValue } = params;
                const isExisting = options.some((option) => inputValue === option);
                if (inputValue !== '' && !isExisting) {
                  filtered.push(inputValue);
                }

                return filtered;
              }}
              renderOption={({ key, ...props }, option) => (
                <Box key={key} component="li" {...props}>
                  {!skills.some((v) => option.includes(v)) ? `Add "${option}"` : option}
                </Box>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  name="skills"
                  placeholder="Write your skills"
                  error={formik.touched.skills && Boolean(formik.errors.skills)}
                  helperText={TagsError}
                />
              )}
              renderValue={(values, getItemProps) =>
                values.map((option, index) => {
                  let error = false;
                  if (formik.touched.skills && formik.errors.skills && typeof formik.errors.skills !== 'string') {
                    if (typeof formik.errors.skills[index] === 'object') error = true;
                  }

                  return (
                    <Chip
                      {...getItemProps({ index })}
                      variant="combined"
                      key={index}
                      color={error ? 'error' : 'secondary'}
                      label={
                        <Typography variant="caption" color="secondary.dark">
                          {option}
                        </Typography>
                      }
                      deleteIcon={<Add style={{ fontSize: '0.875rem', transform: 'rotate(45deg)' }} />}
                      size="small"
                    />
                  );
                })
              }
            />
            <Stack direction="row" sx={{ gap: { xs: 1, sm: 0 }, alignItems: 'center', mt: 1.5, flexWrap: { xs: 'wrap', sm: 'inherit' } }}>
              <Typography variant="caption">Suggestion:</Typography>
              <Stack direction="row" sx={{ gap: 1, alignItems: 'center', ml: 1, flexWrap: { xs: 'wrap', sm: 'inherit' } }}>
                {skills
                  .filter((skill: string) => formik.values.skills && !formik.values.skills.map((item) => item).includes(skill as never))
                  .slice(0, 5)
                  .map((option, index) => (
                    <Chip
                      key={index}
                      variant="outlined"
                      onClick={() => formik.setFieldValue('skills', [...formik.values.skills, option])}
                      label={<Typography variant="caption">{option}</Typography>}
                      size="small"
                    />
                  ))}
              </Stack>
            </Stack>
          </Grid>
          <Grid size={12}>
            <Stack direction="row" sx={{ justifyContent: 'flex-end' }}>
              <AnimateButton>
                <Button variant="contained" type="submit">
                  Submit
                </Button>
              </AnimateButton>
            </Stack>
          </Grid>
        </Grid>
      </form>
    </MainCard>
  );
}
