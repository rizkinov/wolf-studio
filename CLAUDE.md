# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Development
```bash
npm run dev                 # Start development server
npm run build              # Production build
npm run start              # Production server
npm run lint               # ESLint checking
```

### Testing Suite
```bash
npm run test               # Jest unit tests
npm run test:watch         # Jest in watch mode
npm run test:coverage      # Jest with coverage report
npm run test:e2e           # Cypress E2E tests
npm run test:playwright    # Playwright browser tests
npm run test:lighthouse    # Performance audits
npm run test:all          # Complete test suite
```

### Database & Backend
```bash
# Supabase (Current - for reference)
supabase db reset         # Reset local database
supabase db push          # Push migrations
supabase migration up     # Run specific migrations

# Azure Migration (New)
cd migration
npm run validate          # Validate Azure environment setup
npm run migrate-all       # Run complete migration to Azure
npm run verify            # Verify migration success
```

## Architecture Overview

### Tech Stack
- **Frontend**: Next.js 15 with App Router, React 19, TypeScript 5+
- **Database**: PostgreSQL (Supabase or Azure PostgreSQL Flexible Server)
- **Authentication**: Supabase Auth (can migrate to NextAuth.js + Azure AD B2C)
- **Storage**: Supabase Storage (can migrate to Azure Blob Storage)
- **Styling**: Tailwind CSS 4 with custom CBRE design system

### Project Structure
- `app/` - Next.js App Router pages and layouts
- `app/admin/` - Complete admin dashboard with project/user/analytics management
- `app/api/` - API routes (both public and admin endpoints)
- `app/wolf-studio/` - Public portfolio pages with dynamic project content
- `components/` - Reusable components organized by purpose (admin, common, ui)
- `lib/` - Core utilities, services, authentication, and database operations
- `supabase/` - Database schema, migrations, and backups
- `migration/` - **Azure migration toolkit** (scripts, adapters, documentation)

### Migration Toolkit Structure
The `migration/` directory contains a complete Azure migration toolkit:
- `migration/scripts/` - 6 automated migration scripts (validation, database, storage, URL updates, verification)
- `migration/lib/azure-storage/` - Azure Blob Storage adapter (drop-in replacement for Supabase Storage)
- `migration/lib/azure-auth/` - NextAuth.js + Azure AD B2C setup (replacement for Supabase Auth)
- `migration/config/` - Environment templates for Azure

**Documentation** (in `docs/migration/`):
- `docs/migration/migration-summary.md` - Executive summary for Azure team
- `docs/migration/migration-toolkit-quickstart.md` - Quick start guide
- `docs/migration/azure-migration-guide.md` - Complete 60+ page step-by-step guide
- `docs/migration/pre-flight-checklist.md` - Pre-migration validation
- `docs/migration/azure-storage-adapter.md` - Storage adapter documentation
- `supabase/backups/backup.sql` - Database backup ready for migration (809 KB)

### Database Architecture
Core tables: `projects`, `categories`, `project_images`, `user_profiles`, `activity_logs`
- All tables use UUID primary keys for security
- Comprehensive RLS policies for data access control
- JSONB fields for flexible rich content storage
- Compatible with both Supabase and Azure PostgreSQL

**Migration Note**: Database schema includes Supabase-specific elements (RLS policies, auth schemas, storage schemas). Migration scripts automatically adapt these for Azure PostgreSQL.

### Authentication & Security
- **Current**: Supabase Auth + RLS + custom middleware + rate limiting
- **Migration Path**: NextAuth.js with Azure AD B2C (provided in `migration/lib/azure-auth/`)
- Role-based permissions (admin, editor, viewer) with hasPermission utility
- Comprehensive input validation using Zod schemas
- Security headers, CSP, and audit trails for all admin actions
- Image upload with client-side cropping and server-side optimization

**Migration Note**: Auth code requires updates in ~5-8 files when migrating. See `docs/migration/azure-migration-guide.md` for details.

### Storage Architecture
- **Current**: Supabase Storage with buckets (project-images, project-images-temp, business-cards)
- **Migration Path**: Azure Blob Storage adapter (provided in `migration/lib/azure-storage/`)
- Client-side image optimization before upload
- Automatic MIME type detection and validation
- Public blob access for served images

**Migration Note**: Storage adapter provides 100% API-compatible replacement. Update imports in ~3 files.

### Admin Panel Features
**Full CMS functionality:**
- Project management with rich text editing (TipTap)
- Image management with drag-and-drop gallery ordering
- User management with role-based access control
- Category management for project organization
- Analytics dashboard with project performance metrics
- Storage monitoring and optimization tools

### Services Layer Architecture
Key services in `lib/services/`:
- `authService.ts` - Authentication operations and user management
- `projectService.ts` - Project CRUD with validation and image handling
- `imageService.ts` - Image processing, optimization, and storage
- `loggerService.ts` - Structured logging with correlation IDs
- All services use proper error handling and type safety

**Migration Note**: Services using Supabase Storage will need adapter updates. Services using auth will need NextAuth.js integration.

### Component Organization
- `components/admin/` - Admin-specific components (RichTextEditor, ImageCropper, DataTables)
- `components/common/` - Shared components across public and admin areas
- `components/ui/` - Base UI primitives built on Radix UI
- `components/cbre/` - CBRE-branded design system components

### Environment Setup Requirements

**Current (Supabase)**:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Azure Migration**:
Create `.env.azure` from `migration/config/.env.azure.template`:
```env
# Azure PostgreSQL
AZURE_POSTGRESQL_HOST=your-server.postgres.database.azure.com
AZURE_POSTGRESQL_USER=adminuser
AZURE_POSTGRESQL_PASSWORD=your-password

# Azure Blob Storage
AZURE_STORAGE_CONNECTION_STRING=your-connection-string
AZURE_BLOB_CONTAINER_NAME=project-images

# Azure AD B2C
AZURE_AD_B2C_CLIENT_ID=your-client-id
AZURE_AD_B2C_CLIENT_SECRET=your-client-secret

# NextAuth
NEXTAUTH_URL=your-app-url
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
```

### Development Workflow
1. Use TypeScript for all new code - comprehensive types in `lib/types/`
2. Follow existing patterns for API routes - use proper validation and error handling
3. Admin routes require authentication - middleware at `middleware.ts` handles protection
4. Use existing services rather than direct database calls
5. All admin actions are logged via `activity_logs` table
6. Images go through optimization pipeline - use `ImageCropper` for uploads

### Key Patterns
- **Error Handling**: Standardized error responses with proper HTTP codes
- **Validation**: Zod schemas for all input validation (`lib/validation/`)
- **Logging**: Structured logging with correlation IDs and audit trails
- **Type Safety**: End-to-end TypeScript with generated Supabase types
- **Performance**: Optimized images, caching strategies, and bundle splitting
- **Security**: Multiple security layers with comprehensive input sanitization

### API Structure
- `/api/projects` - Public project endpoints (read-only)
- `/api/admin/projects` - Admin project management (full CRUD)
- `/api/admin/users` - User management with role-based operations
- `/api/admin/categories` - Category management
- `/api/admin/stats` - Analytics and system statistics
- `/api/health` - System health monitoring

All admin APIs require authentication and proper role permissions.

### Testing Strategy
- Unit tests with Jest for utilities and services
- Integration tests with Playwright for user workflows
- E2E tests with Cypress for complete journeys
- Performance testing with Lighthouse CI
- 70%+ test coverage requirement for services and utilities

## Azure Migration Guide

### Overview
This repository includes a **complete Azure migration toolkit** for transitioning from Supabase to Azure infrastructure. All scripts, adapters, and documentation are production-ready.

### Migration Components

**1. Automated Scripts** (`migration/scripts/`):
- `1-validate-environment.js` - Pre-flight validation (Azure connectivity, env vars)
- `2-migrate-database.js` - PostgreSQL migration with automatic compatibility fixes
- `3-download-storage-files.js` - Download from Supabase Storage
- `4-upload-to-azure-blob.js` - Upload to Azure Blob Storage
- `5-update-database-urls.js` - Replace Supabase URLs with Azure URLs
- `6-verify-migration.js` - Comprehensive verification and accessibility tests

**2. Azure Adapters** (`migration/lib/`):
- `azure-storage/` - Drop-in replacement for Supabase Storage with identical API
- `azure-auth/` - NextAuth.js + Azure AD B2C authentication setup

**3. Documentation** (see `docs/migration/` and `docs/setup/`):
- Complete migration guides and environment setup documentation
- All documentation consolidated in `docs/` folder

### Quick Migration Start

```bash
# 1. Setup
cd migration
npm install
cp config/.env.azure.template ../.env.azure
# Edit .env.azure with Azure credentials

# 2. Validate
npm run validate

# 3. Migrate (30-60 minutes)
npm run migrate-all

# 4. Verify
npm run verify
```

### Post-Migration Code Updates

**Storage Adapter Integration**:
```typescript
// Before (Supabase)
import { supabase } from '@/lib/supabase/client';
await supabase.storage.from('bucket').upload(path, file);

// After (Azure - using provided adapter)
import { storage } from '@/lib/storage/azure-client';
await storage.upload(path, file);
```

**Authentication Integration**:
```typescript
// Install NextAuth.js
npm install next-auth

// Use provided setup from migration/lib/azure-auth/
// Update ~5-8 files (see migration guide)
```

### Migration Scope
- **Database**: 809 KB SQL dump, 9,663 lines
- **Storage**: ~100-200 files across 3 buckets
- **Code Changes**: ~8-10 files need adapter integration
- **Total Time**: 6-10 hours (including testing and deployment)

### Key Migration Features
- **Idempotent scripts** - Safe to re-run if interrupted
- **Automatic backups** - Created before each critical step
- **Comprehensive logging** - All actions logged to `migration/logs/`
- **Rollback support** - Can revert at any stage
- **Progress indicators** - Visual feedback during execution

### Migration Outputs
All migration artifacts saved in `migration/`:
- `backups/` - Database backups at various stages
- `downloads/` - Files from Supabase Storage
- `logs/` - Execution logs for debugging
- `reports/` - Verification and update reports
- `uploads/` - Upload manifests

### Azure Services Required
Before migration, create:
1. **Azure PostgreSQL Flexible Server** (14 or 15)
2. **Azure Storage Account** with Blob container
3. **Azure AD B2C Tenant** with app registration

See `docs/migration/azure-migration-guide.md` for Azure CLI commands.

## Documentation

All project documentation is consolidated in the `docs/` folder:
- **Setup Guides**: `docs/setup/` - Environment, database, and backup guides
- **Migration Guides**: `docs/migration/` - Complete Azure migration documentation
- **Deployment**: `docs/deployment/` - Deployment guides for all platforms
- **Security**: `docs/security/` - Enterprise security implementation details

See `docs/README.md` for complete documentation index.

## Important Notes

### For Azure Migration
- **Read First**: `docs/migration/migration-summary.md` for executive overview
- **Pre-Flight**: Use `docs/migration/pre-flight-checklist.md` before starting
- **Rollback**: Keep Supabase active for 30 days as fallback
- **Support**: Complete troubleshooting guide in migration docs

### Code Maintenance
- When updating storage code, ensure compatibility with both Supabase and Azure adapters
- Auth changes should consider both Supabase Auth and NextAuth.js patterns
- Database queries should avoid Supabase-specific functions for Azure compatibility
- Test both storage and auth paths when making changes

### Security Considerations
- Never commit `.env.azure` or `.env.local` to repository
- Rotate Azure credentials after migration
- Update RLS policies if removing Supabase Auth
- Configure Azure AD B2C redirect URIs for production

## Business Context

Wolf Studio is CBRE's workplace design firm specializing in transforming offices. This platform serves as their:
- Digital portfolio showcasing 750+ client projects
- Business management system for project tracking
- Content management system for case studies
- Client engagement and analytics platform

**Locations**:
- Singapore Industrial Studio: 61 Ubi Road 1
- Singapore CBD Studio: 8 Marina Boulevard, MBFC Tower 1
- Hong Kong Studio: Level 27, One Pacific Place

The codebase supports both Wolf Studio and CBRE branding with enterprise-grade security and performance requirements.
