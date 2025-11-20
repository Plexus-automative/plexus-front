// material-ui
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project-imports
import MainCard from 'components/MainCard';

// types
import { SocialSourceCardProps } from 'types/helpdesk';

// ==============================|| SOCIAL SOURCE CARD ||============================== //

export default function SocialSourceCard({ title, progressData, color }: SocialSourceCardProps) {
  return (
    <MainCard title={title}>
      <Stack sx={{ gap: 3 }}>
        {progressData.map((item, index) => (
          <Stack key={index} sx={{ gap: 1.25 }}>
            <Typography>{item.label}</Typography>
            <LinearProgress variant="determinate" color={color} value={item.value} sx={{ bgcolor: 'secondary.lighter' }} />
          </Stack>
        ))}
      </Stack>
    </MainCard>
  );
}
