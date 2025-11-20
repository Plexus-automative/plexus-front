// material-ui
import Button, { ButtonProps } from '@mui/material/Button';
import CardMedia from '@mui/material/CardMedia';
import Chip, { ChipProps } from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project-imports
import Dot from 'components/@extended/Dot';
import MainCard from 'components/MainCard';

interface MessageActions {
  label: string;
  button: ButtonProps;
}

interface MessageCardProps {
  status: ChipProps;
  time: string;
  title: string;
  message: string;
  src: string;
  actions?: MessageActions[];
}

// ==============================|| HEADER - MESSAGE CARD ||============================== //

export default function MessageCard({ status, time, title, message, src, actions }: MessageCardProps) {
  return (
    <MainCard>
      <Grid container spacing={1.5}>
        <Grid size={12}>
          <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
            <Chip label={status.label} color={status.color} size="small" variant="light" />
            <Typography variant="caption" color="secondary">
              {time}
            </Typography>
            <Dot size={5} color="warning" />
          </Stack>
        </Grid>
        <Grid size={12}>
          <Typography variant="subtitle1">{title}</Typography>
        </Grid>
        <Grid size={12}>
          <Typography>{message}</Typography>
        </Grid>
        <Grid size={12}>
          <CardMedia component="img" src={src} alt={title} />
        </Grid>
        {actions && actions?.length > 0 && (
          <Grid sx={{ mt: 1 }} size={12}>
            <Stack direction="row" sx={{ gap: { xs: 1.5, sm: 2.5 }, alignItems: 'center' }}>
              {actions.map((item: MessageActions, index: number) => (
                <Button {...item.button} key={index}>
                  {item.label}
                </Button>
              ))}
            </Stack>
          </Grid>
        )}
      </Grid>
    </MainCard>
  );
}
