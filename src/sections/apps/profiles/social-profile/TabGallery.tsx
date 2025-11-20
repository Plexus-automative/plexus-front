// material-ui
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';

// project-imports
import { tabGalleryData } from './data/tab-gallery';
import ImagePreview from 'components/ImagePreview';
import MainCard from 'components/MainCard';

// assets
import { CloudPlus } from '@wandersonalwes/iconsax-react';

function srcset(image: string, size: number, rows = 1, cols = 1) {
  return {
    src: `${image}?w=${size * cols}&h=${size * rows}&fit=crop&auto=format`,
    srcSet: `${image}?w=${size * cols}&h=${size * rows}&fit=crop&auto=format&dpr=2 2x`
  };
}

// ==============================|| SOCIAL PROFILE - TAB GALLERY ||============================== //

export default function TabGallery() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <MainCard title="Gallery">
      <ImageList variant="quilted" cols={12} gap={8}>
        {tabGalleryData.map((item, index) => (
          <ImageListItem key={index} cols={isMobile ? 12 : item.cols || 6} rows={item.rows || 1}>
            <ImagePreview
              {...srcset(item.img, 121, item.rows, isMobile ? 12 : item.cols)}
              alt={`Gallery image ${index}`}
              hoverIcon={<CloudPlus size="32" color="white" />}
            />
          </ImageListItem>
        ))}
      </ImageList>
    </MainCard>
  );
}
