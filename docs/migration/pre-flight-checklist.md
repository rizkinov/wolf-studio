# Pre-Flight Checklist - Azure Migration

Use this checklist before starting the migration to ensure everything is ready.

## ☑️ Azure Services Preparation

### Azure PostgreSQL Flexible Server

- [ ] Server created in Azure Portal
- [ ] Admin username and password noted
- [ ] Firewall rule added for your IP address
- [ ] SSL/TLS enabled (required)
- [ ] Server status: Running
- [ ] Connection tested using psql or Azure Data Studio

**Connection string format**:
```
postgresql://admin@server-name:password@server-name.postgres.database.azure.com:5432/postgres?sslmode=require
```

### Azure Storage Account

- [ ] Storage account created
- [ ] Blob container created (name: `project-images`)
- [ ] Container access level set to "Blob" (public read)
- [ ] Access keys copied from Azure Portal
- [ ] Connection string obtained
- [ ] CORS configured (if needed):
  - Allowed origins: Your app URL
  - Allowed methods: GET, PUT, POST, DELETE
  - Allowed headers: *

**Connection string format**:
```
DefaultEndpointsProtocol=https;AccountName=NAME;AccountKey=KEY;EndpointSuffix=core.windows.net
```

### Azure AD B2C

- [ ] Azure AD B2C tenant created
- [ ] User flow created (B2C_1_signupsignin)
- [ ] Application registered
- [ ] Client ID copied
- [ ] Client secret created and copied
- [ ] Redirect URIs configured:
  - `http://localhost:3000/api/auth/callback/azure-ad-b2c` (dev)
  - `https://your-app.azurestaticapps.net/api/auth/callback/azure-ad-b2c` (prod)

## ☑️ Local Environment Setup

### Required Software

- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] PostgreSQL client installed (`psql --version`)
- [ ] Git installed and repository cloned
- [ ] Code editor installed (VS Code recommended)

### Environment Configuration

- [ ] `.env.azure` file created (from template)
- [ ] All Azure credentials filled in `.env.azure`
- [ ] `NEXTAUTH_SECRET` generated:
  ```bash
  openssl rand -base64 32
  ```
- [ ] All URLs use HTTPS (except localhost)
- [ ] No placeholder values remain (no `your-*` values)

### Migration Dependencies

- [ ] Navigated to migration directory: `cd migration`
- [ ] Dependencies installed: `npm install`
- [ ] No npm install errors
- [ ] Packages installed:
  - @azure/storage-blob ✓
  - @supabase/supabase-js ✓

## ☑️ Supabase Preparation

### Database Backup

- [ ] Database backup exists: `supabase/backups/backup.sql`
- [ ] Backup file size > 0 bytes (should be ~809 KB)
- [ ] Backup is recent (within last 7 days)
- [ ] Backup file can be opened and viewed

### Supabase Credentials

- [ ] `NEXT_PUBLIC_SUPABASE_URL` available
- [ ] `SUPABASE_SERVICE_ROLE_KEY` available
- [ ] Supabase project is accessible
- [ ] No pending Supabase migrations

### Storage Files

- [ ] Know which buckets contain files:
  - [ ] project-images
  - [ ] project-images-temp
  - [ ] business-cards (if applicable)
- [ ] Estimated file count and size known
- [ ] No active uploads happening during migration

## ☑️ Testing & Validation

### Pre-Migration Tests

- [ ] Current application is working
- [ ] Can login to admin panel
- [ ] Can view projects
- [ ] Images are loading
- [ ] No console errors

### Validation Script

- [ ] Validation script runs: `node scripts/1-validate-environment.js`
- [ ] All checks pass ✓
- [ ] Azure PostgreSQL connection successful
- [ ] Azure Blob Storage credentials valid
- [ ] No errors in validation output

## ☑️ Communication & Planning

### Team Coordination

- [ ] Migration scheduled with team
- [ ] Stakeholders notified of maintenance window
- [ ] Estimated downtime communicated
- [ ] Rollback plan reviewed with team
- [ ] Post-migration testing plan agreed

### Timing

- [ ] Migration scheduled during low-traffic period
- [ ] Sufficient time allocated (6-10 hours)
- [ ] No conflicting deployments or changes
- [ ] Backup team member available if needed

## ☑️ Backup & Safety

### Backup Strategy

- [ ] Supabase backup downloaded locally
- [ ] Backup stored in secure location
- [ ] Backup tested (can open and view SQL)
- [ ] Know how to restore from backup
- [ ] Supabase account will remain active for 30 days

### Rollback Preparation

- [ ] Rollback procedure documented
- [ ] DNS rollback steps known
- [ ] Supabase connection strings saved
- [ ] Can quickly revert application code
- [ ] Team knows rollback triggers

## ☑️ Documentation Review

### Read Before Migration

- [ ] Reviewed `migration/README.md`
- [ ] Read `migration/docs/AZURE-MIGRATION-GUIDE.md`
- [ ] Understand each migration script's purpose
- [ ] Know where logs and reports are saved
- [ ] Familiar with troubleshooting section

### Scripts Understanding

- [ ] Understand script 1: Validation
- [ ] Understand script 2: Database migration
- [ ] Understand script 3: Download storage
- [ ] Understand script 4: Upload to Azure
- [ ] Understand script 5: Update URLs
- [ ] Understand script 6: Verification

## ☑️ Post-Migration Preparation

### Code Changes Ready

- [ ] Know which files need updating
- [ ] Have code snippets ready from documentation
- [ ] NextAuth.js documentation reviewed
- [ ] Azure Blob Storage adapter usage understood
- [ ] Test plan for updated code

### Deployment Plan

- [ ] Chosen deployment method (Static Web Apps or App Service)
- [ ] Azure deployment environment ready
- [ ] Environment variables prepared for production
- [ ] DNS update procedure known
- [ ] SSL certificate plan in place

## ☑️ Final Checks

### 5 Minutes Before Migration

- [ ] All team members ready
- [ ] Current application working fine
- [ ] No active users (or users notified)
- [ ] Supabase backup confirmed recent
- [ ] Azure services all showing "Running" status
- [ ] Terminal/command prompt ready
- [ ] This checklist completed

### Emergency Contacts

- [ ] Azure support contact info available
- [ ] Team contact list ready
- [ ] Escalation plan documented

---

## ✅ Ready to Migrate?

If all checkboxes are checked ✓, you're ready to proceed!

### Next Steps:

1. Open terminal in project root directory
2. Run validation: `node migration/scripts/1-validate-environment.js`
3. If validation passes, proceed with migration
4. Follow the steps in `AZURE-MIGRATION-GUIDE.md`

### Quick Start Command:

```bash
cd migration
npm run migrate-all
```

---

## 🚨 Stop If...

**Do NOT proceed if**:

- ❌ Validation script fails
- ❌ Azure services not accessible
- ❌ Backup file missing or corrupted
- ❌ Team not available for support
- ❌ Insufficient time allocated
- ❌ Any critical checks above not completed

**Instead**: Review the failing items and address before proceeding.

---

**Last updated**: Based on Wolf Studio migration toolkit v1.0

**Ready?** Proceed to `migration/README.md` for migration execution.
