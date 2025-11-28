# Azure Migration Implementation Plan

This plan outlines the steps to transition the Wolf Studio application from Supabase to a fully Azure-native architecture (Azure SQL + Azure AD + Azure Blob Storage).

## Phase 1: Dependencies & Configuration (The Foundation)
- [ ] **Install Auth & Database Packages**: `next-auth`, `@next-auth/prisma-adapter`, `@prisma/client`, `prisma`.
- [ ] **Configure Next.js**: Update `next.config.js` to allow images from Azure Blob Storage (`*.blob.core.windows.net`).
- [ ] **Initialize Prisma**: Set up `prisma/schema.prisma` with the PostgreSQL provider and the required NextAuth models (`Account`, `Session`, `User`, `VerificationToken`).

## Phase 2: Authentication Implementation (Azure AD)
- [ ] **Create Auth API Route**: Implement `app/api/auth/[...nextauth]/route.ts` using the Prisma Adapter and Azure AD Provider.
- [ ] **Update Middleware**: Rewrite `middleware.ts` to use `next-auth/middleware` for protecting `/admin` routes, replacing the Supabase logic.
- [ ] **Refactor Client Auth**: Update `lib/auth/context.tsx` (or create a new `AuthProvider`) to expose `useSession()` instead of Supabase's session.

## Phase 3: Storage Implementation (Azure Blob)
- [ ] **Rewrite Image Upload Service**: Refactor `lib/services/image-upload.ts` to use `@azure/storage-blob` for uploads instead of `supabase.storage`.
  - Implement `uploadImage` using `BlockBlobClient`.
  - Ensure it returns the correct public URL format.

## Phase 4: Cleanup & Verification
- [ ] **Verify Build**: Run `npm run build` to ensure type safety with the new libraries.
- [ ] **Audit**: Re-run the "README Test" to confirm all Azure claims are now passing.
