import requests
from collections import defaultdict

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

def page(url):
    rows, pages = [], 0
    while url and pages < 200:
        r = requests.get(url, headers=H)
        if r.status_code != 200:
            print("  ERR", r.status_code, r.text[:300]); return rows, pages
        b = r.json(); rows += b.get("value", []); url = b.get("@odata.nextLink"); pages += 1
    return rows, pages

start, end = "2026-01-01", "2026-07-09"

# --- Agg (GROUP BY) ---
flt = requests.utils.quote(f"orderDate ge {start} and orderDate le {end}")
rows, pages = page(f"{full}/plexusInsuranceAggs?$filter={flt}")
print(f"plexusInsuranceAggs: {len(rows)} grouped rows, pages={pages}")
if rows:
    print("  sample:", {k: rows[0].get(k) for k in ('insuranceName','shippingAdvice','orderDate','orderCount','totalHT')})
    byIns = defaultdict(lambda: [0, 0.0])
    for r in rows:
        byIns[r.get('insuranceName')][0] += r.get('orderCount') or 0
        byIns[r.get('insuranceName')][1] += r.get('totalHT') or 0
    for n, v in byIns.items():
        print(f"    {n}: count={int(v[0])} HT={v[1]:.0f}")

# --- Orders (flat) — find which filter form the query accepts ---
def test(label, flt):
    r = requests.get(f"{full}/plexusInsuranceOrders?$filter={requests.utils.quote(flt)}&$top=2000", headers=H)
    n = len(r.json().get("value", [])) if r.status_code == 200 else -1
    print(f"  [{r.status_code}] {label}: rows={n}")
    return r

test("single insuranceName eq", f"insuranceName eq 'STAR' and orderDate ge {start} and orderDate le {end}")
test("same-field OR", f"(insuranceName eq 'STAR' or insuranceName eq 'STAR ASSURANCE') and orderDate ge {start} and orderDate le {end}")
r = test("customerName eq MAWDY", f"customerName eq 'MAWDY services' and orderDate ge {start} and orderDate le {end}")
if r.status_code == 200 and r.json().get("value"):
    print("  MAWDY sample keys:", list(r.json()["value"][0].keys()))
