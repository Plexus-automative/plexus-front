import requests
import json

# Load .env file
env_vars = {}
try:
    with open('/Users/hemdaouitarek/Desktop/plexus-front/.env', 'r') as f:
        for line in f:
            if '=' in line and not line.startswith('#'):
                k, v = line.strip().split('=', 1)
                env_vars[k.strip()] = v.strip()
except Exception as e:
    print("Error reading .env:", e)

# Extract BC credentials
client_id = env_vars.get('BC_CLIENT_ID')
client_secret = env_vars.get('BC_CLIENT_SECRET')
tenant_id = env_vars.get('BC_TENANT_ID')
token_uri = env_vars.get('BC_TOKEN_URI') or f"https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/token"
tarek_system_url = env_vars.get('BC_TAREK_SYSTEM_API_URL')
company_id = env_vars.get('BC_COMPANY_ID')

payload = {
    'grant_type': 'client_credentials',
    'client_id': client_id,
    'client_secret': client_secret,
    'scope': 'https://api.businesscentral.dynamics.com/.default'
}

response = requests.post(token_uri, data=payload)
token = response.json().get('access_token')

if tarek_system_url and '/companies(' not in tarek_system_url and company_id:
    tarek_system_url += f"/companies({company_id})"

headers = {
    'Authorization': f'Bearer {token}',
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'If-Match': '*'
}

# Query specifically for CA26/1368 or look for recent records
url = f"{tarek_system_url}/plexusPurchaseOrderPatches?$filter=number eq 'CA26/1368'"
res = requests.get(url, headers={'Authorization': f'Bearer {token}', 'Accept': 'application/json'})
if res.status_code == 200:
    items = res.json().get("value", [])
    for item in items:
        po_id = item.get("id")
        po_no = item.get("number")
        insured_name = item.get("InsuredName")
        if insured_name and " / " in insured_name:
            parts = insured_name.split(" / ")
            if len(parts) > 1:
                clean_name = parts[1].strip()
                print(f"PO {po_no} ({po_id}): '{insured_name}' -> will patch to '{clean_name}'")
                patch_payload = {"InsuredName": clean_name}
                patch_url = f"{tarek_system_url}/plexusPurchaseOrderPatches({po_id})"
                patch_res = requests.patch(patch_url, headers=headers, json=patch_payload)
                if patch_res.status_code == 200:
                    print(f"Successfully cleaned up PO {po_no}")
                else:
                    print(f"Failed to patch PO {po_no}: {patch_res.text}")
else:
    print("Failed to query CA26/1368:", res.text)
