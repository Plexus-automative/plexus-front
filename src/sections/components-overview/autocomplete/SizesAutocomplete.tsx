'use client';

// material-ui
import Autocomplete from '@mui/material/Autocomplete';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

// project-imports
import MainCard from 'components/MainCard';
import data from 'data/movies';

// ==============================|| AUTOCOMPLETE - SIZES ||============================== //

export default function SizesAutocomplete() {
  const sizeAutocompleteCodeString = `<Autocomplete
  id="size-small-outlined"
  size="small"
  options={data}
  getOptionLabel={(option) => option.label}
  defaultValue={data[13]}
  renderInput={(params) => <TextField {...params} placeholder="Size Small" />}
  slotProps={{
    chip: {
      sx: {
        bgcolor: 'primary.lighter',
        border: '1px solid',
        borderColor: 'primary.light',
        '& .MuiSvgIcon-root': { color: 'primary.main', '&:hover': { color: 'primary.dark' } }
      }
    }
  }}
  sx={{ '& .MuiOutlinedInput-root': { p: 1 } }}
/>
<Autocomplete
  id="size-small-outlined"
  options={data}
  getOptionLabel={(option) => option.label}
  defaultValue={data[13]}
  renderInput={(params) => <TextField {...params} placeholder="Size Small" />}
  slotProps={{
    chip: {
      sx: {
        bgcolor: 'primary.lighter',
        border: '1px solid',
        borderColor: 'primary.light',
        '& .MuiSvgIcon-root': { color: 'primary.main', '&:hover': { color: 'primary.dark' } }
      }
    }
  }}
  sx={{ '& .MuiOutlinedInput-root': { p: 1 } }}
/>
<Autocomplete
  multiple
  id="size-small-outlined-multi"
  size="small"
  options={data}
  getOptionLabel={(option) => option.label}
  defaultValue={[data[13], data[3]]}
  renderInput={(params) => <TextField {...params} placeholder="Size Small" />}
  slotProps={{
    chip: {
      sx: {
        bgcolor: 'primary.lighter',
        border: '1px solid',
        borderColor: 'primary.light',
        '& .MuiSvgIcon-root': { color: 'primary.main', '&:hover': { color: 'primary.dark' } }
      }
    }
  }}
  sx={{ '& .MuiOutlinedInput-root': { p: 1 } }}
/>
<Autocomplete
  multiple
  id="size-default-outlined-multi"
  options={data}
  getOptionLabel={(option) => option.label}
  defaultValue={[data[13], data[3]]}
  renderInput={(params) => <TextField {...params} placeholder="Size Medium" />}
  slotProps={{
    chip: {
      sx: {
        bgcolor: 'primary.lighter',
        border: '1px solid',
        borderColor: 'primary.light',
        '& .MuiSvgIcon-root': { color: 'primary.main', '&:hover': { color: 'primary.dark' } }
      }
    }
  }}
  sx={{ '& .MuiOutlinedInput-root': { p: 1 } }}
/>
<Autocomplete
  multiple
  size="medium"
  id="size-large-outlined-multi"
  options={data}
  getOptionLabel={(option) => option.label}
  defaultValue={[data[13], data[3]]}
  renderInput={(params) => <TextField {...params} placeholder="Size Large" />}
  slotProps={{
    chip: {
      sx: {
        bgcolor: 'primary.lighter',
        border: '1px solid',
        borderColor: 'primary.light',
        '& .MuiSvgIcon-root': { color: 'primary.main', '&:hover': { color: 'primary.dark' } }
      }
    }
  }}
  sx={{ '& .MuiOutlinedInput-root': { p: 1 } }}
/>`;

  return (
    <MainCard title="Sizes" codeString={sizeAutocompleteCodeString}>
      <Stack sx={{ gap: 2 }}>
        <Autocomplete
          id="size-small-outlined"
          size="small"
          options={data}
          getOptionLabel={(option) => option.label}
          defaultValue={data[13]}
          renderInput={(params) => <TextField {...params} placeholder="Size Small" />}
          slotProps={{
            chip: {
              sx: {
                bgcolor: 'primary.lighter',
                border: '1px solid',
                borderColor: 'primary.light',
                '& .MuiSvgIcon-root': { color: 'primary.main', '&:hover': { color: 'primary.dark' } }
              }
            }
          }}
          sx={{ '& .MuiOutlinedInput-root': { p: 1 } }}
        />
        <Autocomplete
          id="size-small-outlined"
          options={data}
          getOptionLabel={(option) => option.label}
          defaultValue={data[13]}
          renderInput={(params) => <TextField {...params} placeholder="Size Small" />}
          slotProps={{
            chip: {
              sx: {
                bgcolor: 'primary.lighter',
                border: '1px solid',
                borderColor: 'primary.light',
                '& .MuiSvgIcon-root': { color: 'primary.main', '&:hover': { color: 'primary.dark' } }
              }
            }
          }}
          sx={{ '& .MuiOutlinedInput-root': { p: 1 } }}
        />
        <Autocomplete
          multiple
          id="size-small-outlined-multi"
          size="small"
          options={data}
          getOptionLabel={(option) => option.label}
          defaultValue={[data[13], data[3]]}
          renderInput={(params) => <TextField {...params} placeholder="Size Small" />}
          slotProps={{
            chip: {
              sx: {
                bgcolor: 'primary.lighter',
                border: '1px solid',
                borderColor: 'primary.light',
                '& .MuiSvgIcon-root': { color: 'primary.main', '&:hover': { color: 'primary.dark' } }
              }
            }
          }}
          sx={{ '& .MuiOutlinedInput-root': { p: 1 } }}
        />
        <Autocomplete
          multiple
          id="size-default-outlined-multi"
          options={data}
          getOptionLabel={(option) => option.label}
          defaultValue={[data[13], data[3]]}
          renderInput={(params) => <TextField {...params} placeholder="Size Medium" />}
          slotProps={{
            chip: {
              sx: {
                bgcolor: 'primary.lighter',
                border: '1px solid',
                borderColor: 'primary.light',
                '& .MuiSvgIcon-root': { color: 'primary.main', '&:hover': { color: 'primary.dark' } }
              }
            }
          }}
          sx={{ '& .MuiOutlinedInput-root': { p: 1 } }}
        />
        <Autocomplete
          multiple
          size="medium"
          id="size-large-outlined-multi"
          options={data}
          getOptionLabel={(option) => option.label}
          defaultValue={[data[13], data[3]]}
          renderInput={(params) => <TextField {...params} placeholder="Size Large" />}
          slotProps={{
            chip: {
              sx: {
                bgcolor: 'primary.lighter',
                border: '1px solid',
                borderColor: 'primary.light',
                '& .MuiSvgIcon-root': { color: 'primary.main', '&:hover': { color: 'primary.dark' } }
              }
            }
          }}
          sx={{ '& .MuiOutlinedInput-root': { p: 1 } }}
        />
      </Stack>
    </MainCard>
  );
}
