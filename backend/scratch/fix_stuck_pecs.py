import requests
import json

import os


def _load_env():
    """BC_* config from the repo .env, falling back to the process environment.

    Never hardcode credentials in this directory: it is committed, and a literal
    client_secret here is what GitHub push protection blocked on 2026-08-06.
    """
    values = dict(os.environ)
    directory = os.path.dirname(os.path.abspath(__file__))
    while True:
        candidate = os.path.join(directory, '.env')
        if os.path.exists(candidate):
            with open(candidate) as handle:
                for line in handle:
                    if '=' in line and not line.startswith('#'):
                        key, value = line.strip().split('=', 1)
                        values.setdefault(key.strip(), value.strip())
            break
        parent = os.path.dirname(directory)
        if parent == directory:
            break
        directory = parent
    return values


_env = _load_env()
client_id = _env.get('BC_CLIENT_ID')
client_secret = _env.get('BC_CLIENT_SECRET')


token_response = requests.post(
    "https://login.microsoftonline.com/235ce906-04c4-4ee5-a705-c904b1fa3167/oauth2/v2.0/token",
    data={
        "grant_type": "client_credentials",
        "client_id": client_id,
        "client_secret": client_secret,
        "scope": "https://api.businesscentral.dynamics.com/.default"
    }
)
access_token = token_response.json()["access_token"]

company_id = "B2F78390-8D47-F111-A820-6045BD6C578C"
tarek_system_url = f"https://api.businesscentral.dynamics.com/v2.0/235ce906-04c4-4ee5-a705-c904b1fa3167/Plexus/api/plexustarek/AcessSystemAPI/v1.0/companies({company_id})"

headers = {
    "Authorization": f"Bearer {access_token}",
    "Content-Type": "application/json",
    "If-Match": "*"
}

# 1. Update PEC26061811002010 header to "Réceptionné"
print("Updating PEC26061811002010 header...")
patch_header_url = f"{tarek_system_url}/plexusPecHeaders(6e33ba80-fc6a-f111-ab09-7ced8d85635b)"
res1 = requests.patch(patch_header_url, headers=headers, json={"status": "Réceptionné"})
print(f"Response: {res1.status_code}")

# 2. Update PEC26061811002010 line PLX2302BS200911N (6f33ba80-fc6a-f111-ab09-7ced8d85635b) to "Réceptionné"
print("Updating line for PEC26061811002010...")
patch_line1_url = f"{tarek_system_url}/plexusPecLines(6f33ba80-fc6a-f111-ab09-7ced8d85635b)"
res2 = requests.patch(patch_line1_url, headers=headers, json={"status": "Réceptionné"})
print(f"Response: {res2.status_code}")

# 3. Update PEC26061811021591 line PLX0102CS200020A (bc8928c8-fc6a-f111-ab09-7ced8d85635b) to "Réceptionné"
print("Updating line for PEC26061811021591...")
patch_line2_url = f"{tarek_system_url}/plexusPecLines(bc8928c8-fc6a-f111-ab09-7ced8d85635b)"
res3 = requests.patch(patch_line2_url, headers=headers, json={"status": "Réceptionné"})
print(f"Response: {res3.status_code}")

print("=== VERIFYING PEC HEADERS ===")
res_headers = requests.get(f"{tarek_system_url}/plexusPecHeaders?$filter=purchaseOrderNo eq 'CA26/1364' or purchaseOrderNo eq 'CA26/1365'", headers={"Authorization": f"Bearer {access_token}"})
print(json.dumps(res_headers.json(), indent=2))
