import requests

env_vars = {}
with open('/Users/hemdaouitarek/Desktop/plexus-front/.env', 'r') as f:
    for line in f:
        if '=' in line and not line.startswith('#'):
            k, v = line.strip().split('=', 1)
            env_vars[k.strip()] = v.strip()

client_id = env_vars.get('BC_CLIENT_ID')
client_secret = env_vars.get('BC_CLIENT_SECRET')
tenant_id = env_vars.get('BC_TENANT_ID')
company_id = env_vars.get('BC_COMPANY_ID')
baseUrl = env_vars.get('BC_BASE_URL')
full_base = f"{baseUrl}/companies({company_id})"

token_uri = f"https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/token"
token_resp = requests.post(token_uri, data={
    'grant_type': 'client_credentials',
    'client_id': client_id,
    'client_secret': client_secret,
    'scope': 'https://api.businesscentral.dynamics.com/.default'
})
token = token_resp.json().get('access_token')
headers = {'Authorization': f'Bearer {token}'}

url = f"{full_base}/PlexuspurchaseOrders?$top=1"
r = requests.get(url, headers=headers)
if r.status_code == 200:
    val = r.json().get("value", [])
    if val:
        for k, v in val[0].items():
            print(f"{k}: {v}")
else:
    print("Error:", r.text)
