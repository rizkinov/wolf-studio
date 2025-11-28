# Database Backup Restoration Guide

## Backup File
- **File**: `backup.sql`
- **Format**: PostgreSQL plain text SQL dump
- **Source**: Supabase Production Database
- **Date**: November 24, 2025
- **Size**: 809 KB

## Restoring to Azure PostgreSQL

### Prerequisites
1. Azure PostgreSQL Flexible Server instance created
2. PostgreSQL client tools installed (already installed: PostgreSQL 18)
3. Database connection details from Azure Portal

### Step 1: Get Azure Database Connection String

From Azure Portal → Your PostgreSQL Server → Connection strings:

```
Host: your-server.postgres.database.azure.com
Port: 5432
Database: postgres (default) or your custom database name
Username: your-admin-user@your-server
Password: your-password
SSL Mode: require (mandatory for Azure)
```

Full connection string:
```
postgresql://your-admin-user:your-password@your-server.postgres.database.azure.com:5432/postgres?sslmode=require
```

### Step 2: Restore Using psql

The backup is already in SQL format, so use `psql` directly:

**Windows (using installed PostgreSQL 18):**
```bash
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -h your-server.postgres.database.azure.com -U your-admin-user -d your-database-name -f supabase/backups/backup.sql
```

**After adding PostgreSQL to PATH:**
```bash
psql -h your-server.postgres.database.azure.com -U your-admin-user -d your-database-name -f supabase/backups/backup.sql
```

**With password prompt:**
```bash
psql -h your-server.postgres.database.azure.com -U your-admin-user -d postgres -f backup.sql
# Enter password when prompted
```

**Or set password as environment variable:**
```bash
set PGPASSWORD=your-password
psql -h your-server.postgres.database.azure.com -U your-admin-user -d postgres -f backup.sql
```

### Step 3: Verify Restoration
```bash
psql -h your-server.postgres.database.azure.com \
  -U your-admin-user \
  -d your-database-name \
  -c "\dt"  # List all tables
```

### Step 4: Update Application Environment Variables

Update your Azure environment variables:
```env
DATABASE_URL=postgresql://user:password@your-server.postgres.database.azure.com:5432/database?sslmode=require
NEXT_PUBLIC_SUPABASE_URL=your-azure-endpoint
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-new-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-new-service-key
```

## What's Included in the Backup

This SQL dump contains:
- **Database Roles**: Supabase roles (anon, authenticated, authenticator, etc.)
- **Extensions**: UUID, pgcrypto, and other PostgreSQL extensions
- **Schemas**: public, auth, storage, and Supabase system schemas
- **Tables**: All your application tables (projects, categories, users, etc.)
- **Data**: Complete INSERT statements for all rows
- **RLS Policies**: Row Level Security policies
- **Functions**: Database functions and triggers
- **Indexes**: All indexes for performance

## PostgreSQL Client Tools

**Already Installed**: PostgreSQL 18 at `C:\Program Files\PostgreSQL\18\bin\`

**To add to PATH** (optional, for easier command usage):
1. Open System Properties → Environment Variables
2. Edit "Path" variable
3. Add: `C:\Program Files\PostgreSQL\18\bin`
4. Restart terminal

## ⚠️ CRITICAL: What This Migration Does and Doesn't Include

### ✅ This Migration Includes
- Database schema (tables, indexes, constraints)
- All data (projects, users, categories, etc.)
- Database functions and triggers
- RLS policies (but see warning below)

### ❌ This Migration Does NOT Include (Requires Separate Work)

**1. Authentication System**
- Supabase Auth is a separate service, not just database tables
- After migration, ALL authentication will be broken
- **Required Action**: Choose and implement new auth:
  - Option A: NextAuth.js with credentials/OAuth
  - Option B: Azure AD B2C
  - Option C: Custom JWT implementation
- **Code Changes Required**: Replace all `supabaseClient.auth.*` calls

**2. File Storage**
- All Supabase Storage URLs will be broken
- Images referenced in database will point to invalid URLs
- **Required Action**:
  - Migrate all files to Azure Blob Storage
  - Update all image URLs in database
  - Rewrite upload/download code in your app

**3. Row Level Security (RLS)**
- RLS policies will be migrated but **won't enforce** without Supabase Auth
- Policies use `auth.uid()` which doesn't exist outside Supabase
- **Required Action**:
  - Either rewrite RLS policies for your new auth
  - Or remove RLS and handle permissions in application code

**4. Realtime Subscriptions**
- All `supabase.from('table').on('INSERT')` will fail
- **Required Action**: Implement Azure SignalR or custom WebSocket

**5. Edge Functions**
- **Required Action**: Migrate to Azure Functions

## Important Notes for Azure Migration

1. **SSL Requirement**: Azure PostgreSQL **requires** SSL, always use `?sslmode=require`
2. **This is a Database-Only Migration**: You're only migrating the PostgreSQL database, not the entire Supabase platform
3. **Extensions**: Some Supabase extensions may not be available:
   - Install required extensions manually before restore
   - Azure PostgreSQL has limited extension support
4. **Roles & Permissions**: Supabase roles may fail to create on Azure:
   - You may need to edit the SQL file to remove role creation
   - Or run with `--no-owner --no-privileges` flags
5. **Row Level Security (RLS)**: RLS policies will be migrated but won't enforce without Supabase Auth
6. **Connection Pooling**: Consider using PgBouncer or Azure's built-in connection pooling

## Pre-Migration Steps (Recommended)

### 1. Review the SQL File
The backup includes Supabase-specific items that may need adjustment:

```bash
# Check for Supabase extensions
grep "CREATE EXTENSION" supabase/backups/backup.sql

# Check for Supabase roles
grep "CREATE ROLE" supabase/backups/backup.sql
```

### 2. Create Required Extensions on Azure First
Connect to your Azure PostgreSQL and create extensions:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
-- Add others as needed
```

### 3. Optionally Edit the SQL File
You may want to remove or modify:
- Lines starting with `CREATE ROLE` for Supabase system roles
- Lines with `ALTER ROLE` for system users
- Supabase-specific schemas (auth, storage, supabase_functions)

## Troubleshooting

### Error: "role does not exist"
**Solution**: Run psql with additional flags:
```bash
psql -h your-server.postgres.database.azure.com -U admin -d postgres --set ON_ERROR_STOP=off -f backup.sql
```

Or manually edit `backup.sql` to remove role-related commands.

### Error: "extension does not exist"
**Solution**: Create extensions first (see Pre-Migration Steps above), or comment out extension creation in SQL file.

### Error: "permission denied"
**Solution**: Ensure your Azure user has proper privileges:
```sql
-- Run as Azure admin user
GRANT ALL PRIVILEGES ON DATABASE your_database TO your_user;
GRANT ALL ON SCHEMA public TO your_user;
```

### Error: "schema already exists"
**Solution**: Either drop existing schemas or use:
```bash
psql ... --set ON_ERROR_STOP=off -f backup.sql  # Continue on errors
```

### Connection timeout
**Solution**: Increase timeout and use connection pooling:
```bash
psql ... --set statement_timeout=0 -f backup.sql
```

## Alternative: Using Supabase Self-Hosted on Azure

If you want to keep Supabase features, consider deploying Supabase self-hosted on Azure:
- Use Azure Container Instances or AKS
- Follow: https://supabase.com/docs/guides/self-hosting/docker

## Contact
For issues with this backup or restoration process, check the project documentation or contact the development team.
