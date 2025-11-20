import { useEffect, useState } from 'react';

// material-ui
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import CardMedia from '@mui/material/CardMedia';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';

// project-imports
import { openSnackbar } from 'api/snackbar';
import Avatar from 'components/@extended/Avatar';
import IconButton from 'components/@extended/IconButton';
import MainCard from 'components/MainCard';

// third-party
import Slider from 'react-slick';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

// assets
import { ArrowLeft2, ArrowRight2, ArrowRotateRight, Heart, SearchZoomIn, SearchZoomOut } from '@wandersonalwes/iconsax-react';

// types
import { SnackbarProps } from 'types/snackbar';
import { Products } from 'types/e-commerce';

const prodImage: any = '/assets/images/e-commerce';

// ==============================|| PRODUCT DETAILS - IMAGES ||============================== //

export default function ProductImages({ product }: { product: Products }) {
  const upLG = useMediaQuery((theme) => theme.breakpoints.up('lg'));

  const [selected, setSelected] = useState('');
  const [modal, setModal] = useState(false);

  useEffect(() => {
    setSelected(product && product?.image ? `${prodImage}/${product.image}` : '');
  }, [product]);

  const [wishlisted, setWishlisted] = useState<boolean>(false);
  const addToFavourite = () => {
    setWishlisted(!wishlisted);
    openSnackbar({
      open: true,
      message: !wishlisted ? 'Added to favourites' : 'Removed from favourites',
      variant: 'alert',
      alert: { color: 'success' }
    } as SnackbarProps);
  };

  const ArrowUp = ({ currentSlide, slideCount, ...props }: any) => (
    <Box
      {...props}
      className={'prev' + (currentSlide === 0 ? ' slick-disabled' : '')}
      aria-hidden="true"
      aria-disabled={currentSlide === 0 && slideCount !== 0 ? true : false}
      sx={{ color: 'secondary.light', cursor: 'pointer', borderRadius: 1 }}
    >
      <ArrowLeft2 />
    </Box>
  );

  const ArrowDown = ({ currentSlide, slideCount, ...props }: any) => (
    <Box
      {...props}
      className={'next' + (currentSlide === slideCount - 1 ? ' slick-disabled' : '')}
      aria-hidden="true"
      aria-disabled={currentSlide === slideCount - 1 ? true : false}
      sx={{ color: 'secondary.400', cursor: 'pointer', borderRadius: 1, p: 0.75 }}
    >
      <ArrowRight2 size={18} />
    </Box>
  );

  const settings = {
    rows: 1,
    dots: false,
    centerMode: true,
    swipeToSlide: true,
    focusOnSelect: true,
    centerPadding: '0px',
    slidesToShow: upLG ? 5 : 4,
    prevArrow: <ArrowUp />,
    nextArrow: <ArrowDown />
  };

  return (
    <>
      <Grid container spacing={0.5}>
        <Grid size={12}>
          <MainCard
            content={false}
            border={false}
            boxShadow={false}
            sx={(theme: Theme) => ({
              m: '0 auto',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              bgcolor: 'secondary.200',
              ...theme.applyStyles('dark', { bgcolor: 'secondary.lighter' }),
              '& .react-transform-wrapper': { cursor: 'crosshair', height: '100%' },
              '& .react-transform-component': { height: '100%' }
            })}
          >
            <TransformWrapper initialScale={1}>
              {({ zoomIn, zoomOut, resetTransform }) => (
                <>
                  <TransformComponent>
                    <CardMedia
                      onClick={() => setModal(!modal)}
                      component="img"
                      image={selected}
                      title="Scroll Zoom"
                      sx={{ borderRadius: `4px`, position: 'relative' }}
                    />
                  </TransformComponent>
                  <Stack direction="row" className="tools" sx={{ position: 'absolute', bottom: 10, right: 10, zIndex: 1 }}>
                    <IconButton color="secondary" onClick={() => zoomIn()}>
                      <SearchZoomIn style={{ fontSize: '1.15rem' }} />
                    </IconButton>
                    <IconButton color="secondary" onClick={() => zoomOut()}>
                      <SearchZoomOut style={{ fontSize: '1.15rem' }} />
                    </IconButton>
                    <IconButton color="secondary" onClick={() => resetTransform()}>
                      <ArrowRotateRight style={{ fontSize: '1.15rem' }} />
                    </IconButton>
                  </Stack>
                </>
              )}
            </TransformWrapper>
            <IconButton
              color={wishlisted ? 'error' : 'secondary'}
              sx={{ ml: 'auto', position: 'absolute', top: 12, right: 12, '&:hover': { bgcolor: 'transparent' } }}
              onClick={addToFavourite}
            >
              <Heart variant={wishlisted ? 'Bold' : 'Linear'} />
            </IconButton>
          </MainCard>
        </Grid>
        <Grid size={12}>
          <Box sx={{ '& .slick-slider': { display: 'flex', alignItems: 'center', mt: 2 } }}>
            <Slider {...settings}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((item, index) => (
                <Box key={index} onClick={() => setSelected(`${prodImage}/prod-${item}.png`)} sx={{ p: 1 }}>
                  <Avatar
                    size={upLG ? 'xl' : 'md'}
                    src={`${prodImage}/thumbs/prod-${item}.png`}
                    variant="rounded"
                    sx={{ m: '0 auto', cursor: 'pointer', bgcolor: 'secondary.200' }}
                  />
                </Box>
              ))}
            </Slider>
          </Box>
        </Grid>
      </Grid>
    </>
  );
}
