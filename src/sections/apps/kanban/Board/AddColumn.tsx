import { ChangeEvent, KeyboardEvent, useState } from 'react';

// material-ui
import { Theme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';

// third-party
import { Chance } from 'chance';

// project-imports
import { addColumn } from 'api/kanban';
import { openSnackbar } from 'api/snackbar';
import IconButton from 'components/@extended/IconButton';
import MainCard from 'components/MainCard';

// assets
import { Add } from '@wandersonalwes/iconsax-react';

// types
import { SnackbarProps } from 'types/snackbar';

const chance = new Chance();

// ==============================|| KANBAN BOARD - ADD COLUMN ||============================== //

export default function AddColumn() {
  const [title, setTitle] = useState('');
  const [isTitle, setIsTitle] = useState(false);

  const [isAddColumn, setIsAddColumn] = useState(false);

  const handleAddColumnChange = () => {
    setIsAddColumn((prev) => !prev);
  };

  const addNewColumn = () => {
    if (title.length > 0) {
      const newColumn = {
        id: `${chance.integer({ min: 1000, max: 9999 })}`,
        title,
        itemIds: []
      };

      addColumn(newColumn);
      openSnackbar({
        open: true,
        message: 'Column Added successfully',
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
        variant: 'alert',
        alert: { color: 'success' }
      } as SnackbarProps);
      setIsAddColumn((prev) => !prev);
      setTitle('');
    } else {
      setIsTitle(true);
    }
  };

  const handleAddColumn = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.keyCode === 13) {
      addNewColumn();
    }
  };

  const handleColumnTitle = (event: ChangeEvent<HTMLInputElement>) => {
    const newTitle = event.target.value;
    setTitle(newTitle);
    if (newTitle.length <= 0) {
      setIsTitle(true);
    } else {
      setIsTitle(false);
    }
  };

  return (
    <MainCard
      sx={(theme: Theme) => ({
        minWidth: 250,
        bgcolor: 'secondary.200',
        ...theme.applyStyles('dark', { bgcolor: 'background.default' }),
        height: '100%',
        borderColor: 'divider'
      })}
      contentSX={{ p: 1.5, '&:last-of-type': { pb: 1.5 } }}
    >
      <Grid container spacing={1} sx={{ alignItems: 'center' }}>
        {isAddColumn && (
          <Grid size={12}>
            <MainCard content={false}>
              <Box sx={{ p: 2, pb: 1.5, transition: 'background-color 0.25s ease-out' }}>
                <Grid container spacing={0.5} sx={{ alignItems: 'center' }}>
                  <Grid size={12}>
                    <TextField
                      fullWidth
                      placeholder="Add Column"
                      value={title}
                      onChange={handleColumnTitle}
                      slotProps={{
                        htmlInput: { sx: { bgcolor: 'transparent', p: 0, borderRadius: '0px' } },
                        input: { sx: { bgcolor: 'transparent', '&.Mui-focused': { boxShadow: 'none' } } }
                      }}
                      sx={{ mb: 3, '& fieldset': { display: 'none' } }}
                      onKeyUp={handleAddColumn}
                      helperText={isTitle ? 'Column title is required.' : ''}
                      error={isTitle}
                    />
                  </Grid>
                  <Grid size="grow" />
                  <Grid>
                    <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
                      <Tooltip title="Cancel">
                        <IconButton size="small" color="error" onClick={handleAddColumnChange}>
                          <Add style={{ transform: 'rotate(45deg)' }} />
                        </IconButton>
                      </Tooltip>
                      <Button variant="contained" color="primary" onClick={addNewColumn} size="small">
                        Add
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>
              </Box>
            </MainCard>
          </Grid>
        )}
        {!isAddColumn && (
          <Grid size={12}>
            <Button variant="dashed" color="secondary" fullWidth onClick={handleAddColumnChange}>
              Add Column
            </Button>
          </Grid>
        )}
      </Grid>
    </MainCard>
  );
}
