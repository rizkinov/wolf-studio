# Database Migration to Azure

This guide details how to migrate the database schema and data from Supabase to Azure Database for PostgreSQL.

## Prerequisites

1.  **Azure Database for PostgreSQL**: You should have a PostgreSQL instance running on Azure.
2.  **PostgreSQL Client**: `psql` or a GUI tool like pgAdmin or DBeaver.
3.  **Database Credentials**: Host, Port, User, Password, and Database Name for your Azure instance.

## Migration Steps

### 1. Prepare the Azure Database

Supabase uses specific roles (`anon`, `authenticated`, `service_role`) for Row Level Security (RLS). If you intend to keep using these policies (even if managing auth via NextAuth.js), you should create these roles in your Azure database.

Run the following SQL in your Azure database:

```sql
-- Create Supabase-compatible roles
CREATE ROLE anon NOLOGIN;
CREATE ROLE authenticated NOLOGIN;
CREATE ROLE service_role NOLOGIN;
CREATE ROLE supabase_auth_admin NOLOGIN;
CREATE ROLE authenticator NOINHERIT LOGIN PASSWORD 'your-secure-password';

-- Grant permissions
GRANT anon TO authenticator;
GRANT authenticated TO authenticator;
GRANT service_role TO authenticator;
GRANT supabase_auth_admin TO authenticator;

-- Allow these roles to use the public schema
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;
```

### 2. Restore the Public Schema

We have prepared a filtered SQL dump that contains only the `public` schema (application data) and excludes Supabase system schemas (`auth`, `storage`, `realtime`, etc.) to avoid conflicts.

The file is located at: `supabase/backups/public_schema.sql`

To restore this to your Azure database, use `psql`:

```bash
psql -h <your-azure-host> -p 5432 -U <your-username> -d <your-database-name> -f supabase/backups/public_schema.sql
```

**Note:**
*   This script enables `uuid-ossp` and `pgcrypto` extensions. Ensure your Azure Postgres user has permissions to create extensions.
*   Foreign key constraints referencing `auth.users` (Supabase Auth) have been removed because the `auth` schema is not being migrated. You will need to manage user relationships using the new authentication system (NextAuth.js + Azure AD).

### 3. Verify the Migration

Connect to your Azure database and verify that the tables exist and contain data:

```sql
SELECT count(*) FROM public.projects;
SELECT count(*) FROM public.project_images;
```

### 4. Update Application Configuration

Update your `.env` (or `.env.production`) file to point to the new Azure database:

```env
# Update DATABASE_URL to your Azure PostgreSQL connection string
DATABASE_URL="postgresql://<user>:<password>@<host>:5432/<database>?sslmode=require"
```

## Next Steps

*   **Prisma Setup**: If you are adopting Prisma with NextAuth.js, run `npx prisma db pull` to introspect this schema and generate your `schema.prisma` file.
*   **Authentication**: Follow `docs/AZURE_AUTH_MIGRATION.md` to set up NextAuth.js with Azure AD.
