import { SetStateAction } from 'react';

// material-ui
import FormControl from '@mui/material/FormControl';
import { InputBaseProps } from '@mui/material/InputBase';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Typography from '@mui/material/Typography';

// third-party
import { Column, SortingState, TableState } from '@tanstack/react-table';

interface Props<T extends object> {
  getState: () => TableState;
  setSorting: (value: SetStateAction<SortingState>) => void;
  getAllColumns: () => Column<T, unknown>[];
  size?: InputBaseProps['size'];
}

// ==============================|| COLUMN SORTING - SELECT ||============================== //

export default function SelectColumnSorting<T extends object>({ getState, getAllColumns, setSorting, size = 'medium' }: Props<T>) {
  const handleChange = (event: SelectChangeEvent<string>) => {
    setSorting([{ id: event.target.value, desc: false }]);
  };

  const sortingState = getState().sorting;
  const selectedColumnId = sortingState.length > 0 ? sortingState[0].id : '';

  return (
    <FormControl sx={{ width: 200 }} size={size}>
      <Select
        id="column-sorting"
        displayEmpty
        onChange={handleChange}
        value={selectedColumnId}
        input={<OutlinedInput id="select-column-sorting" placeholder="Select column" />}
        renderValue={(value) => {
          const selectedColumn = getAllColumns().find((col) => col.id === value);
          return (
            <Typography variant="subtitle2">
              {selectedColumn
                ? `Sort by (${typeof selectedColumn.columnDef.header === 'string' ? selectedColumn.columnDef.header : '#'})`
                : 'Sort By'}
            </Typography>
          );
        }}
      >
        {getAllColumns()
          .filter((col) => (col.columnDef as { accessorKey?: string }).accessorKey && col.getCanSort())
          .map((col) => (
            <MenuItem key={col.id} value={col.id}>
              <ListItemText primary={typeof col.columnDef.header === 'string' ? col.columnDef.header : '#'} />
            </MenuItem>
          ))}
      </Select>
    </FormControl>
  );
}
