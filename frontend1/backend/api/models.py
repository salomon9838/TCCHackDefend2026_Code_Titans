import uuid
from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone


def generate_fraud_id():
    """Generate a unique fraud ID"""
    return uuid.uuid4().hex[:32]


def generate_transaction_id():
    """Generate a unique transaction ID"""
    return str(uuid.uuid4())[:32]


class User(AbstractUser):
    ROLE_CHOICES = [
        ('merchant', 'Commerçant'),
        ('customer', 'Client'),
        ('partner', 'Partenaire'),
        ('admin', 'Administrateur'),
    ]
    STATUT_CHOICES = [
        ('actif', 'Actif'),
        ('inactif', 'Inactif'),
        ('suspendu', 'Suspendu'),
    ]

    email = models.EmailField(unique=True)
    telephone = models.CharField(max_length=20, unique=True)
    role = models.CharField(max_length=12, choices=ROLE_CHOICES, default='merchant')
    statut = models.CharField(max_length=12, choices=STATUT_CHOICES, default='actif')
    nom = models.CharField(max_length=150, blank=True)
    prenom = models.CharField(max_length=150, blank=True)
    nom_boutique = models.CharField(max_length=255, blank=True)
    adresse = models.CharField(max_length=255, blank=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    horaires = models.CharField(max_length=100, default='9h-18h', blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'telephone']

    def __str__(self):
        return f'{self.prenom} {self.nom} ({self.email})'


class Wallet(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='wallet')
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    balance_en_attente = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    revenus_generes = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Wallet {self.user.email}'


class Transaction(models.Model):
    STATUT_CHOICES = [
        ('en_attente', 'En attente'),
        ('validee', 'Validée'),
        ('annulee', 'Annulée'),
        ('expiree', 'Expirée'),
    ]

    transaction_id = models.CharField(max_length=32, unique=True, default=generate_transaction_id)
    merchant = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='merchant_transactions')
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='customer_transactions')
    partner = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='partner_transactions')
    montant_achat = models.DecimalField(max_digits=12, decimal_places=2)
    montant_paye = models.DecimalField(max_digits=12, decimal_places=2)
    monnaie_a_rendre = models.DecimalField(max_digits=12, decimal_places=2)
    frais_service = models.DecimalField(max_digits=12, decimal_places=2)
    statut = models.CharField(max_length=12, choices=STATUT_CHOICES, default='en_attente')
    qr_code = models.CharField(max_length=128, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.transaction_id


class QRCodeRecord(models.Model):
    reference = models.CharField(max_length=64, unique=True)
    transaction = models.OneToOneField(Transaction, on_delete=models.CASCADE, related_name='qr_code_record')
    montant = models.DecimalField(max_digits=12, decimal_places=2)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    is_fraud = models.BooleanField(default=False)

    def __str__(self):
        return self.reference


class FraudReport(models.Model):
    fraud_id = models.CharField(max_length=32, unique=True, default=generate_fraud_id)
    transaction = models.ForeignKey(Transaction, on_delete=models.CASCADE, related_name='fraud_reports')
    score_risque = models.PositiveSmallIntegerField()
    type_fraude = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    date_detection = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.fraud_id


class CommissionRecord(models.Model):
    COMMISSION_TYPE_CHOICES = [
        ('plateforme', 'Plateforme'),
        ('emetteur', 'Émetteur'),
        ('partenaire', 'Partenaire'),
    ]
    transaction = models.ForeignKey(Transaction, on_delete=models.CASCADE, related_name='commissions')
    montant_commission = models.DecimalField(max_digits=12, decimal_places=2)
    type_commission = models.CharField(max_length=12, choices=COMMISSION_TYPE_CHOICES)
    date_commission = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.type_commission} - {self.montant_commission}'


@receiver(post_save, sender=User)
def create_wallet(sender, instance, created, **kwargs):
    if created:
        Wallet.objects.create(user=instance)
