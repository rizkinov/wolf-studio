-- Row Level Security policies for Wolf Studio CMS
-- These policies ensure only authenticated users can manage content

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_images ENABLE ROW LEVEL SECURITY;

-- Categories policies
-- Allow all authenticated users to read categories
CREATE POLICY "Allow authenticated users to read categories" ON categories
    FOR SELECT TO authenticated USING (true);

-- Allow authenticated users to insert categories
CREATE POLICY "Allow authenticated users to insert categories" ON categories
    FOR INSERT TO authenticated WITH CHECK (true);

-- Allow authenticated users to update categories
CREATE POLICY "Allow authenticated users to update categories" ON categories
    FOR UPDATE TO authenticated USING (true);

-- Allow authenticated users to delete categories
CREATE POLICY "Allow authenticated users to delete categories" ON categories
    FOR DELETE TO authenticated USING (true);

-- Projects policies
-- Allow all authenticated users to read projects
CREATE POLICY "Allow authenticated users to read projects" ON projects
    FOR SELECT TO authenticated USING (true);

-- Allow authenticated users to insert projects
CREATE POLICY "Allow authenticated users to insert projects" ON projects
    FOR INSERT TO authenticated WITH CHECK (true);

-- Allow authenticated users to update projects
CREATE POLICY "Allow authenticated users to update projects" ON projects
    FOR UPDATE TO authenticated USING (true);

-- Allow authenticated users to delete projects
CREATE POLICY "Allow authenticated users to delete projects" ON projects
    FOR DELETE TO authenticated USING (true);

-- Project images policies
-- Allow all authenticated users to read project images
CREATE POLICY "Allow authenticated users to read project_images" ON project_images
    FOR SELECT TO authenticated USING (true);

-- Allow authenticated users to insert project images
CREATE POLICY "Allow authenticated users to insert project_images" ON project_images
    FOR INSERT TO authenticated WITH CHECK (true);

-- Allow authenticated users to update project images
CREATE POLICY "Allow authenticated users to update project_images" ON project_images
    FOR UPDATE TO authenticated USING (true);

-- Allow authenticated users to delete project images
CREATE POLICY "Allow authenticated users to delete project_images" ON project_images
    FOR DELETE TO authenticated USING (true);

-- Public read access for published content (for the public website)
-- These policies allow anonymous users to read published projects and their images

-- Allow anonymous users to read published projects
CREATE POLICY "Allow anonymous users to read published projects" ON projects
    FOR SELECT TO anon USING (is_published = true);

-- Allow anonymous users to read categories (for filtering)
CREATE POLICY "Allow anonymous users to read categories" ON categories
    FOR SELECT TO anon USING (true);

-- Allow anonymous users to read images of published projects
CREATE POLICY "Allow anonymous users to read published project images" ON project_images
    FOR SELECT TO anon USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = project_images.project_id 
            AND projects.is_published = true
        )
    ); 