---
description: How to migrate authentication from Supabase to Azure AD (Entra ID)
---

# Migrating Authentication to Azure AD (Microsoft Entra ID)

If you are migrating the database to Azure SQL (PostgreSQL), **Supabase Auth will no longer work**. You must replace it with a standard authentication provider like **NextAuth.js** connected to **Azure AD**.

**Note:** Before proceeding, ensure you have migrated your database schema using the instructions in [DATABASE_MIGRATION.md](./DATABASE_MIGRATION.md).

## 1. Install NextAuth.js & Prisma
The developer needs to install these packages:
```bash
npm install next-auth @next-auth/prisma-adapter @prisma/client
npm install prisma --save-dev
```

## 2. Configure Azure AD (Entra ID)
1. Go to **Azure Portal** > **Microsoft Entra ID** > **App registrations**.
2. Register a new app (e.g., "Wolf Studio").
3. Add a **Redirect URI** (Web): `https://<your-app-url>/api/auth/callback/azure-ad` (use `http://localhost:3000/api/auth/callback/azure-ad` for local dev).
4. Create a **Client Secret**.
5. Note down:
   - `AZURE_AD_CLIENT_ID` (Application ID)
   - `AZURE_AD_CLIENT_SECRET` (Value from step 4)
   - `AZURE_AD_TENANT_ID` (Directory ID)

## 3. Implement NextAuth in Next.js

Create `app/api/auth/[...nextauth]/route.ts`. This example uses the Prisma Adapter to store user data in your migrated database.

```typescript
import NextAuth from "next-auth"
import AzureADProvider from "next-auth/providers/azure-ad"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      // Add custom logic here to fetch user role from your database
      // session.user.role = user.role
      return session
    }
  }
})

export { handler as GET, handler as POST }
```

## 4. Update Frontend Code
Refactor `lib/auth/context.tsx` to use `useSession` from `next-auth/react` instead of Supabase.

**Old (Supabase):**
```typescript
const { data: { session } } = await supabase.auth.getSession()
```

**New (NextAuth):**
```typescript
import { useSession, signIn, signOut } from "next-auth/react"

export function AuthProvider({ children }) {
  const { data: session, status } = useSession()
  // ...
}
```

## 5. Middleware Protection
Update `middleware.ts` to use NextAuth middleware for protecting `/admin` routes.

```typescript
export { default } from "next-auth/middleware"

export const config = { matcher: ["/admin/:path*"] }
```

## 6. Database Schema for Auth
Since you are using the Prisma Adapter, NextAuth requires specific tables (`Account`, `Session`, `User`, `VerificationToken`).
After setting up Prisma, run:
```bash
npx prisma db pull  # Pulls your existing public schema
```
Then, add the NextAuth models to your `schema.prisma` (refer to NextAuth docs for the schema) and run:
```bash
npx prisma db push
```
This will add the necessary auth tables to your Azure database.
