import { ChangeEvent, KeyboardEvent, useState } from 'react';

// material-ui
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';

// third-party
import { Chance } from 'chance';

// project-imports
import { addItemComment } from 'api/kanban';
import { openSnackbar } from 'api/snackbar';
import IconButton from 'components/@extended/IconButton';

// assets
import { Android, Camera, DocumentUpload } from '@wandersonalwes/iconsax-react';

// types
import { KanbanComment } from 'types/kanban';
import { SnackbarProps } from 'types/snackbar';

interface Props {
  itemId: string | false;
}

const chance = new Chance();

// ==============================|| KANBAN BOARD - ADD ITEM COMMENT ||============================== //

export default function AddItemComment({ itemId }: Props) {
  const [comment, setComment] = useState('');
  const [isComment, setIsComment] = useState(false);

  const handleAddTaskComment = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.keyCode === 13) {
      addTaskComment();
    }
  };

  const addTaskComment = () => {
    if (comment.length > 0) {
      const newComment: KanbanComment = {
        id: `${chance.integer({ min: 1000, max: 9999 })}`,
        comment,
        profileId: 'profile-3'
      };

      addItemComment(itemId, newComment);
      openSnackbar({
        open: true,
        message: 'Comment Added successfully',
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
        variant: 'alert',
        alert: { color: 'success' }
      } as SnackbarProps);

      setComment('');
    } else {
      setIsComment(true);
    }
  };

  const handleTaskComment = (event: ChangeEvent<HTMLInputElement>) => {
    const newComment = event.target.value;
    setComment(newComment);
    if (newComment.length <= 0) {
      setIsComment(true);
    } else {
      setIsComment(false);
    }
  };

  return (
    <Box sx={{ p: 2, pb: 1.5, border: '1px solid', borderColor: 'divider' }}>
      <Grid container spacing={0.5} sx={{ alignItems: 'center' }}>
        <Grid size={12}>
          <TextField
            fullWidth
            placeholder="Add Comment"
            value={comment}
            onChange={handleTaskComment}
            slotProps={{
              htmlInput: { sx: { bgcolor: 'transparent', p: 0, borderRadius: '0px' } },
              input: { sx: { bgcolor: 'transparent', '&.Mui-focused': { boxShadow: 'none' } } }
            }}
            sx={{ mb: 3, '& fieldset': { display: 'none' } }}
            onKeyUp={handleAddTaskComment}
            helperText={isComment ? 'Comment is required.' : ''}
            error={isComment}
          />
        </Grid>
        <Grid>
          <IconButton>
            <Camera />
          </IconButton>
        </Grid>
        <Grid>
          <IconButton>
            <DocumentUpload />
          </IconButton>
        </Grid>
        <Grid>
          <IconButton>
            <Android />
          </IconButton>
        </Grid>
        <Grid size="grow" />
        <Grid>
          <Button size="small" variant="contained" color="primary" onClick={addTaskComment}>
            Comment
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}
