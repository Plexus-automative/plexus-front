import requests

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

num = "CA26/1440"
flt = f"number eq '{num}'"
url = f"{full}/PlexuspurchaseOrders?$filter=" + requests.utils.quote(flt) + "&$expand=PlexuspurchaseOrderLines"
print("URL:", url)
r = requests.get(url, headers=H)
print("status:", r.status_code)
if r.status_code != 200:
    print(r.text[:600]); raise SystemExit
val = r.json().get("value", [])
print("orders found:", len(val))
if val:
    o = val[0]
    lines = o.get("plexuspurchaseOrderLines") or o.get("PlexuspurchaseOrderLines") or []
    print("lines:", len(lines))
    gross = net = 0
    for l in lines:
        g = l.get("amountExcludingTax") or 0
        n = l.get("netAmount") or 0
        rem = l.get("invoiceDiscountAllocation") or 0
        gross += g; net += n
        print(f"  {l.get('lineObjectNumber')} | {l.get('description')} | qte={l.get('quantity')} | gross={g} | remise={rem} | net={n}")
    print(f"TOTAL gross(sans remise)={gross:.3f}  net(avec remise)={net:.3f}")
    print("header totalAmountExcludingTax:", o.get("totalAmountExcludingTax"))
