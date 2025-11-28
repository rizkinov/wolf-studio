# Environment Setup Guide

Complete guide for setting up Wolf Studio development and production environments.

## Quick Start

### 1. Prerequisites

- **Node.js**: 18.0 or higher
- **npm**: 8.0 or higher
- **Git**: Latest version

### 2. Clone and Install

```bash
git clone <repository-url>
cd wolf-studio
npm install
```

### 3. Environment Configuration

Create `.env.local` in project root:

```env
# Supabase Configuration (Current)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 4. Get Supabase Credentials

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Settings > API**
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Service role key** → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Keep secret!)

### 5. Start Development Server

```bash
npm run dev
```

Visit:
- **Public site**: http://localhost:3000
- **Portfolio**: http://localhost:3000/wolf-studio
- **Admin**: http://localhost:3000/admin

## Environment Variables Reference

### Required Variables

#### Supabase (Current Setup)
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

#### Application
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### Optional Variables

#### Performance Monitoring
```env
NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING=true
NEXT_PUBLIC_PERFORMANCE_SAMPLE_RATE=0.1
```

#### Security
```env
SECURITY_HEADERS_ENABLED=true
RATE_LIMIT_ENABLED=true
RATE_LIMIT_REQUESTS_PER_MINUTE=60
```

#### Logging
```env
LOG_LEVEL=info
```

## Azure Migration Setup

If migrating to Azure, see [Migration Guide](../migration/migration-summary.md).

Create `.env.azure`:

```env
# Azure PostgreSQL
AZURE_POSTGRESQL_HOST=your-server.postgres.database.azure.com
AZURE_POSTGRESQL_USER=adminuser
AZURE_POSTGRESQL_PASSWORD=your-password
AZURE_POSTGRESQL_DATABASE=wolf_studio

# Azure Blob Storage
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=...
AZURE_STORAGE_ACCOUNT_NAME=your-storage-account
AZURE_BLOB_CONTAINER_NAME=project-images

# Azure AD B2C
AZURE_AD_B2C_TENANT_NAME=your-tenant
AZURE_AD_B2C_CLIENT_ID=your-client-id
AZURE_AD_B2C_CLIENT_SECRET=your-client-secret

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
```

See [Azure Migration Guide](../migration/azure-migration-guide.md) for complete setup instructions.

## Environment-Specific Configuration

### Development
- Hot reload enabled
- Detailed error messages
- No rate limiting
- Relaxed security headers

### Staging
- Production build
- Moderate rate limiting
- Full security headers
- Error tracking enabled

### Production
- Optimized build
- Strict rate limiting
- Full security features
- Monitoring enabled

## Testing Environment Setup

```bash
# Install test dependencies
npm run test:setup

# Run tests
npm run test              # Unit tests
npm run test:e2e          # End-to-end tests
npm run test:playwright   # Browser tests
```

## Troubleshooting

### Build Failures
```bash
# Clear cache and reinstall
rm -rf .next node_modules
npm install
npm run build
```

### Database Connection Issues
```bash
# Verify environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# Test connection
curl -X GET "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/" \
  -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY"
```

### Permission Issues
- Service role key required for admin operations
- Check Supabase RLS policies
- Verify user authentication status

## Security Notes

- Never commit `.env.local` or `.env.azure` to version control
- Rotate service role keys periodically
- Use different keys for development/production
- Enable MFA for Supabase dashboard access

## Next Steps

1. [Database Setup](./database-setup.md) - Configure PostgreSQL
2. [Deployment Guide](../deployment/deployment-guide.md) - Deploy to production
3. [Migration Guide](../migration/migration-summary.md) - Migrate to Azure
