# Wolf Studio - Azure Migration Toolkit

Complete toolkit for migrating Wolf Studio from Supabase to Azure infrastructure.

## Quick Start

### 1. Install Dependencies

```bash
cd migration
npm install
cd ..
```

### 2. Configure Environment

```bash
# Copy template
cp migration/config/.env.azure.template .env.azure

# Edit .env.azure with your Azure credentials
nano .env.azure
```

### 3. Run Migration

```bash
# Validate setup
node migration/scripts/1-validate-environment.js

# Run complete migration
cd migration
npm run migrate-all
```

## What's Included

### 📁 Directory Structure

```
migration/
├── scripts/               # Migration scripts (run in order)
│   ├── 1-validate-environment.js
│   ├── 2-migrate-database.js
│   ├── 3-download-storage-files.js
│   ├── 4-upload-to-azure-blob.js
│   ├── 5-update-database-urls.js
│   └── 6-verify-migration.js
├── lib/                   # Azure adapter libraries
│   ├── azure-storage/     # Azure Blob Storage adapter
│   └── azure-auth/        # NextAuth.js Azure AD B2C setup
├── docs/                  # Complete documentation
│   └── AZURE-MIGRATION-GUIDE.md
├── config/                # Configuration templates
│   └── .env.azure.template
├── package.json           # Migration dependencies
└── README.md             # This file
```

### 🛠️ Scripts Overview

| Script | Purpose | Duration |
|--------|---------|----------|
| 1-validate-environment.js | Check Azure setup | < 1 min |
| 2-migrate-database.js | Migrate PostgreSQL database | 5-10 min |
| 3-download-storage-files.js | Download from Supabase Storage | 10-30 min |
| 4-upload-to-azure-blob.js | Upload to Azure Blob Storage | 10-30 min |
| 5-update-database-urls.js | Update URLs in database | 1-2 min |
| 6-verify-migration.js | Comprehensive verification | 2-3 min |

### 📚 Libraries Provided

#### Azure Blob Storage Adapter

Drop-in replacement for Supabase Storage with identical API.

**Location**: `migration/lib/azure-storage/`

**Documentation**: `migration/lib/azure-storage/README.md`

**Usage**:
```typescript
import { storage } from '@/lib/storage/azure-client';

// Upload
await storage.upload('path/file.jpg', file);

// Get URL
const url = storage.getPublicUrl('path/file.jpg');

// List files
const { data } = await storage.list('path/');
```

#### NextAuth.js + Azure AD B2C

Complete authentication setup replacing Supabase Auth.

**Location**: `migration/lib/azure-auth/`

**Features**:
- Azure AD B2C OAuth integration
- Credentials provider (email/password)
- PostgreSQL session storage
- Role-based access control

## Step-by-Step Migration

### Prerequisites

1. **Azure Services Created**:
   - ✅ PostgreSQL Flexible Server
   - ✅ Storage Account with Blob container
   - ✅ Azure AD B2C tenant with app registration

2. **Local Tools Installed**:
   - ✅ Node.js 18+
   - ✅ PostgreSQL client (psql)
   - ✅ npm

3. **Files Ready**:
   - ✅ `supabase/backups/backup.sql` (database backup)
   - ✅ `.env.azure` (Azure credentials)

### Step 1: Validation

```bash
node migration/scripts/1-validate-environment.js
```

**Checks**:
- ✓ Required tools installed
- ✓ Environment variables set
- ✓ Azure PostgreSQL connection
- ✓ Azure Blob Storage setup
- ✓ Backup files exist

### Step 2: Database Migration

```bash
node migration/scripts/2-migrate-database.js
```

**What happens**:
1. Tests Azure PostgreSQL connection
2. Creates backup of existing database (if any)
3. Prepares SQL file for Azure compatibility
4. Executes migration (with 5-second warning)
5. Verifies table creation and data import

**Output**:
- Modified SQL: `migration/backups/backup-azure-ready.sql`
- Execution log: `migration/logs/migration-*.log`
- Backup (if existed): `migration/backups/azure-backup-*.sql`

### Step 3: Download Storage

```bash
node migration/scripts/3-download-storage-files.js
```

**What happens**:
1. Connects to Supabase Storage
2. Lists all files in each bucket
3. Downloads files preserving folder structure
4. Creates manifest of downloaded files

**Output**:
- Downloaded files: `migration/downloads/supabase-storage/`
- Manifest: `migration/downloads/supabase-storage/download-manifest.json`

### Step 4: Upload to Azure

```bash
node migration/scripts/4-upload-to-azure-blob.js
```

**What happens**:
1. Connects to Azure Blob Storage
2. Creates container if needed
3. Uploads files with correct MIME types
4. Skips files that already exist
5. Creates upload manifest

**Output**:
- Files in Azure Blob container
- Manifest: `migration/uploads/upload-manifest.json`

### Step 5: Update URLs

```bash
node migration/scripts/5-update-database-urls.js
```

**What happens**:
1. Creates database backup before updates
2. Replaces Supabase URLs with Azure Blob URLs
3. Updates `project_images.image_url`
4. Updates `projects.banner_image`
5. Verifies no Supabase URLs remain

**Output**:
- Backup: `migration/backups/pre-url-update-*.sql`
- Report: `migration/reports/url-update-report.json`

### Step 6: Verification

```bash
node migration/scripts/6-verify-migration.js
```

**Verifies**:
- ✓ Database schema exists
- ✓ Data is present
- ✓ URLs point to Azure
- ✓ Images are accessible
- ✓ RLS policies exist

**Output**:
- Report: `migration/reports/migration-verification-report.json`
- Exit code: 0 (success), 1 (failed), 2 (partial)

## npm Scripts

Run from `migration/` directory:

```bash
# Individual steps
npm run validate           # Step 1: Validate environment
npm run migrate-db         # Step 2: Migrate database
npm run download-storage   # Step 3: Download from Supabase
npm run upload-storage     # Step 4: Upload to Azure
npm run update-urls        # Step 5: Update database URLs
npm run verify             # Step 6: Verify migration

# Run all steps
npm run migrate-all        # Runs steps 1-6 sequentially
```

## Post-Migration Checklist

After migration scripts complete:

### 1. Update Application Code

- [ ] Replace Supabase Storage with Azure Blob adapter
- [ ] Replace Supabase Auth with NextAuth.js
- [ ] Update environment variables
- [ ] Test locally

### 2. Deploy to Azure

- [ ] Choose deployment method (Static Web Apps or App Service)
- [ ] Configure environment variables in Azure
- [ ] Deploy application
- [ ] Test in production

### 3. Cutover

- [ ] Update DNS to point to Azure
- [ ] Monitor error logs
- [ ] Verify all features work
- [ ] Keep Supabase as backup for 30 days

## Troubleshooting

### Script fails with "command not found"

**Solution**: Install required tool (Node.js, psql, npm)

### Database connection fails

**Solution**:
1. Check firewall rules allow your IP
2. Verify credentials in `.env.azure`
3. Ensure SSL is enabled

### Storage upload fails

**Solution**:
1. Verify `AZURE_STORAGE_CONNECTION_STRING` is correct
2. Check container exists and has public access
3. Review Azure Portal for any service issues

### URLs not updating

**Solution**:
1. Check Supabase URL is detected correctly
2. Verify database connection
3. Review `migration/reports/url-update-report.json`

### Images not loading

**Solution**:
1. Verify Azure Blob container has public access
2. Test image URL directly in browser
3. Check CORS settings in Azure Storage
4. Review browser console for errors

## Migration Artifacts

All migration outputs are saved in `migration/` directory:

- **Backups**: `migration/backups/` - Database backups at various stages
- **Downloads**: `migration/downloads/` - Files from Supabase Storage
- **Uploads**: `migration/uploads/` - Upload manifests
- **Logs**: `migration/logs/` - Execution logs
- **Reports**: `migration/reports/` - Verification and update reports

## Rollback

If migration fails, restore from backup:

```bash
# Restore database
psql "postgresql://..." -f migration/backups/azure-backup-*.sql

# Or restore to specific point
psql "postgresql://..." -f migration/backups/pre-url-update-*.sql
```

## Documentation

- **Complete Guide**: `migration/docs/AZURE-MIGRATION-GUIDE.md`
- **Azure Blob Storage**: `migration/lib/azure-storage/README.md`
- **Environment Template**: `migration/config/.env.azure.template`

## Support

For detailed help, see:
- Full migration guide: `migration/docs/AZURE-MIGRATION-GUIDE.md`
- Azure documentation: https://docs.microsoft.com/azure/
- NextAuth.js docs: https://next-auth.js.org/

## Timeline

**Total migration time**: 6-10 hours

- Preparation: 2-4 hours (Azure setup, configuration)
- Execution: 1-2 hours (running scripts)
- Validation: 2-3 hours (testing, verification)
- Deployment: 1 hour (production deploy)

## Success Criteria

Migration is successful when:

- ✅ All migration scripts complete without critical errors
- ✅ Verification report shows "success" status
- ✅ Images load correctly in application
- ✅ Authentication works
- ✅ All CRUD operations work
- ✅ Application deployed to Azure
- ✅ Production testing passes

---

**Need help?** Review the full migration guide at `migration/docs/AZURE-MIGRATION-GUIDE.md`
