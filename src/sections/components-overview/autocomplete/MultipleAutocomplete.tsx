'use client';

// material-ui
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

// project-imports
import MainCard from 'components/MainCard';
import data from 'data/movies';

// ==============================|| AUTOCOMPLETE - MULTIPLE ||============================== //

export default function MultipleAutocomplete() {
  const multiAutocompleteCodeString = `<Autocomplete
  multiple
  id="tags-outlined"
  options={data}
  getOptionLabel={(option) => option.label}
  defaultValue={[data[7], data[13]]}
  filterSelectedOptions
  renderInput={(params) => <TextField {...params} placeholder="Favorites" />}
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
    <MainCard title="Multiple Tags" codeString={multiAutocompleteCodeString}>
      <Autocomplete
        multiple
        id="tags-outlined"
        options={data}
        getOptionLabel={(option) => option.label}
        defaultValue={[data[7], data[13]]}
        filterSelectedOptions
        renderInput={(params) => <TextField {...params} placeholder="Favorites" />}
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
    </MainCard>
  );
}
