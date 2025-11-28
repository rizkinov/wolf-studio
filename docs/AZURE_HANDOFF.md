# Azure Migration Handoff Guide

This codebase is currently configured to run on **Supabase** for production. However, it has been fully prepared for a future migration to **Azure** (Azure AD, Azure SQL, Azure Blob Storage).

## Azure Implementation Files

The Azure-specific implementation files have been generated and stored in the `migration/azure/` directory. These files are ready to replace the current Supabase implementations when you are ready to switch.

### File Mappings

| Current File (Supabase) | Azure Replacement (in `migration/azure/`) | Purpose |
| :--- | :--- | :--- |
| `middleware.ts` | `middleware.ts` | Handles Auth protection (switches from Supabase Auth to NextAuth/Azure AD) |
| `lib/auth/context.tsx` | `lib/auth/context.tsx` | Client-side auth context (switches from Supabase `useUser` to NextAuth `useSession`) |
| `lib/services/image-upload.ts` | `lib/services/image-upload.ts` | Image upload service (switches from Supabase Storage to Azure Blob Storage) |
| `app/admin/login/page.tsx` | `app/admin/login/page.tsx` | Login page (switches from Email/Password form to "Sign in with Microsoft" button) |
| *New File* | `lib/auth.ts` | NextAuth v5 configuration |
| *New File* | `app/api/auth/[...nextauth]/route.ts` | NextAuth API Route Handler |

## How to Activate Azure Migration

When you are ready to deploy to Azure, follow these steps:

1.  **Copy the Azure files into place**:
    ```bash
    cp migration/azure/middleware.ts ./middleware.ts
    cp migration/azure/lib/auth/context.tsx ./lib/auth/context.tsx
    cp migration/azure/lib/services/image-upload.ts ./lib/services/image-upload.ts
    cp migration/azure/lib/auth.ts ./lib/auth.ts
    mkdir -p app/api/auth/[...nextauth]
    cp migration/azure/app/api/auth/\[...nextauth\]/route.ts ./app/api/auth/\[...nextauth\]/route.ts
    cp migration/azure/app/admin/login/page.tsx ./app/admin/login/page.tsx
    ```

2.  **Set Environment Variables**:
    Ensure the following variables are set in your Azure environment (or `.env.local` for testing):
    *   `AZURE_AD_CLIENT_ID`
    *   `AZURE_AD_CLIENT_SECRET`
    *   `AZURE_AD_TENANT_ID`
    *   `NEXTAUTH_SECRET`
    *   `NEXTAUTH_URL`
    *   `DATABASE_URL` (Azure SQL connection string)
    *   `AZURE_STORAGE_CONNECTION_STRING`

3.  **Database Setup**:
    *   Run `npx prisma db push` to create the tables in Azure SQL.

4.  **Build & Deploy**:
    *   Run `npm run build` to verify everything is correct.
    *   Deploy the Docker container to Azure Container Apps.

## Dependencies

The following Azure-related dependencies are already installed in `package.json`:
*   `next-auth`
*   `@next-auth/prisma-adapter`
*   `@prisma/client`
*   `prisma`
*   `@azure/storage-blob`

## Notes

*   **Prisma**: The `prisma/schema.prisma` file is already configured for PostgreSQL (Azure SQL) and includes the necessary NextAuth tables (`Account`, `Session`, `User`, `VerificationToken`).
*   **NextConfig**: `next.config.js` is already configured to allow images from `*.blob.core.windows.net`.
