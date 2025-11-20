// material-ui
import { styled } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// third-party
import { motion } from 'framer-motion';

// project-imports
import Logo from 'components/logo';

// assets
import { Dribbble, Youtube } from '@wandersonalwes/iconsax-react';
import GithubIcon from '../../../public/assets/third-party/github';
import { useBuyNowLink } from 'hooks/getBuyNowLink';

// link - custom style
const FooterLink = styled(Link)(({ theme }) => ({
  color: theme.palette.text.primary,
  '&:hover, &:active': {
    color: theme.palette.primary.main
  }
}));

type showProps = {
  isFull?: boolean;
};

// ==============================|| LANDING - FOOTER PAGE ||============================== //

export default function FooterBlock({ isFull }: showProps) {
  const { isPhoenix } = useBuyNowLink();

  const SupportLink = isPhoenix ? 'https://phoenixcoded.authordesk.app/' : 'https://codedthemes.support-hub.io/';

  const linkSX = { color: 'text.secondary', fontWeight: 400, opacity: '0.6', cursor: 'pointer', '&:hover': { opacity: '1' } };

  const footerData = [
    { label: 'Profile', link: 'https://1.envato.market/xk3bQd' },
    { label: 'Portfolio', link: 'https://1.envato.market/Qyre4x' },
    { label: 'Follow Us', link: 'https://1.envato.market/Py9k4X' },
    { label: 'Website', link: 'https://phoenixcoded.net' }
  ];
  const EcoSystem = [
    {
      label: 'Bundle',
      link: 'https://codedthemes.com/item/able-pro-dashboard-templates'
    },
    {
      label: 'Bootstrap',
      link: 'https://codedthemes.com/item/able-pro-bootstrap-admin-template/'
    },
    {
      label: 'Angular',
      link: 'https://codedthemes.com/item/able-pro-angular-admin-template/'
    },
    {
      label: 'React',
      link: 'https://codedthemes.com/item/able-pro-mui-react-admin-template/'
    },
    {
      label: 'Next',
      link: 'https://codedthemes.com/item/able-pro-nextjs-mui-react-admin-template/'
    },
    {
      label: 'Tailwind',
      link: 'https://codedthemes.com/item/able-pro-tailwind-css-admin-dashboard/'
    },
    {
      label: 'Vue',
      link: 'https://codedthemes.com/item/able-pro-tailwind-css-admin-dashboard/'
    },
    {
      label: 'Vue + Laravel',
      link: 'https://codedthemes.com/item/able-pro-vue-laravel-admin-dashboard'
    }
  ];

  return (
    <>
      <Box sx={{ pt: isFull ? 5 : 10, pb: 10, bgcolor: 'secondary.200', borderColor: 'divider' }}>
        <Container>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <motion.div
                initial={{ opacity: 0, y: 550 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 150,
                  damping: 30
                }}
              >
                <Grid container spacing={2}>
                  <Grid size={12}>
                    <Logo to="/" />
                  </Grid>
                  <Grid size={12}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 400, maxWidth: 320 }}>
                      Phoenixcoded has gained the trust of over 6.5K+ customers since 2015, thanks to our commitment to delivering
                      high-quality products. Our experienced team players are responsible for managing Able Pro.
                    </Typography>
                  </Grid>
                </Grid>
              </motion.div>
            </Grid>
            <Grid size={{ xs: 12, md: 8 }}>
              <Grid container spacing={{ xs: 5, md: 2 }}>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <Stack sx={{ gap: 3 }}>
                    <Typography variant="h5">{isPhoenix ? 'Company' : 'Able Pro Eco-System'}</Typography>
                    <Stack sx={{ gap: { xs: 1.5, md: 2.5 } }}>
                      {(isPhoenix ? footerData : EcoSystem).map((item, index) => (
                        <FooterLink key={index} href={item.link} target="_blank" underline="none">
                          {item.label}
                        </FooterLink>
                      ))}
                    </Stack>
                  </Stack>
                </Grid>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <Stack sx={{ gap: 3 }}>
                    <Typography variant="h5">Help & Support</Typography>
                    <Stack sx={{ gap: { xs: 1.5, md: 2.5 } }}>
                      <FooterLink href="https://phoenixcoded.gitbook.io/able-pro" target="_blank" underline="none">
                        Documentation
                      </FooterLink>
                      <FooterLink href={SupportLink} target="_blank" underline="none">
                        Feature Request
                      </FooterLink>
                      <FooterLink href="https://phoenixcoded.gitbook.io/able-pro/v/react/roadmap/" target="_blank" underline="none">
                        RoadMap
                      </FooterLink>
                      <FooterLink href={SupportLink} target="_blank" underline="none">
                        Support
                      </FooterLink>
                      <FooterLink href="https://themeforest.net/user/phoenixcoded#contact" target="_blank" underline="none">
                        Email Us
                      </FooterLink>
                    </Stack>
                  </Stack>
                </Grid>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <Stack sx={{ gap: 3 }}>
                    <Typography variant="h5">Useful Resources</Typography>
                    <Stack sx={{ gap: { xs: 1.5, md: 2.5 } }}>
                      <FooterLink
                        href={isPhoenix ? 'https://themeforest.net/page/item_support_policy' : 'https://codedthemes.com/privacy-policy/'}
                        target="_blank"
                        underline="none"
                      >
                        Privacy Policy
                      </FooterLink>
                      <FooterLink
                        href={isPhoenix ? 'https://themeforest.net/licenses/standard' : 'https://codedthemes.com/license/'}
                        target="_blank"
                        underline="none"
                      >
                        Licenses Term
                      </FooterLink>
                    </Stack>
                  </Stack>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>
      <Box sx={{ py: 2.4, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'secondary.200' }}>
        <Container>
          <Grid container spacing={2} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 12, sm: 8 }}>
              <Typography>
                © Handcrafted by Team{' '}
                <Link href="https://www.phoenixcoded.net/" target="_blank" underline="none">
                  {' '}
                  Phoenixcoded
                </Link>
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Grid container spacing={2} sx={{ alignItems: 'center', justifyContent: 'flex-end' }}>
                <Grid>
                  <Tooltip title="Github">
                    <Link href="https://github.com/phoenixcoded" underline="none" target="_blank" sx={linkSX}>
                      <GithubIcon size={20} />
                    </Link>
                  </Tooltip>
                </Grid>
                <Grid>
                  <Tooltip title="Dribbble">
                    <Link href="https://dribbble.com/Phoenixcoded" underline="none" target="_blank" sx={linkSX}>
                      <Dribbble variant="Bold" size={20} />
                    </Link>
                  </Tooltip>
                </Grid>
                <Grid>
                  <Tooltip title="Youtube">
                    <Link href="https://www.youtube.com/@phoenixcoded" underline="none" target="_blank" sx={linkSX}>
                      <Youtube variant="Bold" size={20} />
                    </Link>
                  </Tooltip>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
}
