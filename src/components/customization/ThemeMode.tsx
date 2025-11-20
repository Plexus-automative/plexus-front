import { ChangeEvent } from 'react';

// material-ui
import { Theme } from '@mui/material/styles';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project-imports
import { ThemeMode } from 'config';
import MainCard from 'components/MainCard';
import useConfig from 'hooks/useConfig';

// assets
import { Moon, Setting2, Sun1 } from '@wandersonalwes/iconsax-react';

// ==============================|| CUSTOMIZATION - MODE ||============================== //

export default function ThemeModeLayout() {
  const { mode, onChangeMode } = useConfig();

  const handleModeChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChangeMode(event.target.value as ThemeMode);
  };

  return (
    <RadioGroup row aria-label="payment-card" name="payment-card" value={mode} onChange={handleModeChange}>
      <Stack direction="row" sx={{ gap: 2.5, alignItems: 'center', width: 1 }}>
        <FormControlLabel
          control={<Radio value={ThemeMode.LIGHT} sx={{ display: 'none' }} />}
          sx={{ width: 1, m: 0, display: 'flex' }}
          slotProps={{ typography: { sx: { flex: 1 } } }}
          label={
            <Stack sx={{ gap: 0.5, alignItems: 'center' }}>
              <MainCard
                content={false}
                sx={(theme: Theme) => ({ width: 1, borderWidth: 2, p: 1, ...theme.applyStyles('light', { borderColor: 'primary.main' }) })}
              >
                <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'center', height: 44, color: 'warning.main' }}>
                  <Sun1 variant="Bold" />
                </Stack>
              </MainCard>
              <Typography variant="caption">Light</Typography>
            </Stack>
          }
        />
        <FormControlLabel
          control={<Radio value={ThemeMode.DARK} sx={{ display: 'none' }} />}
          sx={{ width: 1, m: 0, display: 'flex' }}
          slotProps={{ typography: { sx: { flex: 1 } } }}
          label={
            <Stack sx={{ gap: 0.5, alignItems: 'center' }}>
              <MainCard
                content={false}
                sx={(theme: Theme) => ({ width: 1, borderWidth: 2, p: 1, ...theme.applyStyles('dark', { borderColor: 'primary.main' }) })}
              >
                <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'center', height: 44 }}>
                  <Moon variant="Bold" />
                </Stack>
              </MainCard>
              <Typography variant="caption">Dark</Typography>
            </Stack>
          }
        />
        <FormControlLabel
          control={<Radio value={ThemeMode.AUTO} sx={{ display: 'none' }} />}
          sx={{ width: 1, height: 60, m: 0, display: 'flex' }}
          slotProps={{ typography: { sx: { flex: 1 } } }}
          label={
            <Stack sx={{ gap: 0.5, alignItems: 'center' }}>
              <MainCard
                content={false}
                sx={{ width: 1, borderWidth: 2, p: 1, ...(mode === ThemeMode.AUTO && { borderColor: 'primary.main' }) }}
              >
                <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'center', height: 44 }}>
                  <Setting2 variant="Bold" />
                </Stack>
              </MainCard>
              <Typography variant="caption">Auto</Typography>
            </Stack>
          }
        />
      </Stack>
    </RadioGroup>
  );
}
