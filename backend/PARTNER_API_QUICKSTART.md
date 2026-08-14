# Plexus Partner API — integration guide

For the commercial mobile app's backend. One page: the flow end to end, then the traps.
Full reference: `PARTNER_API.md`.

**Base path** `https://<plexus-host>/api/partner/v1`
**Auth** `X-API-Key: <key>` on every call. Server to server only — no CORS, never from a phone.
Check it works: `GET /ping` → `{"status":"ok"}`.

---

## The flow

```
1. GET  /articles?reference=…      find the part and its suppliers
2. POST /orders                    place the commande(s)   → keep the number(s)
3. GET  /orders?number=…           poll: the supplier prices and answers
4. POST /orders/validate           keep what you buy, drop the rest
```

### 1. Find the part

```
GET /articles?reference=9805454880
```

One row **per supplier** carrying that reference. Pick the row your commercial wants: its
`reference` + `vendorNo` are what you order with.

`lastPriceUpdate` tells you how old that price is — `freshness` is `recent` (≤ 7 days),
`aging` (≤ 14) or `stale`. `null` means the price never moved. Use `freshness` as it comes;
do not re-derive it, so your screens and the Plexus dashboard say the same thing.

### 2. Place the commande

```json
POST /orders
{
  "externalReference": "CMD-2026-0042",
  "pecDossier": "PEC-2026-0841",
  "vehicle":   { "immatriculation": "123TU4567", "vin": "VF1AAAA00AA000001" },
  "insurance": { "name": "MAE ASSURANCE", "claimNumber": "SIN-2026-77",
                 "insuredName": "Ben Ali Mohamed" },
  "items": [ { "reference": "9805454880", "vendorNo": "F0005", "quantity": 2 },
             { "reference": "3G1941005C", "vendorNo": "F0057", "quantity": 1 } ]
}
```

→ `201` with `orders[]`. **Store every `number`** (`CA26/1408`, …): that is what Plexus, the
supplier and the invoice all refer to.

Leave `unitPrice` out and the live catalogue price is used — safer than a price your app
cached. Add `"adaptable": true` with a `chassisNo` for a part whose reference still has to be
confirmed against the vehicle.

### 3. Follow it

```
GET /orders?number=CA26%2F1408      one commande
GET /orders/PEC-2026-0841           every commande of the dossier
```

Poll after creating. The supplier answers line by line and **he can change the price**:

```json
{ "reference": "3G1941005C", "quantity": 1,
  "unitPrice": 590, "previousUnitPrice": 490, "priceChanged": true, "priceDifference": 100,
  "decision": "Disponible", "availableQuantity": 1, "expectedDeliveryDate": "" }
```

`anyPriceChanged` on the commande saves you walking the lines. `lastModified` tells you
whether anything moved since your last poll.

Each line also carries **`lastPriceUpdateDate`** — when that article's catalogue price last
moved (ISO-8601, `null` if it never did). That is what you date the badge in your commande
list with. The full block — old price, new price, `freshness` — stays on `GET /articles`.

> **Two price signals on a line, two meanings.** `previousUnitPrice` / `priceChanged` is the
> supplier changing his price **on this commande**. `lastPriceUpdateDate` comes from the
> **article's own** history, across every commande and every date. A line can carry one
> without the other.

`state`: `AWAITING_SUPPLIER` → `PARTIALLY_CONFIRMED` → `CONFIRMED` → `SHIPPED` → `RECEIVED`,
or `CANCELLED`. You can validate at `PARTIALLY_CONFIRMED`.

`decision` per line: `Disponible`, `NonDisponible`, `LivPrevuaDate` (then
`expectedDeliveryDate` carries the date), or empty while he has not answered.

### 4. Validate

The commercial keeps what he buys:

```json
POST /orders/validate
{ "number": "CA26/1408",
  "splitDeferredLines": true,
  "lines": [ { "lineId": "f75…", "quantity": 2 },
             { "lineId": "f85…", "quantity": 1 },
             { "lineId": "f95…", "quantity": 0 } ] }
```

`quantity: 0` **removes the line from the commande** — that is how you drop a part you are
buying from another supplier. Identify lines by the `lineId` you got from step 3.

**Keeping nothing is a cancellation, not a validation.** If the commercial takes none of a
commande's lines, `POST /orders/validate` refuses (`400`) and you call this instead:

```json
POST /orders/cancel
{ "number": "CA26/1423" }
```

**The number is all this takes.** Everything dropped through this API is a devis that never
converted — no order was ever placed, a quote simply did not turn into one — so Plexus records
the cause itself, always as the word `Devis`. Real cancellations, decided by an expert or a
client, are made from the Plexus dashboard and keep their own reasons; the two never mix in
the reporting.

The commande still ends up `Annulation` in Business Central: that status is what hides it from
suppliers and clients, which is wanted here too. A retry answers `200` with
`"alreadyCancelled": true`.

### 5. Settle the whole dossier in one call

A dossier splits into one commande per supplier, and they are settled together. Rather than
one call per commande:

```json
POST /orders/batch
{ "orders": [
    { "number": "CA26/1426", "action": "validate", "splitDeferredLines": false,
      "lines": [ { "lineId": "dce…", "quantity": 2 } ] },
    { "number": "CA26/1427", "action": "cancel" }
] }
```

Each result carries its own `status` and **the very body the single endpoint would have
returned**, so you read it the same way. `200` if all went through, `207` if some did not,
`400` if none. Resend only the entries whose `ok` is `false` — both operations are idempotent,
so resending one that actually succeeded is harmless.

---

## Six things that will bite you

**1. `externalReference` and `pecDossier` are not the same thing.**
`externalReference` identifies **one call** — reuse it to retry, never for a new order.
`pecDossier` **groups** every commande of one prise en charge — reuse it freely.
Retry with the same `externalReference` → `200`, nothing created, `duplicate: true`.
New order under the same dossier → new `externalReference`, and you get a new commande.

**2. One commande per supplier.** A cart spanning three suppliers comes back as three entries
in `orders[]`. Take them all, not just the first.

**3. Commande numbers contain a slash.** `CA26/1408`. Always the query form
`GET /orders?number=CA26%2F1408` — a path segment is rejected with `400` before it reaches us.

**4. `totalExcludingTax` is not `quantity × unitPrice`.** The supplier discount is applied by
Plexus (18 %, 23 %… depending on the supplier). Show the total we return, never your own
multiplication.

**5. `splitDeferredLines: false` DROPS the lines.** When the supplier promises a part for a
later date, that line leaves the commande **either way**. `true` re-orders it in a separate
commande (same `pecDossier`); `false` abandons it — the part is then on order nowhere. Read
`deferredLines[].outcome` (`MOVED_TO_NEW_ORDER` / `REMOVED`) to know what happened.

**6. On validate, name every line.** A line missing from the payload is a `400`, not a
default. That call both deletes and commits, so silence is not taken for consent.

---

## Status codes

| Code | Where | Meaning |
|---|---|---|
| `201` | POST /orders | Created |
| `200` | POST /orders | Everything already existed — a retry, nothing created |
| `207` | POST /orders | Partial: `orders[]` exist, `failed[]` must be resent (**those items only**) |
| `200` | POST /orders/validate | Done, or `alreadyValidated: true` on a replay |
| `400` | any | `validation_failed`, with a `violations[]` naming the fields |
| `401` | any | Missing or wrong `X-API-Key` |
| `404` | GET /orders | Unknown number, or a commande not created through this API |
| `409` | validate | `not_validatable` — the supplier has not answered yet |
| `502` | any | Business Central unreachable — retry with the same references |

Anything `2xx` that is not `201` still deserves a look at `orders[]` and `failed[]`.

## One caveat on validate

A validation that splits a commande leaves Business Central cleaning up in the background.
If the echo is late, `order` or `splitOrder` come back `null` **with `validated: true`** — the
write went through, only the read-back was slow. Fetch them a few seconds later with
`GET /orders/{pecDossier}`. **Do not retry the validation.**
