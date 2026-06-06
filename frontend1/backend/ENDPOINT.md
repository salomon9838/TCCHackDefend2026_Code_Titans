# SmartChange Backend

Backend Django pour l'application SmartChange.

## Installation

1. Créez un environnement virtuel Python :

```bash
cd c:\Hackathon\frontend1\backend
python -m venv .venv
.\.venv\Scripts\activate
```

2. Installez les dépendances :

```bash
pip install -r requirements.txt
```

3. Appliquez les migrations :

```bash
python manage.py makemigrations
python manage.py migrate
```

4. Créez un super-utilisateur :

```bash
python manage.py createsuperuser
```

5. Lancez le serveur :

```bash
python manage.py runserver 8000
```

## Points clés

- API d'authentification avec JWT : `/api/auth/login/`, `/api/auth/register/`, `/api/auth/me/`
- Liste des partenaires : `/api/partners/`
- Portefeuille utilisateur : `/api/wallet/`
- Transactions : `/api/transactions/`
- Scan QR : `/api/qr/scan/`
- Statistiques : `/api/dashboard/`
- Administration : `/api/admin/users/`, `/api/admin/transactions/`, `/api/admin/fraud/`, `/api/admin/commissions/`
