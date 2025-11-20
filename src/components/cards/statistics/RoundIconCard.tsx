// material-ui
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project-imports
import Avatar from 'components/@extended/Avatar';
import MainCard from 'components/MainCard';

// types
import { SizeProps } from 'types/extended';
import { GenericCardProps } from 'types/root';

interface Props {
  primary: string;
  secondary: string;
  content: string;
  iconPrimary: GenericCardProps['iconPrimary'];
  color: string;
  bgcolor: string;
  avatarSize?: SizeProps;
  circular?: boolean;
}

// ============================|| STATISTICS - ROUND ICON CARD ||============================ //

export default function RoundIconCard({ primary, secondary, content, iconPrimary, color, bgcolor, avatarSize = 'lg', circular }: Props) {
  const IconPrimary = iconPrimary!;
  const primaryIcon = iconPrimary ? <IconPrimary /> : null;

  return (
    <MainCard>
      <Grid container sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Grid>
          <Stack sx={{ gap: 1 }}>
            <Typography variant="h5" color="inherit">
              {primary}
            </Typography>
            <Typography variant="h4">{secondary}</Typography>
            <Typography variant="subtitle2" color="inherit">
              {content}
            </Typography>
          </Stack>
        </Grid>
        <Grid>
          <Avatar variant={circular ? 'circular' : 'rounded'} sx={{ bgcolor, color }} size={avatarSize}>
            {primaryIcon}
          </Avatar>
        </Grid>
      </Grid>
    </MainCard>
  );
}
