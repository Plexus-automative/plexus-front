// material-ui
import Box from '@mui/material/Box';

// project-imports
import AddComment from './AddComment';
import CommentReply from './CommentReply';
import FeedbackActions from './FeedbackActions';
import PostComment from './PostComment';
import PostHeader from './PostHeader';
import PostImages from './PostImages';
import PostTextContent from './PostTextContent';
import SocialFeedbackBar from './SocialFeedbackBar';
import MainCard from 'components/MainCard';

// assets
const Avatar6 = '/assets/images/users/avatar-6.png';

// ==============================|| SOCIAL PROFILE - POST 1 ||============================== //

export default function Post1() {
  return (
    <MainCard>
      <PostHeader header="John Doe" subHeader="Technical Department" avatarImg={Avatar6} status="success" />
      <PostTextContent />
      <PostImages />
      <SocialFeedbackBar />
      <Box sx={{ position: 'relative' }}>
        <PostComment isReply={true} />
        <FeedbackActions />
        <CommentReply />
        <FeedbackActions ml={16} />
        <PostComment isReply={false} />
        <FeedbackActions />
      </Box>
      <AddComment />
    </MainCard>
  );
}
