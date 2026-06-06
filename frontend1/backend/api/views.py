import json
import random
import uuid
import urllib.error
import urllib.request
import logging
from decimal import Decimal
from datetime import timedelta
from django.conf import settings
from django.utils import timezone
from django.db.models import Count, Sum
from django.contrib.auth import authenticate
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from .permissions import IsAdminRole
from .models import User, Transaction, QRCodeRecord, FraudReport, CommissionRecord
from .serializers import (
    UserSerializer,
    PartnerSerializer,
    RegisterSerializer,
    LoginSerializer,
    WalletSerializer,
    TransactionSerializer,
    TransactionCreateSerializer,
    QRScanSerializer,
    QRScanResultSerializer,
    DashboardSerializer,
    FraudReportSerializer,
    CommissionSerializer,
)

logger = logging.getLogger(__name__)



class APIRootView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response({
            'message': 'SmartChange API root',
            'available_endpoints': {
                'register': '/api/auth/register/',
                'login': '/api/auth/login/',
                'me': '/api/auth/me/',
                'refresh': '/api/auth/refresh/',
                'wallet': '/api/wallet/',
                'transactions': '/api/transactions/',
                'partners': '/api/partners/',
                'dashboard': '/api/dashboard/',
                'admin_users': '/api/admin/users/',
                'admin_transactions': '/api/admin/transactions/',
                'admin_fraud': '/api/admin/fraud/',
                'admin_commissions': '/api/admin/commissions/',
            }
        })


class APIDocsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response({
            'title': 'SmartChange API documentation',
            'description': 'Use the listed endpoints to interact with SmartChange.',
            'authentication': 'Bearer token required for protected routes.',
            'endpoints': {
                '/api/auth/register/': 'POST user registration',
                '/api/auth/login/': 'POST login and get tokens',
                '/api/auth/me/': 'GET current authenticated user',
                '/api/auth/refresh/': 'POST refresh token',
                '/api/wallet/': 'GET authenticated user wallet',
                '/api/wallet/withdraw/': 'POST withdraw wallet balance',
                '/api/payments/initiate/': 'POST start a Fadadey payment',
                '/api/transactions/': 'GET list or POST create a transaction',
                '/api/partners/': 'GET active partners list',
                '/api/payments/initiate/': 'POST start a Fadadey payment',
                '/api/qr/scan/': 'POST scan a QR reference',
                '/api/dashboard/': 'GET dashboard metrics',
                '/api/admin/users/': 'GET all users (admin only)',
                '/api/admin/transactions/': 'GET all transactions (admin only)',
                '/api/admin/fraud/': 'GET fraud reports (admin only)',
                '/api/admin/commissions/': 'GET commission records (admin only)',
            }
        })


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'success': True,
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        logger.info(f"Login attempt - Data: {request.data}")
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            logger.error(f"Login validation failed - Errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        logger.info(f"Login successful for user {user.id}")
        return Response({
            'success': True,
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        })


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


class UserProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def put(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class PartnerListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = PartnerSerializer

    def get_queryset(self):
        queryset = User.objects.filter(role='partner', statut='actif')
        query = self.request.query_params.get('q')
        if query:
            queryset = queryset.filter(nom_boutique__icontains=query) | queryset.filter(adresse__icontains=query)
        return queryset


class WalletView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        wallet = getattr(request.user, 'wallet', None)
        if not wallet:
            return Response({'detail': 'Wallet introuvable.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = WalletSerializer(wallet)
        return Response(serializer.data)


class TransactionListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return TransactionCreateSerializer
        return TransactionSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'merchant':
            return Transaction.objects.filter(merchant=user).order_by('-created_at')
        if user.role == 'partner':
            return Transaction.objects.filter(partner=user).order_by('-created_at')
        if user.role == 'customer':
            return Transaction.objects.filter(customer=user).order_by('-created_at')
        return Transaction.objects.all().order_by('-created_at')

    def perform_create(self, serializer):
        user = self.request.user
        partner = User.objects.filter(role='partner', statut='actif').order_by('?').first()
        transaction = serializer.save(merchant=user, partner=partner)

        platform_share = transaction.frais_service * Decimal('0.5')
        merchant_share = transaction.frais_service * Decimal('0.25')
        partner_share = transaction.frais_service * Decimal('0.25')

        CommissionRecord.objects.create(
            transaction=transaction,
            montant_commission=merchant_share,
            type_commission='emetteur',
        )
        CommissionRecord.objects.create(
            transaction=transaction,
            montant_commission=partner_share,
            type_commission='partenaire',
        )
        CommissionRecord.objects.create(
            transaction=transaction,
            montant_commission=platform_share,
            type_commission='plateforme',
        )

        merchant_wallet = getattr(transaction.merchant, 'wallet', None)
        if merchant_wallet:
            merchant_wallet.balance_en_attente += merchant_share
            merchant_wallet.revenus_generes += merchant_share
            merchant_wallet.save(update_fields=['balance_en_attente', 'revenus_generes'])

        if partner and getattr(partner, 'wallet', None):
            partner_wallet = partner.wallet
            partner_wallet.balance_en_attente += partner_share
            partner_wallet.revenus_generes += partner_share
            partner_wallet.save(update_fields=['balance_en_attente', 'revenus_generes'])

        return transaction


class WalletWithdrawView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        wallet = getattr(request.user, 'wallet', None)
        if not wallet:
            return Response({'detail': 'Wallet introuvable.'}, status=status.HTTP_404_NOT_FOUND)
        if wallet.balance <= 0:
            return Response({'detail': 'Solde insuffisant pour retrait.'}, status=status.HTTP_400_BAD_REQUEST)

        montant_retirer = wallet.balance
        wallet.balance = 0
        wallet.save(update_fields=['balance'])
        return Response({'success': True, 'withdrawn': montant_retirer, 'wallet': WalletSerializer(wallet).data})


class PaymentInitiateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        amount = request.data.get('amount')
        currency = request.data.get('currency', 'XOF')
        transaction_id = request.data.get('transactionId')
        customer_email = request.data.get('email', request.user.email)

        if amount is None:
            return Response({'detail': 'Le montant est requis.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            montant = Decimal(str(amount))
        except Exception:
            return Response({'detail': 'Montant invalide.'}, status=status.HTTP_400_BAD_REQUEST)

        if montant <= 0:
            return Response({'detail': 'Le montant doit être supérieur à 0.'}, status=status.HTTP_400_BAD_REQUEST)

        payload = {
            'amount': int(montant * 100),
            'currency': currency,
            'customer': {
                'email': customer_email,
            },
            'metadata': {
                'transaction_id': transaction_id,
                'merchant_id': request.user.id,
            },
            'redirect_url': request.build_absolute_uri('/api/payments/verify/'),
        }

        url = f"{settings.FADADEY_API_BASE_URL.rstrip('/')}/payments"
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {settings.FADADEY_SECRET_KEY}',
            'X-Public-Key': settings.FADADEY_PUBLIC_KEY,
        }

        try:
            req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers=headers, method='POST')
            with urllib.request.urlopen(req, timeout=25) as response:
                response_data = json.loads(response.read().decode('utf-8'))
        except urllib.error.HTTPError as error:
            body = error.read().decode('utf-8') if hasattr(error, 'read') else ''
            return Response({'detail': 'Impossible de lancer le paiement.', 'error': body}, status=status.HTTP_502_BAD_GATEWAY)
        except Exception as error:
            return Response({'detail': 'Erreur de connexion à Fadadey.', 'error': str(error)}, status=status.HTTP_502_BAD_GATEWAY)

        payment_url = response_data.get('payment_url') or response_data.get('url') or response_data.get('link')
        return Response({
            'success': True,
            'paymentUrl': payment_url,
            'reference': response_data.get('reference') or response_data.get('id'),
            'status': response_data.get('status') or 'pending',
            'raw': response_data,
        })


class QRScanView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = QRScanSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        reference = serializer.validated_data['reference']
        try:
            transaction = Transaction.objects.get(transaction_id=reference)
        except Transaction.DoesNotExist:
            return Response({'status': 'invalid', 'message': 'Référence inconnue.'}, status=status.HTTP_404_NOT_FOUND)

        if transaction.statut == 'validee':
            return Response({'status': 'invalid', 'message': 'Ce QR Code a déjà été utilisé.'})

        expiration = transaction.created_at + timedelta(hours=48)
        if timezone.now() > expiration:
            transaction.statut = 'expiree'
            transaction.save(update_fields=['statut'])
            return Response({'status': 'expired', 'message': 'QR Code expiré.', 'reference': reference, 'montant': transaction.monnaie_a_rendre, 'expiration': expiration})

        risk_score = random.randint(10, 90) if transaction.monnaie_a_rendre > 500 else random.randint(5, 35)
        if risk_score > 70:
            transaction.statut = 'annulee'
            transaction.save(update_fields=['statut'])
            report = FraudReport.objects.create(
                transaction=transaction,
                score_risque=risk_score,
                type_fraude='Comportement suspect',
                description='Le QR Code présente un score de risque élevé.',
            )
            return Response({'status': 'fraud', 'message': 'Fraude détectée.', 'reference': reference, 'montant': transaction.monnaie_a_rendre, 'expiration': expiration, 'isFraud': True})

        transaction.statut = 'validee'
        transaction.save(update_fields=['statut'])
        self._settle_transaction(transaction)
        return Response({'status': 'valid', 'message': 'QR Code valide.', 'reference': reference, 'montant': transaction.monnaie_a_rendre, 'expiration': expiration, 'isFraud': False})

    def _settle_transaction(self, transaction):
        merchant_wallet = getattr(transaction.merchant, 'wallet', None)
        partner_wallet = getattr(transaction.partner, 'wallet', None) if transaction.partner else None
        merchant_net = max(transaction.monnaie_a_rendre - (transaction.frais_service * Decimal('0.5')), Decimal('0'))
        partner_share = transaction.frais_service * Decimal('0.25')

        if merchant_wallet:
            merchant_wallet.balance += merchant_net
            merchant_wallet.balance_en_attente = max(merchant_wallet.balance_en_attente - (transaction.frais_service * Decimal('0.25')), Decimal('0'))
            merchant_wallet.revenus_generes += transaction.frais_service * Decimal('0.25')
            merchant_wallet.save(update_fields=['balance', 'balance_en_attente', 'revenus_generes'])

        if partner_wallet:
            partner_wallet.balance += partner_share
            partner_wallet.balance_en_attente = max(partner_wallet.balance_en_attente - partner_share, Decimal('0'))
            partner_wallet.revenus_generes += partner_share
            partner_wallet.save(update_fields=['balance', 'balance_en_attente', 'revenus_generes'])


class DashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role == 'admin':
            total = Transaction.objects.count()
            revenue_day = Transaction.objects.filter(created_at__gte=timezone.now() - timedelta(days=1)).aggregate(sum=Sum('frais_service'))['sum'] or 0
            revenue_month = Transaction.objects.filter(created_at__gte=timezone.now() - timedelta(days=30)).aggregate(sum=Sum('frais_service'))['sum'] or 0
            clients = User.objects.filter(role='customer').count()
            distributed = Transaction.objects.aggregate(sum=Sum('monnaie_a_rendre'))['sum'] or 0
            recovered = Transaction.objects.filter(statut='validee').aggregate(sum=Sum('monnaie_a_rendre'))['sum'] or 0
        else:
            q = Transaction.objects
            if user.role == 'merchant':
                q = q.filter(merchant=user)
            elif user.role == 'partner':
                q = q.filter(partner=user)
            elif user.role == 'customer':
                q = q.filter(customer=user)
            total = q.count()
            revenue_day = q.filter(created_at__gte=timezone.now() - timedelta(days=1)).aggregate(sum=Sum('frais_service'))['sum'] or 0
            revenue_month = q.filter(created_at__gte=timezone.now() - timedelta(days=30)).aggregate(sum=Sum('frais_service'))['sum'] or 0
            clients = User.objects.filter(role='customer').count() if user.role == 'merchant' else 0
            distributed = q.aggregate(sum=Sum('monnaie_a_rendre'))['sum'] or 0
            recovered = q.filter(statut='validee').aggregate(sum=Sum('monnaie_a_rendre'))['sum'] or 0

        data = {
            'totalTransactions': total,
            'revenusJour': revenue_day,
            'revenusMois': revenue_month,
            'totalClients': clients,
            'monnaieDistribuee': distributed,
            'monnaieRecuperee': recovered,
        }
        serializer = DashboardSerializer(data)
        return Response(serializer.data)


class AdminUsersView(generics.ListAPIView):
    permission_classes = [IsAdminRole]
    serializer_class = UserSerializer
    queryset = User.objects.all().order_by('-created_at')


class AdminTransactionsView(generics.ListAPIView):
    permission_classes = [IsAdminRole]
    serializer_class = TransactionSerializer
    queryset = Transaction.objects.all().order_by('-created_at')


class AdminFraudView(generics.ListAPIView):
    permission_classes = [IsAdminRole]
    serializer_class = FraudReportSerializer
    queryset = FraudReport.objects.all().order_by('-date_detection')


class AdminCommissionView(generics.ListAPIView):
    permission_classes = [IsAdminRole]
    serializer_class = CommissionSerializer
    queryset = CommissionRecord.objects.all().order_by('-date_commission')


class SeedTestUsersView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        """Create test users for development/testing"""
        test_data = [
            {'email': 'merchant@demo.local', 'telephone': '+228 91234567', 'nom': 'Dupont', 'prenom': 'Jean', 'role': 'merchant', 'password': 'Demo123!@'},
            {'email': 'customer@demo.local', 'telephone': '+228 91234568', 'nom': 'Martin', 'prenom': 'Paul', 'role': 'customer', 'password': 'Demo123!@'},
            {'email': 'partner@demo.local', 'telephone': '+228 91234569', 'nom': 'Diouf', 'prenom': 'Fatou', 'role': 'partner', 'password': 'Demo123!@'},
        ]
        
        created = []
        existing = []
        
        for data in test_data:
            user, is_created = User.objects.get_or_create(
                email=data['email'],
                defaults={
                    'username': data['email'].lower(),
                    'telephone': data['telephone'],
                    'nom': data['nom'],
                    'prenom': data['prenom'],
                    'role': data['role'],
                    'is_active': True,
                }
            )
            if is_created:
                user.set_password(data['password'])
                user.save()
                created.append(data['email'])
                logger.info(f"Created test user: {data['email']}")
            else:
                user.set_password(data['password'])
                user.save()
                existing.append(data['email'])
                logger.info(f"Updated test user: {data['email']}")
        
        return Response({
            'success': True,
            'message': 'Test users seeded',
            'created': created,
            'updated': existing,
            'test_credentials': [
                {'email': 'merchant@demo.local', 'password': 'Demo123!@', 'role': 'merchant'},
                {'email': 'customer@demo.local', 'password': 'Demo123!@', 'role': 'customer'},
                {'email': 'partner@demo.local', 'password': 'Demo123!@', 'role': 'partner'},
            ]
        })
