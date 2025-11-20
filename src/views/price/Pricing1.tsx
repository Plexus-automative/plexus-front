'use client';

// material-ui
import { alpha } from '@mui/material/styles';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';

// project-imports
import Pricing1 from 'sections/pricing/Pricing1';
import { useBuyNowLink } from 'hooks/getBuyNowLink';

// assets
import { InfoCircle } from '@wandersonalwes/iconsax-react';

// ==============================|| PRICING ||============================== //

export default function Pricing() {
  const { buyNowLink } = useBuyNowLink();

  return (
    <>
      <Alert
        severity="warning"
        variant="border"
        icon={<InfoCircle variant="Bold" />}
        sx={(theme) => ({ '&.MuiAlert-colorWarning': { backgroundColor: alpha(theme.palette.warning.lighter, 0.15) }, mb: 3 })}
      >
        <AlertTitle sx={{ fontWeight: 500, color: 'warning.dark' }}>Note</AlertTitle>
        <Typography variant="h6">
          The pricing provided is for demonstration purposes only. For actual product pricing, please refer to the official{' '}
          <Link color="warning.dark" underline="hover" variant="subtitle1" target="_blank" href={buyNowLink}>
            Pricing Page
          </Link>
        </Typography>
      </Alert>
      <Pricing1
        title="Quality is never an accident. It is always the result of intelligent effort"
        description="It makes no difference what the price is, it all makes senses to us."
      />
    </>
  );
}
