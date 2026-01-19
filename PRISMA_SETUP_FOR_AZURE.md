# Prisma Setup Guide for Azure PostgreSQL

## Problem
When you run `npx prisma db push`, it wants to **drop all your existing tables** because the current `prisma/schema.prisma` file only contains 4 NextAuth tables, not the full application schema.

## Solution
Use the complete schema file that includes all 15+ tables.

---

## Step 1: Backup Current Schema (Optional)
```bash
mv prisma/schema.prisma prisma/schema-nextauth-only.prisma
```

## Step 2: Use Complete Schema
```bash
cp prisma/schema-complete.prisma prisma/schema.prisma
```

## Step 3: Verify Database Connection
Make sure your `.env` or `.env.local` has:
```env
DATABASE_URL="postgresql://postgres_admin:PASSWORD@HOST:5432/DATABASE?sslmode=require"
```

## Step 4: Pull Existing Schema (Recommended)
This will verify Prisma can see all your existing tables:
```bash
npx prisma db pull
```

**Expected Output:**
- Should show all tables: projects, categories, project_images, user_profiles, activity_logs, etc.
- Will update `schema.prisma` with actual database structure

## Step 5: Generate Prisma Client
```bash
npx prisma generate
```

This creates the Prisma client that the application code will use.

## Step 6: Test Connection
```bash
npx prisma studio
```

Should open a browser showing all your tables with data.

---

## What About `npx prisma db push`?

**You DON'T need to run it** if:
- Your database already has all the tables (from SQL migration)
- You just ran `npx prisma db pull`

**You ONLY need `npx prisma db push` if:**
- You're adding new tables to the schema
- You're adding new columns to existing tables

---

## Tables in Complete Schema

### Core Tables (5)
- `categories` - Project categories
- `projects` - Main projects table
- `project_images` - Project gallery images
- `page_views` - Analytics tracking
- `project_analytics` - Aggregated analytics

### User Management (5)
- `user_profiles` - User information and roles
- `activity_logs` - Audit trail
- `user_sessions` - Session tracking (different from NextAuth Session)
- `user_permissions` - Granular permissions
- `image_migration_log` - Migration tracking

### NextAuth (4)
- `Account` - OAuth accounts
- `Session` - NextAuth sessions
- `User` - NextAuth users
- `VerificationToken` - Email verification

### Analytics (1)
- `user_sessions` - Visitor session analytics

---

## Key Differences from Supabase Schema

### 1. User References
**Supabase version:**
```sql
user_id UUID REFERENCES auth.users(id)
```

**Azure version:**
```prisma
userId String
user   User @relation(fields: [userId], references: [id])
```

Uses NextAuth's `User` table instead of Supabase's `auth.users`.

### 2. RLS Policies
Supabase RLS policies are **removed** in this schema. You'll need to implement authorization in application code.

### 3. Database Functions
These Supabase RPC functions are **not included**:
- `log_activity()` - Need to implement in Node.js
- `has_permission()` - Need to implement in Node.js
- `cleanup_old_activity_logs()` - Need to implement in Node.js
- `cleanup_expired_sessions()` - Need to implement in Node.js

---

## Verification Checklist

After setup, verify:

```bash
# 1. Prisma can connect
npx prisma studio

# 2. All tables visible
# Should see 15+ tables in Prisma Studio

# 3. Data is present
# Click on "projects" table - should see your 28 projects

# 4. Prisma Client generated
ls node_modules/.prisma/client
# Should see index.d.ts and other files
```

---

## Next Steps After Prisma Setup

Once Prisma is working, the application code still needs updates:

1. **Replace Supabase client** in `lib/services/database.ts`
2. **Update authentication** in `lib/auth/context.tsx` to use NextAuth
3. **Update API routes** to use Prisma instead of Supabase
4. **Implement database functions** (log_activity, has_permission, etc.)

See the main migration guide for code changes.

---

## Troubleshooting

### Error: "Can't reach database server"
- Check `DATABASE_URL` in `.env`
- Verify Azure PostgreSQL firewall allows your IP
- Test connection: `psql "$DATABASE_URL"`

### Error: "Schema is empty"
- Your database might not have tables yet
- Run the SQL migration first: `psql "$DATABASE_URL" < supabase/backups/public_schema.sql`

### Error: "Table 'auth.users' doesn't exist"
- This is expected - Azure doesn't have Supabase's auth schema
- Use the complete schema provided (it references NextAuth's User table)

### Prisma Studio shows no data
- Tables exist but queries might fail due to RLS policies
- Disable RLS on tables: `ALTER TABLE projects DISABLE ROW LEVEL SECURITY;`

---

## Summary

✅ **DO:** Use `schema-complete.prisma` as your schema
✅ **DO:** Run `npx prisma db pull` to sync with existing database
✅ **DO:** Run `npx prisma generate` to create client
❌ **DON'T:** Run `npx prisma db push` on first setup (will drop tables)
❌ **DON'T:** Use the incomplete `schema.prisma` (only has 4 tables)

---

Questions? Check the migration guide at `docs/migration/azure-migration-guide.md`
