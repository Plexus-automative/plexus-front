import { useState } from 'react';

// material-ui
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// third-party
import { enqueueSnackbar } from 'notistack';

// project-imports
import { handlerIncrease, useGetSnackbar } from 'api/snackbar';
import MainCard from 'components/MainCard';

// assets
import { Add, Minus } from '@wandersonalwes/iconsax-react';

// ==============================|| NOTISTACK - MAXIMUM SNACKBAR ||============================== //

export default function MaxSnackbar() {
  const width = { minWidth: 'auto' };

  const { snackbar } = useGetSnackbar();
  const [value, setValue] = useState<number>(3);

  const handlerMaxStack = () => {
    enqueueSnackbar('Your notification here');
    handlerIncrease(value);
  };

  const NotiStackMaxSnackbarCodeString = `<Button
variant="contained"
fullWidth
sx={{ marginBlockStart: 2 }}
onClick={() => {
  enqueueSnackbar('Your notification here');
  handlerIncrease(value);
}}
>
  Show Snackbar
</Button>`;

  return (
    <MainCard title="Maximum snackbars" codeString={NotiStackMaxSnackbarCodeString}>
      <Stack sx={{ justifyContent: 'space-between', flexDirection: 'row' }}>
        <Button
          variant="outlined"
          size="small"
          sx={width}
          disabled={snackbar.maxStack === 0 || value <= 0}
          onClick={() => setValue((prev) => prev - 1)}
        >
          <Minus />
        </Button>
        <Typography variant="body1">stack up to {value}</Typography>
        <Button variant="outlined" size="small" sx={width} disabled={value === 4} onClick={() => setValue((prev) => prev + 1)}>
          <Add />
        </Button>
      </Stack>
      <Button variant="contained" fullWidth sx={{ marginBlockStart: 2 }} onClick={() => handlerMaxStack()}>
        Show Snackbar
      </Button>
    </MainCard>
  );
}
