// material-ui
import { useTheme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import CardMedia from '@mui/material/CardMedia';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

// project-imports
import MainCard from 'components/MainCard';
import { ThemeMode } from 'config';

// assets
const DomainImgLight = '/assets/images/online-panel/domain_light.svg';
const DomainImgDark = '/assets/images/online-panel/domain_dark.svg';

// ==============================|| SITE - DOMAIN ||============================== //

export default function SiteDomain() {
  const theme = useTheme();
  const ImgDomain = theme.palette.mode === ThemeMode.LIGHT ? DomainImgLight : DomainImgDark;

  return (
    <Stack direction="row" sx={{ justifyContent: 'center' }}>
      <MainCard content={false} sx={{ width: 600, p: 2.5 }}>
        <Stack sx={{ gap: 3.75, alignItems: 'center' }}>
          {/* Title Section */}
          <Stack sx={{ gap: 0.5, alignItems: 'center' }}>
            <Typography variant="h4" align="center">
              Confirm your domain
            </Typography>
            <Typography align="center" sx={{ color: 'text.secondary' }}>
              If you edit this domain, your school URL will update the next time you log out.
            </Typography>
          </Stack>

          {/* Image */}
          <CardMedia component="img" src={ImgDomain} sx={{ width: 250, height: 210 }} alt="Domain Image" />

          {/* URL Section */}
          <Stack sx={{ gap: 0.75, width: 1 }}>
            <Typography>URL</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ gap: 1.25 }}>
              <TextField
                fullWidth
                placeholder="https://admin123-20"
                variant="outlined"
                slotProps={{ input: { endAdornment: <InputAdornment position="end">.ablepro.com</InputAdornment> } }}
              />
              <Button variant="contained">Confirm</Button>
            </Stack>
          </Stack>
        </Stack>
      </MainCard>
    </Stack>
  );
}
