import axiosServices from 'utils/axios';

// ==============================|| WEB PUSH - ABONNEMENT NAVIGATEUR ||============================== //
//
// Registers the service worker and subscribes the browser, so notifications keep arriving
// once the portal tab is closed. Everything here is best-effort: a browser that refuses
// or cannot do push must never break the page — the in-header badge still works.

/** Web Push needs a secure context. localhost counts as one; a LAN IP over http does not. */
export const isPushSupported = (): boolean =>
  typeof window !== 'undefined' &&
  'serviceWorker' in navigator &&
  'PushManager' in window &&
  'Notification' in window &&
  window.isSecureContext;

/**
 * The VAPID key travels as base64url; PushManager wants raw bytes.
 *
 * Returns the ArrayBuffer rather than the Uint8Array view: `Uint8Array` is generic over
 * `ArrayBufferLike` in current TypeScript, and `applicationServerKey` only accepts a
 * `BufferSource` backed by a real `ArrayBuffer`.
 */
const urlBase64ToArrayBuffer = (base64: string): ArrayBuffer => {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const normalised = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(normalised);
  const buffer = new ArrayBuffer(raw.length);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < raw.length; i += 1) {
    view[i] = raw.charCodeAt(i);
  }
  return buffer;
};

/** Byte-compares the key a subscription was created with against the current one. */
const sameKey = (a: ArrayBuffer | null | undefined, b: ArrayBuffer): boolean => {
  if (!a || a.byteLength !== b.byteLength) return false;
  const x = new Uint8Array(a);
  const y = new Uint8Array(b);
  for (let i = 0; i < x.length; i += 1) {
    if (x[i] !== y[i]) return false;
  }
  return true;
};

export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (!isPushSupported()) return null;
  try {
    return await navigator.serviceWorker.register('/sw.js');
  } catch (e) {
    console.error('Service worker registration failed:', e);
    return null;
  }
};

/**
 * Subscribes this browser and files the subscription against the logged-in account.
 *
 * @returns true when the browser is subscribed and the backend knows about it.
 */
export const subscribeToPush = async (): Promise<boolean> => {
  if (!isPushSupported()) return false;

  const { data } = await axiosServices.get('/api/push/public-key');
  if (!data?.enabled || !data?.publicKey) {
    // Backend has no VAPID keys — push is off for this environment.
    return false;
  }

  const registration = await registerServiceWorker();
  if (!registration) return false;
  // A worker that is still installing has no pushManager yet.
  await navigator.serviceWorker.ready;

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return false;

  const currentKey = urlBase64ToArrayBuffer(data.publicKey);

  // Reuse the existing subscription ONLY if it was created with the key the server signs
  // with today. A subscription carries the applicationServerKey it was born with: once
  // the VAPID pair changes — rotation, a rebuilt environment, switching between local and
  // prod — the push service answers 403 forever and no amount of re-sending helps. The
  // old one has to be thrown away and a new one created.
  let subscription = await registration.pushManager.getSubscription();
  if (subscription && !sameKey(subscription.options?.applicationServerKey, currentKey)) {
    await subscription.unsubscribe();
    subscription = null;
  }

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: currentKey
    });
  }

  // Sent on every call, not just on creation: the backend keys on the endpoint and
  // updates in place, which is also how a rotated endpoint gets repaired.
  await axiosServices.post('/api/push/subscribe', subscription.toJSON());
  return true;
};

export const unsubscribeFromPush = async (): Promise<void> => {
  if (!isPushSupported()) return;
  const registration = await navigator.serviceWorker.getRegistration();
  const subscription = await registration?.pushManager.getSubscription();
  if (!subscription) return;

  // Tell the backend first — if the browser drops it first and the call then fails, the
  // row is stranded server-side with no endpoint left to match it against.
  try {
    await axiosServices.post('/api/push/unsubscribe', { endpoint: subscription.endpoint });
  } finally {
    await subscription.unsubscribe();
  }
};

/**
 * Re-sends the browser's existing subscription to the backend.
 *
 * The two sides drift: the browser keeps its subscription across reloads, but the row
 * server-side can be missing — the original POST failed, the row was pruned after a
 * transient push error, or the environment was rebuilt. Nothing in the browser reveals
 * that, so a page claiming "notifications activées" could sit there receiving nothing.
 *
 * The backend keys on the endpoint and updates in place, so re-sending is harmless and
 * repairs the gap.
 *
 * @returns true when the backend has acknowledged the subscription.
 */
export const syncSubscription = async (): Promise<boolean> => {
  if (!isPushSupported()) return false;
  const registration = await navigator.serviceWorker.getRegistration();
  const subscription = await registration?.pushManager.getSubscription();
  if (!subscription) return false;

  try {
    const { data } = await axiosServices.get('/api/push/public-key');
    if (!data?.enabled || !data?.publicKey) return false;

    // A subscription tied to a superseded VAPID key is dead weight: the push service
    // will answer 403 on every send. Report it as not-subscribed so the UI offers to
    // activate again, which recreates it against the current key.
    if (!sameKey(subscription.options?.applicationServerKey, urlBase64ToArrayBuffer(data.publicKey))) {
      return false;
    }

    await axiosServices.post('/api/push/subscribe', subscription.toJSON());
    return true;
  } catch (e) {
    console.error('Push subscription sync failed:', e);
    return false;
  }
};

/**
 * Whether notifications will actually arrive — which means both sides agree, not just
 * that the browser holds a subscription.
 */
export const getPushState = async (): Promise<'unsupported' | 'denied' | 'subscribed' | 'off'> => {
  if (!isPushSupported()) return 'unsupported';
  if (Notification.permission === 'denied') return 'denied';

  const registration = await navigator.serviceWorker.getRegistration();
  const subscription = await registration?.pushManager.getSubscription();
  if (!subscription) return 'off';

  // Only claim "subscribed" once the backend has confirmed it knows this endpoint.
  const synced = await syncSubscription();
  return synced ? 'subscribed' : 'off';
};
