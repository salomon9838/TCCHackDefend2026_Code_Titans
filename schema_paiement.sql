-- ============================================================
-- SMARTCHARGEAI - POSTGRESQL
-- ============================================================

CREATE DATABASE  IF NOT EXISTS smartchargeai;
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE user_role AS ENUM (
    'admin',
    'merchant_partner',
    'customer'
);

CREATE TYPE user_status AS ENUM (
    'actif',
    'inactif',
    'suspendu'
);

CREATE TYPE merchant_type AS ENUM (
    'merchant',
    'partner_shop'
);

CREATE TYPE wallet_status AS ENUM (
    'actif',
    'gele',
    'ferme'
);

CREATE TYPE transaction_status AS ENUM (
    'en_attente',
    'validee',
    'remboursee',
    'annulee',
    'expiree'
);

CREATE TYPE commission_type AS ENUM (
    'service',
    'plateforme',
    'partenaire'
);

CREATE TYPE notification_type AS ENUM (
    'sms',
    'push',
    'email'
);

CREATE TYPE notification_status AS ENUM (
    'envoyee',
    'echouee',
    'en_attente'
);

-- ============================================================
-- TRIGGER FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- USERS
-- ============================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,

    telephone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,

    mot_de_passe VARCHAR(255) NOT NULL,

    role user_role NOT NULL,

    statut user_status NOT NULL DEFAULT 'actif',

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- MERCHANT PARTNERS
-- ============================================================

CREATE TABLE merchant_partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    nom_boutique VARCHAR(150) NOT NULL,
    adresse VARCHAR(255) NOT NULL,

    latitude NUMERIC(10,7),
    longitude NUMERIC(10,7),

    type merchant_type NOT NULL,

    statut user_status NOT NULL DEFAULT 'actif',

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- CUSTOMERS
-- ============================================================

CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID UNIQUE NOT NULL REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    qr_personnel VARCHAR(512),

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- WALLETS
-- ============================================================

CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID UNIQUE NOT NULL REFERENCES users(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    balance NUMERIC(15,2) NOT NULL DEFAULT 0,

    statut wallet_status NOT NULL DEFAULT 'actif',

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_wallet_balance
        CHECK(balance >= 0)
);

-- ============================================================
-- TRANSACTIONS
-- ============================================================

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    customer_id UUID NOT NULL REFERENCES customers(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    merchant_partner_id UUID NOT NULL REFERENCES merchant_partners(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    montant_achat NUMERIC(15,2) NOT NULL,
    montant_paye NUMERIC(15,2) NOT NULL,

    monnaie_a_rendre NUMERIC(15,2) NOT NULL DEFAULT 0,

    frais_service NUMERIC(15,2) NOT NULL DEFAULT 0,

    statut transaction_status NOT NULL DEFAULT 'en_attente',

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_tx_montant_achat
        CHECK (montant_achat > 0),

    CONSTRAINT chk_tx_montant_paye
        CHECK (montant_paye >= 0),

    CONSTRAINT chk_tx_monnaie_rendre
        CHECK (monnaie_a_rendre >= 0),

    CONSTRAINT chk_tx_frais_service
        CHECK (frais_service >= 0)
);

-- ============================================================
-- QR TRANSACTIONS
-- ============================================================

CREATE TABLE qr_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    transaction_id UUID UNIQUE NOT NULL REFERENCES transactions(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    qr_code TEXT NOT NULL,

    expiration_date TIMESTAMP NOT NULL,

    is_used BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- COMMISSION HISTORIES
-- ============================================================

CREATE TABLE commission_histories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    transaction_id UUID NOT NULL REFERENCES transactions(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    montant_commission NUMERIC(15,2) NOT NULL,

    type_commission commission_type NOT NULL,

    date_commission TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_commission_montant
        CHECK (montant_commission >= 0)
);

-- ============================================================
-- FRAUD REPORTS
-- ============================================================

CREATE TABLE fraud_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    transaction_id UUID UNIQUE NOT NULL REFERENCES transactions(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    score_risque SMALLINT NOT NULL DEFAULT 0,

    type_fraude VARCHAR(100) NOT NULL,

    description TEXT,

    date_detection TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_fraud_score
        CHECK(score_risque BETWEEN 0 AND 100)
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    message TEXT NOT NULL,

    type notification_type NOT NULL,

    statut notification_status NOT NULL DEFAULT 'en_attente',

    date_envoi TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_statut ON users(statut);

CREATE INDEX idx_mp_type ON merchant_partners(type);
CREATE INDEX idx_mp_statut ON merchant_partners(statut);

CREATE INDEX idx_tx_customer ON transactions(customer_id);
CREATE INDEX idx_tx_merchant_partner ON transactions(merchant_partner_id);
CREATE INDEX idx_tx_statut ON transactions(statut);
CREATE INDEX idx_tx_created_at ON transactions(created_at);

CREATE INDEX idx_qr_is_used ON qr_transactions(is_used);
CREATE INDEX idx_qr_expiration_date ON qr_transactions(expiration_date);

CREATE INDEX idx_commission_transaction ON commission_histories(transaction_id);
CREATE INDEX idx_commission_type ON commission_histories(type_commission);

CREATE INDEX idx_fraud_score ON fraud_reports(score_risque);
CREATE INDEX idx_fraud_type ON fraud_reports(type_fraude);

CREATE INDEX idx_notif_user ON notifications(user_id);
CREATE INDEX idx_notif_statut ON notifications(statut);
CREATE INDEX idx_notif_type ON notifications(type);

-- ============================================================
-- TRIGGERS UPDATED_AT
-- ============================================================

CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trg_wallets_updated_at
BEFORE UPDATE ON wallets
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trg_transactions_updated_at
BEFORE UPDATE ON transactions
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trg_merchant_partners_updated_at
BEFORE UPDATE ON merchant_partners
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();