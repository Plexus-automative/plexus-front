import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axiosServices from 'utils/axios';

// material-ui
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import Badge from '@mui/material/Badge';
import IconButton from 'components/@extended/IconButton';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import CardContent from '@mui/material/CardContent';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Link from '@mui/material/Link';

// project imports
import MainCard from 'components/MainCard';
import Transitions from 'components/@extended/Transitions';
import SimpleBar from 'components/third-party/SimpleBar';
import Avatar from 'components/@extended/Avatar';

// icons
import { ClipboardText } from '@wandersonalwes/iconsax-react';

// ==============================|| HEADER CONTENT - PEC DOSSIERS ||============================== //

export default function PecNotification() {
  const downMD = useMediaQuery((theme: any) => theme.breakpoints.down('md'));
  const router = useRouter();
  const anchorRef = useRef<any>(null);
  const [open, setOpen] = useState(false);

  const [pecCount, setPecCount] = useState(0);
  const [pecRequests, setPecRequests] = useState<any[]>([]);

  useEffect(() => {
    const fetchPecCount = async () => {
      try {
        const response = await axiosServices.get('/api/purchase-orders/pec?status=ne:Réceptionné&skip=0&top=5');

        if (response.data && response.data['@odata.count'] !== undefined) {
          setPecCount(response.data['@odata.count']);
        }

        if (response.data && response.data.value) {
          setPecRequests(response.data.value);
          if (response.data['@odata.count'] === undefined) {
            setPecCount(response.data.value.length);
          }
        }
      } catch (error) {
        console.error('Failed to fetch PEC count:', error);
      }
    };

    fetchPecCount();
    const intervalId = setInterval(fetchPecCount, 60000); // refresh every minute
    return () => clearInterval(intervalId);
  }, []);

  const getStatusColor = (statusVal: string) => {
    const status = statusVal?.toLowerCase().trim();
    if (status === 'commandé' || status === 'commande') return 'info.main';
    if (status === 'en cours de livraison') return 'secondary.main';
    if (status === 'en cours de réception' || status === 'en cours de reception') return 'primary.main';
    if (status === 'annulé' || status === 'annule') return 'error.main';
    return 'warning.main';
  };

  const handleToggle = () => setOpen((prev) => !prev);
  const handleClose = (event: MouseEvent | TouchEvent) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) return;
    setOpen(false);
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 0.5 }}>
      <IconButton
        color="secondary"
        variant="light"
        aria-label="open pec notifications"
        ref={anchorRef}
        aria-controls={open ? 'pec-grow' : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
        size="large"
        sx={(theme: any) => ({
          p: 1,
          color: '#F8FAFC',
          bgcolor: open ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
          '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.12)' }
        })}
      >
        <Badge badgeContent={pecCount} color="error">
          <ClipboardText size={24} variant="Bulk" />
        </Badge>
      </IconButton>

      <Popper
        placement={downMD ? 'bottom' : 'bottom-end'}
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        popperOptions={{ modifiers: [{ name: 'offset', options: { offset: [downMD ? -5 : 0, 9] } }] }}
      >
        {({ TransitionProps }) => (
          <Transitions type="grow" position={downMD ? 'top' : 'top-right'} in={open} {...TransitionProps}>
            <Paper sx={{ boxShadow: 3, borderRadius: 1.5, width: { xs: 280, sm: 360 } }}>
              <ClickAwayListener onClickAway={handleClose}>
                <MainCard border={false} content={false}>
                  <CardContent>
                    <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="h5">Nouvelles Demandes PEC</Typography>
                    </Stack>

                    <SimpleBar style={{ maxHeight: 'calc(100vh - 180px)' }}>
                      <List component="nav" sx={{ mt: 1 }}>
                        {pecRequests.slice(0, 5).map((pec: any, index: number) => (
                          <ListItem
                            key={pec.id || index}
                            component={ListItemButton}
                            onClick={() => {
                              router.push(`/pages/plexus-pec-commandes?number=${pec.number}`);
                              setOpen(false);
                            }}
                            sx={{ my: 1, border: '1px solid', borderColor: 'divider' }}
                          >
                            <ListItemAvatar>
                              <Avatar type="combined" color="error">{pec.number ? pec.number[0] : 'P'}</Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Typography variant="h6">
                                  {pec.insuredName ? (pec.insuredName.includes('|') ? pec.insuredName.split('|')[0] : pec.insuredName).split(' / ')[0] : '-'}
                                </Typography>
                              }
                              secondary={
                                <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                                  {pec.insuredName && (pec.insuredName.includes('|') ? pec.insuredName.split('|')[0] : pec.insuredName).includes(' / ') && (
                                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary' }}>
                                      Assuré: {(pec.insuredName.includes('|') ? pec.insuredName.split('|')[0] : pec.insuredName).split(' / ')[1]}
                                    </Typography>
                                  )}
                                  <Typography variant="caption" color="text.secondary">
                                    {pec.customerName || 'Client'} • Immat: {pec.registrationNumber || '-'}
                                  </Typography>
                                  <Typography variant="caption" sx={{ fontWeight: 600, color: getStatusColor(pec.status) }}>
                                    Statut: {pec.status || 'En cours'}
                                  </Typography>
                                </Stack>
                              }
                            />
                          </ListItem>
                        ))}
                        {pecRequests.length === 0 && (
                          <Typography variant="body2" color="textSecondary" align="center" sx={{ py: 2 }}>
                            Aucune nouvelle demande PEC.
                          </Typography>
                        )}
                      </List>
                    </SimpleBar>

                    <Stack direction="row" sx={{ justifyContent: 'center', mt: 1.5 }}>
                      <Link href="/pages/plexus-pec-commandes" variant="h6" color="primary" onClick={() => setOpen(false)}>
                        Afficher Toutes
                      </Link>
                    </Stack>
                  </CardContent>
                </MainCard>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>
    </Box>
  );
}
