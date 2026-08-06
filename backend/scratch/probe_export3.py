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

date = " and orderDate ge 2026-06-01 and orderDate le 2026-07-06"
insurer = ("(InsuranceName eq 'STAR' or InsuranceName eq 'STAR ASSURANCE' or InsuranceName eq 'MAE ASSURANCE' "
           "or InsuranceName eq 'SATR')" + date)
mawdy = "SellToCustomerNo eq 'C0077'" + date

def run(label, flt):
    url = f"{full}/PlexuspurchaseOrders?$filter=" + requests.utils.quote(flt) + "&$expand=PlexuspurchaseOrderLines"
    total = 0; pages = 0; next_url = url
    while next_url and pages < 30:
        r = requests.get(next_url, headers=H, timeout=120)
        if r.status_code != 200:
            print(f"[{label}] page {pages+1} status={r.status_code} {r.text[:200]}"); return
        b = r.json(); total += len(b.get('value', [])); next_url = b.get('@odata.nextLink'); pages += 1
    print(f"[{label}] OK rows={total} pages={pages}")

run("insurer+expand", insurer)
run("mawdy(C0077)+expand", mawdy)
