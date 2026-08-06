import requests
from collections import defaultdict

env = {}
with open('/Users/hemdaouitarek/Desktop/plexus-front/.env') as f:
    for line in f:
        if '=' in line and not line.startswith('#'):
            k, v = line.strip().split('=', 1); env[k.strip()] = v.strip()

base = env['BC_BASE_URL']
full = base if '/companies(' in base else f"{base}/companies({env['BC_COMPANY_ID']})"
salesApi = full.replace('AcessPurchasesAPI', 'AcessSalesAPI')
tok = requests.post(f"https://login.microsoftonline.com/{env['BC_TENANT_ID']}/oauth2/v2.0/token", data={
    'grant_type': 'client_credentials', 'client_id': env['BC_CLIENT_ID'],
    'client_secret': env['BC_CLIENT_SECRET'], 'scope': 'https://api.businesscentral.dynamics.com/.default'
}).json()['access_token']
H = {'Authorization': f'Bearer {tok}'}

start, end = "2026-01-01", "2026-07-09"

def page(url):
    rows, pages = [], 0
    while url and pages < 80:
        r = requests.get(url, headers=H)
        if r.status_code != 200:
            print("ERR", r.status_code, r.text[:300]); break
        b = r.json(); rows += b.get("value", []); url = b.get("@odata.nextLink"); pages += 1
    return rows

# ---- PURCHASES: find the outlier ----
sel = "number,orderDate,ShippingAdvice,totalAmountExcludingTax,QtyReceived,Delivred"
flt = f"orderDate ge {start} and orderDate le {end}"
po = page(f"{full}/PlexuspurchaseOrders?$select={requests.utils.quote(sel)}&$filter={requests.utils.quote(flt)}")
print(f"PURCHASES current-year: {len(po)} orders")

byStatus = defaultdict(lambda: [0, 0.0])
for o in po:
    s = (o.get("ShippingAdvice") or "").strip()
    ht = float(o.get("totalAmountExcludingTax") or 0)
    byStatus[s][0] += 1; byStatus[s][1] += ht

print("\n-- candidate 'achats' totals --")
allHT = sum(v[1] for v in byStatus.values())
noCancel = sum(v[1] for s, v in byStatus.items() if s != 'Annulation')
confirme = byStatus.get('Confirmé', [0, 0])[1]
received = sum(float(o.get('totalAmountExcludingTax') or 0) for o in po
               if o.get('QtyReceived') == 'Oui')
print(f"  ALL statuses:        {allHT:15.2f}")
print(f"  excl. Annulation:    {noCancel:15.2f}")
print(f"  Confirmé only:       {confirme:15.2f}")
print(f"  QtyReceived=Oui:     {received:15.2f}")

print("\n-- TOP 12 orders by amount (the outliers) --")
for o in sorted(po, key=lambda x: -float(x.get('totalAmountExcludingTax') or 0))[:12]:
    print(f"  {o.get('number')} {o.get('orderDate')} {(o.get('ShippingAdvice') or ''):22s} "
          f"HT={float(o.get('totalAmountExcludingTax') or 0):14.2f} recu={o.get('QtyReceived')}")

# ---- SALES: source for caAnnuel ----
print("\n===== SALES (PlexussalesOrders) =====")
r = requests.get(f"{salesApi}/PlexussalesOrders?$top=1", headers=H)
print("status", r.status_code)
if r.status_code == 200 and r.json().get('value'):
    keys = list(r.json()['value'][0].keys())
    money = [k for k in keys if any(t in k.lower() for t in ['amount', 'total', 'ht', 'ttc'])]
    date = [k for k in keys if any(t in k.lower() for t in ['date'])]
    stat = [k for k in keys if any(t in k.lower() for t in ['status', 'advice', 'ship'])]
    cust = [k for k in keys if any(t in k.lower() for t in ['customer', 'sell', 'client'])]
    print("  money fields:", money)
    print("  date fields :", date)
    print("  status/ship :", stat)
    print("  customer    :", cust)
else:
    print(r.text[:300])
