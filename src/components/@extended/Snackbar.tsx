import { SyntheticEvent } from 'react';

// material-ui
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Fade from '@mui/material/Fade';
import Grow from '@mui/material/Grow';
import Slide, { SlideProps } from '@mui/material/Slide';
import MuiSnackbar from '@mui/material/Snackbar';

// project-imports
import IconButton from './IconButton';
import { closeSnackbar, useGetSnackbar } from 'api/snackbar';

// assets
import { Add } from '@wandersonalwes/iconsax-react';

// types
import { KeyedObject } from 'types/root';

// animation function
function TransitionSlideLeft(props: SlideProps) {
  return <Slide {...props} direction="left" />;
}

function TransitionSlideUp(props: SlideProps) {
  return <Slide {...props} direction="up" />;
}

function TransitionSlideRight(props: SlideProps) {
  return <Slide {...props} direction="right" />;
}

function TransitionSlideDown(props: SlideProps) {
  return <Slide {...props} direction="down" />;
}

function GrowTransition(props: SlideProps) {
  return <Grow {...props} />;
}

// animation options
const animation: KeyedObject = {
  SlideLeft: TransitionSlideLeft,
  SlideUp: TransitionSlideUp,
  SlideRight: TransitionSlideRight,
  SlideDown: TransitionSlideDown,
  Grow: GrowTransition,
  Fade
};

// ==============================|| SNACKBAR ||============================== //

export default function Snackbar() {
  const { snackbar } = useGetSnackbar();

  const handleClose = (event: SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    closeSnackbar();
  };

  return (
    <>
      {/* default snackbar */}
      {snackbar.variant === 'default' && (
        <MuiSnackbar
          anchorOrigin={snackbar.anchorOrigin}
          open={snackbar.open}
          autoHideDuration={1500}
          onClose={handleClose}
          message={snackbar.message}
          slots={{ transition: animation[snackbar.transition] }}
          slotProps={{ content: { sx: { bgcolor: 'secondary.main', typography: 'h6' } } }}
          action={
            <>
              <Button
                variant="contained"
                size="small"
                onClick={handleClose}
                color="secondary"
                sx={(theme) => ({
                  bgcolor: 'secondary.main',
                  color: 'background.paper',
                  fontSize: 12,
                  ...theme.applyStyles('dark', {
                    '&:hover': { bgcolor: 'secondary.main', color: 'error.main' }
                  })
                })}
              >
                UNDO
              </Button>
              <IconButton
                variant="contained"
                size="small"
                aria-label="close"
                color="secondary"
                onClick={handleClose}
                sx={{ '& svg': { width: 24, height: 24 } }}
              >
                <Add size={24} style={{ transform: 'rotate(45deg)' }} />
              </IconButton>
            </>
          }
        />
      )}
      {/* alert snackbar */}
      {snackbar.variant === 'alert' && (
        <MuiSnackbar
          slots={{ transition: animation[snackbar.transition] }}
          anchorOrigin={snackbar.anchorOrigin}
          open={snackbar.open}
          autoHideDuration={1500}
          onClose={handleClose}
        >
          <Alert
            variant={snackbar.alert.variant}
            color={snackbar.alert.color}
            action={
              <>
                {snackbar.actionButton !== false && (
                  <>
                    <Button color={snackbar.alert.color} size="small" onClick={handleClose} sx={{ mt: 0.5 }}>
                      UNDO
                    </Button>
                    <IconButton
                      sx={{ mt: 0.25 }}
                      size="small"
                      aria-label="close"
                      variant="contained"
                      color={snackbar.alert.color}
                      onClick={handleClose}
                    >
                      <Add style={{ transform: 'rotate(45deg)' }} />
                    </IconButton>
                  </>
                )}
                {snackbar.actionButton === false && snackbar.close && (
                  <IconButton
                    sx={{ mt: 0.25, '&:hover': { bgcolor: 'transparent' } }}
                    size="small"
                    aria-label="close"
                    variant="contained"
                    color={snackbar.alert.color}
                    onClick={handleClose}
                  >
                    <Add style={{ transform: 'rotate(45deg)' }} />
                  </IconButton>
                )}
              </>
            }
            sx={{ ...snackbar.alert.sx, ...(snackbar.alert.variant === 'outlined' && { bgcolor: 'background.default' }) }}
          >
            {snackbar.message}
          </Alert>
        </MuiSnackbar>
      )}
    </>
  );
}
