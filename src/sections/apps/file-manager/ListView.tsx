import { MouseEvent, useState, useMemo } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import AvatarGroup from '@mui/material/AvatarGroup';
import CardMedia from '@mui/material/CardMedia';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import ListItemButton from '@mui/material/ListItemButton';
import Menu from '@mui/material/Menu';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// third-party
import { useReactTable, getCoreRowModel, ColumnDef, flexRender } from '@tanstack/react-table';

// project-imports
import FilePreview from './FilePreview';
import FileShare from './ShareModal';
import Avatar from 'components/@extended/Avatar';
import MainCard from 'components/MainCard';
import MoreIcon from 'components/@extended/MoreIcon';

//types
import { FileItem } from 'types/file-manager';

// assets
import { Star1 } from '@wandersonalwes/iconsax-react';

interface FileTableProps {
  files: FileItem[];
  selectedItems: number[];
  setSelectedItems: (items: number[]) => void;
}

// ==============================|| LIST VIEW - ACTIONS ||============================== //

function RowActions() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  return (
    <>
      <IconButton
        color="secondary"
        id="table-button"
        onClick={handleClick}
        aria-controls={open ? 'table-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
      >
        <MoreIcon />
      </IconButton>
      <Menu
        id="file-data-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{
          list: { 'aria-labelledby': 'file-data-menu', sx: { p: 1.25, minWidth: 150 } }
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <ListItemButton onClick={handleClose}>Edit</ListItemButton>
        <ListItemButton onClick={handleClose}>Delete</ListItemButton>
      </Menu>
    </>
  );
}

// ==============================|| FILE MANAGER - CARD TABLE ||============================== //

export default function ListView({ files, selectedItems, setSelectedItems }: FileTableProps) {
  const theme = useTheme();
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);

  const [previewDrawer, setPreviewDrawer] = useState<boolean>(false);
  const [shareModal, setShareModal] = useState<boolean>(false);

  const columns = useMemo<ColumnDef<FileItem>[]>(
    () => [
      {
        id: 'select',
        cell: ({ row }) => (
          <Checkbox
            checked={selectedItems.includes(row.original.id)}
            onChange={(e) => {
              const isChecked = e.target.checked;
              if (isChecked) setSelectedItems([...selectedItems, row.original.id]);
              else setSelectedItems(selectedItems.filter((id) => id !== row.original.id));
            }}
          />
        )
      },
      {
        id: 'file',
        cell: ({ row }) => (
          <Stack
            direction="row"
            sx={{ alignItems: 'center', gap: 1, cursor: 'pointer' }}
            onClick={() => {
              setSelectedFile(row.original);
              setPreviewDrawer(!previewDrawer);
            }}
          >
            <CardMedia
              component="img"
              image={row.original.img}
              title={row.original.name}
              sx={{ width: 35, minHeight: 35, height: 'auto', borderRadius: 0.5 }}
            />
            <Typography variant="subtitle1">{row.original.name}</Typography>
          </Stack>
        )
      },
      {
        accessorKey: 'size'
      },
      {
        accessorKey: 'date'
      },
      {
        id: 'avatars',
        cell: ({ row }) => (
          <Box sx={{ width: 80 }}>
            <AvatarGroup
              max={3}
              sx={{
                cursor: 'pointer',
                justifyContent: 'flex-end',
                '.MuiAvatarGroup-avatar': { width: 24, height: 24, fontSize: '0.75rem' }
              }}
              onClick={() => setShareModal(true)}
            >
              {row.original.avatar?.map((avatar, index) => (
                <Avatar size="xs" key={index} alt={`User ${index + 1}`} src={avatar} />
              ))}
            </AvatarGroup>
          </Box>
        )
      },
      {
        id: 'actions',
        cell: ({ row }) => (
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
            <Checkbox
              checked={row.original.selected}
              icon={<Star1 size="32" color={theme.palette.warning.main} />}
              checkedIcon={<Star1 size="32" variant="Bold" color={theme.palette.warning.main} />}
            />
            <RowActions />
          </Stack>
        )
      }
    ],
    [selectedItems, previewDrawer, theme.palette.warning.main, setSelectedFile, setPreviewDrawer, setShareModal, setSelectedItems]
  );

  const table = useReactTable({ data: files, columns, getCoreRowModel: getCoreRowModel() });

  return (
    <MainCard content={false} sx={{ bgcolor: 'secondary.200', p: 1.25 }}>
      <TableContainer>
        <Table sx={{ '& .MuiTableCell-root': { borderWidth: 10, borderColor: 'secondary.200' } }}>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow hover key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <FilePreview openDrawer={previewDrawer} setOpenDrawer={setPreviewDrawer} selectedFile={selectedFile} />
      <FileShare setOpenModal={setShareModal} openModal={shareModal} />
    </MainCard>
  );
}
