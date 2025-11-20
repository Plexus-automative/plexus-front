// material-ui
import CardMedia from '@mui/material/CardMedia';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project-imports
import { storiesData } from './data/stories';
import Avatar from 'components/@extended/Avatar';
import ImagePreview from 'components/ImagePreview';
import MainCard from 'components/MainCard';

// assets
import { AddCircle } from '@wandersonalwes/iconsax-react';

// ==============================|| SOCIAL PROFILE - STORIES ||============================== //

export default function Stories() {
  const addStory = storiesData[0];
  const otherStories = storiesData.slice(1);

  return (
    <MainCard>
      <Stack direction="row" sx={{ gap: 1 }}>
        <Box sx={{ maxWidth: 110, height: 160, borderRadius: 1.5, overflow: 'hidden', flexShrink: 0, cursor: 'pointer' }}>
          <Box sx={{ borderRadius: 1.5, overflow: 'hidden' }}>
            <CardMedia component="img" src={addStory.storyImg} alt="Story image" sx={{ transition: 'transform 0.3s ease-in-out' }} />
          </Box>
          <Stack sx={{ alignItems: 'center', position: 'absolute', bottom: 60, left: 45, color: 'common.white' }}>
            <AddCircle variant="Bold" size={30} />
            <Typography variant="subtitle1">Add Story</Typography>
          </Stack>
        </Box>
        <Stack
          direction="row"
          sx={{
            overflowX: 'auto',
            '&::-webkit-scrollbar': { height: 4 },
            '&::-webkit-scrollbar-thumb': { bgcolor: 'secondary.light', borderRadius: 4 },
            '&::-webkit-scrollbar-track': { bgcolor: 'secondary.lighter', borderRadius: 4 },
            flexWrap: 'nowrap',
            gap: 1
          }}
        >
          {otherStories.map((story, index) => (
            <Box key={index} sx={{ width: 110, position: 'relative', flexShrink: 0, borderRadius: 1.5 }}>
              <ImagePreview src={story.storyImg} alt={`Story image ${index}`} showIcon={false} />
              <Avatar
                size="sm"
                src={story.profile}
                sx={{ top: 18, left: 18, position: 'absolute', border: '2px solid', borderColor: 'background.paper' }}
              />
            </Box>
          ))}
        </Stack>
      </Stack>
    </MainCard>
  );
}
