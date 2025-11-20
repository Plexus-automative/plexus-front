// material-ui
import CardMedia from '@mui/material/CardMedia';

// project-imports
import AddComment from './AddComment';
import FeedbackActions from './FeedbackActions';
import MainCard from 'components/MainCard';
import PostComment from './PostComment';
import PostHeader from './PostHeader';
import PostTextContent from './PostTextContent';
import SocialFeedbackBar from './SocialFeedbackBar';

// assets
const Avatar6 = '/assets/images/users/avatar-6.png';

// ==============================|| SOCIAL PROFILE - POST 2 ||============================== //

export default function Post2() {
  return (
    <MainCard>
      <PostHeader header="John Doe" subHeader="Technical Department" avatarImg={Avatar6} status="warning" />
      <PostTextContent />
      <CardMedia
        sx={{ border: 'none', borderRadius: 1, height: { xs: 220, sm: 300, lg: 450 } }}
        component="iframe"
        src="https://www.youtube.com/embed/vyJU9efvUtQ?si=FLrEGoxRhhw6-q7j"
        aria-label="material ui video"
      />
      <SocialFeedbackBar />
      <PostComment isReply={false} />
      <FeedbackActions />
      <AddComment />
    </MainCard>
  );
}
