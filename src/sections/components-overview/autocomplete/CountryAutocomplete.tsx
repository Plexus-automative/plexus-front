'use client';

// material-ui
import Autocomplete from '@mui/material/Autocomplete';
import CardMedia from '@mui/material/CardMedia';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';

// project-imports
import countries from 'data/countries';
import MainCard from 'components/MainCard';

// ==============================|| AUTOCOMPLETE - COUNTRY ||============================== //

export default function CountryAutocomplete() {
  const countryAutocompleteCodeString = `<Autocomplete
  id="country-select-demo"
  fullWidth
  options={countries}
  autoHighlight
  getOptionLabel={(option) => option.label}
  renderOption={(props, option) => (
    <Box component="li" sx={{ display: 'flex', direction: 'row', alignItems: 'center', gap: 1 }} {...props}>
      {option.code && (
        <img
          loading="lazy"
          width="20"
          src={https://flagcdn.com/w20/{option.code.toLowerCase()}.png}
          srcSet={https://flagcdn.com/w40/{option.code.toLowerCase()}.png 2x}
          alt=""
        />
      )}
      {option.label} ({option.code}) +{option.phone}
    </Box>
  )}
  renderInput={(params) => (
    <TextField
      {...params}
      placeholder="Choose a country"
      slotProps={{
        input: {
          ...params.inputProps,
          autoComplete: 'new-password' // disable autocomplete and autofill
        }
      }}
    />
  )}
/>`;

  return (
    <MainCard title="With Image" codeString={countryAutocompleteCodeString}>
      <Autocomplete
        id="country-select-demo"
        fullWidth
        options={countries}
        autoHighlight
        getOptionLabel={(option) => option.label}
        renderOption={(props, option) => (
          <Box component="li" sx={{ display: 'flex', direction: 'row', alignItems: 'center', gap: 1 }} {...props}>
            {option.code && (
              <CardMedia
                component="img"
                sx={{ width: 20 }}
                alt="flag"
                loading="lazy"
                src={`https://flagcdn.com/w20/${option.code.toLowerCase()}.png`}
                srcSet={`https://flagcdn.com/w40/${option.code.toLowerCase()}.png 2x`}
              />
            )}
            {option.label} ({option.code}) +{option.phone}
          </Box>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Choose a country"
            slotProps={{
              htmlInput: {
                ...params.inputProps,
                autoComplete: 'new-password' // disable autocomplete and autofill
              }
            }}
          />
        )}
      />
    </MainCard>
  );
}
