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

# 2. Call POST /pec endpoint to create a PEC request with insuredName = "PEOC2001"
pec_url = "http://localhost:8080/api/purchase-orders/pec"
headers = {
    "Authorization": f"Bearer {jwt_token}",
    "Content-Type": "application/json",
    "X-Customer-No": "C0018"
}

pec_payload = {
    "vin": "PEUGEOT1234567890",
    "registrationNumber": "999 TUN 9999",
    "insuredName": "PEOC2001",
    "lines": [
        {
            "reference": "PLXREF001",
            "designation": "TEST ITEM 1",
            "quantity": 1
        }
    ]
}

print("\nSubmitting first PEC request with insuredName 'PEOC2001'...")
res1 = requests.post(pec_url, headers=headers, json=pec_payload)
print("Response Status:", res1.status_code)
print("Response Body:", res1.text)

print("\nSubmitting second PEC request with SAME insuredName 'PEOC2001'...")
res2 = requests.post(pec_url, headers=headers, json=pec_payload)
print("Response Status:", res2.status_code)
print("Response Body:", res2.text)
