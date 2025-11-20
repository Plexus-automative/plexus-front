'use client';

import { useState } from 'react';

// material-ui
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Fab from '@mui/material/Fab';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

// project-imports
import AnimateButton from 'components/@extended/AnimateButton';
import IconButton from 'components/@extended/IconButton';
import ComponentHeader from 'components/cards/ComponentHeader';
import MainCard from 'components/MainCard';
import { GRID_COMMON_SPACING } from 'config';

import ComponentWrapper from 'sections/components-overview/ComponentWrapper';
import ToggleButtons from 'sections/components-overview/buttons/ToggleButtons';
import ButtonGroups from 'sections/components-overview/buttons/ButtonGroups';

// assets
import { Add, AddCircle, Camera, Edit, EmojiHappy, Home3, Location, MicrophoneSlash, Send, Setting2 } from '@wandersonalwes/iconsax-react';

// styles
const Input = styled('input')({ display: 'none' });
Input.displayName = 'Input';

// ==============================|| COMPOENETS - BUTTON ||============================== //

export default function ComponentButtons() {
  const [loading, setLoading] = useState({
    home: false,
    edit: false,
    address: false,
    add: false,
    submit: false,
    cancel: false
  });

  const loadingHandler = (state: string) => {
    setLoading({ ...loading, [state]: true });
    setTimeout(() => {
      setLoading({ ...loading, [state]: false });
    }, 1000);
  };

  const disableStyle = { '&:hover': { bgcolor: 'action.hover' } };

  const basicButtonCodeString = `<Button variant="contained">Primary</Button>
<Button variant="contained" color="secondary">Secondary</Button>
<Button variant="contained" color="info">Info</Button>
<Button variant="contained" color="success">Success</Button>
<Button variant="contained" color="warning">Warning</Button>
<Button variant="contained" color="error">Error</Button>`;

  const outlinedButtonCodeString = `<Button variant="outlined">Primary</Button>
<Button variant="outlined" color="secondary">Secondary</Button>
<Button variant="outlined" color="info">Info</Button>
<Button variant="outlined" color="success">Success</Button>
<Button variant="outlined" color="warning">Warning</Button>
<Button variant="outlined" color="error">Error</Button>`;

  const dashButtonCodeString = `<Button variant="dashed">Primary</Button>
<Button variant="dashed" color="secondary">Secondary</Button>
<Button variant="dashed" color="info">Info</Button>
<Button variant="dashed" color="success">Success</Button>
<Button variant="dashed" color="warning">Warning</Button>
<Button variant="dashed" color="error">Error</Button>`;

  const textButtonCodeString = `<Button>Primary</Button>
<Button color="secondary">Secondary</Button>
<Button color="info">Info</Button>
<Button color="success">Success</Button>
<Button color="warning">Warning</Button>
<Button color="error">Error</Button>`;

  const shadowButtonCodeString = `<Button variant="shadow">Primary</Button>
<Button variant="shadow" color="secondary">Secondary</Button>
<Button variant="shadow" color="info">Info</Button>
<Button variant="shadow" color="success">Success</Button>
<Button variant="shadow" color="warning">Warning</Button>
<Button variant="shadow" color="error">Error</Button>`;

  const withIconButtonCodeString = `<Button variant="contained" startIcon={<Home3 />}>Home</Button>
<Button variant="contained" color="secondary" endIcon={<EmojiHappy variant="Bold" />}>Profile</Button>
<Button variant="outlined" color="info" startIcon={<Location />}>Address</Button>
<Button variant="outlined" color="success" startIcon={<AddCircle />}>Add</Button>
<Button variant="outlined" color="warning" endIcon={<Send />}>Send</Button>
<Button color="error" endIcon={<Add style={{ transform: 'rotate(45deg)' }} />}>Cancel</Button>`;

  const sizeButtonCodeString = `<Button variant="contained" size="extraSmall">Extra Small</Button>
<Button variant="contained" size="small">small</Button>
<Button variant="contained">Default</Button>
<Button variant="contained" size="large">Large</Button>`;

  const uploadButtonCodeString = `<label htmlFor="contained-button-file">
  <Input accept="image/*" id="contained-button-file" multiple type="file" />
  <Button variant="contained">
    Upload
  </Button>
</label>
<label htmlFor="icon-button-file">
  <Input accept="image/*" id="icon-button-file" type="file" />
  <IconButton variant="contained" shape="rounded" aria-label="upload picture">
    <Camera />
  </IconButton>
</label>`;

  const disabledButtonCodeString = `<Button disabled>Default</Button>
<Button variant="contained" disabled>Contained</Button>
<Button variant="outlined" disabled>Outlined</Button>
<Button variant="dashed" color="success" disabled>Dashed</Button>
<IconButton variant="contained" disabled><Home3 /></IconButton>
<IconButton variant="outlined" color="success" disabled><AddCircle /></IconButton>
<IconButton variant="dashed" color="warning" disabled><Send /></IconButton>
<Button loading color="secondary"><Add style={{ transform: 'rotate(45deg)' }} /></Button>`;

  const blockButtonCodeString = `<Button variant="contained" fullWidth>Primary</Button>
<Button variant="outlined" color="secondary" fullWidth>Secondary</Button>`;

  const fabButtonCodeString = `<Fab color="primary" aria-label="add">
  <Add style={{ fontSize: '1.3rem' }} />
</Fab>
<Fab color="info" aria-label="edit">
  <Edit style={{ fontSize: '1.3rem' }} />
</Fab>
<Fab disabled aria-label="like">
  <MicrophoneSlash style={{ fontSize: '1.3rem' }} />
</Fab>
<Fab color="error" variant="extended">
  Extended
</Fab>`;

  const iconButtonCodeString = `<IconButton variant="contained">
  <Home3 />
</IconButton>
<IconButton variant="contained" color="secondary">
<EmojiHappy variant="Bold" />
</IconButton>
<IconButton variant="outlined" color="info">
  <Location />
</IconButton>
<IconButton variant="outlined" color="success">
  <AddCircle />
</IconButton>
<IconButton variant="dashed" color="warning">
  <Send />
</IconButton>
<IconButton color="error">
  <Add style={{ transform: 'rotate(45deg)' }} />
</IconButton>
<IconButton shape="rounded" variant="contained">
  <Home3 />
</IconButton>
<IconButton shape="rounded" variant="contained" color="secondary">
<EmojiHappy variant="Bold" />
</IconButton>
<IconButton shape="rounded" variant="outlined" color="info">
  <Location />
</IconButton>
<IconButton shape="rounded" variant="outlined" color="success">
  <AddCircle />
</IconButton>
<IconButton shape="rounded" variant="dashed" color="warning">
  <Send />
</IconButton>
<IconButton shape="rounded" color="error">
  <Add style={{ transform: 'rotate(45deg)' }} />
</IconButton>`;

  const loadingButtonCodeString = `<Button loading variant="contained" loadingPosition="start" startIcon={<Home3 />}>
  Home
</Button>
<Button loading color="secondary" variant="outlined" loadingPosition="end" endIcon={<EmojiHappy variant="Bold" />}>
  Edit
</Button>
<Button loading color="info" variant="dashed" loadingIndicator="Loading...">
  Address
</Button>
<Button loading color="success" variant="contained" shape="square">
  <AddCircle />
</Button>
<Button loading color="warning" variant="dashed" shape="rounded">
  <Send />
</Button>
<Button loading color="error">
<Add style={{ transform: 'rotate(45deg)' }} />
</Button>
<Button loading={loading.home} variant="contained" loadingPosition="start" startIcon={<Home3 />} onClick={() => loadingHandler('home')}>
  Home
</Button>
<Button loading={loading.edit} color="secondary" variant="outlined" loadingPosition="end" endIcon={<EmojiHappy variant="Bold" />} onClick={() => loadingHandler('edit')}>
  Edit
</Button>
<Button loading={loading.address} color="info" variant="dashed" loadingIndicator="Loading..." onClick={() => loadingHandler('address')}>
  Address
</Button>
<Button loading={loading.add} color="success" variant="contained" shape="square" onClick={() => loadingHandler('add')}>
    <AddCircle />
</Button>
<Button loading={loading.submit} color="warning" variant="dashed" shape="rounded" onClick={() => loadingHandler('submit')}>
  <Send />
</Button>
<Button loading={loading.cancel} color="error" onClick={() => loadingHandler('cancel')}>
<Add style={{ transform: 'rotate(45deg)' }} />
</Button>`;

  const animationButtonCodeString = `<AnimateButton>
  <Button variant="contained">Default</Button>
</AnimateButton>
<AnimateButton scale={{ hover: 1.1, tap: 0.9 }}>
  <Button variant="contained" color="info">Scale</Button>
</AnimateButton>
<AnimateButton type="slide">
  <Button variant="contained" color="success">Slide</Button>
</AnimateButton>
<AnimateButton type="rotate">
  <Tooltip title="Rotate">
    <IconButton color="warning" variant="dashed" shape="rounded">
      <Setting2 />
    </IconButton>
  </Tooltip>
</AnimateButton>`;

  return (
    <>
      <ComponentHeader
        title="Buttons"
        caption="Buttons allow users to take actions, and make choices, with a single tap."
        directory="src/pages/components-overview/buttons"
        link="https://mui.com/material-ui/react-button/"
      />
      <ComponentWrapper>
        <Grid container spacing={GRID_COMMON_SPACING}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack sx={{ gap: GRID_COMMON_SPACING }}>
              <MainCard title="Basic Button" codeHighlight codeString={basicButtonCodeString}>
                <Grid container spacing={2}>
                  <Grid>
                    <Button variant="contained">Default</Button>
                  </Grid>
                  <Grid>
                    <Button variant="contained" color="secondary">
                      Secondary
                    </Button>
                  </Grid>
                  <Grid>
                    <Button variant="contained" color="info">
                      Info
                    </Button>
                  </Grid>
                  <Grid>
                    <Button variant="contained" color="success">
                      Success
                    </Button>
                  </Grid>
                  <Grid>
                    <Button variant="contained" color="warning">
                      Warning
                    </Button>
                  </Grid>
                  <Grid>
                    <Button variant="contained" color="error">
                      Error
                    </Button>
                  </Grid>
                </Grid>
              </MainCard>
              <MainCard title="Outlined Button" codeString={outlinedButtonCodeString}>
                <Grid container spacing={2}>
                  <Grid>
                    <Button variant="outlined">Default</Button>
                  </Grid>
                  <Grid>
                    <Button variant="outlined" color="secondary">
                      Secondary
                    </Button>
                  </Grid>
                  <Grid>
                    <Button variant="outlined" color="info">
                      Info
                    </Button>
                  </Grid>
                  <Grid>
                    <Button variant="outlined" color="success">
                      Success
                    </Button>
                  </Grid>
                  <Grid>
                    <Button variant="outlined" color="warning">
                      Warning
                    </Button>
                  </Grid>
                  <Grid>
                    <Button variant="outlined" color="error">
                      Error
                    </Button>
                  </Grid>
                </Grid>
              </MainCard>
              <MainCard title="Dashed Button" codeString={dashButtonCodeString}>
                <Grid container spacing={2}>
                  <Grid>
                    <Button variant="dashed">Default</Button>
                  </Grid>
                  <Grid>
                    <Button variant="dashed" color="secondary">
                      Secondary
                    </Button>
                  </Grid>
                  <Grid>
                    <Button variant="dashed" color="info">
                      Info
                    </Button>
                  </Grid>
                  <Grid>
                    <Button variant="dashed" color="success">
                      Success
                    </Button>
                  </Grid>
                  <Grid>
                    <Button variant="dashed" color="warning">
                      Warning
                    </Button>
                  </Grid>
                  <Grid>
                    <Button variant="dashed" color="error">
                      Error
                    </Button>
                  </Grid>
                </Grid>
              </MainCard>
              <MainCard title="Text Button" codeString={textButtonCodeString}>
                <Grid container spacing={2}>
                  <Grid>
                    <Button>Default</Button>
                  </Grid>
                  <Grid>
                    <Button color="secondary">Secondary</Button>
                  </Grid>
                  <Grid>
                    <Button color="info">Info</Button>
                  </Grid>
                  <Grid>
                    <Button color="success">Success</Button>
                  </Grid>
                  <Grid>
                    <Button color="warning">Warning</Button>
                  </Grid>
                  <Grid>
                    <Button color="error">Error</Button>
                  </Grid>
                </Grid>
              </MainCard>
              <MainCard title="Shadow Button" codeString={shadowButtonCodeString}>
                <Grid container spacing={2}>
                  <Grid>
                    <Button variant="shadow">Default</Button>
                  </Grid>
                  <Grid>
                    <Button variant="shadow" color="secondary">
                      Secondary
                    </Button>
                  </Grid>
                  <Grid>
                    <Button variant="shadow" color="info">
                      Info
                    </Button>
                  </Grid>
                  <Grid>
                    <Button variant="shadow" color="success">
                      Success
                    </Button>
                  </Grid>
                  <Grid>
                    <Button variant="shadow" color="warning">
                      Warning
                    </Button>
                  </Grid>
                  <Grid>
                    <Button variant="shadow" color="error">
                      Error
                    </Button>
                  </Grid>
                </Grid>
              </MainCard>
              <MainCard title="With Icon" codeString={withIconButtonCodeString}>
                <Grid container spacing={2}>
                  <Grid>
                    <Button variant="contained" startIcon={<Home3 />}>
                      Home
                    </Button>
                  </Grid>
                  <Grid>
                    <Button variant="contained" color="secondary" endIcon={<EmojiHappy variant="Bold" />}>
                      Profile
                    </Button>
                  </Grid>
                  <Grid>
                    <Button variant="outlined" color="info" startIcon={<Location />}>
                      Address
                    </Button>
                  </Grid>
                  <Grid>
                    <Button variant="outlined" color="success" startIcon={<AddCircle />}>
                      Add
                    </Button>
                  </Grid>
                  <Grid>
                    <Button variant="outlined" color="warning" endIcon={<Send />}>
                      Send
                    </Button>
                  </Grid>
                  <Grid>
                    <Button color="error" endIcon={<Add style={{ transform: 'rotate(45deg)' }} />}>
                      Cancel
                    </Button>
                  </Grid>
                </Grid>
              </MainCard>
              <MainCard title="Button Size" codeString={sizeButtonCodeString}>
                <Grid container spacing={2}>
                  <Grid>
                    <Button variant="contained" size="extraSmall">
                      Extra Small
                    </Button>
                  </Grid>
                  <Grid>
                    <Button variant="contained" size="small">
                      small
                    </Button>
                  </Grid>
                  <Grid>
                    <Button variant="contained">Default</Button>
                  </Grid>
                  <Grid>
                    <Button variant="contained" size="large">
                      Large
                    </Button>
                  </Grid>
                </Grid>
              </MainCard>
              <MainCard title="Upload Button" codeString={uploadButtonCodeString}>
                <Grid container spacing={2}>
                  <Grid>
                    <label htmlFor="contained-button-file">
                      <Input accept="image/*" id="contained-button-file" multiple type="file" />
                      <Button variant="contained">Upload</Button>
                    </label>
                  </Grid>
                  <Grid>
                    <label htmlFor="icon-button-file">
                      <Input accept="image/*" id="icon-button-file" type="file" />
                      <IconButton
                        variant="contained"
                        shape="rounded"
                        aria-label="upload picture"
                        sx={{ '& svg': { width: 18, height: 18 } }}
                      >
                        <Camera />
                      </IconButton>
                    </label>
                  </Grid>
                </Grid>
              </MainCard>
              <MainCard title="Disabled Button" codeString={disabledButtonCodeString}>
                <Grid container spacing={2}>
                  <Grid>
                    <Button disabled sx={{ '&:hover': { bgcolor: 'transparent' } }}>
                      Default
                    </Button>
                  </Grid>
                  <Grid>
                    <Button variant="contained" disabled sx={disableStyle}>
                      Contained
                    </Button>
                  </Grid>
                  <Grid>
                    <Button variant="outlined" disabled sx={disableStyle}>
                      Outlined
                    </Button>
                  </Grid>
                  <Grid>
                    <Button variant="dashed" color="success" disabled>
                      Dashed
                    </Button>
                  </Grid>
                  <Grid>
                    <IconButton variant="contained" disabled sx={disableStyle}>
                      <Home3 />
                    </IconButton>
                  </Grid>
                  <Grid>
                    <IconButton variant="outlined" color="success" disabled sx={disableStyle}>
                      <AddCircle />
                    </IconButton>
                  </Grid>
                  <Grid>
                    <IconButton variant="dashed" color="warning" disabled>
                      <Send />
                    </IconButton>
                  </Grid>
                  <Grid>
                    <Button loading color="secondary" disabled sx={{ '&:hover': { bgcolor: 'transparent' } }}>
                      <Add style={{ transform: 'rotate(45deg)' }} />
                    </Button>
                  </Grid>
                </Grid>
              </MainCard>
              <MainCard title="Block Level" codeString={blockButtonCodeString}>
                <Grid container spacing={2}>
                  <Grid size={6}>
                    <Button variant="contained" fullWidth>
                      Primary
                    </Button>
                  </Grid>
                  <Grid size={6}>
                    <Button variant="outlined" color="secondary" fullWidth>
                      Secondary
                    </Button>
                  </Grid>
                </Grid>
              </MainCard>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Stack sx={{ gap: GRID_COMMON_SPACING }}>
              <ToggleButtons />
              <ButtonGroups />
              <MainCard title="Fab " codeString={fabButtonCodeString}>
                <Grid container spacing={2} sx={{ alignItems: 'center' }}>
                  <Grid>
                    <Fab color="primary" aria-label="add">
                      <Add style={{ fontSize: '1.3rem' }} />
                    </Fab>
                  </Grid>
                  <Grid>
                    <Fab color="info" aria-label="edit">
                      <Edit style={{ fontSize: '1.3rem' }} />
                    </Fab>
                  </Grid>
                  <Grid>
                    <Fab disabled aria-label="like">
                      <MicrophoneSlash style={{ fontSize: '1.3rem' }} />
                    </Fab>
                  </Grid>
                  <Grid>
                    <Fab color="error" variant="extended">
                      Extended
                    </Fab>
                  </Grid>
                </Grid>
              </MainCard>

              <Typography variant="h5" sx={{ mt: 2 }}>
                Extended Button
              </Typography>
              <MainCard title="Icon Button" codeString={iconButtonCodeString}>
                <>
                  <Grid container spacing={2}>
                    <Grid>
                      <Tooltip title="Home">
                        <IconButton variant="contained">
                          <Home3 />
                        </IconButton>
                      </Tooltip>
                    </Grid>
                    <Grid>
                      <Tooltip title="Profile">
                        <IconButton variant="contained" color="secondary">
                          <EmojiHappy variant="Bold" />
                        </IconButton>
                      </Tooltip>
                    </Grid>
                    <Grid>
                      <Tooltip title="Address">
                        <IconButton variant="outlined" color="info">
                          <Location />
                        </IconButton>
                      </Tooltip>
                    </Grid>
                    <Grid>
                      <Tooltip title="Add">
                        <IconButton variant="outlined" color="success">
                          <AddCircle />
                        </IconButton>
                      </Tooltip>
                    </Grid>
                    <Grid>
                      <Tooltip title="Send">
                        <IconButton variant="dashed" color="warning">
                          <Send />
                        </IconButton>
                      </Tooltip>
                    </Grid>
                    <Grid>
                      <Tooltip title="Delete">
                        <IconButton color="error">
                          <Add style={{ transform: 'rotate(45deg)' }} />
                        </IconButton>
                      </Tooltip>
                    </Grid>
                  </Grid>
                  <Grid container spacing={2} sx={{ mt: 2 }}>
                    <Grid>
                      <Tooltip title="Home">
                        <IconButton shape="rounded" variant="contained">
                          <Home3 />
                        </IconButton>
                      </Tooltip>
                    </Grid>
                    <Grid>
                      <Tooltip title="Profile">
                        <IconButton shape="rounded" variant="contained" color="secondary">
                          <EmojiHappy variant="Bold" />
                        </IconButton>
                      </Tooltip>
                    </Grid>
                    <Grid>
                      <Tooltip title="Address">
                        <IconButton shape="rounded" variant="outlined" color="info">
                          <Location />
                        </IconButton>
                      </Tooltip>
                    </Grid>
                    <Grid>
                      <Tooltip title="Add">
                        <IconButton shape="rounded" variant="outlined" color="success">
                          <AddCircle />
                        </IconButton>
                      </Tooltip>
                    </Grid>
                    <Grid>
                      <Tooltip title="Send">
                        <IconButton shape="rounded" variant="dashed" color="warning">
                          <Send />
                        </IconButton>
                      </Tooltip>
                    </Grid>
                    <Grid>
                      <Tooltip title="Delete">
                        <IconButton shape="rounded" color="error">
                          <Add style={{ transform: 'rotate(45deg)' }} />
                        </IconButton>
                      </Tooltip>
                    </Grid>
                  </Grid>
                </>
              </MainCard>
              <MainCard title="Loading Button" codeString={loadingButtonCodeString}>
                <>
                  <Grid container spacing={2}>
                    <Grid>
                      <Button loading variant="contained" loadingPosition="start" startIcon={<Home3 />}>
                        Home
                      </Button>
                    </Grid>
                    <Grid>
                      <Button loading color="secondary" variant="outlined" loadingPosition="end" endIcon={<EmojiHappy variant="Bold" />}>
                        Edit
                      </Button>
                    </Grid>
                    <Grid>
                      <Button loading color="info" variant="dashed" loadingIndicator="Loading...">
                        Address
                      </Button>
                    </Grid>
                    <Grid>
                      <IconButton loading color="success" variant="contained">
                        <AddCircle />
                      </IconButton>
                    </Grid>
                    <Grid>
                      <IconButton loading color="warning" variant="dashed">
                        <Send />
                      </IconButton>
                    </Grid>
                    <Grid>
                      <IconButton loading color="error">
                        <Add style={{ transform: 'rotate(45deg)' }} />
                      </IconButton>
                    </Grid>
                  </Grid>
                  <Grid container spacing={2} sx={{ mt: 2 }}>
                    <Grid>
                      <Button
                        loading={loading.home}
                        variant="contained"
                        loadingPosition="start"
                        startIcon={<Home3 />}
                        onClick={() => loadingHandler('home')}
                      >
                        Home
                      </Button>
                    </Grid>
                    <Grid>
                      <Button
                        loading={loading.edit}
                        color="secondary"
                        variant="outlined"
                        loadingPosition="end"
                        endIcon={<EmojiHappy variant="Bold" />}
                        onClick={() => loadingHandler('edit')}
                      >
                        Edit
                      </Button>
                    </Grid>
                    <Grid>
                      <Button
                        loading={loading.address}
                        color="info"
                        variant="dashed"
                        loadingIndicator="Loading..."
                        onClick={() => loadingHandler('address')}
                      >
                        Address
                      </Button>
                    </Grid>
                    <Grid>
                      <Tooltip title="Add">
                        <IconButton loading={loading.add} color="success" variant="contained" onClick={() => loadingHandler('add')}>
                          <AddCircle />
                        </IconButton>
                      </Tooltip>
                    </Grid>
                    <Grid>
                      <Tooltip title="Send">
                        <IconButton loading={loading.submit} color="warning" variant="dashed" onClick={() => loadingHandler('submit')}>
                          <Send />
                        </IconButton>
                      </Tooltip>
                    </Grid>
                    <Grid>
                      <Tooltip title="Cancel">
                        <IconButton loading={loading.cancel} color="error" onClick={() => loadingHandler('cancel')}>
                          <Add style={{ transform: 'rotate(45deg)' }} />
                        </IconButton>
                      </Tooltip>
                    </Grid>
                  </Grid>
                </>
              </MainCard>
              <MainCard title="Animation" codeString={animationButtonCodeString}>
                <Grid container spacing={2}>
                  <Grid>
                    <AnimateButton>
                      <Button variant="contained">Default</Button>
                    </AnimateButton>
                  </Grid>
                  <Grid>
                    <AnimateButton
                      scale={{
                        hover: 1.1,
                        tap: 0.9
                      }}
                    >
                      <Button variant="contained" color="info">
                        Scale
                      </Button>
                    </AnimateButton>
                  </Grid>
                  <Grid>
                    <AnimateButton type="slide">
                      <Button variant="contained" color="success">
                        Slide
                      </Button>
                    </AnimateButton>
                  </Grid>
                  <Grid>
                    <AnimateButton type="rotate">
                      <Tooltip title="Rotate">
                        <IconButton color="warning" variant="dashed" shape="rounded">
                          <Setting2 />
                        </IconButton>
                      </Tooltip>
                    </AnimateButton>
                  </Grid>
                </Grid>
              </MainCard>
            </Stack>
          </Grid>
        </Grid>
      </ComponentWrapper>
    </>
  );
}
