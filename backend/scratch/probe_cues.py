import requests

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

def show(label, url):
    print(f"\n===== {label} =====\n{url}")
    r = requests.get(url, headers=H)
    print("status", r.status_code)
    if r.status_code != 200:
        print(r.text[:500]); return
    v = r.json().get('value', [])
    if not v:
        print("(no rows)"); return
    c = v[0]
    keys = ["enAttente","confirmationClient","commandeFerme","receptionnees","annulees",
            "amountFerme","achatsAnnuel","caAnnuel","caAujourdhui","facturesNonPayees",
            "amtFacturesNonPayees","commandesAujourdhui","amtCommandesAujourdhui",
            "devisOuverts","commandesVenteOuvertes",
            "sales2024","sales2025","sales2026","purch2024","purch2025","purch2026"]
    for k in keys:
        print(f"  {k:22s} = {c.get(k)}")

# dateFilter is Edm.String → pass the BC range as a string literal 'start..end'
flt = requests.utils.quote("dateFilter eq '2026-01-01..2026-07-09'")
show("plexusDashboardCues  (dateFilter eq range string)", f"{full}/plexusDashboardCues?$filter={flt}")
# also: no filter at all (default = current year for money, all-time pipeline)
show("plexusDashboardCues  (no filter)", f"{full}/plexusDashboardCues")
