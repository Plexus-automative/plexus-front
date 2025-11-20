// material-ui
import CardMedia from '@mui/material/CardMedia';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Rating from '@mui/material/Rating';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// assets
const productImage = '/assets/images/e-commerce';

// ==============================|| PRODUCT - VIEW ||============================== //

export default function ProductView({ data }: any) {
  return (
    <Grid container spacing={2.5} sx={{ pl: { xs: 0, sm: 5, md: 6, lg: 10, xl: 12 } }}>
      <Grid size={{ xs: 6, sm: 5, md: 4, lg: 3 }}>
        <Box sx={{ position: 'relative', bgcolor: 'secondary.200' }}>
          <CardMedia component="img" alt="product" src={data.image && `${productImage}/${data.image}`} />
          <Chip
            label={data.isStock ? 'In Stock' : 'Out of Stock'}
            color={data.isStock ? 'success' : 'error'}
            size="small"
            sx={{ position: 'absolute', right: 8, top: 8 }}
          />
        </Box>
      </Grid>
      <Grid size={{ xs: 12, sm: 7, md: 8, lg: 9 }}>
        <Stack sx={{ gap: 1, px: 2 }}>
          <Typography variant="h5">{data?.name}</Typography>
          <Typography sx={{ color: 'text.secondary' }}>{data?.about}</Typography>
          <Rating name="read-only" value={data.rating} readOnly />
          <Box sx={{ width: '80%', pt: 2 }}>
            <Grid container spacing={1}>
              <Grid size={{ xs: 4, md: 3 }}>
                <Typography sx={{ color: 'text.secondary' }}>Categories</Typography>
              </Grid>
              <Grid size={{ xs: 8, md: 9 }}>
                <Stack direction="row" sx={{ gap: 0.5 }}>
                  {data?.categories?.map((item: any, index: number) => (
                    <Typography key={index} variant="h6" sx={{ textTransform: 'capitalize' }}>
                      {item}
                      {data?.categories.length > index + 1 ? ',' : ''}
                    </Typography>
                  ))}
                </Stack>
              </Grid>
              <Grid size={{ xs: 4, md: 3 }}>
                <Typography sx={{ color: 'text.secondary' }}>Qty</Typography>
              </Grid>
              <Grid size={{ xs: 8, md: 9 }}>
                <Typography variant="h6">{data?.quantity}</Typography>
              </Grid>
              <Grid size={{ xs: 4, md: 3 }}>
                <Typography sx={{ color: 'text.secondary' }}>Price</Typography>
              </Grid>
              <Grid size={{ xs: 8, md: 9 }}>
                <Typography variant="h5">{data?.salePrice ? `$${data?.salePrice}` : `$${data?.offerPrice}`}</Typography>
              </Grid>
            </Grid>
          </Box>
        </Stack>
      </Grid>
    </Grid>
  );
}
