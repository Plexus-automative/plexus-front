// material-ui
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project-imports
import LinearWithLabel from 'components/@extended/progress/LinearWithLabel';
import MainCard from 'components/MainCard';

// ==============================|| STORAGE CARD ||============================== //

export default function StorageCard() {
  return (
    <MainCard sx={{ position: 'relative', bgcolor: 'primary.lighter', overflow: 'hidden' }}>
      <Box sx={{ position: 'absolute', filter: 'blur(51px)' }}>
        <Box
          sx={(theme) => ({
            width: 150,
            height: 150,
            borderRadius: '50%',
            bgcolor: 'warning.lighter',
            position: 'absolute',
            left: { xs: 205, sm: 530, md: 205 },
            bottom: -43,
            opacity: 1,
            ...theme.applyStyles('dark', { opacity: 0.8 })
          })}
        />
        <Box
          sx={(theme) => ({
            width: 100,
            height: 100,
            borderRadius: '50%',
            bgcolor: 'error.light',
            position: 'absolute',
            bottom: -217,
            left: -100,
            opacity: 1,
            ...theme.applyStyles('dark', { opacity: 0.8 })
          })}
        />
      </Box>
      <Stack sx={{ gap: 0.5 }}>
        <Typography variant="h5" color="secondary">
          20.5GB of 50GB
        </Typography>
        <LinearWithLabel value={70} />
      </Stack>
      <Button color="warning" variant="contained" sx={{ mt: 3, height: 40 }}>
        Want more storage?
      </Button>
    </MainCard>
  );
}
