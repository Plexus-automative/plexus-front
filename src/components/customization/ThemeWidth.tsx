import { ChangeEvent } from 'react';

// material-ui
import useMediaQuery from '@mui/material/useMediaQuery';
import CardMedia from '@mui/material/CardMedia';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

// project-imports
import MainCard from 'components/MainCard';
import useConfig from 'hooks/useConfig';

// assets
const defaultLayout = '/assets/images/customization/fluid.svg';
const containerLayout = '/assets/images/customization/container.svg';

// ==============================|| CUSTOMIZATION - CONTAINER ||============================== //

export default function ThemeWidth() {
  const { container, onChangeContainer } = useConfig();
  const downXL = useMediaQuery((theme) => theme.breakpoints.down('xl'));

  const handleContainerChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChangeContainer(event.target.value);
  };

  return (
    <RadioGroup
      row
      aria-label="payment-card"
      name="payment-card"
      value={container && !downXL ? 'container' : 'fluid'}
      onChange={handleContainerChange}
    >
      <Stack direction="row" sx={{ gap: 2.5, alignItems: 'center', width: '100%' }}>
        <FormControlLabel
          control={<Radio value="fluid" sx={{ display: 'none' }} />}
          sx={{ width: '100%', m: 0, display: 'flex' }}
          slotProps={{ typography: { sx: { flex: 1 } } }}
          label={
            <Stack sx={{ gap: 0.5, alignItems: 'center' }}>
              <MainCard content={false} sx={{ borderWidth: 2, p: 1, ...((!container || downXL) && { borderColor: 'primary.main' }) }}>
                <CardMedia component="img" src={defaultLayout} alt="defaultLayout" />
              </MainCard>
              <Typography variant="caption">Fluid</Typography>
            </Stack>
          }
        />
        <Tooltip
          title={downXL && 'A container layout is not necessary for laptops or tablets.'}
          placement="top-start"
          arrow
          slotProps={{
            popper: { disablePortal: true },
            arrow: {
              sx: {
                color: 'text.primary'
              }
            }
          }}
        >
          <FormControlLabel
            control={<Radio value="container" sx={{ display: 'none' }} />}
            disabled={downXL}
            sx={(theme) => ({
              width: 1,
              m: 0,
              display: 'flex',
              ...theme.applyStyles('dark', { '& .MuiFormControlLabel-label.Mui-disabled': { color: 'text.secondary' } })
            })}
            slotProps={{ typography: { sx: { flex: 1 } } }}
            label={
              <Stack sx={{ gap: 0.5, alignItems: 'center' }}>
                <MainCard content={false} sx={{ borderWidth: 2, p: 1, ...(container && !downXL && { borderColor: 'primary.main' }) }}>
                  <CardMedia component="img" src={containerLayout} alt="defaultLayout" sx={{ ...(downXL && { filter: 'blur(4px)' }) }} />
                </MainCard>
                <Typography variant="caption">Container</Typography>
              </Stack>
            }
          />
        </Tooltip>
      </Stack>
    </RadioGroup>
  );
}
