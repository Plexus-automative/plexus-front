import requests
from collections import defaultdict

env = {}
with open('/Users/hemdaouitarek/Desktop/plexus-front/.env') as f:
    for line in f:
        if '=' in line and not line.startswith('#'):
            k, v = line.strip().split('=', 1); env[k.strip()] = v.strip()

base = env['BC_BASE_URL']
full = base if '/companies(' in base else f"{base}/companies({env['BC_COMPANY_ID']})"
tok = requests.post(f"https://login.microsoftonline.com/{env['BC_TENANT_ID']}/oauth2/v2.0/token", data={
    'grant_type': 'client_credentials', 'client_id': env['BC_CLIENT_ID'],
    'client_secret': env['BC_CLIENT_SECRET'], 'scope': 'https://api.businesscentral.dynamics.com/.default'
}).json()['access_token']
H = {'Authorization': f'Bearer {tok}'}

sel = "number,SellToCustomerNo,vendorName,payToName,shipToName,shipToContact,InsuranceName,totalAmountExcludingTax"
flt = "InsuranceName ne '' and orderDate ge 2026-01-01 and orderDate le 2026-07-05"
url = f"{full}/PlexuspurchaseOrders?$filter=" + requests.utils.quote(flt) + "&$select=" + requests.utils.quote(sel)

rows = []
while url:
    b = requests.get(url, headers=H).json()
    rows += b.get('value', [])
    url = b.get('@odata.nextLink')

print(f"orders={len(rows)}")
for field in ['SellToCustomerNo', 'vendorName', 'payToName', 'shipToName', 'shipToContact']:
    vals = defaultdict(lambda: [0, 0.0])
    for o in rows:
        v = (o.get(field) or '').strip() or '(vide)'
        vals[v][0] += 1
        vals[v][1] += float(o.get('totalAmountExcludingTax') or 0)
    print(f"\n=== {field}: {len(vals)} distinct ===")
    for v, c in sorted(vals.items(), key=lambda x: -x[1][1])[:8]:
        print(f"   {v!r}: {c[0]} orders | {c[1]:.0f} HT")
