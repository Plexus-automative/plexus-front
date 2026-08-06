import os
import requests
import xml.etree.ElementTree as ET

# Load .env file
env_vars = {}
try:
    with open('/Users/hemdaouitarek/Desktop/plexus-front/.env', 'r') as f:
        for line in f:
            if '=' in line and not line.startswith('#'):
                k, v = line.strip().split('=', 1)
                env_vars[k.strip()] = v.strip()
except Exception as e:
    print("Error reading .env:", e)

# Extract BC credentials
client_id = env_vars.get('BC_CLIENT_ID')
client_secret = env_vars.get('BC_CLIENT_SECRET')
tenant_id = env_vars.get('BC_TENANT_ID')
token_uri = env_vars.get('BC_TOKEN_URI') or f"https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/token"

payload = {
    'grant_type': 'client_credentials',
    'client_id': client_id,
    'client_secret': client_secret,
    'scope': 'https://api.businesscentral.dynamics.com/.default'
}

response = requests.post(token_uri, data=payload)
token = response.json().get('access_token')

# Standard BC ODataV4 metadata
url = f"https://api.businesscentral.dynamics.com/v2.0/{tenant_id}/Plexus/ODataV4/$metadata"
headers = {
    'Authorization': f'Bearer {token}',
    'Accept': 'application/xml'
}

res = requests.get(url, headers=headers)
print("Status:", res.status_code)
if res.status_code == 200:
    root = ET.fromstring(res.text)
    namespaces = {'edm': 'http://docs.oasis-open.org/odata/ns/edm'}
    for entity_set in root.findall('.//edm:EntitySet', namespaces):
        print(f"ODataV4 EntitySet: {entity_set.attrib.get('Name')} -> EntityType: {entity_set.attrib.get('EntityType')}")
else:
    print("Error:", res.text)
