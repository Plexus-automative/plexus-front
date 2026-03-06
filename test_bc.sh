#!/bin/bash
ORDER_ID="40b91f14-9810-f111-8405-7ced8d83e369"
COMPANY="683ADB98-EA07-F111-8405-7CED8D83AA60"

# Get token
TOKEN=$(curl -s -X POST 'https://login.microsoftonline.com/235ce906-04c4-4ee5-a705-c904b1fa3167/oauth2/v2.0/token' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'client_id=14c1d636-f3cc-4581-8b9f-07469a4c514b' \
  -d 'client_secret=zWd8Q~iZ2rFqS-~uPzFvR.bE.X~A.oI2V-kM-b_4' \
  -d 'scope=https://api.businesscentral.dynamics.com/.default' \
  -d 'grant_type=client_credentials' | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

URL="https://api.businesscentral.dynamics.com/v2.0/235ce906-04c4-4ee5-a705-c904b1fa3167/Plexus/api/NEL/AcessPurchasesAPI/v2.0/companies($COMPANY)/PlexuspurchaseOrders($ORDER_ID)/Microsoft.NAV.receiveAndInvoice"

echo "Attempting to post with empty payload {}..."
curl -s -X POST "$URL" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{}' | grep -A 5 -B 5 "error" || echo "No error printed. Check status."
echo ""
echo "Done."
