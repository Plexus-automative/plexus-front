// material-ui
import { useTheme } from '@mui/material';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project-imports
import Avatar from 'components/@extended/Avatar';
import MainCard from 'components/MainCard';

// types
import { FilterData } from 'types/file-manager';

// ==============================|| FILE OVERVIEW CARD ||============================== //

export default function FileOverviewCard({ item }: { item: FilterData }) {
  const theme = useTheme();
  const IconComponent = item.icon;

  return (
    <MainCard sx={{ '&:hover': { boxShadow: theme.customShadows.z1 } }}>
      <Stack sx={{ gap: 3 }}>
        <Stack direction="row" sx={{ gap: 2, alignItems: 'center' }}>
          <Avatar variant="rounded" color={item.color!} size="lg" sx={{ width: 48, height: 48 }}>
            {IconComponent && <IconComponent variant="Bold" />}
          </Avatar>
        </Stack>
        <Stack direction="row" sx={{ alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <Stack>
            <Typography variant="subtitle1">{item.title}</Typography>
            <Typography variant="h6">{item.files} Files</Typography>
          </Stack>
          <Chip color={item.color} variant="filled" label={item.storageData} size="small" />
        </Stack>
      </Stack>
    </MainCard>
  );
}
