# Wolf Studio - Complete Azure Migration Guide

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Migration Steps](#migration-steps)
4. [Post-Migration Tasks](#post-migration-tasks)
5. [Rollback Procedures](#rollback-procedures)
6. [Troubleshooting](#troubleshooting)

## Overview

This guide walks you through migrating Wolf Studio from Supabase to Azure infrastructure.

### What's Being Migrated

- ✅ **Database**: PostgreSQL database with all schemas, data, and RLS policies
- ✅ **Storage**: All images and files from Supabase Storage to Azure Blob Storage
- ✅ **Authentication**: From Supabase Auth to NextAuth.js with Azure AD B2C
- ✅ **Application Code**: Updated to use Azure services

### Timeline Estimate

- **Preparation**: 2-4 hours
- **Migration Execution**: 1-2 hours
- **Testing & Validation**: 2-3 hours
- **Production Deployment**: 1 hour
- **Total**: 6-10 hours

## Prerequisites

### Azure Services Setup

#### 1. Azure PostgreSQL Flexible Server

```bash
# Create resource group
az group create --name wolf-studio-rg --location eastus

# Create PostgreSQL server
az postgres flexible-server create \
  --name wolf-studio-db \
  --resource-group wolf-studio-rg \
  --location eastus \
  --admin-user adminuser \
  --admin-password <secure-password> \
  --sku-name Standard_B1ms \
  --version 14 \
  --storage-size 32

# Configure firewall (allow your IP)
az postgres flexible-server firewall-rule create \
  --name wolf-studio-db \
  --resource-group wolf-studio-rg \
  --rule-name AllowMyIP \
  --start-ip-address <your-ip> \
  --end-ip-address <your-ip>

# Enable SSL
az postgres flexible-server parameter set \
  --name wolf-studio-db \
  --resource-group wolf-studio-rg \
  --name require_secure_transport \
  --value ON
```

#### 2. Azure Blob Storage

```bash
# Create storage account
az storage account create \
  --name wolfstudiostorage \
  --resource-group wolf-studio-rg \
  --location eastus \
  --sku Standard_LRS \
  --kind StorageV2

# Create blob container
az storage container create \
  --name project-images \
  --account-name wolfstudiostorage \
  --public-access blob
```

#### 3. Azure AD B2C Tenant

1. Go to Azure Portal → Create a resource → Azure AD B2C
2. Create new tenant: `wolfstudio.onmicrosoft.com`
3. Create user flow:
   - Name: `B2C_1_signupsignin`
   - Type: Sign up and sign in
   - Identity providers: Email signup
   - User attributes: Email, Display Name
4. Register application:
   - Name: Wolf Studio Web App
   - Redirect URI: `https://your-app-url/api/auth/callback/azure-ad-b2c`
   - Copy Client ID and create Client Secret

### Local Development Tools

- Node.js 18+ (`node --version`)
- PostgreSQL client (`psql --version`)
- npm (`npm --version`)

### Required Files

- `supabase/backups/backup.sql` - Database backup (completed ✓)
- `.env.azure` - Azure environment variables

## Migration Steps

### Step 1: Environment Setup

1. **Copy environment template**:

```bash
cp migration/config/.env.azure.template .env.azure
```

2. **Fill in Azure credentials**:

Edit `.env.azure` with your values from Azure Portal.

3. **Install migration dependencies**:

```bash
cd migration
npm install
cd ..
```

### Step 2: Validate Environment

Run the validation script to ensure everything is configured:

```bash
node migration/scripts/1-validate-environment.js
```

**Expected output**: All checks should pass ✓

**If validation fails**: Review error messages and fix configuration issues.

### Step 3: Migrate Database

This will:
- Create backup of existing Azure database (if any)
- Prepare SQL file for Azure compatibility
- Execute migration
- Verify table creation and data import

```bash
node migration/scripts/2-migrate-database.js
```

**Duration**: 5-10 minutes

**What to watch for**:
- ✓ Connection successful
- ✓ Backup created (if existing database)
- ⚠ Some errors are expected (roles, extensions)
- ✓ Verification shows record counts

**Logs saved to**: `migration/logs/migration-*.log`

### Step 4: Download Storage Files

Download all images from Supabase Storage:

```bash
node migration/scripts/3-download-storage-files.js
```

**Duration**: 10-30 minutes (depending on file count and size)

**Download location**: `migration/downloads/supabase-storage/`

**What to watch for**:
- File count matches expectations
- No critical download failures
- Manifest file created

### Step 5: Upload to Azure Blob Storage

Upload files to Azure:

```bash
node migration/scripts/4-upload-to-azure-blob.js
```

**Duration**: 10-30 minutes

**What to watch for**:
- Upload progress
- No authentication errors
- Files accessible in Azure Portal

**Verify in Azure Portal**:
1. Go to Storage Account → Containers → project-images
2. Check that folders and files are present

### Step 6: Update Database URLs

Replace Supabase URLs with Azure Blob URLs:

```bash
node migration/scripts/5-update-database-urls.js
```

**Duration**: 1-2 minutes

**What happens**:
- Creates backup before updates
- Replaces all Supabase storage URLs
- Verifies no Supabase URLs remain

### Step 7: Verify Migration

Run comprehensive verification:

```bash
node migration/scripts/6-verify-migration.js
```

**Expected results**:
- ✓ Database schema valid
- ✓ Data present
- ✓ URLs migrated
- ✓ Images accessible

**Report saved to**: `migration/reports/migration-verification-report.json`

## Post-Migration Tasks

### 1. Update Application Code

#### A. Replace Supabase Storage with Azure Blob

**Install dependency**:
```bash
npm install @azure/storage-blob
```

**Create storage client** (`lib/storage/azure-client.ts`):
```typescript
import { createStorageAdapter, getStorageConfigFromEnv } from '@/migration/lib/azure-storage/storage-adapter';

const config = getStorageConfigFromEnv();
export const storage = createStorageAdapter(config);
```

**Update imports** throughout codebase:
```typescript
// Before
import { supabase } from '@/lib/supabase/client';
await supabase.storage.from('project-images').upload(path, file);

// After
import { storage } from '@/lib/storage/azure-client';
await storage.upload(path, file);
```

#### B. Replace Supabase Auth with NextAuth.js

**Install dependencies**:
```bash
npm install next-auth @next-auth/pg-adapter pg
```

**Create auth route** (`app/api/auth/[...nextauth]/route.ts`):
```typescript
import NextAuth from 'next-auth';
import { authOptions } from '@/migration/lib/azure-auth/auth-options';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
```

**Update auth context** (`lib/auth/context.tsx`):
```typescript
'use client';

import { SessionProvider } from 'next-auth/react';
import { Session } from 'next-auth';

export function AuthProvider({
  children,
  session
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  return <SessionProvider session={session}>{children}</SessionProvider>;
}
```

**Update middleware** (`middleware.ts`):
```typescript
import { withAuth } from 'next-auth/middleware';

export default withAuth({
  callbacks: {
    authorized({ req, token }) {
      // Check if user is authenticated
      if (req.nextUrl.pathname.startsWith('/admin')) {
        return token?.role === 'admin';
      }
      return !!token;
    },
  },
});

export const config = {
  matcher: ['/admin/:path*'],
};
```

### 2. Deploy to Azure

#### Option A: Azure Static Web Apps

```bash
# Install Azure Static Web Apps CLI
npm install -g @azure/static-web-apps-cli

# Build application
npm run build

# Deploy
swa deploy --app-location .next --output-location .next
```

#### Option B: Azure App Service

```bash
# Create App Service
az webapp create \
  --name wolf-studio-app \
  --resource-group wolf-studio-rg \
  --plan wolf-studio-plan \
  --runtime "NODE:18-lts"

# Configure environment variables
az webapp config appsettings set \
  --name wolf-studio-app \
  --resource-group wolf-studio-rg \
  --settings @.env.azure

# Deploy
az webapp deployment source config-zip \
  --name wolf-studio-app \
  --resource-group wolf-studio-rg \
  --src dist.zip
```

### 3. Update Environment Variables in Production

Set all variables from `.env.azure` in Azure Portal:

1. Go to App Service → Configuration → Application settings
2. Add each environment variable
3. Save and restart application

### 4. Update DNS

Point your domain to Azure:

1. Get App Service URL or Static Web App URL
2. Update DNS A/CNAME records to point to Azure
3. Wait for DNS propagation (up to 48 hours)

### 5. Test Production Application

✅ **Authentication**:
- [ ] Login with Azure AD B2C
- [ ] Login with email/password
- [ ] Logout
- [ ] Session persistence

✅ **File Upload**:
- [ ] Upload new image
- [ ] View uploaded image
- [ ] Delete image

✅ **Database Operations**:
- [ ] Create project
- [ ] Edit project
- [ ] Delete project
- [ ] View projects list

✅ **Performance**:
- [ ] Page load times acceptable
- [ ] Images load quickly
- [ ] No console errors

## Rollback Procedures

### If migration fails during database step:

```bash
# Restore from backup
psql "postgresql://..." -f migration/backups/azure-backup-*.sql
```

### If migration fails after completion:

1. **Keep Supabase running** for 30 days as fallback
2. **Switch DNS back** to Supabase URL
3. **Restore database** from Supabase backup
4. **Investigate issues** and retry migration

### Emergency rollback checklist:

- [ ] DNS pointed back to Supabase
- [ ] Database restored from backup
- [ ] Application code reverted to pre-migration state
- [ ] Verify application is functional
- [ ] Communicate status to users

## Troubleshooting

### Database migration fails with "role does not exist"

**Solution**: This is expected. The script continues despite these errors. Verify that data was imported correctly using the verification script.

### Storage upload fails with authentication error

**Solution**:
1. Verify `AZURE_STORAGE_CONNECTION_STRING` is correct
2. Check Storage Account access keys in Azure Portal
3. Ensure container has correct permissions (blob access)

### Images not loading after URL update

**Solution**:
1. Check Azure Blob container has public read access
2. Verify CORS settings in Azure Storage
3. Test image URL directly in browser
4. Check browser console for CORS errors

### NextAuth authentication not working

**Solution**:
1. Verify `NEXTAUTH_SECRET` is set
2. Check `NEXTAUTH_URL` matches your application URL
3. Verify Azure AD B2C redirect URIs include your callback URL
4. Check that database adapter tables exist

### Application fails to start in Azure

**Solution**:
1. Check Application Insights logs
2. Verify all environment variables are set
3. Check Node.js version compatibility
4. Review build logs for errors

## Support

For issues during migration:

1. Check migration logs in `migration/logs/`
2. Review verification report in `migration/reports/`
3. Consult Azure Portal for service health
4. Review NextAuth.js documentation: https://next-auth.js.org/
5. Review Azure documentation: https://docs.microsoft.com/azure/

## Success Checklist

After migration, verify all items:

- [ ] Database migration completed without critical errors
- [ ] All storage files uploaded to Azure Blob
- [ ] Database URLs updated to Azure Blob URLs
- [ ] Images load correctly in application
- [ ] Authentication works (login/logout)
- [ ] Admin panel accessible
- [ ] Projects can be created/edited/deleted
- [ ] Image uploads work
- [ ] Application deployed to Azure
- [ ] DNS updated and propagated
- [ ] SSL certificate active
- [ ] Performance acceptable
- [ ] No console errors
- [ ] Monitoring enabled
- [ ] Backup strategy in place

🎉 **Congratulations! Your migration is complete.**
