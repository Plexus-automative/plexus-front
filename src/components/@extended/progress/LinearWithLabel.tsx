// material-ui
import LinearProgress, { LinearProgressProps } from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// ==============================|| PROGRESS - LINEAR WITH LABEL ||============================== //

export default function LinearWithLabel({ value, ...others }: LinearProgressProps) {
  return (
    <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
      <Box sx={{ width: 1 }}>
        <LinearProgress variant="determinate" value={value} {...others} />
      </Box>
      <Typography variant="body2" sx={{ color: 'text.secondary', minWidth: 35 }}>
        {`${Math.round(value!)}%`}
      </Typography>
    </Stack>
  );
}
