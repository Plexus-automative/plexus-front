// material-ui
import Grid from '@mui/material/Grid';

// project-imports
import ImagePreview from 'components/ImagePreview';
import MainCard from 'components/MainCard';
import { GalleryImages } from './data/gallery';

// ==============================|| SOCIAL PROFILE - GALLERY ||============================== //

export default function Gallery() {
  return (
    <MainCard title="Gallery">
      <Grid container spacing={1}>
        {GalleryImages.map((img, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, lg: 4 }}>
            <ImagePreview src={img} alt={`Gallery image ${index}`} />
          </Grid>
        ))}
      </Grid>
    </MainCard>
  );
}
