import { ReactNode, useState } from 'react';

// material-ui
import CardMedia from '@mui/material/CardMedia';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';

// assets
import { CloseCircle, SearchNormal1 } from '@wandersonalwes/iconsax-react';

interface ImagePreviewProps {
  src: string;
  alt?: string;
  showIcon?: boolean;
  hoverIcon?: ReactNode;
}

// ==============================|| IMAGE PREVIEW ||============================== //

export default function ImagePreview({ src, alt = '', showIcon = true, hoverIcon }: ImagePreviewProps) {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <>
      <Box
        onClick={() => setOpen(true)}
        sx={{
          position: 'relative',
          borderRadius: 1.5,
          overflow: 'hidden',
          cursor: 'pointer',
          '&:hover > img': { transform: 'scale(1.2)', transition: 'transform 0.3s ease-in-out' },
          '&:hover > div': { opacity: 1 }
        }}
      >
        <CardMedia component="img" src={src} alt={alt} sx={{ borderRadius: 1.5, width: 1, transition: 'transform 0.3s ease-in-out' }} />
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 1,
            height: 1,
            borderRadius: 1.5,
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0,
            transition: 'opacity 0.15s ease-in-out'
          }}
        >
          {showIcon && (hoverIcon || <SearchNormal1 size="32" color="white" />)}
        </Box>
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <Box sx={{ position: 'relative' }}>
          <IconButton onClick={() => setOpen(false)} sx={{ position: 'absolute', top: 0, right: 0, zIndex: 1 }}>
            <CloseCircle color="white" />
          </IconButton>
          <CardMedia component="img" src={src} alt={alt} sx={{ maxHeight: 700, objectFit: 'cover' }} />
        </Box>
      </Dialog>
    </>
  );
}
