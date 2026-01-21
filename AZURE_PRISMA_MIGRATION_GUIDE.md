# Azure Prisma Migration Guide

## Overview

This branch (`azure-prisma-migration`) contains a **complete Prisma-based database layer** that replaces Supabase. This allows the Wolf Studio application to work with **Azure PostgreSQL** using **no authentication** (for testing) or **Azure AD** (for production).

---

## What's Been Done

### ✅ Created Files

1. **`lib/prisma.ts`** - Prisma Client singleton (prevents multiple instances)
2. **`lib/services/database-prisma.ts`** - Prisma-based database service layer
   - ProjectService (11 methods)
   - CategoryService (5 methods)
   - ProjectImageService (5 methods)
3. **`app/api/test-db-connection/route.ts`** - Test endpoint for database connectivity
4. **`app/api/test-projects/route.ts`** - Test endpoint for project data fetching
5. **`app/api/projects/route-prisma.ts`** - Prisma version of public projects API
6. **`app/api/admin/projects/route-prisma.ts`** - Prisma version of admin projects API

### ✅ What's Different

| Feature | Supabase Version | Prisma Version |
|---------|------------------|----------------|
| Database client | `@supabase/supabase-js` | `@prisma/client` |
| Authentication | Supabase Auth + RLS | No-auth middleware (testing) |
| Service role | `SUPABASE_SERVICE_ROLE_KEY` | Not needed (direct DB access) |
| Query builder | `supabase.from('table').select()` | `prisma.table.findMany()` |
| Environment variable | `SUPABASE_URL`, `SUPABASE_ANON_KEY` | `DATABASE_URL` |

---

## Prerequisites

Before starting, ensure you have:

1. ✅ **Azure PostgreSQL** with data migrated (public schema imported)
2. ✅ **Prisma schema** ready (`prisma/schema.prisma` already has complete schema)
3. ✅ **Prisma Client** generated (`npx prisma generate`)
4. ✅ **No-auth middleware** active (`middleware-no-auth.ts` → `middleware.ts`)
5. ✅ **DATABASE_URL** in `.env.local`

**Note:** The complete schema is already active in `prisma/schema.prisma` on this branch. The old incomplete schema is saved as `prisma/schema-nextauth-only.prisma` for reference.

---

## Step-by-Step Migration

### Step 1: Environment Setup

**Ensure `.env.local` has:**
```env
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"
```

**Remove or comment out (optional):**
```env
# NEXT_PUBLIC_SUPABASE_URL=...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=...
# SUPABASE_SERVICE_ROLE_KEY=...
```

---

### Step 2: Test Database Connection

```bash
# Start development server
npm run dev

# Test 1: Check database connectivity
curl http://localhost:3000/api/test-db-connection

# Expected output:
# {
#   "success": true,
#   "database": "Azure PostgreSQL via Prisma",
#   "counts": {
#     "projects": 28,
#     "categories": 7,
#     "images": 233,
#     "userProfiles": 2
#   }
# }

# Test 2: Fetch sample projects
curl http://localhost:3000/api/test-projects

# Expected output:
# {
#   "success": true,
#   "count": 5,
#   "projects": [...]
# }
```

**If tests fail, check:**
- DATABASE_URL is correct
- Azure PostgreSQL firewall allows your IP
- Prisma Client is generated (`npx prisma generate`)
- Tables exist (`npx prisma studio` should show all tables)

---

### Step 3: Activate Prisma API Routes

#### Option A: Gradual Migration (Recommended for Testing)

Test the Prisma routes alongside existing Supabase routes:

```bash
# Test Prisma public projects API (route-prisma.ts is already a separate file)
# No changes needed - both versions can coexist
```

#### Option B: Full Cutover (For Production)

Replace Supabase routes with Prisma routes:

```bash
# Backup Supabase versions
mv app/api/projects/route.ts app/api/projects/route-supabase.ts
mv app/api/admin/projects/route.ts app/api/admin/projects/route-supabase.ts

# Activate Prisma versions
mv app/api/projects/route-prisma.ts app/api/projects/route.ts
mv app/api/admin/projects/route-prisma.ts app/api/admin/projects/route.ts

# Rebuild
npm run build
npm run dev
```

---

### Step 4: Test Public API Endpoints

```bash
# Test public projects endpoint
curl "http://localhost:3000/api/projects?published=true&limit=10"

# Expected: Array of published projects with categories and images

# Test with category filter
curl "http://localhost:3000/api/projects?category=<category-id>&published=true"

# Test with featured filter
curl "http://localhost:3000/api/projects?featured=true&published=true"
```

---

### Step 5: Test Admin API Endpoints

```bash
# Get all projects (admin)
curl http://localhost:3000/api/admin/projects

# Get single project
curl "http://localhost:3000/api/admin/projects?id=<project-id>"

# Create project (POST)
curl -X POST http://localhost:3000/api/admin/projects \
  -H "Content-Type: application/json" \
  -d '{
    "action": "create",
    "title": "Test Project from Prisma",
    "slug": "test-project-prisma",
    "is_published": false
  }'

# Update project (POST)
curl -X POST http://localhost:3000/api/admin/projects \
  -H "Content-Type: application/json" \
  -d '{
    "action": "update",
    "id": "<project-id>",
    "title": "Updated Title"
  }'

# Delete project (POST)
curl -X POST http://localhost:3000/api/admin/projects \
  -H "Content-Type: application/json" \
  -d '{
    "action": "delete",
    "id": "<project-id>"
  }'
```

---

### Step 6: Test Frontend Integration

1. **Visit public pages:**
   - `http://localhost:3000/wolf-studio` - Should show project gallery
   - `http://localhost:3000/wolf-studio/<project-slug>` - Should show project details

2. **Visit admin pages (no auth required with middleware-no-auth.ts):**
   - `http://localhost:3000/admin` - Should load admin dashboard
   - `http://localhost:3000/admin/projects` - Should show project list
   - `http://localhost:3000/admin/projects/new` - Should show create form
   - `http://localhost:3000/admin/projects/<id>` - Should show edit form

---

## Verification Checklist

After migration, verify:

- [ ] `npx prisma studio` shows all tables with data
- [ ] `/api/test-db-connection` returns success
- [ ] `/api/test-projects` returns project data
- [ ] `/api/projects?published=true` returns published projects
- [ ] `/api/admin/projects` returns all projects
- [ ] Public Wolf Studio pages load correctly
- [ ] Admin panel loads without authentication
- [ ] Can create/update/delete projects via admin panel
- [ ] Images display correctly from Azure Blob Storage
- [ ] No Supabase errors in console

---

## Prisma Service Methods Available

### ProjectService

```typescript
// Query methods
ProjectService.getProjects(filters?, pagination?, sort?)
ProjectService.getProject(idOrSlug)
ProjectService.getProjectsByIds(ids[])

// Mutation methods
ProjectService.createProject(data)
ProjectService.updateProject(id, updates)
ProjectService.deleteProject(id)
ProjectService.duplicateProject(id)
ProjectService.reorderProjects(updates[])
ProjectService.bulkUpdateProjects(ids[], updates)
```

### CategoryService

```typescript
CategoryService.getCategories()
CategoryService.getCategory(idOrSlug)
CategoryService.createCategory(data)
CategoryService.updateCategory(id, updates)
CategoryService.deleteCategory(id)
```

### ProjectImageService

```typescript
ProjectImageService.getProjectImages(projectId)
ProjectImageService.addProjectImage(data)
ProjectImageService.updateProjectImage(id, updates)
ProjectImageService.deleteProjectImage(id)
ProjectImageService.reorderProjectImages(updates[])
```

---

## Common Issues & Solutions

### Issue 1: "Prisma Client not generated"

**Error:** `Cannot find module '@prisma/client'`

**Solution:**
```bash
npx prisma generate
```

### Issue 2: "Can't reach database server"

**Error:** `Can't reach database server at prod-usce-wolfstudio-postgres.postgres.database.azure.com:5432`

**Solution:**
- Check Azure PostgreSQL firewall rules
- Add your IP address to allowed IPs
- Verify DATABASE_URL is correct

### Issue 3: "Table doesn't exist"

**Error:** `The table public.projects does not exist in the current database`

**Solution:**
- Verify public schema was imported: `psql "$DATABASE_URL" -c "\dt"`
- Re-import if needed: `psql "$DATABASE_URL" < supabase/backups/public_schema.sql`

### Issue 4: "Prisma Studio shows no data"

**Error:** Tables visible but no rows

**Solution:**
- Disable RLS policies: `ALTER TABLE projects DISABLE ROW LEVEL SECURITY;`
- Verify data exists: `psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM projects;"`

### Issue 5: "Module not found: @/lib/services/database-prisma"

**Error:** Cannot resolve module

**Solution:**
- Ensure file exists at `lib/services/database-prisma.ts`
- Restart Next.js dev server: `npm run dev`

---

## Performance Considerations

### Connection Pooling

Prisma uses connection pooling by default. For serverless/Azure App Service:

**Option 1: Prisma Accelerate** (Recommended for production)
```env
DATABASE_URL="prisma://accelerate.prisma-data.net/?api_key=..."
```

**Option 2: Azure PostgreSQL Built-in Pooling**
- Enable "Connection Pooling" in Azure Portal
- Update DATABASE_URL to use pooler endpoint

**Option 3: External Pooler (PgBouncer)**
```env
DATABASE_URL="postgresql://user:password@pgbouncer-host:6432/dbname"
```

### Query Optimization

All Prisma queries use:
- **Eager loading:** `.include()` for relationships
- **Proper indexing:** Indexes from Supabase schema preserved
- **Pagination:** `.skip()` and `.take()` for large datasets
- **Sorting:** `.orderBy()` on indexed columns

---

## Rollback Plan

If you need to revert to Supabase:

```bash
# 1. Restore Supabase API routes
mv app/api/projects/route-supabase.ts app/api/projects/route.ts
mv app/api/admin/projects/route-supabase.ts app/api/admin/projects/route.ts

# 2. Restore environment variables
# Uncomment SUPABASE_URL and SUPABASE_ANON_KEY in .env.local

# 3. Restart server
npm run dev
```

---

## Next Steps

### For Testing (Current State)
- ✅ No authentication required
- ✅ All APIs work with Prisma
- ✅ Data fetched from Azure PostgreSQL

### For Production
1. **Implement Azure AD B2C authentication:**
   - Use files in `migration/azure/lib/auth/`
   - Replace `middleware-no-auth.ts` with full Azure AD middleware
   - Configure NextAuth.js

2. **Enable Azure Blob Storage:**
   - Use adapter in `migration/azure/lib/azure-storage/`
   - Update image upload endpoints

3. **Implement missing services:**
   - UserService (currently in Supabase version)
   - AnalyticsService
   - ActivityLogService
   - PermissionService

4. **Add authorization checks:**
   - Role-based access control
   - Resource-level permissions
   - Audit logging

---

## Support

**Questions?** Check:
- Main migration guide: `docs/migration/azure-migration-guide.md`
- Prisma setup guide: `PRISMA_SETUP_FOR_AZURE.md`
- Azure handoff doc: `docs/migration/migration-summary.md`

**Issues?** Review:
- Prisma logs: Check console for query errors
- Database connection: `npx prisma studio`
- Network connectivity: Test with `psql "$DATABASE_URL"`

---

**Migration prepared by:** Claude Sonnet 4.5
**Branch:** `azure-prisma-migration`
**Date:** 2026-01-20
