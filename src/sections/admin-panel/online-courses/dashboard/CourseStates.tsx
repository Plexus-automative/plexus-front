// material-ui
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project-imports
import MainCard from 'components/MainCard';
import IconButton from 'components/@extended/IconButton';
import CircularWithLabel from 'components/@extended/progress/CircularWithLabel';

// assets
import { Edit, Eye, Star1, Trash } from '@wandersonalwes/iconsax-react';

// table data
function createData(name: string, teacher: string, amount: number, rating: number, sale: number) {
  return { name, teacher, amount, rating, sale };
}

const rows = [
  createData('Web Designing Course', 'Airi Satou', 200, 4.8, 70),
  createData('UI/UX Training Course', 'Ashton Cox', 100, 5.0, 35),
  createData('PHP Training Course', 'Bradley Greer', 80, 4.9, 43),
  createData('Bootstrap 5 Course', 'Brielle Williamson', 150, 4.4, 84),
  createData('C Training Course', 'Cedric Kelly', 50, 4.3, 54)
];

// ==========================|| DASHBOARD - COURSE STATES ||========================== //

export default function CourseStatesCard() {
  return (
    <MainCard
      title={<Typography variant="h5">Course States</Typography>}
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
              <TableCell>Teacher</TableCell>
              <TableCell>Rating</TableCell>
              <TableCell>Earning</TableCell>
              <TableCell>Sale</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow hover key={index}>
                <TableCell>
                  <Typography color="inherit">{row.name}</Typography>
                </TableCell>
                <TableCell>
                  <Typography>{row.teacher}</Typography>
                </TableCell>
                <TableCell>
                  <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5 }}>
                    <Box component="span" sx={{ color: 'warning.main', mt: 0.5 }}>
                      <Star1 size="18" />
                    </Box>
                    <Typography color="inherit">{row.rating.toFixed(1)}</Typography>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Typography>${row.amount}</Typography>
                </TableCell>
                <TableCell>
                  <CircularWithLabel value={row.sale} color="success" sx={{ strokeLinecap: 'round' }} />
                </TableCell>
                <TableCell align="center">
                  <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5, justifyContent: 'center' }}>
                    <Tooltip title="View">
                      <IconButton color="secondary">
                        <Eye size={20} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton color="primary">
                        <Edit size={20} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton color="error">
                        <Trash size={20} />
                      </IconButton>
                    </Tooltip>
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
