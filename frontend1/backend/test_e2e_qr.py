#!/usr/bin/env python
import os
import django
import json
import urllib.request
import urllib.error
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_project.settings')
django.setup()

BASE_URL = 'http://localhost:8000'
HEADERS = {'Content-Type': 'application/json'}


def make_request(method, url, headers, data=None):
    req_data = json.dumps(data).encode('utf-8') if data else None
    req = urllib.request.Request(url, data=req_data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as response:
            return response.status, json.loads(response.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        try:
            return e.code, json.loads(e.read().decode('utf-8'))
        except Exception:
            return e.code, {'error': str(e)}


def test_qr_end_to_end():
    print('\n' + '='*60)
    print('E2E QR TEST')
    print('='*60)

    # Login as partner
    login = {'email': 'partner@demo.local', 'password': 'Demo123!@'}
    status, resp = make_request('POST', f'{BASE_URL}/api/auth/login/', HEADERS.copy(), login)
    print('Login status:', status)
    if status != 200:
        print('Login failed:', resp)
        return
    token = resp.get('access')
    headers = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}

    # Get transactions
    status, transactions = make_request('GET', f'{BASE_URL}/api/transactions/', headers)
    print('Transactions status:', status)
    if status != 200:
        print('Failed to list transactions', transactions)
        return
    if len(transactions) == 0:
        print('No transactions to scan; create one via API or use test data.')
        return

    # Pick first transaction and scan its reference
    ref = transactions[0].get('transactionId')
    print('Scanning reference:', ref)
    status, scan_resp = make_request('POST', f'{BASE_URL}/api/qr/scan/', headers, {'reference': ref})
    print('Scan status:', status)
    print('Scan response:', scan_resp)

    # Test invalid reference
    import uuid
    fake_ref = str(uuid.uuid4())
    status, fake_resp = make_request('POST', f'{BASE_URL}/api/qr/scan/', headers, {'reference': fake_ref})
    print('Fake scan status:', status)
    print('Fake scan response:', fake_resp)

    print('\nE2E QR TEST COMPLETE')


if __name__ == '__main__':
    test_qr_end_to_end()
