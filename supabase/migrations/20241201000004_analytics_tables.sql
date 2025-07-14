-- Migration: Add analytics tracking tables
-- Created: 2024-12-01

-- Create analytics tables for tracking real user engagement
CREATE TABLE IF NOT EXISTS public.page_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    user_ip TEXT NOT NULL,
    user_agent TEXT,
    referrer TEXT,
    session_id TEXT,
    view_duration INTEGER DEFAULT 0, -- in seconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.user_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT UNIQUE NOT NULL,
    user_ip TEXT NOT NULL,
    user_agent TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    page_views_count INTEGER DEFAULT 0,
    total_duration INTEGER DEFAULT 0 -- in seconds
);

CREATE TABLE IF NOT EXISTS public.project_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE UNIQUE,
    total_views INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    average_time_on_page DECIMAL(10,2) DEFAULT 0,
    bounce_rate DECIMAL(5,2) DEFAULT 0,
    last_viewed TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_page_views_project_id ON public.page_views(project_id);
CREATE INDEX idx_page_views_created_at ON public.page_views(created_at);
CREATE INDEX idx_page_views_session_id ON public.page_views(session_id);
CREATE INDEX idx_user_sessions_session_id ON public.user_sessions(session_id);
CREATE INDEX idx_user_sessions_started_at ON public.user_sessions(started_at);
CREATE INDEX idx_project_analytics_project_id ON public.project_analytics(project_id);

-- Create function to update project analytics
CREATE OR REPLACE FUNCTION update_project_analytics()
RETURNS TRIGGER AS $$
BEGIN
    -- Update or insert project analytics
    INSERT INTO public.project_analytics (project_id, total_views, unique_visitors, last_viewed)
    VALUES (
        NEW.project_id,
        1,
        1,
        NEW.created_at
    )
    ON CONFLICT (project_id) DO UPDATE SET
        total_views = project_analytics.total_views + 1,
        unique_visitors = (
            SELECT COUNT(DISTINCT user_ip)
            FROM public.page_views
            WHERE project_id = NEW.project_id
        ),
        last_viewed = NEW.created_at,
        updated_at = CURRENT_TIMESTAMP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update analytics
CREATE TRIGGER trigger_update_project_analytics
    AFTER INSERT ON public.page_views
    FOR EACH ROW
    EXECUTE FUNCTION update_project_analytics();

-- Add RLS policies
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_analytics ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to insert page views (for tracking)
CREATE POLICY "Allow anonymous page view tracking" ON public.page_views
    FOR INSERT TO anon
    WITH CHECK (true);

-- Allow anonymous users to insert/update sessions
CREATE POLICY "Allow anonymous session tracking" ON public.user_sessions
    FOR ALL TO anon
    USING (true);

-- Allow authenticated users to read all analytics
CREATE POLICY "Allow authenticated read access to page_views" ON public.page_views
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated read access to user_sessions" ON public.user_sessions
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated read access to project_analytics" ON public.project_analytics
    FOR SELECT TO authenticated
    USING (true);

-- Allow public read access to project analytics (for displaying view counts)
CREATE POLICY "Allow public read access to project_analytics" ON public.project_analytics
    FOR SELECT TO anon
    USING (true); 