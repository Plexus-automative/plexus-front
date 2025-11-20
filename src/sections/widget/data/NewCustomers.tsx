// material-ui
import Avatar from '@mui/material/Avatar';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project-imports
import Dot from 'components/@extended/Dot';
import MainCard from 'components/MainCard';
import SimpleBar from 'components/third-party/SimpleBar';

// assets
import { Clock } from '@wandersonalwes/iconsax-react';

const Avatar1 = '/assets/images/users/avatar-1.png';
const Avatar2 = '/assets/images/users/avatar-2.png';
const Avatar3 = '/assets/images/users/avatar-3.png';
const Avatar4 = '/assets/images/users/avatar-4.png';
const Avatar5 = '/assets/images/users/avatar-5.png';

// ===========================|| DATA WIDGET - NEW CUSTOMERS ||=========================== //

export default function NewCustomers() {
  return (
    <MainCard title="New Customers" content={false}>
      <SimpleBar sx={{ height: 432 }}>
        <CardContent>
          <Grid container spacing={3} sx={{ alignItems: 'center' }}>
            <Grid size={12}>
              <Grid container spacing={2}>
                <Grid>
                  <Avatar alt="coverimage" src={Avatar1} />
                </Grid>
                <Grid size="grow">
                  <Typography variant="subtitle1">Alex Thompson</Typography>
                  <Grid container spacing={2}>
                    <Grid size="grow">
                      <Typography sx={{ color: 'text.secondary' }}>Cheers!</Typography>
                    </Grid>
                    <Grid sx={{ display: 'flex' }}>
                      <Dot color="success" size={10} />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Grid size={12}>
              <Grid container spacing={2}>
                <Grid>
                  <Avatar alt="coverimage" src={Avatar2} />
                </Grid>
                <Grid size="grow">
                  <Typography variant="subtitle1">John Doue</Typography>
                  <Grid container spacing={2}>
                    <Grid size="grow">
                      <Typography sx={{ color: 'text.secondary' }}>stay hungry stay foolish!</Typography>
                    </Grid>
                    <Grid sx={{ display: 'flex' }}>
                      <Dot color="success" size={10} />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Grid size={12}>
              <Grid container spacing={2}>
                <Grid>
                  <Avatar alt="coverimage" src={Avatar3} />
                </Grid>
                <Grid size="grow">
                  <Typography variant="subtitle1">Alex Thompson</Typography>
                  <Grid container spacing={2}>
                    <Grid size="grow">
                      <Typography sx={{ color: 'text.secondary' }}>Cheers!</Typography>
                    </Grid>
                    <Grid>
                      <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
                        <Clock size={14} />
                        <Typography sx={{ color: 'text.secondary' }}>30 min ago</Typography>
                      </Stack>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Grid size={12}>
              <Grid container spacing={2}>
                <Grid>
                  <Avatar alt="coverimage" src={Avatar4} />
                </Grid>
                <Grid size="grow">
                  <Typography variant="subtitle1">John Doue</Typography>
                  <Grid container spacing={2}>
                    <Grid size="grow">
                      <Typography sx={{ color: 'text.secondary' }}>stay hungry stay foolish!</Typography>
                    </Grid>
                    <Grid>
                      <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
                        <Clock size={14} />
                        <Typography sx={{ color: 'text.secondary' }}>10 min ago</Typography>
                      </Stack>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Grid size={12}>
              <Grid container spacing={2}>
                <Grid>
                  <Avatar alt="coverimage" src={Avatar5} />
                </Grid>
                <Grid size="grow">
                  <Typography variant="subtitle1">Shirley Hoe</Typography>
                  <Grid container spacing={2}>
                    <Grid size="grow">
                      <Typography sx={{ color: 'text.secondary' }}>Cheers!</Typography>
                    </Grid>
                    <Grid>
                      <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
                        <Clock size={14} />
                        <Typography sx={{ color: 'text.secondary' }}>30 min ago</Typography>
                      </Stack>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Grid size={12}>
              <Grid container spacing={2}>
                <Grid>
                  <Avatar alt="coverimage" src={Avatar1} />
                </Grid>
                <Grid size="grow">
                  <Typography variant="subtitle1">Alex Thompson</Typography>
                  <Grid container spacing={2}>
                    <Grid size="grow">
                      <Typography sx={{ color: 'text.secondary' }}>Cheers!</Typography>
                    </Grid>
                    <Grid sx={{ display: 'flex' }}>
                      <Dot color="success" size={10} />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Grid size={12}>
              <Grid container spacing={2}>
                <Grid>
                  <Avatar alt="coverimage" src={Avatar2} />
                </Grid>
                <Grid size="grow">
                  <Typography variant="subtitle1">John Doue</Typography>
                  <Grid container spacing={2}>
                    <Grid size="grow">
                      <Typography sx={{ color: 'text.secondary' }}>stay hungry stay foolish!</Typography>
                    </Grid>
                    <Grid sx={{ display: 'flex' }}>
                      <Dot color="success" size={10} />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Grid size={12}>
              <Grid container spacing={2}>
                <Grid>
                  <Avatar alt="coverimage" src={Avatar3} />
                </Grid>
                <Grid size="grow">
                  <Typography variant="subtitle1">Alex Thompson</Typography>
                  <Grid container spacing={2}>
                    <Grid size="grow">
                      <Typography sx={{ color: 'text.secondary' }}>Cheers!</Typography>
                    </Grid>
                    <Grid>
                      <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
                        <Clock size={14} />
                        <Typography sx={{ color: 'text.secondary' }}>10 min ago</Typography>
                      </Stack>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Grid size={12}>
              <Grid container spacing={2}>
                <Grid>
                  <Avatar alt="coverimage" src={Avatar4} />
                </Grid>
                <Grid size="grow">
                  <Typography variant="subtitle1">John Doue</Typography>
                  <Grid container spacing={2}>
                    <Grid size="grow">
                      <Typography sx={{ color: 'text.secondary' }}>stay hungry stay foolish!</Typography>
                    </Grid>
                    <Grid>
                      <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
                        <Clock size={14} />
                        <Typography sx={{ color: 'text.secondary' }}>10 min ago</Typography>
                      </Stack>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Grid size={12}>
              <Grid container spacing={2}>
                <Grid>
                  <Avatar alt="coverimage" src={Avatar5} />
                </Grid>
                <Grid size="grow">
                  <Typography variant="subtitle1">Shirley Hoe</Typography>
                  <Grid container spacing={2}>
                    <Grid size="grow">
                      <Typography sx={{ color: 'text.secondary' }}>Cheers!</Typography>
                    </Grid>
                    <Grid>
                      <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
                        <Clock size={14} />
                        <Typography sx={{ color: 'text.secondary' }}>30 min ago</Typography>
                      </Stack>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </SimpleBar>
    </MainCard>
  );
}
