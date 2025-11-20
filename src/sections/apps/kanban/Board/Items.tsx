import { useState, CSSProperties, MouseEvent } from 'react';

// material-ui
import { Theme, alpha } from '@mui/material/styles';
import CardMedia from '@mui/material/CardMedia';
import Link from '@mui/material/Link';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// third-party
import { Draggable, DraggingStyle, NotDraggingStyle } from '@hello-pangea/dnd';

// project-imports
import AlertItemDelete from './AlertItemDelete';
import EditStory from '../Backlogs/EditStory';

import { openSnackbar } from 'api/snackbar';
import { deleteItem, handlerKanbanDialog, useGetBacklogs } from 'api/kanban';
import IconButton from 'components/@extended/IconButton';
import MoreIcon from 'components/@extended/MoreIcon';

// assets
import { Hierarchy } from '@wandersonalwes/iconsax-react';

// types
import { KanbanItem, KanbanUserStory } from 'types/kanban';
import { SnackbarProps } from 'types/snackbar';

const backImage = '/assets/images/profile';

interface Props {
  item: KanbanItem;
  index: number;
}

// item drag wrapper
function getDragWrapper(
  isDragging: boolean,
  draggableStyle: DraggingStyle | NotDraggingStyle | undefined,
  theme: Theme,
  radius: string
): CSSProperties | undefined {
  return {
    userSelect: 'none',
    margin: `0 0 ${8}px 0`,
    padding: 2,
    border: '1px solid',
    borderColor: theme.palette.divider,
    backgroundColor: isDragging ? alpha(theme.palette.background.paper, 0.99) : theme.palette.background.paper,
    borderRadius: radius,
    ...draggableStyle
  };
}

// ==============================|| KANBAN BOARD - ITEMS ||============================== //

export default function Items({ item, index }: Props) {
  const { backlogs } = useGetBacklogs();

  const backProfile = item.image && `${backImage}/${item.image}`;
  const itemStory = backlogs?.userStory.filter((story: KanbanUserStory) => story?.itemIds?.filter((itemId) => itemId === item.id)[0])[0];

  const handlerDetails = (id: string) => {
    handlerKanbanDialog(id);
  };

  const [anchorEl, setAnchorEl] = useState<Element | (() => Element) | null | undefined>(null);
  const handleClick = (event: MouseEvent<HTMLButtonElement> | undefined) => {
    setAnchorEl(event?.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const [open, setOpen] = useState(false);
  const handleModalClose = (status: boolean) => {
    setOpen(false);
    if (status) {
      deleteItem(item.id);
      openSnackbar({
        open: true,
        message: 'Task Deleted successfully',
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
        variant: 'alert',
        alert: {
          color: 'success'
        }
      } as SnackbarProps);
    }
  };

  const [openStoryDrawer, setOpenStoryDrawer] = useState<boolean>(false);
  const handleStoryDrawerOpen = () => {
    setOpenStoryDrawer((prevState) => !prevState);
  };

  const editStory = () => {
    setOpenStoryDrawer((prevState) => !prevState);
  };

  return (
    <Draggable key={item.id} draggableId={item.id} index={index}>
      {(provided, snapshot) => (
        <Box
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          sx={(theme) => ({ ...getDragWrapper(snapshot.isDragging, provided.draggableProps.style, theme, `12px`) })}
        >
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: itemStory ? -0.75 : 0 }}>
            <Typography
              onClick={() => handlerDetails(item.id)}
              variant="subtitle1"
              sx={{
                display: 'inline-block',
                width: 'calc(100% - 34px)',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                verticalAlign: 'middle',
                cursor: 'pointer',
                '&:hover': {
                  textDecoration: 'underline'
                }
              }}
            >
              {item.title}
            </Typography>

            <IconButton size="small" color="secondary" onClick={handleClick} aria-controls="menu-comment" aria-haspopup="true">
              <MoreIcon />
            </IconButton>
            <Menu
              id="menu-comment"
              anchorEl={anchorEl}
              keepMounted
              open={Boolean(anchorEl)}
              onClose={handleClose}
              variant="selectedMenu"
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right'
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right'
              }}
            >
              <MenuItem
                onClick={() => {
                  handleClose();
                  handlerDetails(item.id);
                }}
              >
                Edit
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleClose();
                  setOpen(true);
                }}
              >
                Delete
              </MenuItem>
            </Menu>
            <AlertItemDelete title={item.title} open={open} handleClose={handleModalClose} />
          </Stack>
          {itemStory && (
            <>
              <Stack direction="row" sx={{ gap: 0.5, alignItems: 'center', color: 'primary.dark' }}>
                <Tooltip title="User Story">
                  <Hierarchy size={16} />
                </Tooltip>
                <Tooltip title={itemStory.title}>
                  <Link variant="caption" underline="hover" onClick={editStory} sx={{ cursor: 'pointer', pt: 0.5 }}>
                    User Story #{itemStory.id}
                  </Link>
                </Tooltip>
              </Stack>
              <EditStory story={itemStory} open={openStoryDrawer} handleDrawerOpen={handleStoryDrawerOpen} />
            </>
          )}
          {backProfile && (
            <CardMedia component="img" image={backProfile} sx={{ width: '100%', borderRadius: 1, mt: 1.5 }} title="Slider5 image" />
          )}
        </Box>
      )}
    </Draggable>
  );
}
