import requests

env = {}
with open('/Users/hemdaouitarek/Desktop/plexus-front/.env') as f:
    for line in f:
        if '=' in line and not line.startswith('#'):
            k, v = line.strip().split('=', 1); env[k.strip()] = v.strip()

base = env['BC_BASE_URL']
full = base if '/companies(' in base else f"{base}/companies({env['BC_COMPANY_ID']})"
std = full.replace('/api/NEL/AcessPurchasesAPI/v2.0', '/api/v2.0')
tok = requests.post(f"https://login.microsoftonline.com/{env['BC_TENANT_ID']}/oauth2/v2.0/token", data={
    'grant_type': 'client_credentials', 'client_id': env['BC_CLIENT_ID'],
    'client_secret': env['BC_CLIENT_SECRET'], 'scope': 'https://api.businesscentral.dynamics.com/.default'
}).json()['access_token']
H = {'Authorization': f'Bearer {tok}'}

codes = ['C0005', 'C0019', 'C0071', 'C0070', 'C0077', 'C0090', 'C0018', 'C0041']
url = std + "/customers?$select=number,displayName&$top=500"
r = requests.get(url, headers=H)
print("status", r.status_code)
if r.status_code == 200:
    vals = r.json().get('value', [])
    print("total customers:", len(vals))
    if vals:
        print("sample keys:", list(vals[0].keys()))
    m = {c.get('number'): c.get('displayName') for c in vals}
    print("\n--- mapping for our 8 codes ---")
    for c in codes:
        print(f"  {c} -> {m.get(c)}")
else:
    print(r.text[:400])
