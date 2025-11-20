// material-ui
import Box from '@mui/material/Box';

// ==============================|| COLOR PREVIEW ||============================== //

export default function ColorPreview({ color }: { color: string }) {
  const size = { xs: 25, lg: 30 };

  return <Box sx={{ width: size, height: size, bgcolor: color, borderRadius: '50%' }} />;
}
