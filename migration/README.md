# Wolf Studio - Azure Migration Toolkit

Complete toolkit for migrating Wolf Studio from Supabase to Azure infrastructure.

**📚 Documentation has moved to [`docs/migration/`](../docs/migration/)**

## Quick Reference

All migration documentation is now consolidated in the main docs folder:

- **[Migration Summary](../docs/migration/migration-summary.md)** - Executive overview for Azure team
- **[Migration Toolkit Quickstart](../docs/migration/migration-toolkit-quickstart.md)** - Quick start guide
- **[Azure Migration Guide](../docs/migration/azure-migration-guide.md)** - Complete 60+ page step-by-step guide
- **[Pre-Flight Checklist](../docs/migration/pre-flight-checklist.md)** - Pre-migration validation
- **[Azure Storage Adapter](../docs/migration/azure-storage-adapter.md)** - Storage adapter documentation

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
```

### 3. Run Migration

```bash
# Validate setup
node migration/scripts/1-validate-environment.js

# Run complete migration
cd migration
npm run migrate-all
```

## Directory Structure

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
├── config/                # Configuration templates
│   └── .env.azure.template
├── package.json           # Migration dependencies
└── README.md             # This file
```

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

## For Complete Documentation

See the [`docs/migration/`](../docs/migration/) folder for:
- Complete migration guide
- Pre-flight checklist
- Storage adapter documentation
- Troubleshooting guide
- Rollback procedures

---

**Need help?** Start with [Migration Summary](../docs/migration/migration-summary.md)
