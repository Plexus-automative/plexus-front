'use client';

import { MouseEvent, memo } from 'react';

// material-ui
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

// project-imports
import ControlPanelStyled from 'components/third-party/map/ControlPanelStyled';

export type ModeProps = 'side-by-side' | 'split-screen';

type Props = {
  mode: ModeProps;
  onModeChange: (event: MouseEvent<HTMLElement>, newMode: ModeProps | null) => void;
};

// ==============================|| SIDE BY SIDE - CONTROL ||============================== //

function ControlPanel({ mode, onModeChange }: Props) {
  return (
    <ControlPanelStyled>
      <ToggleButtonGroup value={mode} exclusive onChange={onModeChange}>
        <ToggleButton
          sx={(theme) => ({ border: '1px solid', borderColor: 'grey.50', ...theme.applyStyles('dark', { borderColor: 'grey.700' }) })}
          value="side-by-side"
        >
          Side by side
        </ToggleButton>
        <ToggleButton
          sx={(theme) => ({ border: '1px solid', borderColor: 'grey.50', ...theme.applyStyles('dark', { borderColor: 'grey.700' }) })}
          value="split-screen"
        >
          Split screen
        </ToggleButton>
      </ToggleButtonGroup>
    </ControlPanelStyled>
  );
}

export default memo(ControlPanel);
