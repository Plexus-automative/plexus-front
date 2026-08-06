import requests
from collections import defaultdict

env_vars = {}
with open('/Users/hemdaouitarek/Desktop/plexus-front/.env', 'r') as f:
    for line in f:
        if '=' in line and not line.startswith('#'):
            k, v = line.strip().split('=', 1)
            env_vars[k.strip()] = v.strip()

client_id = env_vars.get('BC_CLIENT_ID')
client_secret = env_vars.get('BC_CLIENT_SECRET')
tenant_id = env_vars.get('BC_TENANT_ID')
company_id = env_vars.get('BC_COMPANY_ID')
baseUrl = env_vars.get('BC_BASE_URL')
full_base = baseUrl if '/companies(' in baseUrl else f"{baseUrl}/companies({company_id})"

token_uri = f"https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/token"
token = requests.post(token_uri, data={
    'grant_type': 'client_credentials',
    'client_id': client_id,
    'client_secret': client_secret,
    'scope': 'https://api.businesscentral.dynamics.com/.default'
}).json().get('access_token')
headers = {'Authorization': f'Bearer {token}', 'Accept': 'application/json'}

print("BASE:", full_base)

# --- 1. Distinct InsuranceName values across a large sample, with counts + amount sums ---
# Page through orders that HAVE an insurance name.
ins_count = defaultdict(int)
ins_amount = defaultdict(float)
ship_by_ins = defaultdict(lambda: defaultdict(int))
ship_all = defaultdict(int)
date_min, date_max = None, None
total_with_ins = 0
sample_ins_order = None

url = (f"{full_base}/PlexuspurchaseOrders"
       "?$filter=" + requests.utils.quote("InsuranceName ne ''") +
       "&$select=number,orderDate,InsuranceName,InsuranceCode,ShippingAdvice,totalAmountExcludingTax,totalAmountIncludingTax,RegistrationNumber,VIN,SinitreNumber"
       "&$top=5000")

pages = 0
while url and pages < 30:
    r = requests.get(url, headers=headers)
    if r.status_code != 200:
        print("Error:", r.status_code, r.text[:500])
        break
    body = r.json()
    for o in body.get("value", []):
        ins = (o.get("InsuranceName") or "").strip()
        if not ins:
            continue
        total_with_ins += 1
        ins_count[ins] += 1
        ins_amount[ins] += float(o.get("totalAmountExcludingTax") or 0)
        ship = (o.get("ShippingAdvice") or "(vide)").strip() or "(vide)"
        ship_by_ins[ins][ship] += 1
        ship_all[ship] += 1
        d = (o.get("orderDate") or "")[:10]
        if d:
            if date_min is None or d < date_min: date_min = d
            if date_max is None or d > date_max: date_max = d
        if sample_ins_order is None:
            sample_ins_order = o
    url = body.get("@odata.nextLink")
    pages += 1

print("\n=== ORDERS WITH InsuranceName ne '' ===")
print("Total orders scanned with insurance:", total_with_ins, "| pages:", pages)
print("orderDate range:", date_min, "->", date_max)

print("\n=== Distinct InsuranceName (count | sum totalAmountExcludingTax) ===")
for ins in sorted(ins_count, key=lambda x: -ins_count[x]):
    print(f"  {ins!r}: {ins_count[ins]} orders | {ins_amount[ins]:.3f} DT HT")

print("\n=== Distinct ShippingAdvice among insurance orders ===")
for s in sorted(ship_all, key=lambda x: -ship_all[x]):
    print(f"  {s!r}: {ship_all[s]}")

print("\n=== ShippingAdvice breakdown per InsuranceName ===")
for ins in sorted(ins_count, key=lambda x: -ins_count[x]):
    parts = ", ".join(f"{s}={c}" for s, c in sorted(ship_by_ins[ins].items(), key=lambda x: -x[1]))
    print(f"  {ins}: {parts}")

print("\n=== Sample insurance order (selected fields) ===")
if sample_ins_order:
    for k, v in sample_ins_order.items():
        print(f"  {k}: {v}")
