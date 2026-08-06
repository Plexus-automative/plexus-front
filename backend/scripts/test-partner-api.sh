#!/usr/bin/env bash
#
# Contract tests for the partner API (/api/partner/v1).
#
# Usage:
#   ./test-partner-api.sh                                  # localhost:8080, key from PARTNER_API_KEY
#   ./test-partner-api.sh http://localhost:8099 <api-key>
#   BASE_URL=https://www.plexus-tec.com API_KEY=xxx ./test-partner-api.sh
#
# Creates ONE demande in Business Central and prints its number so you can delete it
# (or run verify-devis-in-bc.py, which cleans up automatically).

set -uo pipefail

BASE_URL="${1:-${BASE_URL:-http://localhost:8080}}"
API_KEY="${2:-${API_KEY:-${PARTNER_API_KEY:-}}}"
REF="TEST-$(date +%Y%m%d%H%M%S)"

if [ -z "$API_KEY" ]; then
  echo "No API key. Pass it as \$2 or set PARTNER_API_KEY / API_KEY." >&2
  exit 2
fi

PASS=0; FAIL=0

# check <label> <expected-http> <actual-http> [detail]
check() {
  if [ "$2" = "$3" ]; then
    printf '  \033[32mPASS\033[0m  %-46s %s\n' "$1" "$3"
    PASS=$((PASS + 1))
  else
    printf '  \033[31mFAIL\033[0m  %-46s got %s, expected %s %s\n' "$1" "$3" "$2" "${4:-}"
    FAIL=$((FAIL + 1))
  fi
}

code() { curl -s -o /dev/null -w '%{http_code}' --max-time 60 "$@"; }

echo "Target: $BASE_URL"
echo "Reference for this run: $REF"
echo

echo "--- Authentication ---"
check "no API key rejected"        401 "$(code "$BASE_URL/api/partner/v1/ping")"
check "wrong API key rejected"     401 "$(code -H 'X-API-Key: definitely-not-the-right-key-0000' "$BASE_URL/api/partner/v1/ping")"
check "correct API key accepted"   200 "$(code -H "X-API-Key: $API_KEY" "$BASE_URL/api/partner/v1/ping")"
check "portal JWT is not accepted" 401 "$(code -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.e30.x' "$BASE_URL/api/partner/v1/ping")"

echo
echo "--- Validation ---"
check "empty body rejected" 400 "$(code -X POST -H "X-API-Key: $API_KEY" -H 'Content-Type: application/json' \
  -d '{}' "$BASE_URL/api/partner/v1/demandes-devis")"
check "malformed JSON rejected" 400 "$(code -X POST -H "X-API-Key: $API_KEY" -H 'Content-Type: application/json' \
  -d '{not json' "$BASE_URL/api/partner/v1/demandes-devis")"
check "javascript: media URL rejected" 400 "$(code -X POST -H "X-API-Key: $API_KEY" -H 'Content-Type: application/json' \
  -d '{"externalReference":"X","garage":{"name":"G"},"vehicle":{"immatriculation":"1"},
       "media":[{"type":"photo","url":"javascript:alert(1)"}]}' "$BASE_URL/api/partner/v1/demandes-devis")"

echo
echo "--- Create / idempotency (writes to Business Central) ---"
BODY='{"externalReference":"'"$REF"'",
  "garage":{"name":"TEST Garage","customerNo":"C0123"},
  "commercial":{"id":"COM-TEST","name":"Test Commercial"},
  "createdAt":"2026-08-04T08:12:00+01:00",
  "vehicle":{"immatriculation":"123TU4567","vin":"VF1AAAA00AA000001","make":"Renault","model":"Clio"},
  "items":[{"description":"Plaquettes de frein avant","quantity":4,"addedAt":"2026-08-04T08:15:30+01:00"}],
  "notes":"Test automatise",
  "media":[{"type":"photo","url":"https://cdn.example.com/p1.jpg","label":"avant","addedAt":"2026-08-04T08:13:44+01:00"},
           {"type":"audio","url":"https://cdn.example.com/v1.m4a","durationSec":42}]}'

CREATED=$(curl -s --max-time 90 -X POST -H "X-API-Key: $API_KEY" -H 'Content-Type: application/json' \
  -d "$BODY" "$BASE_URL/api/partner/v1/demandes-devis")
check "create returns 201" 201 "$(code -X POST -o /dev/null -H "X-API-Key: $API_KEY" -H 'Content-Type: application/json' \
  -d "${BODY/$REF/$REF-B}" "$BASE_URL/api/partner/v1/demandes-devis")"

NUMBER=$(printf '%s' "$CREATED" | sed -n 's/.*"number":"\([^"]*\)".*/\1/p')
echo "    created: ${NUMBER:-<none>}   $CREATED"

check "retry is idempotent (200)" 200 "$(code -X POST -H "X-API-Key: $API_KEY" -H 'Content-Type: application/json' \
  -d "$BODY" "$BASE_URL/api/partner/v1/demandes-devis")"
RETRY=$(curl -s --max-time 60 -X POST -H "X-API-Key: $API_KEY" -H 'Content-Type: application/json' \
  -d "$BODY" "$BASE_URL/api/partner/v1/demandes-devis")
case "$RETRY" in
  *'"duplicate":true'*) check "retry flagged duplicate" y y ;;
  *)                    check "retry flagged duplicate" y n "-> $RETRY" ;;
esac

echo
echo "--- Status lookup ---"
check "GET known reference"   200 "$(code -H "X-API-Key: $API_KEY" "$BASE_URL/api/partner/v1/demandes-devis/$REF")"
check "GET unknown reference" 404 "$(code -H "X-API-Key: $API_KEY" "$BASE_URL/api/partner/v1/demandes-devis/NOPE-$RANDOM")"

echo
echo "==================================================="
echo "  passed: $PASS   failed: $FAIL"
echo "  test records created in BC: $REF and $REF-B"
echo "  clean up with: python3 verify-devis-in-bc.py --cleanup"
echo "==================================================="
[ "$FAIL" -eq 0 ]
