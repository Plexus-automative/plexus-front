// material-ui
import { alpha, Theme } from '@mui/material/styles';
import CardMedia from '@mui/material/CardMedia';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project-imports
import Avatar from 'components/@extended/Avatar';
import IconButton from 'components/@extended/IconButton';
import MainCard from 'components/MainCard';

// types
import { DataCardMiddleware } from 'types/org-chart';

// assets
import { Facebook } from '@wandersonalwes/iconsax-react';
const imgLinkedin = '/assets/images/icons/linkedin.svg';
const imgTwitter = '/assets/images/icons/twitterNew.svg';

// ==============================|| ORGANIZATION CHART - DATACARD ||============================== //

export default function DataCard({ name, role, avatar, linkedin, facebook, twitter, root }: DataCardMiddleware) {
  const linkHandler = (link: string) => {
    if (typeof window !== 'undefined') {
      window.open(link);
    }
  };

  return (
    <MainCard
      sx={(theme: Theme) => ({
        bgcolor: root ? alpha(theme.palette.primary.lighter, 0.6) : alpha(theme.palette.secondary.lighter, 0.4),
        border: root ? `1px solid ${theme.palette.primary.light} !important` : `1px solid ${theme.palette.divider} !important`,
        width: 'max-content',
        m: '0px auto',
        p: 1.5,
        direction: 'ltr'
      })}
      border={false}
      content={false}
    >
      <Stack direction="row" sx={{ gap: 2 }}>
        <Avatar sx={{ mt: 0.3 }} src={avatar} size="sm" />
        <Stack sx={{ gap: 1.5 }}>
          <Stack alignItems="flex-start">
            <Typography variant="subtitle1" sx={{ color: root ? 'primary.main' : 'text.primary' }}>
              {name}
            </Typography>
            {!root && (
              <Chip
                label={role}
                sx={{ '& .MuiChip-label': { px: 0.75 }, width: 'max-content' }}
                color="primary"
                variant="outlined"
                size="small"
              />
            )}
            {root && (
              <Typography sx={{ color: 'primary.darker' }} variant="caption">
                {role}
              </Typography>
            )}
          </Stack>
          <Stack direction="row">
            <IconButton color="secondary" onClick={() => linkHandler(linkedin)} size="small">
              <CardMedia component="img" sx={{ width: 18, height: 18 }} src={imgLinkedin} alt="Linkedin" />
            </IconButton>
            <IconButton color="primary" onClick={() => linkHandler(facebook)} size="small">
              <Facebook variant="Bold" />
            </IconButton>
            <IconButton color="secondary" onClick={() => linkHandler(twitter)} size="small">
              <CardMedia component="img" sx={{ width: 18, height: 18 }} src={imgTwitter} alt="Twitter" />
            </IconButton>
          </Stack>
        </Stack>
      </Stack>
    </MainCard>
  );
}
