# Wolf Studio CMS Database

This directory contains the database schema and migrations for the Wolf Studio CMS built with Supabase.

## Database Schema

### Tables

#### `categories`
Stores project categories for organizing work items.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Category name (unique) |
| slug | TEXT | URL-friendly identifier (unique) |
| description | TEXT | Optional category description |
| created_at | TIMESTAMP | Created timestamp |
| updated_at | TIMESTAMP | Last updated timestamp |

#### `projects`
Main projects table containing all project information.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| title | TEXT | Project title |
| subtitle | TEXT | Optional subtitle |
| slug | TEXT | URL-friendly identifier (unique) |
| banner_image_url | TEXT | Banner image URL |
| order_index | INTEGER | Display order |
| category_id | UUID | Foreign key to categories |
| published_at | TIMESTAMP | Publication date |
| created_at | TIMESTAMP | Created timestamp |
| updated_at | TIMESTAMP | Last updated timestamp |
| is_published | BOOLEAN | Publication status |
| description | JSONB | Rich text content |
| year | INTEGER | Project year |
| size | TEXT | Project size |
| location | TEXT | Project location |
| scope | TEXT | Project scope |
| legacy_id | TEXT | Legacy ID for migration |
| featured | BOOLEAN | Featured status |

#### `project_images`
Stores images for projects (banner and gallery images).

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| project_id | UUID | Foreign key to projects |
| image_url | TEXT | Image URL |
| alt_text | TEXT | Alternative text for accessibility |
| caption | TEXT | Image caption |
| display_order | INTEGER | Display order within project |
| image_type | TEXT | 'banner' or 'gallery' |
| created_at | TIMESTAMP | Created timestamp |
| updated_at | TIMESTAMP | Last updated timestamp |

## Migrations

### Running Migrations

**Option 1: Via Supabase Dashboard**
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste each migration file content in order:
   - `20241201000001_initial_schema.sql`
   - `20241201000002_rls_policies.sql`
   - `20241201000003_seed_data.sql`
4. Execute each migration

**Option 2: Via Supabase CLI** (if you have it installed)
```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-id

# Run migrations
supabase db push
```

### Migration Files

1. **`20241201000001_initial_schema.sql`**
   - Creates all tables with proper relationships
   - Adds indexes for performance
   - Sets up automatic timestamp triggers

2. **`20241201000002_rls_policies.sql`**
   - Enables Row Level Security (RLS)
   - Creates policies for authenticated users (full access)
   - Creates policies for anonymous users (read-only published content)

3. **`20241201000003_seed_data.sql`**
   - Populates categories
   - Migrates existing project data
   - Sets up proper relationships

## Row Level Security (RLS)

The database uses RLS to ensure proper access control:

### Authenticated Users
- **Full CRUD access** to all tables (categories, projects, project_images)
- Can create, read, update, and delete any content

### Anonymous Users (Public Website)
- **Read-only access** to published projects
- **Read-only access** to all categories
- **Read-only access** to images of published projects

## Data Validation

### Constraints
- Category names and slugs must be unique
- Project slugs must be unique
- Image types must be either 'banner' or 'gallery'
- Projects can optionally belong to a category (foreign key with CASCADE on delete)

### Indexes
- Projects: slug, category_id, is_published, order_index
- Project Images: project_id, display_order
- Categories: slug

## Backup and Recovery

### Regular Backups
Supabase automatically creates backups, but for additional safety:

1. **Export data via Dashboard**:
   - Go to Database → Backups
   - Download full database backup

2. **Export via SQL**:
   ```sql
   -- Export all data
   COPY (SELECT * FROM categories) TO '/tmp/categories.csv' CSV HEADER;
   COPY (SELECT * FROM projects) TO '/tmp/projects.csv' CSV HEADER;
   COPY (SELECT * FROM project_images) TO '/tmp/project_images.csv' CSV HEADER;
   ```

### Migration Rollback
If you need to rollback migrations:

```sql
-- Drop all tables (WARNING: This will delete all data)
DROP TABLE IF EXISTS project_images CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;
```

## Development Workflow

1. **Local Development**: Use Supabase local development
2. **Staging**: Test migrations on staging environment
3. **Production**: Apply migrations to production

## Security Considerations

- RLS policies ensure data security
- Only authenticated users can modify content
- Anonymous users only see published content
- All queries are logged and monitored by Supabase

## Performance Optimization

- Indexes on frequently queried columns
- JSONB for flexible content storage
- Proper foreign key relationships
- Automatic timestamp updates via triggers 