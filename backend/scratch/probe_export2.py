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

flt = ("(InsuranceName eq 'STAR' or InsuranceName eq 'STAR ASSURANCE' or InsuranceName eq 'MAE ASSURANCE' "
       "or InsuranceName eq 'SATR' or SellToCustomerNo eq 'C0077') and orderDate ge 2026-06-01 and orderDate le 2026-07-06")

def test(label, params):
    url = f"{full}/PlexuspurchaseOrders?" + params
    r = requests.get(url, headers=H)
    print(f"\n[{label}] status={r.status_code}")
    if r.status_code != 200:
        print("  ", r.text[:300])
    else:
        b = r.json(); v = b.get('value', [])
        print(f"   rows={len(v)}  hasNextLink={'@odata.nextLink' in b}")
        if v:
            o = v[0]
            lk = 'plexuspurchaseOrderLines' if 'plexuspurchaseOrderLines' in o else ('PlexuspurchaseOrderLines' if 'PlexuspurchaseOrderLines' in o else None)
            print(f"   first order {o.get('number')} lines={len(o.get(lk, [])) if lk else 'NO-EXPAND'}")

test("A filter+expand", "$filter=" + requests.utils.quote(flt) + "&$expand=PlexuspurchaseOrderLines")
test("B filter no-expand", "$filter=" + requests.utils.quote(flt))
test("C filter+expand+top5", "$filter=" + requests.utils.quote(flt) + "&$expand=PlexuspurchaseOrderLines&$top=5")
test("D filter+expand+top1000", "$filter=" + requests.utils.quote(flt) + "&$expand=PlexuspurchaseOrderLines&$top=1000")
