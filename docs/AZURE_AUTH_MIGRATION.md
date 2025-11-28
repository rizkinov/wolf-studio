---
description: How to migrate authentication from Supabase to Azure AD (Entra ID)
---

# Migrating Authentication to Azure AD (Microsoft Entra ID)

If you are migrating the database to Azure SQL, **Supabase Auth will no longer work**. You must replace it with a standard authentication provider like **NextAuth.js** connected to **Azure AD**.

## 1. Install NextAuth.js
The developer needs to install these packages:
```bash
npm install next-auth @next-auth/prisma-adapter
```

## 2. Configure Azure AD (Entra ID)
1. Go to **Azure Portal** > **Microsoft Entra ID** > **App registrations**.
2. Register a new app (e.g., "Wolf Studio").
3. Add a **Redirect URI** (Web): `https://<your-app-url>/api/auth/callback/azure-ad` (use `http://localhost:3000/...` for local dev).
4. Create a **Client Secret**.
5. Note down:
   - `AZURE_AD_CLIENT_ID` (Application ID)
   - `AZURE_AD_CLIENT_SECRET` (Value from step 4)
   - `AZURE_AD_TENANT_ID` (Directory ID)

## 3. Implement NextAuth in Next.js

Create `app/api/auth/[...nextauth]/route.ts`:

```typescript
import NextAuth from "next-auth"
import AzureADProvider from "next-auth/providers/azure-ad"

const handler = NextAuth({
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      // Add custom logic here to fetch user role from your Azure SQL database
      // session.user.role = ...
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
