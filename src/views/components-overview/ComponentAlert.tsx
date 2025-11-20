'use client';

// material-ui
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project-imports
import ComponentHeader from 'components/cards/ComponentHeader';
import MainCard from 'components/MainCard';
import { GRID_COMMON_SPACING } from 'config';

import ComponentWrapper from 'sections/components-overview/ComponentWrapper';

// assets
import { Coin, Ethereum, InfoCircle, MessageQuestion, TickSquare, Warning2 } from '@wandersonalwes/iconsax-react';

// ==============================|| COMPONENTS - ALERTS ||============================== //

export default function ComponentAlert() {
  const commonAlertStyles = { '.MuiAlert-message': { lineHeight: 2 }, '.MuiAlert-action': { mt: '3px' } };

  const basicAlertCodeString = `<Alert severity="primary" icon={<MessageQuestion variant="Bold" />}>
  Primary Text
</Alert>
<Alert severity="secondary" icon={<Coin />}>
  Secondary Text
</Alert>
<Alert severity="success" icon={<CheckSquareFilled />}>
  Success Text
</Alert>
<Alert severity="warning" icon={<Warning2 variant="Bold" />}>
  Warning Text
</Alert>
<Alert severity="info" icon={<InfoCircle variant="Bold" />}>
  Info Text
</Alert>
<Alert severity="error" icon={<Ethereum variant="Bold" />}>
  Error Text
</Alert>`;

  const actionsAlertCodeString = `<Alert variant="border" severity="success" onClose={() => {}}>
  Success Text
</Alert>
<Alert
  variant="border"
  severity="warning"
  icon={<Warning2 />}
  action={
    <Button color="warning" size="small">
      Undo
    </Button>
  }
>
  Warning Text
</Alert>
<Alert
  variant="border"
  severity="primary"
  icon={<MessageQuestion />}
  action={
    <Button variant="contained" size="small">
      Continue
    </Button>
  }
>
  Primary Text
</Alert>`;

  const filledAlertCodeString = `<Alert severity="primary" variant="filled" icon={<MessageQuestion variant="Bold" />}>
  Primary Text
</Alert>
<Alert severity="secondary" variant="filled" icon={<Coin />}>
  Secondary Text
</Alert>
<Alert severity="success" variant="filled" icon={<CheckSquareFilled />}>
  Success Text
</Alert>
<Alert severity="warning" variant="filled" icon={<Warning2 variant="Bold" />}>
  Warning Text
</Alert>
<Alert severity="info" variant="filled" icon={<InfoCircle variant="Bold" />}>
  Info Text
</Alert>
<Alert severity="error" variant="filled" icon={<Ethereum variant="Bold" />}>
  Error Text
</Alert>`;

  const descriptionAlertCodeString = `<Alert severity="primary" variant="border" icon={<MessageQuestion variant="Bold" />}>
  <AlertTitle>Primary Text</AlertTitle>
  <Typography variant="h6"> This is an primary alert.</Typography>
</Alert>
<Alert severity="secondary" variant="border" icon={<Coin />}>
  <AlertTitle>Secondary Text</AlertTitle>
  <Typography variant="h6"> This is an secondary alert.</Typography>
</Alert>
<Alert severity="success" variant="border" icon={<CheckSquareFilled />}>
  <AlertTitle>Success Text</AlertTitle>
  <Typography variant="h6"> This is an success alert.</Typography>
</Alert>
<Alert severity="warning" variant="border" icon={<Warning2 variant="Bold" />}>
  <AlertTitle>Warning Text</AlertTitle>
  <Typography variant="h6"> This is an warning alert.</Typography>
</Alert>
<Alert severity="info" variant="border" icon={<InfoCircle variant='Bold' />}>
  <AlertTitle>Info Text</AlertTitle>
  <Typography variant="h6"> This is an info alert.</Typography>
</Alert>
<Alert severity="error" variant="border" icon={<Ethereum variant="Bold" />}>
  <AlertTitle>Error Text</AlertTitle>
  <Typography variant="h6"> This is an error alert.</Typography>
</Alert>`;

  const outlinedAlertCodeString = `<Alert severity="primary" variant="outlined" icon={<MessageQuestion />}>
  Primary Text
</Alert>
<Alert severity="secondary" variant="outlined" icon={<Coin />}>
  Secondary Text
</Alert>
<Alert severity="success" variant="outlined" icon={<TickSquare />}>
  Success Text
</Alert>
<Alert severity="warning" variant="outlined" icon={<Warning2 />}>
  Warning Text
</Alert>
<Alert severity="info" variant="outlined" icon={<InfoCircle />}>
  Info Text
</Alert>
<Alert severity="error" variant="outlined" icon={<Ethereum />}>
  Error Text
</Alert>`;

  return (
    <>
      <ComponentHeader
        title="Alert"
        caption="An alert displays a short, important message in a way that attracts the user's attention without interrupting the user's task."
        directory="src/pages/components-overview/alert"
        link="https://mui.com/material-ui/react-alert/"
      />
      <ComponentWrapper>
        <Grid container spacing={GRID_COMMON_SPACING}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack sx={{ gap: GRID_COMMON_SPACING }}>
              <MainCard title="Basic" codeHighlight codeString={basicAlertCodeString}>
                <Stack sx={{ gap: 2, width: 1 }}>
                  <Alert severity="primary" icon={<MessageQuestion variant="Bold" />}>
                    Primary Text
                  </Alert>
                  <Alert severity="secondary" icon={<Coin />}>
                    Secondary Text
                  </Alert>
                  <Alert severity="success" icon={<TickSquare variant="Bold" />}>
                    Success Text
                  </Alert>
                  <Alert severity="warning" icon={<Warning2 variant="Bold" />}>
                    Warning Text
                  </Alert>
                  <Alert severity="info" icon={<InfoCircle variant="Bold" />}>
                    Info Text
                  </Alert>
                  <Alert severity="error" icon={<Ethereum variant="Bold" />}>
                    Error Text
                  </Alert>
                </Stack>
              </MainCard>
              <MainCard title="Actions" codeString={actionsAlertCodeString}>
                <Stack sx={{ gap: 2, width: 1 }}>
                  <Alert
                    variant="border"
                    severity="success"
                    onClose={() => {}}
                    sx={(theme) => ({
                      ...commonAlertStyles,
                      '& .MuiIconButton-root:focus-visible': {
                        outline: `2px solid ${theme.palette.success.dark}`,
                        outlineOffset: 2
                      }
                    })}
                  >
                    Success Text
                  </Alert>
                  <Alert
                    variant="border"
                    severity="warning"
                    icon={<Warning2 />}
                    sx={{ ...commonAlertStyles }}
                    action={
                      <Button color="warning" size="small" sx={{ color: 'warning.darker' }}>
                        Undo
                      </Button>
                    }
                  >
                    Warning Text
                  </Alert>
                  <Alert
                    variant="border"
                    severity="primary"
                    icon={<MessageQuestion />}
                    sx={{ ...commonAlertStyles }}
                    action={
                      <Button variant="contained" size="small">
                        Continue
                      </Button>
                    }
                  >
                    Primary Text
                  </Alert>
                </Stack>
              </MainCard>
              <MainCard title="Filled" codeString={filledAlertCodeString}>
                <Stack sx={{ gap: 2, width: 1 }}>
                  <Alert severity="primary" variant="filled" icon={<MessageQuestion variant="Bold" />}>
                    Primary Text
                  </Alert>
                  <Alert severity="secondary" variant="filled" icon={<Coin />}>
                    Secondary Text
                  </Alert>
                  <Alert severity="success" variant="filled" icon={<TickSquare variant="Bold" />}>
                    Success Text
                  </Alert>
                  <Alert severity="warning" variant="filled" icon={<Warning2 variant="Bold" />}>
                    Warning Text
                  </Alert>
                  <Alert severity="info" variant="filled" icon={<InfoCircle variant="Bold" />}>
                    Info Text
                  </Alert>
                  <Alert severity="error" variant="filled" icon={<Ethereum variant="Bold" />}>
                    Error Text
                  </Alert>
                </Stack>
              </MainCard>
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack sx={{ gap: GRID_COMMON_SPACING }}>
              <MainCard title="Description" codeString={descriptionAlertCodeString}>
                <Stack sx={{ gap: 2, width: 1 }}>
                  <Alert severity="primary" variant="border" icon={<MessageQuestion variant="Bold" />}>
                    <AlertTitle>Primary Text</AlertTitle>
                    <Typography variant="h6"> This is an primary alert.</Typography>
                  </Alert>
                  <Alert severity="secondary" variant="border" icon={<Coin />}>
                    <AlertTitle>Secondary Text</AlertTitle>
                    <Typography variant="h6"> This is an secondary alert.</Typography>
                  </Alert>
                  <Alert severity="success" variant="border" icon={<TickSquare variant="Bold" />}>
                    <AlertTitle>Success Text</AlertTitle>
                    <Typography variant="h6"> This is an success alert.</Typography>
                  </Alert>
                  <Alert severity="warning" variant="border" icon={<Warning2 variant="Bold" />}>
                    <AlertTitle>Warning Text</AlertTitle>
                    <Typography variant="h6"> This is an warning alert.</Typography>
                  </Alert>
                  <Alert severity="info" variant="border" icon={<InfoCircle variant="Bold" />}>
                    <AlertTitle>Info Text</AlertTitle>
                    <Typography variant="h6"> This is an info alert.</Typography>
                  </Alert>
                  <Alert severity="error" variant="border" icon={<Ethereum variant="Bold" />}>
                    <AlertTitle>Error Text</AlertTitle>
                    <Typography variant="h6"> This is an error alert.</Typography>
                  </Alert>
                </Stack>
              </MainCard>
              <MainCard title="Outlined" codeString={outlinedAlertCodeString}>
                <Stack sx={{ gap: 2, width: 1 }}>
                  <Alert severity="primary" variant="outlined" icon={<MessageQuestion />}>
                    Primary Text
                  </Alert>
                  <Alert severity="secondary" variant="outlined" icon={<Coin />}>
                    Secondary Text
                  </Alert>
                  <Alert severity="success" variant="outlined" icon={<TickSquare />}>
                    Success Text
                  </Alert>
                  <Alert severity="warning" variant="outlined" icon={<Warning2 />}>
                    Warning Text
                  </Alert>
                  <Alert severity="info" variant="outlined" icon={<InfoCircle />}>
                    Info Text
                  </Alert>
                  <Alert severity="error" variant="outlined" icon={<Ethereum />}>
                    Error Text
                  </Alert>
                </Stack>
              </MainCard>
            </Stack>
          </Grid>
        </Grid>
      </ComponentWrapper>
    </>
  );
}
