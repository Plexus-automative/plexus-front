// material-ui
import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Rating from '@mui/material/Rating';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project-imports
import Avatar from 'components/@extended/Avatar';

// third-party
import Slider from 'react-slick';

// assets
const Avatar1 = '/assets/images/users/avatar-1.png';
const Avatar2 = '/assets/images/users/avatar-2.png';
const Avatar3 = '/assets/images/users/avatar-3.png';
const Avatar4 = '/assets/images/users/avatar-4.png';

// ==============================|| AUTH BLUR BACK SVG ||============================== //

export default function AuthBackground() {
  const theme = useTheme();

  const settings = {
    dots: true,
    arrows: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1
  };
  const usercomment = [
    {
      image: Avatar1,
      name: 'Allie Grater',
      designation: '@alliegrater',
      rating: 4,
      comment:
        'Very good customer service!👌 I liked the design and there was nothing wrong, but found out after testing that it did not quite match the functionality and overall design that I needed for my type of software. I therefore contacted customer service and it was no problem even though the deadline for refund had actually expired.😍'
    },
    {
      image: Avatar2,
      name: 'Allie Grater',
      designation: '@alliegrater',
      rating: 3,
      comment:
        'Very good customer service!👌 I liked the design and there was nothing wrong, but found out after testing that it did not quite match the functionality and overall design that I needed for my type of software. I therefore contacted customer service and it was no problem even though the deadline for refund had actually expired.😍'
    },
    {
      image: Avatar3,
      name: 'Allie Grater',
      designation: '@alliegrater',
      rating: 5,
      comment:
        'Very good customer service!👌 I liked the design and there was nothing wrong, but found out after testing that it did not quite match the functionality and overall design that I needed for my type of software. I therefore contacted customer service and it was no problem even though the deadline for refund had actually expired.😍'
    },
    {
      image: Avatar4,
      name: 'Allie Grater',
      designation: '@alliegrater',
      rating: 4,
      comment:
        'Very good customer service!👌 I liked the design and there was nothing wrong, but found out after testing that it did not quite match the functionality and overall design that I needed for my type of software. I therefore contacted customer service and it was no problem even though the deadline for refund had actually expired.😍'
    }
  ];
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        '&:before': {
          content: `" "`,
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          right: 0,
          background: 'linear-gradient(338deg, rgba(0, 0, 0, 0.3), transparent)'
        }
      }}
    >
      <Box
        sx={(theme) => ({
          width: 500,
          m: '0 auto',
          color: 'background.paper',
          ...theme.applyStyles('dark', { color: 'text.primary' }),
          '& .slick-dots': {
            bottom: '-45px',
            '& li': {
              width: 'auto',
              margin: 0,
              '& button': {
                width: 'auto',
                '&:before': {
                  position: 'relative',
                  display: 'inline-block',
                  content: '""',
                  width: 6,
                  height: 6,
                  borderRadius: 1,
                  bgcolor: 'background.paper',
                  ...theme.applyStyles('dark', { bgcolor: 'text.primary' })
                }
              },
              '&.slick-active button:before': { width: 30 }
            }
          }
        })}
      >
        <Slider {...settings}>
          {usercomment.map((item, index) => (
            <Box key={index} sx={{ width: '100%', textAlign: 'center' }}>
              <Grid container spacing={3} direction="column">
                <Grid>
                  <Avatar alt="User 1" src={item.image} variant="circular" size="lg" sx={{ m: '0 auto' }} />
                </Grid>
                <Grid>
                  <Typography variant="h5">{item.name}</Typography>
                  <Typography variant="body2">{item.designation}</Typography>
                </Grid>
                <Grid>
                  <Rating
                    name="disabled"
                    value={item.rating}
                    readOnly
                    slotProps={{ icon: { sx: { ...theme.applyStyles('dark', { color: 'secondary.500' }) } } }}
                  />
                </Grid>
                <Grid>
                  <Typography variant="body1">{item.comment}</Typography>
                </Grid>
              </Grid>
            </Box>
          ))}
        </Slider>
      </Box>
    </Box>
  );
}
