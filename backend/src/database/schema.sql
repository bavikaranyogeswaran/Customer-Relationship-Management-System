-- ==============================================================================
-- CRM DATABASE SCHEMA (Single Source of Truth)
-- ==============================================================================
-- This file defines the complete database schema for the CRM system.
-- To apply: npm run db:migrate
-- DO NOT create separate migration patch files. Modify this file directly.
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- USERS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS users (
    id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email                 VARCHAR(255) UNIQUE NOT NULL,
    password_hash         VARCHAR(255) NOT NULL,
    name                  VARCHAR(255) NOT NULL,
    role                  VARCHAR(50) DEFAULT 'user',
    is_active             BOOLEAN DEFAULT TRUE,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until          TIMESTAMP WITH TIME ZONE,
    created_at            TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- LEADS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS leads (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(255) NOT NULL,
    company     VARCHAR(255),
    email       VARCHAR(255),
    phone       VARCHAR(50),
    source      VARCHAR(100),
    status      VARCHAR(50) NOT NULL DEFAULT 'New',
    deal_value  DECIMAL(12, 2) DEFAULT 0,
    won_value   DECIMAL(12, 2) DEFAULT 0,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    created_by  UUID REFERENCES users(id) ON DELETE SET NULL,
    deleted_at  TIMESTAMP WITH TIME ZONE,
    version     INTEGER DEFAULT 1,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- NOTES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS notes (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content    TEXT NOT NULL,
    lead_id    UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    author_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- ==============================================================================
-- SESSIONS TABLE (Token Revocation & Management)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS sessions (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token_hash ON sessions(token_hash);
-- ==============================================================================
-- INDEXES (Performance Optimization)
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_deleted_at ON leads(deleted_at);
CREATE INDEX IF NOT EXISTS idx_notes_lead_id ON notes(lead_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE UNIQUE INDEX IF NOT EXISTS idx_leads_email_active_unique ON leads(email) WHERE deleted_at IS NULL;
