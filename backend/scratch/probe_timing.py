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
flt = "InsuranceName ne '' and orderDate ge 2021-01-01 and orderDate le 2026-07-05"

def run(label, url):
    print(f"\n### {label}")
    total = 0; pages = 0; t0 = time.time()
    while url and pages < 60:
        pages += 1
        r = requests.get(url, headers=H, timeout=180)
        if r.status_code != 200:
            print("  ERR", r.status_code, r.text[:300]); return
        b = r.json()
        n = len(b.get('value', []))
        total += n
        print(f"  page {pages}: {n} rows, {time.time()-t0:.1f}s cumul, bytes={len(r.content)}")
        url = b.get('@odata.nextLink')
    print(f"  TOTAL {total} rows in {pages} pages, {time.time()-t0:.1f}s")

# A: exactly what the Java endpoint builds (orderby, no top)
run("WITH $orderby=orderDate desc, no $top",
    f"{full}/PlexuspurchaseOrders?$filter=" + requests.utils.quote(flt) +
    "&$select=" + requests.utils.quote(sel) + "&$orderby=orderDate%20desc")

# B: no orderby, with top
run("NO $orderby, $top=5000",
    f"{full}/PlexuspurchaseOrders?$filter=" + requests.utils.quote(flt) +
    "&$select=" + requests.utils.quote(sel) + "&$top=5000")
