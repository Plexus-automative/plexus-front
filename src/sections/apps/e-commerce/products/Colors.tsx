import { useEffect, useState } from 'react';

// material-ui
import ButtonBase from '@mui/material/ButtonBase';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

// project-imports
import ColorOptions from './ColorOptions';
import Avatar from 'components/@extended/Avatar';

// types
import { ColorsOptionsProps } from 'types/e-commerce';

interface ColorProps {
  bg: string;
  id: string;
  colors: string[];
  label: string;
  handleFilter: (type: string, params: string) => void;
}

// ==============================|| PRODUCT - COLOR ||============================== //

function Color({ bg, id, colors, label, handleFilter }: ColorProps) {
  return (
    <Grid>
      <Tooltip title={label}>
        <ButtonBase
          sx={(theme) => ({
            borderRadius: '50%',
            '&:focus-visible': { outline: `2px solid ${theme.palette.secondary.dark}`, outlineOffset: 2 }
          })}
          onClick={() => handleFilter('colors', id)}
        >
          <Avatar
            color="inherit"
            size="sm"
            sx={(theme) => ({
              bgcolor: bg,
              color: 'secondary.lighter',
              ...theme.applyStyles('dark', {
                color: 'secondary.800'
              }),
              border: '3px solid',
              borderColor: colors.some((item: string) => item === id) ? 'secondary.light' : 'background.paper'
            })}
          >
            {' '}
          </Avatar>
        </ButtonBase>
      </Tooltip>
    </Grid>
  );
}

// ==============================|| PRODUCT - COLOR ||============================== //

export default function Colors({ colors, handleFilter }: { colors: string[]; handleFilter: (type: string, params: string) => void }) {
  const [isColorsLoading, setColorLoading] = useState(true);
  useEffect(() => {
    setColorLoading(false);
  }, []);

  return (
    <>
      {isColorsLoading ? (
        <Grid size={12}>
          <Skeleton variant="rectangular" width="100%" height={158} />
        </Grid>
      ) : (
        <Stack>
          <Typography variant="h5" sx={{ mb: 1 }}>
            Color
          </Typography>
          <Grid container spacing={1.5} sx={{ alignItems: 'center' }}>
            {ColorOptions.map((color: ColorsOptionsProps, index) => (
              <Color key={index} id={color.value} bg={color.bg} label={color.label} colors={colors} handleFilter={handleFilter} />
            ))}
          </Grid>
        </Stack>
      )}
    </>
  );
}
