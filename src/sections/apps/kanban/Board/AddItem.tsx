import { ChangeEvent, KeyboardEvent, useState } from 'react';

// material-ui
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';

// third-party
import { Chance } from 'chance';
import { sub } from 'date-fns';

// project-imports
import { addItem } from 'api/kanban';
import { openSnackbar } from 'api/snackbar';
import IconButton from 'components/@extended/IconButton';
import MainCard from 'components/MainCard';

// assets
import { Add, Calculator, Profile2User } from '@wandersonalwes/iconsax-react';

// types
import { SnackbarProps } from 'types/snackbar';
import { KanbanItem } from 'types/kanban';

interface Props {
  columnId: string;
}

const chance = new Chance();

// ==============================|| KANBAN BOARD - ADD ITEM ||============================== //

export default function AddItem({ columnId }: Props) {
  const [addTaskBox, setAddTaskBox] = useState(false);

  const handleAddTaskChange = () => {
    setAddTaskBox((prev) => !prev);
  };

  const [title, setTitle] = useState('');
  const [isTitle, setIsTitle] = useState(false);

  const handleAddTask = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.keyCode === 13) {
      addTask();
    }
  };

  const addTask = () => {
    if (title.length > 0) {
      const newItem: KanbanItem = {
        id: `${chance.integer({ min: 1000, max: 9999 })}`,
        title,
        dueDate: sub(new Date(), { days: 0, hours: 1, minutes: 45 }),
        image: false,
        assign: '',
        description: '',
        priority: 'low',
        attachments: []
      };

      addItem(columnId, newItem, '0');
      openSnackbar({
        open: true,
        message: 'Task Added successfully',
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
        variant: 'alert',
        alert: { color: 'success' }
      } as SnackbarProps);
      handleAddTaskChange();
      setTitle('');
    } else {
      setIsTitle(true);
    }
  };

  const handleTaskTitle = (event: ChangeEvent<HTMLInputElement>) => {
    const newTitle = event.target.value;
    setTitle(newTitle);
    if (newTitle.length <= 0) {
      setIsTitle(true);
    } else {
      setIsTitle(false);
    }
  };

  return (
    <Grid container spacing={1} sx={{ alignItems: 'center', marginTop: 1 }}>
      {addTaskBox && (
        <Grid size={12}>
          <MainCard content={false}>
            <Box sx={{ p: 2, pb: 1.5, transition: 'background-color 0.25s ease-out' }}>
              <Grid container spacing={0.5} sx={{ alignItems: 'center' }}>
                <Grid size={12}>
                  <TextField
                    fullWidth
                    placeholder="Add Task"
                    value={title}
                    onChange={handleTaskTitle}
                    slotProps={{
                      htmlInput: { sx: { bgcolor: 'transparent', p: 0, borderRadius: '0px' } },
                      input: { sx: { bgcolor: 'transparent', '&.Mui-focused': { boxShadow: 'none' } } }
                    }}
                    sx={{ mb: 3, '& fieldset': { display: 'none' } }}
                    onKeyUp={handleAddTask}
                    helperText={isTitle ? 'Task title is required.' : ''}
                    error={isTitle}
                  />
                </Grid>
                <Grid>
                  <IconButton>
                    <Profile2User />
                  </IconButton>
                </Grid>
                <Grid>
                  <IconButton>
                    <Calculator />
                  </IconButton>
                </Grid>
                <Grid size="grow" />
                <Grid>
                  <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
                    <Tooltip title="Cancel">
                      <IconButton size="small" color="error" onClick={handleAddTaskChange}>
                        <Add style={{ transform: 'rotate(45deg)' }} />
                      </IconButton>
                    </Tooltip>
                    <Button variant="contained" color="primary" onClick={addTask} size="small">
                      Add
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </Box>
          </MainCard>
        </Grid>
      )}
      {!addTaskBox && (
        <Grid size={12} sx={{ mt: 1 }}>
          <Button variant="dashed" color="secondary" fullWidth onClick={handleAddTaskChange}>
            Add Task
          </Button>
        </Grid>
      )}
    </Grid>
  );
}
