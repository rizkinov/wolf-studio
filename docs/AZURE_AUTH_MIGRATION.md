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

1. After setting up Prisma, run:
   ```bash
   npx prisma db pull  # Pulls your existing public schema
   ```

2. Open `prisma/schema.prisma` and append the following models. These are required for NextAuth + Azure AD:

   ```prisma
   model Account {
     id                 String  @id @default(cuid())
     userId             String
     type               String
     provider           String
     providerAccountId  String
     refresh_token      String?  @db.Text
     access_token       String?  @db.Text
     expires_at         Int?
     token_type         String?
     scope              String?
     id_token           String?  @db.Text
     session_state      String?
## 7. Troubleshooting

Here are common issues you might encounter during the migration:

### 1. "Reply URL does not match" (Azure AD)
*   **Error**: You see an error screen from Microsoft saying the reply URL specified in the request does not match the reply URLs configured for the application.
*   **Fix**:
    *   Check your `.env` file. `NEXTAUTH_URL` must match exactly (e.g., `http://localhost:3000` vs `http://localhost:3000/`).
    *   In Azure Portal > App Registration > Authentication, ensure the **Redirect URI** is exactly `http://localhost:3000/api/auth/callback/azure-ad` (for local) or `https://your-domain.com/api/auth/callback/azure-ad` (for production).

### 2. "Database error: relation 'Account' does not exist"
*   **Error**: NextAuth fails to sign in, and logs show missing tables.
*   **Fix**: You haven't pushed the Prisma schema to the database yet.
    *   Run `npx prisma db push` to create the necessary auth tables (`Account`, `Session`, `User`, `VerificationToken`).

### 3. "Invalid client secret is provided"
*   **Error**: Azure AD rejects the authentication request.
*   **Fix**:
    *   Ensure you copied the **Value** of the client secret, not the **Secret ID**.
    *   Check if the secret has expired in the Azure Portal.

### 4. "PrismaClientInitializationError"
*   **Error**: The application crashes on startup.
*   **Fix**:
    *   Verify your `DATABASE_URL` in `.env`. It must be a valid connection string to your Azure PostgreSQL instance.
    *   Ensure your IP address is allowed in the Azure Database firewall settings.

     user User @relation(fields: [userId], references: [id], onDelete: Cascade)

     @@unique([provider, providerAccountId])
   }

   model Session {
     id           String   @id @default(cuid())
     sessionToken String   @unique
     userId       String
     expires      DateTime
     user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
   }

   model User {
     id            String    @id @default(cuid())
     name          String?
     email         String?   @unique
     emailVerified DateTime?
     image         String?
     accounts      Account[]
     sessions      Session[]
   }

   model VerificationToken {
     identifier String
     token      String   @unique
     expires    DateTime

     @@unique([identifier, token])
   }
   ```

3. Push these changes to your Azure database:
   ```bash
   npx prisma db push
   ```
