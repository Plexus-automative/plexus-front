// material-ui
import { useTheme } from '@mui/material/styles';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

// project-imports
import Avatar from 'components/@extended/Avatar';
import IconButton from 'components/@extended/IconButton';

// types
import { MailItem } from 'types/mail';

// assets
import { ArchiveBox, AttachSquare, EyeSlash, Sms, Star1, Tag, Trash } from '@wandersonalwes/iconsax-react';

interface MailListTableProps {
  data: MailItem[];
  fullRow: boolean;
  setDetailData: (mail: MailItem) => void;
  toggleStar: (id: number) => void;
  toggleImportant: (id: number) => void;
  openDetail: () => void;
}

// ==============================|| MAIL LIST ||============================== //

export default function MailListTable({ data, toggleImportant, toggleStar, fullRow, setDetailData, openDetail }: MailListTableProps) {
  const theme = useTheme();

  return (
    <TableContainer
      sx={{
        overflowX: 'auto',
        '&::-webkit-scrollbar': { height: 6 },
        '&::-webkit-scrollbar-thumb': { bgcolor: 'secondary.light', borderRadius: 4 },
        '&::-webkit-scrollbar-track': { bgcolor: 'secondary.lighter', borderRadius: 4 }
      }}
    >
      <Table>
        <TableBody>
          {data?.map((mail, index) => (
            <TableRow
              key={index}
              sx={{
                mb: 1,
                display: 'block',
                position: 'relative',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                '& .MuiTableCell-root': { border: 'none' },
                ...(mail.read === false && { backgroundColor: 'background.default' }),
                ...(fullRow === false && { '& td': { p: '4px 8px', borderBottom: 'none' } }),
                cursor: 'pointer',
                transition: 'background-color 0.2s ease-in-out',
                '&:hover': { '& .hover-actions': { opacity: 1, transform: 'translateY(-50%)' } }
              }}
            >
              <TableCell>
                <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5 }}>
                  <Checkbox />
                  <Checkbox
                    checked={!!mail.isStarred}
                    onChange={() => toggleStar(mail.id)}
                    sx={{ '& svg': { width: 18, height: 18 } }}
                    icon={<Star1 color={theme.palette.warning.main} />}
                    checkedIcon={<Star1 variant="Bold" color={theme.palette.warning.main} />}
                  />
                  <Checkbox
                    checked={!!mail.important}
                    onChange={() => toggleImportant(mail.id)}
                    sx={{ '& svg': { transform: 'rotate(135deg)' } }}
                    icon={<Tag variant="Outline" />}
                    checkedIcon={<Tag variant="Bold" color={theme.palette.secondary.main} />}
                  />
                </Stack>
              </TableCell>

              <TableCell
                onClick={() => {
                  setDetailData(mail);
                  openDetail();
                }}
              >
                <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
                  <Avatar src={mail.avatar} size={fullRow ? 'md' : 'sm'} />
                  <Typography variant="subtitle1" noWrap>
                    {mail.from}
                  </Typography>
                </Stack>
              </TableCell>

              <TableCell
                sx={{ width: 1 }}
                onClick={() => {
                  setDetailData(mail);
                  openDetail();
                }}
              >
                <Stack direction="row" sx={{ width: { xs: 220, md: 350, lg: 480, xl: 600 }, gap: 1 }}>
                  <Typography
                    noWrap
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      ...(mail.read === false && { fontWeight: 500 })
                    }}
                  >
                    {mail.snippet}
                  </Typography>
                  {mail.label?.map((value, i) => (
                    <Chip key={i} label={value} variant="light" color={value === 'Forums' ? 'warning' : 'primary'} size="small" />
                  ))}
                </Stack>
              </TableCell>
              <TableCell>
                {mail.label && (
                  <IconButton color="secondary">
                    <AttachSquare />
                  </IconButton>
                )}
              </TableCell>

              <TableCell align="right">
                <Stack
                  direction="row"
                  className="hover-actions"
                  sx={{
                    position: 'absolute',
                    right: 16,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    opacity: 0,
                    gap: 0.5,
                    bgcolor: 'background.paper',
                    p: 0.75,
                    borderRadius: 1,
                    boxShadow: `0px 8px 24px rgba(126, 126, 126, 0.5)}`
                  }}
                >
                  <IconButton color="secondary">
                    <ArchiveBox />
                  </IconButton>
                  <IconButton color="secondary">
                    <Sms />
                  </IconButton>
                  <IconButton color="secondary">
                    <Trash />
                  </IconButton>
                  <IconButton color="secondary">
                    <EyeSlash />
                  </IconButton>
                </Stack>
                <Typography noWrap sx={{ ...(mail.read === false && { fontWeight: 500 }) }}>
                  {mail.date}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
