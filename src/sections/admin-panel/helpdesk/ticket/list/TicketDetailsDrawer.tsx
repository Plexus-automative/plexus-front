import { Fragment, MouseEvent, useCallback, useState } from 'react';

// material-ui
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CardMedia from '@mui/material/CardMedia';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import ListItemButton from '@mui/material/ListItemButton';
import Menu from '@mui/material/Menu';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// third-party
import { useDropzone } from 'react-dropzone';

// project-imports
import Avatar from 'components/@extended/Avatar';
import IconButton from 'components/@extended/IconButton';
import ReactQuillDemo from 'components/third-party/ReactQuill';
import SimpleBar from 'components/third-party/SimpleBar';
import { messageData } from 'data/helpdesk';
import SyntaxHighlight from 'utils/SyntaxHighlight';

// types
import { MessageCardProps } from 'types/helpdesk';

// assets
import { Add, ArrowDown2, AttachSquare, Calendar, Edit, TickCircle, Trash } from '@wandersonalwes/iconsax-react';

const Avatar1 = '/assets/images/users/avatar-2.png';

// message common card
function MessageCard({
  avatar,
  supportAgentName,
  role = 'Support Agent',
  timeAgo,
  message,
  images = [],
  codeString,
  customerName,
  onEdit,
  onDelete
}: MessageCardProps) {
  return (
    <Fragment>
      <Stack sx={{ px: 3, py: 2.5, gap: 2 }}>
        <Stack sx={{ gap: 3, alignItems: 'center' }} direction="row">
          <Avatar size="xl" src={avatar} />
          <Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ gap: { xs: 0, sm: 1 } }}>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {supportAgentName}
              </Typography>
              <Chip size="small" label={role} sx={{ color: 'text.secondary' }} />
            </Stack>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              {timeAgo}
            </Typography>
          </Stack>
          <Stack direction="row" sx={{ ml: 'auto' }}>
            <IconButton color="secondary" size="small" onClick={onEdit}>
              <Edit />
            </IconButton>
            <IconButton color="secondary" size="small" onClick={onDelete}>
              <Trash />
            </IconButton>
          </Stack>
        </Stack>
        <Stack sx={{ gap: 2 }}>
          <Typography variant="body1">hello {customerName},</Typography>
          <Box dangerouslySetInnerHTML={{ __html: message }} sx={{ '& p': { margin: 0, fontSize: '0.875rem', lineHeight: 1.5 } }} />
        </Stack>
        {images.length > 0 && (
          <Stack direction="row" sx={{ gap: 2.5, flexWrap: 'wrap' }}>
            {images.map((image, imgIdx) => (
              <CardMedia key={imgIdx} component="img" sx={{ height: 42, width: 64 }} src={image} />
            ))}
          </Stack>
        )}
        {codeString && <SyntaxHighlight customStyle={{ margin: 0 }}>{codeString}</SyntaxHighlight>}
      </Stack>
      <Divider />
    </Fragment>
  );
}

interface TicketDetailsDrawerProps {
  isOpen: boolean;
  handleDrawerOpen: () => void;
}

// ==============================|| TICKET DETAILS - SIDE DRAWER ||============================== //

export default function TicketDetailsDrawer({ isOpen, handleDrawerOpen }: TicketDetailsDrawerProps) {
  const [alertVisible, setAlertVisible] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [text, setText] = useState('');
  const openMenu = Boolean(anchorEl);

  const handleChange = (value: string) => {
    setText(value);
  };

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    console.log('Edit clicked');
  };

  const handleDelete = () => {
    console.log('Delete clicked');
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    console.log('Accepted files:', acceptedFiles);
    // Handle the files (e.g., upload or display them)
  }, []);

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    accept: { 'image/*': [] }, // Accept only image files
    noClick: true, // Disable click-to-open
    noKeyboard: true // Disable keyboard events
  });

  return (
    <Drawer
      sx={{ ml: isOpen ? 3 : 0, flexShrink: 0, zIndex: 1200, overflowX: 'hidden' }}
      slotProps={{ paper: { sx: { width: { xs: 375, md: 550 }, border: 'none', borderRadius: '0px' } } }}
      variant="temporary"
      anchor="right"
      open={isOpen}
      ModalProps={{ keepMounted: true }}
      onClose={handleDrawerOpen}
    >
      {isOpen && (
        <>
          <Box sx={{ p: 3 }}>
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography component="div" variant="h5">
                Chrome bug The page uses a roller to slide under a black block
                <Chip size="small" label="PRIVATE" color="error" sx={{ ml: 1 }} variant="light" />
              </Typography>

              <Tooltip title="Close">
                <IconButton color="secondary" sx={{ p: 0 }} onClick={handleDrawerOpen} size="large">
                  <Add size={20} style={{ transform: 'rotate(45deg)' }} />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>
          <Divider />
          <SimpleBar sx={{ overflowX: 'hidden', height: '100vh' }}>
            <Stack sx={{ px: 3, py: 2.5, justifyContent: 'space-between' }} direction="row">
              <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
                <Chip
                  size="small"
                  icon={<TickCircle />}
                  label="closed"
                  color="success"
                  sx={{ px: 1, svg: { height: 14, width: 14 } }}
                  variant="light"
                />
                <Avatar variant="rounded" color="primary" sx={{ height: 20, width: 20 }}>
                  A
                </Avatar>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  Alpha pro
                </Typography>
              </Stack>
              <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
                <Calendar size={18} />
                <Typography variant="body1">Jan,1st,2019</Typography>
              </Stack>
            </Stack>
            <Divider />
            <Stack sx={{ px: 3, py: 2.5, gap: 3 }} direction="row">
              <Avatar sx={{ height: 60, width: 60 }} src={Avatar1} />
              <Stack sx={{ gap: 2 }}>
                {alertVisible && (
                  <Alert severity="warning" icon={false} variant="border" onClose={() => setAlertVisible(false)}>
                    <strong>Note!</strong> This ticket is closed. If you want to re-open it, just post a reply below.
                  </Alert>
                )}
                <ReactQuillDemo value={text} onChange={handleChange} placeholder="Write a reply" />
                <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ gap: 1.5, alignItems: 'flex-start' }}>
                  <Button
                    color="primary"
                    size="small"
                    sx={{ border: 'none' }}
                    endIcon={<ArrowDown2 />}
                    variant="dashed"
                    onClick={handleClick}
                  >
                    Primary
                  </Button>
                  <Box {...getRootProps()} sx={{ display: 'inline-block' }}>
                    <input {...getInputProps()} />
                    <Button
                      color="secondary"
                      size="small"
                      sx={{ border: 'none' }}
                      startIcon={<AttachSquare />}
                      variant="dashed"
                      onClick={open}
                    >
                      Add Attachment
                    </Button>
                  </Box>
                </Stack>
              </Stack>
            </Stack>
            <Menu
              id="wallet-menu"
              anchorEl={anchorEl}
              open={openMenu}
              onClose={handleClose}
              slotProps={{ list: { 'aria-labelledby': 'wallet-button', sx: { p: 1.25, minWidth: 150 } } }}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <ListItemButton onClick={handleClose}>Action</ListItemButton>
              <ListItemButton onClick={handleClose}>Another Action</ListItemButton>
              <ListItemButton onClick={handleClose}>Something else here</ListItemButton>
              <Divider />
              <ListItemButton onClick={handleClose}>Separate link</ListItemButton>
            </Menu>
            <Divider />
            {messageData.map((data, index) => (
              <MessageCard
                key={index}
                avatar={data.avatar}
                supportAgentName={data.supportAgentName}
                customerName={data.customerName}
                timeAgo={data.timeAgo}
                message={data.message}
                images={data.images}
                codeString={data.codeString as string}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </SimpleBar>
        </>
      )}
    </Drawer>
  );
}
