import requests

env = {}
with open('/Users/hemdaouitarek/Desktop/plexus-front/.env') as f:
    for line in f:
        if '=' in line and not line.startswith('#'):
            k, v = line.strip().split('=', 1); env[k.strip()] = v.strip()

tarek = env['BC_TAREK_SYSTEM_API_URL']
full = tarek if '/companies(' in tarek else f"{tarek}/companies({env['BC_COMPANY_ID']})"
tok = requests.post(f"https://login.microsoftonline.com/{env['BC_TENANT_ID']}/oauth2/v2.0/token", data={
    'grant_type': 'client_credentials', 'client_id': env['BC_CLIENT_ID'],
    'client_secret': env['BC_CLIENT_SECRET'], 'scope': 'https://api.businesscentral.dynamics.com/.default'
}).json()['access_token']
H = {'Authorization': f'Bearer {tok}'}

df = requests.utils.quote("dateFilter eq '2026-01-01..2026-07-09'")

# top customers
r = requests.get(f"{full}/plexusCustomers?$filter={df}", headers=H)
print("plexusCustomers:", r.status_code)
if r.status_code == 200:
    v = r.json().get('value', [])
    v = [c for c in v if (c.get('salesLCY') or 0)]
    v.sort(key=lambda c: -(c.get('salesLCY') or 0))
    print(f"  rows={len(r.json().get('value', []))}, with sales={len(v)}; top 5:")
    for c in v[:5]:
        print(f"    {c.get('number')} {(c.get('name') or '')[:28]:28s} salesLCY={c.get('salesLCY')} pay={c.get('paymentsLCY')}")
else:
    print("  ", r.text[:200])

# top vendors
r = requests.get(f"{full}/plexusVendors?$filter={df}", headers=H)
print("plexusVendors:", r.status_code)
if r.status_code == 200:
    v = r.json().get('value', [])
    v.sort(key=lambda c: -(c.get('purchaseLCY') or 0))
    print(f"  rows={len(r.json().get('value', []))}; top 5:")
    for c in v[:5]:
        print(f"    {c.get('number')} {(c.get('name') or '')[:28]:28s} purchaseLCY={c.get('purchaseLCY')} pay={c.get('paymentsLCY')}")
else:
    print("  ", r.text[:300])

# export order lines (for articles/marques)
flt = requests.utils.quote("orderDate ge 2026-01-01 and orderDate le 2026-07-09")
r = requests.get(f"{full}/plexusExportOrderLines?$filter={flt}&$top=3", headers=H)
print("plexusExportOrderLines:", r.status_code)
if r.status_code == 200:
    v = r.json().get('value', [])
    if v:
        print("  sample keys:", list(v[0].keys()))
        print("  sample row :", {k: v[0].get(k) for k in ('number','itemNo','description','quantity','lineAmount','brand')})
else:
    print("  ", r.text[:300])
