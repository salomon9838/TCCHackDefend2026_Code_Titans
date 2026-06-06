#!/usr/bin/env python
import os
import django
import json
import urllib.request
import urllib.error

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_project.settings')
django.setup()

from django.contrib.auth import get_user_model
from api.models import Transaction, User
from decimal import Decimal

# Configuration
BASE_URL = 'http://localhost:8000'
API_HEADERS = {'Content-Type': 'application/json'}

def make_request(method, url, headers, data=None):
    """Make HTTP request using urllib"""
    req_data = json.dumps(data).encode('utf-8') if data else None
    req = urllib.request.Request(url, data=req_data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as response:
            return response.status, json.loads(response.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode('utf-8'))

def test_partner_dashboard():
    """Test partner dashboard endpoint with real data"""
    
    print("\n" + "="*80)
    print("TEST TABLEAU DE BORD PARTENAIRE")
    print("="*80)
    
    # Step 1: Get partner token
    print("\n[ÉTAPE 1] Connexion du partenaire")
    login_data = {
        "email": "partner@demo.local",
        "password": "Demo123!@"
    }
    
    status, response = make_request('POST', f'{BASE_URL}/api/auth/login/', API_HEADERS.copy(), login_data)
    print(f"Status: {status}")
    
    if status != 200:
        print(f"Error: {response}")
        return
    
    token = response.get('access')
    headers = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}
    
    partner_data = response.get('user')
    print(f"✓ Partenaire: {partner_data['prenom']} {partner_data['nom']} ({partner_data['email']})")
    print(f"  - ID: {partner_data['id']}")
    print(f"  - Boutique: {partner_data.get('nom_boutique', 'N/A')}")
    print(f"  - Horaires: {partner_data.get('horaires', 'N/A')}")
    
    # Step 2: Get dashboard stats
    print("\n[ÉTAPE 2] Récupération des statistiques du tableau de bord")
    status, response = make_request('GET', f'{BASE_URL}/api/dashboard/', headers)
    print(f"Status: {status}")
    
    if status != 200:
        print(f"Error: {response}")
        return
    
    dashboard_data = response
    print("Dashboard Stats:")
    for key, value in dashboard_data.items():
        print(f"  - {key}: {value}")
    
    # Step 3: Get partner transactions
    print("\n[ÉTAPE 3] Récupération des transactions du partenaire")
    status, response = make_request('GET', f'{BASE_URL}/api/transactions/', headers)
    print(f"Status: {status}")
    
    if status != 200:
        print(f"Error: {response}")
        return
    
    transactions = response
    print(f"Nombre de transactions: {len(transactions)}")
    
    total_commissions = Decimal('0')
    for i, t in enumerate(transactions, 1):
        print(f"\n  Transaction {i}:")
        print(f"    - ID: {t.get('transactionId')}")
        print(f"    - Montant: {t.get('montantAchat')} F")
        print(f"    - Frais: {t.get('fraisService')} F")
        print(f"    - Statut: {t.get('statut')}")
        
        # Calculate partner commission (25%)
        frais = Decimal(str(t.get('fraisService', 0)))
        commission = frais * Decimal('0.25')
        total_commissions += commission
        print(f"    - Commission (25%): {commission} F")
    
    print(f"\nTotal des commissions: {total_commissions} F")
    
    # Step 4: Get partner list to verify data
    print("\n[ÉTAPE 4] Vérification des données du partenaire dans la liste")
    status, response = make_request('GET', f'{BASE_URL}/api/partners/', headers)
    print(f"Status: {status}")
    
    if status == 200:
        partners = response
        print(f"Nombre de partenaires: {len(partners)}")
        for p in partners:
            print(f"  - {p.get('prenom')} {p.get('nom')}")
            print(f"    * Boutique: {p.get('nomBoutique', 'N/A')}")
            print(f"    * Adresse: {p.get('adresse', 'N/A')}")
    
    print("\n" + "="*80)
    print("TEST TERMINÉ")
    print("="*80 + "\n")

if __name__ == '__main__':
    test_partner_dashboard()
