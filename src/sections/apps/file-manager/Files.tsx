'use client';

import { useEffect, useState } from 'react';

// material-ui
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Pagination from '@mui/material/Pagination';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

// project-imports
import CardView from './CardView';
import ListView from './ListView';
import FileToolbar from './FileToolbar';
import Filters from './Filters';
import { FileData } from 'data/file-manager';

const pageSizeOptions = [5, 10, 25, 50];

// ==============================|| FILE MANAGER - FILES ||============================== //

export default function Files() {
  // filters values
  const [mode, setMode] = useState<string>('card');
  const [searchText, setSearchText] = useState<string>('');
  const [fileType, setFileType] = useState<string>('all');

  // pagination and selected items
  const [page, setPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const handleChangePage = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleChangeRowsPerPage = (event: any) => {
    setItemsPerPage(Number(event.target.value));
    setPage(1);
  };

  const filteredData = FileData.filter((file) => {
    const matchesType = fileType === 'all' || file.category === fileType;
    const matchesSearch = file.name.toLowerCase().includes(searchText.toLowerCase());
    return matchesType && matchesSearch;
  });

  useEffect(() => {
    setPage(1);
  }, [searchText, fileType]);

  const filteredFiles = filteredData.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <>
      <Stack sx={{ gap: 2 }}>
        <Filters
          setFileType={setFileType}
          fileType={fileType}
          searchText={searchText}
          setSearchText={setSearchText}
          setMode={setMode}
          mode={mode}
        />
        <FileToolbar selectedItems={selectedItems} />
        {mode === 'card' ? (
          <CardView files={filteredFiles} />
        ) : (
          <ListView files={filteredFiles} selectedItems={selectedItems} setSelectedItems={setSelectedItems} />
        )}

        <Stack
          direction={{ sm: 'row' }}
          sx={{ gap: { xs: 2.5, sm: 1 }, mt: 1, alignItems: 'center', justifyContent: 'space-between', width: 1 }}
        >
          <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
            <Typography variant="caption" color="secondary">
              Rows per page
            </Typography>
            <FormControl sx={{ minWidth: 64 }}>
              <Select
                value={itemsPerPage}
                onChange={handleChangeRowsPerPage}
                size="small"
                sx={{ '& .MuiSelect-select': { py: 0.75, px: 1.25 } }}
              >
                {pageSizeOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Typography variant="caption" color="secondary">
              Go to
            </Typography>
            <TextField
              size="small"
              type="number"
              value={page}
              onChange={(e) => {
                const p = e.target.value ? Number(e.target.value) : 1;
                setPage(p > 0 ? p : 1);
              }}
              slotProps={{ htmlInput: { sx: { py: 0.75, px: 1.25, width: 48 } } }}
            />
          </Stack>
          <Pagination
            count={Math.ceil(filteredData.length / itemsPerPage)}
            page={page}
            onChange={handleChangePage}
            color="primary"
            variant="combined"
            showFirstButton
            showLastButton
          />
        </Stack>
      </Stack>
    </>
  );
}
