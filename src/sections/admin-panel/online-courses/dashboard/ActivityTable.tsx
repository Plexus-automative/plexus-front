// material-ui
import Avatar from '@mui/material/Avatar';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

// project-imports
import MainCard from 'components/MainCard';

// assets
import { Star1 } from '@wandersonalwes/iconsax-react';
const Avatar1 = '/assets/images/online-panel/avatar-1.jpg';
const Avatar2 = '/assets/images/online-panel/avatar-2.jpg';
const Avatar3 = '/assets/images/online-panel/avatar-3.jpg';
const Avatar4 = '/assets/images/online-panel/avatar-4.jpg';
const Avatar5 = '/assets/images/online-panel/avatar-5.jpg';

// table data
function createData(name: string, avatar: string, qualification: string, rating: number) {
  return { name, avatar, qualification, rating };
}

const rows = [
  createData('Airi Satou', Avatar1, 'Developer', 5.0),
  createData('Ashton Cox', Avatar2, 'Junior Technical', 4.5),
  createData('Bradley Greer', Avatar3, 'Sales Assistant', 4.3),
  createData('Brielle Williamson', Avatar4, 'JavaScript Developer', 4.9),
  createData('Airi Satou', Avatar5, 'Developer', 5.0)
];

// ==========================|| DASHBOARD - ACTIVITY TABLE ||========================== //

export default function ActivityTableCard() {
  return (
    <MainCard
      title={<Typography variant="h5">Teacher Details</Typography>}
      content={false}
      secondary={
        <Link href="#" variant="h6" color="primary">
          View All
        </Link>
      }
    >
      <TableContainer>
        <Table sx={{ minWidth: 560 }}>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Qualification</TableCell>
              <TableCell>Rating</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow hover key={index}>
                <TableCell>
                  <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5 }}>
                    <Avatar alt={row.name} src={row.avatar} />
                    <Typography color="inherit">{row.name}</Typography>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Typography>{row.qualification}</Typography>
                </TableCell>
                <TableCell>
                  <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5, color: 'warning.main' }}>
                    <Star1 size="18" />
                    <Typography sx={{ color: 'text.primary' }}>{row.rating.toFixed(1)}</Typography>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </MainCard>
  );
}
