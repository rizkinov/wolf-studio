-- Fix Analytics RLS Policies (comprehensive version)
-- This addresses all the specific operations needed by the tracking service

-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Anonymous can insert page views" ON public.page_views;
DROP POLICY IF EXISTS "Anonymous can update page views" ON public.page_views;
DROP POLICY IF EXISTS "Anonymous can read page views" ON public.page_views;
DROP POLICY IF EXISTS "Allow anonymous page view tracking" ON public.page_views;
DROP POLICY IF EXISTS "Allow authenticated read access to page_views" ON public.page_views;

DROP POLICY IF EXISTS "Anonymous can insert user sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Anonymous can update user sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Anonymous can read user sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Allow anonymous session tracking" ON public.user_sessions;
DROP POLICY IF EXISTS "Allow authenticated read access to user_sessions" ON public.user_sessions;

DROP POLICY IF EXISTS "Anonymous can read published projects" ON public.projects;
DROP POLICY IF EXISTS "Authenticated can read all projects" ON public.projects;
DROP POLICY IF EXISTS "Allow anonymous users to read published projects" ON public.projects;

DROP POLICY IF EXISTS "Anonymous can read project analytics" ON public.project_analytics;
DROP POLICY IF EXISTS "Authenticated can read all project analytics" ON public.project_analytics;
DROP POLICY IF EXISTS "Allow public read access to project_analytics" ON public.project_analytics;

-- Enable RLS on all tables
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Grant table-level permissions first
GRANT SELECT ON public.projects TO anon;
GRANT ALL ON public.page_views TO anon;
GRANT ALL ON public.user_sessions TO anon;
GRANT SELECT ON public.project_analytics TO anon;

GRANT ALL ON public.projects TO authenticated;
GRANT ALL ON public.page_views TO authenticated;
GRANT ALL ON public.user_sessions TO authenticated;
GRANT ALL ON public.project_analytics TO authenticated;

-- Page views policies - Allow all operations for anonymous users
CREATE POLICY "anon_page_views_all" ON public.page_views
    FOR ALL TO anon
    USING (true)
    WITH CHECK (true);

CREATE POLICY "auth_page_views_all" ON public.page_views
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- User sessions policies - Allow all operations for anonymous users
CREATE POLICY "anon_user_sessions_all" ON public.user_sessions
    FOR ALL TO anon
    USING (true)
    WITH CHECK (true);

CREATE POLICY "auth_user_sessions_all" ON public.user_sessions
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- Project analytics policies - Allow read access
CREATE POLICY "anon_project_analytics_select" ON public.project_analytics
    FOR SELECT TO anon
    USING (true);

CREATE POLICY "auth_project_analytics_all" ON public.project_analytics
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- Projects policies - Allow anonymous users to read published projects (for slug lookup)
CREATE POLICY "anon_projects_select_published" ON public.projects
    FOR SELECT TO anon
    USING (is_published = true);

CREATE POLICY "auth_projects_all" ON public.projects
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- Additional grants for sequence access (needed for inserts)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated; 