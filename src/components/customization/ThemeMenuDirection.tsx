// material-ui
import CardMedia from '@mui/material/CardMedia';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project imports
import MainCard from 'components/MainCard';
import useConfig from 'hooks/useConfig';
import { ThemeDirection } from 'config';

const defaultLayout = '/assets/images/customization/ltr.svg';
const rtlLayout = '/assets/images/customization/rtl.svg';

const layouts = [
  { value: ThemeDirection.LTR, label: 'LTR', img: defaultLayout },
  { value: ThemeDirection.RTL, label: 'RTL', img: rtlLayout }
];

// ==============================|| CUSTOMIZATION - MENU DIRECTION ||============================== //

export default function ThemeMenuDirection() {
  const { themeDirection, onChangeDirection } = useConfig();

  const activeCardStyle = {
    borderColor: 'primary.main',
    '&:hover': { borderColor: 'primary.darker' }
  };

  const renderLayoutCard = ({ value: layoutValue, label, img }: any) => (
    <FormControlLabel
      key={layoutValue}
      value={layoutValue}
      sx={{ width: 1, m: 0, display: 'flex' }}
      control={<Radio sx={{ display: 'none' }} />}
      label={
        <Stack sx={{ gap: 0.5, alignItems: 'center' }}>
          <MainCard content={false} sx={{ borderWidth: 2, p: 1, ...(themeDirection === layoutValue && { ...activeCardStyle }) }}>
            <CardMedia component="img" src={img} alt={label} />
          </MainCard>
          <Typography variant="caption">{label}</Typography>
        </Stack>
      }
    />
  );

  return (
    <RadioGroup
      row
      aria-label="theme-layout"
      name="theme-layout"
      value={themeDirection}
      onChange={(e) => onChangeDirection(e.target.value as ThemeDirection)}
    >
      <Stack direction="row" sx={{ gap: 2.5, alignItems: 'center', width: '100%' }}>
        {layouts.map((layout) => renderLayoutCard(layout))}
      </Stack>
    </RadioGroup>
  );
}
