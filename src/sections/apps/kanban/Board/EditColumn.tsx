import { ChangeEvent } from 'react';

// material-ui
import OutlinedInput from '@mui/material/OutlinedInput';

// project-imports
import { editColumn } from 'api/kanban';

// types
import { KanbanColumn } from 'types/kanban';

interface Props {
  column: KanbanColumn;
}

// ==============================|| KANBAN BOARD - COLUMN EDIT ||============================== //

export default function EditColumn({ column }: Props) {
  const handleColumnRename = (event: ChangeEvent<HTMLInputElement>) => {
    editColumn({ id: column.id, title: event.target.value, itemIds: column.itemIds });
  };

  return (
    <OutlinedInput
      fullWidth
      value={column.title}
      onChange={handleColumnRename}
      sx={(theme) => ({
        mb: 1.5,
        fontWeight: 500,
        '& input:focus, & input:hover': {
          bgcolor: 'secondary.lighter',
          ...theme.applyStyles('dark', { bgcolor: 'secondary.100' })
        },
        '& input:hover + fieldset': { display: 'block' },
        '&, & input': { bgcolor: 'transparent', borderRadius: 1 },
        '& fieldset': { display: 'none' },
        '& input:focus + fieldset': { display: 'block' }
      })}
    />
  );
}
