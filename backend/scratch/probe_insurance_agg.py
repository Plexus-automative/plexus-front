import requests, json
from collections import defaultdict, OrderedDict

env_vars = {}
with open('/Users/hemdaouitarek/Desktop/plexus-front/.env', 'r') as f:
    for line in f:
        if '=' in line and not line.startswith('#'):
            k, v = line.strip().split('=', 1)
            env_vars[k.strip()] = v.strip()

tenant_id = env_vars.get('BC_TENANT_ID')
company_id = env_vars.get('BC_COMPANY_ID')
baseUrl = env_vars.get('BC_BASE_URL')
full_base = baseUrl if '/companies(' in baseUrl else f"{baseUrl}/companies({company_id})"

token = requests.post(f"https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/token", data={
    'grant_type': 'client_credentials',
    'client_id': env_vars.get('BC_CLIENT_ID'),
    'client_secret': env_vars.get('BC_CLIENT_SECRET'),
    'scope': 'https://api.businesscentral.dynamics.com/.default'
}).json().get('access_token')
headers = {'Authorization': f'Bearer {token}', 'Accept': 'application/json'}

# Mirror the Java endpoint: default range = current year to today
startDate = "2026-01-01"
endDate = "2026-07-05"
select = ("number,orderDate,InsuranceName,InsuranceCode,ShippingAdvice,"
          "totalAmountExcludingTax,totalAmountIncludingTax,RegistrationNumber,VIN,"
          "SinitreNumber,vendorName,SellToCustomerNo,CauseofCancellation")
flt = f"InsuranceName ne '' and orderDate ge {startDate} and orderDate le {endDate}"
url = (f"{full_base}/PlexuspurchaseOrders?$filter=" + requests.utils.quote(flt) +
       "&$select=" + requests.utils.quote(select) + "&$orderby=orderDate%20desc")

allrows = []
pages = 0
while url and pages < 50:
    r = requests.get(url, headers=headers)
    if r.status_code != 200:
        print("ERR", r.status_code, r.text[:400]); break
    b = r.json()
    allrows += b.get("value", [])
    url = b.get("@odata.nextLink")
    pages += 1

companyTotals = OrderedDict()
companyStatus = defaultdict(lambda: defaultdict(lambda: [0, 0.0]))
companyMonthly = defaultdict(lambda: defaultdict(float))
statusTotals = defaultdict(lambda: [0, 0.0])
gc = gh = gt = 0.0

for o in allrows:
    ins = (o.get("InsuranceName") or "").strip()
    if not ins: continue
    status = (o.get("ShippingAdvice") or "").strip() or "(vide)"
    ht = float(o.get("totalAmountExcludingTax") or 0)
    ttc = float(o.get("totalAmountIncludingTax") or 0)
    ym = (o.get("orderDate") or "")[:7]
    ct = companyTotals.setdefault(ins, [0, 0.0, 0.0])
    ct[0] += 1; ct[1] += ht; ct[2] += ttc
    companyStatus[ins][status][0] += 1; companyStatus[ins][status][1] += ht
    if ym: companyMonthly[ins][ym] += ht
    statusTotals[status][0] += 1; statusTotals[status][1] += ht
    gc += 1; gh += ht; gt += ttc

print(f"RANGE {startDate}..{endDate}  pages={pages}  orders={int(gc)}")
print(f"GRAND: count={int(gc)} HT={gh:.3f} TTC={gt:.3f} companies={len(companyTotals)}")
print("\nPER COMPANY:")
for name, v in sorted(companyTotals.items(), key=lambda x: -x[1][1]):
    print(f"  {name}: count={int(v[0])} HT={v[1]:.3f} TTC={v[2]:.3f}")
    for s, sv in sorted(companyStatus[name].items(), key=lambda x: -x[1][0]):
        print(f"       - {s}: {int(sv[0])} ({sv[1]:.0f} HT)")
print("\nGLOBAL STATUS:")
for s, v in sorted(statusTotals.items(), key=lambda x: -x[1][0]):
    print(f"  {s}: count={int(v[0])} HT={v[1]:.0f}")
print("\nMONTHLY (largest company):")
if companyTotals:
    top = max(companyTotals, key=lambda k: companyTotals[k][1])
    for m, h in sorted(companyMonthly[top].items()):
        print(f"  {top} {m}: {h:.0f} HT")
