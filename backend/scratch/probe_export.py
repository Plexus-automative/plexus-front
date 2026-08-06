import requests
from collections import OrderedDict

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

# Mirror the Annulées export: shippingAdvice=Annulation + orderDate range
flt = "shippingAdvice eq 'Annulation' and orderDate ge 2026-01-01 and orderDate le 2026-07-09"
url = f"{full}/plexusExportOrderLines?$filter={requests.utils.quote(flt)}"

orders = OrderedDict()
lines = 0
pages = 0
while url and pages < 200:
    r = requests.get(url, headers=H)
    if r.status_code != 200:
        print("ERR", r.status_code, r.text[:300]); break
    b = r.json()
    for row in b.get("value", []):
        lines += 1
        num = row.get("number")
        o = orders.setdefault(num, {"number": num, "totalAmount": row.get("totalAmount"),
                                    "shippingAdvice": row.get("shippingAdvice"),
                                    "orderDate": row.get("orderDate"), "lines": 0})
        o["lines"] += 1
    url = b.get("@odata.nextLink")
    pages += 1

print(f"filter OK: pages={pages} lines={lines} distinct orders={len(orders)}")
sample = list(orders.values())[:3]
for o in sample:
    print(" ", o)
