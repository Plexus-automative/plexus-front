# Partner API — Demandes de devis

Machine-to-machine API for the commercial mobile app's backend.

**Flow:** a commercial tours a garage with the mobile app, capturing photos and voice
notes that upload to *their* backend. On "créer demande devis", that backend calls this
API. Plexus records the demande against **PLEXUSPEC (C0090)** with links to the media,
and prices it afterwards. No Purchase Order and no vendor exist at creation — the
demande is a request, not yet an order.

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

### Errors
| Code | `error` | Meaning |
|---|---|---|
| 400 | `validation_failed` | Field-level `violations[]` included |
| 400 | `malformed_json` | Body isn't valid JSON |
| 401 | `unauthorized` | Missing or wrong `X-API-Key` |
| 502 | `upstream_error` | Business Central unreachable — **retry with the same reference** |
| 500 | `internal_error` | Same: retry with the same reference |

Error bodies never include Business Central internals.

---

## 3. Business Central side — required before this works

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
