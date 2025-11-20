// material-ui
import { useTheme } from '@mui/material/styles';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import useMediaQuery from '@mui/material/useMediaQuery';

// project imports
import { postImagesData } from './data/post1';
import ImagePreview from 'components/ImagePreview';

function srcset(image: string, size: number, rows = 1, cols = 1) {
  return {
    src: `${image}?w=${size * cols}&h=${size * rows}&fit=crop&auto=format`,
    srcSet: `${image}?w=${size * cols}&h=${size * rows}&fit=crop&auto=format&dpr=2 2x`
  };
}

// ==============================|| SOCIAL PROFILE - POST IMAGES ||============================== //

export default function PostImages() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  const cols = isMobile ? 1 : isTablet ? 2 : 4;

  return (
    <ImageList variant="quilted" cols={cols} gap={8}>
      {postImagesData.map((item, index) => {
        const itemCols = isMobile ? 1 : isTablet ? 1 : item.cols || 1;
        const itemRows = isMobile ? 1 : isTablet ? 1 : item.rows || 1;

        return (
          <ImageListItem key={index} cols={itemCols} rows={itemRows}>
            <ImagePreview {...srcset(item.img, 121, itemRows, itemCols)} alt={`Gallery image ${index}`} />
          </ImageListItem>
        );
      })}
    </ImageList>
  );
}
