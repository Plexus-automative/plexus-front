import { useCallback, useEffect, useState } from 'react';

// material-ui
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';

// project-imports
import IconButton from 'components/@extended/IconButton';

// assets
import { Maximize1 } from '@wandersonalwes/iconsax-react';

// ==============================|| HEADER CONTENT - FULLSCREEN ||============================== //

export default function FullScreen() {
  const [open, setOpen] = useState(false);

  const handleToggle = useCallback(() => {
    if (document && !document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setOpen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <Box sx={{ flexShrink: 0, ml: 0.75 }}>
      <Tooltip title={open ? 'Exit Fullscreen' : 'Fullscreen'}>
        <IconButton
          color="secondary"
          variant="light"
          onClick={handleToggle}
          size="large"
          sx={(theme) => ({
            p: 1,
            color: 'secondary.main',
            bgcolor: open ? 'secondary.200' : 'secondary.100',
            ...theme.applyStyles('dark', { bgcolor: open ? 'background.paper' : 'background.default' })
          })}
        >
          <Maximize1 variant="Bulk" {...(open && { style: { transform: 'rotate(180deg)' } })} />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
