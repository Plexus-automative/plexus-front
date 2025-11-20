// material-ui
import CardMedia from '@mui/material/CardMedia';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// assets
const NoMailImg = '/assets/images/mail/empty-mail-img.png';

// ==============================|| MAIL EMPTY ||============================== //

export default function MailEmptyState() {
  return (
    <Stack sx={{ gap: 3, alignItems: 'center', justifyContent: 'center', height: 640 }}>
      <CardMedia component="img" src={NoMailImg} alt="no-mail" sx={{ width: 200 }} />
      <Stack sx={{ gap: 1, alignItems: 'center', textAlign: 'center' }}>
        <Typography variant="h2">There is No Mail</Typography>
        <Typography>When You have message that will Display here</Typography>
      </Stack>
    </Stack>
  );
}
