'use client';

// material-ui
import { Theme } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project-imports
import Avatar from 'components/@extended/Avatar';
import MainCard from 'components/MainCard';

// assets
import { ArrowSwapHorizontal } from '@wandersonalwes/iconsax-react';

export default function SwitchBalanace() {
  return (
    <MainCard
      content={false}
      sx={(theme: Theme) => ({
        bgcolor: 'primary.main',
        color: 'background.paper',
        ...theme.applyStyles('dark', { color: 'text.primary' }),
        '&:after': {
          content: '""',
          background: `linear-gradient(245deg, transparent 25.46%, rgba(0, 0, 0, 0.2) 68.77%, rgba(0, 0, 0, 0.3) 81.72%)`,
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1,
          opacity: 0.6
        }
      })}
    >
      <Box sx={{ p: 2, position: 'inherit', zIndex: 2 }}>
        <Stack direction="row" sx={{ gap: 1, alignItems: 'center', justifyContent: 'space-between' }}>
          <Stack>
            <Typography>Available Balance</Typography>
            <Typography variant="h4">$1,234.90</Typography>
          </Stack>
          <Avatar
            variant="rounded"
            type="filled"
            size="lg"
            sx={(theme) => ({ bgcolor: 'primary.darker', ...theme.applyStyles('dark', { bgcolor: 'primary.100' }) })}
          >
            <ArrowSwapHorizontal />
          </Avatar>
        </Stack>
      </Box>
    </MainCard>
  );
}
