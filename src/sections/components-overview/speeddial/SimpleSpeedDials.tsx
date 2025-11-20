'use client';

import { useState, ChangeEvent } from 'react';

// material-ui
import FormLabel from '@mui/material/FormLabel';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import Switch from '@mui/material/Switch';
import Box from '@mui/material/Box';

// project-imports
import MainCard from 'components/MainCard';

// assets
import { Heart, Printer, Save2, Share } from '@wandersonalwes/iconsax-react';

// =============================|| SPEEDDIAL - SIMPLE ||============================= //

type direction = 'up' | 'left' | 'right' | 'down' | undefined;

export default function SimpleSpeedDials() {
  const [open, setOpen] = useState(false);

  // fab action options
  const actions = [
    { icon: <Save2 />, name: 'Save' },
    { icon: <Printer />, name: 'Print' },
    { icon: <Share />, name: 'Share' },
    { icon: <Heart />, name: 'Like' }
  ];

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const [direction, setDirection] = useState<direction>('up');
  const handleDirectionChange = (event: ChangeEvent<HTMLInputElement>) => {
    setDirection(event.target.value as direction);
  };

  const [hidden, setHidden] = useState(false);
  const handleHiddenChange = (event: ChangeEvent<HTMLInputElement>) => {
    setHidden(event.target.checked);
  };

  const basicSpeeddialCodeString = `<FormControlLabel control={<Switch checked={hidden} onChange={handleHiddenChange} color="primary" />} label="Hidden" />
<FormLabel component="legend">Direction</FormLabel>
<RadioGroup sx={{ mt: 1 }} aria-label="direction" name="direction" value={direction} onChange={handleDirectionChange} row>
  <FormControlLabel value="up" control={<Radio />} label="Up" />
  <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
    <FormControlLabel value="right" control={<Radio />} label="Right" />
  </Box>
  <FormControlLabel value="down" control={<Radio />} label="Down" />
  <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
    <FormControlLabel value="left" control={<Radio />} label="Left" />
  </Box>
</RadioGroup>
<Box sx={{ position: 'relative', marginTop: theme.spacing(3), height: 300 }}>
  <SpeedDial
    sx={{
      position: 'absolute',
      '&.MuiSpeedDial-directionUp, &.MuiSpeedDial-directionLeft': {
        bottom: theme.spacing(2),
        right: theme.spacing(2)
      },
      '&.MuiSpeedDial-directionDown, &.MuiSpeedDial-directionRight': {
        top: theme.spacing(2),
        left: theme.spacing(2)
      }
    }}
    ariaLabel="SpeedDial example"
    hidden={hidden}
    icon={<SpeedDialIcon />}
    onClose={handleClose}
    onOpen={handleOpen}
    open={open}
    direction={direction}
  >
    {actions.map((action) => (
      <SpeedDialAction key={action.name} icon={action.icon}  slotProps={{ tooltip: { title: action.name } }}  onClick={handleClose} />
    ))}
  </SpeedDial>
</Box>`;

  return (
    <MainCard title="Basic" codeString={basicSpeeddialCodeString}>
      <>
        <FormControlLabel control={<Switch checked={hidden} onChange={handleHiddenChange} color="primary" />} label="Hidden" />
        <FormLabel component="legend">Direction</FormLabel>
        <RadioGroup sx={{ mt: 1 }} aria-label="direction" name="direction" value={direction} onChange={handleDirectionChange} row>
          <FormControlLabel value="up" control={<Radio />} label="Up" />
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <FormControlLabel value="right" control={<Radio />} label="Right" />
          </Box>
          <FormControlLabel value="down" control={<Radio />} label="Down" />
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <FormControlLabel value="left" control={<Radio />} label="Left" />
          </Box>
        </RadioGroup>
        <Box sx={(theme) => ({ position: 'relative', marginTop: theme.spacing(3), height: 300 })}>
          <SpeedDial
            sx={(theme) => ({
              position: 'absolute',
              '&.MuiSpeedDial-directionUp, &.MuiSpeedDial-directionLeft': { bottom: theme.spacing(2), right: theme.spacing(2) },
              '&.MuiSpeedDial-directionDown, &.MuiSpeedDial-directionRight': { top: theme.spacing(2), left: theme.spacing(2) },
              '& .MuiSpeedDialAction-fab': { bgcolor: 'secondary.200' }
            })}
            ariaLabel="SpeedDial example"
            hidden={hidden}
            icon={<SpeedDialIcon />}
            onClose={handleClose}
            onOpen={handleOpen}
            open={open}
            direction={direction}
          >
            {actions.map((action) => (
              <SpeedDialAction key={action.name} icon={action.icon} slotProps={{ tooltip: { title: action.name } }} onClick={handleClose} />
            ))}
          </SpeedDial>
        </Box>
      </>
    </MainCard>
  );
}
