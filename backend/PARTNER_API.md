# Partner API — Demandes de devis, catalogue & commandes

Machine-to-machine API for the commercial mobile app's backend.

**Flow:** a commercial tours a garage with the mobile app, capturing photos and voice
notes that upload to *their* backend. On "créer demande devis", that backend calls this
API. Plexus records the demande against **PLEXUSPEC (C0090)** with links to the media,
and prices it afterwards. No Purchase Order and no vendor exist at creation — the
demande is a request, not yet an order.

Once parts and suppliers are known, `POST /orders` places the real commandes d'achat —
the same operation as validating the panier on the Plexus dashboard — and returns the
commande number. Keep that number: `GET /orders?number=…` follows the commande as the
supplier answers, so the devis handed to the customer reflects the price and the
availability Plexus will actually honour.

Media files never cross into Plexus. Only URLs are stored.

---

## 1. Authentication

Every request needs a shared API key:

```
X-API-Key: <PARTNER_API_KEY>
```

- Generate with `openssl rand -base64 32`, set as `PARTNER_API_KEY` in the prod `.env`.
- If the key is unset, `/api/partner/**` **rejects every request**. It never opens up.
- A portal (user) JWT does **not** grant access here, and this key does **not** grant
  access to the portal — the two surfaces are separate security chains.
- No CORS: this is server-to-server. Do not call it from a browser.

---

## 2. Endpoints

Base path: `/api/partner/v1`

### `GET /ping`
Credential check. No data written.
```json
{ "status": "ok", "service": "plexus-partner-api", "version": "v1" }
```

### `POST /demandes-devis`

```json
{
  "externalReference": "REQ-2026-0841",
  "garage":     { "name": "Garage Ben Ali", "customerNo": "C0123" },
  "commercial": { "id": "COM-7", "name": "Sami" },
  "vehicle":    { "immatriculation": "123TU4567", "vin": "VF1AAAA00AA000001",
                  "make": "Renault", "model": "Clio" },
  "createdAt":  "2026-08-04T08:12:00+01:00",
  "items":      [ { "description": "Plaquettes de frein avant", "quantity": 4,
                    "addedAt": "2026-08-04T08:15:30+01:00" } ],
  "notes":      "Visite du 4 août",
  "media": [
    { "type": "photo", "url": "https://cdn.example.com/p1.jpg", "label": "avant" },
    { "type": "audio", "url": "https://cdn.example.com/v1.m4a", "durationSec": 42 }
  ]
}
```

**Required:** `externalReference`, `garage.name`, `vehicle`.
**`media.url` must be `http://` or `https://`** — other schemes are rejected, because
Plexus staff click these links from the BC UI.

**`201 Created`**
```json
{ "number": "DD26080415301", "externalReference": "REQ-2026-0841",
  "status": "RECEIVED", "duplicate": false }
```

**`200 OK`** — same `externalReference` already recorded; `"duplicate": true`, nothing
written. Retries are safe as long as the reference is stable.

### `GET /demandes-devis/{externalReference}`
Status lookup by your own reference. `404` if unknown.

### `GET /articles?reference=…`

Article lookup by reference, for picking parts while building a demande. **Same search
as the Plexus dashboard's** — same source, same rows, same prices.

| Param | Required | Notes |
|---|---|---|
| `reference` | yes | A Plexus item number **or** a vendor's own reference. Exact match, case-insensitive. |

```
GET /api/partner/v1/articles?reference=164004EA1A
```

**`200 OK`**
```json
{
  "reference": "164004EA1A",
  "items": [
    { "reference": "164004EA1A", "designation": "FILTRE A GAZOILE", "unitPrice": 261.64,
      "unit": "UN", "vendorNo": "F0003", "vendorName": "SAVES", "vendorReference": null,
      "lastPriceUpdate": { "date": "2026-07-28T07:58:40.283Z", "previousPrice": 224.668,
                           "newPrice": 261.64, "changeCount": 4, "daysAgo": 14,
                           "freshness": "aging" } },
    { "reference": "164004EA1A", "designation": "FILTRE A GAZOILE", "unitPrice": 261.64,
      "unit": "UN", "vendorNo": "F0018", "vendorName": "STE MALAK AUTO", "vendorReference": null,
      "lastPriceUpdate": { "date": "2026-07-28T07:58:40.283Z", "previousPrice": 224.668,
                           "newPrice": 261.64, "changeCount": 4, "daysAgo": 14,
                           "freshness": "aging" } }
  ]
}
```

**One row per vendor.** The source is the Item Vendor table, so an article comes back once
for each vendor that references it — that is the unit a commercial picks ("this part, from
this supplier"). Vendors blocked for the web are excluded. `404` `not_found` when no
vendor references the reference at all.

**Exact match only** — not a prefix, and there is no designation search. The Item Vendor
table has no searchable description, and the dashboard has always worked this way.

**Punctuation is forgiving.** If the reference as sent matches nothing, it is retried with
every non-alphanumeric character removed (`FILTRE-A` → `FILTREA`), which is what the
dashboard does with what a user types. Consequence worth knowing: the fallback can land on
a *different* article (`C/B` finds no vendor, retries as `CB`, returns CONTRE BATTERIE).
The top-level `reference` echoes what you sent, each row carries the reference actually
found — compare them if that matters to you.

`unitPrice` is the sale price **excluding VAT**, read live from Business Central at each
call — do not cache it as a quote. Cost price is never returned. `vendorReference` is the
vendor's own part number and is `null` on most rows today.

**`lastPriceUpdate` — when that price last moved.** So a commercial can tell a fresh price
from one nobody has touched in three months.

| Field | Notes |
|---|---|
| `date` | ISO-8601 UTC instant of the last change |
| `previousPrice` / `newPrice` | what it went from and to; `newPrice` is today's `unitPrice` |
| `changeCount` | number of changes ever recorded for this article |
| `daysAgo` | whole days since `date` |
| `freshness` | `recent` (≤ 7 days), `aging` (≤ 14), `stale` (beyond) |

`null` when that article's price has never changed since it was created — not an error, and
not the same as "unknown".

**Tracked per article, not per vendor row.** Every row of the same reference therefore
carries the same block, even when the vendors differ. The BC user behind the change is not
returned: it reads `API OR WEBSERVICE` for anything done through the apps.

`freshness` is computed server-side on purpose, so the mobile app and the dashboard colour
the same price the same way — use it rather than re-deriving thresholds from `daysAgo`. And
if the price history is briefly unreachable, the lookup still succeeds with
`lastPriceUpdate: null`: the catalogue answer is what you asked for, the freshness is a
bonus.

### `GET /articles/{reference}`
The same lookup with the reference in the path — identical response.

Item numbers can contain a slash (`C/B`), and `%2F` in a path segment is rejected with a
`400` before it reaches the API. Use the query form for those.

### `POST /orders`

Turns a cart into **commandes d'achat** — the same thing the dashboard does when a user
validates their panier. The commandes land in "Commandes en attente" and wait for the
supplier's answer, exactly like one created by hand.

```json
{
  "externalReference": "CMD-2026-0042",
  "pecDossier": "PEC-2026-0841",
  "customerNo": "C0123",
  "vehicle":   { "immatriculation": "123TU4567", "vin": "VF1AAAA00AA000001" },
  "insurance": { "name": "MAE ASSURANCE", "claimNumber": "SIN-2026-77",
                 "insuredName": "Ben Ali Mohamed" },
  "items": [
    { "reference": "9805454880", "vendorNo": "F0018", "quantity": 2 },
    { "reference": "3G1941005C", "vendorNo": "F0057", "quantity": 1,
      "unitPrice": 1709.942, "description": "PROJ AVANT",
      "adaptable": true, "chassisNo": "VF1AAAA00AA000001" }
  ]
}
```

**Required:** `externalReference`, `pecDossier`, `vehicle.immatriculation`, and at least one
item with `reference`, `vendorNo` and `quantity`.

**`201 Created`**
```json
{
  "externalReference": "CMD-2026-0042",
  "pecDossier": "PEC-2026-0841",
  "orders": [
    { "number": "CA26/2130", "id": "feb9c2c5-…", "vendorNo": "F0018",
      "vendorName": "STE MALAK AUTO", "lineCount": 2, "totalExcludingTax": 56.088,
      "alreadyExisted": false }
  ],
  "failed": [],
  "duplicate": false
}
```

**`orders[].number` is the Plexus commande number** — `CA26/2130`. Record it on your side:
it is what Plexus staff and the supplier quote, and what every follow-up is about.

**One commande per vendor.** A commande in Business Central is placed with one supplier, so
a cart spanning three suppliers comes back as three entries in `orders` — take the `number`
of each, not just the first. Group your items by `vendorNo` from `GET /articles`.

**`207 Multi-Status`** — some vendors went through and some did not. `orders` holds what
exists and must be honoured; `failed[]` names the vendors to resend (send **only** those
items, or you will duplicate the commandes that succeeded). `502` means nothing was created
and the whole cart can be resent.

**Prices.** Leave `unitPrice` out and the live catalogue price is used — that is what the
dashboard does, and it stops an order being placed at a price the app cached last week. Send
it explicitly only to override. `description` defaults to the catalogue designation the same
way. `totalExcludingTax` is read back from Business Central, so it already includes the
vendor discount and will not match `quantity × unitPrice`.

**Every (`reference`, `vendorNo`) pair is checked before anything is written.** A supplier
that does not carry the part is a `400` naming the offending `items[i]` — no half-built
commande is left behind in BC.

**Dossier assurance.** `insurance` is optional (an order can exist without a claim), but
when present it travels with the commande: insurer, n° de sinistre, assuré, plus the plate
and VIN from `vehicle`. `insurance.name` defaults to **`MAE ASSURANCE`**. Omit the whole
block and no insurance is recorded at all — that is deliberate, so claim-less orders do not
turn up in the insurers' reporting. `vin` must be exactly 17 characters when sent.

**`adaptable: true`** marks a part whose reference is a suggestion to confirm against the
vehicle; send `chassisNo` with it, as the dashboard requires.

**Two identifiers, two jobs.** Both are stored on every commande.

| Field | Job | Unique? |
|---|---|---|
| `pecDossier` | **Groups.** Every commande of one prise en charge — several vendors, and anything ordered later. Visible in BC as *Pec-Dossier*. What `GET /orders/{pecDossier}` lists. | No, on purpose |
| `externalReference` | **Makes retries safe.** Identifies *this call*. | One per order attempt |

**Retries are safe — `externalReference` is the key.** It is looked up before anything is
written:

- Timeout, then retry with the same `externalReference` → the commandes already there come
  back as they stand, with `"alreadyExisted": true` and `"duplicate": true` at the top level.
  The status is **`200 OK`**, not `201`, because nothing was created this time.
- Retry after a `207` → only the vendors still missing are created. The reply lists the whole
  cart again, old and new together, so you always end with one commande per vendor.
- On a replayed commande, `lineCount` is `null`: Plexus does not re-read the lines from BC to
  answer a retry. `number`, `vendorName` and `totalExcludingTax` are read back and exact.

> ⚠️ **Send a new `externalReference` for a new order, the same one only to retry.** Reusing
> it for a genuinely different cart hands you the first cart's commandes and orders nothing.
> The `pecDossier` is the opposite — reuse it freely, that is how the commandes of one
> dossier stay together.

### `GET /orders?number=CA26/2130`

**The commande as it stands now** — poll this to follow it. A commande is not finished when
it is placed: the supplier answers line by line, and he can come back with another price.

```
GET /api/partner/v1/orders?number=CA26%2F2130
```

**`200 OK`**
```json
{
  "number": "CA26/1391", "id": "…", "vendorNo": "F0057", "vendorName": "MTS AUTO CENTER IB",
  "orderDate": "2026-08-11",
  "status": "ConfirmationPartielle", "state": "PARTIALLY_CONFIRMED",
  "totalExcludingTax": 532.203, "totalIncludingTax": 633.32,
  "lastModified": "2026-08-11T09:14:22Z",
  "anyPriceChanged": true,
  "lines": [
    { "reference": "0119BS200091N", "description": "PARE CHOC AR SUP XUV300",
      "quantity": 1,
      "unitPrice": 290.011, "previousUnitPrice": 22, "priceChanged": true,
      "priceDifference": 268.011,
      "decision": "Disponible", "availableQuantity": 1,
      "expectedDeliveryDate": "", "receivedQuantity": 0 }
  ]
}
```

**The price the supplier changed is right there.** Ordered at 490, confirmed at 590 →
`previousUnitPrice: 490`, `unitPrice: 590`, `priceChanged: true`. Only the **last** change is
kept: a price edited twice reports what it was before the second edit, not the original.
`previousUnitPrice` is `null` when the line never moved.

**Availability is `decision` + `availableQuantity`:** `Disponible`, `NonDisponible`,
`LivPrevuaDate` (then `expectedDeliveryDate` carries the date he committed to), or empty
while he has not answered yet.

**Each line also carries `lastPriceUpdateDate`** — when that article's catalogue price last
moved, ISO-8601, or `null` if it never did:

```json
"lastPriceUpdateDate": "2026-08-11T11:12:13.507Z"
```

Just the date here on purpose: a commande list only needs to date the price. The full block —
old price, new price, `changeCount`, `freshness` — is on `GET /articles`, for the screen that
needs it.

> **Two price signals on a line, two meanings — do not conflate them.**
> `previousUnitPrice` / `priceChanged` is **the supplier changing his price on this
> commande**. `lastPriceUpdateDate` comes from **the article's own history**, across every
> commande and every date — it is what says whether the price is fresh or has been sitting
> still for months. A line can carry one without the other.

| `state` | Meaning |
|---|---|
| `AWAITING_SUPPLIER` | Placed, the supplier has not answered |
| `PARTIALLY_CONFIRMED` | He answered, some lines only |
| `CONFIRMED` | Confirmed, to be shipped |
| `SHIPPED` | Shipped, not yet received |
| `RECEIVED` | Received at Plexus |
| `CANCELLED` | Cancelled |

`status` is the raw Business Central value behind it; `state` is derived from the very rules
the Plexus dashboard's own tabs use. Poll on `lastModified` to avoid re-reading unchanged
commandes.

**Query parameter, not a path segment** — commande numbers contain a slash and `%2F` inside
a path is rejected with a `400` before it reaches the API.

**Only commandes created through this API are readable** (the ones carrying a `Pec-Dossier`).
A commande keyed in on the dashboard answers `404`, so a leaked key cannot walk the whole
purchase history and read vendor prices.

### `GET /orders/{pecDossier}`

Same information for **every** commande of a dossier at once — the simplest thing to poll,
since one dossier routinely holds several commandes: one per supplier when the cart is
split, plus anything ordered later, including a second commande from a supplier already
used. All of them come back.

```json
{ "pecDossier": "PEC-2026-0841",
  "orders": [ { "number": "CA26/2130", … }, { "number": "CA26/2131", … } ] }
```

The objects in `orders[]` are identical to the one `?number=` returns. Use the query form
`GET /orders?pecDossier=…` if the dossier contains a slash.

### `POST /orders/validate`

**The "Valider" button.** The supplier has answered with his prices and his availability; the
commercial keeps what he buys and drops the rest. Same operation as *Totalité de disponible*
on the dashboard's Émises en cours.

```json
{
  "number": "CA26/1413",
  "lines": [
    { "lineId": "f7543c6e-…", "quantity": 2 },
    { "lineId": "f8543c6e-…", "quantity": 1 },
    { "lineId": "f9543c6e-…", "quantity": 0 }
  ]
}
```

**`quantity: 0` deletes the line from the commande.** That is the whole point: a reference
taken from another supplier leaves this commande instead of being ordered twice. The kept
lines get their validated quantity and the commande moves to `Totalité` / `CONFIRMED`.

**`200 OK`**
```json
{ "number": "CA26/1413", "validated": true, "alreadyValidated": false,
  "removedLines": [ { "lineId": "f9543c6e-…", "reference": "000E074027",
                      "description": "EM CABLE FREIN", "quantity": 1 } ],
  "order": { … the commande as it now stands … } }
```

`removedLines` is returned rather than left implicit — this call deletes rows in Business
Central, and you should be able to show or log exactly what left the commande.

Identify each line by its **`lineId`** from `GET /orders`. `reference` is accepted instead,
but only when it matches exactly one line: a commande can carry the same reference twice, and
guessing would delete the wrong one.

**Every line of the commande must be named.** A line left out is a `400`, not a default —
this call both deletes and commits, so silence cannot be taken for consent.

**Lines promised for a later date.** When the supplier answers `LivPrevuaDate` on a line, he
has the part but not now — `expectedDeliveryDate` carries the date he committed to.

> **Those lines leave the commande either way.** Business Central always clears them out of
> it, so the parts that are available can ship without waiting. **`splitDeferredLines` decides
> what becomes of them, not whether they stay.**

| Value | Effect | `outcome` |
|---|---|---|
| `true` | Re-ordered in a **separate commande**, carrying the same `pecDossier` and listed by `GET /orders/{pecDossier}`. Still on order, just later. | `MOVED_TO_NEW_ORDER` |
| `false` | **Dropped.** Those parts are then on order nowhere — order them again if the customer still wants them. | `REMOVED` |

It is **required as soon as one kept line carries that decision**, and ignored otherwise.
There is no default on purpose: one answer keeps the parts on order, the other abandons them,
and neither should happen by omission — the dashboard asks the same question in a modal.

The response carries `deferredLines`, each with its `outcome`, and on a split `splitOrder` —
the new commande, read back:

```json
{ "number": "CA26/1414", "validated": true,
  "deferredLines": [ { "reference": "000E074033", "quantity": 4,
                       "expectedDeliveryDate": "2026-08-25",
                       "outcome": "MOVED_TO_NEW_ORDER" } ],
  "splitOrder": { "number": "CA26/1415", "status": "LivraisonDispo", … },
  "order":      { "number": "CA26/1414", "status": "LivraisonDispo", … } }
```

Both answers leave the commande in `LivraisonDispo` / `CONFIRMED`.

> A split leaves Business Central running a cleanup in the background, and it holds the
> commande while it does. If the read-back does not come in time, `order` or `splitOrder` come
> back `null` **with `validated: true`** — the write went through, only the echo was late.
> Fetch them a few seconds later with `GET /orders/{pecDossier}`; do not retry the validation.

Also refused, with nothing written:

| Situation | Answer |
|---|---|
| The supplier has not answered yet (`Attente`) | `409 not_validatable` |
| `quantity` above what the supplier has | `400`, naming the line and his quantity |
| Every line at `0` | `400` — an empty commande has to be cancelled, not validated |
| Already validated | `200` with `"alreadyValidated": true`, nothing touched |

That last one makes retries safe: a replayed payload still names lines the first call
removed, and re-running it must not delete a second round.

**After validation, `GET /orders` shows both figures**: `quantity` is what was ordered,
`validatedQuantity` what was retained. Business Central deliberately keeps the ordered
quantity — accounting has to see what was asked for next to what was kept.

### Errors
| Code | `error` | Meaning |
|---|---|---|
| 400 | `validation_failed` | Field-level `violations[]` included |
| 400 | `malformed_json` | Body isn't valid JSON |
| 401 | `unauthorized` | Missing or wrong `X-API-Key` |
| 404 | `not_found` | Unknown `externalReference` or article reference |
| 200 | — | `POST /orders` only: every commande of this dossier already existed, nothing created |
| 207 | — | `POST /orders` only: partial creation, see `orders[]` and `failed[]` |
| 409 | `not_validatable` | `POST /orders/validate` only: the supplier has not answered, or the commande is in a state that cannot be validated |
| 502 | `upstream_error` | Business Central unreachable — **retry with the same reference** |
| 500 | `internal_error` | Same: retry with the same reference |

Error bodies never include Business Central internals.

---

## 3. Business Central side — required before this works

This applies to the demandes-devis endpoints only. `GET /articles` reads the existing
**`plexusItemVendors`** page (Item Vendors API, 52237) — the same entity the dashboard's
article search uses — and needs no Business Central change.

`POST /orders` writes through the same entities as the dashboard (`PlexuspurchaseOrders`,
its lines, and `plexusPurchaseOrderPatches`). It needs **AL 1.1.1.495 published**: Purchase
Header fields `PLX_PecDossier` (53243, caption *Pec-Dossier*) and `PLX_ExternalReference`
(53244), each with its own key, plus `pecDossier`, `externalReference`, `vendorNo`,
`vendorName` and `totalExcludingTax` on page 52245 `plexusPurchaseOrderPatches`. Until that
is deployed the idempotency lookup answers `400` and **every call is refused** rather than
risking duplicate commandes.

The endpoint writes to the BC entity **`plexusDevisRequests`**, which does not exist yet.
Until it is deployed, valid requests return `502` (BC answers `404`).

Create table `PLX_DevisRequest` and expose it as a writable API page with these fields:

| API field | Type | Notes |
|---|---|---|
| `number` | Code[20] | Plexus id, `DD` + timestamp. Primary key |
| `externalReference` | Code[50] | Caller's id. **Add a unique key** — backstop against duplicate retries |
| `customerNo` | Code[20] | Always `C0090` (PLEXUSPEC) |
| `status` | Code[20] | `RECEIVED` on create |
| `garageName` | Text[100] | |
| `garageCustomerNo` | Code[20] | Optional |
| `commercialId` | Code[50] | Optional |
| `commercialName` | Text[100] | Optional |
| `registrationNumber` | Code[20] | Immatriculation |
| `vin` | Code[25] | |
| `vehicleMake` | Text[50] | Marque — matches `PLX_VehicleModel."Make"` |
| `vehicleModel` | Text[100] | Modèle — matches `PLX_VehicleModel."Model"` |
| `createdOnDevice` | DateTime | Field capture time, sent as `createdAt`. Distinct from `creationDateTime` (when Plexus received it) — an offline visit arrives late |
| `notes` | Text[2000] | Use BigText if Text is capped |
| `itemsJson` | BigText | JSON array of `{description, quantity}` |
| `mediaJson` | BigText | JSON array of `{type, url, label, durationSec}` |

**Why `itemsJson` / `mediaJson` instead of child tables.** Child rows would read better in
the BC UI, but creating header + N lines is several BC calls with no transaction around
them. A partial failure would leave a demande holding half its photos, and the retry
would then hit the idempotency check and never repair it. One atomic write is worth more
than clickable sub-rows. If the child-table version is wanted later, the JSON columns are
a clean migration source.

`mediaJson` and `itemsJson` are **Blob** fields — an AL table text field caps at 2048
characters and a dozen photo URLs exceed that. They are exposed as plain text on the API
page via `Get/SetItemsJson` and `Get/SetMediaJson`.

### BC UI pages

Staff work the demandes from two pages (searchable as **"Demandes de devis"**):

| Object | ID | Purpose |
|---|---|---|
| `PLX Demandes Devis` | 52270 | List, newest first. Untreated rows styled `Attention`. Multi-select mark treated / untreated, filter to untreated only |
| `PLX Demande Devis Card` | 52271 | Full detail. **"Ouvrir les médias"** opens every photo/vocal in the browser (confirms first past 5) |

The list is `Editable = false` on purpose — rows come from the partner API, not from
keyboard entry, so a stray keystroke can't rewrite what the commercial sent. Treatment is
changed through the actions.

---

## 4. Configuration

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `PARTNER_API_KEY` | to enable | *(empty)* | Shared key. Empty = surface closed |
| `DEMANDE_DEVIS_CUSTOMER_NO` | no | `C0090` | Customer the demandes are booked against |
| `JWT_SECRET` | **yes** | *none* | Portal signing key — backend refuses to start without it |
| `ALLOWED_ORIGINS` | no | `https://plexus-tec.com,https://www.plexus-tec.com` | Browser CORS allowlist (portal only) |
