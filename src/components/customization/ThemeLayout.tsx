import { useState, ChangeEvent } from 'react';

// material-ui
import CardMedia from '@mui/material/CardMedia';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project-imports
import { handlerDrawerOpen } from 'api/menu';
import { MenuOrientation } from 'config';
import MainCard from 'components/MainCard';
import useConfig from 'hooks/useConfig';

// assets
const defaultLayout = '/assets/images/customization/ltr.svg';
const miniMenu = '/assets/images/customization/mini-menu.svg';
const horizontalLayout = '/assets/images/customization/horizontal.svg';

const layouts = [
  { value: MenuOrientation.VERTICAL, label: 'Default', img: defaultLayout },
  { value: MenuOrientation.HORIZONTAL, label: 'Horizontal', img: horizontalLayout },
  { value: 'mini', label: 'Mini Drawer', img: miniMenu }
];

// ==============================|| CUSTOMIZATION - LAYOUT ||============================== //

export default function ThemeLayout() {
  const { miniDrawer, menuOrientation, onChangeMenuOrientation, onChangeMiniDrawer } = useConfig();

  const determineInitialTheme = () => (miniDrawer ? 'mini' : menuOrientation);
  const [value, setValue] = useState(determineInitialTheme());

  const handleRadioChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setValue(newValue);

    if (newValue === 'mini') {
      onChangeMiniDrawer(true);
    }
    if (newValue === MenuOrientation.VERTICAL || newValue === MenuOrientation.HORIZONTAL) {
      onChangeMenuOrientation(newValue);
    }
    handlerDrawerOpen(newValue === 'mini' ? false : true);
  };

  const activeCardStyle = { borderColor: 'primary.main' };

  const renderLayoutCard = ({ value: layoutValue, label, img }: any) => (
    <FormControlLabel
      key={layoutValue}
      value={layoutValue}
      sx={{ width: 1, m: 0, display: 'flex' }}
      control={<Radio sx={{ display: 'none' }} />}
      label={
        <Stack sx={{ gap: 0.5, alignItems: 'center' }}>
          <MainCard content={false} sx={{ borderWidth: 2, p: 1, ...(value === layoutValue && { ...activeCardStyle }) }}>
            <CardMedia component="img" src={img} alt={label} />
          </MainCard>
          <Typography variant="caption">{label}</Typography>
        </Stack>
      }
    />
  );

  return (
    <RadioGroup row aria-label="theme-layout" name="theme-layout" value={value} onChange={handleRadioChange}>
      <Stack direction="row" sx={{ gap: 2.5, alignItems: 'center', width: '100%' }}>
        {layouts.map((layout) => renderLayoutCard(layout))}
      </Stack>
    </RadioGroup>
  );
}
