import { ChangeEvent } from 'react';

// material-ui
import CardMedia from '@mui/material/CardMedia';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project-imports
import MainCard from 'components/MainCard';
import useConfig from 'hooks/useConfig';

// assets
const Caption = '/assets/images/customization/caption.svg';
const NoCaption = '/assets/images/customization/no-caption.svg';

// ==============================|| CUSTOMIZATION - MODE ||============================== //

export default function MenuCaption() {
  const { menuCaption, onChangeMenuCaption } = useConfig();

  const handleMenuCaptionChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChangeMenuCaption(event.target.value);
  };

  return (
    <RadioGroup
      row
      aria-label="payment-card"
      name="payment-card"
      value={menuCaption ? 'caption' : 'default'}
      onChange={handleMenuCaptionChange}
    >
      <Stack direction="row" sx={{ gap: 2.5, alignItems: 'center', width: 1 }}>
        <FormControlLabel
          control={<Radio value="caption" sx={{ display: 'none' }} />}
          sx={{ width: '100%', m: 0, display: 'flex' }}
          slotProps={{ typography: { sx: { flex: 1 } } }}
          label={
            <Stack sx={{ gap: 0.5, alignItems: 'center' }}>
              <MainCard content={false} sx={{ borderWidth: 2, p: 1, ...(menuCaption && { borderColor: 'primary.main' }) }}>
                <CardMedia component="img" src={Caption} alt="Caption" />
              </MainCard>
              <Typography variant="caption">Show Caption</Typography>
            </Stack>
          }
        />
        <FormControlLabel
          control={<Radio value="default" sx={{ display: 'none' }} />}
          sx={{ width: '100%', m: 0, display: 'flex' }}
          slotProps={{ typography: { sx: { flex: 1 } } }}
          label={
            <Stack sx={{ gap: 0.5, alignItems: 'center' }}>
              <MainCard content={false} sx={{ borderWidth: 2, p: 1, ...(!menuCaption && { borderColor: 'primary.main' }) }}>
                <CardMedia component="img" src={NoCaption} alt="NoCaption" />
              </MainCard>
              <Typography variant="caption">Hide Caption</Typography>
            </Stack>
          }
        />
      </Stack>
    </RadioGroup>
  );
}
