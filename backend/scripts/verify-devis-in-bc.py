#!/usr/bin/env python3
"""
Inspect the demandes de devis directly in Business Central, bypassing the backend.

Use this to confirm what actually landed in BC — especially itemsJson / mediaJson, which
live in Blob fields and are the part most likely to break silently.

  python3 verify-devis-in-bc.py                 # list all demandes
  python3 verify-devis-in-bc.py --ref REQ-123   # show one, with parsed JSON payloads
  python3 verify-devis-in-bc.py --cleanup       # DELETE every row whose reference starts with TEST-

Reads BC credentials from the repo-root .env. Requires: pip install requests
"""
import argparse
import json
import os
import sys

try:
    import requests
except ImportError:
    sys.exit("pip install requests")

ENV_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '.env')


def load_env():
    env = {}
    with open(os.path.abspath(ENV_PATH)) as f:
        for line in f:
            if '=' in line and not line.strip().startswith('#'):
                k, v = line.strip().split('=', 1)
                env[k.strip()] = v.strip()
    return env


def connect(env):
    token = requests.post(
        f"https://login.microsoftonline.com/{env['BC_TENANT_ID']}/oauth2/v2.0/token",
        data={
            'grant_type': 'client_credentials',
            'client_id': env['BC_CLIENT_ID'],
            'client_secret': env['BC_CLIENT_SECRET'],
            'scope': 'https://api.businesscentral.dynamics.com/.default',
        }, timeout=60).json().get('access_token')
    if not token:
        sys.exit("Could not get a BC token — check BC_* values in .env")

    base = env['BC_TAREK_SYSTEM_API_URL']
    if '/companies(' not in base:
        base = f"{base}/companies({env['BC_COMPANY_ID']})"
    return f"{base}/plexusDevisRequests", {'Authorization': f'Bearer {token}',
                                           'Accept': 'application/json'}


def fetch(entity, headers, ref=None):
    url = entity
    if ref:
        url += f"?$filter=externalReference eq '{ref}'"
    r = requests.get(url, headers=headers, timeout=90)
    r.raise_for_status()
    return r.json().get('value', [])


def show(rec):
    print(f"\n{'=' * 64}\n{rec.get('number')}   {rec.get('externalReference')}\n{'=' * 64}")
    for k in ('status', 'customerNo', 'customerName', 'garageName', 'garageCustomerNo',
              'commercialId', 'commercialName', 'registrationNumber', 'vin',
              'vehicleMake', 'vehicleModel', 'notes', 'createdOnDevice', 'creationDateTime', 'treated'):
        print(f"  {k:20} = {rec.get(k)!r}")

    for field in ('itemsJson', 'mediaJson'):
        raw = rec.get(field) or ''
        print(f"\n  {field}: {len(raw)} chars")
        if not raw:
            print("    (empty)")
            continue
        try:
            for entry in json.loads(raw):
                print(f"    {entry}")
        except Exception as exc:
            print(f"    !! does not parse as JSON: {exc}")
            print(f"    raw: {raw[:200]}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--ref', help='show one demande by externalReference')
    ap.add_argument('--cleanup', action='store_true',
                    help='delete every demande whose externalReference starts with TEST-')
    args = ap.parse_args()

    entity, headers = connect(load_env())

    if args.cleanup:
        rows = [r for r in fetch(entity, headers)
                if (r.get('externalReference') or '').startswith('TEST-')]
        if not rows:
            print("Nothing to clean up.")
            return
        for rec in rows:
            d = requests.delete(f"{entity}({rec['id']})",
                                headers={**headers, 'If-Match': '*'}, timeout=60)
            print(f"  DELETE {rec['number']} ({rec['externalReference']}) -> {d.status_code}")
        print(f"\nremaining rows: {len(fetch(entity, headers))}")
        return

    rows = fetch(entity, headers, args.ref)
    if not rows:
        print("No demandes found.")
        return
    if args.ref:
        for rec in rows:
            show(rec)
    else:
        print(f"{len(rows)} demande(s):\n")
        for rec in rows:
            print(f"  {rec.get('number'):20} {rec.get('externalReference'):30} "
                  f"{rec.get('status'):10} {rec.get('garageName')}")
        print("\nUse --ref <externalReference> to see one in full.")


if __name__ == '__main__':
    main()
