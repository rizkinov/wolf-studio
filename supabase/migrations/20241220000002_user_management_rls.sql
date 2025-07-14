-- Phase 5: User Management RLS Policies
-- Row Level Security policies for user management tables

-- Enable RLS on all new tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON user_profiles
    FOR SELECT TO authenticated USING (auth.uid() = id);

-- Users can update their own profile (limited fields)
CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE TO authenticated USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id AND
        -- Prevent users from changing their own role or active status
        role = (SELECT role FROM user_profiles WHERE id = auth.uid()) AND
        is_active = (SELECT is_active FROM user_profiles WHERE id = auth.uid())
    );

-- Admins can read all profiles
CREATE POLICY "Admins can read all profiles" ON user_profiles
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role = 'admin' AND is_active = true
        )
    );

-- Admins can insert new profiles
CREATE POLICY "Admins can insert profiles" ON user_profiles
    FOR INSERT TO authenticated WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role = 'admin' AND is_active = true
        )
    );

-- Admins can update any profile
CREATE POLICY "Admins can update any profile" ON user_profiles
    FOR UPDATE TO authenticated USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role = 'admin' AND is_active = true
        )
    );

-- Admins can delete profiles (deactivate)
CREATE POLICY "Admins can delete profiles" ON user_profiles
    FOR DELETE TO authenticated USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role = 'admin' AND is_active = true
        )
    );

-- Activity Logs Policies
-- Users can read their own activity logs
CREATE POLICY "Users can read own activity logs" ON activity_logs
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Admins can read all activity logs
CREATE POLICY "Admins can read all activity logs" ON activity_logs
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role = 'admin' AND is_active = true
        )
    );

-- Only system can insert activity logs (via functions)
CREATE POLICY "System can insert activity logs" ON activity_logs
    FOR INSERT TO authenticated WITH CHECK (true);

-- User Sessions Policies
-- Users can read their own sessions
CREATE POLICY "Users can read own sessions" ON user_sessions
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Users can update their own sessions
CREATE POLICY "Users can update own sessions" ON user_sessions
    FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Users can insert their own sessions
CREATE POLICY "Users can insert own sessions" ON user_sessions
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Admins can read all sessions
CREATE POLICY "Admins can read all sessions" ON user_sessions
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role = 'admin' AND is_active = true
        )
    );

-- User Permissions Policies
-- Users can read their own permissions
CREATE POLICY "Users can read own permissions" ON user_permissions
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Admins can manage all permissions
CREATE POLICY "Admins can read all permissions" ON user_permissions
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role = 'admin' AND is_active = true
        )
    );

CREATE POLICY "Admins can insert permissions" ON user_permissions
    FOR INSERT TO authenticated WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role = 'admin' AND is_active = true
        )
    );

CREATE POLICY "Admins can update permissions" ON user_permissions
    FOR UPDATE TO authenticated USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role = 'admin' AND is_active = true
        )
    );

CREATE POLICY "Admins can delete permissions" ON user_permissions
    FOR DELETE TO authenticated USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role = 'admin' AND is_active = true
        )
    );

-- Update existing project/category policies to use permission system
-- Drop old policies and create new ones based on roles

-- Drop existing project policies
DROP POLICY IF EXISTS "Allow authenticated users to read projects" ON projects;
DROP POLICY IF EXISTS "Allow authenticated users to insert projects" ON projects;
DROP POLICY IF EXISTS "Allow authenticated users to update projects" ON projects;
DROP POLICY IF EXISTS "Allow authenticated users to delete projects" ON projects;

-- New role-based project policies
CREATE POLICY "Role-based project read" ON projects
    FOR SELECT TO authenticated USING (
        has_permission(auth.uid(), 'projects', 'read')
    );

CREATE POLICY "Role-based project insert" ON projects
    FOR INSERT TO authenticated WITH CHECK (
        has_permission(auth.uid(), 'projects', 'create')
    );

CREATE POLICY "Role-based project update" ON projects
    FOR UPDATE TO authenticated USING (
        has_permission(auth.uid(), 'projects', 'update')
    );

CREATE POLICY "Role-based project delete" ON projects
    FOR DELETE TO authenticated USING (
        has_permission(auth.uid(), 'projects', 'delete')
    );

-- Drop existing category policies
DROP POLICY IF EXISTS "Allow authenticated users to read categories" ON categories;
DROP POLICY IF EXISTS "Allow authenticated users to insert categories" ON categories;
DROP POLICY IF EXISTS "Allow authenticated users to update categories" ON categories;
DROP POLICY IF EXISTS "Allow authenticated users to delete categories" ON categories;

-- New role-based category policies
CREATE POLICY "Role-based category read" ON categories
    FOR SELECT TO authenticated USING (
        has_permission(auth.uid(), 'categories', 'read')
    );

CREATE POLICY "Role-based category insert" ON categories
    FOR INSERT TO authenticated WITH CHECK (
        has_permission(auth.uid(), 'categories', 'create')
    );

CREATE POLICY "Role-based category update" ON categories
    FOR UPDATE TO authenticated USING (
        has_permission(auth.uid(), 'categories', 'update')
    );

CREATE POLICY "Role-based category delete" ON categories
    FOR DELETE TO authenticated USING (
        has_permission(auth.uid(), 'categories', 'delete')
    );

-- Drop existing project_images policies
DROP POLICY IF EXISTS "Allow authenticated users to read project_images" ON project_images;
DROP POLICY IF EXISTS "Allow authenticated users to insert project_images" ON project_images;
DROP POLICY IF EXISTS "Allow authenticated users to update project_images" ON project_images;
DROP POLICY IF EXISTS "Allow authenticated users to delete project_images" ON project_images;

-- New role-based project_images policies
CREATE POLICY "Role-based project_images read" ON project_images
    FOR SELECT TO authenticated USING (
        has_permission(auth.uid(), 'projects', 'read')
    );

CREATE POLICY "Role-based project_images insert" ON project_images
    FOR INSERT TO authenticated WITH CHECK (
        has_permission(auth.uid(), 'projects', 'update')
    );

CREATE POLICY "Role-based project_images update" ON project_images
    FOR UPDATE TO authenticated USING (
        has_permission(auth.uid(), 'projects', 'update')
    );

CREATE POLICY "Role-based project_images delete" ON project_images
    FOR DELETE TO authenticated USING (
        has_permission(auth.uid(), 'projects', 'update')
    ); 