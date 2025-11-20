// material-ui
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';

// project-imports
import MainCard from 'components/MainCard';

// assets
import { Grid2, SearchNormal1, TableDocument } from '@wandersonalwes/iconsax-react';

interface FiltersProps {
  mode: string;
  setMode: (mode: string) => void;
  searchText: string;
  setSearchText: (text: string) => void;
  fileType: string;
  setFileType: (type: string) => void;
}

// view modes
const viewModes = [
  { value: 'card', icons: Grid2 },
  { value: 'list', icons: TableDocument }
];

// ==============================|| FILE MANAGER - FILTERS ||============================== //

export default function Filters({ setMode, searchText, setSearchText, fileType, setFileType, mode }: FiltersProps) {
  return (
    <Stack direction="row" sx={{ gap: 1, width: 1, justifyContent: 'space-between', alignItems: { xs: 'flex-end', sm: 'flex-start' } }}>
      <Stack direction={{ sm: 'row' }} sx={{ gap: 1, width: 1 }}>
        <FormControl sx={{ width: { xs: 1, sm: 261 } }}>
          <OutlinedInput
            fullWidth
            id="input-search-header"
            placeholder="Search Followers"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            sx={{ '& .MuiOutlinedInput-input': { p: '10.5px 0px 12px' }, height: 48 }}
            startAdornment={
              <InputAdornment position="start">
                <SearchNormal1 size="16" />
              </InputAdornment>
            }
          />
        </FormControl>
        <FormControl sx={{ width: { xs: 1, sm: 122 } }}>
          <Select value={fileType} onChange={(e) => setFileType(e.target.value)} displayEmpty>
            <MenuItem value="all">All Types</MenuItem>
            <MenuItem value="Documents">Documents</MenuItem>
            <MenuItem value="Videos">Videos</MenuItem>
            <MenuItem value="Images">Images</MenuItem>
          </Select>
        </FormControl>
        <TextField
          type="date"
          placeholder="Birthday"
          id="date"
          sx={{ width: { xs: 1, sm: 146 }, minWidth: 146 }}
          slotProps={{ inputLabel: { shrink: true } }}
        />
      </Stack>
      <FormControl component="fieldset" sx={{ width: { xs: 60, sm: 1 } }}>
        <RadioGroup value={mode} onChange={(e) => setMode(e.target.value)} sx={{ width: 1, gap: 1.5 }}>
          <Stack direction="row" sx={{ justifyContent: 'flex-end' }}>
            <Box sx={{ p: 1.25, border: '1px solid', borderRadius: 1, borderColor: 'divider' }}>
              {viewModes.map((item, index) => {
                const IconComponent = item.icons;
                return (
                  <FormControlLabel
                    key={index}
                    value={item.value}
                    control={<Radio sx={{ display: 'none' }} />}
                    label={
                      <MainCard content={false} border={false} sx={{ ...(mode !== item.value && { bgcolor: 'secondary.lighter' }) }}>
                        <Stack direction="row" sx={{ gap: 1, width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
                          <IconComponent size="20" />
                        </Stack>
                      </MainCard>
                    }
                    sx={{ m: 0 }}
                  />
                );
              })}
            </Box>
          </Stack>
        </RadioGroup>
      </FormControl>
    </Stack>
  );
}
