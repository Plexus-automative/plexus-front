import requests
import json

env_vars = {}
try:
    with open('/Users/hemdaouitarek/Desktop/plexus-front/.env', 'r') as f:
        for line in f:
            if '=' in line and not line.startswith('#'):
                k, v = line.strip().split('=', 1)
                env_vars[k.strip()] = v.strip()
except Exception as e:
    print("Error reading .env:", e)

client_id = env_vars.get('BC_CLIENT_ID')
client_secret = env_vars.get('BC_CLIENT_SECRET')
tenant_id = env_vars.get('BC_TENANT_ID')
token_uri = env_vars.get('BC_TOKEN_URI') or f"https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/token"
baseUrl = env_vars.get('BC_BASE_URL')
company_id = env_vars.get('BC_COMPANY_ID')

payload = {
    'grant_type': 'client_credentials',
    'client_id': client_id,
    'client_secret': client_secret,
    'scope': 'https://api.businesscentral.dynamics.com/.default'
}

response = requests.post(token_uri, data=payload)
token = response.json().get('access_token')

if baseUrl and '/companies(' not in baseUrl and company_id:
    baseUrl += f"/companies({company_id})"

headers = {
    'Authorization': f'Bearer {token}',
    'Accept': 'application/json'
}

# Search for lines containing 'expedition' or 'expédition'
salesUrl = "https://api.businesscentral.dynamics.com/v2.0/235ce906-04c4-4ee5-a705-c904b1fa3167/Plexus/api/v2.0/companies(FDCEC2EC-FCB9-F011-AF5F-6045BDC898A3)/salesInvoices?$expand=salesInvoiceLines&$top=50"
res = requests.get(salesUrl, headers=headers)
if res.status_code == 200:
    val = res.json().get("value", [])
    print("Checking", len(val), "salesInvoices")
    for inv in val:
        lines = inv.get("salesInvoiceLines", [])
        for line in lines:
            desc = line.get("description", "")
            line_type = line.get("lineType") or line.get("type") or ""
            if "exped" in desc.lower() or "expéd" in desc.lower() or "ship" in desc.lower():
                print(f"  Invoice: {inv.get('number')}, Line Description: {desc}, Type: {line_type}, Line Keys: {list(line.keys())}")

poUrl = "https://api.businesscentral.dynamics.com/v2.0/235ce906-04c4-4ee5-a705-c904b1fa3167/Plexus/api/NEL/AcessPurchasesAPI/v2.0/companies(FDCEC2EC-FCB9-F011-AF5F-6045BDC898A3)/PlexuspurchaseOrders?$expand=PlexuspurchaseOrderLines&$top=50"
res = requests.get(poUrl, headers=headers)
if res.status_code == 200:
    val = res.json().get("value", [])
    print("\nChecking", len(val), "purchaseOrders")
    for po in val:
        lines = po.get("PlexuspurchaseOrderLines") or po.get("plexuspurchaseOrderLines") or []
        for line in lines:
            desc = line.get("description", "")
            line_type = line.get("lineType") or line.get("type") or ""
            if "exped" in desc.lower() or "expéd" in desc.lower() or "ship" in desc.lower():
                print(f"  PO: {po.get('number')}, Line Description: {desc}, Type: {line_type}, Line Keys: {list(line.keys())}")

# 2. Purchase Invoice lines
purchUrl = "https://api.businesscentral.dynamics.com/v2.0/235ce906-04c4-4ee5-a705-c904b1fa3167/Plexus/api/v2.0/companies(FDCEC2EC-FCB9-F011-AF5F-6045BDC898A3)/purchaseInvoices?$expand=purchaseInvoiceLines&$top=2"
print("\nQuerying purchaseInvoices with expand:")
res = requests.get(purchUrl, headers=headers)
print("Status:", res.status_code)
if res.status_code == 200:
    val = res.json().get("value", [])
    if val:
        for inv in val:
            lines = inv.get("purchaseInvoiceLines", [])
            print(f"  Invoice: {inv.get('number')} has {len(lines)} lines")
            for line in lines[:3]:
                print(f"    Line Description: {line.get('description')}, Quantity: {line.get('quantity')}, Line Amount: {line.get('lineAmountExcludingTax') or line.get('amountExcludingTax')}")

# 3. Plexus Purchase Orders lines
poUrl = "https://api.businesscentral.dynamics.com/v2.0/235ce906-04c4-4ee5-a705-c904b1fa3167/Plexus/api/NEL/AcessPurchasesAPI/v2.0/companies(FDCEC2EC-FCB9-F011-AF5F-6045BDC898A3)/PlexuspurchaseOrders?$expand=PlexuspurchaseOrderLines&$top=2"
print("\nQuerying PlexuspurchaseOrders with expand:")
res = requests.get(poUrl, headers=headers)
print("Status:", res.status_code)
if res.status_code == 200:
    val = res.json().get("value", [])
    if val:
        for po in val:
            lines = po.get("PlexuspurchaseOrderLines") or po.get("plexuspurchaseOrderLines") or []
            print(f"  Order: {po.get('number')} has {len(lines)} lines")
            for line in lines[:3]:
                print(f"    Line Description: {line.get('description')}, Quantity: {line.get('quantity')}, Line Amount: {line.get('amountExcludingTax')}")

# 2. Purchase Invoices today (Achat)
url2 = f"https://api.businesscentral.dynamics.com/v2.0/235ce906-04c4-4ee5-a705-c904b1fa3167/Plexus/api/v2.0/companies(FDCEC2EC-FCB9-F011-AF5F-6045BDC898A3)/purchaseInvoices?$filter=postingDate eq {today}"
res2 = requests.get(url2, headers=headers)
print("\nPurchase Invoices today status:", res2.status_code)
if res2.status_code == 200:
    val = res2.json().get("value", [])
    print("Found", len(val), "purchase invoices posted today")
    total = sum([inv.get("totalAmountExcludingTax", 0) for inv in val])
    print("Total Achat today:", total)

# 3. Today's orders
url3 = f"https://api.businesscentral.dynamics.com/v2.0/235ce906-04c4-4ee5-a705-c904b1fa3167/Plexus/api/NEL/AcessPurchasesAPI/v2.0/companies(FDCEC2EC-FCB9-F011-AF5F-6045BDC898A3)/PlexuspurchaseOrders?$filter=orderDate eq {today}"
res3 = requests.get(url3, headers=headers)
print("\nOrders today status:", res3.status_code)
if res3.status_code == 200:
    val = res3.json().get("value", [])
    print("Found", len(val), "orders today")
    total = sum([po.get("totalAmountExcludingTax", 0) for po in val])
    print("Total Orders today:", total)

# 4. Unpaid invoices
url4 = f"https://api.businesscentral.dynamics.com/v2.0/235ce906-04c4-4ee5-a705-c904b1fa3167/Plexus/api/v2.0/companies(FDCEC2EC-FCB9-F011-AF5F-6045BDC898A3)/salesInvoices?$filter=status eq 'Open'"
res4 = requests.get(url4, headers=headers)
print("\nUnpaid invoices status:", res4.status_code)
if res4.status_code == 200:
    val = res4.json().get("value", [])
    print("Found", len(val), "unpaid sales invoices (status Open)")
    total = sum([inv.get("totalAmountExcludingTax", 0) for inv in val])
    print("Total unpaid sales invoices:", total)
    if val:
        print("Example unpaid:", val[0].get("number"), "remainingAmount:", val[0].get("remainingAmount"), "customer:", val[0].get("customerName"))

# 2. Purchase Invoices (Achat)
purchUrl = f"https://api.businesscentral.dynamics.com/v2.0/235ce906-04c4-4ee5-a705-c904b1fa3167/Plexus/api/v2.0/companies(FDCEC2EC-FCB9-F011-AF5F-6045BDC898A3)/purchaseInvoices?$top=3"
print("\nQuerying purchaseInvoices:", purchUrl)
res = requests.get(purchUrl, headers=headers)
print("Status:", res.status_code)
if res.status_code == 200:
    val = res.json().get("value", [])
    print("Found", len(val), "purchaseInvoices")
    if val:
        print("Keys:", list(val[0].keys()))
        for inv in val[:2]:
            print(f"  No: {inv.get('number')}, Date: {inv.get('postingDate') or inv.get('invoiceDate')}, Vendor: {inv.get('vendorName')}, Total Excl Tax: {inv.get('totalAmountExcludingTax')}, Status: {inv.get('status')}")

# 3. Today's orders
ordersUrl = f"https://api.businesscentral.dynamics.com/v2.0/235ce906-04c4-4ee5-a705-c904b1fa3167/Plexus/api/NEL/AcessPurchasesAPI/v2.0/companies(FDCEC2EC-FCB9-F011-AF5F-6045BDC898A3)/PlexuspurchaseOrders?$filter=orderDate eq 2026-07-02&$top=5"
print("\nQuerying PlexuspurchaseOrders for today:", ordersUrl)
res = requests.get(ordersUrl, headers=headers)
print("Status:", res.status_code)
if res.status_code == 200:
    val = res.json().get("value", [])
    print("Found", len(val), "orders")
    for po in val:
        print(f"  No: {po.get('number')}, Date: {po.get('orderDate')}, Vendor: {po.get('vendorName')}, Total Amount Excl Tax: {po.get('totalAmountExcludingTax')}, Insurance: {po.get('InsuranceName')}")
