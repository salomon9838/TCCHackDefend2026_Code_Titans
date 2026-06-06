# SmartChange AI

SmartChange AI est une application de portefeuille numérique et de gestion de transactions pour les commerçants, partenaires et clients. Elle propose un tableau de bord en temps réel, un système de paiement par QR code, un suivi des historiques de transactions et une interface d’administration sécurisée. Le projet combine backend Django REST et frontend React + Vite pour une expérience complète.

## Problématique choisie et track

Problématique: Lorsqu'un client achète un produit et remet au commerçant une somme supérieure à son prix, celui-ci doit lui rendre la monnaie. Cependant, l'insuffisance ou l'absence de monnaie engendre plusieurs difficultés, notamment des disputes entre les parties, des pertes de temps lors de la recherche de monnaie, l'abandon de l'achat par le client qui préfère récupérer son argent, ou encore l'abandon de la monnaie due par l'une des parties. Cette situation occasionne également des pertes financières pour les commerçants et perte de temps pour les clients.

## Prérequis pour le projet

- Système d'exploitation : Windows 10/11, macOS ou Linux.
- Outils :
  - Python 3.11 ou 3.12
  - Node.js 18+ (recommandé 20+)
  - npm (fourni avec Node.js)
  - Git
- Packages backend : Django 4.3+, Django REST Framework, Simple JWT.
- Base de données :Postgres('NAME_DB', 'smartchange_db'),('POSTGRES_USER', 'postgres')('POSTGRES_PASSWORD', 'sam9838*'),('POSTGRES_HOST', 'localhost'), ('POSTGRES_PORT', '5432')

## Les étapes d'installations

1. Clonez le dépôt sur votre machine :

```bash
git clone https://github.com/salomon9838/TCCHackDefend2026_Code_Titans.git 

```

2. Accédez au dossier backend :

```bash
cd frontend1/backend
```

3. Créez et activez un environnement virtuel Python :

```bash
python -m venv venv
# Windows
.\venv\Scripts\activate.bat
# macOS/Linux
# source venv/bin/activate
```

4. Installez les dépendances backend :

```bash
pip install -r requirements.txt
```

5. Appliquez les migrations Django :

```bash
python manage.py makemigrations
python manage.py migrate
```

6. Revenez au dossier racine du frontend :

```bash
cd ..\frontend1
```

7. Installez les dépendances frontend :

```bash
npm install
```

## Lancement de l'application

### Backend

1. Activez l'environnement virtuel si nécessaire :

```bash
cd frontend1/backend
venv\Scripts\activate
```

2. Lancez le serveur Django :

```bash
python manage.py runserver 8000
```

Le backend sera accessible à l'adresse : `http://127.0.0.1:8000`

### Frontend

1. Ouvrez un autre terminal.
2. Atteignez le dossier frontend :

```bash
cd frontend1/frontend1
```

3. Lancez Vite :

```bash
npm run dev
```

Le frontend sera accessible à l'adresse indiquée par Vite, généralement : `http://127.0.0.1:5173`

## Identifiants de test

L’application nécessite une authentification. Il est possible de créer un compte de démonstration via la page d’inscription. Si vous voulez tester immédiatement :

## Utilisez la page se connecter entrant ces identifiant

*Commerçant

email : samlolo

Mot de passe : sam9838*M

*Client

email : soso

Mot de passe : sam9838*M

*Paternaire

email : achille

Mot de passe : sam9838*M








## Si vous voulez utilsez un autre super-utilisateur Django :

```bash
cd frontend1/backend
venv\Scripts\activate
python manage.py createsuperuser
python manage.py runserver
```

## Membres de l'équipe

- KOUMEDJINA Salomon(chef du goupe)
- Klouvi Kokou Jean-Paul 
- Gahounzo Koffi
- BOSSOU Achille 




