#!/usr/bin/env python
"""
Script de test complet pour tous les endpoints SmartChange API
"""
import os
import django
import json
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_project.settings')
django.setup()

from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from api.models import Transaction, Wallet, User

User = get_user_model()
client = APIClient()

TEST_USER_EMAILS = [
    'merchant@test.local',
    'customer@test.local',
    'partner@test.local',
]
TEST_USER_PHONES = [
    '+223 91234567',
    '+223 91234568',
    '+223 91234569',
]

def cleanup_test_state():
    users = User.objects.filter(email__in=TEST_USER_EMAILS) | User.objects.filter(telephone__in=TEST_USER_PHONES)
    count = users.count()
    if count:
        users.delete()
        print(f"Supprimé {count} comptes de test existants et leurs objets associés.")

cleanup_test_state()

print("=" * 80)
print("TEST COMPLET DE L'API SMARTCHANGE")
print("=" * 80)

# Test 1: Enregistrement utilisateur
print("\n[TEST 1] Enregistrement utilisateur (Merchant)")
register_data = {
    "nom": "Dupont",
    "prenom": "Jean",
    "telephone": "+223 91234567",
    "email": "merchant@test.local",
    "password": "TestPass123!",
    "role": "merchant"
}
response = client.post('/api/auth/register/', register_data, format='json')
print(f"Status: {response.status_code}")
print(f"Response: {json.dumps(response.json(), indent=2)}")
merchant_id = response.json().get('user', {}).get('id') if response.status_code == 201 else None

# Test 2: Enregistrement Client
print("\n[TEST 2] Enregistrement utilisateur (Customer)")
customer_data = {
    "nom": "Martin",
    "prenom": "Paul",
    "telephone": "+223 91234568",
    "email": "customer@test.local",
    "password": "TestPass123!",
    "role": "customer"
}
response = client.post('/api/auth/register/', customer_data, format='json')
print(f"Status: {response.status_code}")
customer_id = response.json().get('user', {}).get('id') if response.status_code == 201 else None

# Test 3: Enregistrement Partenaire
print("\n[TEST 3] Enregistrement utilisateur (Partner)")
partner_data = {
    "nom": "Diouf",
    "prenom": "Fatou",
    "telephone": "+223 91234569",
    "email": "partner@test.local",
    "password": "TestPass123!",
    "role": "partner"
}
response = client.post('/api/auth/register/', partner_data, format='json')
print(f"Status: {response.status_code}")
partner_id = response.json().get('user', {}).get('id') if response.status_code == 201 else None

# Test 4: Login Merchant
print("\n[TEST 4] Login Merchant")
login_data = {
    "email_or_phone": "merchant@test.local",
    "password": "TestPass123!"
}
response = client.post('/api/auth/login/', login_data, format='json')
print(f"Status: {response.status_code}")
response_json = response.json()
print(f"Response: {json.dumps(response_json, indent=2)}")
merchant_token = response_json.get('access') if response.status_code == 200 else None

if merchant_token:
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {merchant_token}')

    # Test 5: Récupérer les infos utilisateur
    print("\n[TEST 5] Récupérer infos utilisateur (/api/auth/me/)")
    response = client.get('/api/auth/me/')
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2, default=str)}")

    # Test 6: Récupérer le portefeuille
    print("\n[TEST 6] Récupérer portefeuille (/api/wallet/)")
    response = client.get('/api/wallet/')
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2, default=str)}")

    # Test 7: Créer une transaction
    print("\n[TEST 7] Créer transaction (/api/transactions/ POST)")
    transaction_data = {
        "montantAchat": 50000,
        "montantPaye": 55000,
        "fraisService": 20
    }
    response = client.post('/api/transactions/', transaction_data, format='json')
    print(f"Status: {response.status_code}")
    response_json = response.json()
    print(f"Response: {json.dumps(response_json, indent=2, default=str)}")
    transaction_id = response_json.get('transactionId') if response.status_code == 201 else None

    # Test 8: Lister les transactions
    print("\n[TEST 8] Lister transactions (/api/transactions/ GET)")
    response = client.get('/api/transactions/')
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        transactions = response.json()
        print(f"Nombre de transactions: {len(transactions)}")
        if transactions:
            print(f"Première transaction: {json.dumps(transactions[0], indent=2, default=str)}")

    # Test 9: Scan QR with a valid transactionId
    print("\n[TEST 9] Scan QR (/api/qr/scan/ POST)")
    if transaction_id:
        qr_data = {
            "reference": transaction_id
        }
        response = client.post('/api/qr/scan/', qr_data, format='json')
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2, default=str)}")
    else:
        print('Aucun transactionId valide n\'a été récupéré pour tester le scan QR.')

    # Test 10: Dashboard
    print("\n[TEST 10] Dashboard (/api/dashboard/)")
    response = client.get('/api/dashboard/')
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2, default=str)}")

    # Test 11: Retrait portefeuille
    print("\n[TEST 11] Retrait portefeuille (/api/wallet/withdraw/)")
    response = client.post('/api/wallet/withdraw/', {}, format='json')
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2, default=str)}")

    # Test 12: Partenaires
    print("\n[TEST 12] Lister partenaires (/api/partners/)")
    response = client.get('/api/partners/')
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        partners = response.json()
        print(f"Nombre de partenaires: {len(partners)}")

print("\n" + "=" * 80)
print("TEST TERMINÉ")
print("=" * 80)
