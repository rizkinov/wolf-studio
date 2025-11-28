/**
 * NextAuth.js Configuration for Azure AD B2C
 *
 * Replace Supabase Auth with NextAuth.js + Azure AD B2C
 */

import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { JWT } from 'next-auth/jwt';

// Azure AD B2C endpoints
const tenantName = process.env.AZURE_AD_B2C_TENANT_NAME || '';
const userFlow = process.env.AZURE_AD_B2C_PRIMARY_USER_FLOW || '';
const domain = `${tenantName}.b2clogin.com`;

const authorizationUrl = `https://${domain}/${tenantName}.onmicrosoft.com/${userFlow}/oauth2/v2.0/authorize`;
const tokenUrl = `https://${domain}/${tenantName}.onmicrosoft.com/${userFlow}/oauth2/v2.0/token`;

export const authOptions: NextAuthOptions = {
  providers: [
    // Azure AD B2C Provider
    {
      id: 'azure-ad-b2c',
      name: 'Azure AD B2C',
      type: 'oauth',
      wellKnown: `https://${domain}/${tenantName}.onmicrosoft.com/${userFlow}/v2.0/.well-known/openid-configuration`,
      authorization: {
        url: authorizationUrl,
        params: {
          scope: 'openid profile email offline_access',
        },
      },
      token: tokenUrl,
      userinfo: `https://${domain}/${tenantName}.onmicrosoft.com/${userFlow}/openid/v2.0/userinfo`,
      client: {
        client_id: process.env.AZURE_AD_B2C_CLIENT_ID!,
        client_secret: process.env.AZURE_AD_B2C_CLIENT_SECRET!,
      },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.emails?.[0] || profile.email,
          image: null,
        };
      },
    },

    // Credentials Provider (for email/password login)
    // You'll need to implement your own user verification
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // TODO: Implement your user verification logic
        // This should check against your PostgreSQL database
        // Example:
        // const user = await verifyUserCredentials(credentials.email, credentials.password);
        // if (!user) return null;

        // For now, return a placeholder
        // Replace this with actual database lookup
        return {
          id: '1',
          email: credentials.email,
          name: 'User',
          role: 'user',
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          userId: user.id,
          role: user.role || 'user',
        };
      }

      // Return previous token if the access token has not expired
      return token;
    },

    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.userId as string,
          role: token.role as string,
        },
        accessToken: token.accessToken,
      };
    },

    async redirect({ url, baseUrl }) {
      // Redirect to admin dashboard after login if URL contains /admin
      if (url.startsWith(baseUrl + '/admin')) {
        return url;
      }

      // Redirect to admin dashboard by default after login
      return baseUrl + '/admin';
    },
  },

  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  secret: process.env.NEXTAUTH_SECRET,
};

// Type extensions for NextAuth
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      role: string;
    };
    accessToken?: string;
  }

  interface User {
    role?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId?: string;
    role?: string;
    accessToken?: string;
    refreshToken?: string;
  }
}
