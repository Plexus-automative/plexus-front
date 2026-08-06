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

startDate, endDate, today = "2026-01-01", "2026-07-08", "2026-07-08"
sel = "number,orderDate,ShippingAdvice,totalAmountExcludingTax,totalAmountIncludingTax"
flt = f"orderDate ge {startDate} and orderDate le {endDate}"
url = (f"{full}/PlexuspurchaseOrders?$filter=" + requests.utils.quote(flt) +
       "&$select=" + requests.utils.quote(sel))

rows, pages = [], 0
while url and pages < 80:
    r = requests.get(url, headers=H)
    if r.status_code != 200:
        print("ERR", r.status_code, r.text[:300]); break
    b = r.json(); rows += b.get("value", []); url = b.get("@odata.nextLink"); pages += 1

byStatus = defaultdict(lambda: [0, 0.0, 0.0])
todayCount, todayHT = 0, 0.0
for o in rows:
    s = (o.get("ShippingAdvice") or "(vide)").strip()
    ht = float(o.get("totalAmountExcludingTax") or 0)
    ttc = float(o.get("totalAmountIncludingTax") or 0)
    byStatus[s][0] += 1; byStatus[s][1] += ht; byStatus[s][2] += ttc
    if (o.get("orderDate") or "") == today:
        todayCount += 1; todayHT += ttc

print(f"pages={pages} orders={len(rows)} range={startDate}..{endDate}")
print("\nDISTINCT ShippingAdvice values (count | HT | TTC):")
for s, v in sorted(byStatus.items(), key=lambda x: -x[1][0]):
    print(f"  {s:24s} count={int(v[0]):5d}  HT={v[1]:14.2f}  TTC={v[2]:14.2f}")
print(f"\nTODAY ({today}): count={todayCount} TTC={todayHT:.2f}")
print(f"TOTAL HT all statuses: {sum(v[1] for v in byStatus.values()):.2f}")
