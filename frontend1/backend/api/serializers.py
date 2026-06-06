import uuid
import math
from django.contrib.auth import authenticate
from django.utils import timezone
from rest_framework import serializers
from .models import User, Wallet, Transaction, QRCodeRecord, FraudReport, CommissionRecord

def normalize_phone(value):
    if value is None:
        return None
    return ''.join(ch for ch in value if ch.isdigit() or ch == '+')


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'prenom', 'nom', 'telephone', 'email', 'role', 'statut', 'created_at', 'nom_boutique', 'adresse', 'latitude', 'longitude', 'horaires']
        read_only_fields = ['id', 'created_at']


class PartnerSerializer(serializers.ModelSerializer):
    nomBoutique = serializers.CharField(source='nom_boutique', required=False)
    distance = serializers.SerializerMethodField()
    horaires = serializers.CharField()

    class Meta:
        model = User
        fields = ['id', 'prenom', 'nom', 'telephone', 'email', 'nomBoutique', 'adresse', 'latitude', 'longitude', 'horaires', 'distance']

    def get_distance(self, obj):
        # Calculate distance (in km) between partner and coordinates passed in request query params
        request = self.context.get('request') if hasattr(self, 'context') else None
        if request is None:
            return 0

        params = getattr(request, 'query_params', {})
        lat = params.get('lat') or params.get('latitude') or params.get('lng') and None
        lng = params.get('lng') or params.get('longitude') or params.get('lon') and None

        try:
            if lat is None or lng is None:
                return 0
            lat = float(lat)
            lng = float(lng)
            if obj.latitude is None or obj.longitude is None:
                return 0
            # haversine formula
            R = 6371.0  # Earth radius in kilometers
            phi1 = math.radians(lat)
            phi2 = math.radians(obj.latitude)
            d_phi = math.radians(obj.latitude - lat)
            d_lambda = math.radians(obj.longitude - lng)

            a = math.sin(d_phi/2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda/2)**2
            c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
            distance_km = R * c
            return round(distance_km, 2)
        except Exception:
            return 0


class RegisterSerializer(serializers.Serializer):
    nom = serializers.CharField(max_length=150)
    prenom = serializers.CharField(max_length=150)
    telephone = serializers.CharField(max_length=20)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(choices=User.ROLE_CHOICES)

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('Cet email est déjà utilisé.')
        return value

    def validate_telephone(self, value):
        normalized = normalize_phone(value)
        if User.objects.filter(telephone__iexact=value).exists() or User.objects.filter(telephone__iexact=normalized).exists():
            raise serializers.ValidationError('Ce numéro de téléphone est déjà utilisé.')
        return normalized

    def create(self, validated_data):
        username = validated_data['email'].strip().lower()
        telephone = normalize_phone(validated_data['telephone'])
        user = User.objects.create_user(
            username=username,
            email=validated_data['email'].strip().lower(),
            password=validated_data['password'],
            telephone=telephone,
            nom=validated_data['nom'],
            prenom=validated_data['prenom'],
            role=validated_data['role'],
            is_staff=(validated_data['role'] == 'admin'),
        )
        return user


class LoginSerializer(serializers.Serializer):
    email_or_phone = serializers.CharField(required=False, allow_blank=True)
    email = serializers.EmailField(required=False, allow_blank=True)
    telephone = serializers.CharField(required=False, allow_blank=True)
    username = serializers.CharField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, allow_blank=False)

    def validate(self, attrs):
        identity = (
            attrs.get('email_or_phone') or
            attrs.get('email') or
            attrs.get('telephone') or
            attrs.get('username')
        )
        password = attrs.get('password')

        if not identity or not identity.strip():
            raise serializers.ValidationError({'identity': 'Email, téléphone ou nom d\'utilisateur requis.'})
        if not password:
            raise serializers.ValidationError({'password': 'Mot de passe requis.'})

        identity = identity.strip()
        user = None

        if '@' in identity:
            email_value = identity.lower()
            user = authenticate(username=email_value, password=password)
        else:
            normalized_phone = normalize_phone(identity)
            try:
                user = User.objects.get(telephone__iexact=identity)
            except User.DoesNotExist:
                try:
                    user = User.objects.get(telephone__iexact=normalized_phone)
                except User.DoesNotExist:
                    user = None

            if user is None:
                for candidate in User.objects.iterator():
                    if normalize_phone(candidate.telephone) == normalized_phone:
                        user = candidate
                        break

            if user and not user.check_password(password):
                user = None

        if user is None:
            raise serializers.ValidationError({'credentials': 'Email/téléphone ou mot de passe incorrect.'})
        if not user.is_active:
            raise serializers.ValidationError({'account': 'Ce compte est désactivé.'})

        attrs['user'] = user
        return attrs


class WalletSerializer(serializers.ModelSerializer):
    walletId = serializers.CharField(source='id')
    balanceEnAttente = serializers.DecimalField(source='balance_en_attente', max_digits=12, decimal_places=2)
    revenusGeneres = serializers.DecimalField(source='revenus_generes', max_digits=12, decimal_places=2)

    class Meta:
        model = Wallet
        fields = ['walletId', 'balance', 'balanceEnAttente', 'revenusGeneres', 'created_at']


class TransactionSerializer(serializers.ModelSerializer):
    transactionId = serializers.CharField(source='transaction_id', read_only=True)
    montantAchat = serializers.DecimalField(source='montant_achat', max_digits=12, decimal_places=2)
    montantPaye = serializers.DecimalField(source='montant_paye', max_digits=12, decimal_places=2)
    monnaieARendre = serializers.DecimalField(source='monnaie_a_rendre', max_digits=12, decimal_places=2)
    fraisService = serializers.DecimalField(source='frais_service', max_digits=12, decimal_places=2)
    statut = serializers.CharField()
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    merchantName = serializers.SerializerMethodField()
    partnerName = serializers.SerializerMethodField()
    customerName = serializers.SerializerMethodField()
    qrCode = serializers.CharField(source='qr_code', read_only=True)

    class Meta:
        model = Transaction
        fields = ['transactionId', 'montantAchat', 'montantPaye', 'monnaieARendre', 'fraisService', 'statut', 'createdAt', 'merchantName', 'partnerName', 'customerName', 'qrCode']

    def get_merchantName(self, obj):
        return f'{obj.merchant.prenom} {obj.merchant.nom}'

    def get_partnerName(self, obj):
        if obj.partner:
            return f'{obj.partner.prenom} {obj.partner.nom}'
        return None

    def get_customerName(self, obj):
        if obj.customer:
            return f'{obj.customer.prenom} {obj.customer.nom}'
        return None


class TransactionCreateSerializer(serializers.ModelSerializer):
    transactionId = serializers.CharField(source='transaction_id', read_only=True)
    montantAchat = serializers.DecimalField(source='montant_achat', max_digits=12, decimal_places=2)
    montantPaye = serializers.DecimalField(source='montant_paye', max_digits=12, decimal_places=2)
    monnaieARendre = serializers.DecimalField(source='monnaie_a_rendre', max_digits=12, decimal_places=2, required=False)
    fraisService = serializers.DecimalField(source='frais_service', max_digits=12, decimal_places=2, default=20)
    qrCode = serializers.CharField(source='qr_code', read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = Transaction
        fields = ['transactionId', 'montantAchat', 'montantPaye', 'monnaieARendre', 'fraisService', 'qrCode', 'createdAt']

    def create(self, validated_data):
        # Extract data
        montant_achat = validated_data.get('montant_achat')
        montant_paye = validated_data.get('montant_paye')
        monnaie_a_rendre = validated_data.get('monnaie_a_rendre') or max(montant_paye - montant_achat, 0)
        frais_service = validated_data.get('frais_service', 20)
        
        # Get merchant and partner from validated_data (passed via save())
        merchant = validated_data.get('merchant')
        partner = validated_data.get('partner')
        
        if not merchant:
            raise serializers.ValidationError('Merchant is required.')
        
        # Create transaction with all required fields
        transaction = Transaction.objects.create(
            merchant=merchant,
            partner=partner,
            montant_achat=montant_achat,
            montant_paye=montant_paye,
            monnaie_a_rendre=monnaie_a_rendre,
            frais_service=frais_service,
            statut='en_attente',
            qr_code=f'SMART-{uuid.uuid4().hex[:12].upper()}',
        )
        return transaction


class QRScanSerializer(serializers.Serializer):
    reference = serializers.CharField()


class QRScanResultSerializer(serializers.Serializer):
    status = serializers.CharField()
    reference = serializers.CharField()
    montant = serializers.DecimalField(max_digits=12, decimal_places=2)
    expiration = serializers.DateTimeField()
    isFraud = serializers.BooleanField()
    message = serializers.CharField()


class DashboardSerializer(serializers.Serializer):
    totalTransactions = serializers.IntegerField()
    revenusJour = serializers.DecimalField(max_digits=12, decimal_places=2)
    revenusMois = serializers.DecimalField(max_digits=12, decimal_places=2)
    totalClients = serializers.IntegerField()
    monnaieDistribuee = serializers.DecimalField(max_digits=12, decimal_places=2)
    monnaieRecuperee = serializers.DecimalField(max_digits=12, decimal_places=2)


class FraudReportSerializer(serializers.ModelSerializer):
    fraudId = serializers.CharField(source='fraud_id')
    scoreRisque = serializers.IntegerField(source='score_risque')
    typeFraude = serializers.CharField(source='type_fraude')
    dateDetection = serializers.DateTimeField(source='date_detection')
    transactionId = serializers.CharField(source='transaction.transaction_id')

    class Meta:
        model = FraudReport
        fields = ['fraudId', 'scoreRisque', 'typeFraude', 'description', 'dateDetection', 'transactionId']


class CommissionSerializer(serializers.ModelSerializer):
    commissionId = serializers.CharField(source='id')
    montantCommission = serializers.DecimalField(source='montant_commission', max_digits=12, decimal_places=2)
    typeCommission = serializers.CharField(source='type_commission')
    dateCommission = serializers.DateTimeField(source='date_commission')

    class Meta:
        model = CommissionRecord
        fields = ['commissionId', 'montantCommission', 'typeCommission', 'dateCommission']
