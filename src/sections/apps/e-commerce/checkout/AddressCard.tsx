// material-ui
import { Theme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project-imports
import MainCard from 'components/MainCard';

// types
import { Address } from 'types/e-commerce';

// assets
import { Edit } from '@wandersonalwes/iconsax-react';

interface AddressCardProps {
  address: Address | null;
  change?: boolean;
  handleClickOpen?: (billingAddress: Address) => void;
  billingAddressHandler?: (billingAddress: Address) => void;
}
// ==============================|| CHECKOUT - ADDRESS CARD ||============================== //

export default function AddressCard({ address, change, handleClickOpen, billingAddressHandler }: AddressCardProps) {
  return (
    <MainCard
      sx={(theme: Theme) => ({ '&:hover': { boxShadow: theme.customShadows.primary }, cursor: 'pointer' })}
      onClick={() => {
        if (billingAddressHandler && address) {
          billingAddressHandler(address);
        }
      }}
    >
      {address && (
        <Grid container spacing={0.5}>
          <Grid size={12}>
            <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
              <Stack direction="row" sx={{ gap: 0.5, alignItems: 'center' }}>
                <Typography variant="subtitle1">{address.name}</Typography>
                <Typography sx={{ color: 'text.secondary', textTransform: 'capitalize' }}>({address.destination})</Typography>
                {address.isDefault && (
                  <Chip sx={{ color: 'primary.main', bgcolor: 'primary.lighter', borderRadius: '10px' }} label="Default" size="small" />
                )}
              </Stack>
              {change && (
                <Button
                  variant="outlined"
                  size="small"
                  color="secondary"
                  startIcon={<Edit />}
                  onClick={() => {
                    if (handleClickOpen) {
                      handleClickOpen(address);
                    }
                  }}
                >
                  Change
                </Button>
              )}
            </Stack>
          </Grid>
          <Grid size={12}>
            <Stack sx={{ gap: 2 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {`${address.building}, ${address.street}, ${address.city}, ${address.state}, ${address.country} - ${address.post}`}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {address.phone}
              </Typography>
            </Stack>
          </Grid>
        </Grid>
      )}
    </MainCard>
  );
}
