# 🔍 AUDIT: Gestion des Marchands/Partenaires au Niveau des Locations

**Date**: 2026-06-06  
**Status**: ⚠️ **FLUX FONCTIONNEL MAIS INCOMPLET**

---

## 📋 RÉSUMÉ EXÉCUTIF

Le système gère actuellement les partenaires mais **manque d'une gestion complète des locations** (succursales). Le flux est partiel et présente plusieurs lacunes critiques pour une plateforme multi-locations.

### ✅ Points Forts
- ✓ Authentification partenaires fonctionnelle
- ✓ Dashboard partenaires avec statistiques de base
- ✓ Calcul automatique des commissions (25%)
- ✓ Portefeuille (wallet) par utilisateur
- ✓ Scannage QR Code par partenaire

### ❌ Points Faibles
- ✗ **Pas de modèle Location distinct**
- ✗ **Pas de multi-locations par partenaire**
- ✗ **Pas d'assignation basée sur la proximité**
- ✗ **Pas d'analytics par location**
- ✗ **Pas de gestion d'inventaire par location**

---

## 🏗️ STRUCTURE ACTUELLE

### Architecture Base de Données

```
User Model (partenaires)
├─ id, email, telephone
├─ nom_boutique (1 seul par partenaire)
├─ adresse (1 seule adresse)
├─ latitude, longitude (coordonnées uniques)
├─ horaires (horaires d'ouverture)
├─ role = 'partner'
└─ statut = 'actif|inactif|suspendu'

Transaction Model
├─ merchant (commerçant)
├─ partner ← Assigné ALÉATOIREMENT
├─ customer (client)
├─ montant_achat
├─ frais_service (20 F CFA)
└─ statut = 'en_attente|validee|annulee|expiree'

Commission Record
├─ transaction
├─ montant_commission
├─ type_commission: 'plateforme'(50%) | 'emetteur'(25%) | 'partenaire'(25%)
└─ date_commission
```

### Flux Actuel de Transaction

```
1. CRÉATION TRANSACTION
   ├─ Merchant crée une transaction
   ├─ Montant de change calculé
   ├─ Partenaire assigné ALÉATOIREMENT ❌
   │  (pas de proximity-based matching)
   └─ Commissions créées automatiquement ✓

2. QR CODE GENERATION
   ├─ QR ref créé (transaction_id)
   ├─ Expire après 48h
   └─ Inclut montant à rendre

3. SCAN PARTNER
   ├─ Partenaire scanne le QR Code
   ├─ Fraude détectée? (risk score)
   │  ├─ Si score > 70: BLOQUÉE
   │  ├─ Si validée: PAIEMENT EFFECUÉ ✓
   │  └─ Commissions distribuées
   └─ Wallet du partenaire crédité

4. SUIVI
   ├─ Dashboard agrégé (tous les transactions)
   └─ Pas de stats par location
```

---

## 🎯 PROBLÈMES IDENTIFIÉS

### 1. **Pas de Gestion Multi-Locations** (CRITIQUE)

**Code actuel** (views.py - ligne 171):
```python
def perform_create(self, serializer):
    user = self.request.user
    partner = User.objects.filter(role='partner', statut='actif').order_by('?').first()
    # ❌ Partenaire ALÉATOIRE - pas de logic location!
    transaction = serializer.save(merchant=user, partner=partner)
```

**Impact**:
- Un partenaire ne peut gérer qu'UNE seule location
- Les transactions vont à des partenaires au hasard
- Impossible de filtrer les transactions par location

---

### 2. **Pas d'Assignation par Proximité** (HAUTE PRIORITÉ)

**Cas d'usage réel**: 
- Client à Plateau (Abidjan) scanne avec un partenaire à Adjamé
- Distance: 10km+ → Livraison impossible/coûteuse

**Code PartnerSerializer** (serializers.py - ligne 26):
```python
def get_distance(self, obj):
    # ✓ Calcul distance exists mais...
    # ❌ N'est JAMAIS utilisé dans PartnerListView
    # ❌ Pas de filtrage par radius
```

**Solution manquante**:
```python
# Ce qu'il faudrait faire:
@api_view(['GET'])
def get_nearby_partners(request):
    lat = request.query_params.get('latitude')
    lng = request.query_params.get('longitude')
    radius = request.query_params.get('radius', 5)  # 5km par défaut
    
    # Rechercher les partenaires dans le radius
    partners = Partner.objects.filter(
        latitude__range=(lat-0.05, lat+0.05),  # ~5km
        longitude__range=(lng-0.05, lng+0.05)
    )
    # Trier par distance croissante
    return sorted(partners, key=lambda p: calculate_distance(lat,lng,p.lat,p.lng))
```

---

### 3. **Dashboard Partenaire Incomplet** (MOYENNE PRIORITÉ)

**Problème actuel**:
```tsx
// PartnerDashboardPage.tsx - Ligne 55
const partnerStats = {
    monnaieRemboursee: stats?.monnaieRecuperee ?? 0,  // ✓ Total agrégé
    commissionsGagnees: stats?.revenusJour ?? 0,       // ✓ Total agrégé
    // ❌ Pas de breakdown par location
    // ❌ Pas d'historique par location
    // ❌ Pas de comparaison location-to-location
}
```

**Données manquantes**:
- [ ] Transactions par location
- [ ] Performance par location (revenue, count, avg ticket)
- [ ] Taux de fraude par location
- [ ] Horaires d'ouverture gérés dynamiquement
- [ ] Statistiques temps réel par location

---

### 4. **Pas d'Historique Transactionnel par Location** (MOYENNE PRIORITÉ)

**Cas d'usage**:
- Audit: "Combien de transactions au magasin du centre-ville?"
- Rapport: "Quelle location a le plus de fraude?"
- Performance: "Comparer 2 locations du même partenaire"

**Situation actuelle**: 
- Transactions ne savent pas quelle location du partenaire
- Impossible de générer des rapports par location

---

### 5. **Validation et Statut Partenaire Insuffisants** (BASSE PRIORITÉ)

**Manques**:
```python
class Partner(User):
    # Manquent:
    # - verification_status ('non_verifie', 'verifie', 'suspendu')
    # - documents (photos, pièces d'identité)
    # - taux_fraude (pour désactiver les partenaires problématiques)
    # - performance_score
    # - nombre_locations
```

---

## 📊 COMPARAISON: MODÈLE ACTUEL vs MODÈLE OPTIMISÉ

### Modèle Actuel (Simplifié)
```
User (Partner) → Wallet → Transaction → Commission
    └─ 1 Location/address
```

### Modèle Recommandé (Complet)
```
User (Partner Account)
    ├─ Wallet (Global)
    ├─ Performance Metrics (Global)
    └─ Location[] (Multiple)
            ├─ LocationWallet (Par location)
            ├─ LocationMetrics (Par location)
            ├─ Staff (Employés de la location)
            ├─ Inventory (Inventaire)
            └─ Transaction[] (Liées à cette location)
```

---

## 🔧 RECOMMANDATIONS DE CORRECTION

### PRIORITÉ 1: Créer un Modèle Location (CRITIQUE)

```python
# api/models.py - AJOUTER:

class Location(models.Model):
    STATUT_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('suspended', 'Suspended'),
    ]
    
    # Relation
    partner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='locations')
    
    # Infos location
    nom = models.CharField(max_length=255)  # "Boutique Centre-Ville", "Shop Abidjan Nord"
    adresse = models.CharField(max_length=500)
    latitude = models.FloatField()
    longitude = models.FloatField()
    telephone = models.CharField(max_length=20)
    horaires = models.CharField(max_length=100)  # "9h-18h"
    
    # Stats
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='active')
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    revenus_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    # Audit
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='locations_created')
    
    class Meta:
        unique_together = [['partner', 'adresse']]  # Pas de doublons
        ordering = ['-updated_at']
    
    def __str__(self):
        return f"{self.partner.nom_boutique} - {self.nom}"
```

### PRIORITÉ 2: Modifier Transaction pour Lier une Location

```python
# api/models.py - MODIFIER:

class Transaction(models.Model):
    # ... fields existants ...
    partner = models.ForeignKey(
        User, 
        null=True, blank=True, 
        on_delete=models.SET_NULL, 
        related_name='partner_transactions'
    )
    partner_location = models.ForeignKey(  # ← NOUVEAU
        Location,
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='transactions'
    )
```

### PRIORITÉ 3: Implémenter Assignation par Proximité

```python
# api/views.py - MODIFIER TransactionListCreateView.perform_create():

def perform_create(self, serializer):
    user = self.request.user
    
    # Récupérer les coordonnées du merchant
    merchant_lat = user.latitude or 0
    merchant_lng = user.longitude or 0
    
    # Trouver les partenaires dans un rayon de 10km
    from django.db.models import FloatField
    from django.db.models.functions import ACos, Cos, Radians, Sin
    
    nearby_locations = Location.objects.filter(
        statut='active',
        partner__statut='actif'
    ).annotate(
        distance=6371 * ACos(  # Haversine formula
            Cos(Radians(merchant_lat)) * Cos(Radians(F('latitude'))) *
            Cos(Radians(F('longitude')) - Radians(merchant_lng)) +
            Sin(Radians(merchant_lat)) * Sin(Radians(F('latitude')))
        )
    ).filter(
        distance__lte=10  # 10km max
    ).order_by('distance')[:3]  # Top 3 les plus proches
    
    # Sélectionner aléatoirement parmi les 3 plus proches
    location = nearby_locations.order_by('?').first() if nearby_locations else None
    
    if location:
        transaction = serializer.save(
            merchant=user,
            partner=location.partner,
            partner_location=location  # ← NOUVEAU
        )
    else:
        # Fallback: partenaire random si aucun proche
        transaction = serializer.save(merchant=user, partner=...)
```

### PRIORITÉ 4: Ajouter Endpoints Location

```python
# api/urls.py - AJOUTER:

path('locations/', LocationListView.as_view(), name='locations-list'),
path('locations/<int:pk>/', LocationDetailView.as_view(), name='location-detail'),
path('locations/<int:pk>/stats/', LocationStatsView.as_view(), name='location-stats'),
path('partners/<int:pk>/locations/', PartnerLocationsView.as_view(), name='partner-locations'),
```

### PRIORITÉ 5: Dashboard par Location

```python
# api/views.py - AJOUTER:

class LocationStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, pk):
        location = get_object_or_404(Location, pk=pk)
        
        # Vérifier permission
        if request.user.role == 'partner' and location.partner != request.user:
            return Response({'detail': 'Non autorisé'}, status=403)
        
        # Calculer stats
        transactions = location.transactions.all()
        today = timezone.now() - timedelta(days=1)
        
        return Response({
            'location': LocationSerializer(location).data,
            'stats': {
                'totalTransactions': transactions.count(),
                'transactionsAujourd': transactions.filter(created_at__gte=today).count(),
                'revenusJour': transactions.filter(created_at__gte=today).aggregate(
                    Sum('frais_service')
                )['frais_service__sum'] or 0,
                'revenusMois': transactions.filter(
                    created_at__gte=timezone.now() - timedelta(days=30)
                ).aggregate(Sum('frais_service'))['frais_service__sum'] or 0,
                'taux_validation': transactions.filter(
                    statut='validee'
                ).count() / max(transactions.count(), 1) * 100,
                'taux_fraude': transactions.filter(
                    fraud_reports__isnull=False
                ).count() / max(transactions.count(), 1) * 100,
            }
        })
```

---

## 📱 IMPACT FRONTEND

### PartnerDashboardPage.tsx

**Avant**:
```tsx
// Données agrégées seulement
const stats = {
    monnaieRemboursee: 5000,  // Total de TOUTES les transactions
    commissionsGagnees: 325,  // Total de TOUTES les transactions
}
```

**Après**:
```tsx
// Avec sélection de location
const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

const stats = selectedLocation 
    ? await getLocationStats(selectedLocation.id)  // Stats par location
    : await getDashboardStats();  // Stats globales
```

### PartnerScanPage.tsx

**Avant**:
```tsx
// Pas d'info de location
const mockQrData = {
    ref: 'TXN-002',
    montant: 250,
    emetteur: 'Marché Central',  // Pas de location spécifique
}
```

**Après**:
```tsx
const qrData = {
    ref: 'TXN-002',
    montant: 250,
    location: {  // ← NOUVEAU
        nom: 'Boutique Centre-Ville',
        adresse: '123 Rue de Paris, Abidjan'
    }
}
```

---

## 📈 MATRICE D'IMPACT

| Fonctionnalité | Actuellement | Après Correction | Impact |
|---|---|---|---|
| **Multi-locations** | ❌ Non | ✅ Oui | CRITIQUE |
| **Assignation proximité** | ❌ Non | ✅ Oui | TRÈS HAUT |
| **Stats par location** | ❌ Non | ✅ Oui | HAUT |
| **Gestion inventaire** | ❌ Non | ✅ Possible | MOYEN |
| **Rapport fraude/location** | ❌ Non | ✅ Oui | HAUT |
| **Performance comparée** | ❌ Non | ✅ Oui | MOYEN |

---

## 🎬 PLAN D'ACTION

### Phase 1: Foundation (1-2 jours)
- [ ] Créer modèle `Location`
- [ ] Créer migration Django
- [ ] Ajouter `LocationSerializer`

### Phase 2: Backend Logic (2-3 jours)
- [ ] Modifier `TransactionListCreateView` pour proximité
- [ ] Créer `LocationStatsView`
- [ ] Ajouter endpoints Location CRUD

### Phase 3: Frontend (2-3 jours)
- [ ] Ajouter sélecteur location dans Dashboard
- [ ] Afficher stats par location
- [ ] Modifier PartnerScanPage

### Phase 4: Testing (1 jour)
- [ ] Tests unitaires backend
- [ ] Tests E2E frontend
- [ ] Tests de performance

### Phase 5: Déploiement (1/2 jour)
- [ ] Migration BD production
- [ ] Rollout progressif
- [ ] Monitoring

**Temps total estimé**: 7-10 jours

---

## ✅ CHECKLIST DE VALIDATION

Avant de considérer le flux comme "PARFAIT":

- [ ] Un partenaire peut créer **plusieurs locations**
- [ ] Chaque location a son propre portefeuille
- [ ] Transactions assignées au partenaire **le plus proche**
- [ ] Dashboard affiche stats **par location**
- [ ] Reports triés **par location**
- [ ] API filtre transactions **par location**
- [ ] Tests E2E multi-locations passent
- [ ] Perfs acceptables (< 200ms par query)
- [ ] Fraude détectée **par location**
- [ ] Commissions distribuées **par location**

---

## 🔗 LIENS DE RÉFÉRENCE

- [Backend - Models](c:\Hackathon\frontend1\backend\api\models.py)
- [Backend - Views](c:\Hackathon\frontend1\backend\api\views.py)
- [Frontend - PartnerDashboard](c:\Hackathon\frontend1\frontend1\src\pages\PartnerDashboardPage.tsx)
- [Frontend - PartnerScan](c:\Hackathon\frontend1\frontend1\src\pages\PartnerScanPage.tsx)

---

## 📝 CONCLUSION

**Verdict**: Le flux existe mais est **basique pour une seule location par partenaire**.

Pour une plateforme scalable avec **multi-locations**, il faut:
1. ✅ Modèle `Location` distinct
2. ✅ Assignation intelligente (proximité)
3. ✅ Analytics granulaires (par location)
4. ✅ Gestion complète (CRUD locations)

**Effort**: ~7-10 jours  
**ROI**: Très haut (déverrouille scalabilité)

