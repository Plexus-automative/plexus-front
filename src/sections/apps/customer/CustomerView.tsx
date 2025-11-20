// material-ui
import useMediaQuery from '@mui/material/useMediaQuery';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';
import ListItemIcon from '@mui/material/ListItemIcon';

// third-party
import { PatternFormat } from 'react-number-format';

// project-imports
import Avatar from 'components/@extended/Avatar';
import Transitions from 'components/@extended/Transitions';
import MainCard from 'components/MainCard';

// assets
import { Link2, Location, Mobile, Sms } from '@wandersonalwes/iconsax-react';

const avatarImage = '/assets/images/users';

// ==============================|| CUSTOMER - VIEW ||============================== //

export default function CustomerView({ data }: any) {
  const downMD = useMediaQuery((theme) => theme.breakpoints.down('md'));

  return (
    <Transitions type="slide" direction="down" in={true}>
      <Grid container spacing={2.5} sx={{ pl: { xs: 0, sm: 5, md: 6, lg: 10, xl: 12 } }}>
        <Grid size={{ xs: 12, sm: 5, md: 4, lg: 4, xl: 3 }}>
          <MainCard>
            <Chip
              label={data.status}
              size="small"
              color="primary"
              sx={{ position: 'absolute', right: 10, top: 10, fontSize: '0.675rem' }}
            />
            <Grid container spacing={3}>
              <Grid size={12}>
                <Stack sx={{ gap: 2.5, alignItems: 'center' }}>
                  <Avatar alt="Avatar 1" size="xl" src={`${avatarImage}/avatar-${data.avatar}.png`} />
                  <Stack sx={{ gap: 0.5, alignItems: 'center' }}>
                    <Typography variant="h5">{data.fatherName}</Typography>
                    <Typography color="secondary">{data.role}</Typography>
                  </Stack>
                </Stack>
              </Grid>
              <Grid size={12}>
                <Divider />
              </Grid>
              <Grid size={12}>
                <Stack direction="row" sx={{ justifyContent: 'space-around', alignItems: 'center' }}>
                  <Stack sx={{ gap: 0.5, alignItems: 'center' }}>
                    <Typography variant="h5">{data.age}</Typography>
                    <Typography color="secondary">Age</Typography>
                  </Stack>
                  <Divider orientation="vertical" flexItem />
                  <Stack sx={{ gap: 0.5, alignItems: 'center' }}>
                    <Typography variant="h5">{data.progress}%</Typography>
                    <Typography color="secondary">Progress</Typography>
                  </Stack>
                  <Divider orientation="vertical" flexItem />
                  <Stack sx={{ gap: 0.5, alignItems: 'center' }}>
                    <Typography variant="h5">{data.orders}</Typography>
                    <Typography color="secondary">Visits</Typography>
                  </Stack>
                </Stack>
              </Grid>
              <Grid size={12}>
                <Divider />
              </Grid>
              <Grid size={12}>
                <List aria-label="main mailbox folders" sx={{ py: 0, '& .MuiListItemIcon-root': { minWidth: 32 } }}>
                  <ListItem secondaryAction={<Typography align="right">{data.email}</Typography>}>
                    <ListItemIcon>
                      <Sms size={18} />
                    </ListItemIcon>
                  </ListItem>
                  <ListItem
                    secondaryAction={
                      <Typography align="right">
                        <PatternFormat displayType="text" format="+1 (###) ###-####" mask="_" defaultValue={data.contact} />
                      </Typography>
                    }
                  >
                    <ListItemIcon>
                      <Mobile size={18} />
                    </ListItemIcon>
                  </ListItem>
                  <ListItem secondaryAction={<Typography align="right">{data.country}</Typography>}>
                    <ListItemIcon>
                      <Location size={18} />
                    </ListItemIcon>
                  </ListItem>
                  <ListItem
                    secondaryAction={
                      <Link align="right" href="https://google.com" target="_blank">
                        https://anshan.dh.url
                      </Link>
                    }
                  >
                    <ListItemIcon>
                      <Link2 size={18} />
                    </ListItemIcon>
                  </ListItem>
                </List>
              </Grid>
            </Grid>
          </MainCard>
        </Grid>
        <Grid size={{ xs: 12, sm: 7, md: 8, lg: 8, xl: 9 }}>
          <Stack sx={{ gap: 2.5 }}>
            <MainCard title="Personal Details">
              <List sx={{ py: 0 }}>
                <ListItem divider={!downMD}>
                  <Grid container spacing={3} size={12}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Stack sx={{ gap: 0.5 }}>
                        <Typography color="secondary">Full Name</Typography>
                        <Typography>{data.fatherName}</Typography>
                      </Stack>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Stack sx={{ gap: 0.5 }}>
                        <Typography color="secondary">Father Name</Typography>
                        <Typography>
                          Mr. {data.firstName} {data.lastName}
                        </Typography>
                      </Stack>
                    </Grid>
                  </Grid>
                </ListItem>
                <ListItem divider={!downMD}>
                  <Grid container spacing={3} size={12}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Stack sx={{ gap: 0.5 }}>
                        <Typography color="secondary">Country</Typography>
                        <Typography>{data.country}</Typography>
                      </Stack>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Stack sx={{ gap: 0.5 }}>
                        <Typography color="secondary">Zip Code</Typography>
                        <Typography>
                          <PatternFormat displayType="text" format="### ###" mask="_" defaultValue={data.contact} />
                        </Typography>
                      </Stack>
                    </Grid>
                  </Grid>
                </ListItem>
                <ListItem>
                  <Stack sx={{ gap: 0.5 }}>
                    <Typography color="secondary">Address</Typography>
                    <Typography>{data.address}</Typography>
                  </Stack>
                </ListItem>
              </List>
            </MainCard>
            <MainCard title="About me">
              <Typography color="secondary">
                Hello, I’m {data.fatherName} {data.role} based in international company, {data.about}
              </Typography>
            </MainCard>
          </Stack>
        </Grid>
      </Grid>
    </Transitions>
  );
}
