import { useRef, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

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
import { fetchBrisDossiers, BRIS_TREATED_EVENT, BrisDossier } from 'app/api/services/BrisDeGlaceService';

// icons
import { Car } from '@wandersonalwes/iconsax-react';

// ==============================|| HEADER CONTENT - BRIS DE GLACE (C0090) ||============================== //

export default function BrisNotification() {
  const downMD = useMediaQuery((theme: any) => theme.breakpoints.down('md'));
  const router = useRouter();
  const anchorRef = useRef<any>(null);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<BrisDossier[]>([]);

  const load = useCallback(async () => {
    try {
      const data = await fetchBrisDossiers();
      setPending(data.filter((d) => !d.treated));
    } catch {
      /* silent — header widget */
    }
  }, []);

  useEffect(() => {
    load();
    const intervalId = setInterval(load, 60000); // refresh every minute
    const onTreated = () => load();
    window.addEventListener(BRIS_TREATED_EVENT, onTreated);
    return () => {
      clearInterval(intervalId);
      window.removeEventListener(BRIS_TREATED_EVENT, onTreated);
    };
  }, [load]);

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
        aria-label="open bris de glace notifications"
        ref={anchorRef}
        aria-controls={open ? 'bris-grow' : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
        size="large"
        sx={() => ({
          p: 1,
          color: '#F8FAFC',
          bgcolor: open ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
          '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.12)' }
        })}
      >
        <Badge badgeContent={pending.length} color="error">
          <Car size={24} variant="Bulk" />
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
                      <Typography variant="h5">Dossiers bris de glace à traiter</Typography>
                    </Stack>

                    <SimpleBar style={{ maxHeight: 'calc(100vh - 180px)' }}>
                      <List component="nav" sx={{ mt: 1 }}>
                        {pending.slice(0, 6).map((d, index) => (
                          <ListItem
                            key={d.id || index}
                            component={ListItemButton}
                            onClick={() => {
                              router.push(`/pages/bris-de-glace/consultation?number=${encodeURIComponent(d.number)}`);
                              setOpen(false);
                            }}
                            sx={{ my: 1, border: '1px solid', borderColor: 'divider' }}
                          >
                            <ListItemAvatar>
                              <Avatar type="combined" color="error">
                                {d.brisDossierNo ? d.brisDossierNo[0] : 'B'}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={<Typography variant="h6">Dossier {d.brisDossierNo || d.number}</Typography>}
                              secondary={
                                <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                                  <Typography variant="caption" color="text.secondary">
                                    {d.insuranceName || '-'} • Immat: {d.registrationNumber || '-'}
                                  </Typography>
                                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'warning.main' }}>
                                    {d.vehicleMakeModel || 'Véhicule'} • Créé par {d.createdBy || '-'}
                                  </Typography>
                                </Stack>
                              }
                            />
                          </ListItem>
                        ))}
                        {pending.length === 0 && (
                          <Typography variant="body2" color="textSecondary" align="center" sx={{ py: 2 }}>
                            Aucun dossier bris de glace à traiter.
                          </Typography>
                        )}
                      </List>
                    </SimpleBar>

                    <Stack direction="row" sx={{ justifyContent: 'center', mt: 1.5 }}>
                      <Link href="/pages/bris-de-glace/consultation" variant="h6" color="primary" onClick={() => setOpen(false)}>
                        Afficher tous les dossiers
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
