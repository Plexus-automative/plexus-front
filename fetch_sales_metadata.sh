#!/bin/bash
TOKEN=$(curl -s -X POST 'https://login.microsoftonline.com/235ce906-04c4-4ee5-a705-c904b1fa3167/oauth2/v2.0/token' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'client_id=14c1d636-f3cc-4581-8b9f-07469a4c514b' \
  -d 'client_secret=zWd8Q~iZ2rFqS-~uPzFvR.bE.X~A.oI2V-kM-b_4' \
  -d 'scope=https://api.businesscentral.dynamics.com/.default' \
  -d 'grant_type=client_credentials' | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

curl -s -H "Authorization: Bearer $TOKEN" "https://api.businesscentral.dynamics.com/v2.0/235ce906-04c4-4ee5-a705-c904b1fa3167/Plexus/api/NEL/AcessSalesAPI/v2.0/\$metadata" > metadata_sales.xml
cat metadata_sales.xml | grep "Action Name"
