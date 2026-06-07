# RÉSUMÉ DES ENDPOINTS API (SmartChange)

Tous les endpoints sont préfixés par `/api/`

---

## AUTHENTIFICATION
| URL                      | Méthode | Description                          |
|--------------------------|---------|--------------------------------------|
| `auth/register/`         | POST    | Inscription d'un nouveau compte      |
| `auth/login/`            | POST    | Connexion (récupération des tokens)  |
| `auth/me/`               | GET     | Récupérer les infos de l'utilisateur connecté |
| `auth/refresh/`          | POST    | Rafraîchir le token d'accès          |

---

## UTILISATEURS
| URL                      | Méthode | Description                          |
|--------------------------|---------|--------------------------------------|
| `users/me/`              | GET/PUT | Voir/Modifier son profil             |
| `customers/`             | GET     | Liste des clients (pour commerçant)  |
| `partners/`              | GET     | Liste des partenaires                |

---

## PORTEFEUILLES
| URL                      | Méthode | Description                          |
|--------------------------|---------|--------------------------------------|
| `wallet/`                | GET     | Voir son solde                       |
| `wallet/recharge/`       | POST    | Initier une recharge du portefeuille |
| `wallet/withdraw/`       | POST    | Demander un retrait                  |

---

## TRANSACTIONS
| URL                      | Méthode | Description                          |
|--------------------------|---------|--------------------------------------|
| `transactions/`          | GET/POST| Voir/Créer une transaction           |
| `transactions/<id>/validate/` | PATCH | Valider une transaction en attente   |
| `qr/scan/`               | POST    | Scanner un QR Code pour valider      |

---

## DEMANDES DE SERVICES PARTENAIRES
| URL                      | Méthode | Description                          |
|--------------------------|---------|--------------------------------------|
| `partner-requests/`      | GET/POST| Voir/Créer une demande               |
| `partner-requests/<id>/accept/` | PATCH | Accepter une demande (partenaire)    |
| `partner-requests/<id>/complete/` | PATCH | Compléter une demande (partenaire) |

---

## GÉOLOCALISATION
| URL                      | Méthode | Description                          |
|--------------------------|---------|--------------------------------------|
| `locations/`             | GET/POST| Voir/Ajouter un emplacement          |
| `locations/nearby/`      | GET     | Trouver les emplacements à proximité |

---

## DASHBOARD
| URL                      | Méthode | Description                          |
|--------------------------|---------|--------------------------------------|
| `dashboard/`             | GET     | Récupérer les stats du tableau de bord |
