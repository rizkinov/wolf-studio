-- Phase 5: User Management & Permissions Schema
-- This migration creates the user management system for Wolf Studio CMS

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User roles enumeration
CREATE TYPE user_role AS ENUM ('admin', 'editor', 'viewer');

-- User activity types for audit logging
CREATE TYPE activity_type AS ENUM (
  'project_created', 'project_updated', 'project_deleted', 'project_published', 'project_unpublished',
  'category_created', 'category_updated', 'category_deleted',
  'image_uploaded', 'image_deleted',
  'user_created', 'user_updated', 'user_deleted', 'user_role_changed',
  'login', 'logout'
);

-- User profiles table (extends Supabase auth.users)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'viewer',
  department TEXT,
  phone TEXT,
  bio TEXT,
  last_login_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Ensure email uniqueness
  CONSTRAINT unique_email UNIQUE(email)
);

-- Activity logs table for audit trail
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  activity_type activity_type NOT NULL,
  resource_type TEXT, -- 'project', 'category', 'user', etc.
  resource_id UUID, -- ID of the affected resource
  resource_title TEXT, -- Human-readable title of the resource
  details JSONB, -- Additional activity details
  metadata JSONB, -- Request metadata (IP, user agent, etc.)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User sessions table for enhanced session management
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  ip_address INET,
  user_agent TEXT,
  is_active BOOLEAN DEFAULT true,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User permissions table for granular permissions
CREATE TABLE user_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL, -- 'projects', 'categories', 'users', 'analytics', 'settings'
  permission_type TEXT NOT NULL, -- 'read', 'create', 'update', 'delete', 'publish'
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Ensure unique permission per user per resource
  CONSTRAINT unique_user_permission UNIQUE(user_id, resource_type, permission_type)
);

-- Indexes for performance
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_active ON user_profiles(is_active);
CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_type ON activity_logs(activity_type);
CREATE INDEX idx_activity_logs_resource ON activity_logs(resource_type, resource_id);
CREATE INDEX idx_activity_logs_created ON activity_logs(created_at);
CREATE INDEX idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_active ON user_sessions(is_active);
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);
CREATE INDEX idx_user_permissions_user ON user_permissions(user_id);
CREATE INDEX idx_user_permissions_resource ON user_permissions(resource_type);

-- Triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create user profile on user registration
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'viewer' -- Default role
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_user_profile();

-- Function to log activity
CREATE OR REPLACE FUNCTION log_activity(
  p_user_id UUID,
  p_activity_type activity_type,
  p_resource_type TEXT DEFAULT NULL,
  p_resource_id UUID DEFAULT NULL,
  p_resource_title TEXT DEFAULT NULL,
  p_details JSONB DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO activity_logs (
    user_id, 
    activity_type, 
    resource_type, 
    resource_id, 
    resource_title, 
    details, 
    metadata
  )
  VALUES (
    p_user_id, 
    p_activity_type, 
    p_resource_type, 
    p_resource_id, 
    p_resource_title, 
    p_details, 
    p_metadata
  )
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check user permissions
CREATE OR REPLACE FUNCTION has_permission(
  p_user_id UUID,
  p_resource_type TEXT,
  p_permission_type TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  user_role_val user_role;
  has_explicit_permission BOOLEAN;
BEGIN
  -- Get user role
  SELECT role INTO user_role_val
  FROM user_profiles
  WHERE id = p_user_id AND is_active = true;
  
  -- Admin has all permissions
  IF user_role_val = 'admin' THEN
    RETURN TRUE;
  END IF;
  
  -- Check for explicit permission
  SELECT EXISTS(
    SELECT 1 FROM user_permissions
    WHERE user_id = p_user_id
    AND resource_type = p_resource_type
    AND permission_type = p_permission_type
  ) INTO has_explicit_permission;
  
  IF has_explicit_permission THEN
    RETURN TRUE;
  END IF;
  
  -- Default role-based permissions
  CASE user_role_val
    WHEN 'editor' THEN
      -- Editors can read/create/update projects and categories
      RETURN p_resource_type IN ('projects', 'categories') 
        AND p_permission_type IN ('read', 'create', 'update');
    WHEN 'viewer' THEN
      -- Viewers can only read
      RETURN p_permission_type = 'read';
    ELSE
      RETURN FALSE;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 