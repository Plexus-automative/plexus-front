// material-ui
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Button from '@mui/material/Button';
import CardMedia from '@mui/material/CardMedia';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project-imports
import MainCard from 'components/MainCard';
import { ThemeMode } from 'config';

// assets
import { ArrowRight2 } from '@wandersonalwes/iconsax-react';

const imageEmpty = '/assets/images/e-commerce/empty.png';
const imageDarkEmpty = '/assets/images/e-commerce/empty-dark.png';

interface ProductEmptyProps {
  handleFilter: () => void;
}

// ==============================|| PRODUCT - EMPTY ||============================== //

export default function ProductEmpty({ handleFilter }: ProductEmptyProps) {
  const theme = useTheme();
  const downLG = useMediaQuery((theme) => theme.breakpoints.down('lg'));

  return (
    <MainCard content={false}>
      <Grid
        container
        spacing={3}
        sx={{
          alignItems: 'center',
          justifyContent: 'center',
          my: 3,
          height: { xs: 'auto', md: 'calc(100vh - 240px)' },
          p: { xs: 2.5, md: 'auto' }
        }}
      >
        <Grid>
          <CardMedia
            component="img"
            image={theme.palette.mode === ThemeMode.DARK ? imageDarkEmpty : imageEmpty}
            title="Cart Empty"
            sx={{ width: { xs: 240, md: 320, lg: 440 } }}
          />
        </Grid>
        <Grid>
          <Stack sx={{ gap: 0.5 }}>
            <Typography variant={downLG ? 'h3' : 'h1'} color="inherit">
              There is no Product
            </Typography>
            <Typography variant="h5" sx={{ color: 'text.secondary' }}>
              Try checking your spelling or use more general terms
            </Typography>
            <Box sx={{ pt: 3 }}>
              <Button variant="contained" size="large" color="error" endIcon={<ArrowRight2 />} onClick={() => handleFilter()}>
                Reset Filter
              </Button>
            </Box>
          </Stack>
        </Grid>
      </Grid>
    </MainCard>
  );
}
