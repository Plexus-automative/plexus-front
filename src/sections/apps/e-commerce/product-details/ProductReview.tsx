import { ReactElement } from 'react';

// material-ui
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import LinearProgress from '@mui/material/LinearProgress';
import ListItemText from '@mui/material/ListItemText';
import Rating from '@mui/material/Rating';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// third-party
import { format } from 'date-fns';

// project-imports
import { useGetProductReviews } from 'api/products';
import IconButton from 'components/@extended/IconButton';
import ProductReview from 'components/cards/e-commerce/ProductReview';
import MainCard from 'components/MainCard';

// assets
import { EmojiHappy, Image as ImageIcon, Paperclip2 } from '@wandersonalwes/iconsax-react';

// types
import { Products } from 'types/e-commerce';

interface ProgressProps {
  star: number;
  value: number;
  color?: 'inherit' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | undefined;
}

// progress
function LinearProgressWithLabel({ star, color, value, ...others }: ProgressProps) {
  return (
    <>
      <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
        <LinearProgress
          value={value}
          variant="determinate"
          color={color}
          {...others}
          sx={{ width: '100%', bgcolor: 'secondary.lighter' }}
        />
        <Typography variant="body2" sx={{ color: 'text.secondary', minWidth: 50 }}>{`${Math.round(star)} Star`}</Typography>
      </Stack>
    </>
  );
}

// ==============================|| PRODUCT DETAILS - REVIEWS ||============================== //

export default function ProductReviews({ product }: { product: Products }) {
  const { productReviewsLoading, productReviews } = useGetProductReviews();

  let productReview: ReactElement | ReactElement[] = (
    <Grid size={12}>
      <List>
        {[1, 2, 3].map((index: number) => (
          <MainCard content={false} key={index} sx={{ mb: 2.5 }}>
            <ListItem alignItems="flex-start">
              <ListItemAvatar sx={{ minWidth: 72 }}>
                <Skeleton variant="rectangular" width={62} height={62} />
              </ListItemAvatar>
              <ListItemText
                primary={<Skeleton animation="wave" height={22} />}
                secondary={
                  <>
                    <Skeleton animation="wave" height={14} width="60%" />
                    <Skeleton animation="wave" height={18} width="20%" />
                    <Skeleton animation="wave" height={14} width="35%" sx={{ mt: 1.25 }} />
                    <Skeleton animation="wave" height={14} width="100%" />
                    <Skeleton animation="wave" height={14} width="55%" />
                  </>
                }
              />
            </ListItem>
          </MainCard>
        ))}
      </List>
    </Grid>
  );

  if (productReviews && !productReviewsLoading) {
    productReview = productReviews.map((review, index) => (
      <Grid size={12} key={index}>
        <MainCard sx={{ bgcolor: 'secondary.lighter' }}>
          <ProductReview
            avatar={review.profile.avatar}
            date={format(new Date(review.date as string), 'dd/MM, yyyy h:dd:ss a')}
            name={review.profile.name}
            rating={review.rating}
            review={review.review}
          />
        </MainCard>
      </Grid>
    ));
  }

  return (
    <Grid container spacing={3}>
      <Grid size={12}>
        <MainCard>
          <Grid container spacing={2.5} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Grid>
              {product && (
                <Stack sx={{ gap: 1, height: 1 }}>
                  <Stack sx={{ gap: 1 }}>
                    <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
                      <Typography variant="h2">
                        {Number((product.rating! < 4 ? product.rating! + 1 : product.rating!).toFixed(1))}
                      </Typography>
                      <Typography variant="h4" sx={{ color: 'text.secondary' }}>
                        /5
                      </Typography>
                    </Stack>
                    <Typography sx={{ color: 'text.secondary' }}>Based on {product.offerPrice?.toFixed(0)} reviews</Typography>
                  </Stack>
                  <Rating
                    name="simple-controlled"
                    value={product.rating! < 4 ? product.rating! + 1 : product.rating}
                    readOnly
                    precision={0.1}
                  />
                </Stack>
              )}
            </Grid>
            <Grid>
              <Grid container spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                <Grid size={12}>
                  <LinearProgressWithLabel color="warning" star={5} value={100} />
                </Grid>
                <Grid size={12}>
                  <LinearProgressWithLabel color="warning" star={4} value={80} />
                </Grid>
                <Grid size={12}>
                  <LinearProgressWithLabel color="warning" star={3} value={60} />
                </Grid>
                <Grid size={12}>
                  <LinearProgressWithLabel color="warning" star={2} value={40} />
                </Grid>
                <Grid size={12}>
                  <LinearProgressWithLabel color="warning" star={1} value={20} />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </MainCard>
      </Grid>
      {productReview}
      <Grid size={12}>
        <Stack direction="row" sx={{ justifyContent: 'center' }}>
          <Button variant="text" sx={{ textTransform: 'none' }}>
            {' '}
            View more comments{' '}
          </Button>
        </Stack>
      </Grid>
      <Grid size={12}>
        <Box sx={{ p: 2, pb: 1.5, border: '1px solid', borderColor: 'divider' }}>
          <Grid container spacing={0.5} sx={{ alignItems: 'center' }}>
            <Grid size={12}>
              <TextField
                fullWidth
                placeholder="Add Comment"
                slotProps={{
                  htmlInput: { sx: { bgcolor: 'transparent', p: 0, borderRadius: '0px' } },
                  input: { sx: { bgcolor: 'transparent', '&.Mui-focused': { boxShadow: 'none' } } }
                }}
                sx={{ mb: 3, '& fieldset': { display: 'none' } }}
              />
            </Grid>
            <Grid>
              <IconButton>
                <Paperclip2 />
              </IconButton>
            </Grid>
            <Grid>
              <IconButton>
                <ImageIcon />
              </IconButton>
            </Grid>
            <Grid>
              <IconButton>
                <EmojiHappy />
              </IconButton>
            </Grid>
            <Grid size="grow" />
            <Grid>
              <Button size="small" variant="contained" color="primary">
                Comment
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Grid>
    </Grid>
  );
}
