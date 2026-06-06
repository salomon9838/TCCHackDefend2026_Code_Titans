from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _

from .models import (
    User,
    Wallet,
    Transaction,
    QRCodeRecord,
    FraudReport,
    CommissionRecord,
)


class WalletInline(admin.StackedInline):
    model = Wallet
    can_delete = False
    verbose_name_plural = 'Wallet'
    fk_name = 'user'
    readonly_fields = ('balance', 'balance_en_attente', 'revenus_generes', 'created_at')


class UserAdmin(BaseUserAdmin):
    model = User
    list_display = (
        'email',
        'role',
        'statut',
        'nom',
        'prenom',
        'telephone',
        'is_staff',
        'is_active',
    )
    list_filter = ('role', 'statut', 'is_staff', 'is_superuser', 'is_active')
    ordering = ('email',)
    search_fields = ('email', 'nom', 'prenom', 'nom_boutique', 'telephone')
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        (_('Personal info'), {
            'fields': (
                'username',
                'nom',
                'prenom',
                'telephone',
                'nom_boutique',
                'adresse',
                'latitude',
                'longitude',
            )
        }),
        (_('Permissions'), {
            'fields': (
                'role',
                'statut',
                'is_active',
                'is_staff',
                'is_superuser',
                'groups',
                'user_permissions',
            )
        }),
        (_('Important dates'), {'fields': ('last_login', 'date_joined', 'created_at')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'email',
                'username',
                'telephone',
                'password1',
                'password2',
                'role',
                'statut',
                'is_active',
                'is_staff',
            ),
        }),
    )
    inlines = [WalletInline]
    readonly_fields = ('created_at',)
    filter_horizontal = ('groups', 'user_permissions')


@admin.register(Wallet)
class WalletAdmin(admin.ModelAdmin):
    list_display = ('user', 'balance', 'balance_en_attente', 'revenus_generes', 'created_at')
    search_fields = ('user__email', 'user__nom', 'user__prenom')
    readonly_fields = ('created_at',)


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = (
        'transaction_id',
        'merchant',
        'customer',
        'partner',
        'montant_achat',
        'montant_paye',
        'monnaie_a_rendre',
        'frais_service',
        'statut',
        'created_at',
    )
    list_filter = ('statut', 'created_at')
    search_fields = (
        'transaction_id',
        'merchant__email',
        'customer__email',
        'partner__email',
    )
    readonly_fields = ('created_at',)


@admin.register(QRCodeRecord)
class QRCodeRecordAdmin(admin.ModelAdmin):
    list_display = ('reference', 'transaction', 'montant', 'expires_at', 'is_used', 'is_fraud')
    list_filter = ('is_used', 'is_fraud', 'expires_at')
    search_fields = ('reference', 'transaction__transaction_id')


@admin.register(FraudReport)
class FraudReportAdmin(admin.ModelAdmin):
    list_display = ('fraud_id', 'transaction', 'score_risque', 'type_fraude', 'date_detection')
    list_filter = ('type_fraude', 'date_detection')
    search_fields = ('fraud_id', 'transaction__transaction_id')
    readonly_fields = ('date_detection',)


@admin.register(CommissionRecord)
class CommissionRecordAdmin(admin.ModelAdmin):
    list_display = ('transaction', 'type_commission', 'montant_commission', 'date_commission')
    list_filter = ('type_commission', 'date_commission')
    search_fields = ('transaction__transaction_id',)
    readonly_fields = ('date_commission',)


admin.site.register(User, UserAdmin)
