#!/usr/bin/env python
"""
Script de test et vérification PostgreSQL
"""
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_project.settings')

try:
    print("=" * 80)
    print("VÉRIFICATION DU SETUP DJANGO")
    print("=" * 80)
    
    print("\n[1] Configuration Django...")
    django.setup()
    print("✓ Django setup réussi")
    
    print("\n[2] Vérification de la base de données...")
    from django.db import connection
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            print("✓ Connexion PostgreSQL réussie")
    except Exception as e:
        print(f"✗ Erreur connexion PostgreSQL: {e}")
        sys.exit(1)
    
    print("\n[3] Vérification des modèles...")
    from api.models import User, Wallet, Transaction, QRCodeRecord, FraudReport, CommissionRecord
    print("✓ Tous les modèles importés avec succès")
    
    print("\n[4] Vérification des sérialiseurs...")
    from api.serializers import (
        UserSerializer, RegisterSerializer, LoginSerializer, WalletSerializer,
        TransactionSerializer, TransactionCreateSerializer, QRScanSerializer,
        DashboardSerializer, FraudReportSerializer, CommissionSerializer
    )
    print("✓ Tous les sérialiseurs importés avec succès")
    
    print("\n[5] Vérification des vues...")
    from api.views import (
        APIRootView, RegisterView, LoginView, MeView, WalletView,
        TransactionListCreateView, QRScanView, DashboardView
    )
    print("✓ Toutes les vues importées avec succès")
    
    print("\n[6] Comptage des objets dans la BD...")
    print(f"  - Utilisateurs: {User.objects.count()}")
    print(f"  - Transactions: {Transaction.objects.count()}")
    print(f"  - Portefeuilles: {Wallet.objects.count()}")
    
    print("\n" + "=" * 80)
    print("✓ TOUS LES TESTS RÉUSSIS")
    print("=" * 80)
    
except Exception as e:
    print(f"\n✗ ERREUR: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
