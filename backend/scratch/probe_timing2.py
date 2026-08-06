import requests, time

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

sel = ("number,orderDate,InsuranceName,InsuranceCode,ShippingAdvice,"
       "totalAmountExcludingTax,totalAmountIncludingTax,RegistrationNumber,VIN,"
       "SinitreNumber,vendorName,SellToCustomerNo,CauseofCancellation")

def timeit(label, flt, extra=""):
    url = f"{full}/PlexuspurchaseOrders?$filter=" + requests.utils.quote(flt) + "&$select=" + requests.utils.quote(sel) + extra
    t0 = time.time(); total = 0; pages = 0
    while url and pages < 60:
        pages += 1
        r = requests.get(url, headers=H, timeout=200)
        if r.status_code != 200:
            print(f"{label}: ERR {r.status_code} {r.text[:200]}"); return
        b = r.json(); total += len(b.get('value', [])); url = b.get('@odata.nextLink')
    print(f"{label}: {total} rows, {pages} pages, {time.time()-t0:.1f}s")

# Default current-year range (what the UI normally sends)
timeit("A default 2026 range, no orderby, top", "InsuranceName ne '' and orderDate ge 2026-01-01 and orderDate le 2026-07-05", "&$top=5000")
# InsuranceCode instead of Name
timeit("B InsuranceCode ne '', 2021+, top", "InsuranceCode ne '' and orderDate ge 2021-01-01", "&$top=5000")
# OR of known names (eq may hit index)
names = ["STAR", "STAR ASSURANCE", "MAE ASSURANCE", "MAWDY", "SATR"]
orflt = "(" + " or ".join(f"InsuranceName eq '{n}'" for n in names) + ")"
timeit("C OR-of-eq known names, 2021+, top", orflt, "&$top=5000")
# ge ' ' trick
timeit("D InsuranceName gt '', 2021+, top", "InsuranceName gt '' and orderDate ge 2021-01-01", "&$top=5000")
