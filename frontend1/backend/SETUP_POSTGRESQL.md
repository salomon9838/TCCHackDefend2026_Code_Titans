# Guide d'installation et de vérification PostgreSQL - SmartChange

## Prérequis

1. **PostgreSQL 12+** installé et en cours d'exécution
2. **Python 3.11+** 
3. **pip** (Python package manager)

## Installation pas à pas

### 1. Configuration de la base de données PostgreSQL

```bash
# Connectez-vous à PostgreSQL
psql -U postgres

# Dans la console PostgreSQL, exécutez:
CREATE DATABASE smartchange_db;
CREATE USER smartchange_user WITH PASSWORD 'smartchange_password';
ALTER ROLE smartchange_user SET client_encoding TO 'utf8';
ALTER ROLE smartchange_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE smartchange_user SET default_transaction_deferrable TO on;
ALTER ROLE smartchange_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE smartchange_db TO smartchange_user;
\q
```

### 2. Configuration des variables d'environnement

Créez un fichier `.env` dans `frontend1/backend/`:

```env
DJANGO_SECRET_KEY=votre-clé-secrète-très-sécurisée
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1

POSTGRES_DB=smartchange_db
POSTGRES_USER=smartchange_user
POSTGRES_PASSWORD=smartchange_password
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

FADADEY_PUBLIC_KEY=pk_sandbox_TFz2t9o5UhnfV9DAUdk4QulL
FADADEY_SECRET_KEY=sk_sandbox_nC8owJa_FQAaQMsBhxOBRWQv
FADADEY_API_BASE_URL=https://sandbox.fadadey.com

ACCESS_TOKEN_LIFETIME=86400
REFRESH_TOKEN_LIFETIME=2592000
```

### 3. Installation des dépendances Python

```bash
cd frontend1/backend

# Créer un environnement virtuel
python -m venv .venv

# Activer l'environnement
# Windows:
.\.venv\Scripts\activate
# macOS/Linux:
# source .venv/bin/activate

# Installer les dépendances
pip install -r requirements.txt
```

### 4. Appliquer les migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 5. Créer un super-utilisateur (optionnel)

```bash
python manage.py createsuperuser
```

### 6. Lancer le serveur

```bash
python manage.py runserver 8000
```

L'API sera accessible à: `http://127.0.0.1:8000/api/`

## Vérification des endpoints

### API disponibles

#### 1. Authentification

**Enregistrement**
```bash
POST /api/auth/register/
Content-Type: application/json

{
  "nom": "Dupont",
  "prenom": "Jean",
  "telephone": "+223 91234567",
  "email": "jean@example.com",
  "password": "SecurePass123!",
  "role": "merchant"
}
```

**Login**
```bash
POST /api/auth/login/
Content-Type: application/json

{
  "email_or_phone": "jean@example.com",
  "password": "SecurePass123!"
}

# Réponse contient 'access' token à utiliser pour les autres requêtes
```

**Récupérer infos utilisateur**
```bash
GET /api/auth/me/
Authorization: Bearer {access_token}
```

**Rafraîchir le token**
```bash
POST /api/auth/refresh/
Content-Type: application/json

{
  "refresh": "{refresh_token}"
}
```

#### 2. Portefeuille

**Récupérer le portefeuille**
```bash
GET /api/wallet/
Authorization: Bearer {access_token}
```

**Retirer du portefeuille**
```bash
POST /api/wallet/withdraw/
Authorization: Bearer {access_token}
```

#### 3. Transactions

**Créer une transaction**
```bash
POST /api/transactions/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "montantAchat": 50000,
  "montantPaye": 55000,
  "fraisService": 20
}
```

**Récupérer les transactions**
```bash
GET /api/transactions/
Authorization: Bearer {access_token}
```

#### 4. QR Code

**Scanner un QR Code**
```bash
POST /api/qr/scan/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "reference": "SMART-TRANSACTIONID"
}
```

#### 5. Tableau de bord

**Récupérer les stats**
```bash
GET /api/dashboard/
Authorization: Bearer {access_token}
```

#### 6. Partenaires

**Lister les partenaires**
```bash
GET /api/partners/
Authorization: Bearer {access_token}
```

#### 7. Paiement (Fadadey)

**Initier un paiement**
```bash
POST /api/payments/initiate/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "amount": 50000,
  "currency": "XOF",
  "transactionId": "TXN-123456",
  "email": "client@example.com"
}
```

#### 8. Administration (admin only)

**Lister tous les utilisateurs**
```bash
GET /api/admin/users/
Authorization: Bearer {admin_token}
```

**Lister toutes les transactions**
```bash
GET /api/admin/transactions/
Authorization: Bearer {admin_token}
```

**Récupérer les rapports de fraude**
```bash
GET /api/admin/fraud/
Authorization: Bearer {admin_token}
```

**Récupérer les commissions**
```bash
GET /api/admin/commissions/
Authorization: Bearer {admin_token}
```

## Dépannage

### Erreur: "disk I/O error"
- Vérifiez que PostgreSQL est bien en cours d'exécution
- Redémarrez PostgreSQL
- Vérifiez les permissions de fichier

### Erreur: "connection refused"
- Assurez-vous que PostgreSQL écoute sur localhost:5432
- Vérifiez les paramètres POSTGRES_* dans les variables d'environnement

### Erreur: "permission denied"
- Vérifiez que l'utilisateur PostgreSQL a les bonnes permissions
- Relancez: `GRANT ALL PRIVILEGES ON DATABASE smartchange_db TO smartchange_user;`

## Tester avec cURL ou Postman

Utilisez les exemples d'endpoints ci-dessus avec votre client HTTP préféré.

## Notes importantes

- Tous les endpoints excepté `/api/auth/register/` et `/api/auth/login/` nécessitent un Bearer token
- Les tokens d'accès expirent après 24h (par défaut)
- Les tokens de rafraîchissement expirent après 30 jours (par défaut)
- Utilisez toujours HTTPS en production
- Ne commitez jamais les variables d'environnement sensibles
