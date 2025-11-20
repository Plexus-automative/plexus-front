import { ChangeEvent } from 'react';

// material-ui
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project-imports
import MainCard from 'components/MainCard';
import useConfig from 'hooks/useConfig';

// assets
import { Mask } from '@wandersonalwes/iconsax-react';

// ==============================|| CUSTOMIZATION - MODE ||============================== //

export default function ThemeContrast() {
  const { themeContrast, onChangeContrast } = useConfig();

  const handleContrastChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChangeContrast(event.target.value);
  };

  return (
    <RadioGroup
      row
      aria-label="payment-card"
      name="payment-card"
      value={themeContrast ? 'contrast' : 'default'}
      onChange={handleContrastChange}
    >
      <Stack direction="row" sx={{ gap: 2.5, alignItems: 'center', width: 1 }}>
        <FormControlLabel
          control={<Radio value="contrast" sx={{ display: 'none' }} />}
          sx={{ width: 1, m: 0, display: 'flex' }}
          slotProps={{ typography: { sx: { flex: 1 } } }}
          label={
            <Stack sx={{ gap: 0.5, alignItems: 'center' }}>
              <MainCard content={false} sx={{ width: '100%', borderWidth: 2, p: 1, ...(themeContrast && { borderColor: 'primary.main' }) }}>
                <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'center', height: 44 }}>
                  <Mask variant="Bold" />
                </Stack>
              </MainCard>
              <Typography variant="caption">Contrast</Typography>
            </Stack>
          }
        />
        <FormControlLabel
          control={<Radio value="default" sx={{ display: 'none' }} />}
          sx={{ width: 1, m: 0, display: 'flex' }}
          slotProps={{ typography: { sx: { flex: 1 } } }}
          label={
            <Stack sx={{ gap: 0.5, alignItems: 'center' }}>
              <MainCard
                content={false}
                sx={{ width: '100%', borderWidth: 2, p: 1, ...(!themeContrast && { borderColor: 'primary.main' }) }}
              >
                <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'center', height: 44 }}>
                  <Mask />
                </Stack>
              </MainCard>
              <Typography variant="caption">No Contrast</Typography>
            </Stack>
          }
        />
      </Stack>
    </RadioGroup>
  );
}
