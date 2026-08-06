import requests
import json
import time

# 1. Login to the backend
login_url = "http://localhost:8080/api/account/login"
login_payload = {
    "email": "plexus",
    "password": "PLEXUS@2020"
}
print("Logging in to backend...")
login_res = requests.post(login_url, json=login_payload)
if login_res.status_code != 200:
    print("Login response failed:", login_res.text)
    exit(1)

login_data = login_res.json()
jwt_token = login_data.get("serviceToken")
print("Logged in successfully.")

# Load .env file for BC direct API credentials
env_vars = {}
with open('/Users/hemdaouitarek/Desktop/plexus-front/.env', 'r') as f:
    for line in f:
        if '=' in line and not line.startswith('#'):
            k, v = line.strip().split('=', 1)
            env_vars[k.strip()] = v.strip()

client_id = env_vars.get('BC_CLIENT_ID')
client_secret = env_vars.get('BC_CLIENT_SECRET')
tenant_id = env_vars.get('BC_TENANT_ID')
token_uri = env_vars.get('BC_TOKEN_URI') or f"https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/token"
tarek_system_url = env_vars.get('BC_TAREK_SYSTEM_API_URL')
purchase_api_url = env_vars.get('BC_BASE_URL')
company_id = env_vars.get('BC_COMPANY_ID')

token_payload = {
    'grant_type': 'client_credentials',
    'client_id': client_id,
    'client_secret': client_secret,
    'scope': 'https://api.businesscentral.dynamics.com/.default'
}
token_res = requests.post(token_uri, data=token_payload)
bc_token = token_res.json().get('access_token')

if tarek_system_url and '/companies(' not in tarek_system_url and company_id:
    tarek_system_url += f"/companies({company_id})"

if purchase_api_url and '/companies(' not in purchase_api_url and company_id:
    purchase_api_url += f"/companies({company_id})"

# 2. Create a PEC request via the backend API
pec_url = "http://localhost:8080/api/purchase-orders/pec"
headers = {
    "Authorization": f"Bearer {jwt_token}",
    "Content-Type": "application/json",
    "X-Customer-No": "C0090"
}
pec_payload = {
    "vin": "TESTVIN9999999999",
    "registrationNumber": "9999TUN999",
    "insuredName": "TESTPEC999 / John Doe",
    "lines": [
        {
            "reference": "REF999",
            "designation": "DESC999",
            "quantity": 1.0
        }
    ]
}

print("\nCreating PEC request with insuredName 'TESTPEC999 / John Doe'...")
pec_res = requests.post(pec_url, headers=headers, json=pec_payload)
print("Create PEC Status:", pec_res.status_code)
if pec_res.status_code not in (200, 201):
    print("Create PEC error:", pec_res.text)
    exit(1)

pec_data = pec_res.json()
doc_no = pec_data.get("number")
print(f"Created PEC Request: {doc_no}")

# 3. Retrieve the created PEC line ID from BC
time.sleep(2) # Give BC a brief moment
lines_url = f"{tarek_system_url}/plexusPecLines?$filter=documentNo eq '{doc_no}'"
lines_headers = {
    'Authorization': f'Bearer {bc_token}',
    'Accept': 'application/json'
}
lines_res = requests.get(lines_url, headers=lines_headers)
if lines_res.status_code != 200:
    print("Error fetching PEC lines:", lines_res.text)
    exit(1)

lines_val = lines_res.json().get('value', [])
if not lines_val:
    print("No lines found in BC for", doc_no)
    exit(1)

line_id = lines_val[0].get('id')
print(f"Retrieved line ID: {line_id}")

# 4. Trigger create-order for this PEC
order_url = f"http://localhost:8080/api/purchase-orders/pec/{doc_no}/create-order"
order_payload = {
    "vendorNumber": "F0005",
    "lines": [
        {
            "id": line_id,
            "reference": "REF999",
            "designation": "DESC999",
            "quantity": 1.0,
            "price": 120.0,
            "status": "Disponible"
        }
    ]
}

print(f"\nTriggering order creation from PEC {doc_no}...")
order_res = requests.post(order_url, headers=headers, json=order_payload)
print("Create PO Status:", order_res.status_code)
print("Create PO Response:")
print(order_res.text)

if order_res.status_code not in (200, 201):
    exit(1)

po_data = order_res.json()
po_no = po_data.get("orderNumber")
print(f"\nCreated Purchase Order No: {po_no}")

# 5. Lookup the PO ID using its orderNumber
time.sleep(2)
po_url = f"{purchase_api_url}/PlexuspurchaseOrders?$filter=number eq '{po_no}'"
po_res = requests.get(po_url, headers=lines_headers)
if po_res.status_code != 200:
    print("Error querying PO ID:", po_res.text)
    exit(1)

po_list = po_res.json().get("value", [])
if not po_list:
    print("PO not found in BC yet")
    exit(1)

po_id = po_list[0].get("id")
print(f"Retrieved PO System ID: {po_id}")

# 6. Query the patched metadata in BC
time.sleep(2)
metadata_url = f"{tarek_system_url}/plexusPurchaseOrderPatches({po_id})"
meta_res = requests.get(metadata_url, headers=lines_headers)
print("\n=== VERIFYING BC PURCHASE ORDER METADATA ===")
print("Status:", meta_res.status_code)
if meta_res.status_code == 200:
    meta_data = meta_res.json()
    print("InsuredName in BC Purchase Header metadata:", meta_data.get("InsuredName"))
    if meta_data.get("InsuredName") == "John Doe":
        print("SUCCESS: Only the name 'John Doe' was set in the BC Purchase Header metadata field!")
    else:
        print("FAILURE: InsuredName is:", meta_data.get("InsuredName"))
else:
    print("Error querying metadata:", meta_res.text)
