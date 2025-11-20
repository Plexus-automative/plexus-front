// material-ui
import FormGroup from '@mui/material/FormGroup';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import Switch from '@mui/material/Switch';

// project-imports
import ComponentHeader from 'components/cards/ComponentHeader';
import MainCard from 'components/MainCard';
import { GRID_COMMON_SPACING } from 'config';

import ComponentWrapper from 'sections/components-overview/ComponentWrapper';
import CustomizedSwitches from 'sections/components-overview/switch/CustomizedSwitches';

// ==============================|| COMPONENTS - SWITCH ||============================== //

export default function ComponentSwitch() {
  const basicSwitchCodeString = `<Switch defaultChecked />
<Switch />
<Switch defaultChecked disabled />
<Switch disabled />`;

  const colorSwitchCodeString = `<Switch defaultChecked />
<Switch defaultChecked color="secondary" />
<Switch defaultChecked color="success" />
<Switch defaultChecked color="warning" />
<Switch defaultChecked color="info" />
<Switch defaultChecked color="error" />`;

  const sizeSwitchCodeString = `<Switch defaultChecked size="small" />
<Switch defaultChecked />
<Switch defaultChecked size="large" />`;

  const groupSwitchCodeString = `<FormControl component="fieldset">
  <FormGroup aria-label="position" row>
    <FormControlLabel control={<Switch defaultChecked />} label="Primary" labelPlacement="end" />
    <FormControlLabel control={<Switch defaultChecked disabled />} label="Disabled" />
    <FormControlLabel control={<Switch defaultChecked color="secondary" />} label="Secondary" />
  </FormGroup>
</FormControl>`;

  const labelSwitchCodeString = `<FormControl component="fieldset">
  <FormGroup aria-label="position" row sx={{ justifyContent: 'space-between' }}>
    <FormControlLabel value="top" control={<Switch color="primary" />} label="Top" labelPlacement="top" />
    <FormControlLabel
      value="start"
      control={<Switch color="primary" />}
      label="Start"
      labelPlacement="start"
      sx={{ mr: 1 }}
    />
    <FormControlLabel value="bottom" control={<Switch color="primary" />} label="Bottom" labelPlacement="bottom" />

    <FormControlLabel value="end" control={<Switch color="primary" />} label="End" labelPlacement="end" sx={{ ml: 1 }} />
  </FormGroup>
</FormControl>`;

  return (
    <>
      <ComponentHeader
        title="Switch"
        caption="Switches toggle the state of a single setting on or off."
        directory="src/pages/components-overview/switch"
        link="https://mui.com/material-ui/react-switch/"
      />
      <ComponentWrapper>
        <Grid container spacing={GRID_COMMON_SPACING}>
          <Grid size={{ xs: 12, lg: 6 }}>
            <MainCard title="Basic" codeHighlight codeString={basicSwitchCodeString}>
              <Grid container spacing={0.5}>
                <Grid>
                  <Switch defaultChecked />
                </Grid>
                <Grid>
                  <Switch />
                </Grid>
                <Grid>
                  <Switch defaultChecked disabled />
                </Grid>
                <Grid>
                  <Switch disabled />
                </Grid>
              </Grid>
            </MainCard>
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <MainCard title="Color" codeString={colorSwitchCodeString}>
              <Grid container spacing={0.5}>
                <Grid>
                  <Switch defaultChecked />
                </Grid>
                <Grid>
                  <Switch defaultChecked color="secondary" />
                </Grid>
                <Grid>
                  <Switch defaultChecked color="success" />
                </Grid>
                <Grid>
                  <Switch defaultChecked color="warning" />
                </Grid>
                <Grid>
                  <Switch defaultChecked color="info" />
                </Grid>
                <Grid>
                  <Switch defaultChecked color="error" />
                </Grid>
              </Grid>
            </MainCard>
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <MainCard title="Sizes" codeString={sizeSwitchCodeString}>
              <Grid container spacing={0.5} sx={{ alignItems: 'center' }}>
                <Grid>
                  <Switch defaultChecked size="small" />
                </Grid>
                <Grid>
                  <Switch defaultChecked />
                </Grid>
                <Grid>
                  <Switch defaultChecked size="large" />
                </Grid>
              </Grid>
            </MainCard>
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <MainCard title="With Form Group" codeString={groupSwitchCodeString}>
              <FormControl component="fieldset">
                <FormGroup aria-label="position" row>
                  <FormControlLabel control={<Switch defaultChecked />} label="Primary" labelPlacement="end" />
                  <FormControlLabel control={<Switch defaultChecked disabled />} label="Disabled" />
                  <FormControlLabel control={<Switch defaultChecked color="secondary" />} label="Secondary" />
                </FormGroup>
              </FormControl>
            </MainCard>
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <MainCard title="Label Placement" codeString={labelSwitchCodeString}>
              <FormControl component="fieldset">
                <FormGroup aria-label="position" row sx={{ justifyContent: 'space-between' }}>
                  <FormControlLabel value="top" control={<Switch color="primary" />} label="Top" labelPlacement="top" />
                  <FormControlLabel
                    value="start"
                    control={<Switch color="primary" />}
                    label="Start"
                    labelPlacement="start"
                    sx={{ mr: 1 }}
                  />
                  <FormControlLabel value="bottom" control={<Switch color="primary" />} label="Bottom" labelPlacement="bottom" />

                  <FormControlLabel value="end" control={<Switch color="primary" />} label="End" labelPlacement="end" sx={{ ml: 1 }} />
                </FormGroup>
              </FormControl>
            </MainCard>
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <CustomizedSwitches />
          </Grid>
        </Grid>
      </ComponentWrapper>
    </>
  );
}
