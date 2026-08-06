import requests
import json

# 1. Login to the backend to get JWT token
login_url = "http://localhost:8080/api/account/login"
login_payload = {
    "email": "plexus",
    "password": "PLEXUS@2020"
}
print("Logging in to backend...")
login_res = requests.post(login_url, json=login_payload)
print("Login Status:", login_res.status_code)
if login_res.status_code != 200:
    print("Login failed:", login_res.text)
    exit(1)

jwt_token = login_res.json().get("serviceToken")
print("Login successful!")

# 2. Call /create-devis endpoint on backend
devis_url = "http://localhost:8080/api/purchase-orders/pec/PEOC2001/create-devis"
devis_headers = {
    "Authorization": f"Bearer {jwt_token}",
    "Content-Type": "application/json"
}

devis_payload = {
    "vendorNumber": "F0005",
    "lines": [
        {
            "id": "6f52df2b-f86a-f111-ab09-6045bd6c08dc",
            "reference": "PLX2302BS200911N",
            "designation": "PARE CHOC AR INF XUV300 W8",
            "quantity": 1,
            "price": 2902.0,
            "status": "Trouvé"
        },
        {
            "id": "7052df2b-f86a-f111-ab09-6045bd6c08dc",
            "reference": "PLX0102CS200020A",
            "designation": "ARC AV GH XUV300",
            "quantity": 0,
            "price": 0.0,
            "status": "Non Disponible"
        }
    ]
}

print("\nSending create-devis payload to backend...")
devis_res = requests.post(devis_url, headers=devis_headers, json=devis_payload)
print("Create-devis Response Status:", devis_res.status_code)
print("Create-devis Response Body:", devis_res.text)

if devis_res.status_code != 200:
    print("Failed to create devis.")
    exit(1)

# 3. Query BC directly to inspect actual status of the lines for PEOC2001
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
tarek_system_url = env_vars.get('BC_TAREK_SYSTEM_API_URL')
company_id = env_vars.get('BC_COMPANY_ID')

token_payload = {
    'grant_type': 'client_credentials',
    'client_id': client_id,
    'client_secret': client_secret,
    'scope': 'https://api.businesscentral.dynamics.com/.default'
}

response = requests.post(token_uri, data=token_payload)
token = response.json().get('access_token')

if tarek_system_url and '/companies(' not in tarek_system_url and company_id:
    tarek_system_url += f"/companies({company_id})"

headers = {
    'Authorization': f'Bearer {token}',
    'Accept': 'application/json'
}

# Fetch lines for PEOC2001
url = f"{tarek_system_url}/plexusPecLines?$filter=documentNo eq 'PEOC2001'"
res = requests.get(url, headers=headers)
print("\nDirect BC lines query for PEOC2001:")
print("Status Code:", res.status_code)
if res.status_code == 200:
    lines = res.json().get("value", [])
    for l in lines:
        print(f"LineNo: {l.get('lineNo')} | Ref: {l.get('reference')} | Status: {l.get('status')} | Price: {l.get('unitCost')}")
else:
    print("Error querying BC:", res.text)
