// material-ui
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

// third-party
import { SnackbarKey, useSnackbar } from 'notistack';

// project-imports
import MainCard from 'components/MainCard';

// ==============================|| NOTISTACK - ACTION BUTTONS ||============================== //

export default function SnackBarAction() {
  const { closeSnackbar, enqueueSnackbar } = useSnackbar();
  const actionTask = (snackbarId: SnackbarKey) => (
    <Stack direction="row" sx={{ gap: 0.5 }}>
      <Button
        size="small"
        color="error"
        variant="contained"
        onClick={() => {
          alert(`I belong to snackbar with id ${snackbarId}`);
        }}
      >
        Undo
      </Button>
      <Button size="small" color="secondary" variant="contained" onClick={() => closeSnackbar(snackbarId)}>
        Dismiss
      </Button>
    </Stack>
  );

  const NotistackActionCodeString = `const actionTask = (snackbarId: SnackbarKey) => (
  <>
    <Button
      variant="text"
      onClick={() => {
        alert("I belong to snackbar with id {snackbarId}");
      }}
    >
      Undo
    </Button>
    <Button variant="text" onClick={() => closeSnackbar(snackbarId)}>
      Dismiss
    </Button>
  </>
);
<Button variant="outlined" onClick={() => enqueueSnackbar('Your notification here', { action: (key) => actionTask(key) })}>
 Show Snackbar
</Button>`;

  return (
    <MainCard title="With Action" codeString={NotistackActionCodeString}>
      <Button
        variant="contained"
        fullWidth
        sx={{ marginBlockStart: 2 }}
        onClick={() => enqueueSnackbar('Your notification here', { action: (key: any) => actionTask(key) })}
      >
        Show Snackbar
      </Button>
    </MainCard>
  );
}
