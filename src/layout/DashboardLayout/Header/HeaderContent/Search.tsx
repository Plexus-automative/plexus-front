// material-ui
import { useState, KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import Box from '@mui/material/Box';

// assets
import { SearchNormal1 } from '@wandersonalwes/iconsax-react';

// ==============================|| HEADER CONTENT - SEARCH ||============================== //

export default function Search() {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState('');

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && searchValue.trim()) {
      router.push(`/pages/articles?search=${encodeURIComponent(searchValue.trim())}`);
      setSearchValue('');
    }
  };

  return (
    <Box sx={{ width: '100%', ml: { xs: 0, md: 2 } }}>
      <FormControl sx={{ width: { xs: '100%', md: 224 } }}>
        <OutlinedInput
          id="header-search"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={handleKeyDown}
          startAdornment={
            <InputAdornment position="start" sx={{ mr: -0.5 }}>
              <SearchNormal1 size={16} />
            </InputAdornment>
          }
          aria-describedby="header-search-text"
          slotProps={{ input: { sx: { p: 1.5 }, 'aria-label': 'weight' } }}
          placeholder="Ctrl + K"
        />
      </FormControl>
    </Box>
  );
}
