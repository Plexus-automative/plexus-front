'use client';

import { useState } from 'react';

// material-ui
import Button from '@mui/material/Button';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';

// third-party
import copy from 'copy-to-clipboard';

// project-imports
import { openSnackbar } from 'api/snackbar';
import IconButton from 'components/@extended/IconButton';
import MainCard from 'components/MainCard';
import { GRID_COMMON_SPACING } from 'config';

// types
import { SnackbarProps } from 'types/snackbar';

// assets
import { Copy, Scissor } from '@wandersonalwes/iconsax-react';

// ==============================|| PLUGIN - CLIPBOARD ||============================== //

export default function ClipboardPage() {
  const [text1, setText1] = useState('https://ableproadmin.com/');
  const [text2, setText2] = useState(
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
  );
  const [text3] = useState(
    'Lorem ipsum cacilds, vidis litro abertis. Consetis adipiscings elitis. Pra lá , depois divoltis porris, paradis. Paisis, filhis, espiritis santis. Mé faiz elementum girarzis, nisi eros vermeio, in elementis mé pra quem é amistosis quis leo. Manduma pindureta quium dia nois paga.'
  );

  const handleCopy = (text: string, successMessage: string) => {
    copy(text);
    openSnackbar({
      open: true,
      message: successMessage,
      variant: 'alert',
      alert: { color: 'success' },
      anchorOrigin: { vertical: 'top', horizontal: 'right' },
      transition: 'SlideLeft'
    } as SnackbarProps);
  };

  return (
    <Grid container spacing={GRID_COMMON_SPACING}>
      <Grid size={12}>
        <MainCard title="Copy from TextField">
          <Stack sx={{ gap: 1 }}>
            <InputLabel>Enter Website</InputLabel>
            <TextField
              fullWidth
              placeholder="Website"
              type="text"
              value={text1}
              onChange={(e) => {
                setText1(e.target.value);
              }}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title="Copy">
                        <IconButton
                          aria-label="Copy from another element"
                          color="secondary"
                          edge="end"
                          size="large"
                          onClick={() => handleCopy(text1, 'Text Copied')}
                        >
                          <Copy />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  )
                }
              }}
            />
          </Stack>
        </MainCard>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <MainCard title="Copy from TextArea">
          <Stack sx={{ gap: 1 }}>
            <InputLabel>Enter Text to Copy</InputLabel>
            <TextField
              multiline
              rows={4}
              fullWidth
              placeholder="Copy text"
              onChange={(e) => setText2(e.target.value)}
              value={text2}
              sx={{ mb: 2 }}
            />
          </Stack>
          <Stack sx={{ gap: 1.5, width: 'fit-content', flexDirection: 'row' }}>
            <Button
              disabled={Boolean(!text2)}
              variant="contained"
              size="small"
              startIcon={<Copy />}
              onClick={() => handleCopy(text2, 'Text Copied')}
            >
              Copy
            </Button>
            <Button
              disabled={Boolean(!text2)}
              variant="contained"
              size="small"
              color="error"
              startIcon={<Scissor />}
              onClick={() => {
                setText2('');
                handleCopy(text2, 'Text Cut');
              }}
            >
              Cut
            </Button>
          </Stack>
        </MainCard>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <MainCard
          title="Copy from Container"
          secondary={
            <Tooltip title="Copy">
              <IconButton size="large" onClick={() => handleCopy(text3, 'Text Copied')}>
                <Copy />
              </IconButton>
            </Tooltip>
          }
        >
          <CardContent sx={{ p: 0, pb: 2.5 }}>{text3}</CardContent>
        </MainCard>
      </Grid>
    </Grid>
  );
}
