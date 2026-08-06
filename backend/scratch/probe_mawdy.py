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

sel = "number,orderDate,InsuranceName,ShippingAdvice,SellToCustomerNo,totalAmountExcludingTax"

def fetch(flt):
    url = f"{full}/PlexuspurchaseOrders?$filter=" + requests.utils.quote(flt) + "&$select=" + requests.utils.quote(sel)
    rows = []
    while url:
        b = requests.get(url, headers=H).json()
        rows += b.get('value', [])
        url = b.get('@odata.nextLink')
    return rows

print("=== All orders for client C0077 (SellToCustomerNo eq 'C0077') ===")
c0077 = fetch("SellToCustomerNo eq 'C0077'")
print(f"total C0077 orders: {len(c0077)}")
ins = defaultdict(lambda: [0, 0.0])
dmin = dmax = None
for o in c0077:
    k = (o.get('InsuranceName') or '(vide)').strip() or '(vide)'
    ins[k][0] += 1; ins[k][1] += float(o.get('totalAmountExcludingTax') or 0)
    d = (o.get('orderDate') or '')[:10]
    if d:
        dmin = d if dmin is None or d < dmin else dmin
        dmax = d if dmax is None or d > dmax else dmax
print("  InsuranceName distribution:")
for k, v in sorted(ins.items(), key=lambda x: -x[1][0]):
    print(f"    {k!r}: {v[0]} orders | {v[1]:.0f} HT")
print(f"  date range: {dmin} -> {dmax}")

print("\n=== All orders with InsuranceName eq 'MAWDY' ===")
mawdy = fetch("InsuranceName eq 'MAWDY'")
print(f"total MAWDY orders: {len(mawdy)}")
cust = defaultdict(lambda: [0, 0.0])
for o in mawdy:
    k = (o.get('SellToCustomerNo') or '(vide)').strip() or '(vide)'
    cust[k][0] += 1; cust[k][1] += float(o.get('totalAmountExcludingTax') or 0)
print("  SellToCustomerNo distribution:")
for k, v in sorted(cust.items(), key=lambda x: -x[1][0]):
    print(f"    {k!r}: {v[0]} orders | {v[1]:.0f} HT")
