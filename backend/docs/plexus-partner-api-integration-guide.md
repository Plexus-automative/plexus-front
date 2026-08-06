# Plexus Partner API — Integration Guide

**Demandes de devis (quote requests)**
Version 1 · API version `v1`

---

## 1. Overview

This API lets your backend submit a **demande de devis** to Plexus on behalf of a
commercial visiting a garage.

The intended flow is:

1. Your mobile app captures the visit — photos, voice notes, vehicle details, requested
   parts — and uploads the media to **your** storage.
2. When the commercial taps "créer demande devis", **your backend** calls this API with
   the visit details plus **URLs** pointing at the media you stored.
3. Plexus records the demande and prices it. Media files are never uploaded to Plexus —
   only the links you provide.

**This is a server-to-server API.** Call it from your backend, never directly from the
mobile app: the credential below must not ship inside a mobile binary, where it can be
extracted.

---

## 2. Authentication

Every request must carry a shared API key:

```
X-API-Key: <your key>
```

The key will be sent to you **separately, through a secure channel** — it is deliberately
not written in this document.

Requirements on your side:

- Store the key as a server-side secret (environment variable or secret manager). Never
  commit it, and never embed it in the mobile app.
- Send it over HTTPS only.
- Tell us immediately if you suspect it has leaked — we will issue a new one and revoke
  the old.

Requests with a missing or incorrect key receive `401`. There is no other authentication
scheme on this API; user tokens from other Plexus systems are not accepted.

---

## 3. Base URL

```
https://www.plexus-tec.com/api/partner/v1
```

All paths below are relative to that base. HTTPS is required.

CORS is not enabled — this API is not callable from a browser by design.

---

## 4. Endpoints

### 4.1 `GET /ping` — check your credentials

Verifies your key without writing any data. Use it after setup and in your health checks.

```bash
curl -H "X-API-Key: $PLEXUS_API_KEY" \
     https://www.plexus-tec.com/api/partner/v1/ping
```

```json
{ "status": "ok", "service": "plexus-partner-api", "version": "v1" }
```

---

### 4.2 `POST /demandes-devis` — submit a demande

**Content-Type:** `application/json`

```bash
curl -X POST https://www.plexus-tec.com/api/partner/v1/demandes-devis \
  -H "X-API-Key: $PLEXUS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "externalReference": "REQ-2026-0841",
    "createdAt":  "2026-08-04T08:12:00+01:00",
    "garage":     { "name": "Garage Ben Ali", "customerNo": "C0123" },
    "commercial": { "id": "COM-7", "name": "Sami" },
    "vehicle":    { "immatriculation": "123TU4567",
                    "vin": "VF1AAAA00AA000001",
                    "make": "Renault",
                    "model": "Clio" },
    "items": [
      { "description": "Plaquettes de frein avant", "quantity": 4,
        "addedAt": "2026-08-04T08:15:30+01:00" },
      { "description": "Disques avant", "quantity": 2,
        "addedAt": "2026-08-04T08:19:05+01:00" }
    ],
    "notes": "Visite du 4 août — véhicule disponible la semaine prochaine.",
    "media": [
      { "type": "photo", "url": "https://votre-backend/media/p1.jpg", "label": "avant",
        "addedAt": "2026-08-04T08:13:44+01:00" },
      { "type": "photo", "url": "https://votre-backend/media/p2.jpg", "label": "arrière",
        "addedAt": "2026-08-04T08:14:02+01:00" },
      { "type": "audio", "url": "https://votre-backend/media/v1.m4a", "durationSec": 42,
        "addedAt": "2026-08-04T08:21:10+01:00" }
    ]
  }'
```

**`201 Created`**

```json
{
  "number": "DD26080415301",
  "externalReference": "REQ-2026-0841",
  "status": "RECEIVED",
  "duplicate": false
}
```

`number` is the Plexus-side identifier. Store it — quote it in any correspondence about
this demande.

---

### 4.3 `GET /demandes-devis/{externalReference}` — check status

Look a demande up using **your own** reference, so you don't need to store ours.

```bash
curl -H "X-API-Key: $PLEXUS_API_KEY" \
  https://www.plexus-tec.com/api/partner/v1/demandes-devis/REQ-2026-0841
```

Returns the same shape as above, or `404` if we have no demande with that reference.

---

## 5. Field reference

### Top level

| Field | Type | Required | Constraints |
|---|---|---|---|
| `externalReference` | string | **yes** | ≤ 50 chars. Your identifier. Must be stable across retries — see §6 |
| `createdAt` | timestamp | no | When the commercial started the demande on the device — see §5.1 |
| `garage` | object | **yes** | |
| `commercial` | object | no | |
| `vehicle` | object | **yes** | The object is required; its fields are individually optional |
| `items` | array | no | ≤ 200 entries |
| `notes` | string | no | ≤ 2000 chars |
| `media` | array | no | ≤ 100 entries |

### `garage`

| Field | Type | Required | Constraints |
|---|---|---|---|
| `name` | string | **yes** | ≤ 100 chars |
| `customerNo` | string | no | ≤ 20 chars. Plexus customer number, if the garage is already a client |

### `commercial`

| Field | Type | Required | Constraints |
|---|---|---|---|
| `id` | string | no | ≤ 50 chars |
| `name` | string | no | ≤ 100 chars |

### `vehicle`

| Field | Type | Required | Constraints |
|---|---|---|---|
| `immatriculation` | string | no | ≤ 20 chars |
| `vin` | string | no | ≤ 25 chars |
| `make` | string | no | ≤ 50 chars. Marque, e.g. `Renault` |
| `model` | string | no | ≤ 100 chars. Modèle, e.g. `Clio` |

Although each field is optional, **send at least `immatriculation`**. A demande with no
way to identify the vehicle usually can't be priced and will come back to you as a query.

### `items[]`

| Field | Type | Required | Constraints |
|---|---|---|---|
| `description` | string | **yes** | ≤ 250 chars |
| `quantity` | integer | no | ≥ 1. Defaults to 1 |
| `addedAt` | timestamp | no | When the commercial added this line — see §5.1 |

### `media[]`

| Field | Type | Required | Constraints |
|---|---|---|---|
| `type` | string | **yes** | ≤ 20 chars. Use `photo`, `audio`, or `document` |
| `url` | string | **yes** | ≤ 500 chars. **Must start with `http://` or `https://`** |
| `label` | string | no | ≤ 100 chars |
| `durationSec` | integer | no | ≥ 0. For audio |
| `addedAt` | timestamp | no | When the photo was taken or the voice note recorded — see §5.1 |

### 5.1 Timestamp format

All timestamp fields use **ISO-8601 with an explicit UTC offset**:

```
2026-08-04T08:13:44+01:00
```

`Z` is also accepted (`2026-08-04T07:13:44Z`). A timestamp **without** an offset is
rejected — we cannot tell 08:13 in Tunis from 08:13 in Paris, and a demande whose photos
appear to precede the visit is worse than one with no times at all.

Send the moment the information was actually captured on the device, not the moment you
relay it to us.

| Field | Records |
|---|---|
| `createdAt` | when the commercial started the demande |
| `items[].addedAt` | when that line was added |
| `media[].addedAt` | when that photo was taken / voice note recorded |

These matter because the device clock and our clock are not the same event. A visit
captured in a garage with no signal may only reach us hours later; we store both, so
whoever prices the demande sees the real sequence of the visit.

Every timestamp is optional — omit any you don't have rather than sending a guess.

---

## 6. Idempotency and retries

**Retrying is safe, provided you reuse the same `externalReference`.**

- First call with a given reference → `201`, `"duplicate": false`
- Any later call with the same reference → `200`, `"duplicate": true`, **nothing is
  created**, and you get back the original `number`

This matters because a request can time out *after* we have recorded the demande. If you
retry with a fresh reference, you create a second demande and the garage may be quoted
twice.

**Recommended client behaviour**

- Generate one `externalReference` per logical demande and persist it *before* the first
  attempt.
- On timeout or `5xx`, retry with the **same** reference. Exponential backoff, a few
  attempts.
- Treat `200 duplicate:true` as success, not as an error.
- Do not retry `400` — the payload is invalid and will keep failing.

Allow up to **60 seconds** for a response before treating a call as timed out.

---

## 7. Responses and errors

| Status | `error` | Meaning | Retry? |
|---|---|---|---|
| `201` | — | Created | — |
| `200` | — | Already existed (`duplicate:true`) | — |
| `400` | `validation_failed` | Payload invalid; see `violations[]` | **No** — fix and resend |
| `400` | `malformed_json` | Body is not valid JSON | **No** |
| `401` | `unauthorized` | Missing or wrong `X-API-Key` | No |
| `404` | `not_found` | No demande with that reference (GET only) | No |
| `502` | `upstream_error` | Temporary problem on our side | **Yes**, same reference |
| `500` | `internal_error` | Unexpected error on our side | **Yes**, same reference |

Validation errors identify the offending field:

```json
{
  "error": "validation_failed",
  "message": "The request payload is invalid.",
  "violations": [
    { "field": "externalReference", "message": "externalReference is required" },
    { "field": "media[0].url",      "message": "media.url must be an http(s) URL" }
  ]
}
```

Array fields are reported with their index, e.g. `media[0].url`, `items[2].description`.

---

## 8. Requirements on your media URLs

Plexus staff open these links **later**, when pricing the demande — often days after
submission. Please make sure that:

1. **The links stay valid.** If you use pre-signed URLs, give them a long lifetime or use
   stable links. A demande whose photos have expired cannot be priced, and we will have to
   come back to you for them.
2. **They are reachable from outside your network** — not on a private/VPN-only host.
3. **They serve the file directly** (or via redirect), rather than an HTML viewer page
   requiring a login.
4. **They use `https://`.** `http://` is accepted but discouraged.
5. **Content types are the real ones** — `image/jpeg`, `audio/mp4`, etc. — so the file
   opens correctly.

Only `http://` and `https://` URLs are accepted. Any other scheme is rejected with `400`.

---

## 9. Testing

We can supply a **Postman collection** covering every endpoint plus the error cases, with
assertions built in — ask us and we will send it over.

A quick manual smoke test:

```bash
# 1. credentials work
curl -H "X-API-Key: $PLEXUS_API_KEY" \
     https://www.plexus-tec.com/api/partner/v1/ping

# 2. minimal valid demande
curl -X POST https://www.plexus-tec.com/api/partner/v1/demandes-devis \
  -H "X-API-Key: $PLEXUS_API_KEY" -H "Content-Type: application/json" \
  -d '{"externalReference":"TEST-001",
       "garage":{"name":"Garage Test"},
       "vehicle":{"immatriculation":"123TU4567"}}'

# 3. same call again — expect 200 with "duplicate": true
```

Please prefix test references with `TEST-` and tell us when you are done, so we can clear
them out.

---

## 10. Checklist before going live

- [ ] API key stored server-side as a secret, absent from the mobile app and from source control
- [ ] `externalReference` persisted before the first attempt, reused on every retry
- [ ] `200 duplicate:true` handled as success
- [ ] Retries on `5xx` and timeouts only, with backoff — never on `4xx`
- [ ] Media URLs long-lived, publicly reachable, direct to file
- [ ] `vehicle.immatriculation` populated
- [ ] Plexus `number` from the response stored against your record
- [ ] Test demandes cleared

---

## 11. Support

Include the following when reporting a problem — it lets us find the request immediately:

- your `externalReference`
- the Plexus `number`, if you received one
- approximate timestamp with timezone
- the HTTP status and response body you saw

Please do not include the API key in any support message, ticket, or email.
