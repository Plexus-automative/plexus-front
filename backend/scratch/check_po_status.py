import requests
import json

env_vars = {}
try:
    with open('/Users/hemdaouitarek/Desktop/plexus-front/.env', 'r') as f:
        for line in f:
            if '=' in line and not line.startswith('#'):
                k, v = line.strip().split('=', 1)
                env_vars[k.strip()] = v.strip()
except Exception as e:
    print("Error reading .env:", e)

client_id = env_vars.get('BC_CLIENT_ID')
client_secret = env_vars.get('BC_CLIENT_SECRET')
tenant_id = env_vars.get('BC_TENANT_ID')
token_uri = env_vars.get('BC_TOKEN_URI') or f"https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/token"
baseUrl = env_vars.get('BC_BASE_URL')
company_id = env_vars.get('BC_COMPANY_ID')

payload = {
    'grant_type': 'client_credentials',
    'client_id': client_id,
    'client_secret': client_secret,
    'scope': 'https://api.businesscentral.dynamics.com/.default'
}

response = requests.post(token_uri, data=payload)
token = response.json().get('access_token')

if baseUrl and '/companies(' not in baseUrl and company_id:
    baseUrl += f"/companies({company_id})"

headers = {
    'Authorization': f'Bearer {token}',
    'Accept': 'application/json'
}

for po_no in ['CA26/1364', 'CA26/1365']:
    url = f"{baseUrl}/PlexuspurchaseOrders?$filter=number eq '{po_no}'"
    res = requests.get(url, headers=headers)
    print(f"\nPO {po_no} details:")
    if res.status_code == 200:
        val = res.json().get("value", [])
        if val:
            h = val[0]
            print(f"Number: {h.get('number')} | Status: {h.get('status')} | ShippingAdvice: {h.get('ShippingAdvice')} | QtyReceived: {h.get('QtyReceived')}")
        else:
            print("Not found (possibly fully received and archived)")
    else:
        print("Error:", res.text)
