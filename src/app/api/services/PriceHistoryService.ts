// Dernière mise à jour de prix d'un article — source : table BC "Plexus Price History",
// exposée par /api/purchase-orders/price-history.
//
// L'historique est tenu PAR ARTICLE (Item."Unit Price"), pas par ligne de commande : deux
// lignes portant la même référence affichent donc la même dernière MAJ. C'est bien « le prix
// de cet article a changé le … », pas « quelqu'un a touché cette ligne-là ».
//
// Les vues commandes affichent une puce par ligne. Plutôt que d'imposer à chacune de collecter
// ses références et de lever un état, chaque puce demande sa propre référence et un batcher
// regroupe tout ce qui a été demandé dans le même tick en UNE requête — une commande dépliée
// de 15 lignes = 1 appel. Le cache module survit au repli/dépli et au changement de page.

import axiosServices from 'utils/axios';

/** `recent` ≤ 7 jours, `aging` ≤ 14, `stale` au-delà — seuils décidés côté backend. */
export type PriceFreshness = 'recent' | 'aging' | 'stale';

export interface PriceUpdate {
  itemNo: string;
  oldPrice: number;
  newPrice: number;
  dateTime: string; // ISO-8601 UTC
  userId: string;
  changeCount: number;
  // Calculés par le backend et partagés avec l'API partenaire de l'app commerciale, pour que
  // les deux applications colorent le même prix de la même façon. Absents (null) quand la
  // date est inexploitable.
  daysAgo: number | null;
  freshness: PriceFreshness | null;
}

export interface PriceHistoryEntry {
  oldPrice: number;
  newPrice: number;
  dateTime: string;
  userId: string;
}

// null = référence connue, sans aucun changement de prix enregistré (≠ pas encore chargée).
const cache = new Map<string, PriceUpdate | null>();
const inFlight = new Map<string, Promise<PriceUpdate | null>>();

let queue = new Set<string>();
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let resolvers: Array<{ itemNo: string; resolve: (v: PriceUpdate | null) => void; reject: (e: unknown) => void }> = [];

const BATCH_DELAY_MS = 30;

const flush = async () => {
  flushTimer = null;
  const items = Array.from(queue);
  const waiting = resolvers;
  queue = new Set();
  resolvers = [];
  if (items.length === 0) return;

  try {
    const res = await axiosServices.get<{ value: Record<string, PriceUpdate> }>(
      `/api/purchase-orders/price-history?items=${encodeURIComponent(items.join(','))}`
    );
    const byItem = res.data?.value ?? {};
    // Une référence absente de la réponse n'a jamais changé de prix : on mémorise ce null,
    // sinon la puce la redemanderait à chaque rendu.
    items.forEach((itemNo) => cache.set(itemNo, byItem[itemNo] ?? null));
    waiting.forEach((w) => {
      inFlight.delete(w.itemNo);
      w.resolve(cache.get(w.itemNo) ?? null);
    });
  } catch (err) {
    // Rien en cache : un prochain rendu réessaiera.
    waiting.forEach((w) => {
      inFlight.delete(w.itemNo);
      w.reject(err);
    });
  }
};

/** Dernière MAJ de prix d'une référence (null si aucune n'a jamais été enregistrée). */
export const getLastPriceUpdate = (itemNo: string): Promise<PriceUpdate | null> => {
  if (!itemNo) return Promise.resolve(null);
  if (cache.has(itemNo)) return Promise.resolve(cache.get(itemNo) ?? null);

  const pending = inFlight.get(itemNo);
  if (pending) return pending;

  const promise = new Promise<PriceUpdate | null>((resolve, reject) => {
    resolvers.push({ itemNo, resolve, reject });
  });
  inFlight.set(itemNo, promise);
  queue.add(itemNo);
  if (!flushTimer) flushTimer = setTimeout(flush, BATCH_DELAY_MS);
  return promise;
};

/** Historique complet d'une référence, du plus récent au plus ancien. */
export const fetchPriceHistory = async (itemNo: string): Promise<PriceHistoryEntry[]> => {
  if (!itemNo) return [];
  const res = await axiosServices.get<{ value: PriceHistoryEntry[] }>(
    `/api/purchase-orders/price-history/${encodeURIComponent(itemNo)}`
  );
  return res.data?.value ?? [];
};

/** À appeler après avoir modifié un prix, pour que la puce ne reste pas sur l'ancienne date. */
export const invalidatePriceUpdate = (itemNo?: string) => {
  if (itemNo) cache.delete(itemNo);
  else cache.clear();
};
