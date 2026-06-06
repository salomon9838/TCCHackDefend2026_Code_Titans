# 🔄 FLUX DE DONNÉES: BASE DE DONNÉES → DASHBOARD ADMIN

## Architecture de Récupération des Données

```
┌─────────────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                           │
│                   (smartchange_db)                               │
│  ┌──────────────┬────────────────┬─────────┬───────────────┐    │
│  │ api_user     │ api_transaction│ api_wallet│ api_commission│  │
│  │ (12 rows)    │ (2 rows)       │          │ record (6)    │   │
│  └──────────────┴────────────────┴─────────┴───────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
        ┌─────────────────────────────────────────┐
        │  Django REST Framework API Backend      │
        │  (Port 8000)                            │
        │  ┌────────────────────────────────────┐ │
        │  │ api/views.py                       │ │
        │  │                                    │ │
        │  │ • DashboardView (GET /api/dashboard/)      │ │
        │  │   └─ Agrège stats depuis DB       │ │
        │  │                                    │ │
        │  │ • AdminUsersView                  │ │
        │  │   └─ SELECT * FROM api_user       │ │
        │  │                                    │ │
        │  │ • AdminTransactionsView            │ │
        │  │   └─ SELECT * FROM api_transaction│ │
        │  │                                    │ │
        │  │ • AdminCommissionView              │ │
        │  │   └─ SELECT * FROM api_commissionrecord
        │  │                                    │ │
        │  │ • AdminFraudView                   │ │
        │  │   └─ SELECT * FROM api_fraudreport│ │
        │  └────────────────────────────────────┘ │
        │                                         │
        │  Django Serializers:                    │
        │  • DashboardSerializer                  │
        │  • UserSerializer                       │
        │  • TransactionSerializer                │
        │  • CommissionSerializer                 │
        │  • FraudReportSerializer                │
        └─────────────────────────────────────────┘
                              ↓
    ┌───────────────────────────────────────────────┐
    │   HTTP Response (JSON)                        │
    │   {                                           │
    │     "totalTransactions": 2,                   │
    │     "revenusJour": "40.00",                   │
    │     "revenusMois": "40.00",                   │
    │     "totalClients": 2,                        │
    │     "monnaieDistribuee": "5400.00",           │
    │     "monnaieRecuperee": "5000.00"             │
    │   }                                           │
    └───────────────────────────────────────────────┘
                              ↓
        ┌─────────────────────────────────────────┐
        │   Frontend React Application            │
        │   (Port 5173 / Vite)                    │
        │                                         │
        │   ┌─────────────────────────────────┐   │
        │   │ src/pages/AdminPage.tsx         │   │
        │   │                                 │   │
        │   │ useEffect(() => {               │   │
        │   │   const data = await Promise.all([
        │   │     getDashboardStats(),        │   │
        │   │     getAdminUsers(),            │   │
        │   │     getAdminTransactions(),     │   │
        │   │     getAdminFraudReports(),     │   │
        │   │     getAdminCommissions(),      │   │
        │   │   ]);                           │   │
        │   │   setStats(data[0]);            │   │
        │   │   setUsers(data[1]);            │   │
        │   │   ...                           │   │
        │   │ }, []);                         │   │
        │   └─────────────────────────────────┘   │
        │                                         │
        │   ┌─────────────────────────────────┐   │
        │   │ src/api/index.ts                │   │
        │   │                                 │   │
        │   │ async getDashboardStats() {     │   │
        │   │   return apiRequest<...>        │   │
        │   │     ('/api/dashboard/');        │   │
        │   │ }                               │   │
        │   │                                 │   │
        │   │ async getAdminUsers() {         │   │
        │   │   return apiRequest<...>        │   │
        │   │     ('/api/admin/users/');      │   │
        │   │ }                               │   │
        │   │ ...                             │   │
        │   └─────────────────────────────────┘   │
        │                                         │
        │   ┌─────────────────────────────────┐   │
        │   │ React Context & State           │   │
        │   │                                 │   │
        │   │ setStats(dashboard)             │   │
        │   │ setUsers(users)                 │   │
        │   │ setTransactions(transactions)   │   │
        │   │ setCommissions(commissions)     │   │
        │   │ setFraudReports(fraud)          │   │
        │   └─────────────────────────────────┘   │
        └─────────────────────────────────────────┘
                              ↓
            ┌──────────────────────────────────┐
            │    UI Components Rendering       │
            │                                  │
            │  ┌──────────────────────────────┐│
            │  │ Dashboard Tab                ││
            │  │ ├─ 4 Statistics Cards        ││
            │  │ ├─ Area Chart                ││
            │  │ └─ Commission Breakdown      ││
            │  └──────────────────────────────┘│
            │  ┌──────────────────────────────┐│
            │  │ Users Tab                    ││
            │  │ ├─ Table (12 rows)           ││
            │  │ └─ Edit/Delete Actions       ││
            │  └──────────────────────────────┘│
            │  ┌──────────────────────────────┐│
            │  │ Transactions Tab             ││
            │  │ ├─ Table (2 rows)            ││
            │  │ └─ Status Indicators         ││
            │  └──────────────────────────────┘│
            │  ┌──────────────────────────────┐│
            │  │ Commissions Tab              ││
            │  │ ├─ Commission Cards          ││
            │  │ ├─ Economic Model            ││
            │  │ └─ Recent History            ││
            │  └──────────────────────────────┘│
            │  ┌──────────────────────────────┐│
            │  │ Fraud Tab                    ││
            │  │ └─ Status Display            ││
            │  └──────────────────────────────┘│
            └──────────────────────────────────┘
                              ↓
                    ┌──────────────────┐
                    │  Browser Display │
                    │  (User Sees)     │
                    └──────────────────┘
```



