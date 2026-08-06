import requests

env = {}
with open('/Users/hemdaouitarek/Desktop/plexus-front/.env') as f:
    for line in f:
        if '=' in line and not line.startswith('#'):
            k, v = line.strip().split('=', 1); env[k.strip()] = v.strip()

base = env['BC_BASE_URL']
full = base if '/companies(' in base else f"{base}/companies({env['BC_COMPANY_ID']})"
std = full.replace('/api/NEL/AcessPurchasesAPI/v2.0', '/api/v2.0')
sales = full.replace('AcessPurchasesAPI', 'AcessSalesAPI')
tok = requests.post(f"https://login.microsoftonline.com/{env['BC_TENANT_ID']}/oauth2/v2.0/token", data={
    'grant_type': 'client_credentials', 'client_id': env['BC_CLIENT_ID'],
    'client_secret': env['BC_CLIENT_SECRET'], 'scope': 'https://api.businesscentral.dynamics.com/.default'
}).json()['access_token']
H = {'Authorization': f'Bearer {tok}'}
q = requests.utils.quote

# Grab 5 recent insurance POs
flt = "(InsuranceName eq 'STAR' or InsuranceName eq 'MAE ASSURANCE') and orderDate ge 2024-06-01 and orderDate le 2024-12-31 and ShippingAdvice eq 'Confirmé'"
r = requests.get(f"{full}/PlexuspurchaseOrders?$filter=" + q(flt) + "&$select=number,orderDate,InsuranceName,totalAmountExcludingTax&$top=5", headers=H)
pos = r.json().get('value', [])
print("Sample insurance POs:")
for po in pos:
    n = po['number']
    # Achat: purchase invoices with orderNumber = PO
    pi = requests.get(f"{std}/purchaseInvoices?$filter=" + q(f"orderNumber eq '{n}'") + "&$select=number,totalAmountExcludingTax", headers=H).json().get('value', [])
    achat = sum(x.get('totalAmountExcludingTax', 0) for x in pi)
    # Vente: sales orders with PurchaseHeaderNoNew = PO -> their sales invoices
    so = requests.get(f"{sales}/PlexussalesOrders?$filter=" + q(f"PurchaseHeaderNoNew eq '{n}'") + "&$select=number", headers=H).json().get('value', [])
    vente = 0.0
    so_nums = [s['number'] for s in so]
    for sn in so_nums:
        si = requests.get(f"{std}/salesInvoices?$filter=" + q(f"orderNumber eq '{sn}'") + "&$select=totalAmountExcludingTax", headers=H).json().get('value', [])
        vente += sum(x.get('totalAmountExcludingTax', 0) for x in si)
    print(f"  {n} [{po['InsuranceName']}] cmd HT={po.get('totalAmountExcludingTax',0):.0f} | "
          f"ACHAT(fact)={achat:.0f} ({len(pi)} inv) | VENTE(fact)={vente:.0f} (SO {so_nums})")
