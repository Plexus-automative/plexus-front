import { MouseEvent, useState } from 'react';

// material-ui
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import ListItemButton from '@mui/material/ListItemButton';
import Menu from '@mui/material/Menu';
import OutlinedInput from '@mui/material/OutlinedInput';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';

// project-imports
import IconButton from 'components/@extended/IconButton';
import MoreIcon from 'components/@extended/MoreIcon';

// assets
import { ArrowLeft2, ArrowRight2, HambergerMenu, Maximize4, SearchNormal1 } from '@wandersonalwes/iconsax-react';

interface MailToolbarProps {
  toggleDrawer: () => void;
  searchText: string;
  setSearchText: (text: string) => void;
  setFilter: (text: string) => void;
  page: number;
  setPage: (value: number) => void;
  totalCount: number;
  rowsPerPage: number;
  fullRow: boolean;
  setFullRow: (value: boolean) => void;
}

// ==============================|| MAIL TOOLBAR ||============================== //

export default function MailToolbar({
  toggleDrawer,
  searchText,
  setSearchText,
  setFilter,
  page,
  setPage,
  totalCount,
  rowsPerPage,
  setFullRow,
  fullRow
}: MailToolbarProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const totalPages = Math.ceil(totalCount / rowsPerPage);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleFilterClick = (newFilter: string) => {
    setFilter(newFilter);
    handleClose();
  };

  const handlePrevious = () => setPage(Math.max(page - 1, 1));
  const handleNext = () => setPage(Math.min(page + 1, totalPages));

  const start = (page - 1) * rowsPerPage + 1;
  const end = Math.min(page * rowsPerPage, totalCount);

  const searchInput = (
    <FormControl sx={{ width: { xs: 1, sm: 261 } }}>
      <OutlinedInput
        id="mail-search"
        placeholder="Search"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        sx={{ '& .MuiOutlinedInput-input': { p: '10.5px 0px 12px' }, height: 48 }}
        startAdornment={
          <InputAdornment position="start">
            <SearchNormal1 size={16} />
          </InputAdornment>
        }
      />
    </FormControl>
  );

  return (
    <>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
        <Stack direction="row" sx={{ gap: 1 }}>
          <IconButton onClick={toggleDrawer} color="secondary" variant="light">
            <HambergerMenu />
          </IconButton>
          <IconButton
            color="secondary"
            variant="light"
            onClick={() => setFullRow(!fullRow)}
            sx={{ '& svg': { width: 18, height: 18, transform: 'rotate(135deg)' } }}
          >
            <Maximize4 />
          </IconButton>
          <IconButton
            color="secondary"
            id="mail-more-button"
            aria-controls={open ? 'mail-more-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            onClick={handleClick}
            sx={{ transform: 'rotate(90deg)' }}
          >
            <MoreIcon />
          </IconButton>
          <Menu
            id="mail-sort-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            slotProps={{ list: { 'aria-labelledby': 'mail-sort-menu', sx: { p: 1.25, minWidth: 150 } } }}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          >
            <ListItemButton onClick={() => handleFilterClick('all')}>All</ListItemButton>
            <ListItemButton onClick={() => handleFilterClick('from')}>Name</ListItemButton>
            <ListItemButton onClick={() => handleFilterClick('date')}>Date</ListItemButton>
            <ListItemButton onClick={() => handleFilterClick('isStarred')}>Rating</ListItemButton>
            <ListItemButton onClick={() => handleFilterClick('read')}>Unread</ListItemButton>
          </Menu>
        </Stack>

        <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>{searchInput}</Box>

          <Stack direction="row" sx={{ gap: 1 }} alignItems="center" justifyContent="center">
            <IconButton size="small" color="secondary" onClick={handlePrevious} disabled={page === 1}>
              <ArrowLeft2 />
            </IconButton>
            <Typography variant="body1" sx={{ textAlign: 'center' }}>
              {`${start}–${end} of ${totalCount}`}
            </Typography>
            <IconButton size="small" color="secondary" onClick={handleNext} disabled={page === totalPages}>
              <ArrowRight2 />
            </IconButton>
          </Stack>
        </Stack>
      </Stack>
      <Box sx={{ display: { xs: 'block', sm: 'none' } }}>{searchInput}</Box>
    </>
  );
}
