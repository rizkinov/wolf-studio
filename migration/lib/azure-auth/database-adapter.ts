/**
 * Custom Database Adapter for NextAuth.js
 *
 * Connects NextAuth to your PostgreSQL database for user management
 */

import { Adapter } from 'next-auth/adapters';
import { Pool } from 'pg';

export interface PostgresAdapterConfig {
  connectionString: string;
}

export function PostgresAdapter(config: PostgresAdapterConfig): Adapter {
  const pool = new Pool({
    connectionString: config.connectionString,
    ssl: { rejectUnauthorized: false }, // Required for Azure PostgreSQL
  });

  return {
    async createUser(user) {
      const { rows } = await pool.query(
        `INSERT INTO user_profiles (email, full_name, role, created_at, updated_at)
         VALUES ($1, $2, $3, NOW(), NOW())
         RETURNING id, email, full_name as name, role, created_at as "emailVerified"`,
        [user.email, user.name, 'user']
      );

      return {
        id: rows[0].id,
        email: rows[0].email,
        name: rows[0].name,
        emailVerified: rows[0].emailVerified,
        role: rows[0].role,
      };
    },

    async getUser(id) {
      const { rows } = await pool.query(
        `SELECT id, email, full_name as name, role, created_at as "emailVerified"
         FROM user_profiles
         WHERE id = $1`,
        [id]
      );

      return rows[0] || null;
    },

    async getUserByEmail(email) {
      const { rows } = await pool.query(
        `SELECT id, email, full_name as name, role, created_at as "emailVerified"
         FROM user_profiles
         WHERE email = $1`,
        [email]
      );

      return rows[0] || null;
    },

    async getUserByAccount({ providerAccountId, provider }) {
      const { rows } = await pool.query(
        `SELECT u.id, u.email, u.full_name as name, u.role, u.created_at as "emailVerified"
         FROM user_profiles u
         JOIN accounts a ON u.id = a.user_id
         WHERE a.provider = $1 AND a.provider_account_id = $2`,
        [provider, providerAccountId]
      );

      return rows[0] || null;
    },

    async updateUser(user) {
      const { rows } = await pool.query(
        `UPDATE user_profiles
         SET email = $1, full_name = $2, updated_at = NOW()
         WHERE id = $3
         RETURNING id, email, full_name as name, role, created_at as "emailVerified"`,
        [user.email, user.name, user.id]
      );

      return rows[0];
    },

    async deleteUser(userId) {
      await pool.query(`DELETE FROM user_profiles WHERE id = $1`, [userId]);
    },

    async linkAccount(account) {
      await pool.query(
        `INSERT INTO accounts (user_id, provider, provider_account_id, access_token, refresh_token, expires_at, token_type, scope)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          account.userId,
          account.provider,
          account.providerAccountId,
          account.access_token,
          account.refresh_token,
          account.expires_at,
          account.token_type,
          account.scope,
        ]
      );

      return account;
    },

    async unlinkAccount({ providerAccountId, provider }) {
      await pool.query(
        `DELETE FROM accounts WHERE provider = $1 AND provider_account_id = $2`,
        [provider, providerAccountId]
      );
    },

    async createSession({ sessionToken, userId, expires }) {
      await pool.query(
        `INSERT INTO sessions (session_token, user_id, expires)
         VALUES ($1, $2, $3)`,
        [sessionToken, userId, expires]
      );

      return { sessionToken, userId, expires };
    },

    async getSessionAndUser(sessionToken) {
      const { rows } = await pool.query(
        `SELECT s.session_token, s.user_id, s.expires, u.id, u.email, u.full_name as name, u.role, u.created_at as "emailVerified"
         FROM sessions s
         JOIN user_profiles u ON s.user_id = u.id
         WHERE s.session_token = $1`,
        [sessionToken]
      );

      if (!rows[0]) return null;

      return {
        session: {
          sessionToken: rows[0].session_token,
          userId: rows[0].user_id,
          expires: rows[0].expires,
        },
        user: {
          id: rows[0].id,
          email: rows[0].email,
          name: rows[0].name,
          emailVerified: rows[0].emailVerified,
          role: rows[0].role,
        },
      };
    },

    async updateSession({ sessionToken }) {
      const { rows } = await pool.query(
        `UPDATE sessions
         SET expires = NOW() + INTERVAL '30 days'
         WHERE session_token = $1
         RETURNING session_token, user_id, expires`,
        [sessionToken]
      );

      return rows[0] || null;
    },

    async deleteSession(sessionToken) {
      await pool.query(`DELETE FROM sessions WHERE session_token = $1`, [sessionToken]);
    },

    async createVerificationToken({ identifier, expires, token }) {
      await pool.query(
        `INSERT INTO verification_tokens (identifier, token, expires)
         VALUES ($1, $2, $3)`,
        [identifier, token, expires]
      );

      return { identifier, token, expires };
    },

    async useVerificationToken({ identifier, token }) {
      const { rows } = await pool.query(
        `DELETE FROM verification_tokens
         WHERE identifier = $1 AND token = $2
         RETURNING identifier, token, expires`,
        [identifier, token]
      );

      return rows[0] || null;
    },
  };
}

/**
 * SQL Schema for NextAuth tables
 *
 * Run this in your PostgreSQL database:
 */
export const nextAuthSchema = `
-- Accounts table (for OAuth providers like Azure AD B2C)
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  provider VARCHAR(255) NOT NULL,
  provider_account_id VARCHAR(255) NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  expires_at BIGINT,
  token_type VARCHAR(255),
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(provider, provider_account_id)
);

CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token VARCHAR(255) UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  expires TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_session_token ON sessions(session_token);

-- Verification tokens table (for email verification, password reset)
CREATE TABLE IF NOT EXISTS verification_tokens (
  identifier VARCHAR(255) NOT NULL,
  token VARCHAR(255) NOT NULL,
  expires TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (identifier, token)
);

-- Add password hash column to user_profiles if using credentials provider
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
`;
