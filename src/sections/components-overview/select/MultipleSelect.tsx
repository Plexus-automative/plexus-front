'use client';

import { useState } from 'react';

// material-ui
import { Theme } from '@mui/material/styles';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Stack from '@mui/material/Stack';

// project-imports
import MainCard from 'components/MainCard';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250
    }
  }
};

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

function getStyles(name: string, personName: string[], theme: Theme) {
  return {
    fontWeight: personName.indexOf(name) === -1 ? theme.typography.fontWeightRegular : theme.typography.fontWeightMedium
  };
}

// ==============================|| SELECT - MULTI SELECT ||============================== //

export default function MultipleSelect() {
  const [personName, setPersonName] = useState<string[]>([]);

  const handleChange = (event: SelectChangeEvent<typeof personName>) => {
    const {
      target: { value }
    } = event;
    setPersonName(
      // On autofill we get a the stringified value.
      typeof value === 'string' ? value.split(',') : value
    );
  };

  const multipleSelectCodeString = `// MultipleSelect.tsx
<FormControl fullWidth>
  <InputLabel id="demo-multiple-name-label">Name</InputLabel>
  <Select
    labelId="demo-multiple-name-label"
    id="demo-multiple-name"
    multiple
    value={personName}
    onChange={handleChange}
    input={<OutlinedInput />}
    MenuProps={MenuProps}
  >
    {names.map((name) => (
      <MenuItem key={name} value={name} style={getStyles(name, personName, theme)}>
        {name}
      </MenuItem>
    ))}
  </Select>
</FormControl>`;

  return (
    <MainCard title="Multiple" codeString={multipleSelectCodeString}>
      <Stack sx={{ gap: 1 }}>
        <InputLabel id="demo-multiple-name-label">Name</InputLabel>
        <FormControl fullWidth>
          <Select
            labelId="demo-multiple-name-label"
            id="demo-multiple-name"
            multiple
            value={personName}
            onChange={handleChange}
            input={<OutlinedInput />}
            MenuProps={MenuProps}
          >
            {names.map((name) => (
              <MenuItem key={name} value={name} sx={(theme) => ({ ...getStyles(name, personName, theme) })}>
                {name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>
    </MainCard>
  );
}
