import { MouseEvent, useState } from 'react';

// material-ui
import { useTheme } from '@mui/material';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import ListItemButton from '@mui/material/ListItemButton';
import Menu from '@mui/material/Menu';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project-imports
import CommentSection from './CommentSection';
import ReactQuillDemo from 'components/third-party/ReactQuill';
import Avatar from 'components/@extended/Avatar';
import IconButton from 'components/@extended/IconButton';
import MoreIcon from 'components/@extended/MoreIcon';
import MainCard from 'components/MainCard';

// types
import { MailItem } from 'types/mail';

// assets
import {
  ArrowForward,
  ArrowLeft2,
  AttachSquare,
  Back,
  DocumentDownload,
  DocumentUpload,
  Star1,
  Tag,
  Warning2
} from '@wandersonalwes/iconsax-react';

interface MailDetailProps {
  detailData: MailItem | undefined;
  toggleStar: (value: number) => void;
  toggleImportant: (value: number) => void;
  closeDetail: () => void;
}

// ==============================|| MAIL DETAIL ||============================== //

export default function MailDetail({ closeDetail, detailData, toggleStar, toggleImportant }: MailDetailProps) {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);
  const [text, setText] = useState<string>();
  const [openEditor, setOpenEditor] = useState<boolean>(false);
  const { id, avatar, from, mail, date, isStarred, important, to, attachments = [], comments = [] } = detailData || {};

  const handleMenuClick = (e: MouseEvent<HTMLButtonElement>) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleToggleStar = () => id !== undefined && toggleStar(id);
  const handleToggleImportant = () => id !== undefined && toggleImportant(id);

  return (
    <Stack sx={{ gap: 2, px: 3 }}>
      {/* HEADER */}
      <MainCard content={false} sx={{ p: { xs: 1.5, sm: 1.125 } }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          sx={{ gap: { xs: 3, sm: 1 }, alignItems: 'center', justifyContent: 'space-between' }}
        >
          <Stack direction="row" sx={{ width: { xs: 1, sm: 'auto' }, gap: 1, alignItems: 'center' }}>
            <IconButton onClick={closeDetail} color="secondary" size="small">
              <ArrowLeft2 />
            </IconButton>
            <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
              <Avatar src={avatar} size="md" />
              <Stack>
                <Typography variant="h5">{from}</Typography>
                <Typography color="secondary" variant="body2">
                  From: {`<${mail}>`}
                </Typography>
              </Stack>
            </Stack>
          </Stack>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            sx={{ width: { xs: 1, sm: 'auto' }, gap: { xs: 0, sm: 1 }, alignItems: { xs: 'center', sm: 'center' } }}
          >
            <Typography noWrap color="secondary">
              {date}
            </Typography>
            <Stack direction="row" sx={{ gap: { xs: 1, sm: 0 } }}>
              <Checkbox
                size="small"
                checked={!!isStarred}
                onChange={handleToggleStar}
                icon={<Star1 color={theme.palette.warning.main} style={{ width: 20, height: 20 }} />}
                checkedIcon={<Star1 variant="Bold" color={theme.palette.warning.main} style={{ width: 20, height: 20 }} />}
              />
              <Checkbox
                checked={!!important}
                onChange={handleToggleImportant}
                sx={{ '& svg': { transform: 'rotate(135deg)' } }}
                icon={<Tag variant="Outline" style={{ width: 22, height: 22 }} />}
                checkedIcon={<Tag variant="Bold" color={theme.palette.secondary.main} style={{ width: 22, height: 22 }} />}
              />
              <Checkbox
                icon={<Warning2 variant="Outline" style={{ width: 20, height: 20 }} />}
                checkedIcon={<Warning2 variant="Bold" color={theme.palette.error.light} style={{ width: 20, height: 20 }} />}
              />
              <IconButton
                color="secondary"
                onClick={handleMenuClick}
                aria-controls={openMenu ? 'mail-more-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={openMenu}
                id="detail-more-button"
                sx={{ transform: 'rotate(90deg)' }}
              >
                <MoreIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={openMenu}
                onClose={handleMenuClose}
                slotProps={{ list: { sx: { p: 1.25, minWidth: 150 } } }}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                {['Name', 'Date', 'Rating', 'Unread'].map((label) => (
                  <ListItemButton key={label} onClick={handleMenuClose}>
                    {label}
                  </ListItemButton>
                ))}
              </Menu>
            </Stack>
          </Stack>
        </Stack>
      </MainCard>
      {/* BODY */}
      <Stack sx={{ gap: 2 }}>
        <Typography variant="h4">Lorem Ipsum is simply dummy text</Typography>
        <Typography variant="h5">Dear {from}</Typography>
        <Typography color="secondary">
          Lorem Ipsum is simply dummy text of the printing and <b>typesetting industry.</b> Lorem Ipsum has been the industry&apos;s
          standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type
          <b> specimen book.</b> It has survived not only five centuries, but also the leap into electronic typesetting, remaining
          essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and
          more recently with desktop publishing software like{' '}
          <abbr title="Aldus PageMaker" style={{ cursor: 'help', textTransform: 'uppercase', fontSize: '80%' }}>
            Aldus PageMaker
          </abbr>{' '}
          including versions of Lorem Ipsum.
        </Typography>
        <Typography color="secondary">
          <Typography color="secondary">
            It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The
            point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using &apos;Content here,
            content here&apos;, making it look like readable English. Many desktop publishing packages and web page editors now use Lorem
            Ipsum as their default model text, and a search for &apos;lorem ipsum&apos; will uncover many web sites still in their infancy.
            Various versions have evolved over the years, sometimes by accident, sometimes on purpose
          </Typography>
        </Typography>
        <Stack sx={{ mt: 4, mb: 1 }}>
          <Typography>Kind Regards,</Typography>
          <Typography variant="h5">{to}</Typography>
        </Stack>
        <Divider sx={{ opacity: 0.5 }} />
        {/* ATTACHMENTS */}
        <Stack direction="row" sx={{ gap: 1 }}>
          <AttachSquare />
          <Typography variant="h5">{attachments.length} Attachments</Typography>
        </Stack>
        {attachments.length > 0 && (
          <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ gap: 1 }}>
            {attachments.map((value, index) => (
              <MainCard key={index} sx={{ bgcolor: 'background.default', p: 2 }} content={false}>
                <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
                  <Typography variant="h5">{value}</Typography>
                  <IconButton color="secondary">
                    <DocumentDownload />
                  </IconButton>
                </Stack>
              </MainCard>
            ))}
          </Stack>
        )}
        {/* COMMENTS */}
        {comments.length > 0 && <Divider sx={{ opacity: 0.5 }} />}
        <CommentSection detailData={detailData} />
        {/* ACTION BUTTONS */}
        <Stack direction="row" sx={{ gap: 0.5 }}>
          <Button variant="dashed" startIcon={<Back />} onClick={() => setOpenEditor(true)} sx={{ border: 'none' }}>
            Reply
          </Button>
          <Button variant="dashed" startIcon={<ArrowForward />} onClick={() => setOpenEditor(true)} sx={{ border: 'none' }}>
            Forward
          </Button>
        </Stack>
        {/* REPLY EDITOR */}
        {openEditor && (
          <Stack sx={{ gap: 2 }}>
            <ReactQuillDemo value={text} onChange={setText} placeholder="Type your text here..." />
            <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
              <Stack direction="row" sx={{ gap: 1 }}>
                <IconButton color="secondary">
                  <DocumentUpload />
                </IconButton>
                <IconButton color="secondary">
                  <AttachSquare />
                </IconButton>
              </Stack>
              <Stack direction="row" sx={{ gap: 1 }}>
                <Button variant="text" color="secondary" onClick={() => setOpenEditor(false)}>
                  Cancel
                </Button>
                <Button variant="contained">Reply</Button>
              </Stack>
            </Stack>
          </Stack>
        )}
      </Stack>
    </Stack>
  );
}
