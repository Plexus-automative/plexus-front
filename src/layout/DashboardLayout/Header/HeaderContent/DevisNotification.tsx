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
import Button from '@mui/material/Button';
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
import { DemandeDevis, fetchDemandesDevis } from 'app/api/services/DemandeDevisService';
import { getPushState, subscribeToPush, unsubscribeFromPush } from 'app/api/services/PushService';

// icons
import { TaskSquare } from '@wandersonalwes/iconsax-react';

// ==============================|| HEADER CONTENT - DEMANDES DE DEVIS ||============================== //
//
// Untreated demandes relayed by the commercial mobile app. Two levels of signal:
//  - the badge, for when the portal is on screen;
//  - a desktop notification, for when it is not — that is the case the commercial
//    actually cares about, since a demande can land while nobody is looking at the tab.

const POLL_MS = 60000;
const LIST_URL = '/pages/demandes-devis';

/** Deep link that opens this demande's card, not just the list. Encoded: DV26/0001 has a slash. */
const demandeUrl = (number: string) => `${LIST_URL}?number=${encodeURIComponent(number)}`;
/** Remembers which demandes have already been announced, across reloads. */
const SEEN_KEY = 'plexus.devis.seenNumbers';

const readSeen = (): string[] => {
  try {
    return JSON.parse(window.localStorage.getItem(SEEN_KEY) || '[]');
  } catch {
    return [];
  }
};

const writeSeen = (numbers: string[]) => {
  try {
    // Bounded: only the recent tail matters for "is this new?".
    window.localStorage.setItem(SEEN_KEY, JSON.stringify(numbers.slice(-200)));
  } catch {
    /* private mode / quota — the badge still works, only the desktop popup is lost */
  }
};

export default function DevisNotification() {
  const downMD = useMediaQuery((theme: any) => theme.breakpoints.down('md'));
  const router = useRouter();
  const anchorRef = useRef<any>(null);
  const [open, setOpen] = useState(false);

  const [count, setCount] = useState(0);
  const [demandes, setDemandes] = useState<DemandeDevis[]>([]);
  /** Web Push state — this is what keeps working once the tab is closed. */
  const [pushState, setPushState] = useState<'unsupported' | 'denied' | 'subscribed' | 'off'>('off');
  const [pushBusy, setPushBusy] = useState(false);
  // First poll only seeds the "already seen" set — otherwise opening the portal would
  // fire a popup for every demande received while it was closed.
  const primed = useRef(false);
  // Read inside the polling loop, which must not re-subscribe every time the state moves.
  const pushSubscribed = useRef(false);

  useEffect(() => {
    // getPushState already distinguishes unsupported / denied / subscribed / off, so the
    // raw Notification.permission is not needed separately.
    getPushState().then(setPushState).catch(() => setPushState('off'));
  }, []);

  useEffect(() => {
    pushSubscribed.current = pushState === 'subscribed';
  }, [pushState]);

  const notifyDesktop = useCallback((fresh: DemandeDevis[]) => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;

    // One notification for a single demande, one summary beyond that — a burst of
    // popups after a sync would be worse than no popup at all.
    if (fresh.length === 1) {
      const d = fresh[0];
      const n = new Notification('Nouvelle demande de devis', {
        body: `${d.number} — ${d.garage?.name || 'Garage inconnu'}${
          d.vehicle?.immatriculation ? ` (${d.vehicle.immatriculation})` : ''
        }`,
        tag: d.number
      });
      n.onclick = () => {
        window.focus();
        router.push(demandeUrl(d.number));
      };
    } else {
      const n = new Notification(`${fresh.length} nouvelles demandes de devis`, {
        body: fresh
          .slice(0, 3)
          .map((d) => `${d.number} — ${d.garage?.name || '?'}`)
          .join('\n'),
        tag: 'plexus-devis-batch'
      });
      n.onclick = () => {
        window.focus();
        // Several arrived at once — no single demande to open, so land on the list.
        router.push(LIST_URL);
      };
    }
  }, [router]);

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      try {
        const data = await fetchDemandesDevis({ treated: false }, 10, 0);
        if (cancelled) return;

        const items = data.items || [];
        setDemandes(items);
        setCount(data.total || items.length);

        const seen = readSeen();
        const fresh = items.filter((d) => d.number && !seen.includes(d.number));

        if (fresh.length > 0) {
          writeSeen([...seen, ...fresh.map((d) => d.number)]);
          // Only announce from here when Web Push is NOT active. With a subscription in
          // place the service worker already showed this exact demande, and firing again
          // would give two popups for one arrival.
          if (primed.current && !pushSubscribed.current) notifyDesktop(fresh);
        }
        primed.current = true;
      } catch {
        // A failed poll is not worth surfacing — the badge simply keeps its last value.
      }
    };

    poll();
    const id = setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [notifyDesktop]);

  /**
   * Turns real Web Push on: registers the service worker, asks for permission, and files
   * the subscription server-side. Once done, notifications arrive even with the portal
   * closed — which the in-page popup below can never do.
   */
  const enablePush = async () => {
    setPushBusy(true);
    try {
      const ok = await subscribeToPush();
      setPushState(ok ? 'subscribed' : Notification.permission === 'denied' ? 'denied' : 'off');
    } catch (e) {
      console.error('Push subscription failed:', e);
      setPushState('off');
    } finally {
      setPushBusy(false);
    }
  };

  const disablePush = async () => {
    setPushBusy(true);
    try {
      await unsubscribeFromPush();
      setPushState('off');
    } catch (e) {
      console.error('Push unsubscribe failed:', e);
    } finally {
      setPushBusy(false);
    }
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
        aria-label="ouvrir les demandes de devis"
        ref={anchorRef}
        aria-controls={open ? 'devis-grow' : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
        size="large"
        sx={{
          p: 1,
          color: '#F8FAFC',
          bgcolor: open ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
          '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.12)' }
        }}
      >
        <Badge badgeContent={count} color="error">
          <TaskSquare size={24} variant="Bulk" />
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
                      <Typography variant="h5">Demandes de devis</Typography>
                    </Stack>

                    {pushState === 'off' && (
                      <>
                        <Button
                          fullWidth
                          size="small"
                          variant="outlined"
                          disabled={pushBusy}
                          onClick={enablePush}
                          sx={{ mt: 1.5 }}
                        >
                          Activer les notifications
                        </Button>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                          Vous serez prévenu même si le portail est fermé.
                        </Typography>
                      </>
                    )}
                    {pushState === 'subscribed' && (
                      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1.5 }}>
                        <Typography variant="caption" color="success.main">
                          Notifications activées sur ce navigateur
                        </Typography>
                        <Button size="small" color="secondary" disabled={pushBusy} onClick={disablePush}>
                          Désactiver
                        </Button>
                      </Stack>
                    )}
                    {pushState === 'denied' && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
                        Les notifications sont bloquées pour ce site. Réautorisez-les depuis les
                        paramètres du navigateur.
                      </Typography>
                    )}
                    {pushState === 'unsupported' && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
                        Ce navigateur ne gère pas les notifications push (une connexion HTTPS est
                        requise).
                      </Typography>
                    )}

                    <SimpleBar style={{ maxHeight: 'calc(100vh - 180px)' }}>
                      <List component="nav" sx={{ mt: 1 }}>
                        {demandes.slice(0, 5).map((d, index) => (
                          <ListItem
                            key={d.id || index}
                            component={ListItemButton}
                            onClick={() => {
                              router.push(demandeUrl(d.number));
                              setOpen(false);
                            }}
                            sx={{ my: 1, border: '1px solid', borderColor: 'divider' }}
                          >
                            <ListItemAvatar>
                              <Avatar type="combined" color="warning">
                                {d.garage?.name ? d.garage.name[0].toUpperCase() : 'D'}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={<Typography variant="h6">{d.garage?.name || 'Garage inconnu'}</Typography>}
                              secondary={
                                <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary' }}>
                                    {d.number}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {[
                                      d.vehicle?.immatriculation,
                                      [d.vehicle?.make, d.vehicle?.model].filter(Boolean).join(' '),
                                      d.commercial?.name
                                    ]
                                      .filter(Boolean)
                                      .join(' • ')}
                                  </Typography>
                                </Stack>
                              }
                            />
                          </ListItem>
                        ))}
                        {demandes.length === 0 && (
                          <Typography variant="body2" color="textSecondary" align="center" sx={{ py: 2 }}>
                            Aucune demande à traiter.
                          </Typography>
                        )}
                      </List>
                    </SimpleBar>

                    <Stack direction="row" sx={{ justifyContent: 'center', mt: 1.5 }}>
                      <Link href={LIST_URL} variant="h6" color="primary" onClick={() => setOpen(false)}>
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
