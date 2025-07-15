# Wolf Studio Deployment Guide

This guide covers deployment of Wolf Studio with full monitoring, security, and performance features across multiple platforms.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Vercel Deployment](#vercel-deployment)
4. [AWS Deployment](#aws-deployment)
5. [Azure Deployment](#azure-deployment)
6. [Docker Deployment](#docker-deployment)
7. [Monitoring Setup](#monitoring-setup)
8. [Security Configuration](#security-configuration)
9. [Performance Optimization](#performance-optimization)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Accounts
- **Supabase**: Database and authentication
- **Vercel**: Hosting (recommended)
- **GitHub**: Source control
- **Domain Provider**: Custom domain (optional)

### Monitoring Services (Optional)
- **Sentry**: Error tracking
- **DataDog**: APM and logging
- **New Relic**: Performance monitoring
- **LogRocket**: Session replay

### System Requirements
- **Node.js**: 18.0 or higher
- **npm**: 8.0 or higher
- **Git**: Latest version

---

## Environment Setup

### 1. Clone Repository
```bash
git clone https://github.com/your-org/wolf-studio.git
cd wolf-studio
npm install
```

### 2. Environment Variables

Create `.env.local` for local development:

```env
# Required - Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Required - Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-32-character-secret-key

# Required - Application
NEXT_PUBLIC_APP_NAME="Wolf Studio"
NEXT_PUBLIC_APP_URL="https://your-domain.com"

# Optional - Monitoring
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
NEXT_PUBLIC_DATADOG_TOKEN=your_datadog_token
NEXT_PUBLIC_NEWRELIC_LICENSE_KEY=your_newrelic_key

# Optional - Security
SECURITY_RATE_LIMIT_MAX=100
SECURITY_RATE_LIMIT_WINDOW=900000
SECURITY_CSRF_SECRET=your_csrf_secret
SECURITY_IP_WHITELIST=127.0.0.1,::1

# Optional - Performance
PERFORMANCE_API_THRESHOLD=1000
PERFORMANCE_DB_THRESHOLD=500
PERFORMANCE_MEMORY_THRESHOLD=80
PERFORMANCE_ERROR_RATE_THRESHOLD=0.05
```

### 3. Database Setup

#### Supabase Setup
1. Create a new project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key
3. Run migrations:
```bash
cd supabase
npx supabase db push
```

#### Manual Database Setup
If using your own PostgreSQL instance:
```sql
-- Create database
CREATE DATABASE wolf_studio;

-- Run migration files in order
\i supabase/migrations/20241201000001_initial_schema.sql
\i supabase/migrations/20241201000002_rls_policies.sql
\i supabase/migrations/20241201000003_seed_data.sql
```

### 4. Test Local Setup
```bash
npm run dev
```

Visit:
- Admin: `http://localhost:3000/admin`
- Portfolio: `http://localhost:3000/wolf-studio`
- Health Check: `http://localhost:3000/api/health`

---

## Vercel Deployment

### 1. Automatic Deployment

#### Connect GitHub Repository
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure build settings:
   - **Framework**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

#### Environment Variables
Add all environment variables from your `.env.local`:

```bash
# Navigate to Project Settings > Environment Variables
# Add each variable for Production, Preview, and Development
```

### 2. Manual Deployment

#### Using Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Configure environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
# ... add all other variables
```

### 3. Custom Domain Configuration

#### Add Domain
1. Go to Project Settings > Domains
2. Add your domain
3. Configure DNS records:
   - **A Record**: `@` → `76.76.19.19`
   - **CNAME**: `www` → `cname.vercel-dns.com`

#### SSL Configuration
Vercel automatically provides SSL certificates. Verify:
1. Domain status shows "Valid"
2. Certificate is active
3. HTTPS redirect is enabled

### 4. Vercel-Specific Optimizations

#### vercel.json Configuration
```json
{
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "regions": ["iad1"],
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install"
}
```

---

## AWS Deployment

### 1. AWS Amplify Deployment

#### Setup
```bash
# Install AWS CLI and Amplify CLI
npm install -g @aws-amplify/cli
amplify configure
```

#### Initialize Project
```bash
amplify init
# Follow prompts to configure project
```

#### Add Hosting
```bash
amplify add hosting
# Choose Amplify Hosting
# Select GitHub repository
```

#### Environment Variables
```bash
# Add environment variables
amplify env add production
# Configure variables in AWS Console
```

#### Deploy
```bash
amplify publish
```

### 2. AWS Lambda + CloudFront

#### Build for Lambda
```bash
# Install serverless framework
npm install -g serverless
npm install serverless-nextjs-plugin

# Configure serverless.yml
```

#### serverless.yml
```yaml
service: wolf-studio

provider:
  name: aws
  runtime: nodejs18.x
  region: us-east-1
  stage: ${opt:stage, 'dev'}

plugins:
  - serverless-nextjs-plugin

custom:
  nextjs:
    memorySize: 512
    timeout: 30
    
resources:
  Resources:
    # CloudFront distribution
    # S3 bucket for static assets
    # Lambda functions
```

#### Deploy
```bash
serverless deploy --stage production
```

### 3. AWS ECS Deployment

#### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

#### ECS Task Definition
```json
{
  "family": "wolf-studio",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [
    {
      "name": "wolf-studio",
      "image": "your-ecr-repo/wolf-studio:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ]
    }
  ]
}
```

---

## Azure Deployment

### 1. Azure Static Web Apps

#### Setup
```bash
# Install Azure CLI
npm install -g @azure/static-web-apps-cli

# Login
az login
```

#### Deploy
```bash
# Initialize
swa init

# Deploy
swa deploy --env production
```

#### Configuration
```json
{
  "routes": [
    {
      "route": "/api/*",
      "allowedRoles": ["authenticated"]
    },
    {
      "route": "/admin/*",
      "allowedRoles": ["admin"]
    }
  ],
  "responseOverrides": {
    "404": {
      "rewrite": "/404.html"
    }
  }
}
```

### 2. Azure App Service

#### Create App Service
```bash
# Create resource group
az group create --name wolf-studio-rg --location eastus

# Create app service plan
az appservice plan create \
  --name wolf-studio-plan \
  --resource-group wolf-studio-rg \
  --sku B1 \
  --is-linux

# Create web app
az webapp create \
  --resource-group wolf-studio-rg \
  --plan wolf-studio-plan \
  --name wolf-studio-app \
  --runtime "NODE|18-lts"
```

#### Deploy
```bash
# Deploy from GitHub
az webapp deployment source config \
  --name wolf-studio-app \
  --resource-group wolf-studio-rg \
  --repo-url https://github.com/your-org/wolf-studio \
  --branch main \
  --manual-integration
```

---

## Docker Deployment

### 1. Docker Setup

#### Dockerfile
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

#### docker-compose.yml
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
    depends_on:
      - db
  
  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=wolf_studio
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

### 2. Kubernetes Deployment

#### deployment.yaml
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: wolf-studio
spec:
  replicas: 3
  selector:
    matchLabels:
      app: wolf-studio
  template:
    metadata:
      labels:
        app: wolf-studio
    spec:
      containers:
      - name: wolf-studio
        image: your-registry/wolf-studio:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: NEXT_PUBLIC_SUPABASE_URL
          valueFrom:
            secretKeyRef:
              name: wolf-studio-secrets
              key: supabase-url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

#### service.yaml
```yaml
apiVersion: v1
kind: Service
metadata:
  name: wolf-studio-service
spec:
  selector:
    app: wolf-studio
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
  type: LoadBalancer
```

---

## Monitoring Setup

### 1. Sentry Setup

#### Installation
```bash
npm install @sentry/nextjs
```

#### Configuration
```javascript
// sentry.client.config.js
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  beforeSend(event) {
    // Filter sensitive data
    return event;
  },
});
```

### 2. DataDog Setup

#### Installation
```bash
npm install @datadog/browser-logs @datadog/browser-rum
```

#### Configuration
```javascript
// lib/monitoring/datadog.js
import { datadogLogs } from '@datadog/browser-logs';
import { datadogRum } from '@datadog/browser-rum';

datadogLogs.init({
  clientToken: process.env.NEXT_PUBLIC_DATADOG_TOKEN,
  site: 'datadoghq.com',
  env: process.env.NODE_ENV,
  service: 'wolf-studio',
  version: '1.0.0',
  sampleRate: 100,
});

datadogRum.init({
  applicationId: process.env.NEXT_PUBLIC_DATADOG_APP_ID,
  clientToken: process.env.NEXT_PUBLIC_DATADOG_TOKEN,
  site: 'datadoghq.com',
  service: 'wolf-studio',
  env: process.env.NODE_ENV,
  version: '1.0.0',
  sampleRate: 100,
  trackInteractions: true,
  trackResources: true,
  trackLongTasks: true,
});
```

### 3. Health Check Setup

#### Kubernetes Health Checks
```yaml
livenessProbe:
  httpGet:
    path: /api/health
    port: 3000
  initialDelaySeconds: 30
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 3

readinessProbe:
  httpGet:
    path: /api/health
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 5
  timeoutSeconds: 3
  failureThreshold: 3
```

#### Docker Health Checks
```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1
```

---

## Security Configuration

### 1. Environment-Specific Security

#### Production Security Headers
```javascript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; media-src 'self' https:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';"
  }
];

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};
```

### 2. Rate Limiting Configuration

#### Production Rate Limits
```env
# API Rate Limiting
SECURITY_RATE_LIMIT_MAX=100
SECURITY_RATE_LIMIT_WINDOW=900000

# Authentication Rate Limiting
AUTH_RATE_LIMIT_MAX=5
AUTH_RATE_LIMIT_WINDOW=900000

# Admin Rate Limiting
ADMIN_RATE_LIMIT_MAX=200
ADMIN_RATE_LIMIT_WINDOW=900000
```

### 3. IP Filtering

#### Whitelist Configuration
```env
# Allow specific IPs
SECURITY_IP_WHITELIST=127.0.0.1,::1,your.office.ip

# Block suspicious IPs
SECURITY_BLOCKED_IPS=suspicious.ip.1,suspicious.ip.2
```

---

## Performance Optimization

### 1. Build Optimization

#### Next.js Configuration
```javascript
// next.config.js
module.exports = {
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  experimental: {
    optimizeCss: true,
    optimizeServerReact: true,
  },
  images: {
    domains: ['your-domain.com'],
    formats: ['image/webp', 'image/avif'],
  },
  poweredByHeader: false,
  compress: true,
  swcMinify: true,
};
```

### 2. Database Optimization

#### Connection Pooling
```javascript
// lib/supabase/config.js
export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  options: {
    db: {
      schema: 'public',
    },
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
    global: {
      headers: { 'x-my-custom-header': 'my-app-name' },
    },
  },
};
```

### 3. Caching Strategy

#### Redis Configuration
```javascript
// lib/cache/redis.js
import { createClient } from 'redis';

const client = createClient({
  url: process.env.REDIS_URL,
  socket: {
    connectTimeout: 60000,
  },
});

export const cache = {
  get: async (key) => {
    return await client.get(key);
  },
  set: async (key, value, ttl = 3600) => {
    return await client.setEx(key, ttl, value);
  },
  del: async (key) => {
    return await client.del(key);
  },
};
```

---

## Troubleshooting

### 1. Common Issues

#### Build Failures
```bash
# Clear cache
rm -rf .next
rm -rf node_modules
npm install
npm run build

# Check Node.js version
node --version  # Should be 18+
```

#### Database Connection Issues
```bash
# Test connection
curl -X GET "https://your-project.supabase.co/rest/v1/" \
  -H "apikey: your-anon-key"

# Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
```

#### Memory Issues
```bash
# Increase Node.js memory
export NODE_OPTIONS="--max-old-space-size=4096"

# Monitor memory usage
node --inspect --max-old-space-size=4096 server.js
```

### 2. Performance Issues

#### Slow API Responses
1. Check database query performance
2. Verify connection pooling
3. Review API rate limiting
4. Monitor memory usage

#### High Memory Usage
1. Check for memory leaks
2. Optimize image processing
3. Review caching strategy
4. Monitor garbage collection

### 3. Security Issues

#### Rate Limiting Errors
1. Check IP whitelist configuration
2. Review rate limit thresholds
3. Monitor security logs
4. Verify middleware configuration

#### Authentication Issues
1. Check JWT token expiration
2. Verify NEXTAUTH_SECRET
3. Review session configuration
4. Clear browser localStorage

### 4. Monitoring Issues

#### Missing Metrics
1. Verify environment variables
2. Check APM configuration
3. Review logging levels
4. Test health endpoints

#### Alert Fatigue
1. Adjust alert thresholds
2. Review alert rules
3. Configure alert channels
4. Monitor alert frequency

---

## Post-Deployment Checklist

### 1. Verification Steps
- [ ] Application loads correctly
- [ ] All routes are accessible
- [ ] Database connections work
- [ ] Authentication functions properly
- [ ] File uploads work
- [ ] Health checks pass
- [ ] Monitoring is active
- [ ] Security headers are set
- [ ] Performance metrics are collected

### 2. Security Verification
- [ ] HTTPS is enabled
- [ ] Security headers are active
- [ ] Rate limiting works
- [ ] Authentication is secure
- [ ] Environment variables are set
- [ ] Secrets are properly managed
- [ ] IP filtering is configured
- [ ] CORS is properly configured

### 3. Performance Verification
- [ ] Page load times are acceptable
- [ ] API responses are fast
- [ ] Database queries are optimized
- [ ] Images are optimized
- [ ] Caching is working
- [ ] CDN is configured
- [ ] Memory usage is normal
- [ ] CPU usage is acceptable

### 4. Monitoring Verification
- [ ] Logs are being collected
- [ ] Metrics are being tracked
- [ ] Health checks are passing
- [ ] Alerts are configured
- [ ] Error tracking is active
- [ ] Performance monitoring is working
- [ ] Audit logging is enabled
- [ ] Security events are logged

---

## Support and Maintenance

### 1. Regular Maintenance
- **Weekly**: Review logs and metrics
- **Monthly**: Update dependencies
- **Quarterly**: Security audit
- **Annually**: Performance review

### 2. Emergency Procedures
- **Incident Response**: Follow incident response plan
- **Rollback**: Use deployment rollback procedures
- **Recovery**: Database and file recovery procedures
- **Communication**: Stakeholder communication plan

### 3. Contact Information
- **Technical Support**: tech@wolfstudio.com
- **Security Issues**: security@wolfstudio.com
- **Emergency**: +1 (555) 123-4567

---

This deployment guide provides comprehensive instructions for deploying Wolf Studio with full monitoring, security, and performance capabilities. Follow the appropriate section for your deployment platform and customize the configuration based on your specific requirements. 