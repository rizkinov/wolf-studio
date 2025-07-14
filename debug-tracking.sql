-- Debug tracking system
-- Run this in Supabase SQL editor to check if tracking data is being inserted

-- Check if page views are being recorded
SELECT 
  pv.id,
  pv.created_at,
  pv.view_duration,
  pv.user_ip,
  p.title,
  p.slug
FROM page_views pv
JOIN projects p ON pv.project_id = p.id
ORDER BY pv.created_at DESC
LIMIT 20;

-- Check if user sessions are being created
SELECT 
  session_id,
  user_ip,
  started_at,
  last_activity,
  page_views_count,
  total_duration
FROM user_sessions
ORDER BY started_at DESC
LIMIT 10;

-- Check if project analytics are being updated
SELECT 
  pa.total_views,
  pa.unique_visitors,
  pa.last_viewed,
  pa.updated_at,
  p.title,
  p.slug
FROM project_analytics pa
JOIN projects p ON pa.project_id = p.id
ORDER BY pa.updated_at DESC
LIMIT 20;

-- Check if triggers are working - count records in each table
SELECT 
  'page_views' as table_name,
  COUNT(*) as record_count
FROM page_views
UNION ALL
SELECT 
  'user_sessions' as table_name,
  COUNT(*) as record_count
FROM user_sessions
UNION ALL
SELECT 
  'project_analytics' as table_name,
  COUNT(*) as record_count
FROM project_analytics; 