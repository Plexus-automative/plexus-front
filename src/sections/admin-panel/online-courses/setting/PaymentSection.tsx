'use client';

import { useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Button from '@mui/material/Button';
import CardMedia from '@mui/material/CardMedia';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project-imports
import MainCard from 'components/MainCard';
import { ThemeMode } from 'config';

// assets
import { ArrowLeft2 } from '@wandersonalwes/iconsax-react';
const enterpriseImgLight = '/assets/images/online-panel/enterprise_light.svg';
const enterpriseImgDark = '/assets/images/online-panel/enterprise_dark.svg';
const paymentImgLight = '/assets/images/online-panel/payment_light.svg';
const paymentImgDark = '/assets/images/online-panel/payment_dark.svg';

// Types for props
interface SectionContentProps {
  currentSection: number;
  handleTaxChange: (event: SelectChangeEvent) => void;
  handleSaleChange: (event: SelectChangeEvent) => void;
  tax: string;
  sales: string;
  handleNextSection: () => void;
}

// ==============================|| SECTION CONTENT ||============================== //

function SectionContent({ currentSection, handleTaxChange, handleSaleChange, tax, sales, handleNextSection }: SectionContentProps) {
  const theme = useTheme();
  const paymentImage = theme.palette.mode === ThemeMode.LIGHT ? paymentImgLight : paymentImgDark;
  const enterpriseImage = theme.palette.mode === ThemeMode.LIGHT ? enterpriseImgLight : enterpriseImgDark;
  const imgSize = { width: { xs: 150, sm: 200, md: 250 }, height: { xs: 120, sm: 160, md: 200 } };

  switch (currentSection) {
    case 1:
      return (
        <Stack sx={{ gap: { xs: 3.75, sm: 6.25 }, alignItems: 'center' }}>
          <CardMedia src={paymentImage} alt="Payment Img1" component="img" sx={{ ...imgSize }} />
          <Stack sx={{ gap: 0.5, textAlign: 'center' }}>
            <Typography variant="h4">Establish your payment gateway</Typography>
            <Typography sx={{ color: 'text.secondary' }}>
              Able Pro: pay streamlines your payout process, facilitating faster payments while managing author and affiliate payouts on
              your behalf.
            </Typography>
          </Stack>
          <Stack sx={{ gap: 0.75, width: 1 }}>
            <Typography>Mobile Phone</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ gap: 1.25 }}>
              <TextField
                type="number"
                fullWidth
                placeholder="1234567890"
                variant="outlined"
                slotProps={{ input: { startAdornment: <InputAdornment position="start">+91</InputAdornment> } }}
              />
              <Button variant="contained" onClick={handleNextSection}>
                Continue
              </Button>
            </Stack>
          </Stack>
        </Stack>
      );
    case 2:
      return (
        <Stack sx={{ alignItems: 'center' }}>
          <CardMedia src={paymentImage} alt="Payment Img1" component="img" sx={{ ...imgSize }} />
          <Stack sx={{ textAlign: 'center', mt: { xs: 3.75, sm: 6.25 }, mb: 2.5, gap: 0.5 }}>
            <Typography variant="h4">Let&apos;s begin from the start</Typography>
            <Typography sx={{ color: 'text.secondary' }}>What is your current tax filing situation?</Typography>
          </Stack>
          <Stack direction="row" sx={{ justifyContent: 'center', width: 1, gap: 2 }}>
            <Button variant="contained" onClick={handleNextSection}>
              Company
            </Button>
            <Button variant="contained" onClick={handleNextSection}>
              Individual
            </Button>
          </Stack>
        </Stack>
      );
    case 3:
      return (
        <Stack sx={{ gap: 3.75, alignItems: 'center' }}>
          <CardMedia src={enterpriseImage} alt="Payment Img2" component="img" sx={{ ...imgSize }} />
          <Typography variant="h4">Inform us about your enterprise</Typography>
          <Stack sx={{ gap: 2, alignContent: 'center' }}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel>What is your current tax filing situation?</InputLabel>
              <Select value={tax} size="small" onChange={handleTaxChange}>
                <MenuItem value="llc">LLC</MenuItem>
                <MenuItem value="llc1">LLC1</MenuItem>
                <MenuItem value="llc2">LLC2</MenuItem>
                <MenuItem value="llc3">LLC3</MenuItem>
              </Select>
            </Stack>
            <Stack sx={{ gap: 1 }}>
              <InputLabel>What were your total sales for the previous year?</InputLabel>
              <Select value={sales} size="small" onChange={handleSaleChange}>
                <MenuItem value="sale1">$100 - $1000</MenuItem>
                <MenuItem value="sale2">$1001 - $2000</MenuItem>
                <MenuItem value="sale3">$2001 - $3000</MenuItem>
                <MenuItem value="sale4">$3001 - $4000</MenuItem>
              </Select>
            </Stack>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="business-name">What is your business name?</InputLabel>
              <TextField fullWidth id="business-name" placeholder="Business Name" size="small" />
            </Stack>
          </Stack>
          <Button variant="contained" onClick={handleNextSection}>
            Continue
          </Button>
        </Stack>
      );
    case 4:
      return (
        <Stack sx={{ alignItems: 'center' }}>
          <CardMedia src={enterpriseImage} alt="Payment Img2" component="img" sx={{ ...imgSize }} />
          <Stack sx={{ textAlign: 'center', mt: { xs: 3.75, sm: 6.25 }, mb: 2.5, gap: 0.5 }}>
            <Typography variant="h4">Tell about your business</Typography>
            <Typography sx={{ color: 'text.secondary' }}>What were your total sales for the previous year?</Typography>
          </Stack>
          <Button variant="contained" onClick={handleNextSection}>
            Continue
          </Button>
        </Stack>
      );
    default:
      return null;
  }
}

// ==============================|| SETTING - PAYMENT ||============================== //

export default function PaymentSection(): React.JSX.Element {
  const downSM = useMediaQuery((theme) => theme.breakpoints.down('sm'));

  const [currentSection, setCurrentSection] = useState<number>(1);
  const [tax, setTax] = useState<string>('llc');
  const [sales, setSales] = useState<string>('sale1');

  const handleTaxChange = (event: SelectChangeEvent): void => setTax(event.target.value);
  const handleSaleChange = (event: SelectChangeEvent): void => setSales(event.target.value);

  const handleNextSection = (): void => setCurrentSection((prev) => (prev < 4 ? prev + 1 : 1));
  const handlePreviousSection = (): void => setCurrentSection((prev) => (prev > 1 ? prev - 1 : 1));

  return (
    <MainCard title="Payment" content={false}>
      {currentSection > 1 && (
        <Box sx={{ p: { xs: 1.5, sm: 2.5 } }}>
          <Button color="secondary" size="small" startIcon={<ArrowLeft2 />} onClick={handlePreviousSection}>
            Back Step
          </Button>
        </Box>
      )}
      <Stack direction="row" sx={{ justifyContent: 'center', p: { xs: 2.5, sm: 7.5 } }}>
        {downSM ? (
          <SectionContent
            currentSection={currentSection}
            handleTaxChange={handleTaxChange}
            handleSaleChange={handleSaleChange}
            tax={tax}
            sales={sales}
            handleNextSection={handleNextSection}
          />
        ) : (
          <MainCard sx={{ width: 560 }}>
            <SectionContent
              currentSection={currentSection}
              handleTaxChange={handleTaxChange}
              handleSaleChange={handleSaleChange}
              tax={tax}
              sales={sales}
              handleNextSection={handleNextSection}
            />
          </MainCard>
        )}
      </Stack>
    </MainCard>
  );
}
