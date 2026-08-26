import requests
import json

# The new webhook URL for the Python Backend (instead of n8n)
WEBHOOK_URL = "http://localhost:8000/webhook/ledgerzero-ingest"

payload = {
    "invoice_id": "00000000-0000-0000-0000-000000000000",
    "file_url": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
}

headers = {
    "Content-Type": "application/json"
}

print(f"Sending Webhook to {WEBHOOK_URL}...")
response = requests.post(WEBHOOK_URL, json=payload, headers=headers)

if response.status_code == 200:
    print("✅ Webhook accepted successfully!")
    print(json.dumps(response.json(), indent=2))
else:
    print(f"❌ Webhook failed with status code: {response.status_code}")
    print(response.text)
