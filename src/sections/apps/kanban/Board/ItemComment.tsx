// material-ui
import { Theme } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project-imports
import Avatar from 'components/@extended/Avatar';
import Dot from 'components/@extended/Dot';
import MainCard from 'components/MainCard';

// types
import { KanbanComment, KanbanProfile } from 'types/kanban';

const avatarImage = '/assets/images/users';

interface Props {
  comment: KanbanComment;
  profile: KanbanProfile;
}

// ==============================|| KANBAN BOARD - ITEM COMMENT ||============================== //

export default function ItemComment({ comment, profile }: Props) {
  return (
    <MainCard
      content={false}
      sx={(theme: Theme) => ({ p: 1.5, mt: 1.25, ...theme.applyStyles('light', { bgcolor: 'secondary.lighter' }) })}
    >
      <Grid container spacing={1.5}>
        <Grid size={12}>
          <Grid container wrap="nowrap" spacing={1} sx={{ alignItems: 'center' }}>
            <Grid>
              <Avatar
                sx={{ width: 24, height: 24 }}
                size="sm"
                alt="User 1"
                src={profile && profile.avatar && `${avatarImage}/${profile.avatar}`}
              />
            </Grid>
            <Grid size="grow">
              <Grid container spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                <Grid>
                  <Typography variant="subtitle1">{profile.name}</Typography>
                </Grid>
                <Grid>
                  <Stack direction="row" sx={{ gap: 0.5, alignItems: 'center' }}>
                    <Dot size={6} sx={{ mt: -0.25 }} color="secondary" />
                    <Typography variant="caption" color="secondary">
                      {profile.time}
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Grid sx={{ '&.MuiGrid-root': { pt: 1.5 } }} size={12}>
          <Typography variant="body2">{comment?.comment}</Typography>
        </Grid>
      </Grid>
    </MainCard>
  );
}
