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

for ep in ['purchaseInvoices', 'salesInvoices']:
    print(f"\n===== {ep} (standard v2.0) =====")
    r = requests.get(f"{std}/{ep}?$top=1", headers=H)
    print("status", r.status_code)
    if r.status_code == 200:
        v = r.json().get('value', [])
        if v:
            print("KEYS:", list(v[0].keys()))
            # highlight anything order/insurance related
            for k, val in v[0].items():
                if any(t in k.lower() for t in ['order', 'insur', 'purchase', 'external', 'yourref', 'ref']):
                    print(f"   * {k} = {val}")
    else:
        print(r.text[:300])

# Also probe the NEL Sales API for sales orders link field PurchaseHeaderNoNew
salesApi = full.replace('AcessPurchasesAPI', 'AcessSalesAPI')
print("\n===== PlexussalesOrders (NEL) sample keys =====")
r = requests.get(f"{salesApi}/PlexussalesOrders?$top=1", headers=H)
print("status", r.status_code)
if r.status_code == 200:
    v = r.json().get('value', [])
    if v:
        keys = list(v[0].keys())
        print("KEYS:", keys)
        for k in keys:
            if any(t in k.lower() for t in ['purchase', 'insur', 'order']):
                print(f"   * {k} = {v[0].get(k)}")
else:
    print(r.text[:300])
