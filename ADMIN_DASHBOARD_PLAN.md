# Admin Dashboard Implementation Plan

## 📋 Overview

Add a basic admin dashboard to manage "Our Work" content via a CMS-like interface built into the same Next.js app using existing UI components. All data will be stored and retrieved via Supabase.

---

## 🎯 Project Analysis

### Current State
- **Projects stored in**: `/data/projects.ts` (basic metadata)
- **Detailed project data**: Individual component files with embedded `projectData` objects
- **No authentication**: Currently no auth system
- **Components available**: Comprehensive CBRE design system with data tables, forms, dialogs
- **Dependencies**: All necessary UI components via Radix UI and shadcn/ui

### Target State
- **Database**: Supabase Postgres with proper schema
- **Authentication**: Supabase Auth (email/password)
- **Admin Dashboard**: Full CRUD operations for projects
- **Image Management**: Supabase Storage integration
- **WYSIWYG Editor**: Rich text editing for descriptions
- **Route Protection**: Middleware for `/admin` routes

---

## 🏗️ Implementation Milestones

### **Milestone 1: Supabase Setup & Authentication**
- [ ] **1.1 Supabase Project Setup**
  - [ ] Install Supabase dependencies (`@supabase/supabase-js`, `@supabase/ssr`)
  - [ ] Create Supabase project and get credentials
  - [ ] Set up environment variables
  - [ ] Configure Supabase client with proper SSR setup
  
- [ ] **1.2 Authentication System**
  - [ ] Create auth context/provider
  - [ ] Build login page (`/admin/login`)
  - [ ] Build login form using existing CBRE components
  - [ ] Implement email/password authentication
  - [ ] Add logout functionality
  - [ ] Create auth hooks for easy usage

- [ ] **1.3 Route Protection**
  - [ ] Create middleware for `/admin` route protection
  - [ ] Add auth guards for admin components
  - [ ] Implement redirect logic (login → admin, admin → login)

### **Milestone 2: Database Schema & Migration**
- [ ] **2.1 Database Schema Design**
  - [ ] Create `projects` table with extended fields
  - [ ] Create `project_details` table for size, location, scope, year
  - [ ] Create `project_images` table for gallery management
  - [ ] Create `project_categories` table for category management
  - [ ] Set up proper foreign key relationships
  - [ ] Configure RLS (Row Level Security) policies

- [ ] **2.2 Schema Migration**
  - [ ] Write SQL migration files in `supabase/migrations/`
  - [ ] Create data migration script to move existing project data
  - [ ] Test migration with sample data
  - [ ] Document schema and relationships

- [ ] **2.3 Database Services**
  - [ ] Create project service layer for database operations
  - [ ] Implement CRUD operations with proper error handling
  - [ ] Add data validation and sanitization
  - [ ] Create TypeScript interfaces for database models

### **Milestone 3: Admin Dashboard Frontend**
- [ ] **3.1 Dashboard Layout**
  - [ ] Create `/admin` layout component
  - [ ] Design admin navigation using existing CBRE components
  - [ ] Create dashboard home page with stats overview
  - [ ] Implement responsive design for mobile/desktop

- [ ] **3.2 Projects Management Interface**
  - [ ] Create projects list view using CBREDataTable
  - [ ] Add search and filtering functionality
  - [ ] Implement pagination for large datasets
  - [ ] Add bulk operations (delete multiple projects)
  - [ ] Create project creation form
  - [ ] Create project editing form
  - [ ] Add project deletion with confirmation

- [ ] **3.3 Form Components**
  - [ ] Build project form using existing CBRE form components
  - [ ] Add form validation using built-in validation
  - [ ] Create reusable form sections (basic info, details, images)
  - [ ] Implement form state management
  - [ ] Add auto-save functionality

### **Milestone 4: Image Management & Storage**
- [ ] **4.1 Supabase Storage Setup**
  - [ ] Configure storage bucket for project images
  - [ ] Set up storage policies for admin access
  - [ ] Create image upload utilities
  - [ ] Implement image optimization and resizing

- [ ] **4.2 Image Upload Component**
  - [ ] Create drag-and-drop image upload component
  - [ ] Add image preview functionality
  - [ ] Implement progress indicators
  - [ ] Add image validation (size, format, dimensions)
  - [ ] Create image gallery management interface

- [ ] **4.3 Image Integration**
  - [ ] Connect image uploads to project forms
  - [ ] Implement banner image selection
  - [ ] Create gallery image management (add, remove, reorder)
  - [ ] Add image alt text and metadata editing

### **Milestone 5: WYSIWYG Editor Integration**
- [ ] **5.1 Editor Selection & Setup**
  - [ ] Research and select appropriate WYSIWYG editor (TinyMCE, Quill, or Tiptap)
  - [ ] Install and configure editor dependencies
  - [ ] Create editor wrapper component with CBRE styling
  - [ ] Implement editor toolbar customization

- [ ] **5.2 Editor Integration**
  - [ ] Integrate editor into project description fields
  - [ ] Add rich text formatting options
  - [ ] Implement image insertion within editor
  - [ ] Add content validation and sanitization

### **Milestone 6: Advanced Features & Polish**
- [ ] **6.1 Category Management**
  - [ ] Create category CRUD interface
  - [ ] Add category assignment to projects
  - [ ] Implement category filtering in admin
  - [ ] Update frontend to use database categories

- [ ] **6.2 Content Management Features**
  - [ ] Add project duplication functionality
  - [ ] Implement draft/published status
  - [ ] Add content versioning (basic)
  - [ ] Create content preview functionality

- [ ] **6.3 User Experience Improvements**
  - [ ] Add loading states and skeleton screens
  - [ ] Implement toast notifications using CBREToaster
  - [ ] Add confirmation dialogs for destructive actions
  - [ ] Create help documentation within admin

### **Milestone 7: Frontend Data Integration**
- [ ] **7.1 Frontend Service Layer**
  - [ ] Update project service to use Supabase instead of static data
  - [ ] Implement proper error handling for API failures
  - [ ] Add caching layer for better performance
  - [ ] Create data synchronization utilities

- [ ] **7.2 Frontend Updates**
  - [ ] Update main projects grid to use database data
  - [ ] Modify project detail pages to fetch from database
  - [ ] Update project filtering and search
  - [ ] Ensure backward compatibility during transition

### **Milestone 8: Testing & Documentation**
- [ ] **8.1 Testing**
  - [ ] Test authentication flow thoroughly
  - [ ] Test all CRUD operations
  - [ ] Test image upload and management
  - [ ] Test responsive design on various devices
  - [ ] Test error handling and edge cases

- [ ] **8.2 Documentation**
  - [ ] Update README with Supabase setup instructions
  - [ ] Document environment variables needed
  - [ ] Create admin user guide
  - [ ] Document database schema and relationships
  - [ ] Create deployment guide for Vercel

### **Milestone 9: Deployment & Launch**
- [ ] **9.1 Environment Setup**
  - [ ] Configure production Supabase environment
  - [ ] Set up environment variables in Vercel
  - [ ] Test deployment process
  - [ ] Configure domain and SSL

- [ ] **9.2 Launch Preparation**
  - [ ] Create admin user account
  - [ ] Migrate production data
  - [ ] Test all functionality in production
  - [ ] Set up monitoring and logging
  - [ ] Create backup procedures

---

## 📊 Database Schema Design

### **Projects Table**
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  slug TEXT UNIQUE NOT NULL,
  banner_image_url TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  category_id UUID REFERENCES categories(id),
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_published BOOLEAN DEFAULT false,
  description JSONB, -- Rich text content
  year INTEGER,
  size TEXT,
  location TEXT,
  scope TEXT
);
```

### **Project Images Table**
```sql
CREATE TABLE project_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  caption TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### **Categories Table**
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

---

## 🛠️ Technical Implementation Details

### **Authentication Flow**
1. User visits `/admin` → redirect to `/admin/login` if not authenticated
2. Login with email/password via Supabase Auth
3. Store session in httpOnly cookies for security
4. Middleware checks auth on all `/admin/*` routes
5. Auto-refresh tokens for seamless experience

### **File Upload Strategy**
1. Direct upload to Supabase Storage from browser
2. Generate signed URLs for secure uploads
3. Implement image optimization on client-side
4. Store file metadata in database for reference

### **WYSIWYG Editor Integration**
1. Use Tiptap editor for modern React integration
2. Custom extensions for CBRE styling
3. Image insertion via storage integration
4. Content sanitization for security

### **Performance Considerations**
1. Implement proper caching strategies
2. Use Supabase real-time subscriptions for live updates
3. Optimize images with Next.js Image component
4. Implement lazy loading for large datasets

---

## 🔒 Security Considerations

### **Authentication Security**
- Use Supabase Auth for secure token management
- Implement proper session handling
- Add rate limiting for login attempts
- Use HTTPS only for all admin routes

### **Data Security**
- Implement Row Level Security (RLS) policies
- Validate all input data on client and server
- Sanitize rich text content
- Use parameterized queries to prevent SQL injection

### **File Upload Security**
- Validate file types and sizes
- Implement virus scanning if needed
- Use signed URLs for temporary access
- Restrict file access to authenticated users only

---

## 📚 Documentation Requirements

### **README Updates**
```markdown
## Supabase Setup

1. Create a new Supabase project at https://supabase.com
2. Copy the project URL and anon key
3. Set up environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```
4. Run database migrations: `npm run db:migrate`
5. Create admin user: `npm run admin:create-user`

## Admin Dashboard Usage

1. Navigate to `/admin/login`
2. Login with your admin credentials
3. Manage projects, categories, and images
4. Changes are immediately reflected on the public site
```

---

## 🎨 UI/UX Considerations

### **Design Consistency**
- Use existing CBRE design system components
- Maintain consistent spacing and typography
- Follow established color palette and styling
- Ensure responsive design for all screen sizes

### **User Experience**
- Clear navigation and breadcrumbs
- Intuitive form layouts with proper validation
- Loading states and progress indicators
- Helpful error messages and success notifications

### **Accessibility**
- Proper semantic HTML structure
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support

---

## 📈 Success Metrics

### **Functionality Metrics**
- [ ] All CRUD operations work correctly
- [ ] Image upload success rate > 95%
- [ ] Authentication system works reliably
- [ ] No data loss during operations
- [ ] Fast load times (< 3 seconds)

### **User Experience Metrics**
- [ ] Intuitive navigation (user can complete tasks without documentation)
- [ ] Responsive design works on mobile and desktop
- [ ] Clear error messages and recovery paths
- [ ] Consistent with existing site design

### **Technical Metrics**
- [ ] Zero security vulnerabilities
- [ ] Proper error handling and logging
- [ ] Clean, maintainable code
- [ ] Comprehensive documentation
- [ ] Successful deployment process

---

## 🚀 Getting Started

To begin implementation:

1. **Start with Milestone 1** - Set up Supabase and basic authentication
2. **Use existing components** - Leverage the CBRE design system already in place
3. **Follow the checklist** - Complete each milestone before moving to the next
4. **Test thoroughly** - Ensure each feature works before proceeding
5. **Document as you go** - Update documentation with each milestone

This plan provides a structured approach to implementing a comprehensive admin dashboard while maintaining the existing codebase quality and design consistency. 