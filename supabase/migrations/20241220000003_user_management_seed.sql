-- Phase 5: User Management Seed Data
-- Initial setup for user management system

-- Function to ensure first user becomes admin
CREATE OR REPLACE FUNCTION promote_first_user_to_admin()
RETURNS VOID AS $$
DECLARE
  first_user_id UUID;
  user_count INTEGER;
BEGIN
  -- Count existing users
  SELECT COUNT(*) INTO user_count FROM user_profiles;
  
  -- If this is the first user, make them admin
  IF user_count = 1 THEN
    SELECT id INTO first_user_id FROM user_profiles LIMIT 1;
    
    UPDATE user_profiles 
    SET role = 'admin'
    WHERE id = first_user_id;
    
    -- Log the admin creation
    PERFORM log_activity(
      first_user_id,
      'user_role_changed',
      'user',
      first_user_id,
      'System Admin',
      jsonb_build_object(
        'old_role', 'viewer',
        'new_role', 'admin',
        'reason', 'First user auto-promotion'
      )
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to promote first user to admin
CREATE OR REPLACE FUNCTION check_first_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Run the promotion check after insert
  PERFORM promote_first_user_to_admin();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on user_profiles to check for first user
CREATE TRIGGER check_first_user_trigger
  AFTER INSERT ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION check_first_user();

-- Create default permission sets for roles
INSERT INTO user_permissions (user_id, resource_type, permission_type, granted_by)
SELECT 
  p.id as user_id,
  perms.resource_type,
  perms.permission_type,
  p.id as granted_by -- Self-granted for system setup
FROM user_profiles p
CROSS JOIN (
  -- Admin permissions (all permissions)
  SELECT 'projects' as resource_type, 'read' as permission_type, 'admin' as role
  UNION ALL SELECT 'projects', 'create', 'admin'
  UNION ALL SELECT 'projects', 'update', 'admin'
  UNION ALL SELECT 'projects', 'delete', 'admin'
  UNION ALL SELECT 'projects', 'publish', 'admin'
  UNION ALL SELECT 'categories', 'read', 'admin'
  UNION ALL SELECT 'categories', 'create', 'admin'
  UNION ALL SELECT 'categories', 'update', 'admin'
  UNION ALL SELECT 'categories', 'delete', 'admin'
  UNION ALL SELECT 'users', 'read', 'admin'
  UNION ALL SELECT 'users', 'create', 'admin'
  UNION ALL SELECT 'users', 'update', 'admin'
  UNION ALL SELECT 'users', 'delete', 'admin'
  UNION ALL SELECT 'analytics', 'read', 'admin'
  UNION ALL SELECT 'settings', 'read', 'admin'
  UNION ALL SELECT 'settings', 'update', 'admin'
  
  -- Editor permissions
  UNION ALL SELECT 'projects', 'read', 'editor'
  UNION ALL SELECT 'projects', 'create', 'editor'
  UNION ALL SELECT 'projects', 'update', 'editor'
  UNION ALL SELECT 'categories', 'read', 'editor'
  UNION ALL SELECT 'categories', 'create', 'editor'
  UNION ALL SELECT 'categories', 'update', 'editor'
  UNION ALL SELECT 'analytics', 'read', 'editor'
  
  -- Viewer permissions
  UNION ALL SELECT 'projects', 'read', 'viewer'
  UNION ALL SELECT 'categories', 'read', 'viewer'
  UNION ALL SELECT 'analytics', 'read', 'viewer'
) perms
WHERE p.role = perms.role
ON CONFLICT (user_id, resource_type, permission_type) DO NOTHING;

-- Create sample activity logs for demo purposes
INSERT INTO activity_logs (user_id, activity_type, resource_type, resource_title, details)
SELECT 
  p.id,
  'login',
  'system',
  'Admin Dashboard',
  jsonb_build_object(
    'ip_address', '127.0.0.1',
    'user_agent', 'Mozilla/5.0 (System Setup)',
    'login_method', 'initial_setup'
  )
FROM user_profiles p
WHERE p.role = 'admin';

-- Function to clean up old activity logs (retention policy)
CREATE OR REPLACE FUNCTION cleanup_old_activity_logs()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete logs older than 90 days
  DELETE FROM activity_logs 
  WHERE created_at < now() - INTERVAL '90 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cleanup expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete expired sessions
  DELETE FROM user_sessions 
  WHERE expires_at < now() OR is_active = false;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a view for user activity summary
CREATE OR REPLACE VIEW user_activity_summary AS
SELECT 
  up.id,
  up.email,
  up.full_name,
  up.role,
  up.last_login_at,
  up.is_active,
  COUNT(al.id) as total_activities,
  COUNT(CASE WHEN al.created_at > now() - INTERVAL '7 days' THEN 1 END) as activities_last_7_days,
  COUNT(CASE WHEN al.created_at > now() - INTERVAL '30 days' THEN 1 END) as activities_last_30_days,
  MAX(al.created_at) as last_activity_at
FROM user_profiles up
LEFT JOIN activity_logs al ON up.id = al.user_id
GROUP BY up.id, up.email, up.full_name, up.role, up.last_login_at, up.is_active;

-- Grant necessary permissions for the view
GRANT SELECT ON user_activity_summary TO authenticated;

-- Create RLS policy for the view
CREATE POLICY "Admins can view user activity summary" ON user_activity_summary
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin' AND is_active = true
    )
  );

-- Users can view their own activity summary
CREATE POLICY "Users can view own activity summary" ON user_activity_summary
  FOR SELECT TO authenticated USING (auth.uid() = id); 