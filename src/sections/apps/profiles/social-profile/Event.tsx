// material-ui
import { styled } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import Button from '@mui/material/Button';
import CardMedia from '@mui/material/CardMedia';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// third-party
import Slider from 'react-slick';

// project-imports
import { eventData } from './data/event';
import MainCard from 'components/MainCard';

// assets
const eventBackground = '/assets/images/profile/social-profile/img-event-bg.jpg';

const StyledSliderWrapper = styled('div')({
  position: 'relative',
  '& .slick-dots': {
    position: 'absolute',
    bottom: 10,
    right: 0,
    display: 'flex !important',
    justifyContent: 'end'
  },
  '& .slick-dots li': {
    width: 3,
    height: 3
  },
  '& .slick-dots li button': {
    width: 5,
    height: 5,
    padding: 0,
    borderRadius: '50%',
    backgroundColor: 'rgba(226, 224, 224, 0.4)'
  },
  '& .slick-dots li.slick-active button': {
    backgroundColor: '#fff'
  },
  '& .slick-dots li button:before': {
    display: 'none'
  }
});

// ==============================|| SOCIAL PROFILE - EVENT ||============================== //

export default function Event() {
  const sliderSettings = { dots: true, infinite: true, arrows: false, autoplay: false, slidesToShow: 1, slidesToScroll: 1 };

  return (
    <MainCard title="Event" secondary={<Button>See All</Button>}>
      <Box sx={{ position: 'relative', borderRadius: 1.5, overflow: 'hidden' }}>
        <CardMedia component="img" src={eventBackground} sx={{ height: 185 }} />
        <Box sx={{ position: 'absolute', inset: 0, color: 'common.white', display: 'flex', alignItems: 'end', p: 3 }}>
          <Box sx={{ width: 1 }}>
            <StyledSliderWrapper>
              <Slider {...sliderSettings}>
                {eventData.map((event, index) => (
                  <Box key={index}>
                    <Typography variant="subtitle1">{event.title}</Typography>
                    <Typography>{event.time}</Typography>

                    <Stack direction="row" sx={{ mt: 1 }}>
                      <AvatarGroup max={4}>
                        {event.attendees.map((avatar, idx) => (
                          <Avatar key={idx} src={avatar} />
                        ))}
                      </AvatarGroup>
                    </Stack>
                  </Box>
                ))}
              </Slider>
            </StyledSliderWrapper>
          </Box>
        </Box>
      </Box>
    </MainCard>
  );
}
