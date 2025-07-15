# Wolf Studio - Digital Portfolio & Business Platform

<div align="center">
  <img src="logos/wolf-studio-logo-head.svg" alt="Wolf Studio Logo" width="120" height="120">
  
  **Digital portfolio and business platform for Wolf Studio - CBRE's workplace design firm**
  
  [![Next.js](https://img.shields.io/badge/Next.js-15.2.5-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
  [![Supabase](https://img.shields.io/badge/Supabase-Latest-green?style=for-the-badge&logo=supabase)](https://supabase.com/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4+-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
</div>

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Features](#features)
4. [Prerequisites](#prerequisites)
5. [Installation](#installation)
6. [Configuration](#configuration)
7. [Deployment](#deployment)
8. [Database Setup](#database-setup)
9. [Security](#security)
10. [API Documentation](#api-documentation)
11. [Contributing](#contributing)
12. [Support](#support)

---

## Project Overview

Wolf Studio is a renowned workplace design firm under CBRE, specializing in transforming offices into places that bring joy and fulfillment to people at work. Based in Singapore and Hong Kong, Wolf Studio believes in creating workplaces that help organizations grow while making the design journey delightful and rewarding for their clients.

This website serves as Wolf Studio's digital portfolio and business platform, equipped with enterprise-grade portfolio management capabilities. It showcases their extensive work in workplace design, their team, and their services, while providing a robust admin dashboard for managing projects, users, and content.

### About Wolf Studio

Wolf Studio stands firm in their belief of creating "a world where everyone loves going to work." With over 75 years of collective workplace design experience, they have transformed more than 10 million square feet of office space across 750+ client projects over the last 10 years.

**Key Services:**
- Design Consultancy
- Design & Build
- Feasibility Studies  
- Visual Content

**Locations:**
- **Singapore Industrial Studio**: 61 Ubi Road 1 #04-21/22, Singapore 408727
- **Singapore CBD Studio**: 6 Battery Rd, #32-01, Singapore 049909
- **Hong Kong Studio**: Level 27, One Pacific Place, 88 Queensway, Admiralty, Hong Kong

### Technology Platform Capabilities

This website provides Wolf Studio with a comprehensive digital platform featuring:

- **Project Portfolio Management**: Complete showcase of their workplace design projects
- **Client Relationship Management**: Tools for managing client projects and relationships
- **Content Management System**: Rich content management for project descriptions and media
- **Team Management**: Showcase of team members and their expertise
- **Business Analytics**: Insights into project performance and client engagement
- **Enterprise Security**: Robust security measures for client data protection

### Key Capabilities

- **Project Portfolio Showcase**: Complete showcase of Wolf Studio's workplace design projects
- **Client Project Management**: Tools for managing design projects and client relationships
- **Design Content Management**: Rich content management for project descriptions, images, and case studies
- **Team Showcase**: Professional presentation of Wolf Studio's design team and expertise
- **Business Analytics**: Insights into project performance and client engagement
- **Multi-Brand Support**: Support for both Wolf Studio and CBRE branding
- **Enterprise Security**: Robust security measures for client data and project confidentiality

### Technology Stack

- **Frontend**: Next.js 15 with App Router, React 18, TypeScript
- **Database**: Supabase (PostgreSQL) with real-time subscriptions
- **Authentication**: Supabase Auth with JWT tokens
- **Storage**: Supabase Storage for file management
- **Styling**: Tailwind CSS with custom design system
- **Deployment**: Vercel with CI/CD pipeline
- **Monitoring**: Built-in performance and error tracking

---

## Architecture

### System Architecture

```mermaid
graph TD
    A[Client Browser] --> B[Next.js Frontend]
    B --> C[Supabase Auth]
    B --> D[Supabase Database]
    B --> E[Supabase Storage]
    B --> F[API Routes]
    F --> D
    F --> E
    G[Admin Dashboard] --> B
    H[Public Portfolio] --> B
    I[Vercel Deployment] --> B
```

### Core Components

#### Frontend Architecture
- **Next.js App Router**: Modern routing with layouts and nested routes
- **React Server Components**: Optimized rendering with server-side execution
- **TypeScript**: Type safety and better developer experience
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Radix UI**: Accessible component primitives
- **Framer Motion**: Smooth animations and transitions

#### Backend Architecture
- **Supabase Database**: PostgreSQL with real-time capabilities
- **Row Level Security (RLS)**: Database-level security policies
- **Supabase Auth**: JWT-based authentication system
- **Supabase Storage**: File upload and management
- **API Routes**: Server-side logic and data processing

#### Security Architecture
- **Authentication**: Multi-factor authentication support
- **Authorization**: Role-based access control (RBAC)
- **Data Protection**: Encryption at rest and in transit
- **Security Headers**: CSP, HSTS, and other security headers
- **Input Validation**: Comprehensive input sanitization
- **Rate Limiting**: API rate limiting and DDoS protection

---

## Features

### 🎨 Portfolio Management
- **Project Showcase**: Rich project galleries with high-resolution images
- **Case Studies**: Detailed project documentation with before/after comparisons
- **Interactive Galleries**: Lightbox galleries with zoom and navigation
- **Mobile Responsive**: Optimized viewing across all devices
- **SEO Optimized**: Enhanced search engine visibility

### 🔐 Admin Dashboard
- **Project Management**: Create, edit, and organize portfolio projects
- **Content Management**: Rich text editing with media embedding
- **User Management**: Admin user creation and permission management
- **Analytics Dashboard**: Project performance and visitor insights
- **File Management**: Centralized media library with organization tools

### 🚀 Performance & Monitoring
- **Structured Logging**: Comprehensive logging with correlation IDs
- **Performance Monitoring**: Real-time performance metrics and alerts
- **Error Tracking**: Automated error detection and reporting
- **Health Checks**: System health monitoring and status pages
- **Security Monitoring**: Security event logging and audit trails

### 📊 Analytics & Insights
- **Web Vitals**: Core Web Vitals monitoring and optimization
- **User Behavior**: Page views, session duration, and engagement metrics
- **Performance Metrics**: Load times, API response times, and error rates
- **System Metrics**: Database performance, storage usage, and resource utilization
- **Business Intelligence**: Project performance and client engagement insights

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **npm** (v8.0.0 or higher) or **yarn** (v1.22.0 or higher)
- **Git** (v2.0.0 or higher)
- **Supabase CLI** (v1.0.0 or higher)

### System Requirements

- **Operating System**: macOS, Linux, or Windows 10+
- **Memory**: 4GB RAM minimum (8GB recommended)
- **Storage**: 2GB available space
- **Network**: Stable internet connection for API calls

---

## Installation

### Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd wolf-studio

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
```

### Detailed Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd wolf-studio
   ```

2. **Install dependencies**
   ```bash
   npm install
   
   # Or using yarn
   yarn install
   ```

3. **Environment setup**
   ```bash
   # Copy environment template
   cp .env.example .env.local
   
   # Edit environment variables
   nano .env.local
   ```

4. **Database setup**
   ```bash
   # Initialize Supabase
   supabase init
   
   # Start local Supabase
   supabase start
   
   # Run migrations
   npm run db:migrate
   
   # Seed database (optional)
   npm run db:seed
   ```

5. **Development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - **Public Site**: http://localhost:3000
   - **Admin Dashboard**: http://localhost:3000/admin

---

## Configuration

### Environment Variables

#### Required Variables
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Database
DATABASE_URL=your_database_url
```

#### Optional Variables
```env
# Monitoring & Analytics
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id
SENTRY_DSN=your_sentry_dsn
LOG_LEVEL=info

# Performance
NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING=true
NEXT_PUBLIC_PERFORMANCE_SAMPLE_RATE=0.1

# Security
SECURITY_HEADERS_ENABLED=true
RATE_LIMIT_ENABLED=true
RATE_LIMIT_REQUESTS_PER_MINUTE=60
```

### Database Configuration

#### Migration Setup
```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
```

#### Security Policies
```sql
-- Project access policy
CREATE POLICY "Users can view published projects"
  ON projects FOR SELECT
  USING (is_published = true);

-- Admin access policy
CREATE POLICY "Admins can manage all projects"
  ON projects FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');
```

---

## Deployment

### Vercel Deployment (Recommended)

1. **Connect to Vercel**
   ```bash
   npm install -g vercel
   vercel login
   vercel link
   ```

2. **Configure environment variables**
   ```bash
   # Set production environment variables
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   vercel env add SUPABASE_SERVICE_ROLE_KEY
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Alternative Deployment Options

#### AWS Amplify
```bash
# Install AWS CLI
npm install -g @aws-amplify/cli

# Configure deployment
amplify configure
amplify init
amplify add hosting
amplify publish
```

#### Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy to Netlify
netlify deploy --prod
```

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

```bash
# Build and run
docker build -t wolf-studio .
docker run -p 3000:3000 wolf-studio
```

---

## Database Setup

### Supabase Setup

1. **Create Supabase project**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Note your project URL and anon key

2. **Run migrations**
   ```bash
   # Apply database schema
   supabase db reset
   
   # Or run specific migrations
   supabase migration up
   ```

3. **Configure Row Level Security**
   ```sql
   -- Enable RLS on all tables
   ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
   ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
   ALTER TABLE users ENABLE ROW LEVEL SECURITY;
   ```

### Database Schema

#### Core Tables
```sql
-- Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description JSONB,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Project images table
CREATE TABLE project_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_type TEXT CHECK (image_type IN ('banner', 'gallery')),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

#### Security Policies
```sql
-- Public read access for published projects
CREATE POLICY "Public can view published projects"
  ON projects FOR SELECT
  USING (is_published = true);

-- Admin full access
CREATE POLICY "Admin full access"
  ON projects FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');
```

---

## Security

### Authentication & Authorization

#### Multi-Factor Authentication
```typescript
// lib/auth/mfa.ts
import { supabase } from '@/lib/supabase/client'

export async function enableMFA(userId: string) {
  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: 'totp',
    issuer: 'Wolf Studio'
  })
  
  if (error) throw error
  return data
}
```

#### Role-Based Access Control
```typescript
// lib/auth/rbac.ts
export const roles = {
  admin: ['read', 'write', 'delete'],
  editor: ['read', 'write'],
  viewer: ['read']
}

export function hasPermission(userRole: string, action: string) {
  return roles[userRole]?.includes(action) || false
}
```

### Data Protection

#### Encryption at Rest
```sql
-- Enable transparent data encryption
ALTER TABLE projects ENABLE ENCRYPTION;
ALTER TABLE users ENABLE ENCRYPTION;
```

#### Input Validation
```typescript
// lib/validation/schemas.ts
import { z } from 'zod'

export const projectSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  is_published: z.boolean().default(false)
})
```

#### Rate Limiting
```typescript
// lib/middleware/rate-limit.ts
import { rateLimit } from 'express-rate-limit'

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
})
```

### Security Headers

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
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
]
```

---

## API Documentation

### REST API Endpoints

#### Projects API
```typescript
// GET /api/projects
// Get all published projects
GET /api/projects?published=true&limit=10&offset=0

// GET /api/projects/[id]
// Get project by ID
GET /api/projects/123e4567-e89b-12d3-a456-426614174000

// POST /api/projects
// Create new project (Admin only)
POST /api/projects
{
  "title": "Project Title",
  "description": "Project description",
  "is_published": false
}

// PUT /api/projects/[id]
// Update project (Admin only)
PUT /api/projects/123e4567-e89b-12d3-a456-426614174000
{
  "title": "Updated Title",
  "is_published": true
}

// DELETE /api/projects/[id]
// Delete project (Admin only)
DELETE /api/projects/123e4567-e89b-12d3-a456-426614174000
```

#### Categories API
```typescript
// GET /api/categories
// Get all categories
GET /api/categories

// POST /api/categories
// Create category (Admin only)
POST /api/categories
{
  "name": "Category Name",
  "slug": "category-slug"
}
```

#### Admin API
```typescript
// GET /api/admin/stats
// Get admin statistics
GET /api/admin/stats

// GET /api/admin/users
// Get all users (Admin only)
GET /api/admin/users

// POST /api/admin/users
// Create user (Admin only)
POST /api/admin/users
{
  "email": "user@example.com",
  "role": "editor"
}
```

### GraphQL API (Optional)

```graphql
# Query projects
query GetProjects($published: Boolean, $limit: Int) {
  projects(published: $published, limit: $limit) {
    id
    title
    slug
    description
    isPublished
    createdAt
    updatedAt
    images {
      id
      imageUrl
      imageType
      displayOrder
    }
  }
}

# Mutation to create project
mutation CreateProject($input: ProjectInput!) {
  createProject(input: $input) {
    id
    title
    slug
    isPublished
  }
}
```

---

## Monitoring & Logging

### Structured Logging

```typescript
// lib/services/logger.ts
import { winston } from 'winston'

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
})

// Usage example
logger.info('User created', {
  userId: '123',
  correlationId: 'req-456',
  action: 'user.create'
})
```

### Performance Monitoring

```typescript
// lib/services/performance-monitor.ts
export class PerformanceMonitor {
  static trackApiCall(endpoint: string, duration: number, status: number) {
    const metrics = {
      endpoint,
      duration,
      status,
      timestamp: Date.now()
    }
    
    // Send to monitoring service
    this.sendMetrics(metrics)
  }
  
  static trackWebVitals(vitals: WebVitals) {
    // Track Core Web Vitals
    console.log('Web Vitals:', vitals)
  }
}
```

### Health Checks

```typescript
// app/api/health/route.ts
export async function GET() {
  const checks = {
    database: await checkDatabase(),
    storage: await checkStorage(),
    auth: await checkAuth(),
    timestamp: new Date().toISOString()
  }
  
  const isHealthy = Object.values(checks).every(
    check => check.status === 'healthy'
  )
  
  return Response.json(checks, {
    status: isHealthy ? 200 : 503
  })
}
```

### Error Tracking

```typescript
// lib/utils/error-handler.ts
import * as Sentry from '@sentry/nextjs'

export function handleError(error: Error, context: any = {}) {
  // Log error
  logger.error('Application error', {
    error: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString()
  })
  
  // Send to Sentry in production
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(error, {
      tags: context,
      level: 'error'
    })
  }
}
```

---

## Testing

### Unit Testing

```typescript
// __tests__/lib/utils.test.ts
import { describe, it, expect } from 'vitest'
import { slugify } from '@/lib/utils'

describe('slugify', () => {
  it('should convert string to slug', () => {
    expect(slugify('Hello World')).toBe('hello-world')
    expect(slugify('Special & Characters!')).toBe('special-characters')
  })
})
```

### Integration Testing

```typescript
// __tests__/api/projects.test.ts
import { describe, it, expect } from 'vitest'
import { createMocks } from 'node-mocks-http'
import handler from '@/app/api/projects/route'

describe('/api/projects', () => {
  it('should return published projects', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: { published: 'true' }
    })
    
    await handler(req, res)
    
    expect(res._getStatusCode()).toBe(200)
    expect(JSON.parse(res._getData())).toHaveProperty('data')
  })
})
```

### E2E Testing

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ]
})
```

---

## Contributing

### Development Workflow

1. **Fork the repository**
2. **Create feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make changes**
   ```bash
   # Make your changes
   git add .
   git commit -m "Add amazing feature"
   ```

4. **Test changes**
   ```bash
   npm run test
   npm run lint
   npm run build
   ```

5. **Submit pull request**
   ```bash
   git push origin feature/amazing-feature
   ```

### Code Style

#### ESLint Configuration
```json
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended"
  ],
  "rules": {
    "no-unused-vars": "error",
    "prefer-const": "error",
    "no-console": "warn"
  }
}
```

#### Prettier Configuration
```json
{
  "semi": false,
  "trailingComma": "es5",
  "singleQuote": true,
  "tabWidth": 2,
  "useTabs": false
}
```

### Commit Message Format

```
type(scope): subject

body

footer
```

**Types:**
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `test`: Adding missing tests
- `chore`: Changes to the build process or auxiliary tools

### Pull Request Guidelines

#### Before Submitting
- [ ] Tests pass
- [ ] Linting passes
- [ ] Build succeeds
- [ ] Documentation updated
- [ ] No breaking changes

---

## Support

### Documentation

- **API Documentation**: Available at `/docs/api`
- **Component Documentation**: Available at `/docs/components`
- **Deployment Guide**: Available at `/docs/deployment`
- **Security Guide**: Available at `/docs/security`

### Troubleshooting

#### Common Issues

**Build Failures**
```bash
# Clear Next.js cache
rm -rf .next
npm run build

# Clear node_modules
rm -rf node_modules
npm install
```

**Database Connection Issues**
```bash
# Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# Test database connection
npm run db:test
```

**Authentication Issues**
```bash
# Clear browser localStorage
localStorage.clear()

# Check JWT token expiration
# Verify NEXTAUTH_SECRET is set
```

#### Performance Issues

**Slow Page Load**
- Check image optimization settings
- Verify CDN configuration
- Review database query performance
- Check bundle size analysis

**Memory Issues**
- Monitor memory usage in production
- Check for memory leaks in components
- Optimize image processing
- Review caching strategies

### Monitoring & Logging

#### Production Monitoring
```typescript
// lib/monitoring/sentry.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
})
```

#### Error Tracking
```typescript
// lib/utils/error-handler.ts
import { logError } from './error-handler'

export function handleError(error: Error, context: string) {
  logError(error, { context })
  
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(error, { tags: { context } })
  }
}
```

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- **Next.js Team** for the amazing framework
- **Supabase Team** for the backend infrastructure
- **Vercel Team** for the deployment platform
- **Tailwind CSS Team** for the styling framework
- **Wolf Studio Team** for the design requirements and feedback

---

<div align="center">
  <p>Built with ❤️ by the CBRE Development Team</p>
  <p>
    <a href="https://wolf-studio.vercel.app/wolf-studio">Wolf Studio Website</a> •
    <a href="https://www.cbre.com.sg">CBRE Singapore</a>
  </p>
</div>