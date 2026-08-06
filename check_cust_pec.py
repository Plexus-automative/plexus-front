import requests
import json

import os


def _load_env():
    """BC_* config from the repo .env, falling back to the process environment.

    Never hardcode credentials in this directory: it is committed, and a literal
    client_secret here is what GitHub push protection blocked on 2026-08-06.
    """
    values = dict(os.environ)
    directory = os.path.dirname(os.path.abspath(__file__))
    while True:
        candidate = os.path.join(directory, '.env')
        if os.path.exists(candidate):
            with open(candidate) as handle:
                for line in handle:
                    if '=' in line and not line.startswith('#'):
                        key, value = line.strip().split('=', 1)
                        values.setdefault(key.strip(), value.strip())
            break
        parent = os.path.dirname(directory)
        if parent == directory:
            break
        directory = parent
    return values


_env = _load_env()
client_id = _env.get('BC_CLIENT_ID')
client_secret = _env.get('BC_CLIENT_SECRET')


token_response = requests.post(
    "https://login.microsoftonline.com/235ce906-04c4-4ee5-a705-c904b1fa3167/oauth2/v2.0/token",
    data={
        "grant_type": "client_credentials",
        "client_id": client_id,
        "client_secret": client_secret,
        "scope": "https://api.businesscentral.dynamics.com/.default"
    }
)
access_token = token_response.json()["access_token"]

url = "https://api.businesscentral.dynamics.com/v2.0/235ce906-04c4-4ee5-a705-c904b1fa3167/Plexus/api/plexustarek/AcessSystemAPI/v1.0/companies(B2F78390-8D47-F111-A820-6045BD6C578C)/plexusCustomers"
headers = {
    "Authorization": f"Bearer {access_token}"
}
res = requests.get(url, headers=headers)
print(json.dumps(res.json(), indent=2))
