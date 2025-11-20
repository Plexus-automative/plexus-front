// material-ui
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';

// project-imports
import MainCard from 'components/MainCard';

// third-party
import { enqueueSnackbar } from 'notistack';

// ==============================|| NOTISTACK - POSTIONING ||============================== //

export default function PositioningSnackbar() {
  const NotiStackPositioningCodeString = `<Button
  variant="contained"
  onClick={() =>
    enqueueSnackbar('This is a Top-Left message', {
      anchorOrigin: {
        vertical: 'top',
        horizontal: 'left'
      }
    })
  }
>
  Top-Left
</Button>
<Button
  variant="contained"
  onClick={() =>
    enqueueSnackbar('This is a Top-Center message', {
      anchorOrigin: {
        vertical: 'top',
        horizontal: 'center'
      }
    })
  }
>
  Top-Center
</Button>
<Button
  variant="contained"
  onClick={() =>
    enqueueSnackbar('This is a Top-Right message', {
      anchorOrigin: {
        vertical: 'top',
        horizontal: 'right'
      }
    })
  }
>
  Top-right
</Button>
<Button
  variant="contained"
  onClick={() =>
    enqueueSnackbar('This is a Bottom-Left message', {
      anchorOrigin: {
        vertical: 'bottom',
        horizontal: 'left'
      }
    })
  }
>
  Bottom-left
</Button>
<Button
  variant="contained"
  onClick={() =>
    enqueueSnackbar('This is a Bottom-Center message', {
      anchorOrigin: {
        vertical: 'bottom',
        horizontal: 'center'
      }
    })
  }
>
  Bottom-center
</Button>
<Button
  variant="contained"
  onClick={() =>
    enqueueSnackbar('This is a Bottom-Right message', {
      anchorOrigin: {
        vertical: 'bottom',
        horizontal: 'right'
      }
    })
  }
>
  Bottom-Right
</Button>`;

  return (
    <MainCard title="Positioning" codeString={NotiStackPositioningCodeString}>
      <Grid container spacing={2}>
        <Grid>
          <Button
            variant="contained"
            onClick={() => enqueueSnackbar('This is a Top-Left message', { anchorOrigin: { vertical: 'top', horizontal: 'left' } })}
          >
            Top-Left
          </Button>
        </Grid>
        <Grid>
          <Button
            variant="contained"
            onClick={() =>
              enqueueSnackbar('This is a Top-Center message', {
                anchorOrigin: {
                  vertical: 'top',
                  horizontal: 'center'
                }
              })
            }
          >
            Top-Center
          </Button>
        </Grid>
        <Grid>
          <Button
            variant="contained"
            onClick={() =>
              enqueueSnackbar('This is a Top-Right message', {
                anchorOrigin: {
                  vertical: 'top',
                  horizontal: 'right'
                }
              })
            }
          >
            Top-right
          </Button>
        </Grid>
        <Grid>
          <Button
            variant="contained"
            onClick={() =>
              enqueueSnackbar('This is a Bottom-Left message', {
                anchorOrigin: {
                  vertical: 'bottom',
                  horizontal: 'left'
                }
              })
            }
          >
            Bottom-left
          </Button>
        </Grid>
        <Grid>
          <Button
            variant="contained"
            onClick={() =>
              enqueueSnackbar('This is a Bottom-Center message', {
                anchorOrigin: {
                  vertical: 'bottom',
                  horizontal: 'center'
                }
              })
            }
          >
            Bottom-center
          </Button>
        </Grid>
        <Grid>
          <Button
            variant="contained"
            onClick={() =>
              enqueueSnackbar('This is a Bottom-Right message', {
                anchorOrigin: {
                  vertical: 'bottom',
                  horizontal: 'right'
                }
              })
            }
          >
            Bottom-Right
          </Button>
        </Grid>
      </Grid>
    </MainCard>
  );
}
