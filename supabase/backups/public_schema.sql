-- Enable extensions
CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA extensions;

CREATE TYPE public.activity_type AS ENUM (
    'project_created',
    'project_updated',
    'project_deleted',
    'project_published',
    'project_unpublished',
    'category_created',
    'category_updated',
    'category_deleted',
    'image_uploaded',
    'image_deleted',
    'user_created',
    'user_updated',
    'user_deleted',
    'user_role_changed',
    'login',
    'logout'
);
ALTER TYPE public.activity_type OWNER TO postgres;
CREATE TYPE public.user_role AS ENUM (
    'admin',
    'editor',
    'viewer'
);
ALTER TYPE public.user_role OWNER TO postgres;
CREATE FUNCTION public.has_permission(p_user_id uuid, p_resource_type text, p_permission_type text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
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
$$;
ALTER FUNCTION public.has_permission(p_user_id uuid, p_resource_type text, p_permission_type text) OWNER TO postgres;
CREATE FUNCTION public.log_activity(p_user_id uuid, p_activity_type public.activity_type, p_resource_type text DEFAULT NULL::text, p_resource_id uuid DEFAULT NULL::uuid, p_resource_title text DEFAULT NULL::text, p_details jsonb DEFAULT NULL::jsonb, p_metadata jsonb DEFAULT NULL::jsonb) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
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
$$;
ALTER FUNCTION public.log_activity(p_user_id uuid, p_activity_type public.activity_type, p_resource_type text, p_resource_id uuid, p_resource_title text, p_details jsonb, p_metadata jsonb) OWNER TO postgres;
CREATE FUNCTION public.update_project_analytics() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
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
$$;
ALTER FUNCTION public.update_project_analytics() OWNER TO postgres;
CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;
ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;
CREATE TABLE public.activity_logs (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid,
    activity_type public.activity_type NOT NULL,
    resource_type text,
    resource_id uuid,
    resource_title text,
    details jsonb,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now(),
    user_profile_id uuid
);
ALTER TABLE public.activity_logs OWNER TO postgres;
CREATE TABLE public.user_profiles (
    id uuid NOT NULL,
    email text NOT NULL,
    full_name text,
    avatar_url text,
    role public.user_role DEFAULT 'viewer'::public.user_role,
    department text,
    phone text,
    bio text,
    last_login_at timestamp with time zone,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by uuid
);
ALTER TABLE public.user_profiles OWNER TO postgres;
CREATE VIEW public.activity_logs_with_users AS
 SELECT al.id,
    al.user_id,
    al.activity_type,
    al.resource_type,
    al.resource_id,
    al.resource_title,
    al.details,
    al.metadata,
    al.created_at,
    jsonb_build_object('id', up.id, 'email', up.email, 'full_name', up.full_name, 'role', up.role) AS "user"
   FROM (public.activity_logs al
     LEFT JOIN public.user_profiles up ON ((al.user_id = up.id)));
ALTER VIEW public.activity_logs_with_users OWNER TO postgres;
CREATE TABLE public.categories (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
ALTER TABLE public.categories OWNER TO postgres;
CREATE TABLE public.image_migration_log (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    original_path text NOT NULL,
    new_storage_path text NOT NULL,
    project_slug text NOT NULL,
    status text NOT NULL,
    error_message text,
    migrated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT image_migration_log_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'success'::text, 'failed'::text])))
);
ALTER TABLE public.image_migration_log OWNER TO postgres;
COMMENT ON TABLE public.image_migration_log IS 'Tracks migration of images from static files to Supabase Storage';
CREATE TABLE public.page_views (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_id uuid,
    user_ip text NOT NULL,
    user_agent text,
    referrer text,
    session_id text,
    view_duration integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE public.page_views OWNER TO postgres;
CREATE TABLE public.project_analytics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_id uuid,
    total_views integer DEFAULT 0,
    unique_visitors integer DEFAULT 0,
    average_time_on_page numeric(10,2) DEFAULT 0,
    bounce_rate numeric(5,2) DEFAULT 0,
    last_viewed timestamp with time zone,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE public.project_analytics OWNER TO postgres;
CREATE TABLE public.project_images (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    project_id uuid,
    image_url text NOT NULL,
    alt_text text,
    caption text,
    display_order integer DEFAULT 0 NOT NULL,
    image_type text DEFAULT 'gallery'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    storage_path text,
    file_size integer,
    mime_type text,
    crop_data jsonb,
    CONSTRAINT project_images_image_type_check CHECK ((image_type = ANY (ARRAY['banner'::text, 'gallery'::text])))
);
ALTER TABLE public.project_images OWNER TO postgres;
CREATE TABLE public.projects (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    title text NOT NULL,
    subtitle text,
    slug text NOT NULL,
    banner_image_url text,
    order_index integer DEFAULT 0 NOT NULL,
    category_id uuid,
    published_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    is_published boolean DEFAULT false,
    description jsonb,
    year integer,
    size text,
    location text,
    scope text,
    legacy_id text,
    featured boolean DEFAULT false
);
ALTER TABLE public.projects OWNER TO postgres;
CREATE VIEW public.user_activity_summary AS
 SELECT up.id,
    up.email,
    up.full_name,
    up.role,
    up.last_login_at,
    up.is_active,
    (COALESCE(count(al.id), (0)::bigint))::integer AS total_activities,
    (COALESCE(count(
        CASE
            WHEN (al.created_at > (now() - '7 days'::interval)) THEN 1
            ELSE NULL::integer
        END), (0)::bigint))::integer AS activities_last_7_days,
    (COALESCE(count(
        CASE
            WHEN (al.created_at > (now() - '30 days'::interval)) THEN 1
            ELSE NULL::integer
        END), (0)::bigint))::integer AS activities_last_30_days,
    max(al.created_at) AS last_activity_at
   FROM (public.user_profiles up
     LEFT JOIN public.activity_logs al ON ((up.id = al.user_id)))
  GROUP BY up.id, up.email, up.full_name, up.role, up.last_login_at, up.is_active;
ALTER VIEW public.user_activity_summary OWNER TO postgres;
CREATE TABLE public.user_permissions (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid,
    resource_type text NOT NULL,
    permission_type text NOT NULL,
    granted_by uuid,
    granted_at timestamp with time zone DEFAULT now()
);
ALTER TABLE public.user_permissions OWNER TO postgres;
CREATE TABLE public.user_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_id text NOT NULL,
    user_ip text NOT NULL,
    user_agent text,
    started_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    last_activity timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    page_views_count integer DEFAULT 0,
    total_duration integer DEFAULT 0
);
ALTER TABLE public.user_sessions OWNER TO postgres;
COPY public.activity_logs (id, user_id, activity_type, resource_type, resource_id, resource_title, details, metadata, created_at, user_profile_id) FROM stdin;
3cdbe4e1-0604-4965-a1a1-3fa8d260c6cf	\N	login	system	\N	Admin Dashboard	{"method": "setup", "ip_address": "127.0.0.1"}	\N	2025-07-14 19:58:59.865988+00	\N
a6926989-651b-4085-90fb-b6044b4df0ff	\N	project_created	project	\N	Sample Project	{"action": "system_setup"}	\N	2025-07-14 19:58:59.865988+00	\N
\.
COPY public.categories (id, name, slug, description, created_at, updated_at) FROM stdin;
6d1fed94-687b-4af4-8c48-eee903f8bb71	Consulting Firm	consulting-firm	Management consulting and professional services projects	2025-07-14 12:43:35.103225+00	2025-07-14 12:43:35.103225+00
bbfb7694-37b1-4087-801b-f8bbe8c402d5	Financial Services	financial-services	Banking, insurance, and financial sector projects	2025-07-14 12:43:35.103225+00	2025-07-14 12:43:35.103225+00
bf617c76-44fa-4702-bd2f-6d9de0752fe0	Corporate Office	corporate-office	General corporate office design and build projects	2025-07-14 12:43:35.103225+00	2025-07-14 12:43:35.103225+00
cea72569-f89c-4103-bf5c-34d3c00d8dce	Healthcare	healthcare	Healthcare and pharmaceutical sector projects	2025-07-14 12:43:35.103225+00	2025-07-14 12:43:35.103225+00
006c0f19-1691-4bae-85e1-470eb5e1871c	Technology	technology	Technology company office designs	2025-07-14 12:43:35.103225+00	2025-07-14 12:43:35.103225+00
05ba3195-8e8d-4b18-86c2-ad4b31d8376f	Hospitality	hospitality	Hotels, restaurants, and hospitality sector projects	2025-07-14 12:43:35.103225+00	2025-07-14 12:43:35.103225+00
02d73a19-bb69-4ffc-8171-db18be281388	Legal	legal	Law firms and legal sector projects	2025-07-14 12:43:35.103225+00	2025-07-14 12:43:35.103225+00
a2b5825f-59d1-42de-8691-b97c63ed6d33	Industrial	industrial	Manufacturing and industrial sector projects	2025-07-14 12:43:35.103225+00	2025-07-14 12:43:35.103225+00
\.
COPY public.image_migration_log (id, original_path, new_storage_path, project_slug, status, error_message, migrated_at) FROM stdin;
24571234-d270-4e70-acb1-a336c9e3e1c3	scraped-images/work-projects/bayer/bayer-banner.jpg	banners/bayer/bayer-banner.jpg	bayer	success	\N	2025-07-14 16:04:11.666747+00
72107cc4-1d55-4c61-8071-cf1f4ec6d39e	scraped-images/work-projects/bayer/bayer-gallery-1.jpg	gallery/bayer/bayer-gallery-1.jpg	bayer	success	\N	2025-07-14 16:04:12.254772+00
83de5243-dd4b-46e8-9061-cc26d58682a4	scraped-images/work-projects/bayer/bayer-gallery-2.jpg	gallery/bayer/bayer-gallery-2.jpg	bayer	success	\N	2025-07-14 16:04:12.863813+00
52e795e9-e46a-4967-8f68-b9ece5f93aa2	scraped-images/work-projects/bayer/bayer-gallery-3.jpg	gallery/bayer/bayer-gallery-3.jpg	bayer	success	\N	2025-07-14 16:04:13.2561+00
4d65be58-006d-4e6e-8bec-3918c655e5e9	scraped-images/work-projects/bayer/bayer-gallery-4.jpg	gallery/bayer/bayer-gallery-4.jpg	bayer	success	\N	2025-07-14 16:04:13.632947+00
dfd60616-e358-4526-8af2-2a823bc156a0	scraped-images/work-projects/bayer/bayer-gallery-5.jpg	gallery/bayer/bayer-gallery-5.jpg	bayer	success	\N	2025-07-14 16:04:13.996314+00
52cfcced-e45e-42c4-acbf-444e055fa171	scraped-images/work-projects/bayer/bayer-gallery-6.jpg	gallery/bayer/bayer-gallery-6.jpg	bayer	success	\N	2025-07-14 16:04:14.334623+00
4c50ce75-1952-4ed8-bd4c-f041dd39343e	scraped-images/work-projects/bayer/bayer-gallery-7.jpg	gallery/bayer/bayer-gallery-7.jpg	bayer	success	\N	2025-07-14 16:04:14.704854+00
3594c57a-76c1-4006-ba05-2811adb04410	scraped-images/work-projects/bayer/bayer-gallery-8.jpg	gallery/bayer/bayer-gallery-8.jpg	bayer	success	\N	2025-07-14 16:04:15.192832+00
d351f71e-5760-430e-a107-97e451458b7a	scraped-images/work-projects/bosch/bosch-banner.jpg	banners/bosch/bosch-banner.jpg	bosch	success	\N	2025-07-14 16:04:15.551055+00
fd6ab27a-1d4d-4e3f-a002-1f5beb9af3a1	scraped-images/work-projects/bosch/bosch-gallery-1.jpg	gallery/bosch/bosch-gallery-1.jpg	bosch	success	\N	2025-07-14 16:04:15.955228+00
c2497986-2036-45a2-bd5f-04e2a09eb360	scraped-images/work-projects/bosch/bosch-gallery-2.jpg	gallery/bosch/bosch-gallery-2.jpg	bosch	success	\N	2025-07-14 16:04:16.299579+00
94941433-4294-45be-8adf-d70e60eef0dc	scraped-images/work-projects/bosch/bosch-gallery-3.jpg	gallery/bosch/bosch-gallery-3.jpg	bosch	success	\N	2025-07-14 16:04:16.606391+00
60ca0779-93cd-4d6d-867c-f7884f346a0e	scraped-images/work-projects/bosch/bosch-gallery-4.jpg	gallery/bosch/bosch-gallery-4.jpg	bosch	success	\N	2025-07-14 16:04:16.947425+00
9e42cfa1-9cc5-4b46-a04e-a4de1cb79fdc	scraped-images/work-projects/bosch/bosch-gallery-5.jpg	gallery/bosch/bosch-gallery-5.jpg	bosch	success	\N	2025-07-14 16:04:17.254478+00
6b8cb8d3-6757-4299-9ca9-72e3c9df94a2	scraped-images/work-projects/bosch/bosch-gallery-6.jpg	gallery/bosch/bosch-gallery-6.jpg	bosch	success	\N	2025-07-14 16:04:17.612343+00
0366ad94-5efd-44e9-b8fa-88a50dee37b8	scraped-images/work-projects/bosch/bosch-gallery-7.jpg	gallery/bosch/bosch-gallery-7.jpg	bosch	success	\N	2025-07-14 16:04:17.962354+00
cb78cc07-bd2f-4933-916b-ffbb3866add3	scraped-images/work-projects/bosch/bosch-gallery-8.jpg	gallery/bosch/bosch-gallery-8.jpg	bosch	success	\N	2025-07-14 16:04:18.259073+00
5b86c24c-84d2-4c44-abb4-e758c004b984	scraped-images/work-projects/cbre/cbre-banner.jpg	banners/cbre/cbre-banner.jpg	cbre	success	\N	2025-07-14 16:04:18.688802+00
41da871d-90c9-406b-959a-3b8d81f46c9a	scraped-images/work-projects/cbre/cbre-gallery-1.jpg	gallery/cbre/cbre-gallery-1.jpg	cbre	success	\N	2025-07-14 16:04:18.993101+00
9c28549d-3cb2-4322-8a8c-555022036b97	scraped-images/work-projects/cbre/cbre-gallery-2.jpg	gallery/cbre/cbre-gallery-2.jpg	cbre	success	\N	2025-07-14 16:04:19.320706+00
64791672-f887-4db7-8bbf-3f5016894df9	scraped-images/work-projects/cbre/cbre-gallery-3.jpg	gallery/cbre/cbre-gallery-3.jpg	cbre	success	\N	2025-07-14 16:04:19.639331+00
177a33de-cbeb-4d58-918c-209e0d5617fb	scraped-images/work-projects/cbre/cbre-gallery-4.jpg	gallery/cbre/cbre-gallery-4.jpg	cbre	success	\N	2025-07-14 16:04:19.962351+00
816a2cfe-aec9-47c7-a5c8-b9b3f95a761c	scraped-images/work-projects/cbre/cbre-gallery-5.jpg	gallery/cbre/cbre-gallery-5.jpg	cbre	success	\N	2025-07-14 16:04:20.321499+00
b228a075-eca5-46fe-ab8d-ba45d58312e8	scraped-images/work-projects/cbre/cbre-gallery-6.jpg	gallery/cbre/cbre-gallery-6.jpg	cbre	success	\N	2025-07-14 16:04:20.671537+00
dc29f0ee-b95a-4149-b620-62468f15b954	scraped-images/work-projects/cbre/cbre-gallery-7.jpg	gallery/cbre/cbre-gallery-7.jpg	cbre	success	\N	2025-07-14 16:04:21.004711+00
e0397ac7-77d9-4d78-bf42-7131159cd3e6	scraped-images/work-projects/dassaultsystemes/dassaultsystemes-banner.jpg	banners/dassaultsystemes/dassaultsystemes-banner.jpg	dassaultsystemes	success	\N	2025-07-14 16:04:21.33607+00
a9db32de-0fa9-4e95-a728-f4808e353b55	scraped-images/work-projects/dassaultsystemes/dassaultsystemes-gallery-1.jpg	gallery/dassaultsystemes/dassaultsystemes-gallery-1.jpg	dassaultsystemes	success	\N	2025-07-14 16:04:21.661969+00
5cfdb50c-0146-44a5-90e6-98a523c87e53	scraped-images/work-projects/dassaultsystemes/dassaultsystemes-gallery-2.jpg	gallery/dassaultsystemes/dassaultsystemes-gallery-2.jpg	dassaultsystemes	success	\N	2025-07-14 16:04:21.992833+00
e53c691d-8984-4e72-aa97-75ed0b0573af	scraped-images/work-projects/dassaultsystemes/dassaultsystemes-gallery-3.jpg	gallery/dassaultsystemes/dassaultsystemes-gallery-3.jpg	dassaultsystemes	success	\N	2025-07-14 16:04:22.310716+00
e98cf9be-5337-4882-bb69-7771365f37b6	scraped-images/work-projects/dassaultsystemes/dassaultsystemes-gallery-4.jpg	gallery/dassaultsystemes/dassaultsystemes-gallery-4.jpg	dassaultsystemes	success	\N	2025-07-14 16:04:22.682606+00
c1ccd3c2-688a-4279-bacc-02639f49ea0d	scraped-images/work-projects/emerson/emerson-banner.jpg	banners/emerson/emerson-banner.jpg	emerson	success	\N	2025-07-14 16:04:22.999091+00
ba52f7f4-4967-48ab-a88b-d378992dfdaa	scraped-images/work-projects/emerson/emerson-gallery-1.jpg	gallery/emerson/emerson-gallery-1.jpg	emerson	success	\N	2025-07-14 16:04:23.307104+00
bfab3b3e-2621-4276-ac2f-7333ed2374fd	scraped-images/work-projects/emerson/emerson-gallery-2.jpg	gallery/emerson/emerson-gallery-2.jpg	emerson	success	\N	2025-07-14 16:04:23.63977+00
5d369496-786b-4e6e-a474-a8ec9d0754c2	scraped-images/work-projects/emerson/emerson-gallery-3.jpg	gallery/emerson/emerson-gallery-3.jpg	emerson	success	\N	2025-07-14 16:04:23.972993+00
f6c66f1e-8b9b-48d1-a6f2-a3b8e9712f45	scraped-images/work-projects/emerson/emerson-gallery-4.jpg	gallery/emerson/emerson-gallery-4.jpg	emerson	success	\N	2025-07-14 16:04:24.373844+00
22183b2a-7bca-4c5c-9222-b7f28a1268ba	scraped-images/work-projects/globalconsultinggiant/globalconsultinggiant-banner.jpg	banners/globalconsultinggiant/globalconsultinggiant-banner.jpg	globalconsultinggiant	success	\N	2025-07-14 16:04:24.775505+00
9a43f5b1-6f7f-435f-bf65-09b930cc3853	scraped-images/work-projects/globalconsultinggiant/globalconsultinggiant-gallery-1.jpg	gallery/globalconsultinggiant/globalconsultinggiant-gallery-1.jpg	globalconsultinggiant	success	\N	2025-07-14 16:04:25.064425+00
79f62312-501e-4ff6-963f-2390d6aa6baa	scraped-images/work-projects/globalconsultinggiant/globalconsultinggiant-gallery-10.jpg	gallery/globalconsultinggiant/globalconsultinggiant-gallery-10.jpg	globalconsultinggiant	success	\N	2025-07-14 16:04:25.388391+00
df9b9fcf-0a79-4eee-8944-43f1fa6f0d70	scraped-images/work-projects/globalconsultinggiant/globalconsultinggiant-gallery-2.jpg	gallery/globalconsultinggiant/globalconsultinggiant-gallery-2.jpg	globalconsultinggiant	success	\N	2025-07-14 16:04:25.727587+00
94393ecb-2f98-4ef0-a0a3-f3411157994b	scraped-images/work-projects/globalconsultinggiant/globalconsultinggiant-gallery-3.jpg	gallery/globalconsultinggiant/globalconsultinggiant-gallery-3.jpg	globalconsultinggiant	success	\N	2025-07-14 16:04:26.031267+00
bad05d75-7c24-4ae3-ac25-6101d6db5aa3	scraped-images/work-projects/globalconsultinggiant/globalconsultinggiant-gallery-4.jpg	gallery/globalconsultinggiant/globalconsultinggiant-gallery-4.jpg	globalconsultinggiant	success	\N	2025-07-14 16:04:26.434083+00
c5d5cd6b-619a-49b3-b13b-1d3f55c28487	scraped-images/work-projects/globalconsultinggiant/globalconsultinggiant-gallery-5.jpg	gallery/globalconsultinggiant/globalconsultinggiant-gallery-5.jpg	globalconsultinggiant	success	\N	2025-07-14 16:04:26.770076+00
0c91b169-b5ae-4f4f-9a78-a3dd131aa86f	scraped-images/work-projects/globalconsultinggiant/globalconsultinggiant-gallery-6.jpg	gallery/globalconsultinggiant/globalconsultinggiant-gallery-6.jpg	globalconsultinggiant	success	\N	2025-07-14 16:04:27.076697+00
547d869d-d488-4534-a076-e07e16ef95f2	scraped-images/work-projects/globalconsultinggiant/globalconsultinggiant-gallery-7.jpg	gallery/globalconsultinggiant/globalconsultinggiant-gallery-7.jpg	globalconsultinggiant	success	\N	2025-07-14 16:04:27.354656+00
a96ec140-f278-4caf-bde7-925185b3aa01	scraped-images/work-projects/globalconsultinggiant/globalconsultinggiant-gallery-8.jpg	gallery/globalconsultinggiant/globalconsultinggiant-gallery-8.jpg	globalconsultinggiant	success	\N	2025-07-14 16:04:27.686089+00
a995cc11-7d51-4b98-adee-b37e8b430ce8	scraped-images/work-projects/globalconsultinggiant/globalconsultinggiant-gallery-9.jpg	gallery/globalconsultinggiant/globalconsultinggiant-gallery-9.jpg	globalconsultinggiant	success	\N	2025-07-14 16:04:27.98935+00
2c5afdde-c5bd-4cb3-9374-9bd12c27f80c	scraped-images/work-projects/goodpack/goodpack-banner.jpg	banners/goodpack/goodpack-banner.jpg	goodpack	success	\N	2025-07-14 16:04:28.294997+00
96939ca3-7073-4da5-b8c9-d8b8b5e84e6c	scraped-images/work-projects/goodpack/goodpack-gallery-1.jpg	gallery/goodpack/goodpack-gallery-1.jpg	goodpack	success	\N	2025-07-14 16:04:28.623401+00
9a2a3d1e-d2bd-4a58-bed6-f0d0bd29d139	scraped-images/work-projects/goodpack/goodpack-gallery-2.jpg	gallery/goodpack/goodpack-gallery-2.jpg	goodpack	success	\N	2025-07-14 16:04:28.958428+00
81abae03-c96b-4a19-b3de-5a528c6a98ba	scraped-images/work-projects/goodpack/goodpack-gallery-3.jpg	gallery/goodpack/goodpack-gallery-3.jpg	goodpack	success	\N	2025-07-14 16:04:29.341785+00
cb87d270-8733-4fcc-97db-f7671ff9f958	scraped-images/work-projects/goodpack/goodpack-gallery-4.jpg	gallery/goodpack/goodpack-gallery-4.jpg	goodpack	success	\N	2025-07-14 16:04:29.776323+00
19a81ed5-771d-4da7-8691-cd7bc4109b83	scraped-images/work-projects/goodpack/goodpack-gallery-5.jpg	gallery/goodpack/goodpack-gallery-5.jpg	goodpack	success	\N	2025-07-14 16:04:30.141766+00
43a5d8c0-5a14-4c07-b7bc-14273a32bcb9	scraped-images/work-projects/goodpack/goodpack-gallery-6.jpg	gallery/goodpack/goodpack-gallery-6.jpg	goodpack	success	\N	2025-07-14 16:04:30.480581+00
41289521-4fee-402e-99e1-2b8e5977429f	scraped-images/work-projects/goodpack/goodpack-gallery-7.jpg	gallery/goodpack/goodpack-gallery-7.jpg	goodpack	success	\N	2025-07-14 16:04:30.794814+00
892c55c8-6478-4a94-a3e3-2d6d89bc9a6c	scraped-images/work-projects/hansimgluck/hansimgluck-banner.jpg	banners/hansimgluck/hansimgluck-banner.jpg	hansimgluck	success	\N	2025-07-14 16:04:31.230924+00
dec77a8b-0d06-4575-8250-7bd0ebc8ffc4	scraped-images/work-projects/hansimgluck/hansimgluck-gallery-1.jpg	gallery/hansimgluck/hansimgluck-gallery-1.jpg	hansimgluck	success	\N	2025-07-14 16:04:31.645184+00
49abdc20-186a-4a99-a60a-200b3094956e	scraped-images/work-projects/hansimgluck/hansimgluck-gallery-2.jpg	gallery/hansimgluck/hansimgluck-gallery-2.jpg	hansimgluck	success	\N	2025-07-14 16:04:31.960444+00
71d8aac1-66fe-407c-a7cc-0793559815ab	scraped-images/work-projects/hansimgluck/hansimgluck-gallery-3.jpg	gallery/hansimgluck/hansimgluck-gallery-3.jpg	hansimgluck	success	\N	2025-07-14 16:04:32.318007+00
f366fa10-53fc-4951-a4b2-9e5edb3cea03	scraped-images/work-projects/hansimgluck/hansimgluck-gallery-4.jpg	gallery/hansimgluck/hansimgluck-gallery-4.jpg	hansimgluck	success	\N	2025-07-14 16:04:32.661918+00
691964e5-e1e2-49a3-ad74-0927636e4dfe	scraped-images/work-projects/heineken/heineken-banner.jpg	banners/heineken/heineken-banner.jpg	heineken	success	\N	2025-07-14 16:04:33.2541+00
c1565a1d-bca2-4f33-9fb9-a3e4c9b47cc5	scraped-images/work-projects/heineken/heineken-gallery-1.jpg	gallery/heineken/heineken-gallery-1.jpg	heineken	success	\N	2025-07-14 16:04:33.54958+00
5df02f77-72f7-49f2-a8cc-dc4aeaf0bd05	scraped-images/work-projects/heineken/heineken-gallery-2.jpg	gallery/heineken/heineken-gallery-2.jpg	heineken	success	\N	2025-07-14 16:04:33.887834+00
eac4ec47-4005-4ec2-ad37-2732c90fc5fb	scraped-images/work-projects/heineken/heineken-gallery-3.jpg	gallery/heineken/heineken-gallery-3.jpg	heineken	success	\N	2025-07-14 16:04:34.331185+00
045248e0-94d4-4b4d-bb33-2b3175baa811	scraped-images/work-projects/heineken/heineken-gallery-4.jpg	gallery/heineken/heineken-gallery-4.jpg	heineken	success	\N	2025-07-14 16:04:34.652115+00
761b6485-cbad-4e2b-918e-b9a6b6f5dc14	scraped-images/work-projects/heineken/heineken-gallery-5.jpg	gallery/heineken/heineken-gallery-5.jpg	heineken	success	\N	2025-07-14 16:04:34.99913+00
8c864d91-34b7-4cf4-9f98-59071dd6ca7b	scraped-images/work-projects/homeaway/homeaway-banner.jpg	banners/homeaway/homeaway-banner.jpg	homeaway	success	\N	2025-07-14 16:04:35.380925+00
1660da28-0ff1-44d6-97c8-c9eb274c0eb7	scraped-images/work-projects/homeaway/homeaway-gallery-1.jpg	gallery/homeaway/homeaway-gallery-1.jpg	homeaway	success	\N	2025-07-14 16:04:35.726307+00
fb34bd92-8bb2-403a-940a-558568b2754c	scraped-images/work-projects/homeaway/homeaway-gallery-10.jpg	gallery/homeaway/homeaway-gallery-10.jpg	homeaway	success	\N	2025-07-14 16:04:36.032245+00
ac688848-ec1f-4f62-9b28-f20e512bcf46	scraped-images/work-projects/homeaway/homeaway-gallery-2.jpg	gallery/homeaway/homeaway-gallery-2.jpg	homeaway	success	\N	2025-07-14 16:04:36.374406+00
7c6f8308-96d0-484f-846a-240d76168fac	scraped-images/work-projects/homeaway/homeaway-gallery-3.jpg	gallery/homeaway/homeaway-gallery-3.jpg	homeaway	success	\N	2025-07-14 16:04:36.689129+00
f5a6a032-9968-4c85-a36f-947550371a18	scraped-images/work-projects/homeaway/homeaway-gallery-4.jpg	gallery/homeaway/homeaway-gallery-4.jpg	homeaway	success	\N	2025-07-14 16:04:37.022984+00
b4435df9-793f-47ee-93cb-e84cb84e235f	scraped-images/work-projects/homeaway/homeaway-gallery-5.jpg	gallery/homeaway/homeaway-gallery-5.jpg	homeaway	success	\N	2025-07-14 16:04:37.342167+00
8727022f-1c3c-4a06-9cda-8804ea67c7ee	scraped-images/work-projects/homeaway/homeaway-gallery-6.jpg	gallery/homeaway/homeaway-gallery-6.jpg	homeaway	success	\N	2025-07-14 16:04:37.632754+00
48ba2dd8-85df-4385-b1c3-d0b94d1e299d	scraped-images/work-projects/homeaway/homeaway-gallery-7.jpg	gallery/homeaway/homeaway-gallery-7.jpg	homeaway	success	\N	2025-07-14 16:04:37.978585+00
c7262943-c7e3-43c3-9c2d-329922f2da29	scraped-images/work-projects/homeaway/homeaway-gallery-8.jpg	gallery/homeaway/homeaway-gallery-8.jpg	homeaway	success	\N	2025-07-14 16:04:38.27472+00
6572544d-eab2-45a9-a7b4-4c484fae31bc	scraped-images/work-projects/homeaway/homeaway-gallery-9.jpg	gallery/homeaway/homeaway-gallery-9.jpg	homeaway	success	\N	2025-07-14 16:04:38.596798+00
4410a556-bb1e-476e-b3f3-c731e54aaeed	scraped-images/work-projects/hongkongmanagement/hongkongmanagement-banner.jpg	banners/hongkongmanagement/hongkongmanagement-banner.jpg	hongkongmanagement	success	\N	2025-07-14 16:04:38.947823+00
819d3c51-b23e-4beb-8321-accb80b34f9f	scraped-images/work-projects/hongkongmanagement/hongkongmanagement-gallery-1.jpg	gallery/hongkongmanagement/hongkongmanagement-gallery-1.jpg	hongkongmanagement	success	\N	2025-07-14 16:04:39.277108+00
d035e760-cf03-4156-9d9f-57e039a60b7b	scraped-images/work-projects/hongkongmanagement/hongkongmanagement-gallery-10.jpg	gallery/hongkongmanagement/hongkongmanagement-gallery-10.jpg	hongkongmanagement	success	\N	2025-07-14 16:04:39.681404+00
abca0b0c-75df-487f-a972-5a23ac0fc6ae	scraped-images/work-projects/hongkongmanagement/hongkongmanagement-gallery-2.jpg	gallery/hongkongmanagement/hongkongmanagement-gallery-2.jpg	hongkongmanagement	success	\N	2025-07-14 16:04:40.020245+00
069fa4b5-2593-45ba-a804-9e783ab65ad8	scraped-images/work-projects/hongkongmanagement/hongkongmanagement-gallery-3.jpg	gallery/hongkongmanagement/hongkongmanagement-gallery-3.jpg	hongkongmanagement	success	\N	2025-07-14 16:04:40.383748+00
e1466b73-a87f-47fe-83f4-c2c97ab420b5	scraped-images/work-projects/hongkongmanagement/hongkongmanagement-gallery-4.jpg	gallery/hongkongmanagement/hongkongmanagement-gallery-4.jpg	hongkongmanagement	success	\N	2025-07-14 16:04:40.709617+00
884843d5-b4c6-4a97-b8fb-56f2128a774c	scraped-images/work-projects/hongkongmanagement/hongkongmanagement-gallery-5.jpg	gallery/hongkongmanagement/hongkongmanagement-gallery-5.jpg	hongkongmanagement	success	\N	2025-07-14 16:04:41.195706+00
6b13cfd1-7b45-42bc-ab49-aa3c49ff11e8	scraped-images/work-projects/hongkongmanagement/hongkongmanagement-gallery-6.jpg	gallery/hongkongmanagement/hongkongmanagement-gallery-6.jpg	hongkongmanagement	success	\N	2025-07-14 16:04:41.504328+00
4d5fa7f3-4378-45c0-9237-a4d3f4a38fdb	scraped-images/work-projects/hongkongmanagement/hongkongmanagement-gallery-7.jpg	gallery/hongkongmanagement/hongkongmanagement-gallery-7.jpg	hongkongmanagement	success	\N	2025-07-14 16:04:41.838456+00
fe8aa292-df28-432d-a293-f277e0d7db1f	scraped-images/work-projects/hongkongmanagement/hongkongmanagement-gallery-8.jpg	gallery/hongkongmanagement/hongkongmanagement-gallery-8.jpg	hongkongmanagement	success	\N	2025-07-14 16:04:42.156992+00
3259728b-ac06-4607-bab0-b99efb4e9503	scraped-images/work-projects/hongkongmanagement/hongkongmanagement-gallery-9.jpg	gallery/hongkongmanagement/hongkongmanagement-gallery-9.jpg	hongkongmanagement	success	\N	2025-07-14 16:04:42.522101+00
994a4201-9cd7-4e9f-b4be-10edcda5c980	scraped-images/work-projects/ihh/ihh-banner.jpg	banners/ihh/ihh-banner.jpg	ihh	success	\N	2025-07-14 16:04:42.856456+00
a7b8e911-9c7c-4670-a4c2-f871d622820a	scraped-images/work-projects/ihh/ihh-gallery-1.jpg	gallery/ihh/ihh-gallery-1.jpg	ihh	success	\N	2025-07-14 16:04:43.146453+00
6215693e-7c36-4c60-b283-de32d817f7f2	scraped-images/work-projects/ihh/ihh-gallery-10.jpg	gallery/ihh/ihh-gallery-10.jpg	ihh	success	\N	2025-07-14 16:04:43.441397+00
77422621-a277-4575-a8ae-7523805b1bed	scraped-images/work-projects/ihh/ihh-gallery-2.jpg	gallery/ihh/ihh-gallery-2.jpg	ihh	success	\N	2025-07-14 16:04:43.740991+00
cf30761f-1068-4c53-a165-cd0a2269e3a8	scraped-images/work-projects/ihh/ihh-gallery-3.jpg	gallery/ihh/ihh-gallery-3.jpg	ihh	success	\N	2025-07-14 16:04:44.042408+00
7567b105-2825-4ff3-85a4-7c29369d07e1	scraped-images/work-projects/ihh/ihh-gallery-4.jpg	gallery/ihh/ihh-gallery-4.jpg	ihh	success	\N	2025-07-14 16:04:44.346496+00
e6b1ad1e-77c3-4c9e-9a6b-4870bf9754e1	scraped-images/work-projects/ihh/ihh-gallery-5.jpg	gallery/ihh/ihh-gallery-5.jpg	ihh	success	\N	2025-07-14 16:04:44.639243+00
4cb716a2-dc0c-4bef-9392-5dd0bce4f4f1	scraped-images/work-projects/ihh/ihh-gallery-6.jpg	gallery/ihh/ihh-gallery-6.jpg	ihh	success	\N	2025-07-14 16:04:44.990326+00
9265b1f1-b53d-4c23-9b0e-50ec48d2cd12	scraped-images/work-projects/ihh/ihh-gallery-7.jpg	gallery/ihh/ihh-gallery-7.jpg	ihh	success	\N	2025-07-14 16:04:45.325986+00
f6d10a11-c373-4b2d-8f21-2d647b6c13ae	scraped-images/work-projects/ihh/ihh-gallery-8.jpg	gallery/ihh/ihh-gallery-8.jpg	ihh	success	\N	2025-07-14 16:04:45.615347+00
171f1d60-7cf3-4d5f-9364-0f4a332fed4e	scraped-images/work-projects/ihh/ihh-gallery-9.jpg	gallery/ihh/ihh-gallery-9.jpg	ihh	success	\N	2025-07-14 16:04:45.924342+00
90e64c62-3644-4769-9a45-a3f2d062f3e0	scraped-images/work-projects/internationallawfirm/internationallawfirm-banner.jpg	banners/internationallawfirm/internationallawfirm-banner.jpg	internationallawfirm	success	\N	2025-07-14 16:04:46.521271+00
71c7b88c-d4b1-4e41-81fe-9a47432d57ab	scraped-images/work-projects/internationallawfirm/internationallawfirm-gallery-1.jpg	gallery/internationallawfirm/internationallawfirm-gallery-1.jpg	internationallawfirm	success	\N	2025-07-14 16:04:46.868405+00
adac883f-725b-4917-b538-bb6722da23e9	scraped-images/work-projects/internationallawfirm/internationallawfirm-gallery-2.jpg	gallery/internationallawfirm/internationallawfirm-gallery-2.jpg	internationallawfirm	success	\N	2025-07-14 16:04:47.157074+00
67274a70-a194-409e-8828-b2bb6cd612a7	scraped-images/work-projects/internationallawfirm/internationallawfirm-gallery-3.jpg	gallery/internationallawfirm/internationallawfirm-gallery-3.jpg	internationallawfirm	success	\N	2025-07-14 16:04:47.540099+00
911a73d7-cff9-4bfd-94a4-d494cfe7d5e4	scraped-images/work-projects/internationallawfirm/internationallawfirm-gallery-4.jpg	gallery/internationallawfirm/internationallawfirm-gallery-4.jpg	internationallawfirm	success	\N	2025-07-14 16:04:47.868484+00
270cadf8-763c-4be1-a5c2-0597d5559b48	scraped-images/work-projects/internationallawfirm/internationallawfirm-gallery-5.jpg	gallery/internationallawfirm/internationallawfirm-gallery-5.jpg	internationallawfirm	success	\N	2025-07-14 16:04:48.194658+00
36d2c1b6-028e-4bce-913f-85285e9b2620	scraped-images/work-projects/internationallawfirm/internationallawfirm-gallery-6.jpg	gallery/internationallawfirm/internationallawfirm-gallery-6.jpg	internationallawfirm	success	\N	2025-07-14 16:04:48.517461+00
245d5b5b-3151-4bf2-8758-2a000727cdb1	scraped-images/work-projects/internationallawfirm/internationallawfirm-gallery-7.jpg	gallery/internationallawfirm/internationallawfirm-gallery-7.jpg	internationallawfirm	success	\N	2025-07-14 16:04:48.843098+00
cb8af7b8-aee6-41a5-bef3-9d5dfe8d944d	scraped-images/work-projects/internationallawfirm/internationallawfirm-gallery-8.jpg	gallery/internationallawfirm/internationallawfirm-gallery-8.jpg	internationallawfirm	success	\N	2025-07-14 16:04:49.203523+00
98d11eff-58c4-4ea5-9cf9-5e6708f9efa2	scraped-images/work-projects/internationallawfirm/internationallawfirm-gallery-9.jpg	gallery/internationallawfirm/internationallawfirm-gallery-9.jpg	internationallawfirm	success	\N	2025-07-14 16:04:49.504209+00
80342072-ae2e-40f4-b233-f004ce2ef25e	scraped-images/work-projects/iqvia/iqvia-banner.jpg	banners/iqvia/iqvia-banner.jpg	iqvia	success	\N	2025-07-14 16:04:49.977177+00
0c2b9469-961e-4b5a-9e20-94c97b0e0ba0	scraped-images/work-projects/iqvia/iqvia-gallery-1.jpg	gallery/iqvia/iqvia-gallery-1.jpg	iqvia	success	\N	2025-07-14 16:04:50.278079+00
c7d9b7af-5101-4e88-bf7b-b43f9a23d627	scraped-images/work-projects/iqvia/iqvia-gallery-10.jpg	gallery/iqvia/iqvia-gallery-10.jpg	iqvia	success	\N	2025-07-14 16:04:50.576505+00
cac585f2-92f3-4e7c-ab67-ea737e86255c	scraped-images/work-projects/iqvia/iqvia-gallery-2.jpg	gallery/iqvia/iqvia-gallery-2.jpg	iqvia	success	\N	2025-07-14 16:04:50.940885+00
68357b97-0153-4242-9bfa-0aaf88099abe	scraped-images/work-projects/iqvia/iqvia-gallery-3.jpg	gallery/iqvia/iqvia-gallery-3.jpg	iqvia	success	\N	2025-07-14 16:04:51.405812+00
44d07728-6f41-415b-9c47-f79cd9d0469f	scraped-images/work-projects/iqvia/iqvia-gallery-4.jpg	gallery/iqvia/iqvia-gallery-4.jpg	iqvia	success	\N	2025-07-14 16:04:51.797402+00
8ca01d22-0542-4fa4-9fb8-0facc1f4af64	scraped-images/work-projects/iqvia/iqvia-gallery-5.jpg	gallery/iqvia/iqvia-gallery-5.jpg	iqvia	success	\N	2025-07-14 16:04:52.125617+00
d33516ba-6cfd-4326-94e7-e472197a5aba	scraped-images/work-projects/iqvia/iqvia-gallery-6.jpg	gallery/iqvia/iqvia-gallery-6.jpg	iqvia	success	\N	2025-07-14 16:04:52.449338+00
dac4bab7-a338-41a2-ba1b-599aa27f9a5f	scraped-images/work-projects/iqvia/iqvia-gallery-7.jpg	gallery/iqvia/iqvia-gallery-7.jpg	iqvia	success	\N	2025-07-14 16:04:52.812458+00
fdbcc09f-1f25-4b2b-9c6a-42a53261ed82	scraped-images/work-projects/iqvia/iqvia-gallery-8.jpg	gallery/iqvia/iqvia-gallery-8.jpg	iqvia	success	\N	2025-07-14 16:04:53.145842+00
bea645ad-7406-49a5-bb15-7c390fbbf775	scraped-images/work-projects/iqvia/iqvia-gallery-9.jpg	gallery/iqvia/iqvia-gallery-9.jpg	iqvia	success	\N	2025-07-14 16:04:53.495065+00
cb3f16ff-f03e-4450-b977-52c924ee1b28	scraped-images/work-projects/lifesciencemanufacturer/lifesciencemanufacturer-banner.jpg	banners/lifesciencemanufacturer/lifesciencemanufacturer-banner.jpg	lifesciencemanufacturer	success	\N	2025-07-14 16:04:53.834037+00
f187e2a4-8bc8-43b7-b522-6a6c4b2f8c7e	scraped-images/work-projects/lifesciencemanufacturer/lifesciencemanufacturer-gallery-1.jpg	gallery/lifesciencemanufacturer/lifesciencemanufacturer-gallery-1.jpg	lifesciencemanufacturer	success	\N	2025-07-14 16:04:54.167976+00
178c65cd-048c-4f7b-b5c7-243862be0b12	scraped-images/work-projects/lifesciencemanufacturer/lifesciencemanufacturer-gallery-2.jpg	gallery/lifesciencemanufacturer/lifesciencemanufacturer-gallery-2.jpg	lifesciencemanufacturer	success	\N	2025-07-14 16:04:54.492611+00
6a1ed6f7-e30f-4eb6-aa4c-6f4feedbaeff	scraped-images/work-projects/lifesciencemanufacturer/lifesciencemanufacturer-gallery-3.jpg	gallery/lifesciencemanufacturer/lifesciencemanufacturer-gallery-3.jpg	lifesciencemanufacturer	success	\N	2025-07-14 16:04:54.804322+00
36874be2-9123-4232-8c3e-cd300ed0f228	scraped-images/work-projects/lifesciencemanufacturer/lifesciencemanufacturer-gallery-4.jpg	gallery/lifesciencemanufacturer/lifesciencemanufacturer-gallery-4.jpg	lifesciencemanufacturer	success	\N	2025-07-14 16:04:55.185625+00
c899e4b8-5e13-4c57-a055-4ef10afe1ada	scraped-images/work-projects/lifesciencemanufacturer/lifesciencemanufacturer-gallery-5.jpg	gallery/lifesciencemanufacturer/lifesciencemanufacturer-gallery-5.jpg	lifesciencemanufacturer	success	\N	2025-07-14 16:04:55.542928+00
8918ddd2-d871-463e-9eed-e20917906c66	scraped-images/work-projects/lifesciencemanufacturer/lifesciencemanufacturer-gallery-6.jpg	gallery/lifesciencemanufacturer/lifesciencemanufacturer-gallery-6.jpg	lifesciencemanufacturer	success	\N	2025-07-14 16:04:55.904407+00
d295be32-0434-4f09-8fb9-3874fa004d25	scraped-images/work-projects/lufax/lufax-banner.jpg	banners/lufax/lufax-banner.jpg	lufax	success	\N	2025-07-14 16:04:56.267509+00
a85cf338-995f-4297-b632-c50dcd012978	scraped-images/work-projects/lufax/lufax-gallery-1.jpg	gallery/lufax/lufax-gallery-1.jpg	lufax	success	\N	2025-07-14 16:04:56.597342+00
e02e7fb5-7a2c-4ce9-95ac-c679843e9a0c	scraped-images/work-projects/lufax/lufax-gallery-2.jpg	gallery/lufax/lufax-gallery-2.jpg	lufax	success	\N	2025-07-14 16:04:56.983009+00
8bb5cbb3-2104-4e00-9c28-b623a89aa7ce	scraped-images/work-projects/lufax/lufax-gallery-3.jpg	gallery/lufax/lufax-gallery-3.jpg	lufax	success	\N	2025-07-14 16:04:57.378449+00
f535fa6c-fb28-45a2-b193-c28e4b911574	scraped-images/work-projects/lufax/lufax-gallery-4.jpg	gallery/lufax/lufax-gallery-4.jpg	lufax	success	\N	2025-07-14 16:04:57.71947+00
9b4bc145-7bc9-4aea-a48e-00d307698dfa	scraped-images/work-projects/lufax/lufax-gallery-5.jpg	gallery/lufax/lufax-gallery-5.jpg	lufax	success	\N	2025-07-14 16:04:58.045126+00
e083b859-7c1e-4948-a2b5-c764b8c356b4	scraped-images/work-projects/managementconsultingfirm/managementconsultingfirm-banner.jpg	banners/managementconsultingfirm/managementconsultingfirm-banner.jpg	managementconsultingfirm	success	\N	2025-07-14 16:04:58.391862+00
1c3ad6f8-8c77-499b-a2b3-dfcd3d241795	scraped-images/work-projects/managementconsultingfirm/managementconsultingfirm-gallery-1.jpg	gallery/managementconsultingfirm/managementconsultingfirm-gallery-1.jpg	managementconsultingfirm	success	\N	2025-07-14 16:04:58.772733+00
e4d0ddb7-3432-4922-a9a7-35b8f593ce11	scraped-images/work-projects/managementconsultingfirm/managementconsultingfirm-gallery-10.jpg	gallery/managementconsultingfirm/managementconsultingfirm-gallery-10.jpg	managementconsultingfirm	success	\N	2025-07-14 16:04:59.094177+00
58a7cc88-03fd-46d8-9fda-7e0fd1839810	scraped-images/work-projects/managementconsultingfirm/managementconsultingfirm-gallery-2.jpg	gallery/managementconsultingfirm/managementconsultingfirm-gallery-2.jpg	managementconsultingfirm	success	\N	2025-07-14 16:04:59.520591+00
f138e5ed-94ce-44a1-91d0-5270b1146199	scraped-images/work-projects/managementconsultingfirm/managementconsultingfirm-gallery-3.jpg	gallery/managementconsultingfirm/managementconsultingfirm-gallery-3.jpg	managementconsultingfirm	success	\N	2025-07-14 16:04:59.877552+00
2c476488-7cdc-4d23-854f-439713c3ce35	scraped-images/work-projects/managementconsultingfirm/managementconsultingfirm-gallery-4.jpg	gallery/managementconsultingfirm/managementconsultingfirm-gallery-4.jpg	managementconsultingfirm	success	\N	2025-07-14 16:05:00.222747+00
16735211-882d-46d0-a368-a579f7d8bd16	scraped-images/work-projects/managementconsultingfirm/managementconsultingfirm-gallery-5.jpg	gallery/managementconsultingfirm/managementconsultingfirm-gallery-5.jpg	managementconsultingfirm	success	\N	2025-07-14 16:05:00.556997+00
61486613-8f29-4213-a5c5-f0fce8071838	scraped-images/work-projects/managementconsultingfirm/managementconsultingfirm-gallery-6.jpg	gallery/managementconsultingfirm/managementconsultingfirm-gallery-6.jpg	managementconsultingfirm	success	\N	2025-07-14 16:05:00.889836+00
9cc1329b-957a-4093-8fd7-c8a2429190a1	scraped-images/work-projects/managementconsultingfirm/managementconsultingfirm-gallery-7.jpg	gallery/managementconsultingfirm/managementconsultingfirm-gallery-7.jpg	managementconsultingfirm	success	\N	2025-07-14 16:05:01.287866+00
30495430-0320-4466-aaa5-592704270426	scraped-images/work-projects/managementconsultingfirm/managementconsultingfirm-gallery-8.jpg	gallery/managementconsultingfirm/managementconsultingfirm-gallery-8.jpg	managementconsultingfirm	success	\N	2025-07-14 16:05:01.670647+00
bef29454-e478-4870-a5d0-946445f16826	scraped-images/work-projects/managementconsultingfirm/managementconsultingfirm-gallery-9.jpg	gallery/managementconsultingfirm/managementconsultingfirm-gallery-9.jpg	managementconsultingfirm	success	\N	2025-07-14 16:05:02.029322+00
b8bffc67-eea8-4bb4-9205-7d6ebe55a194	scraped-images/work-projects/managementconsultingsg/managementconsultingsg-banner.jpg	banners/managementconsultingsg/managementconsultingsg-banner.jpg	managementconsultingsg	success	\N	2025-07-14 16:05:02.368348+00
304cc1cc-9e7a-4956-9f2f-d9a0ba105ffa	scraped-images/work-projects/managementconsultingsg/mcsg-banner.jpg	banners/managementconsultingsg/mcsg-banner.jpg	managementconsultingsg	success	\N	2025-07-14 16:05:02.728462+00
cd567ee3-4084-4a35-8d99-a6d1c4bda2d6	scraped-images/work-projects/managementconsultingsg/mcsg-gallery-1.jpg	gallery/managementconsultingsg/mcsg-gallery-1.jpg	managementconsultingsg	success	\N	2025-07-14 16:05:03.295188+00
dd6155b8-7485-4af7-8292-40a09c003404	scraped-images/work-projects/managementconsultingsg/mcsg-gallery-10.jpg	gallery/managementconsultingsg/mcsg-gallery-10.jpg	managementconsultingsg	success	\N	2025-07-14 16:05:03.61289+00
beee9b86-caf5-4400-a39d-c4e079e552e3	scraped-images/work-projects/managementconsultingsg/mcsg-gallery-2.jpg	gallery/managementconsultingsg/mcsg-gallery-2.jpg	managementconsultingsg	success	\N	2025-07-14 16:05:03.995423+00
f0293652-78bd-4392-ba46-9c8a37c39559	scraped-images/work-projects/managementconsultingsg/mcsg-gallery-3.jpg	gallery/managementconsultingsg/mcsg-gallery-3.jpg	managementconsultingsg	success	\N	2025-07-14 16:05:04.345684+00
91ea0ce1-dd24-46bf-8464-257c01d3e719	scraped-images/work-projects/managementconsultingsg/mcsg-gallery-4.jpg	gallery/managementconsultingsg/mcsg-gallery-4.jpg	managementconsultingsg	success	\N	2025-07-14 16:05:04.690837+00
4fd0c131-d649-419d-a3e5-61e4555dc115	scraped-images/work-projects/managementconsultingsg/mcsg-gallery-5.jpg	gallery/managementconsultingsg/mcsg-gallery-5.jpg	managementconsultingsg	success	\N	2025-07-14 16:05:05.014422+00
f18d604d-f929-4a29-8829-ffbee96ffd1f	scraped-images/work-projects/managementconsultingsg/mcsg-gallery-6.jpg	gallery/managementconsultingsg/mcsg-gallery-6.jpg	managementconsultingsg	success	\N	2025-07-14 16:05:05.343051+00
f56dfc17-4db0-4734-8438-2558843a18b5	scraped-images/work-projects/managementconsultingsg/mcsg-gallery-7.jpg	gallery/managementconsultingsg/mcsg-gallery-7.jpg	managementconsultingsg	success	\N	2025-07-14 16:05:05.64526+00
1923196f-faa8-4275-bb67-67c7ba7a8747	scraped-images/work-projects/managementconsultingsg/mcsg-gallery-8.jpg	gallery/managementconsultingsg/mcsg-gallery-8.jpg	managementconsultingsg	success	\N	2025-07-14 16:05:05.996311+00
cbae746c-33ff-4658-be62-2d40fdf19b43	scraped-images/work-projects/managementconsultingsg/mcsg-gallery-9.jpg	gallery/managementconsultingsg/mcsg-gallery-9.jpg	managementconsultingsg	success	\N	2025-07-14 16:05:06.346557+00
5379df09-7585-4242-b54e-49cc1c192118	scraped-images/work-projects/myp/myp-banner.jpg	banners/myp/myp-banner.jpg	myp	success	\N	2025-07-14 16:05:06.68565+00
9f3e1e83-73c3-46ad-ba55-47ec79af5a7c	scraped-images/work-projects/myp/myp-gallery-1.jpg	gallery/myp/myp-gallery-1.jpg	myp	success	\N	2025-07-14 16:05:07.009847+00
9f7be7d1-3fd6-4af5-80dc-88d6e1aff498	scraped-images/work-projects/myp/myp-gallery-2.jpg	gallery/myp/myp-gallery-2.jpg	myp	success	\N	2025-07-14 16:05:07.344079+00
1d9979f8-f6a0-4f98-be1a-ce55d407b2ab	scraped-images/work-projects/myp/myp-gallery-3.jpg	gallery/myp/myp-gallery-3.jpg	myp	success	\N	2025-07-14 16:05:07.711285+00
cd3023f9-b717-40bc-a098-87c8d3afbbd4	scraped-images/work-projects/myp/myp-gallery-4.jpg	gallery/myp/myp-gallery-4.jpg	myp	success	\N	2025-07-14 16:05:08.036745+00
460e92be-3c20-462f-9824-c83aa850851d	scraped-images/work-projects/myp/myp-gallery-5.jpg	gallery/myp/myp-gallery-5.jpg	myp	success	\N	2025-07-14 16:05:08.361504+00
46195a2a-d1c0-44a9-88f9-8e0ebf4ff79f	scraped-images/work-projects/philipmorrissingapore/philipmorrissingapore-banner.jpg	banners/philipmorrissingapore/philipmorrissingapore-banner.jpg	philipmorrissingapore	success	\N	2025-07-14 16:05:08.852407+00
e9d8a159-d0b0-445c-8cbd-add13e1613cd	scraped-images/work-projects/philipmorrissingapore/philipmorrissingapore-gallery-1.jpg	gallery/philipmorrissingapore/philipmorrissingapore-gallery-1.jpg	philipmorrissingapore	success	\N	2025-07-14 16:05:09.183498+00
bb80ceca-5815-49c3-874c-4802bf55cc16	scraped-images/work-projects/philipmorrissingapore/philipmorrissingapore-gallery-2.jpg	gallery/philipmorrissingapore/philipmorrissingapore-gallery-2.jpg	philipmorrissingapore	success	\N	2025-07-14 16:05:09.498242+00
0f96930e-c647-4f5b-9eee-0e37c2dd7b04	scraped-images/work-projects/philipmorrissingapore/philipmorrissingapore-gallery-3.jpg	gallery/philipmorrissingapore/philipmorrissingapore-gallery-3.jpg	philipmorrissingapore	success	\N	2025-07-14 16:05:09.839736+00
5966e71e-710a-4abf-9230-3fd2288aaf4d	scraped-images/work-projects/philipmorrissingapore/philipmorrissingapore-gallery-4.jpg	gallery/philipmorrissingapore/philipmorrissingapore-gallery-4.jpg	philipmorrissingapore	success	\N	2025-07-14 16:05:10.201387+00
5eeb26cc-a123-4006-ad16-22ccc112b1c8	scraped-images/work-projects/philipmorrissingapore/philipmorrissingapore-gallery-5.jpg	gallery/philipmorrissingapore/philipmorrissingapore-gallery-5.jpg	philipmorrissingapore	success	\N	2025-07-14 16:05:10.534419+00
78bc1492-345a-4acf-8852-45d41d9fcc50	scraped-images/work-projects/philipmorrissingapore/philipmorrissingapore-gallery-6.jpg	gallery/philipmorrissingapore/philipmorrissingapore-gallery-6.jpg	philipmorrissingapore	success	\N	2025-07-14 16:05:10.842043+00
c5c7a8a6-79cc-450e-824c-235819de29dd	scraped-images/work-projects/philipmorrissingapore/philipmorrissingapore-gallery-7.jpg	gallery/philipmorrissingapore/philipmorrissingapore-gallery-7.jpg	philipmorrissingapore	success	\N	2025-07-14 16:05:11.144234+00
d1331596-2920-4b56-aa35-6e3897472f38	scraped-images/work-projects/philipmorrissingapore/philipmorrissingapore-gallery-8.jpg	gallery/philipmorrissingapore/philipmorrissingapore-gallery-8.jpg	philipmorrissingapore	success	\N	2025-07-14 16:05:11.532654+00
4420a8d2-6b75-44d6-851d-3bab43c4a264	scraped-images/work-projects/philipmorrissingapore/philipmorrissingapore-gallery-9.jpg	gallery/philipmorrissingapore/philipmorrissingapore-gallery-9.jpg	philipmorrissingapore	success	\N	2025-07-14 16:05:11.844678+00
d27c3fb1-5bca-453f-869a-90e2b27507a1	scraped-images/work-projects/resources/resources-banner.jpg	banners/resources/resources-banner.jpg	resources	success	\N	2025-07-14 16:05:12.257447+00
a65d42a0-9165-4f93-b25c-850536c65b5b	scraped-images/work-projects/resources/resources-gallery-1.jpg	gallery/resources/resources-gallery-1.jpg	resources	success	\N	2025-07-14 16:05:12.603358+00
a2f3b01c-8882-46a7-be58-452e361e8165	scraped-images/work-projects/resources/resources-gallery-2.jpg	gallery/resources/resources-gallery-2.jpg	resources	success	\N	2025-07-14 16:05:12.931298+00
97c857b2-b479-40ce-9d46-ed173c1ee354	scraped-images/work-projects/resources/resources-gallery-3.jpg	gallery/resources/resources-gallery-3.jpg	resources	success	\N	2025-07-14 16:05:13.33229+00
4bce8cc1-fae1-43ad-81b4-2c3ed7bb9b0f	scraped-images/work-projects/resources/resources-gallery-4.jpg	gallery/resources/resources-gallery-4.jpg	resources	success	\N	2025-07-14 16:05:13.694922+00
358eb660-5a9e-4a3f-a0cf-0178e22dd99d	scraped-images/work-projects/ricecommunications/ricecommunications-banner.jpg	banners/ricecommunications/ricecommunications-banner.jpg	ricecommunications	success	\N	2025-07-14 16:05:14.004056+00
60c7cb8c-2324-40bc-a964-5709a228de57	scraped-images/work-projects/ricecommunications/ricecommunications-gallery-1.jpg	gallery/ricecommunications/ricecommunications-gallery-1.jpg	ricecommunications	success	\N	2025-07-14 16:05:14.328496+00
0b27d316-6203-4bdb-aa59-ba1f4ee3edf2	scraped-images/work-projects/ricecommunications/ricecommunications-gallery-2.jpg	gallery/ricecommunications/ricecommunications-gallery-2.jpg	ricecommunications	success	\N	2025-07-14 16:05:14.631597+00
d4ec1346-318c-438e-9820-1b5f6b34f330	scraped-images/work-projects/ricecommunications/ricecommunications-gallery-3.jpg	gallery/ricecommunications/ricecommunications-gallery-3.jpg	ricecommunications	success	\N	2025-07-14 16:05:14.932698+00
4355175f-7c35-491e-8573-4c4f7512665f	scraped-images/work-projects/ricecommunications/ricecommunications-gallery-4.jpg	gallery/ricecommunications/ricecommunications-gallery-4.jpg	ricecommunications	success	\N	2025-07-14 16:05:15.221373+00
d70437a1-9f8a-4516-922e-7723db0b5e94	scraped-images/work-projects/ricecommunications/ricecommunications-gallery-5.jpg	gallery/ricecommunications/ricecommunications-gallery-5.jpg	ricecommunications	success	\N	2025-07-14 16:05:15.513084+00
d5b873e5-daee-4bb4-bb7a-b5448c2664f4	scraped-images/work-projects/ricecommunications/ricecommunications-gallery-6.jpg	gallery/ricecommunications/ricecommunications-gallery-6.jpg	ricecommunications	success	\N	2025-07-14 16:05:15.815504+00
7ee13a81-7cda-4e1f-bff2-934bb796baa2	scraped-images/work-projects/ridehailinggiant/ridehailinggiant-banner.jpg	banners/ridehailinggiant/ridehailinggiant-banner.jpg	ridehailinggiant	success	\N	2025-07-14 16:05:16.256646+00
87849b91-a8c4-4171-9de8-0a7cd15436b7	scraped-images/work-projects/ridehailinggiant/ridehailinggiant-gallery-1.jpg	gallery/ridehailinggiant/ridehailinggiant-gallery-1.jpg	ridehailinggiant	success	\N	2025-07-14 16:05:16.783034+00
0ed1aadc-39cb-48ce-8551-1dda08c7dc1c	scraped-images/work-projects/ridehailinggiant/ridehailinggiant-gallery-2.jpg	gallery/ridehailinggiant/ridehailinggiant-gallery-2.jpg	ridehailinggiant	success	\N	2025-07-14 16:05:17.117741+00
a14a0b62-3798-4dca-bce2-95e357081512	scraped-images/work-projects/ridehailinggiant/ridehailinggiant-gallery-3.jpg	gallery/ridehailinggiant/ridehailinggiant-gallery-3.jpg	ridehailinggiant	success	\N	2025-07-14 16:05:17.476784+00
6d779a5e-5589-4b03-9c55-ae16fc07b8a2	scraped-images/work-projects/ridehailinggiant/ridehailinggiant-gallery-4.jpg	gallery/ridehailinggiant/ridehailinggiant-gallery-4.jpg	ridehailinggiant	success	\N	2025-07-14 16:05:17.841456+00
ab75fb2a-4011-45f8-bb71-04154a413165	scraped-images/work-projects/ridehailinggiant/ridehailinggiant-gallery-5.jpg	gallery/ridehailinggiant/ridehailinggiant-gallery-5.jpg	ridehailinggiant	success	\N	2025-07-14 16:05:18.183502+00
6126aa42-6145-4728-b743-b12b49c940e9	scraped-images/work-projects/ridehailinggiant/ridehailinggiant-gallery-6.jpg	gallery/ridehailinggiant/ridehailinggiant-gallery-6.jpg	ridehailinggiant	success	\N	2025-07-14 16:05:18.661178+00
cb7401dd-c234-4eac-9654-e67f0b53aff1	scraped-images/work-projects/ridehailinggiant/ridehailinggiant-gallery-7.jpg	gallery/ridehailinggiant/ridehailinggiant-gallery-7.jpg	ridehailinggiant	success	\N	2025-07-14 16:05:19.228252+00
2acad633-5f1a-4cfa-aee4-216b0fd0912c	scraped-images/work-projects/ridehailinggiant/ridehailinggiant-gallery-8.jpg	gallery/ridehailinggiant/ridehailinggiant-gallery-8.jpg	ridehailinggiant	success	\N	2025-07-14 16:05:19.713376+00
e8b19cbd-5b5a-4f25-b4c0-ebc2db7ddae9	scraped-images/work-projects/ridehailinggiant/ridehailinggiant-gallery-9.jpg	gallery/ridehailinggiant/ridehailinggiant-gallery-9.jpg	ridehailinggiant	success	\N	2025-07-14 16:05:20.069588+00
2e578999-06f1-439a-84e3-9f63f11c227d	scraped-images/work-projects/rqam/rqam-banner.jpg	banners/rqam/rqam-banner.jpg	rqam	success	\N	2025-07-14 16:05:20.702852+00
9dd57e37-ffd4-475a-a263-23ba6e61d4fb	scraped-images/work-projects/rqam/rqam-gallery-1.jpg	gallery/rqam/rqam-gallery-1.jpg	rqam	success	\N	2025-07-14 16:05:21.077382+00
d7a050ba-7031-4f87-aff0-85b4739f36e3	scraped-images/work-projects/rqam/rqam-gallery-2.jpg	gallery/rqam/rqam-gallery-2.jpg	rqam	success	\N	2025-07-14 16:05:21.447714+00
eae95182-6a87-40ee-9b06-30ddce1af8a1	scraped-images/work-projects/rqam/rqam-gallery-3.jpg	gallery/rqam/rqam-gallery-3.jpg	rqam	success	\N	2025-07-14 16:05:21.760936+00
eee879e7-5297-4edf-8d24-e972a46b8657	scraped-images/work-projects/rqam/rqam-gallery-4.jpg	gallery/rqam/rqam-gallery-4.jpg	rqam	success	\N	2025-07-14 16:05:22.0976+00
8ba80269-ff81-473f-90d2-40fe0369f1f4	scraped-images/work-projects/rqam/rqam-gallery-5.jpg	gallery/rqam/rqam-gallery-5.jpg	rqam	success	\N	2025-07-14 16:05:22.44125+00
2f9ce742-df62-4022-b45c-67ce23d427b6	scraped-images/work-projects/swissbank/swissbank-banner.jpg	banners/swissbank/swissbank-banner.jpg	swissbank	success	\N	2025-07-14 16:05:22.822269+00
d9cceb87-ed12-4e20-beda-e5c00e660779	scraped-images/work-projects/swissbank/swissbank-gallery-1.jpg	gallery/swissbank/swissbank-gallery-1.jpg	swissbank	success	\N	2025-07-14 16:05:23.175874+00
859dc687-4eb5-4333-a4bb-1c16261b79b4	scraped-images/work-projects/swissbank/swissbank-gallery-10.jpg	gallery/swissbank/swissbank-gallery-10.jpg	swissbank	success	\N	2025-07-14 16:05:23.524618+00
6db0b4c9-efb4-49c8-bbca-28e9ec29a78b	scraped-images/work-projects/swissbank/swissbank-gallery-2.jpg	gallery/swissbank/swissbank-gallery-2.jpg	swissbank	success	\N	2025-07-14 16:05:23.952225+00
1cd58649-9c1a-400a-bad0-a0b3f246f79e	scraped-images/work-projects/swissbank/swissbank-gallery-3.jpg	gallery/swissbank/swissbank-gallery-3.jpg	swissbank	success	\N	2025-07-14 16:05:24.289529+00
eecfa1d8-5e44-4539-a516-ac69ff92ea61	scraped-images/work-projects/swissbank/swissbank-gallery-4.jpg	gallery/swissbank/swissbank-gallery-4.jpg	swissbank	success	\N	2025-07-14 16:05:24.597674+00
0744cf65-0e57-4d9a-9774-2299163cfe85	scraped-images/work-projects/swissbank/swissbank-gallery-5.jpg	gallery/swissbank/swissbank-gallery-5.jpg	swissbank	success	\N	2025-07-14 16:05:24.946604+00
890de907-71e2-4012-9089-f43e2bc21dac	scraped-images/work-projects/swissbank/swissbank-gallery-6.jpg	gallery/swissbank/swissbank-gallery-6.jpg	swissbank	success	\N	2025-07-14 16:05:25.338081+00
50b55891-6af8-4538-a560-7f7b4f36e2e6	scraped-images/work-projects/swissbank/swissbank-gallery-7.jpg	gallery/swissbank/swissbank-gallery-7.jpg	swissbank	success	\N	2025-07-14 16:05:25.650272+00
5cf629f8-2fae-447b-83f7-3843fdcb69b7	scraped-images/work-projects/swissbank/swissbank-gallery-8.jpg	gallery/swissbank/swissbank-gallery-8.jpg	swissbank	success	\N	2025-07-14 16:05:26.029042+00
1cf4f347-1c11-45b2-ab55-c5dfc4972b73	scraped-images/work-projects/swissbank/swissbank-gallery-9.jpg	gallery/swissbank/swissbank-gallery-9.jpg	swissbank	success	\N	2025-07-14 16:05:26.450161+00
d287c5b1-3664-4733-9093-b87145fa9792	scraped-images/work-projects/thewolfden/thewolfden-banner.jpg	banners/thewolfden/thewolfden-banner.jpg	thewolfden	success	\N	2025-07-14 16:05:26.830667+00
61fc47b4-f104-45b4-a251-ade87edc5ec8	scraped-images/work-projects/thewolfden/thewolfden-gallery-1.jpg	gallery/thewolfden/thewolfden-gallery-1.jpg	thewolfden	success	\N	2025-07-14 16:05:27.183985+00
e9765492-6520-4e6a-b1b4-946e2ef6b348	scraped-images/work-projects/thewolfden/thewolfden-gallery-2.jpg	gallery/thewolfden/thewolfden-gallery-2.jpg	thewolfden	success	\N	2025-07-14 16:05:27.589859+00
84e04932-1d0c-4af6-bfc2-ab265f91b3e9	scraped-images/work-projects/thewolfden/thewolfden-gallery-3.jpg	gallery/thewolfden/thewolfden-gallery-3.jpg	thewolfden	success	\N	2025-07-14 16:05:27.900675+00
c24c5e8d-0970-4b79-b3ec-c6d38f2e0501	scraped-images/work-projects/thewolfden/thewolfden-gallery-4.jpg	gallery/thewolfden/thewolfden-gallery-4.jpg	thewolfden	success	\N	2025-07-14 16:05:28.244128+00
7a96e3e8-e4b7-48b5-967c-b09581fb4a4b	scraped-images/work-projects/thewolfden/thewolfden-gallery-5.jpg	gallery/thewolfden/thewolfden-gallery-5.jpg	thewolfden	success	\N	2025-07-14 16:05:28.594037+00
3808cac8-eebd-430f-9547-e81fb442e837	scraped-images/work-projects/vvlife/vvlife-banner.jpg	banners/vvlife/vvlife-banner.jpg	vvlife	success	\N	2025-07-14 16:05:28.963213+00
443a89f3-a858-41ec-8e5d-59c7e49ecaf8	scraped-images/work-projects/vvlife/vvlife-gallery-1.jpg	gallery/vvlife/vvlife-gallery-1.jpg	vvlife	success	\N	2025-07-14 16:05:29.323171+00
d588aa56-227c-4c92-afe5-634fca18d25a	scraped-images/work-projects/vvlife/vvlife-gallery-2.jpg	gallery/vvlife/vvlife-gallery-2.jpg	vvlife	success	\N	2025-07-14 16:05:29.666879+00
e8d1cbb9-9d9b-45cd-9ee5-58e61a63d86a	scraped-images/work-projects/vvlife/vvlife-gallery-3.jpg	gallery/vvlife/vvlife-gallery-3.jpg	vvlife	success	\N	2025-07-14 16:05:30.02831+00
80f76d70-9c6e-4b9f-8ab7-45f9f5324ed2	scraped-images/work-projects/vvlife/vvlife-gallery-4.jpg	gallery/vvlife/vvlife-gallery-4.jpg	vvlife	success	\N	2025-07-14 16:05:30.374713+00
15de24c3-59e8-47a9-bcba-82a35ddbe787	scraped-images/work-projects/vvlife/vvlife-gallery-5.jpg	gallery/vvlife/vvlife-gallery-5.jpg	vvlife	success	\N	2025-07-14 16:05:30.806433+00
0a09cfc5-1a38-4bc9-bd11-208c95165764	scraped-images/work-projects/vvlife/vvlife-gallery-6.jpg	gallery/vvlife/vvlife-gallery-6.jpg	vvlife	success	\N	2025-07-14 16:05:31.139822+00
132cf47d-55b5-4f5c-a629-965315e58d07	scraped-images/work-projects/zurichinsurance/zurichinsurance-banner.jpg	banners/zurichinsurance/zurichinsurance-banner.jpg	zurichinsurance	success	\N	2025-07-14 16:05:31.542385+00
331757ac-85d5-4e60-b091-9c92d4897cde	scraped-images/work-projects/zurichinsurance/zurichinsurance-gallery-1.jpg	gallery/zurichinsurance/zurichinsurance-gallery-1.jpg	zurichinsurance	success	\N	2025-07-14 16:05:31.850466+00
1e3e5cce-7cdb-4d0c-99b6-29dfb69902e4	scraped-images/work-projects/zurichinsurance/zurichinsurance-gallery-2.jpg	gallery/zurichinsurance/zurichinsurance-gallery-2.jpg	zurichinsurance	success	\N	2025-07-14 16:05:32.195138+00
bb7a266f-c837-43d1-9eb3-bffd80a1c184	scraped-images/work-projects/zurichinsurance/zurichinsurance-gallery-3.jpg	gallery/zurichinsurance/zurichinsurance-gallery-3.jpg	zurichinsurance	success	\N	2025-07-14 16:05:32.549195+00
a48286e5-04a0-4258-80a8-db1a1c5cf385	scraped-images/work-projects/zurichinsurance/zurichinsurance-gallery-4.jpg	gallery/zurichinsurance/zurichinsurance-gallery-4.jpg	zurichinsurance	success	\N	2025-07-14 16:05:32.9261+00
a2388d5a-df35-4877-90b3-94b1d680f717	scraped-images/work-projects/zurichinsurance/zurichinsurance-gallery-5.jpg	gallery/zurichinsurance/zurichinsurance-gallery-5.jpg	zurichinsurance	success	\N	2025-07-14 16:05:33.233898+00
a10dedd8-4553-4ced-9d55-aec1f70da41b	scraped-images/work-projects/zurichinsurance/zurichinsurance-gallery-6.jpg	gallery/zurichinsurance/zurichinsurance-gallery-6.jpg	zurichinsurance	success	\N	2025-07-14 16:05:33.571933+00
eb72920a-c070-493a-8353-22ab3b9c2c34	scraped-images/work-projects/zurichinsurance/zurichinsurance-gallery-7.jpg	gallery/zurichinsurance/zurichinsurance-gallery-7.jpg	zurichinsurance	success	\N	2025-07-14 16:05:33.888751+00
508dc4fc-7b23-470e-b5c3-4c7cb8e07fc5	scraped-images/work-projects/bayer/bayer-banner.jpg	banners/bayer/bayer-banner.jpg	bayer	success	\N	2025-07-14 16:10:31.796373+00
c991d688-5828-4498-b27d-4085e9d16f8d	scraped-images/work-projects/bayer/bayer-gallery-1.jpg	gallery/bayer/bayer-gallery-1.jpg	bayer	success	\N	2025-07-14 16:10:32.167639+00
1cbfe57c-8b30-4d54-9d77-ea817ee43d1d	scraped-images/work-projects/bayer/bayer-gallery-2.jpg	gallery/bayer/bayer-gallery-2.jpg	bayer	success	\N	2025-07-14 16:10:32.476563+00
10d01a68-73b4-4b7e-b22f-341b7ea9306e	scraped-images/work-projects/bayer/bayer-gallery-3.jpg	gallery/bayer/bayer-gallery-3.jpg	bayer	success	\N	2025-07-14 16:10:32.889665+00
5d14aef0-9a63-4cfb-9019-f6684b8feaa9	scraped-images/work-projects/bayer/bayer-gallery-4.jpg	gallery/bayer/bayer-gallery-4.jpg	bayer	success	\N	2025-07-14 16:10:33.286771+00
f5bc1868-148e-4e78-b79e-1fcd21983044	scraped-images/work-projects/bayer/bayer-gallery-5.jpg	gallery/bayer/bayer-gallery-5.jpg	bayer	success	\N	2025-07-14 16:10:33.663062+00
3bcfbb07-6d3a-471b-b3f3-03137eaed3f1	scraped-images/work-projects/bayer/bayer-gallery-6.jpg	gallery/bayer/bayer-gallery-6.jpg	bayer	success	\N	2025-07-14 16:10:34.026837+00
b6e6f2aa-e85c-4238-bb84-41a5adabd4f9	scraped-images/work-projects/bayer/bayer-gallery-7.jpg	gallery/bayer/bayer-gallery-7.jpg	bayer	success	\N	2025-07-14 16:10:34.386671+00
50fa1b9a-cb5f-4aa3-bcc3-322ccd3790ca	scraped-images/work-projects/bayer/bayer-gallery-8.jpg	gallery/bayer/bayer-gallery-8.jpg	bayer	success	\N	2025-07-14 16:10:34.747428+00
45789a27-3ad4-4d44-ba98-bde7911bac83	scraped-images/work-projects/bosch/bosch-banner.jpg	banners/bosch/bosch-banner.jpg	bosch	success	\N	2025-07-14 16:10:35.166092+00
f5b45a3b-7c1f-4702-8ede-701d38e82927	scraped-images/work-projects/bosch/bosch-gallery-1.jpg	gallery/bosch/bosch-gallery-1.jpg	bosch	success	\N	2025-07-14 16:10:35.674298+00
c5e9b05b-231c-423b-8883-c6508e4e7156	scraped-images/work-projects/bosch/bosch-gallery-2.jpg	gallery/bosch/bosch-gallery-2.jpg	bosch	success	\N	2025-07-14 16:10:36.043934+00
a535d773-2f1a-4875-8e33-c751462a84af	scraped-images/work-projects/bosch/bosch-gallery-3.jpg	gallery/bosch/bosch-gallery-3.jpg	bosch	success	\N	2025-07-14 16:10:36.417248+00
c06e6085-f1d3-428a-b301-702b02915048	scraped-images/work-projects/bosch/bosch-gallery-4.jpg	gallery/bosch/bosch-gallery-4.jpg	bosch	success	\N	2025-07-14 16:10:36.771494+00
c709ce17-d51f-40db-88c0-72d9474d09e8	scraped-images/work-projects/bosch/bosch-gallery-5.jpg	gallery/bosch/bosch-gallery-5.jpg	bosch	success	\N	2025-07-14 16:10:37.185161+00
61cbda22-2e57-4032-bb7c-de63b2ea92ed	scraped-images/work-projects/bosch/bosch-gallery-6.jpg	gallery/bosch/bosch-gallery-6.jpg	bosch	success	\N	2025-07-14 16:10:37.519182+00
6f263685-b952-4d4d-bd23-c20f54185b61	scraped-images/work-projects/bosch/bosch-gallery-7.jpg	gallery/bosch/bosch-gallery-7.jpg	bosch	success	\N	2025-07-14 16:10:37.830908+00
43f1d653-ecd7-43c4-a093-078027c8cae6	scraped-images/work-projects/bosch/bosch-gallery-8.jpg	gallery/bosch/bosch-gallery-8.jpg	bosch	success	\N	2025-07-14 16:10:38.218588+00
d66fd826-1ea9-4386-a92a-80f727ecfdd4	scraped-images/work-projects/cbre/cbre-banner.jpg	banners/cbre/cbre-banner.jpg	cbre	success	\N	2025-07-14 16:10:38.624269+00
ac12eb04-1791-444c-b189-fce96453fea7	scraped-images/work-projects/cbre/cbre-gallery-1.jpg	gallery/cbre/cbre-gallery-1.jpg	cbre	success	\N	2025-07-14 16:10:38.922935+00
be9ffdfb-378a-409e-87ab-82dab19e6779	scraped-images/work-projects/cbre/cbre-gallery-2.jpg	gallery/cbre/cbre-gallery-2.jpg	cbre	success	\N	2025-07-14 16:10:39.267227+00
59df2992-e0b8-440a-9200-90a8dc0f1108	scraped-images/work-projects/cbre/cbre-gallery-3.jpg	gallery/cbre/cbre-gallery-3.jpg	cbre	success	\N	2025-07-14 16:10:39.617288+00
57013ee6-6292-42fc-97ca-82b5dbfacd94	scraped-images/work-projects/cbre/cbre-gallery-4.jpg	gallery/cbre/cbre-gallery-4.jpg	cbre	success	\N	2025-07-14 16:10:39.976198+00
954cb147-4e50-4c37-aed1-37cf1ec5bbaa	scraped-images/work-projects/cbre/cbre-gallery-5.jpg	gallery/cbre/cbre-gallery-5.jpg	cbre	success	\N	2025-07-14 16:10:40.310844+00
29544205-7fd9-42f6-8d53-8a9cf8114acc	scraped-images/work-projects/cbre/cbre-gallery-6.jpg	gallery/cbre/cbre-gallery-6.jpg	cbre	success	\N	2025-07-14 16:10:40.67072+00
9656f1c3-5f4a-4556-84c9-a12a4bc8face	scraped-images/work-projects/cbre/cbre-gallery-7.jpg	gallery/cbre/cbre-gallery-7.jpg	cbre	success	\N	2025-07-14 16:10:40.996885+00
8421e0a6-4d02-4871-b4a8-a75b9ee71a4b	scraped-images/work-projects/dassaultsystemes/dassaultsystemes-banner.jpg	banners/dassaultsystemes/dassaultsystemes-banner.jpg	dassaultsystemes	success	\N	2025-07-14 16:10:41.29354+00
0bdbea76-05cf-43c2-828d-926def61394f	scraped-images/work-projects/dassaultsystemes/dassaultsystemes-gallery-1.jpg	gallery/dassaultsystemes/dassaultsystemes-gallery-1.jpg	dassaultsystemes	success	\N	2025-07-14 16:10:41.616912+00
59fe5dac-ed52-4f3f-b8b3-5e358f7b775b	scraped-images/work-projects/dassaultsystemes/dassaultsystemes-gallery-2.jpg	gallery/dassaultsystemes/dassaultsystemes-gallery-2.jpg	dassaultsystemes	success	\N	2025-07-14 16:10:41.922775+00
2cc1b402-fc66-41b6-844f-968bb611d41e	scraped-images/work-projects/dassaultsystemes/dassaultsystemes-gallery-3.jpg	gallery/dassaultsystemes/dassaultsystemes-gallery-3.jpg	dassaultsystemes	success	\N	2025-07-14 16:10:42.272301+00
31b31e06-f2ec-4ef7-8571-1c4e3d2ad723	scraped-images/work-projects/dassaultsystemes/dassaultsystemes-gallery-4.jpg	gallery/dassaultsystemes/dassaultsystemes-gallery-4.jpg	dassaultsystemes	success	\N	2025-07-14 16:10:42.581498+00
6ca976ab-c6c9-4907-8d58-61c7928288f5	scraped-images/work-projects/emerson/emerson-banner.jpg	banners/emerson/emerson-banner.jpg	emerson	success	\N	2025-07-14 16:10:42.963835+00
e9e8d454-8ffe-48dd-9a8e-af339f319f0c	scraped-images/work-projects/emerson/emerson-gallery-1.jpg	gallery/emerson/emerson-gallery-1.jpg	emerson	success	\N	2025-07-14 16:10:43.320152+00
52a0b66a-1713-4374-a3ee-615713a51954	scraped-images/work-projects/emerson/emerson-gallery-2.jpg	gallery/emerson/emerson-gallery-2.jpg	emerson	success	\N	2025-07-14 16:10:43.756628+00
a78ec0ce-d7ef-4daa-aca6-7df6624834e4	scraped-images/work-projects/emerson/emerson-gallery-3.jpg	gallery/emerson/emerson-gallery-3.jpg	emerson	success	\N	2025-07-14 16:10:44.111248+00
76d8efef-ec48-460e-a463-0a6ef4a1633a	scraped-images/work-projects/emerson/emerson-gallery-4.jpg	gallery/emerson/emerson-gallery-4.jpg	emerson	success	\N	2025-07-14 16:10:44.44668+00
48de6de9-85ea-4b4b-9705-e8493fe5bfaa	scraped-images/work-projects/globalconsultinggiant/globalconsultinggiant-banner.jpg	banners/globalconsultinggiant/globalconsultinggiant-banner.jpg	globalconsultinggiant	success	\N	2025-07-14 16:10:44.78226+00
dd47afe1-ebdf-478d-86ea-885a18bdf84c	scraped-images/work-projects/globalconsultinggiant/globalconsultinggiant-gallery-1.jpg	gallery/globalconsultinggiant/globalconsultinggiant-gallery-1.jpg	globalconsultinggiant	success	\N	2025-07-14 16:10:45.094553+00
03f68560-398d-485e-984f-bc55208e5f12	scraped-images/work-projects/globalconsultinggiant/globalconsultinggiant-gallery-10.jpg	gallery/globalconsultinggiant/globalconsultinggiant-gallery-10.jpg	globalconsultinggiant	success	\N	2025-07-14 16:10:45.578452+00
e01f8ae6-ae7e-4e81-bfb8-70bc39a66c3f	scraped-images/work-projects/globalconsultinggiant/globalconsultinggiant-gallery-2.jpg	gallery/globalconsultinggiant/globalconsultinggiant-gallery-2.jpg	globalconsultinggiant	success	\N	2025-07-14 16:10:45.880029+00
b8f8c2fa-d1f6-42f5-8c6b-647d33d84316	scraped-images/work-projects/globalconsultinggiant/globalconsultinggiant-gallery-3.jpg	gallery/globalconsultinggiant/globalconsultinggiant-gallery-3.jpg	globalconsultinggiant	success	\N	2025-07-14 16:10:46.187413+00
9c38cd23-5966-4934-8441-4e4aedc112cd	scraped-images/work-projects/globalconsultinggiant/globalconsultinggiant-gallery-4.jpg	gallery/globalconsultinggiant/globalconsultinggiant-gallery-4.jpg	globalconsultinggiant	success	\N	2025-07-14 16:10:46.495663+00
4f5243b3-90aa-4431-8ebc-840664e1956e	scraped-images/work-projects/globalconsultinggiant/globalconsultinggiant-gallery-5.jpg	gallery/globalconsultinggiant/globalconsultinggiant-gallery-5.jpg	globalconsultinggiant	success	\N	2025-07-14 16:10:46.801433+00
e95aba6e-3ab8-496d-9d86-7508a8e242a8	scraped-images/work-projects/globalconsultinggiant/globalconsultinggiant-gallery-6.jpg	gallery/globalconsultinggiant/globalconsultinggiant-gallery-6.jpg	globalconsultinggiant	success	\N	2025-07-14 16:10:47.10026+00
9225acce-97ed-4eac-bcd5-00ff559c0525	scraped-images/work-projects/globalconsultinggiant/globalconsultinggiant-gallery-7.jpg	gallery/globalconsultinggiant/globalconsultinggiant-gallery-7.jpg	globalconsultinggiant	success	\N	2025-07-14 16:10:47.379258+00
6a22e221-298a-4f2f-b339-5ac615e90f5c	scraped-images/work-projects/globalconsultinggiant/globalconsultinggiant-gallery-8.jpg	gallery/globalconsultinggiant/globalconsultinggiant-gallery-8.jpg	globalconsultinggiant	success	\N	2025-07-14 16:10:47.687939+00
bcdbbfa9-832e-40be-8390-46ad46a27a31	scraped-images/work-projects/globalconsultinggiant/globalconsultinggiant-gallery-9.jpg	gallery/globalconsultinggiant/globalconsultinggiant-gallery-9.jpg	globalconsultinggiant	success	\N	2025-07-14 16:10:48.001312+00
308a0a2b-686d-4b20-a7c1-f3059298d1a8	scraped-images/work-projects/goodpack/goodpack-banner.jpg	banners/goodpack/goodpack-banner.jpg	goodpack	success	\N	2025-07-14 16:10:48.397555+00
71d517b2-df03-417c-9925-b70bbabc7200	scraped-images/work-projects/goodpack/goodpack-gallery-1.jpg	gallery/goodpack/goodpack-gallery-1.jpg	goodpack	success	\N	2025-07-14 16:10:48.722984+00
7357b036-c06a-495f-8492-f11945356b4e	scraped-images/work-projects/goodpack/goodpack-gallery-2.jpg	gallery/goodpack/goodpack-gallery-2.jpg	goodpack	success	\N	2025-07-14 16:10:49.020235+00
30da43d6-9060-4110-8921-deaf091663a0	scraped-images/work-projects/goodpack/goodpack-gallery-3.jpg	gallery/goodpack/goodpack-gallery-3.jpg	goodpack	success	\N	2025-07-14 16:10:49.34461+00
be179307-d080-4d78-9057-a3353f0b0b70	scraped-images/work-projects/goodpack/goodpack-gallery-4.jpg	gallery/goodpack/goodpack-gallery-4.jpg	goodpack	success	\N	2025-07-14 16:10:49.684306+00
455711b6-6d7e-4f11-a085-1115ed73b96b	scraped-images/work-projects/goodpack/goodpack-gallery-5.jpg	gallery/goodpack/goodpack-gallery-5.jpg	goodpack	success	\N	2025-07-14 16:10:50.024808+00
e5b1c3a5-a8e5-4e49-97fa-a865ba35da1b	scraped-images/work-projects/goodpack/goodpack-gallery-6.jpg	gallery/goodpack/goodpack-gallery-6.jpg	goodpack	success	\N	2025-07-14 16:10:50.391883+00
c05edb62-ee9a-4ddd-9826-aac7eb865ba1	scraped-images/work-projects/goodpack/goodpack-gallery-7.jpg	gallery/goodpack/goodpack-gallery-7.jpg	goodpack	success	\N	2025-07-14 16:10:50.736294+00
3710f877-ec46-45f8-b4d7-a5d4cf244783	scraped-images/work-projects/hansimgluck/hansimgluck-banner.jpg	banners/hansimgluck/hansimgluck-banner.jpg	hansimgluck	success	\N	2025-07-14 16:10:51.111844+00
79cc0f95-10a6-479c-acef-49c7338d76e3	scraped-images/work-projects/hansimgluck/hansimgluck-gallery-1.jpg	gallery/hansimgluck/hansimgluck-gallery-1.jpg	hansimgluck	success	\N	2025-07-14 16:10:51.435968+00
55791da7-ddec-4e38-a641-89114f6c1a09	scraped-images/work-projects/hansimgluck/hansimgluck-gallery-2.jpg	gallery/hansimgluck/hansimgluck-gallery-2.jpg	hansimgluck	success	\N	2025-07-14 16:10:51.8431+00
0f348868-cef6-4f4e-ac41-09f0b4df577a	scraped-images/work-projects/hansimgluck/hansimgluck-gallery-3.jpg	gallery/hansimgluck/hansimgluck-gallery-3.jpg	hansimgluck	success	\N	2025-07-14 16:10:52.18757+00
45595740-64a8-4f10-93c6-00b931ddc6f7	scraped-images/work-projects/hansimgluck/hansimgluck-gallery-4.jpg	gallery/hansimgluck/hansimgluck-gallery-4.jpg	hansimgluck	success	\N	2025-07-14 16:10:52.530522+00
453b34e0-05da-4667-9d81-78d07a3f155c	scraped-images/work-projects/heineken/heineken-banner.jpg	banners/heineken/heineken-banner.jpg	heineken	success	\N	2025-07-14 16:10:52.951625+00
7b303879-cb73-4b1c-8a01-07d46a6557bb	scraped-images/work-projects/heineken/heineken-gallery-1.jpg	gallery/heineken/heineken-gallery-1.jpg	heineken	success	\N	2025-07-14 16:10:53.386167+00
85d357d1-8e79-4c9f-92d2-8c5dda84c6df	scraped-images/work-projects/heineken/heineken-gallery-2.jpg	gallery/heineken/heineken-gallery-2.jpg	heineken	success	\N	2025-07-14 16:10:53.818069+00
4b79dfbc-dd95-4086-88db-a231b99e02e5	scraped-images/work-projects/heineken/heineken-gallery-3.jpg	gallery/heineken/heineken-gallery-3.jpg	heineken	success	\N	2025-07-14 16:10:54.22192+00
d4ef733c-1d4c-4ca1-a337-ad36c79c19f0	scraped-images/work-projects/heineken/heineken-gallery-4.jpg	gallery/heineken/heineken-gallery-4.jpg	heineken	success	\N	2025-07-14 16:10:54.51884+00
eb641a4e-9b4c-42bc-8e08-f97a59d982d4	scraped-images/work-projects/heineken/heineken-gallery-5.jpg	gallery/heineken/heineken-gallery-5.jpg	heineken	success	\N	2025-07-14 16:10:54.86665+00
ef9db3be-3376-4ce8-8e6b-5d710e2a4a79	scraped-images/work-projects/homeaway/homeaway-banner.jpg	banners/homeaway/homeaway-banner.jpg	homeaway	success	\N	2025-07-14 16:10:55.254211+00
7bc7e32f-ddca-4096-8434-d6d7928e644e	scraped-images/work-projects/homeaway/homeaway-gallery-1.jpg	gallery/homeaway/homeaway-gallery-1.jpg	homeaway	success	\N	2025-07-14 16:10:55.591365+00
43ddac53-2583-42af-b6b2-d006f7dfb264	scraped-images/work-projects/homeaway/homeaway-gallery-10.jpg	gallery/homeaway/homeaway-gallery-10.jpg	homeaway	success	\N	2025-07-14 16:10:56.02394+00
c13ccf70-f799-4539-b7b8-69de3a703815	scraped-images/work-projects/homeaway/homeaway-gallery-2.jpg	gallery/homeaway/homeaway-gallery-2.jpg	homeaway	success	\N	2025-07-14 16:10:56.412475+00
0f753bdd-141d-4c70-9dcb-126d32b69f23	scraped-images/work-projects/homeaway/homeaway-gallery-3.jpg	gallery/homeaway/homeaway-gallery-3.jpg	homeaway	success	\N	2025-07-14 16:10:56.766209+00
b48890c4-f5eb-40c8-8f66-6d5186319829	scraped-images/work-projects/homeaway/homeaway-gallery-4.jpg	gallery/homeaway/homeaway-gallery-4.jpg	homeaway	success	\N	2025-07-14 16:10:57.059049+00
3058f3e7-1fc7-4386-bc96-20b20cb0798d	scraped-images/work-projects/homeaway/homeaway-gallery-5.jpg	gallery/homeaway/homeaway-gallery-5.jpg	homeaway	success	\N	2025-07-14 16:10:57.399249+00
254093a3-d27f-4a50-a0e0-4cb2d831ce81	scraped-images/work-projects/homeaway/homeaway-gallery-6.jpg	gallery/homeaway/homeaway-gallery-6.jpg	homeaway	success	\N	2025-07-14 16:10:57.680814+00
2d6f2ce2-f611-49f2-87ad-d053b77c5786	scraped-images/work-projects/homeaway/homeaway-gallery-7.jpg	gallery/homeaway/homeaway-gallery-7.jpg	homeaway	success	\N	2025-07-14 16:10:58.01169+00
ba0c8fe6-e112-417a-b726-72e447f00734	scraped-images/work-projects/homeaway/homeaway-gallery-8.jpg	gallery/homeaway/homeaway-gallery-8.jpg	homeaway	success	\N	2025-07-14 16:10:58.349455+00
9c5c1743-f015-4e4a-940c-597e0943db27	scraped-images/work-projects/homeaway/homeaway-gallery-9.jpg	gallery/homeaway/homeaway-gallery-9.jpg	homeaway	success	\N	2025-07-14 16:10:58.661276+00
06641bd1-56c6-455c-871a-329404e25e95	scraped-images/work-projects/hongkongmanagement/hongkongmanagement-banner.jpg	banners/hongkongmanagement/hongkongmanagement-banner.jpg	hongkongmanagement	success	\N	2025-07-14 16:10:59.151857+00
aecd4269-0565-4fec-9c61-09c97b53bace	scraped-images/work-projects/hongkongmanagement/hongkongmanagement-gallery-1.jpg	gallery/hongkongmanagement/hongkongmanagement-gallery-1.jpg	hongkongmanagement	success	\N	2025-07-14 16:10:59.501625+00
8a6b45e6-a161-4653-8e40-03cebfc7559c	scraped-images/work-projects/hongkongmanagement/hongkongmanagement-gallery-10.jpg	gallery/hongkongmanagement/hongkongmanagement-gallery-10.jpg	hongkongmanagement	success	\N	2025-07-14 16:10:59.853857+00
97b808ed-2cfe-4d1c-9b03-a65c3f0590c7	scraped-images/work-projects/hongkongmanagement/hongkongmanagement-gallery-2.jpg	gallery/hongkongmanagement/hongkongmanagement-gallery-2.jpg	hongkongmanagement	success	\N	2025-07-14 16:11:00.268656+00
00505307-ff30-470e-844e-8de15ed1a822	scraped-images/work-projects/hongkongmanagement/hongkongmanagement-gallery-3.jpg	gallery/hongkongmanagement/hongkongmanagement-gallery-3.jpg	hongkongmanagement	success	\N	2025-07-14 16:11:00.602678+00
ce1bff87-552e-422a-9bf8-603f31251509	scraped-images/work-projects/hongkongmanagement/hongkongmanagement-gallery-4.jpg	gallery/hongkongmanagement/hongkongmanagement-gallery-4.jpg	hongkongmanagement	success	\N	2025-07-14 16:11:00.916204+00
9a56f7ab-73fd-4f2f-b6c1-0f23a076d717	scraped-images/work-projects/hongkongmanagement/hongkongmanagement-gallery-5.jpg	gallery/hongkongmanagement/hongkongmanagement-gallery-5.jpg	hongkongmanagement	success	\N	2025-07-14 16:11:01.35671+00
9c24928e-88d9-4718-9a24-415a3de05c12	scraped-images/work-projects/hongkongmanagement/hongkongmanagement-gallery-6.jpg	gallery/hongkongmanagement/hongkongmanagement-gallery-6.jpg	hongkongmanagement	success	\N	2025-07-14 16:11:01.714877+00
b424c714-2d94-4568-8199-b2c63bf36124	scraped-images/work-projects/hongkongmanagement/hongkongmanagement-gallery-7.jpg	gallery/hongkongmanagement/hongkongmanagement-gallery-7.jpg	hongkongmanagement	success	\N	2025-07-14 16:11:02.134685+00
9084f247-1c95-45b0-9e12-e4b11a2056bb	scraped-images/work-projects/hongkongmanagement/hongkongmanagement-gallery-8.jpg	gallery/hongkongmanagement/hongkongmanagement-gallery-8.jpg	hongkongmanagement	success	\N	2025-07-14 16:11:02.626401+00
64cd641f-6994-4eac-bf46-be9ff9622774	scraped-images/work-projects/hongkongmanagement/hongkongmanagement-gallery-9.jpg	gallery/hongkongmanagement/hongkongmanagement-gallery-9.jpg	hongkongmanagement	success	\N	2025-07-14 16:11:02.994245+00
955a52e2-e19c-4ab4-a90f-cebcd5f3431d	scraped-images/work-projects/ihh/ihh-banner.jpg	banners/ihh/ihh-banner.jpg	ihh	success	\N	2025-07-14 16:11:03.304133+00
c4317df9-b26a-4722-881f-e18aeab6f4dd	scraped-images/work-projects/ihh/ihh-gallery-1.jpg	gallery/ihh/ihh-gallery-1.jpg	ihh	success	\N	2025-07-14 16:11:03.60396+00
5b807373-c85c-43b5-85cc-53254e175dc9	scraped-images/work-projects/ihh/ihh-gallery-10.jpg	gallery/ihh/ihh-gallery-10.jpg	ihh	success	\N	2025-07-14 16:11:03.897771+00
abc28a64-0042-4ecd-b2f6-6a1531cd6557	scraped-images/work-projects/ihh/ihh-gallery-2.jpg	gallery/ihh/ihh-gallery-2.jpg	ihh	success	\N	2025-07-14 16:11:04.207212+00
20e4dbf6-1533-4fba-bf8b-98039e6cf9e3	scraped-images/work-projects/ihh/ihh-gallery-3.jpg	gallery/ihh/ihh-gallery-3.jpg	ihh	success	\N	2025-07-14 16:11:04.586556+00
f37ce3ad-8c44-4f70-9c4b-eda366d7ac2c	scraped-images/work-projects/ihh/ihh-gallery-4.jpg	gallery/ihh/ihh-gallery-4.jpg	ihh	success	\N	2025-07-14 16:11:04.884317+00
58ce929a-558b-47c4-898f-f3343f7434b1	scraped-images/work-projects/ihh/ihh-gallery-5.jpg	gallery/ihh/ihh-gallery-5.jpg	ihh	success	\N	2025-07-14 16:11:05.234904+00
8a1b207e-46bc-46ae-a023-13f68d3c0d4f	scraped-images/work-projects/ihh/ihh-gallery-6.jpg	gallery/ihh/ihh-gallery-6.jpg	ihh	success	\N	2025-07-14 16:11:05.546638+00
b71c5632-d40b-48ca-90ac-6863f8085199	scraped-images/work-projects/ihh/ihh-gallery-7.jpg	gallery/ihh/ihh-gallery-7.jpg	ihh	success	\N	2025-07-14 16:11:05.868027+00
4610ece4-67d5-49f2-9ec2-83b26df706ca	scraped-images/work-projects/ihh/ihh-gallery-8.jpg	gallery/ihh/ihh-gallery-8.jpg	ihh	success	\N	2025-07-14 16:11:06.198244+00
b346ed38-c4b2-442a-810b-08f95b938061	scraped-images/work-projects/ihh/ihh-gallery-9.jpg	gallery/ihh/ihh-gallery-9.jpg	ihh	success	\N	2025-07-14 16:11:06.482023+00
5a60b2cb-dd48-4b4b-bc8b-426192a53986	scraped-images/work-projects/internationallawfirm/internationallawfirm-banner.jpg	banners/internationallawfirm/internationallawfirm-banner.jpg	internationallawfirm	success	\N	2025-07-14 16:11:06.797964+00
670d81b3-94f5-4e59-8ea6-5fe5ae3b0a6e	scraped-images/work-projects/internationallawfirm/internationallawfirm-gallery-1.jpg	gallery/internationallawfirm/internationallawfirm-gallery-1.jpg	internationallawfirm	success	\N	2025-07-14 16:11:07.093177+00
e988d04c-2a20-40ed-8302-df8a2db46b73	scraped-images/work-projects/internationallawfirm/internationallawfirm-gallery-2.jpg	gallery/internationallawfirm/internationallawfirm-gallery-2.jpg	internationallawfirm	success	\N	2025-07-14 16:11:07.428095+00
5312077b-52c0-4423-a0b3-6694630f4cfc	scraped-images/work-projects/internationallawfirm/internationallawfirm-gallery-3.jpg	gallery/internationallawfirm/internationallawfirm-gallery-3.jpg	internationallawfirm	success	\N	2025-07-14 16:11:07.768032+00
849974e4-1a04-4d5b-a1df-7ecb1c6bed60	scraped-images/work-projects/internationallawfirm/internationallawfirm-gallery-4.jpg	gallery/internationallawfirm/internationallawfirm-gallery-4.jpg	internationallawfirm	success	\N	2025-07-14 16:11:08.172341+00
3694cc39-8779-4f4c-b203-d977cbbd7b94	scraped-images/work-projects/internationallawfirm/internationallawfirm-gallery-5.jpg	gallery/internationallawfirm/internationallawfirm-gallery-5.jpg	internationallawfirm	success	\N	2025-07-14 16:11:08.522446+00
a4318291-9590-450d-9198-602d6b2790c6	scraped-images/work-projects/internationallawfirm/internationallawfirm-gallery-6.jpg	gallery/internationallawfirm/internationallawfirm-gallery-6.jpg	internationallawfirm	success	\N	2025-07-14 16:11:08.830038+00
ffe13602-cea5-4f1f-befc-6a133ee241fa	scraped-images/work-projects/internationallawfirm/internationallawfirm-gallery-7.jpg	gallery/internationallawfirm/internationallawfirm-gallery-7.jpg	internationallawfirm	success	\N	2025-07-14 16:11:09.194525+00
ac80438c-aadc-4b01-97b8-406fdf4a3d87	scraped-images/work-projects/internationallawfirm/internationallawfirm-gallery-8.jpg	gallery/internationallawfirm/internationallawfirm-gallery-8.jpg	internationallawfirm	success	\N	2025-07-14 16:11:09.532342+00
cd8cdffa-54ff-441e-90fc-02d71c85b4cb	scraped-images/work-projects/internationallawfirm/internationallawfirm-gallery-9.jpg	gallery/internationallawfirm/internationallawfirm-gallery-9.jpg	internationallawfirm	success	\N	2025-07-14 16:11:09.848627+00
752606d9-873a-4a16-9f25-407d4d4adb29	scraped-images/work-projects/iqvia/iqvia-banner.jpg	banners/iqvia/iqvia-banner.jpg	iqvia	success	\N	2025-07-14 16:11:10.207395+00
0106721d-4e57-437b-b9a5-784f83f40298	scraped-images/work-projects/iqvia/iqvia-gallery-1.jpg	gallery/iqvia/iqvia-gallery-1.jpg	iqvia	success	\N	2025-07-14 16:11:10.551128+00
150510ce-c47b-4741-a12d-bdfbb3a4265a	scraped-images/work-projects/iqvia/iqvia-gallery-10.jpg	gallery/iqvia/iqvia-gallery-10.jpg	iqvia	success	\N	2025-07-14 16:11:10.948994+00
ebf83c99-5889-474a-a3f1-cad03b1590fc	scraped-images/work-projects/iqvia/iqvia-gallery-2.jpg	gallery/iqvia/iqvia-gallery-2.jpg	iqvia	success	\N	2025-07-14 16:11:11.254345+00
5161be1c-2db1-47dd-b69b-57b25961788c	scraped-images/work-projects/iqvia/iqvia-gallery-3.jpg	gallery/iqvia/iqvia-gallery-3.jpg	iqvia	success	\N	2025-07-14 16:11:11.569484+00
28b5985a-b4a0-4066-bb02-d8292fbca64e	scraped-images/work-projects/iqvia/iqvia-gallery-4.jpg	gallery/iqvia/iqvia-gallery-4.jpg	iqvia	success	\N	2025-07-14 16:11:11.870969+00
8152c8a6-c8e3-46d2-a0ba-334dcb69d2dc	scraped-images/work-projects/iqvia/iqvia-gallery-5.jpg	gallery/iqvia/iqvia-gallery-5.jpg	iqvia	success	\N	2025-07-14 16:11:12.211632+00
999ae86d-73d5-48bd-8773-a9df617d2f65	scraped-images/work-projects/iqvia/iqvia-gallery-6.jpg	gallery/iqvia/iqvia-gallery-6.jpg	iqvia	success	\N	2025-07-14 16:11:12.570834+00
cef9cfb1-4f28-462a-936f-1ac3f93fff38	scraped-images/work-projects/iqvia/iqvia-gallery-7.jpg	gallery/iqvia/iqvia-gallery-7.jpg	iqvia	success	\N	2025-07-14 16:11:12.917934+00
f856634e-c90e-46c7-8f2d-634b469597e0	scraped-images/work-projects/iqvia/iqvia-gallery-8.jpg	gallery/iqvia/iqvia-gallery-8.jpg	iqvia	success	\N	2025-07-14 16:11:13.244625+00
b660a383-9213-40de-94a7-f3f14a84bd2b	scraped-images/work-projects/iqvia/iqvia-gallery-9.jpg	gallery/iqvia/iqvia-gallery-9.jpg	iqvia	success	\N	2025-07-14 16:11:13.557765+00
dee92d40-166b-4b48-b108-a8bc5d4c7eda	scraped-images/work-projects/lifesciencemanufacturer/lifesciencemanufacturer-banner.jpg	banners/lifesciencemanufacturer/lifesciencemanufacturer-banner.jpg	lifesciencemanufacturer	success	\N	2025-07-14 16:11:13.909446+00
7563b9b6-190e-40c5-9b30-7d5a27080590	scraped-images/work-projects/lifesciencemanufacturer/lifesciencemanufacturer-gallery-1.jpg	gallery/lifesciencemanufacturer/lifesciencemanufacturer-gallery-1.jpg	lifesciencemanufacturer	success	\N	2025-07-14 16:11:14.303613+00
8f1062f9-9152-472d-a11b-f891e7b66104	scraped-images/work-projects/lifesciencemanufacturer/lifesciencemanufacturer-gallery-2.jpg	gallery/lifesciencemanufacturer/lifesciencemanufacturer-gallery-2.jpg	lifesciencemanufacturer	success	\N	2025-07-14 16:11:14.624322+00
06106667-cd76-4339-b064-75f7509a1b4d	scraped-images/work-projects/lifesciencemanufacturer/lifesciencemanufacturer-gallery-3.jpg	gallery/lifesciencemanufacturer/lifesciencemanufacturer-gallery-3.jpg	lifesciencemanufacturer	success	\N	2025-07-14 16:11:14.984854+00
4b0e2795-e0a7-4288-a56b-18c05e76e5ea	scraped-images/work-projects/lifesciencemanufacturer/lifesciencemanufacturer-gallery-4.jpg	gallery/lifesciencemanufacturer/lifesciencemanufacturer-gallery-4.jpg	lifesciencemanufacturer	success	\N	2025-07-14 16:11:15.302427+00
4ae9f0aa-1442-4b55-b9eb-b8cdd6ca9c19	scraped-images/work-projects/lifesciencemanufacturer/lifesciencemanufacturer-gallery-5.jpg	gallery/lifesciencemanufacturer/lifesciencemanufacturer-gallery-5.jpg	lifesciencemanufacturer	success	\N	2025-07-14 16:11:15.668374+00
cf44346b-e9a0-4fab-bdab-02199675ccd0	scraped-images/work-projects/lifesciencemanufacturer/lifesciencemanufacturer-gallery-6.jpg	gallery/lifesciencemanufacturer/lifesciencemanufacturer-gallery-6.jpg	lifesciencemanufacturer	success	\N	2025-07-14 16:11:16.033771+00
703dea64-b117-4770-80b7-773ef8713c3f	scraped-images/work-projects/lufax/lufax-banner.jpg	banners/lufax/lufax-banner.jpg	lufax	success	\N	2025-07-14 16:11:16.514379+00
ad5a86f2-6042-4e3f-85c8-a917c9d52514	scraped-images/work-projects/lufax/lufax-gallery-1.jpg	gallery/lufax/lufax-gallery-1.jpg	lufax	success	\N	2025-07-14 16:11:16.840461+00
622057f2-541c-477f-8a24-28f32b50f1a7	scraped-images/work-projects/lufax/lufax-gallery-2.jpg	gallery/lufax/lufax-gallery-2.jpg	lufax	success	\N	2025-07-14 16:11:17.15528+00
3c4c72a0-5db2-40b8-bbfe-0ff1b07e0256	scraped-images/work-projects/lufax/lufax-gallery-3.jpg	gallery/lufax/lufax-gallery-3.jpg	lufax	success	\N	2025-07-14 16:11:17.485816+00
8e87fcfc-ba04-488a-a465-5a8e75a49f65	scraped-images/work-projects/lufax/lufax-gallery-4.jpg	gallery/lufax/lufax-gallery-4.jpg	lufax	success	\N	2025-07-14 16:11:17.824877+00
e5fce020-e103-4bf1-89f8-7b61b5786145	scraped-images/work-projects/lufax/lufax-gallery-5.jpg	gallery/lufax/lufax-gallery-5.jpg	lufax	success	\N	2025-07-14 16:11:18.200344+00
c500f1a0-5e52-46ae-9b51-e858eb0a9bf8	scraped-images/work-projects/managementconsultingfirm/managementconsultingfirm-banner.jpg	banners/managementconsultingfirm/managementconsultingfirm-banner.jpg	managementconsultingfirm	success	\N	2025-07-14 16:11:18.638641+00
bfe347cd-3298-48d6-afe2-15bb7bb2587e	scraped-images/work-projects/managementconsultingfirm/managementconsultingfirm-gallery-1.jpg	gallery/managementconsultingfirm/managementconsultingfirm-gallery-1.jpg	managementconsultingfirm	success	\N	2025-07-14 16:11:19.027406+00
a65546f8-8f2b-4f5d-be13-562504b298ed	scraped-images/work-projects/managementconsultingfirm/managementconsultingfirm-gallery-10.jpg	gallery/managementconsultingfirm/managementconsultingfirm-gallery-10.jpg	managementconsultingfirm	success	\N	2025-07-14 16:11:19.349182+00
8450cdac-d7f0-45e4-9ba3-9ed101bc5062	scraped-images/work-projects/managementconsultingfirm/managementconsultingfirm-gallery-2.jpg	gallery/managementconsultingfirm/managementconsultingfirm-gallery-2.jpg	managementconsultingfirm	success	\N	2025-07-14 16:11:19.730559+00
d4cb7354-77e7-45bf-bc2f-803a9d36ee28	scraped-images/work-projects/managementconsultingfirm/managementconsultingfirm-gallery-3.jpg	gallery/managementconsultingfirm/managementconsultingfirm-gallery-3.jpg	managementconsultingfirm	success	\N	2025-07-14 16:11:20.069159+00
19a37602-5736-4753-86a1-40fc7d1d4eea	scraped-images/work-projects/managementconsultingfirm/managementconsultingfirm-gallery-4.jpg	gallery/managementconsultingfirm/managementconsultingfirm-gallery-4.jpg	managementconsultingfirm	success	\N	2025-07-14 16:11:20.398729+00
4f10d013-df57-497a-9970-a1eda2bb62f7	scraped-images/work-projects/managementconsultingfirm/managementconsultingfirm-gallery-5.jpg	gallery/managementconsultingfirm/managementconsultingfirm-gallery-5.jpg	managementconsultingfirm	success	\N	2025-07-14 16:11:20.758187+00
35bede57-b430-4a3b-9eb6-f2e21e51a832	scraped-images/work-projects/managementconsultingfirm/managementconsultingfirm-gallery-6.jpg	gallery/managementconsultingfirm/managementconsultingfirm-gallery-6.jpg	managementconsultingfirm	success	\N	2025-07-14 16:11:21.052619+00
a429550d-d958-42d5-b8c7-7f011d8a8b22	scraped-images/work-projects/managementconsultingfirm/managementconsultingfirm-gallery-7.jpg	gallery/managementconsultingfirm/managementconsultingfirm-gallery-7.jpg	managementconsultingfirm	success	\N	2025-07-14 16:11:21.370369+00
7b9fbec1-0468-4274-9779-2d38e0602d49	scraped-images/work-projects/managementconsultingfirm/managementconsultingfirm-gallery-8.jpg	gallery/managementconsultingfirm/managementconsultingfirm-gallery-8.jpg	managementconsultingfirm	success	\N	2025-07-14 16:11:21.70514+00
7d09dab3-1a91-422b-ade6-85e1a9448e0a	scraped-images/work-projects/managementconsultingfirm/managementconsultingfirm-gallery-9.jpg	gallery/managementconsultingfirm/managementconsultingfirm-gallery-9.jpg	managementconsultingfirm	success	\N	2025-07-14 16:11:22.021212+00
6c959d8f-fbf2-4ee8-ba90-ad08311f47c5	scraped-images/work-projects/managementconsultingsg/managementconsultingsg-banner.jpg	banners/managementconsultingsg/managementconsultingsg-banner.jpg	managementconsultingsg	success	\N	2025-07-14 16:11:22.496345+00
fa39579a-46bd-48c6-b157-96fb1870c971	scraped-images/work-projects/managementconsultingsg/mcsg-banner.jpg	banners/managementconsultingsg/mcsg-banner.jpg	managementconsultingsg	success	\N	2025-07-14 16:11:22.855813+00
904b76e9-dc17-43d0-84e6-56752c47b513	scraped-images/work-projects/managementconsultingsg/mcsg-gallery-1.jpg	gallery/managementconsultingsg/mcsg-gallery-1.jpg	managementconsultingsg	success	\N	2025-07-14 16:11:23.198024+00
c88415a6-ea93-4221-80d6-fa2abc8e52fb	scraped-images/work-projects/managementconsultingsg/mcsg-gallery-10.jpg	gallery/managementconsultingsg/mcsg-gallery-10.jpg	managementconsultingsg	success	\N	2025-07-14 16:11:23.535987+00
43aaa25f-59fa-4f80-8101-f452c1d8be12	scraped-images/work-projects/managementconsultingsg/mcsg-gallery-2.jpg	gallery/managementconsultingsg/mcsg-gallery-2.jpg	managementconsultingsg	success	\N	2025-07-14 16:11:23.869075+00
40115aaa-d6ba-49ea-82f2-652f1facdc31	scraped-images/work-projects/managementconsultingsg/mcsg-gallery-3.jpg	gallery/managementconsultingsg/mcsg-gallery-3.jpg	managementconsultingsg	success	\N	2025-07-14 16:11:24.291726+00
6360aafc-2f81-471f-8af4-f1a5d0ce7597	scraped-images/work-projects/managementconsultingsg/mcsg-gallery-4.jpg	gallery/managementconsultingsg/mcsg-gallery-4.jpg	managementconsultingsg	success	\N	2025-07-14 16:11:24.664588+00
ae192ef9-682d-456a-b457-94860c9924cc	scraped-images/work-projects/managementconsultingsg/mcsg-gallery-5.jpg	gallery/managementconsultingsg/mcsg-gallery-5.jpg	managementconsultingsg	success	\N	2025-07-14 16:11:25.037457+00
3000cfb1-43d0-4dee-b55a-fb4ef84a80f8	scraped-images/work-projects/managementconsultingsg/mcsg-gallery-6.jpg	gallery/managementconsultingsg/mcsg-gallery-6.jpg	managementconsultingsg	success	\N	2025-07-14 16:11:25.406753+00
b83b8053-c345-4978-bd01-c9aa2a679822	scraped-images/work-projects/managementconsultingsg/mcsg-gallery-7.jpg	gallery/managementconsultingsg/mcsg-gallery-7.jpg	managementconsultingsg	success	\N	2025-07-14 16:11:25.841128+00
7f6ec53b-19d5-41fc-bfbe-97e2e24fd907	scraped-images/work-projects/managementconsultingsg/mcsg-gallery-8.jpg	gallery/managementconsultingsg/mcsg-gallery-8.jpg	managementconsultingsg	success	\N	2025-07-14 16:11:26.164975+00
dbea37bd-14e2-4f74-8e3d-b91fe7aa26cc	scraped-images/work-projects/managementconsultingsg/mcsg-gallery-9.jpg	gallery/managementconsultingsg/mcsg-gallery-9.jpg	managementconsultingsg	success	\N	2025-07-14 16:11:26.520647+00
63031a7e-fb97-4586-8069-ffe421bfe41f	scraped-images/work-projects/myp/myp-banner.jpg	banners/myp/myp-banner.jpg	myp	success	\N	2025-07-14 16:11:26.927424+00
a13ad96c-abfb-4ec7-b6e6-acb009c59fba	scraped-images/work-projects/myp/myp-gallery-1.jpg	gallery/myp/myp-gallery-1.jpg	myp	success	\N	2025-07-14 16:11:27.278566+00
e34bd83f-247b-4044-97ee-7b6662a0740f	scraped-images/work-projects/myp/myp-gallery-2.jpg	gallery/myp/myp-gallery-2.jpg	myp	success	\N	2025-07-14 16:11:27.623649+00
84265c7a-fda0-4694-b1c1-982858d13879	scraped-images/work-projects/myp/myp-gallery-3.jpg	gallery/myp/myp-gallery-3.jpg	myp	success	\N	2025-07-14 16:11:27.984689+00
832cfe8e-bdbb-499b-b2d8-27b6774aed38	scraped-images/work-projects/myp/myp-gallery-4.jpg	gallery/myp/myp-gallery-4.jpg	myp	success	\N	2025-07-14 16:11:28.414164+00
7c543a3b-4890-4c16-bbe5-f0de27e90d6a	scraped-images/work-projects/myp/myp-gallery-5.jpg	gallery/myp/myp-gallery-5.jpg	myp	success	\N	2025-07-14 16:11:28.932585+00
26fa8ff3-20ff-4942-a8f4-ba9e55af47bd	scraped-images/work-projects/philipmorrissingapore/philipmorrissingapore-banner.jpg	banners/philipmorrissingapore/philipmorrissingapore-banner.jpg	philipmorrissingapore	success	\N	2025-07-14 16:11:29.273795+00
d52c2abd-18f7-4cba-8d4f-0c9b1510c9f0	scraped-images/work-projects/philipmorrissingapore/philipmorrissingapore-gallery-1.jpg	gallery/philipmorrissingapore/philipmorrissingapore-gallery-1.jpg	philipmorrissingapore	success	\N	2025-07-14 16:11:29.660676+00
3ad5fc37-5a67-4fbc-8348-7de248f0b876	scraped-images/work-projects/philipmorrissingapore/philipmorrissingapore-gallery-2.jpg	gallery/philipmorrissingapore/philipmorrissingapore-gallery-2.jpg	philipmorrissingapore	success	\N	2025-07-14 16:11:29.985741+00
51718640-de47-4958-bdad-995db67eb818	scraped-images/work-projects/philipmorrissingapore/philipmorrissingapore-gallery-3.jpg	gallery/philipmorrissingapore/philipmorrissingapore-gallery-3.jpg	philipmorrissingapore	success	\N	2025-07-14 16:11:30.353163+00
2f107acc-a507-4078-972c-f915e56d8dc2	scraped-images/work-projects/philipmorrissingapore/philipmorrissingapore-gallery-4.jpg	gallery/philipmorrissingapore/philipmorrissingapore-gallery-4.jpg	philipmorrissingapore	success	\N	2025-07-14 16:11:30.734176+00
55875a35-b4c2-4ac2-86ac-f1a6c76f1ae2	scraped-images/work-projects/philipmorrissingapore/philipmorrissingapore-gallery-5.jpg	gallery/philipmorrissingapore/philipmorrissingapore-gallery-5.jpg	philipmorrissingapore	success	\N	2025-07-14 16:11:31.039895+00
9e09cb08-20eb-4b5d-a86d-a0721e94f95b	scraped-images/work-projects/philipmorrissingapore/philipmorrissingapore-gallery-6.jpg	gallery/philipmorrissingapore/philipmorrissingapore-gallery-6.jpg	philipmorrissingapore	success	\N	2025-07-14 16:11:31.385144+00
3d44a3df-d3b0-4519-a8be-75e39c5b8b8b	scraped-images/work-projects/philipmorrissingapore/philipmorrissingapore-gallery-7.jpg	gallery/philipmorrissingapore/philipmorrissingapore-gallery-7.jpg	philipmorrissingapore	success	\N	2025-07-14 16:11:31.718911+00
80926e4b-1c34-46ad-b1a4-b85e3decb8a5	scraped-images/work-projects/philipmorrissingapore/philipmorrissingapore-gallery-8.jpg	gallery/philipmorrissingapore/philipmorrissingapore-gallery-8.jpg	philipmorrissingapore	success	\N	2025-07-14 16:11:32.153559+00
1f83410a-f1eb-4cb9-8fd0-a7b06d136964	scraped-images/work-projects/philipmorrissingapore/philipmorrissingapore-gallery-9.jpg	gallery/philipmorrissingapore/philipmorrissingapore-gallery-9.jpg	philipmorrissingapore	success	\N	2025-07-14 16:11:32.517182+00
c1dd3a1f-0904-416c-a976-416d5a4ef152	scraped-images/work-projects/resources/resources-banner.jpg	banners/resources/resources-banner.jpg	resources	success	\N	2025-07-14 16:11:32.932492+00
48f4cf8b-2159-4b82-b380-038d00599cb2	scraped-images/work-projects/resources/resources-gallery-1.jpg	gallery/resources/resources-gallery-1.jpg	resources	success	\N	2025-07-14 16:11:33.302757+00
610e4d3b-aeaf-4801-a7ea-212608a20f71	scraped-images/work-projects/resources/resources-gallery-2.jpg	gallery/resources/resources-gallery-2.jpg	resources	success	\N	2025-07-14 16:11:33.648265+00
596716bc-11c7-4fdc-ba89-cf715407ff96	scraped-images/work-projects/resources/resources-gallery-3.jpg	gallery/resources/resources-gallery-3.jpg	resources	success	\N	2025-07-14 16:11:33.996299+00
b5afc4a5-8b17-4481-861b-6f347cd326b0	scraped-images/work-projects/resources/resources-gallery-4.jpg	gallery/resources/resources-gallery-4.jpg	resources	success	\N	2025-07-14 16:11:34.355418+00
2a7122b9-f63d-4dbc-98a5-be3478d9ed70	scraped-images/work-projects/ricecommunications/ricecommunications-banner.jpg	banners/ricecommunications/ricecommunications-banner.jpg	ricecommunications	success	\N	2025-07-14 16:11:34.659832+00
0572230a-a46d-427e-a43f-97810fa2d61a	scraped-images/work-projects/ricecommunications/ricecommunications-gallery-1.jpg	gallery/ricecommunications/ricecommunications-gallery-1.jpg	ricecommunications	success	\N	2025-07-14 16:11:34.940896+00
c1efb2cd-6613-4194-9b9b-8d31da358ddf	scraped-images/work-projects/ricecommunications/ricecommunications-gallery-2.jpg	gallery/ricecommunications/ricecommunications-gallery-2.jpg	ricecommunications	success	\N	2025-07-14 16:11:35.246175+00
1b0d7725-937e-4374-b91c-5a17add463a4	scraped-images/work-projects/ricecommunications/ricecommunications-gallery-3.jpg	gallery/ricecommunications/ricecommunications-gallery-3.jpg	ricecommunications	success	\N	2025-07-14 16:11:35.531711+00
d420a386-0092-4856-a860-07172559112e	scraped-images/work-projects/ricecommunications/ricecommunications-gallery-4.jpg	gallery/ricecommunications/ricecommunications-gallery-4.jpg	ricecommunications	success	\N	2025-07-14 16:11:35.94916+00
cc35ef7f-b223-4bfe-af38-4727dd369d3c	scraped-images/work-projects/ricecommunications/ricecommunications-gallery-5.jpg	gallery/ricecommunications/ricecommunications-gallery-5.jpg	ricecommunications	success	\N	2025-07-14 16:11:36.281738+00
5b75a6bd-cb04-4cc7-8ce5-622f9e5473b6	scraped-images/work-projects/ricecommunications/ricecommunications-gallery-6.jpg	gallery/ricecommunications/ricecommunications-gallery-6.jpg	ricecommunications	success	\N	2025-07-14 16:11:36.578629+00
0009da96-7c56-423d-a5d4-93f466f446e1	scraped-images/work-projects/ridehailinggiant/ridehailinggiant-banner.jpg	banners/ridehailinggiant/ridehailinggiant-banner.jpg	ridehailinggiant	success	\N	2025-07-14 16:11:36.957408+00
6ebbf1c1-d6a9-4de3-8d64-6ba43c53cdfe	scraped-images/work-projects/ridehailinggiant/ridehailinggiant-gallery-1.jpg	gallery/ridehailinggiant/ridehailinggiant-gallery-1.jpg	ridehailinggiant	success	\N	2025-07-14 16:11:37.284535+00
5faf5b32-462e-44fe-8bb7-b260a86f1c32	scraped-images/work-projects/ridehailinggiant/ridehailinggiant-gallery-2.jpg	gallery/ridehailinggiant/ridehailinggiant-gallery-2.jpg	ridehailinggiant	success	\N	2025-07-14 16:11:37.638314+00
2b2c13c8-de23-4dd4-9a22-826b19191d89	scraped-images/work-projects/ridehailinggiant/ridehailinggiant-gallery-3.jpg	gallery/ridehailinggiant/ridehailinggiant-gallery-3.jpg	ridehailinggiant	success	\N	2025-07-14 16:11:37.989375+00
6bc202e1-252b-47ca-ab69-b69ab74e9c70	scraped-images/work-projects/ridehailinggiant/ridehailinggiant-gallery-4.jpg	gallery/ridehailinggiant/ridehailinggiant-gallery-4.jpg	ridehailinggiant	success	\N	2025-07-14 16:11:38.369764+00
d6112ef4-59c0-4893-a82d-e68af4f7f61d	scraped-images/work-projects/ridehailinggiant/ridehailinggiant-gallery-5.jpg	gallery/ridehailinggiant/ridehailinggiant-gallery-5.jpg	ridehailinggiant	success	\N	2025-07-14 16:11:38.70304+00
1f03b18a-70b2-4aa6-b5e2-0d40986431e2	scraped-images/work-projects/ridehailinggiant/ridehailinggiant-gallery-6.jpg	gallery/ridehailinggiant/ridehailinggiant-gallery-6.jpg	ridehailinggiant	success	\N	2025-07-14 16:11:39.034482+00
1090bacd-90f2-4187-9b6c-fa25507baae3	scraped-images/work-projects/ridehailinggiant/ridehailinggiant-gallery-7.jpg	gallery/ridehailinggiant/ridehailinggiant-gallery-7.jpg	ridehailinggiant	success	\N	2025-07-14 16:11:39.394204+00
88888ada-f994-4fde-ac4d-5ec53b9c3682	scraped-images/work-projects/ridehailinggiant/ridehailinggiant-gallery-8.jpg	gallery/ridehailinggiant/ridehailinggiant-gallery-8.jpg	ridehailinggiant	success	\N	2025-07-14 16:11:39.711452+00
60d86ba1-ca6a-4c44-838d-4c2dc3d743e5	scraped-images/work-projects/ridehailinggiant/ridehailinggiant-gallery-9.jpg	gallery/ridehailinggiant/ridehailinggiant-gallery-9.jpg	ridehailinggiant	success	\N	2025-07-14 16:11:40.041527+00
ffdcacd4-6f58-4949-9651-699bf11c7d19	scraped-images/work-projects/rqam/rqam-banner.jpg	banners/rqam/rqam-banner.jpg	rqam	success	\N	2025-07-14 16:11:40.422691+00
235a031e-ff94-4abb-b2f4-ae1c5334387b	scraped-images/work-projects/rqam/rqam-gallery-1.jpg	gallery/rqam/rqam-gallery-1.jpg	rqam	success	\N	2025-07-14 16:11:40.802813+00
d74a6e92-2779-438a-ada7-1fc7337af4f0	scraped-images/work-projects/rqam/rqam-gallery-2.jpg	gallery/rqam/rqam-gallery-2.jpg	rqam	success	\N	2025-07-14 16:11:41.111877+00
9c52f697-7c7d-406c-b48c-de22c69430bc	scraped-images/work-projects/rqam/rqam-gallery-3.jpg	gallery/rqam/rqam-gallery-3.jpg	rqam	success	\N	2025-07-14 16:11:41.455215+00
f7ac0aae-982c-49e6-983b-a796e4876889	scraped-images/work-projects/rqam/rqam-gallery-4.jpg	gallery/rqam/rqam-gallery-4.jpg	rqam	success	\N	2025-07-14 16:11:41.905586+00
df45d080-f537-41fa-932b-dba2161b2c78	scraped-images/work-projects/rqam/rqam-gallery-5.jpg	gallery/rqam/rqam-gallery-5.jpg	rqam	success	\N	2025-07-14 16:11:42.342848+00
ed8540b3-b7b9-4386-bd39-504deaa1959a	scraped-images/work-projects/swissbank/swissbank-banner.jpg	banners/swissbank/swissbank-banner.jpg	swissbank	success	\N	2025-07-14 16:11:42.666988+00
2956d581-9d85-4d59-9b13-ae4ff6408c1a	scraped-images/work-projects/swissbank/swissbank-gallery-1.jpg	gallery/swissbank/swissbank-gallery-1.jpg	swissbank	success	\N	2025-07-14 16:11:43.015898+00
9c9b7b8b-02b6-47bc-96b7-015d23e3e515	scraped-images/work-projects/swissbank/swissbank-gallery-10.jpg	gallery/swissbank/swissbank-gallery-10.jpg	swissbank	success	\N	2025-07-14 16:11:43.373289+00
6cc0b326-7e68-4a2d-8709-938c672c9ef9	scraped-images/work-projects/swissbank/swissbank-gallery-2.jpg	gallery/swissbank/swissbank-gallery-2.jpg	swissbank	success	\N	2025-07-14 16:11:43.710849+00
9960a35b-47f4-4416-850f-b25e4de80a9b	scraped-images/work-projects/swissbank/swissbank-gallery-3.jpg	gallery/swissbank/swissbank-gallery-3.jpg	swissbank	success	\N	2025-07-14 16:11:44.081674+00
c913be05-c207-4319-aae5-d53b1df3c291	scraped-images/work-projects/swissbank/swissbank-gallery-4.jpg	gallery/swissbank/swissbank-gallery-4.jpg	swissbank	success	\N	2025-07-14 16:11:44.408023+00
f1a80b12-68cf-45e7-926e-c6c6e604cdc1	scraped-images/work-projects/swissbank/swissbank-gallery-5.jpg	gallery/swissbank/swissbank-gallery-5.jpg	swissbank	success	\N	2025-07-14 16:11:44.740396+00
5c1426be-4c98-4947-b8e9-394ceb37a6c4	scraped-images/work-projects/swissbank/swissbank-gallery-6.jpg	gallery/swissbank/swissbank-gallery-6.jpg	swissbank	success	\N	2025-07-14 16:11:45.178014+00
68e81d42-9c32-48d9-a32b-080b39dd151c	scraped-images/work-projects/swissbank/swissbank-gallery-7.jpg	gallery/swissbank/swissbank-gallery-7.jpg	swissbank	success	\N	2025-07-14 16:11:45.541549+00
081458a5-edfd-4487-8581-94d7dd1b0711	scraped-images/work-projects/swissbank/swissbank-gallery-8.jpg	gallery/swissbank/swissbank-gallery-8.jpg	swissbank	success	\N	2025-07-14 16:11:45.908402+00
9d722514-75db-43a1-af91-2aab758e9ef3	scraped-images/work-projects/swissbank/swissbank-gallery-9.jpg	gallery/swissbank/swissbank-gallery-9.jpg	swissbank	success	\N	2025-07-14 16:11:46.235601+00
d4da5f7e-c1db-4c06-80ae-c62c9b75eaf6	scraped-images/work-projects/thewolfden/thewolfden-banner.jpg	banners/thewolfden/thewolfden-banner.jpg	thewolfden	success	\N	2025-07-14 16:11:46.654023+00
265e0595-bf31-49ff-88ef-9f8299f98ea7	scraped-images/work-projects/thewolfden/thewolfden-gallery-1.jpg	gallery/thewolfden/thewolfden-gallery-1.jpg	thewolfden	success	\N	2025-07-14 16:11:46.982369+00
abb63f44-2ed5-4864-9c00-67fc930a88df	scraped-images/work-projects/thewolfden/thewolfden-gallery-2.jpg	gallery/thewolfden/thewolfden-gallery-2.jpg	thewolfden	success	\N	2025-07-14 16:11:47.294775+00
cfa63be5-9108-47ad-8352-10c7be6055ac	scraped-images/work-projects/thewolfden/thewolfden-gallery-3.jpg	gallery/thewolfden/thewolfden-gallery-3.jpg	thewolfden	success	\N	2025-07-14 16:11:47.678333+00
f7100074-a6e7-4298-b6a5-42589c676f50	scraped-images/work-projects/thewolfden/thewolfden-gallery-4.jpg	gallery/thewolfden/thewolfden-gallery-4.jpg	thewolfden	success	\N	2025-07-14 16:11:48.027254+00
c5415831-e544-413e-9650-709f99fc6059	scraped-images/work-projects/thewolfden/thewolfden-gallery-5.jpg	gallery/thewolfden/thewolfden-gallery-5.jpg	thewolfden	success	\N	2025-07-14 16:11:48.340438+00
c580c976-d36f-4ea0-a107-00baac6c382e	scraped-images/work-projects/vvlife/vvlife-banner.jpg	banners/vvlife/vvlife-banner.jpg	vvlife	success	\N	2025-07-14 16:11:48.738914+00
21011ab0-8eac-4ff0-b7a6-e4e80b2d1c95	scraped-images/work-projects/vvlife/vvlife-gallery-1.jpg	gallery/vvlife/vvlife-gallery-1.jpg	vvlife	success	\N	2025-07-14 16:11:49.190189+00
ab82238c-650c-47ae-be6b-35b1b449400d	scraped-images/work-projects/vvlife/vvlife-gallery-2.jpg	gallery/vvlife/vvlife-gallery-2.jpg	vvlife	success	\N	2025-07-14 16:11:49.542364+00
7dac62fd-5393-402c-8d0a-6565b28a12be	scraped-images/work-projects/vvlife/vvlife-gallery-3.jpg	gallery/vvlife/vvlife-gallery-3.jpg	vvlife	success	\N	2025-07-14 16:11:49.91035+00
8a93e51f-095a-4d61-96f0-26a609060c15	scraped-images/work-projects/vvlife/vvlife-gallery-4.jpg	gallery/vvlife/vvlife-gallery-4.jpg	vvlife	success	\N	2025-07-14 16:11:50.255122+00
94483790-9904-4c0a-82fa-dcc789f98ab9	scraped-images/work-projects/vvlife/vvlife-gallery-5.jpg	gallery/vvlife/vvlife-gallery-5.jpg	vvlife	success	\N	2025-07-14 16:11:50.601442+00
1b75c694-ff7c-4cfe-a9ff-00b5b3d98104	scraped-images/work-projects/vvlife/vvlife-gallery-6.jpg	gallery/vvlife/vvlife-gallery-6.jpg	vvlife	success	\N	2025-07-14 16:11:50.937341+00
c3a503d9-9394-4216-9bd7-0505c92b4638	scraped-images/work-projects/zurichinsurance/zurichinsurance-banner.jpg	banners/zurichinsurance/zurichinsurance-banner.jpg	zurichinsurance	success	\N	2025-07-14 16:11:51.302891+00
b23a31d5-b6ca-4ebb-8606-747b25edc577	scraped-images/work-projects/zurichinsurance/zurichinsurance-gallery-1.jpg	gallery/zurichinsurance/zurichinsurance-gallery-1.jpg	zurichinsurance	success	\N	2025-07-14 16:11:51.629782+00
08a0a022-3a84-4090-98fc-217c256ec31f	scraped-images/work-projects/zurichinsurance/zurichinsurance-gallery-2.jpg	gallery/zurichinsurance/zurichinsurance-gallery-2.jpg	zurichinsurance	success	\N	2025-07-14 16:11:51.955334+00
277dbd24-9b6e-4fb7-8d62-f674760c5337	scraped-images/work-projects/zurichinsurance/zurichinsurance-gallery-3.jpg	gallery/zurichinsurance/zurichinsurance-gallery-3.jpg	zurichinsurance	success	\N	2025-07-14 16:11:52.296954+00
5f9fe01f-e288-4603-a678-b14c82176df4	scraped-images/work-projects/zurichinsurance/zurichinsurance-gallery-4.jpg	gallery/zurichinsurance/zurichinsurance-gallery-4.jpg	zurichinsurance	success	\N	2025-07-14 16:11:52.647169+00
7baf1ecd-7ba9-4f5f-a6ed-abf204f88a4b	scraped-images/work-projects/zurichinsurance/zurichinsurance-gallery-5.jpg	gallery/zurichinsurance/zurichinsurance-gallery-5.jpg	zurichinsurance	success	\N	2025-07-14 16:11:52.947597+00
59d02457-c061-4755-8bba-cffc036fa1e0	scraped-images/work-projects/zurichinsurance/zurichinsurance-gallery-6.jpg	gallery/zurichinsurance/zurichinsurance-gallery-6.jpg	zurichinsurance	success	\N	2025-07-14 16:11:53.263088+00
34ddd392-b52a-49da-b953-3558e5dbad97	scraped-images/work-projects/zurichinsurance/zurichinsurance-gallery-7.jpg	gallery/zurichinsurance/zurichinsurance-gallery-7.jpg	zurichinsurance	success	\N	2025-07-14 16:11:53.556667+00
\.
COPY public.page_views (id, project_id, user_ip, user_agent, referrer, session_id, view_duration, created_at) FROM stdin;
dc32fa67-2419-4d4b-972f-10201447d357	4dcb6dd4-4149-447b-9ad1-7f1267bd059c	103.37.228.254	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	\N	session_1752502503906_llgmi0k562n	0	2025-07-14 14:32:03.223467+00
d551ab79-c5e6-4e78-8664-68b60d460653	55e61848-284a-43df-be70-c0299917bb6c	103.37.228.254	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	https://vercel.com/	session_1752527101727_r65sibbywf	0	2025-07-16 10:13:43.808173+00
f4f09011-9601-4462-873e-0d8ed8b35cb8	4dcb6dd4-4149-447b-9ad1-7f1267bd059c	103.37.228.254	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	\N	session_1752502503906_llgmi0k562n	10	2025-07-14 14:32:03.653401+00
d7fd1119-bd3d-40ea-b6bf-dfd77f174ae0	2d4ee1b7-c3cc-4dec-bfdb-3688d642fd4e	103.37.228.254	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	\N	session_1752502503906_llgmi0k562n	0	2025-07-14 14:32:23.849277+00
7e600bb6-f829-43fb-8275-b470b38fba93	2d4ee1b7-c3cc-4dec-bfdb-3688d642fd4e	103.37.228.254	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	\N	session_1752502503906_llgmi0k562n	0	2025-07-14 14:32:24.040993+00
f9a9a39f-10fc-44c9-90e6-166499bc6c47	2d4ee1b7-c3cc-4dec-bfdb-3688d642fd4e	103.37.228.254	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	\N	session_1752502503906_llgmi0k562n	0	2025-07-14 14:32:25.473183+00
bcd1cda5-31c7-4878-9a09-28261846d8a4	2d4ee1b7-c3cc-4dec-bfdb-3688d642fd4e	103.37.228.254	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	\N	session_1752502503906_llgmi0k562n	5	2025-07-14 14:32:27.735021+00
1e5cb009-0f84-4573-b89e-83f88615ea73	4dcb6dd4-4149-447b-9ad1-7f1267bd059c	103.37.228.254	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	\N	session_1752502503906_llgmi0k562n	0	2025-07-14 14:33:55.246185+00
e33c16f4-b462-4894-a566-af28c5b7f6bd	4dcb6dd4-4149-447b-9ad1-7f1267bd059c	103.37.228.254	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	\N	session_1752502503906_llgmi0k562n	5	2025-07-14 14:33:55.546503+00
a78fff19-1638-4a3d-875f-91bbd8b6e282	2d4ee1b7-c3cc-4dec-bfdb-3688d642fd4e	103.37.228.254	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	\N	session_1752502503906_llgmi0k562n	0	2025-07-14 14:34:17.039005+00
0c08b2b1-83a9-44e2-a0a5-d11ba9cb802a	2d4ee1b7-c3cc-4dec-bfdb-3688d642fd4e	103.37.228.254	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	\N	session_1752502503906_llgmi0k562n	1	2025-07-14 14:34:17.171807+00
83807cd1-97de-4a3f-ba0d-c9fd583b081d	2d4ee1b7-c3cc-4dec-bfdb-3688d642fd4e	103.37.228.254	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	\N	session_1752502503906_llgmi0k562n	0	2025-07-14 14:34:19.020592+00
b7dd91d2-8eb5-48e2-85d1-d9f973371a17	2d4ee1b7-c3cc-4dec-bfdb-3688d642fd4e	103.37.228.254	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	\N	session_1752502503906_llgmi0k562n	4	2025-07-14 14:34:21.652329+00
1cca30fb-4076-4e45-bf73-9ac8ea86fcbe	4dcb6dd4-4149-447b-9ad1-7f1267bd059c	103.37.228.254	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	\N	session_1752502503906_llgmi0k562n	0	2025-07-14 14:36:37.276148+00
ec38d5e4-2179-440c-9718-a57bcf01f1d6	dc18e22c-c280-4463-bd94-8d801169d8c6	103.37.228.254	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	\N	session_1752502503906_llgmi0k562n	315	2025-07-14 14:40:17.395117+00
ff6fb836-2839-484b-8925-6d40f3b985d6	4dcb6dd4-4149-447b-9ad1-7f1267bd059c	103.37.228.254	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	\N	session_1752502503906_llgmi0k562n	6	2025-07-14 14:36:37.555362+00
9edd6bfe-c12e-49de-9994-59feb6a32356	4dcb6dd4-4149-447b-9ad1-7f1267bd059c	103.37.228.254	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	\N	session_1752502503906_llgmi0k562n	0	2025-07-14 14:36:44.816628+00
6715c346-8e98-480b-9bb3-88ad49c65401	2d4ee1b7-c3cc-4dec-bfdb-3688d642fd4e	103.37.228.254	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	\N	session_1752502503906_llgmi0k562n	0	2025-07-14 14:36:59.54334+00
4d0defd4-79f6-4cfc-aed6-0e1f0a31b4c6	10b32f1a-0e31-4c2c-8fad-4d4f17980a9f	103.37.228.254	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	http://localhost:3000/wolf-studio	session_1752502503906_llgmi0k562n	0	2025-07-14 15:39:35.044607+00
01072e11-ccdf-41e4-a4cd-caa6585888a3	2d4ee1b7-c3cc-4dec-bfdb-3688d642fd4e	103.37.228.254	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	\N	session_1752502503906_llgmi0k562n	146	2025-07-14 14:37:00.492791+00
5f6975d6-41e9-40e6-946f-4c0c7eb5909c	df150485-bfd6-4bf4-9a83-ac8c150e7050	103.37.228.254	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	\N	session_1752502503906_llgmi0k562n	0	2025-07-14 14:39:28.846618+00
52a93968-d043-4431-a5c9-3937fa9e9bbf	dc18e22c-c280-4463-bd94-8d801169d8c6	103.37.228.254	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	\N	session_1752502503906_llgmi0k562n	0	2025-07-14 14:40:17.247673+00
32ef8da6-b6f3-43d1-8b64-808df1664832	dc18e22c-c280-4463-bd94-8d801169d8c6	103.37.228.254	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	\N	session_1752502503906_llgmi0k562n	367	2025-07-14 14:45:33.922936+00
1b3630ce-cfab-4005-aa6c-ec0a8d84118a	4dcb6dd4-4149-447b-9ad1-7f1267bd059c	103.37.228.254	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	http://localhost:3000/admin/projects	session_1752502503906_llgmi0k562n	0	2025-07-14 14:56:06.554515+00
bcfc6522-46ac-4cda-819a-85cbe473b44d	2d4ee1b7-c3cc-4dec-bfdb-3688d642fd4e	103.37.228.254	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	\N	session_1752502503906_llgmi0k562n	566	2025-07-14 15:04:47.967312+00
556ba382-f5a9-4af3-9ed2-16a9f74f8779	10b32f1a-0e31-4c2c-8fad-4d4f17980a9f	103.37.228.254	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	\N	session_1752502503906_llgmi0k562n	25	2025-07-14 16:51:06.219027+00
a13fd1dd-3d34-4069-aa8f-9675bc6be57b	2d4ee1b7-c3cc-4dec-bfdb-3688d642fd4e	103.37.228.254	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	\N	session_1752502503906_llgmi0k562n	0	2025-07-14 15:04:47.679395+00
c00cbbef-2bba-4756-b508-e8590c4c89e1	10b32f1a-0e31-4c2c-8fad-4d4f17980a9f	103.37.228.254	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	http://localhost:3000/wolf-studio	session_1752502503906_llgmi0k562n	3918	2025-07-14 15:39:35.261073+00
04e261bc-a11b-402d-b133-49021ca8672f	10b32f1a-0e31-4c2c-8fad-4d4f17980a9f	103.37.228.254	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	\N	session_1752502503906_llgmi0k562n	0	2025-07-14 16:51:06.05264+00
88fafd0c-7000-4f50-bc9a-1be963e4d662	4dcb6dd4-4149-447b-9ad1-7f1267bd059c	103.37.228.254	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	\N	session_1752502503906_llgmi0k562n	0	2025-07-14 18:16:45.414428+00
03a3a318-993b-44a8-8f14-912330336b77	4dcb6dd4-4149-447b-9ad1-7f1267bd059c	103.37.228.254	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	\N	session_1752502503906_llgmi0k562n	7	2025-07-14 18:16:45.542789+00
d28be1e5-ecfd-4bd6-a4c4-6d43329eb05e	11a498ca-31aa-4e0a-971a-ca5a2e12c3d5	103.37.228.254	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	\N	session_1752502503906_llgmi0k562n	0	2025-07-14 18:19:31.579419+00
05a508c6-c8d8-4260-bef2-6cbc9309ade0	0d596f5c-54cb-4566-bcfc-cc0bbf301607	103.37.228.254	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	\N	session_1752502503906_llgmi0k562n	0	2025-07-14 18:19:17.919016+00
c55c1f2f-750e-4892-bf32-b9ed491a18dd	df150485-bfd6-4bf4-9a83-ac8c150e7050	103.37.228.254	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	https://vercel.com/	session_1752527101727_r65sibbywf	0	2025-07-16 10:13:48.487854+00
8f47d049-4a0f-44e3-b280-36fb3052c9a0	10b32f1a-0e31-4c2c-8fad-4d4f17980a9f	103.37.228.254	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	\N	session_1752502503906_llgmi0k562n	0	2025-07-14 18:19:26.893259+00
839072e1-192f-4152-b471-4ca66359245d	10b32f1a-0e31-4c2c-8fad-4d4f17980a9f	103.37.228.254	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	\N	session_1752502503906_llgmi0k562n	0	2025-07-14 18:19:27.204943+00
3257d9d6-7213-4a76-9ab5-cb23dc1023c5	10b32f1a-0e31-4c2c-8fad-4d4f17980a9f	103.37.228.254	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	\N	session_1752502503906_llgmi0k562n	507	2025-07-14 18:59:45.342896+00
c817db86-a614-48d6-aa78-5661d0ece334	4dcb6dd4-4149-447b-9ad1-7f1267bd059c	119.234.50.114	Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1	\N	session_1752661305214_ojnr86fuf9	0	2025-07-16 10:22:06.679122+00
72bddc7d-8962-4347-b468-59f3d217452a	82d8b5c2-272e-412f-9c9b-612032fa8f83	101.78.115.127	Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1	\N	session_1752713569138_x4m3o0w8hs8	9640	2025-07-17 00:53:17.402572+00
e529bbd3-6a2d-4dc6-a2a0-7c22af34b64f	df150485-bfd6-4bf4-9a83-ac8c150e7050	101.78.115.127	Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1	\N	session_1752580050905_z0na5nh25pa	5249	2025-07-15 11:48:01.755386+00
121d80f4-682d-4bda-9a07-6bc04eaa1daa	4dcb6dd4-4149-447b-9ad1-7f1267bd059c	103.37.228.254	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	https://wolf-studio.vercel.app/admin/projects	session_1752527101727_r65sibbywf	0	2025-07-15 14:54:13.614096+00
1e9f2d26-fff7-4ddb-b9b0-f3edf43f2b31	79cf0fc8-98ac-44de-b1ff-79c6a22dbca7	103.37.228.254	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	https://wolf-studio.vercel.app/admin/projects	session_1752527101727_r65sibbywf	0	2025-07-15 14:54:23.874833+00
2f87fb02-e5b1-421e-ab35-1192c9ef335c	b584c226-9ff8-4a14-ace7-3ef25edd4ebd	103.37.228.254	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	\N	session_1752527101727_r65sibbywf	7	2025-07-16 08:49:03.747123+00
69850984-5180-4607-8fe0-94f7d57d841b	10b32f1a-0e31-4c2c-8fad-4d4f17980a9f	103.37.228.254	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	\N	session_1752502503906_llgmi0k562n	5415	2025-07-14 19:08:14.393008+00
d5fbfdf7-f683-4b35-91c7-da8d1b26dadf	11a498ca-31aa-4e0a-971a-ca5a2e12c3d5	103.37.228.254	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	\N	session_1752502503906_llgmi0k562n	1678	2025-07-14 18:19:31.801679+00
68fc27de-e41b-4eac-9d25-54c6b0110423	4aa178eb-5798-408b-bdbd-ac47344fe497	103.37.228.254	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	https://vercel.com/	session_1752527101727_r65sibbywf	903	2025-07-16 09:04:27.827257+00
ea88ecf3-9e65-4187-882a-944db2315c39	10b32f1a-0e31-4c2c-8fad-4d4f17980a9f	103.37.228.254	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	\N	session_1752502503906_llgmi0k562n	0	2025-07-14 18:59:45.057795+00
385b7f27-3f75-4703-a71f-368e658113bb	10b32f1a-0e31-4c2c-8fad-4d4f17980a9f	103.37.228.254	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	\N	session_1752527101727_r65sibbywf	28731	2025-07-15 01:22:37.607071+00
170952ee-2f68-4938-ab7f-3d4d0281891a	df150485-bfd6-4bf4-9a83-ac8c150e7050	101.78.115.127	Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1	\N	session_1752580050905_z0na5nh25pa	0	2025-07-15 11:47:41.841668+00
cad160c1-839e-46c9-a5b2-03a1aab9ac5a	58e1ece2-dd8d-4c30-9f22-5d61a88636df	103.37.228.254	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	\N	session_1752502503906_llgmi0k562n	0	2025-07-16 09:37:47.067564+00
98442c83-4b3d-4be7-a155-dc4b89c58fb1	58e1ece2-dd8d-4c30-9f22-5d61a88636df	103.37.228.254	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	\N	session_1752502503906_llgmi0k562n	0	2025-07-16 09:37:47.225881+00
3a44e7ff-d590-48da-ae2f-6a11702abda8	58e1ece2-dd8d-4c30-9f22-5d61a88636df	103.37.228.254	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	\N	session_1752502503906_llgmi0k562n	0	2025-07-16 09:37:48.803592+00
d690bb05-ceca-47ee-baf9-1fc6df2538e1	4dcb6dd4-4149-447b-9ad1-7f1267bd059c	119.234.50.114	Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1	\N	session_1752661305214_ojnr86fuf9	0	2025-07-16 10:21:47.579069+00
82d68c0f-26d4-4508-b05e-8758f61c771a	4dcb6dd4-4149-447b-9ad1-7f1267bd059c	101.78.115.127	Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1	\N	session_1752682895786_f0qlei8r1u	0	2025-07-16 16:21:37.308832+00
41395047-a782-43e1-81cb-694acfcdb639	2d4ee1b7-c3cc-4dec-bfdb-3688d642fd4e	101.78.115.127	Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1	\N	session_1752682895786_f0qlei8r1u	4	2025-07-16 16:21:43.811113+00
4adc8b0e-52f8-4dbf-8ab9-bf30e960e864	dde3babc-d612-4b08-b58b-70fa80fba408	103.37.228.254	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	\N	session_1752527101727_r65sibbywf	8	2025-07-17 02:55:29.076528+00
110ef6f5-de54-40c0-aac1-4b17a35d79e2	4dcb6dd4-4149-447b-9ad1-7f1267bd059c	103.37.228.254	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	http://localhost:3000/admin/projects	session_1752502503906_llgmi0k562n	0	2025-07-16 09:41:50.993574+00
8a64a7c3-aaeb-476a-8e6e-5e21f8487b11	da1bc1cc-e6b6-40bd-b80b-70892a70ce1c	101.78.115.127	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36	\N	session_1752583938624_ezb0udvijhm	0	2025-09-09 03:32:39.42628+00
bb25e6d4-4ebe-498c-962a-e96116baeac3	ef5d39ee-262e-4877-b109-95e56a0892d8	101.78.115.127	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36	\N	session_1752583938624_ezb0udvijhm	599	2025-09-09 03:32:46.394917+00
d53eedca-b33b-4dd2-821a-4c6878a9b46e	2d4ee1b7-c3cc-4dec-bfdb-3688d642fd4e	101.78.115.127	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36	http://localhost:3000/	session_1757390769520_a8fjl9uiosw	0	2025-09-09 04:06:10.0647+00
63dad5c9-17be-443f-810e-0a1ea03b2018	4dcb6dd4-4149-447b-9ad1-7f1267bd059c	101.78.115.127	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36	http://localhost:3000/admin/projects/4dcb6dd4-4149-447b-9ad1-7f1267bd059c	session_1757390769520_a8fjl9uiosw	4	2025-09-09 04:13:28.742643+00
d6a1beee-d850-45b9-a283-a1f8c0b8d01e	2d4ee1b7-c3cc-4dec-bfdb-3688d642fd4e	101.78.115.127	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36	http://localhost:3000/	session_1757390769520_a8fjl9uiosw	253	2025-09-09 04:06:10.257987+00
08002788-9625-4514-99b9-c788df1f6b3a	4dcb6dd4-4149-447b-9ad1-7f1267bd059c	101.78.115.127	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36	http://localhost:3000/admin/projects/4dcb6dd4-4149-447b-9ad1-7f1267bd059c	session_1757390769520_a8fjl9uiosw	2	2025-09-09 04:13:45.052802+00
9c7839ea-4dde-4101-9328-5302256106ce	82d8b5c2-272e-412f-9c9b-612032fa8f83	101.78.115.127	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36	\N	session_1752583938624_ezb0udvijhm	27	2025-09-09 04:45:17.029842+00
95eb3cee-6f85-480c-aaba-a127bee74986	4dcb6dd4-4149-447b-9ad1-7f1267bd059c	101.78.115.127	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36	http://localhost:3000/admin/projects/4dcb6dd4-4149-447b-9ad1-7f1267bd059c	session_1757390769520_a8fjl9uiosw	2	2025-09-09 05:41:42.234336+00
ec0513c8-bb1b-4998-b2f8-c21f28404756	4dcb6dd4-4149-447b-9ad1-7f1267bd059c	101.78.115.127	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36	\N	session_1752583938624_ezb0udvijhm	1784	2025-09-09 04:46:05.588122+00
1397195d-ffd1-4b73-8482-7341d11c0d16	4dcb6dd4-4149-447b-9ad1-7f1267bd059c	101.78.115.127	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36	\N	session_1752583938624_ezb0udvijhm	0	2025-09-09 05:15:50.669924+00
740478a2-b9bb-4d3d-9e23-6404f45ae055	4dcb6dd4-4149-447b-9ad1-7f1267bd059c	101.78.115.127	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36	http://localhost:3000/admin/projects/4dcb6dd4-4149-447b-9ad1-7f1267bd059c	session_1757390769520_a8fjl9uiosw	203	2025-09-09 04:14:04.894078+00
66b68565-fa03-431f-8cda-bca7f73a8e26	4dcb6dd4-4149-447b-9ad1-7f1267bd059c	101.78.115.127	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36	http://localhost:3000/admin/projects/4dcb6dd4-4149-447b-9ad1-7f1267bd059c	session_1757390769520_a8fjl9uiosw	0	2025-09-09 04:27:47.652679+00
a6fcff34-faeb-409b-ba9c-171841472b38	ed511fab-cf1b-4464-96b8-b724c1c6ee09	101.78.115.127	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36	http://localhost:3000/admin/projects/ed511fab-cf1b-4464-96b8-b724c1c6ee09	session_1757390769520_a8fjl9uiosw	0	2025-09-09 04:29:34.293891+00
756baf43-ae30-43b5-bf22-46fa1a08b713	4dcb6dd4-4149-447b-9ad1-7f1267bd059c	101.78.115.127	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36	http://localhost:3000/admin/projects/4dcb6dd4-4149-447b-9ad1-7f1267bd059c	session_1757390769520_a8fjl9uiosw	7	2025-09-09 05:16:21.348371+00
fbcecf9e-2b9c-4286-b2b7-5ab5163ad6f5	ed511fab-cf1b-4464-96b8-b724c1c6ee09	101.78.115.127	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36	http://localhost:3000/admin/projects/ed511fab-cf1b-4464-96b8-b724c1c6ee09	session_1757390769520_a8fjl9uiosw	9	2025-09-09 04:29:43.451697+00
e259c7fc-8e0d-4ca7-bc1b-127e636d36a5	4dcb6dd4-4149-447b-9ad1-7f1267bd059c	101.78.115.127	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36	http://localhost:3000/admin/projects/4dcb6dd4-4149-447b-9ad1-7f1267bd059c	session_1757390769520_a8fjl9uiosw	326	2025-09-09 05:17:02.387208+00
621ed9a4-7989-4ad0-b465-49e8e6a686ee	ed511fab-cf1b-4464-96b8-b724c1c6ee09	101.78.115.127	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36	http://localhost:3000/admin/projects/ed511fab-cf1b-4464-96b8-b724c1c6ee09	session_1757390769520_a8fjl9uiosw	340	2025-09-09 04:29:53.324694+00
913b2a45-0f61-4900-9cff-33c5e9c1f689	4dcb6dd4-4149-447b-9ad1-7f1267bd059c	101.78.115.127	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36	http://localhost:3000/admin/projects/4dcb6dd4-4149-447b-9ad1-7f1267bd059c	session_1757390769520_a8fjl9uiosw	10	2025-09-09 05:33:12.308149+00
07be8d4c-8c9e-4b8d-a3fa-f4f531b8b3f3	b584c226-9ff8-4a14-ace7-3ef25edd4ebd	101.78.115.127	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36	\N	session_1752583938624_ezb0udvijhm	40	2025-09-09 04:42:00.834547+00
cde81106-5c10-4b15-9651-ff1fafb6bf6e	e23191c5-e55a-4375-a0b0-3f450f2a1c39	101.78.115.127	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36	\N	session_1752583938624_ezb0udvijhm	0	2025-09-09 04:44:46.46368+00
0f835ceb-682e-46a0-937a-c0181cb2f4fb	2d4ee1b7-c3cc-4dec-bfdb-3688d642fd4e	101.78.115.127	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36	\N	session_1752583938624_ezb0udvijhm	0	2025-09-09 04:44:51.639652+00
6313c777-6162-49cc-9b07-bb65814942d5	79cf0fc8-98ac-44de-b1ff-79c6a22dbca7	101.78.115.127	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36	\N	session_1752583938624_ezb0udvijhm	0	2025-09-09 04:44:55.723742+00
f39cd867-508c-4cec-bf19-fb0e83ea1e8f	10b32f1a-0e31-4c2c-8fad-4d4f17980a9f	101.78.115.127	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36	\N	session_1752583938624_ezb0udvijhm	0	2025-09-09 04:44:59.845966+00
7b8a057a-9cd3-41f6-b6fc-0680b6797904	4dcb6dd4-4149-447b-9ad1-7f1267bd059c	101.78.115.127	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36	\N	session_1752583938624_ezb0udvijhm	0	2025-09-09 04:45:06.89194+00
947eecce-368d-4bd7-b6e0-f6f634ca3a9c	67cab6a0-0748-401d-a468-0c50e31fda4f	101.78.115.127	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36	\N	session_1752583938624_ezb0udvijhm	0	2025-09-09 04:45:11.864723+00
b93e51c9-f831-4a2c-9987-e20f56c2367f	4dcb6dd4-4149-447b-9ad1-7f1267bd059c	101.78.115.127	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36	http://localhost:3000/admin/projects/4dcb6dd4-4149-447b-9ad1-7f1267bd059c	session_1757390769520_a8fjl9uiosw	2	2025-09-09 05:34:31.384502+00
d5b6f615-80a7-4d5b-8ba1-5da03d034be8	b3de5b44-4ff7-434e-bfd3-c5c2dbf554fb	208.68.246.250	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0.1 Safari/605.1.15	\N	session_1758304261005_8c8r6h04zo	0	2025-09-19 17:51:05.411537+00
02d0e2be-157e-43bc-922d-f424ecd29381	10b32f1a-0e31-4c2c-8fad-4d4f17980a9f	101.78.115.127	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36	http://localhost:3000/admin/projects/10b32f1a-0e31-4c2c-8fad-4d4f17980a9f	session_1757390769520_a8fjl9uiosw	102	2025-09-09 05:42:55.598448+00
747a864a-a2d9-4e19-b377-77985dee5de2	f087ec15-4657-40fb-ba52-295d83487ef0	208.68.246.250	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0.1 Safari/605.1.15	\N	session_1758304261005_8c8r6h04zo	208	2025-09-19 17:51:07.830947+00
85b097e0-cd41-424e-9001-cd7e71803823	4dcb6dd4-4149-447b-9ad1-7f1267bd059c	101.78.115.127	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36	http://localhost:3000/admin/projects/4dcb6dd4-4149-447b-9ad1-7f1267bd059c	session_1757390769520_a8fjl9uiosw	269	2025-09-09 05:42:19.611418+00
16b374ef-2620-4f82-af37-d87b9c877f0a	4dcb6dd4-4149-447b-9ad1-7f1267bd059c	101.78.115.127	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36	\N	session_1752583938624_ezb0udvijhm	5	2025-09-09 05:46:25.216324+00
464adda1-efac-487c-9241-13bb84f2d396	dde3babc-d612-4b08-b58b-70fa80fba408	208.68.247.153	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	https://wolf-studio.vercel.app/admin/projects	session_1759264594943_qruduxhu46	0	2025-09-30 20:36:50.185571+00
0ecf18d3-dc68-4c53-84fa-f26525c15e81	dde3babc-d612-4b08-b58b-70fa80fba408	208.68.247.153	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	https://wolf-studio.vercel.app/admin/projects	session_1759264594943_qruduxhu46	21540	2025-09-30 20:37:10.765041+00
6b997089-fd3c-4303-821b-3100b22650d0	0d596f5c-54cb-4566-bcfc-cc0bbf301607	208.68.247.153	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	https://wolf-studio.vercel.app/admin/projects	session_1758304330882_v7uu8itlrmt	1379146	2025-10-29 15:47:24.850943+00
778ed34d-9d88-4768-aa92-33f8315caf87	0d596f5c-54cb-4566-bcfc-cc0bbf301607	208.68.247.153	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	https://wolf-studio.vercel.app/admin/projects	session_1758304330882_v7uu8itlrmt	0	2025-11-17 16:41:29.448588+00
0ae151da-bf27-4ade-8125-ed251a5db2db	0d596f5c-54cb-4566-bcfc-cc0bbf301607	208.68.247.153	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	https://wolf-studio.vercel.app/admin/projects	session_1758304330882_v7uu8itlrmt	0	2025-11-19 15:32:00.601066+00
\.
COPY public.project_analytics (id, project_id, total_views, unique_visitors, average_time_on_page, bounce_rate, last_viewed, updated_at) FROM stdin;
66a20dac-92b2-445d-aefc-a0b929bde9aa	dc18e22c-c280-4463-bd94-8d801169d8c6	3	1	0.00	0.00	2025-07-14 14:45:33.922936+00	2025-07-14 14:45:33.922936+00
744fdfa1-6535-40c4-a712-42bf997ddf5c	4aa178eb-5798-408b-bdbd-ac47344fe497	1	1	0.00	0.00	2025-07-16 09:04:27.827257+00	2025-07-16 09:04:27.827257+00
10d72d2f-dca1-4f81-a056-9cba1400f160	58e1ece2-dd8d-4c30-9f22-5d61a88636df	3	1	0.00	0.00	2025-07-16 09:37:48.803592+00	2025-07-16 09:37:48.803592+00
abf7f79a-2a26-4773-ac80-eadb41916971	11a498ca-31aa-4e0a-971a-ca5a2e12c3d5	2	1	0.00	0.00	2025-07-14 18:19:31.801679+00	2025-07-14 18:19:31.801679+00
fa096aea-4a50-4ee0-87a1-f83d47ac1b54	55e61848-284a-43df-be70-c0299917bb6c	1	1	0.00	0.00	2025-07-16 10:13:43.808173+00	2025-07-16 10:13:43.808173+00
c79ffbc2-9d9a-4195-a466-2225b0d18378	df150485-bfd6-4bf4-9a83-ac8c150e7050	4	2	0.00	0.00	2025-07-16 10:13:48.487854+00	2025-07-16 10:13:48.487854+00
8baf4941-88e9-4787-ab5b-97b9ab257aeb	da1bc1cc-e6b6-40bd-b80b-70892a70ce1c	1	1	0.00	0.00	2025-09-09 03:32:39.42628+00	2025-09-09 03:32:39.42628+00
41a4ede8-325e-4eec-b3a0-56957ebf8059	ef5d39ee-262e-4877-b109-95e56a0892d8	1	1	0.00	0.00	2025-09-09 03:32:46.394917+00	2025-09-09 03:32:46.394917+00
dadd9816-60f1-4bd1-aabe-f405da94e250	ed511fab-cf1b-4464-96b8-b724c1c6ee09	3	1	0.00	0.00	2025-09-09 04:29:53.324694+00	2025-09-09 04:29:53.324694+00
a98585fe-b869-4736-801c-7393144b51a4	b584c226-9ff8-4a14-ace7-3ef25edd4ebd	2	2	0.00	0.00	2025-09-09 04:42:00.834547+00	2025-09-09 04:42:00.834547+00
8011e08b-2def-472f-82ea-6bb9a3f9fc2c	e23191c5-e55a-4375-a0b0-3f450f2a1c39	1	1	0.00	0.00	2025-09-09 04:44:46.46368+00	2025-09-09 04:44:46.46368+00
d334f618-052e-4f9d-b787-8f2c353ffa1b	2d4ee1b7-c3cc-4dec-bfdb-3688d642fd4e	16	2	0.00	0.00	2025-09-09 04:44:51.639652+00	2025-09-09 04:44:51.639652+00
9ee45118-6333-4624-9798-a945fb13858c	79cf0fc8-98ac-44de-b1ff-79c6a22dbca7	2	2	0.00	0.00	2025-09-09 04:44:55.723742+00	2025-09-09 04:44:55.723742+00
f3234fcd-0f90-4a35-913a-970bbe00d670	67cab6a0-0748-401d-a468-0c50e31fda4f	1	1	0.00	0.00	2025-09-09 04:45:11.864723+00	2025-09-09 04:45:11.864723+00
fe74f96c-18a3-4c92-af56-4576ebd340f4	82d8b5c2-272e-412f-9c9b-612032fa8f83	2	1	0.00	0.00	2025-09-09 04:45:17.029842+00	2025-09-09 04:45:17.029842+00
1639cf8d-a271-4f58-b371-d2247579ab76	10b32f1a-0e31-4c2c-8fad-4d4f17980a9f	12	2	0.00	0.00	2025-09-09 05:42:55.598448+00	2025-09-09 05:42:55.598448+00
8e31124d-5865-4ff6-a4bd-bc6789c1ffd5	4dcb6dd4-4149-447b-9ad1-7f1267bd059c	29	3	0.00	0.00	2025-09-09 05:46:25.216324+00	2025-09-09 05:46:25.216324+00
ea496dce-8c1f-46f2-8586-b63d6cf5fd85	b3de5b44-4ff7-434e-bfd3-c5c2dbf554fb	1	1	0.00	0.00	2025-09-19 17:51:05.411537+00	2025-09-19 17:51:05.411537+00
70b7365c-e7d3-4d1d-9409-f80e2ed10036	f087ec15-4657-40fb-ba52-295d83487ef0	1	1	0.00	0.00	2025-09-19 17:51:07.830947+00	2025-09-19 17:51:07.830947+00
5291b59d-17e5-48fd-a7c0-78b5e56eb9d5	dde3babc-d612-4b08-b58b-70fa80fba408	3	2	0.00	0.00	2025-09-30 20:37:10.765041+00	2025-09-30 20:37:10.765041+00
59442657-8b67-4505-9825-cba3e9814b4e	0d596f5c-54cb-4566-bcfc-cc0bbf301607	4	2	0.00	0.00	2025-11-19 15:32:00.601066+00	2025-11-19 15:32:00.601066+00
\.
COPY public.project_images (id, project_id, image_url, alt_text, caption, display_order, image_type, created_at, updated_at, storage_path, file_size, mime_type, crop_data) FROM stdin;
bc355f97-bd7f-4e0f-bf1b-fea70ed4ca1a	dc18e22c-c280-4463-bd94-8d801169d8c6	/scraped-images/work-projects/bayer/bayer-banner.jpg	bayer banner 1	\N	1	banner	2025-07-14 16:19:43.645971+00	2025-07-14 16:19:43.645971+00	banners/bayer/bayer-banner.jpg	\N	image/jpeg	\N
f4894321-de47-41e8-9729-b6cbff75c67e	dc18e22c-c280-4463-bd94-8d801169d8c6	/scraped-images/work-projects/bayer/bayer-gallery-1.jpg	bayer gallery 2	\N	2	gallery	2025-07-14 16:19:43.763929+00	2025-07-14 16:19:43.763929+00	gallerys/bayer/bayer-gallery-1.jpg	\N	image/jpeg	\N
fbab3bcd-c038-4a95-b96f-bc2c4b9ac0b6	dc18e22c-c280-4463-bd94-8d801169d8c6	/scraped-images/work-projects/bayer/bayer-gallery-2.jpg	bayer gallery 3	\N	3	gallery	2025-07-14 16:19:43.873736+00	2025-07-14 16:19:43.873736+00	gallerys/bayer/bayer-gallery-2.jpg	\N	image/jpeg	\N
8bc27439-f11c-4ea0-a940-068be70f4d5e	dc18e22c-c280-4463-bd94-8d801169d8c6	/scraped-images/work-projects/bayer/bayer-gallery-3.jpg	bayer gallery 4	\N	4	gallery	2025-07-14 16:19:43.988551+00	2025-07-14 16:19:43.988551+00	gallerys/bayer/bayer-gallery-3.jpg	\N	image/jpeg	\N
ce6665bd-8b78-4d89-a1bf-cc03f1f2bdde	dc18e22c-c280-4463-bd94-8d801169d8c6	/scraped-images/work-projects/bayer/bayer-gallery-4.jpg	bayer gallery 5	\N	5	gallery	2025-07-14 16:19:44.108964+00	2025-07-14 16:19:44.108964+00	gallerys/bayer/bayer-gallery-4.jpg	\N	image/jpeg	\N
51b5890e-7340-4472-a3e0-bcd2b1ad0e1d	dc18e22c-c280-4463-bd94-8d801169d8c6	/scraped-images/work-projects/bayer/bayer-gallery-5.jpg	bayer gallery 6	\N	6	gallery	2025-07-14 16:19:44.228886+00	2025-07-14 16:19:44.228886+00	gallerys/bayer/bayer-gallery-5.jpg	\N	image/jpeg	\N
2ee7c8ea-5e2e-458d-8a8b-508e8e44ddfc	dc18e22c-c280-4463-bd94-8d801169d8c6	/scraped-images/work-projects/bayer/bayer-gallery-6.jpg	bayer gallery 7	\N	7	gallery	2025-07-14 16:19:44.35387+00	2025-07-14 16:19:44.35387+00	gallerys/bayer/bayer-gallery-6.jpg	\N	image/jpeg	\N
4312bdb3-f2a6-4c43-b61f-87a2b9d44fa4	dc18e22c-c280-4463-bd94-8d801169d8c6	/scraped-images/work-projects/bayer/bayer-gallery-7.jpg	bayer gallery 8	\N	8	gallery	2025-07-14 16:19:44.47536+00	2025-07-14 16:19:44.47536+00	gallerys/bayer/bayer-gallery-7.jpg	\N	image/jpeg	\N
ee2fb0e4-2773-4f13-b979-f9c1d9dd4a8a	dc18e22c-c280-4463-bd94-8d801169d8c6	/scraped-images/work-projects/bayer/bayer-gallery-8.jpg	bayer gallery 9	\N	9	gallery	2025-07-14 16:19:44.597133+00	2025-07-14 16:19:44.597133+00	gallerys/bayer/bayer-gallery-8.jpg	\N	image/jpeg	\N
f336790f-34de-47b1-97fb-b39bb223dc5c	58e1ece2-dd8d-4c30-9f22-5d61a88636df	/scraped-images/work-projects/bosch/bosch-banner.jpg	bosch banner 1	\N	1	banner	2025-07-14 16:19:44.728023+00	2025-07-14 16:19:44.728023+00	banners/bosch/bosch-banner.jpg	\N	image/jpeg	\N
074bfc58-ba10-4538-8f62-9824dfddb470	58e1ece2-dd8d-4c30-9f22-5d61a88636df	/scraped-images/work-projects/bosch/bosch-gallery-1.jpg	bosch gallery 2	\N	2	gallery	2025-07-14 16:19:44.857298+00	2025-07-14 16:19:44.857298+00	gallerys/bosch/bosch-gallery-1.jpg	\N	image/jpeg	\N
0f7b1937-04e6-4054-be79-d9f8b3b028f0	58e1ece2-dd8d-4c30-9f22-5d61a88636df	/scraped-images/work-projects/bosch/bosch-gallery-2.jpg	bosch gallery 3	\N	3	gallery	2025-07-14 16:19:44.968221+00	2025-07-14 16:19:44.968221+00	gallerys/bosch/bosch-gallery-2.jpg	\N	image/jpeg	\N
5eb24abc-af3f-411d-b757-cf686260efc1	58e1ece2-dd8d-4c30-9f22-5d61a88636df	/scraped-images/work-projects/bosch/bosch-gallery-3.jpg	bosch gallery 4	\N	4	gallery	2025-07-14 16:19:45.091148+00	2025-07-14 16:19:45.091148+00	gallerys/bosch/bosch-gallery-3.jpg	\N	image/jpeg	\N
c6106b6e-a5a2-4945-81d6-620bb0c42ea4	58e1ece2-dd8d-4c30-9f22-5d61a88636df	/scraped-images/work-projects/bosch/bosch-gallery-4.jpg	bosch gallery 5	\N	5	gallery	2025-07-14 16:19:45.209879+00	2025-07-14 16:19:45.209879+00	gallerys/bosch/bosch-gallery-4.jpg	\N	image/jpeg	\N
9aadd0c8-6c8b-460e-8ed4-72bc3942d4ff	58e1ece2-dd8d-4c30-9f22-5d61a88636df	/scraped-images/work-projects/bosch/bosch-gallery-5.jpg	bosch gallery 6	\N	6	gallery	2025-07-14 16:19:45.322737+00	2025-07-14 16:19:45.322737+00	gallerys/bosch/bosch-gallery-5.jpg	\N	image/jpeg	\N
1ddd1292-d943-4d20-b735-2458e28b0a54	58e1ece2-dd8d-4c30-9f22-5d61a88636df	/scraped-images/work-projects/bosch/bosch-gallery-6.jpg	bosch gallery 7	\N	7	gallery	2025-07-14 16:19:45.45951+00	2025-07-14 16:19:45.45951+00	gallerys/bosch/bosch-gallery-6.jpg	\N	image/jpeg	\N
10d51ef5-576d-4d7c-9d69-84163e3961b7	58e1ece2-dd8d-4c30-9f22-5d61a88636df	/scraped-images/work-projects/bosch/bosch-gallery-7.jpg	bosch gallery 8	\N	8	gallery	2025-07-14 16:19:45.578274+00	2025-07-14 16:19:45.578274+00	gallerys/bosch/bosch-gallery-7.jpg	\N	image/jpeg	\N
ab3c928f-ba75-4a7f-b7ad-683316b85738	58e1ece2-dd8d-4c30-9f22-5d61a88636df	/scraped-images/work-projects/bosch/bosch-gallery-8.jpg	bosch gallery 9	\N	9	gallery	2025-07-14 16:19:45.697591+00	2025-07-14 16:19:45.697591+00	gallerys/bosch/bosch-gallery-8.jpg	\N	image/jpeg	\N
36286529-d836-425d-86c5-4bfdb4029aec	0d596f5c-54cb-4566-bcfc-cc0bbf301607	/scraped-images/work-projects/cbre/cbre-banner.jpg	cbre banner 1	\N	1	banner	2025-07-14 16:19:45.819596+00	2025-07-14 16:19:45.819596+00	banners/cbre/cbre-banner.jpg	\N	image/jpeg	\N
3935512d-b95e-47bd-ab9c-c8d843ad1e77	0d596f5c-54cb-4566-bcfc-cc0bbf301607	/scraped-images/work-projects/cbre/cbre-gallery-1.jpg	cbre gallery 2	\N	2	gallery	2025-07-14 16:19:45.950942+00	2025-07-14 16:19:45.950942+00	gallerys/cbre/cbre-gallery-1.jpg	\N	image/jpeg	\N
ab7f03f3-ab7a-4e07-b7a7-54a8f680936e	0d596f5c-54cb-4566-bcfc-cc0bbf301607	/scraped-images/work-projects/cbre/cbre-gallery-2.jpg	cbre gallery 3	\N	3	gallery	2025-07-14 16:19:46.071231+00	2025-07-14 16:19:46.071231+00	gallerys/cbre/cbre-gallery-2.jpg	\N	image/jpeg	\N
9c106a49-0670-4211-b4e3-caf5d2b0cd34	0d596f5c-54cb-4566-bcfc-cc0bbf301607	/scraped-images/work-projects/cbre/cbre-gallery-3.jpg	cbre gallery 4	\N	4	gallery	2025-07-14 16:19:46.17586+00	2025-07-14 16:19:46.17586+00	gallerys/cbre/cbre-gallery-3.jpg	\N	image/jpeg	\N
0baaa692-5981-4b3d-bb8a-0d689200f3b9	0d596f5c-54cb-4566-bcfc-cc0bbf301607	/scraped-images/work-projects/cbre/cbre-gallery-4.jpg	cbre gallery 5	\N	5	gallery	2025-07-14 16:19:46.292129+00	2025-07-14 16:19:46.292129+00	gallerys/cbre/cbre-gallery-4.jpg	\N	image/jpeg	\N
17927187-15e8-4af0-aac1-6e0c4e5ee7d4	0d596f5c-54cb-4566-bcfc-cc0bbf301607	/scraped-images/work-projects/cbre/cbre-gallery-5.jpg	cbre gallery 6	\N	6	gallery	2025-07-14 16:19:46.399929+00	2025-07-14 16:19:46.399929+00	gallerys/cbre/cbre-gallery-5.jpg	\N	image/jpeg	\N
dd5ce798-877a-4a98-93a4-de78411b309f	0d596f5c-54cb-4566-bcfc-cc0bbf301607	/scraped-images/work-projects/cbre/cbre-gallery-6.jpg	cbre gallery 7	\N	7	gallery	2025-07-14 16:19:46.512323+00	2025-07-14 16:19:46.512323+00	gallerys/cbre/cbre-gallery-6.jpg	\N	image/jpeg	\N
37587b87-2d0b-4d20-bc41-f10829d3f331	0d596f5c-54cb-4566-bcfc-cc0bbf301607	/scraped-images/work-projects/cbre/cbre-gallery-7.jpg	cbre gallery 8	\N	8	gallery	2025-07-14 16:19:46.626484+00	2025-07-14 16:19:46.626484+00	gallerys/cbre/cbre-gallery-7.jpg	\N	image/jpeg	\N
b35c701d-cc3b-4cdb-a149-42c6d4721527	82d8b5c2-272e-412f-9c9b-612032fa8f83	/scraped-images/work-projects/dassaultsystemes/dassaultsystemes-banner.jpg	dassaultsystemes banner 1	\N	1	banner	2025-07-14 16:19:46.741542+00	2025-07-14 16:19:46.741542+00	banners/dassaultsystemes/dassaultsystemes-banner.jpg	\N	image/jpeg	\N
91303812-8147-4587-91b9-3bc63eafb8be	82d8b5c2-272e-412f-9c9b-612032fa8f83	/scraped-images/work-projects/dassaultsystemes/dassaultsystemes-gallery-1.jpg	dassaultsystemes gallery 2	\N	2	gallery	2025-07-14 16:19:46.853064+00	2025-07-14 16:19:46.853064+00	gallerys/dassaultsystemes/dassaultsystemes-gallery-1.jpg	\N	image/jpeg	\N
ad77ae4b-7f54-4182-b270-7bb11cefb883	82d8b5c2-272e-412f-9c9b-612032fa8f83	/scraped-images/work-projects/dassaultsystemes/dassaultsystemes-gallery-2.jpg	dassaultsystemes gallery 3	\N	3	gallery	2025-07-14 16:19:46.966738+00	2025-07-14 16:19:46.966738+00	gallerys/dassaultsystemes/dassaultsystemes-gallery-2.jpg	\N	image/jpeg	\N
6ca19e34-fba4-4883-8020-f3edef29881b	82d8b5c2-272e-412f-9c9b-612032fa8f83	/scraped-images/work-projects/dassaultsystemes/dassaultsystemes-gallery-3.jpg	dassaultsystemes gallery 4	\N	4	gallery	2025-07-14 16:19:47.089837+00	2025-07-14 16:19:47.089837+00	gallerys/dassaultsystemes/dassaultsystemes-gallery-3.jpg	\N	image/jpeg	\N
b24bdb13-b5e0-4f56-845d-ebb3cacf876e	82d8b5c2-272e-412f-9c9b-612032fa8f83	/scraped-images/work-projects/dassaultsystemes/dassaultsystemes-gallery-4.jpg	dassaultsystemes gallery 5	\N	5	gallery	2025-07-14 16:19:47.220716+00	2025-07-14 16:19:47.220716+00	gallerys/dassaultsystemes/dassaultsystemes-gallery-4.jpg	\N	image/jpeg	\N
1d3390f4-8f8a-43dd-bf98-c246fa11c426	da1bc1cc-e6b6-40bd-b80b-70892a70ce1c	/scraped-images/work-projects/emerson/emerson-banner.jpg	emerson banner 1	\N	1	banner	2025-07-14 16:19:47.325877+00	2025-07-14 16:19:47.325877+00	banners/emerson/emerson-banner.jpg	\N	image/jpeg	\N
420cec6d-05ee-4dff-8e65-582caa91c7cf	da1bc1cc-e6b6-40bd-b80b-70892a70ce1c	/scraped-images/work-projects/emerson/emerson-gallery-1.jpg	emerson gallery 2	\N	2	gallery	2025-07-14 16:19:47.445608+00	2025-07-14 16:19:47.445608+00	gallerys/emerson/emerson-gallery-1.jpg	\N	image/jpeg	\N
0ca66265-807d-4b03-b500-2d5c6ffb05ef	da1bc1cc-e6b6-40bd-b80b-70892a70ce1c	/scraped-images/work-projects/emerson/emerson-gallery-2.jpg	emerson gallery 3	\N	3	gallery	2025-07-14 16:19:47.554179+00	2025-07-14 16:19:47.554179+00	gallerys/emerson/emerson-gallery-2.jpg	\N	image/jpeg	\N
acf5430b-6252-4a24-b91d-dc52f09dffe3	da1bc1cc-e6b6-40bd-b80b-70892a70ce1c	/scraped-images/work-projects/emerson/emerson-gallery-3.jpg	emerson gallery 4	\N	4	gallery	2025-07-14 16:19:47.663444+00	2025-07-14 16:19:47.663444+00	gallerys/emerson/emerson-gallery-3.jpg	\N	image/jpeg	\N
858ea599-80b0-406e-86d3-91155c65c2cd	da1bc1cc-e6b6-40bd-b80b-70892a70ce1c	/scraped-images/work-projects/emerson/emerson-gallery-4.jpg	emerson gallery 5	\N	5	gallery	2025-07-14 16:19:47.7708+00	2025-07-14 16:19:47.7708+00	gallerys/emerson/emerson-gallery-4.jpg	\N	image/jpeg	\N
6ca5cc2d-2409-4cbb-9199-1ed6bfdcc398	b4f11f94-eb64-4fed-a2a2-7ca0a0e80b98	/scraped-images/work-projects/globalconsultinggiant/globalconsultinggiant-banner.jpg	globalconsultinggiant banner 1	\N	1	banner	2025-07-14 16:19:47.893744+00	2025-07-14 16:19:47.893744+00	banners/globalconsultinggiant/globalconsultinggiant-banner.jpg	\N	image/jpeg	\N
1a32f36a-1f6e-419a-ba86-1ee1fee51bd7	b4f11f94-eb64-4fed-a2a2-7ca0a0e80b98	/scraped-images/work-projects/globalconsultinggiant/globalconsultinggiant-gallery-1.jpg	globalconsultinggiant gallery 2	\N	2	gallery	2025-07-14 16:19:47.998942+00	2025-07-14 16:19:47.998942+00	gallerys/globalconsultinggiant/globalconsultinggiant-gallery-1.jpg	\N	image/jpeg	\N
f5474b0d-c65f-47a8-bb5c-39278bfec69d	b4f11f94-eb64-4fed-a2a2-7ca0a0e80b98	/scraped-images/work-projects/globalconsultinggiant/globalconsultinggiant-gallery-10.jpg	globalconsultinggiant gallery 3	\N	3	gallery	2025-07-14 16:19:48.112826+00	2025-07-14 16:19:48.112826+00	gallerys/globalconsultinggiant/globalconsultinggiant-gallery-10.jpg	\N	image/jpeg	\N
fea8cd49-7c8e-4f6b-a3a7-9218409bf758	b4f11f94-eb64-4fed-a2a2-7ca0a0e80b98	/scraped-images/work-projects/globalconsultinggiant/globalconsultinggiant-gallery-2.jpg	globalconsultinggiant gallery 4	\N	4	gallery	2025-07-14 16:19:48.223996+00	2025-07-14 16:19:48.223996+00	gallerys/globalconsultinggiant/globalconsultinggiant-gallery-2.jpg	\N	image/jpeg	\N
bd3ce35d-8e15-4716-b0be-95c371b29bdb	b4f11f94-eb64-4fed-a2a2-7ca0a0e80b98	/scraped-images/work-projects/globalconsultinggiant/globalconsultinggiant-gallery-3.jpg	globalconsultinggiant gallery 5	\N	5	gallery	2025-07-14 16:19:48.330379+00	2025-07-14 16:19:48.330379+00	gallerys/globalconsultinggiant/globalconsultinggiant-gallery-3.jpg	\N	image/jpeg	\N
988b8be5-3247-4247-a756-c86bdd336100	b4f11f94-eb64-4fed-a2a2-7ca0a0e80b98	/scraped-images/work-projects/globalconsultinggiant/globalconsultinggiant-gallery-4.jpg	globalconsultinggiant gallery 6	\N	6	gallery	2025-07-14 16:19:48.436767+00	2025-07-14 16:19:48.436767+00	gallerys/globalconsultinggiant/globalconsultinggiant-gallery-4.jpg	\N	image/jpeg	\N
71f4cf7e-cbc0-47c5-b444-840154599739	b4f11f94-eb64-4fed-a2a2-7ca0a0e80b98	/scraped-images/work-projects/globalconsultinggiant/globalconsultinggiant-gallery-5.jpg	globalconsultinggiant gallery 7	\N	7	gallery	2025-07-14 16:19:48.547613+00	2025-07-14 16:19:48.547613+00	gallerys/globalconsultinggiant/globalconsultinggiant-gallery-5.jpg	\N	image/jpeg	\N
177c96e3-541b-4b37-892c-913df6c38ce1	b4f11f94-eb64-4fed-a2a2-7ca0a0e80b98	/scraped-images/work-projects/globalconsultinggiant/globalconsultinggiant-gallery-6.jpg	globalconsultinggiant gallery 8	\N	8	gallery	2025-07-14 16:19:48.667183+00	2025-07-14 16:19:48.667183+00	gallerys/globalconsultinggiant/globalconsultinggiant-gallery-6.jpg	\N	image/jpeg	\N
c83ebd07-c060-492d-b950-dc001039db12	b4f11f94-eb64-4fed-a2a2-7ca0a0e80b98	/scraped-images/work-projects/globalconsultinggiant/globalconsultinggiant-gallery-7.jpg	globalconsultinggiant gallery 9	\N	9	gallery	2025-07-14 16:19:48.79429+00	2025-07-14 16:19:48.79429+00	gallerys/globalconsultinggiant/globalconsultinggiant-gallery-7.jpg	\N	image/jpeg	\N
7853e25c-5ff6-43b8-b8d3-6b8ea2b18cf2	b4f11f94-eb64-4fed-a2a2-7ca0a0e80b98	/scraped-images/work-projects/globalconsultinggiant/globalconsultinggiant-gallery-8.jpg	globalconsultinggiant gallery 10	\N	10	gallery	2025-07-14 16:19:48.90035+00	2025-07-14 16:19:48.90035+00	gallerys/globalconsultinggiant/globalconsultinggiant-gallery-8.jpg	\N	image/jpeg	\N
5c22723a-c6aa-4bc4-a2eb-7a365f490cbf	b4f11f94-eb64-4fed-a2a2-7ca0a0e80b98	/scraped-images/work-projects/globalconsultinggiant/globalconsultinggiant-gallery-9.jpg	globalconsultinggiant gallery 11	\N	11	gallery	2025-07-14 16:19:49.023034+00	2025-07-14 16:19:49.023034+00	gallerys/globalconsultinggiant/globalconsultinggiant-gallery-9.jpg	\N	image/jpeg	\N
c7575238-3b3b-4358-a7f4-c7b41954ecb5	b584c226-9ff8-4a14-ace7-3ef25edd4ebd	/scraped-images/work-projects/goodpack/goodpack-banner.jpg	goodpack banner 1	\N	1	banner	2025-07-14 16:19:49.148237+00	2025-07-14 16:19:49.148237+00	banners/goodpack/goodpack-banner.jpg	\N	image/jpeg	\N
799474fb-2e3b-4a9d-be09-cc35a70a88ed	b584c226-9ff8-4a14-ace7-3ef25edd4ebd	/scraped-images/work-projects/goodpack/goodpack-gallery-1.jpg	goodpack gallery 2	\N	2	gallery	2025-07-14 16:19:49.267851+00	2025-07-14 16:19:49.267851+00	gallerys/goodpack/goodpack-gallery-1.jpg	\N	image/jpeg	\N
c20ddfbb-ac06-4d1a-a0ad-708fad652586	b584c226-9ff8-4a14-ace7-3ef25edd4ebd	/scraped-images/work-projects/goodpack/goodpack-gallery-2.jpg	goodpack gallery 3	\N	3	gallery	2025-07-14 16:19:49.393561+00	2025-07-14 16:19:49.393561+00	gallerys/goodpack/goodpack-gallery-2.jpg	\N	image/jpeg	\N
7a0eed89-c5c7-40ed-9dc2-ef5ec7b692e6	b584c226-9ff8-4a14-ace7-3ef25edd4ebd	/scraped-images/work-projects/goodpack/goodpack-gallery-3.jpg	goodpack gallery 4	\N	4	gallery	2025-07-14 16:19:49.528743+00	2025-07-14 16:19:49.528743+00	gallerys/goodpack/goodpack-gallery-3.jpg	\N	image/jpeg	\N
529f6eca-d815-4a91-b453-b5c039cec248	b584c226-9ff8-4a14-ace7-3ef25edd4ebd	/scraped-images/work-projects/goodpack/goodpack-gallery-4.jpg	goodpack gallery 5	\N	5	gallery	2025-07-14 16:19:49.644417+00	2025-07-14 16:19:49.644417+00	gallerys/goodpack/goodpack-gallery-4.jpg	\N	image/jpeg	\N
f26cb555-47c9-41fe-8ead-822e2008f49d	b584c226-9ff8-4a14-ace7-3ef25edd4ebd	/scraped-images/work-projects/goodpack/goodpack-gallery-5.jpg	goodpack gallery 6	\N	6	gallery	2025-07-14 16:19:49.757113+00	2025-07-14 16:19:49.757113+00	gallerys/goodpack/goodpack-gallery-5.jpg	\N	image/jpeg	\N
b957c910-3820-4f90-9fdf-383b8dd588ac	b584c226-9ff8-4a14-ace7-3ef25edd4ebd	/scraped-images/work-projects/goodpack/goodpack-gallery-6.jpg	goodpack gallery 7	\N	7	gallery	2025-07-14 16:19:49.880954+00	2025-07-14 16:19:49.880954+00	gallerys/goodpack/goodpack-gallery-6.jpg	\N	image/jpeg	\N
e9355c31-e886-4b31-82d7-a568bda0da1a	b584c226-9ff8-4a14-ace7-3ef25edd4ebd	/scraped-images/work-projects/goodpack/goodpack-gallery-7.jpg	goodpack gallery 8	\N	8	gallery	2025-07-14 16:19:50.00113+00	2025-07-14 16:19:50.00113+00	gallerys/goodpack/goodpack-gallery-7.jpg	\N	image/jpeg	\N
a8a47434-fba4-45bc-821a-b02953cce91d	b3de5b44-4ff7-434e-bfd3-c5c2dbf554fb	/scraped-images/work-projects/hansimgluck/hansimgluck-banner.jpg	hansimgluck banner 1	\N	1	banner	2025-07-14 16:19:50.109733+00	2025-07-14 16:19:50.109733+00	banners/hansimgluck/hansimgluck-banner.jpg	\N	image/jpeg	\N
a9faa369-4c9d-4e96-bc97-32f7339c3b66	b3de5b44-4ff7-434e-bfd3-c5c2dbf554fb	/scraped-images/work-projects/hansimgluck/hansimgluck-gallery-1.jpg	hansimgluck gallery 2	\N	2	gallery	2025-07-14 16:19:50.230722+00	2025-07-14 16:19:50.230722+00	gallerys/hansimgluck/hansimgluck-gallery-1.jpg	\N	image/jpeg	\N
daefba26-4fa5-40f4-95c6-ea7668845cbe	b3de5b44-4ff7-434e-bfd3-c5c2dbf554fb	/scraped-images/work-projects/hansimgluck/hansimgluck-gallery-2.jpg	hansimgluck gallery 3	\N	3	gallery	2025-07-14 16:19:50.357279+00	2025-07-14 16:19:50.357279+00	gallerys/hansimgluck/hansimgluck-gallery-2.jpg	\N	image/jpeg	\N
5d984bbe-636a-49cd-bb65-a81b2684dd3d	b3de5b44-4ff7-434e-bfd3-c5c2dbf554fb	/scraped-images/work-projects/hansimgluck/hansimgluck-gallery-3.jpg	hansimgluck gallery 4	\N	4	gallery	2025-07-14 16:19:50.480877+00	2025-07-14 16:19:50.480877+00	gallerys/hansimgluck/hansimgluck-gallery-3.jpg	\N	image/jpeg	\N
4a9e289e-ee9f-4d18-a0a6-bd5daf117812	b3de5b44-4ff7-434e-bfd3-c5c2dbf554fb	/scraped-images/work-projects/hansimgluck/hansimgluck-gallery-4.jpg	hansimgluck gallery 5	\N	5	gallery	2025-07-14 16:19:50.592448+00	2025-07-14 16:19:50.592448+00	gallerys/hansimgluck/hansimgluck-gallery-4.jpg	\N	image/jpeg	\N
2cd66d04-29e1-4576-af28-02a4d593f96a	2d4ee1b7-c3cc-4dec-bfdb-3688d642fd4e	/scraped-images/work-projects/heineken/heineken-banner.jpg	heineken banner 1	\N	1	banner	2025-07-14 16:19:50.699476+00	2025-07-14 16:19:50.699476+00	banners/heineken/heineken-banner.jpg	\N	image/jpeg	\N
04c33cd2-7c72-45ec-8c38-20ffa88f9967	2d4ee1b7-c3cc-4dec-bfdb-3688d642fd4e	/scraped-images/work-projects/heineken/heineken-gallery-1.jpg	heineken gallery 2	\N	2	gallery	2025-07-14 16:19:50.817758+00	2025-07-14 16:19:50.817758+00	gallerys/heineken/heineken-gallery-1.jpg	\N	image/jpeg	\N
9f2e3cea-d5d9-423b-bee9-0637046fcb68	2d4ee1b7-c3cc-4dec-bfdb-3688d642fd4e	/scraped-images/work-projects/heineken/heineken-gallery-2.jpg	heineken gallery 3	\N	3	gallery	2025-07-14 16:19:50.930251+00	2025-07-14 16:19:50.930251+00	gallerys/heineken/heineken-gallery-2.jpg	\N	image/jpeg	\N
28aa52c0-f9e9-4c7e-9071-456a29c7fff4	2d4ee1b7-c3cc-4dec-bfdb-3688d642fd4e	/scraped-images/work-projects/heineken/heineken-gallery-3.jpg	heineken gallery 4	\N	4	gallery	2025-07-14 16:19:51.040212+00	2025-07-14 16:19:51.040212+00	gallerys/heineken/heineken-gallery-3.jpg	\N	image/jpeg	\N
62981bcd-6d8b-4540-b2d2-92d72d918023	2d4ee1b7-c3cc-4dec-bfdb-3688d642fd4e	/scraped-images/work-projects/heineken/heineken-gallery-4.jpg	heineken gallery 5	\N	5	gallery	2025-07-14 16:19:51.151281+00	2025-07-14 16:19:51.151281+00	gallerys/heineken/heineken-gallery-4.jpg	\N	image/jpeg	\N
e849f903-8352-416b-b5d7-5338e50ad144	2d4ee1b7-c3cc-4dec-bfdb-3688d642fd4e	/scraped-images/work-projects/heineken/heineken-gallery-5.jpg	heineken gallery 6	\N	6	gallery	2025-07-14 16:19:51.263585+00	2025-07-14 16:19:51.263585+00	gallerys/heineken/heineken-gallery-5.jpg	\N	image/jpeg	\N
135340bf-16ab-4dfa-9e54-157465482ecc	e23191c5-e55a-4375-a0b0-3f450f2a1c39	/scraped-images/work-projects/homeaway/homeaway-banner.jpg	homeaway banner 1	\N	1	banner	2025-07-14 16:19:51.372762+00	2025-07-14 16:19:51.372762+00	banners/homeaway/homeaway-banner.jpg	\N	image/jpeg	\N
6d6170b7-8401-4284-b7e1-07675cf60039	e23191c5-e55a-4375-a0b0-3f450f2a1c39	/scraped-images/work-projects/homeaway/homeaway-gallery-1.jpg	homeaway gallery 2	\N	2	gallery	2025-07-14 16:19:51.48944+00	2025-07-14 16:19:51.48944+00	gallerys/homeaway/homeaway-gallery-1.jpg	\N	image/jpeg	\N
782ba705-7521-48b5-a062-50dfa1ec5ebe	e23191c5-e55a-4375-a0b0-3f450f2a1c39	/scraped-images/work-projects/homeaway/homeaway-gallery-10.jpg	homeaway gallery 3	\N	3	gallery	2025-07-14 16:19:51.596347+00	2025-07-14 16:19:51.596347+00	gallerys/homeaway/homeaway-gallery-10.jpg	\N	image/jpeg	\N
2365027b-2d18-4e39-bba3-34d845b2138c	e23191c5-e55a-4375-a0b0-3f450f2a1c39	/scraped-images/work-projects/homeaway/homeaway-gallery-2.jpg	homeaway gallery 4	\N	4	gallery	2025-07-14 16:19:51.708787+00	2025-07-14 16:19:51.708787+00	gallerys/homeaway/homeaway-gallery-2.jpg	\N	image/jpeg	\N
17c1161c-223a-4591-85b1-f9d2efd20798	e23191c5-e55a-4375-a0b0-3f450f2a1c39	/scraped-images/work-projects/homeaway/homeaway-gallery-3.jpg	homeaway gallery 5	\N	5	gallery	2025-07-14 16:19:51.824102+00	2025-07-14 16:19:51.824102+00	gallerys/homeaway/homeaway-gallery-3.jpg	\N	image/jpeg	\N
4ab2934d-138a-499c-9b6b-a06eb7b1a77b	e23191c5-e55a-4375-a0b0-3f450f2a1c39	/scraped-images/work-projects/homeaway/homeaway-gallery-4.jpg	homeaway gallery 6	\N	6	gallery	2025-07-14 16:19:51.937514+00	2025-07-14 16:19:51.937514+00	gallerys/homeaway/homeaway-gallery-4.jpg	\N	image/jpeg	\N
7c733abb-66d7-4d5b-a7ef-93253d885507	e23191c5-e55a-4375-a0b0-3f450f2a1c39	/scraped-images/work-projects/homeaway/homeaway-gallery-5.jpg	homeaway gallery 7	\N	7	gallery	2025-07-14 16:19:52.047903+00	2025-07-14 16:19:52.047903+00	gallerys/homeaway/homeaway-gallery-5.jpg	\N	image/jpeg	\N
21d0ddc0-2125-4121-bfde-f1fa280f17ec	e23191c5-e55a-4375-a0b0-3f450f2a1c39	/scraped-images/work-projects/homeaway/homeaway-gallery-6.jpg	homeaway gallery 8	\N	8	gallery	2025-07-14 16:19:52.158288+00	2025-07-14 16:19:52.158288+00	gallerys/homeaway/homeaway-gallery-6.jpg	\N	image/jpeg	\N
f84815bd-46f3-4699-b8bf-5c019f2b9d8a	e23191c5-e55a-4375-a0b0-3f450f2a1c39	/scraped-images/work-projects/homeaway/homeaway-gallery-7.jpg	homeaway gallery 9	\N	9	gallery	2025-07-14 16:19:52.267145+00	2025-07-14 16:19:52.267145+00	gallerys/homeaway/homeaway-gallery-7.jpg	\N	image/jpeg	\N
2062b7c5-c185-49b6-b764-813162d2c86f	e23191c5-e55a-4375-a0b0-3f450f2a1c39	/scraped-images/work-projects/homeaway/homeaway-gallery-8.jpg	homeaway gallery 10	\N	10	gallery	2025-07-14 16:19:52.371818+00	2025-07-14 16:19:52.371818+00	gallerys/homeaway/homeaway-gallery-8.jpg	\N	image/jpeg	\N
87b09565-6771-40f7-aea9-624472ab4e60	e23191c5-e55a-4375-a0b0-3f450f2a1c39	/scraped-images/work-projects/homeaway/homeaway-gallery-9.jpg	homeaway gallery 11	\N	11	gallery	2025-07-14 16:19:52.479665+00	2025-07-14 16:19:52.479665+00	gallerys/homeaway/homeaway-gallery-9.jpg	\N	image/jpeg	\N
aa69c85c-d4c3-4f08-8099-fc4bdc0fac69	11a498ca-31aa-4e0a-971a-ca5a2e12c3d5	/scraped-images/work-projects/hongkongmanagement/hongkongmanagement-banner.jpg	hongkongmanagement banner 1	\N	1	banner	2025-07-14 16:19:52.59197+00	2025-07-14 16:19:52.59197+00	banners/hongkongmanagement/hongkongmanagement-banner.jpg	\N	image/jpeg	\N
ae6b83c1-9498-48d5-9092-9afd4ac8d0fe	11a498ca-31aa-4e0a-971a-ca5a2e12c3d5	/scraped-images/work-projects/hongkongmanagement/hongkongmanagement-gallery-1.jpg	hongkongmanagement gallery 2	\N	2	gallery	2025-07-14 16:19:52.697803+00	2025-07-14 16:19:52.697803+00	gallerys/hongkongmanagement/hongkongmanagement-gallery-1.jpg	\N	image/jpeg	\N
3003b323-5f1e-44e4-999c-25f9d9a39eb9	11a498ca-31aa-4e0a-971a-ca5a2e12c3d5	/scraped-images/work-projects/hongkongmanagement/hongkongmanagement-gallery-10.jpg	hongkongmanagement gallery 3	\N	3	gallery	2025-07-14 16:19:52.818435+00	2025-07-14 16:19:52.818435+00	gallerys/hongkongmanagement/hongkongmanagement-gallery-10.jpg	\N	image/jpeg	\N
fa511cda-682b-4711-b7a6-619d674995b9	11a498ca-31aa-4e0a-971a-ca5a2e12c3d5	/scraped-images/work-projects/hongkongmanagement/hongkongmanagement-gallery-2.jpg	hongkongmanagement gallery 4	\N	4	gallery	2025-07-14 16:19:52.928582+00	2025-07-14 16:19:52.928582+00	gallerys/hongkongmanagement/hongkongmanagement-gallery-2.jpg	\N	image/jpeg	\N
095a331b-52b0-42f2-8807-93609ba8614c	11a498ca-31aa-4e0a-971a-ca5a2e12c3d5	/scraped-images/work-projects/hongkongmanagement/hongkongmanagement-gallery-3.jpg	hongkongmanagement gallery 5	\N	5	gallery	2025-07-14 16:19:53.038554+00	2025-07-14 16:19:53.038554+00	gallerys/hongkongmanagement/hongkongmanagement-gallery-3.jpg	\N	image/jpeg	\N
4b92cb52-6e58-4a3d-a42e-725e3617ef67	11a498ca-31aa-4e0a-971a-ca5a2e12c3d5	/scraped-images/work-projects/hongkongmanagement/hongkongmanagement-gallery-4.jpg	hongkongmanagement gallery 6	\N	6	gallery	2025-07-14 16:19:53.151404+00	2025-07-14 16:19:53.151404+00	gallerys/hongkongmanagement/hongkongmanagement-gallery-4.jpg	\N	image/jpeg	\N
2b61b2ab-543c-4a2c-8f69-52a6f08bbdb0	11a498ca-31aa-4e0a-971a-ca5a2e12c3d5	/scraped-images/work-projects/hongkongmanagement/hongkongmanagement-gallery-5.jpg	hongkongmanagement gallery 7	\N	7	gallery	2025-07-14 16:19:53.276774+00	2025-07-14 16:19:53.276774+00	gallerys/hongkongmanagement/hongkongmanagement-gallery-5.jpg	\N	image/jpeg	\N
38884ef1-6df5-41a0-83df-b7afd3fafe91	11a498ca-31aa-4e0a-971a-ca5a2e12c3d5	/scraped-images/work-projects/hongkongmanagement/hongkongmanagement-gallery-6.jpg	hongkongmanagement gallery 8	\N	8	gallery	2025-07-14 16:19:53.387495+00	2025-07-14 16:19:53.387495+00	gallerys/hongkongmanagement/hongkongmanagement-gallery-6.jpg	\N	image/jpeg	\N
81cc18ee-0408-4ecc-b47c-508641ad3c11	11a498ca-31aa-4e0a-971a-ca5a2e12c3d5	/scraped-images/work-projects/hongkongmanagement/hongkongmanagement-gallery-7.jpg	hongkongmanagement gallery 9	\N	9	gallery	2025-07-14 16:19:53.498494+00	2025-07-14 16:19:53.498494+00	gallerys/hongkongmanagement/hongkongmanagement-gallery-7.jpg	\N	image/jpeg	\N
0eccab9e-21a7-4221-a503-e9e5c50b7d12	11a498ca-31aa-4e0a-971a-ca5a2e12c3d5	/scraped-images/work-projects/hongkongmanagement/hongkongmanagement-gallery-8.jpg	hongkongmanagement gallery 10	\N	10	gallery	2025-07-14 16:19:53.614489+00	2025-07-14 16:19:53.614489+00	gallerys/hongkongmanagement/hongkongmanagement-gallery-8.jpg	\N	image/jpeg	\N
1ead90ec-7aaa-413a-bb60-748e9de7bdd4	11a498ca-31aa-4e0a-971a-ca5a2e12c3d5	/scraped-images/work-projects/hongkongmanagement/hongkongmanagement-gallery-9.jpg	hongkongmanagement gallery 11	\N	11	gallery	2025-07-14 16:19:53.734576+00	2025-07-14 16:19:53.734576+00	gallerys/hongkongmanagement/hongkongmanagement-gallery-9.jpg	\N	image/jpeg	\N
ca1cda90-3df4-4ce8-86f7-9ca5c156de64	ed511fab-cf1b-4464-96b8-b724c1c6ee09	/scraped-images/work-projects/ihh/ihh-banner.jpg	ihh banner 1	\N	1	banner	2025-07-14 16:19:53.849164+00	2025-07-14 16:19:53.849164+00	banners/ihh/ihh-banner.jpg	\N	image/jpeg	\N
6bc2e8da-e3d1-469f-bcfa-4aceecbe9bd4	ed511fab-cf1b-4464-96b8-b724c1c6ee09	/scraped-images/work-projects/ihh/ihh-gallery-1.jpg	ihh gallery 2	\N	2	gallery	2025-07-14 16:19:53.963079+00	2025-07-14 16:19:53.963079+00	gallerys/ihh/ihh-gallery-1.jpg	\N	image/jpeg	\N
8d8b8e27-f7d1-463e-939c-3402fcee15b2	ed511fab-cf1b-4464-96b8-b724c1c6ee09	/scraped-images/work-projects/ihh/ihh-gallery-10.jpg	ihh gallery 3	\N	3	gallery	2025-07-14 16:19:54.084675+00	2025-07-14 16:19:54.084675+00	gallerys/ihh/ihh-gallery-10.jpg	\N	image/jpeg	\N
b90f6489-5135-42b6-9374-f63153c149ab	ed511fab-cf1b-4464-96b8-b724c1c6ee09	/scraped-images/work-projects/ihh/ihh-gallery-2.jpg	ihh gallery 4	\N	4	gallery	2025-07-14 16:19:54.195746+00	2025-07-14 16:19:54.195746+00	gallerys/ihh/ihh-gallery-2.jpg	\N	image/jpeg	\N
0c05e638-62e0-4814-930e-93fe2450130a	ed511fab-cf1b-4464-96b8-b724c1c6ee09	/scraped-images/work-projects/ihh/ihh-gallery-3.jpg	ihh gallery 5	\N	5	gallery	2025-07-14 16:19:54.307692+00	2025-07-14 16:19:54.307692+00	gallerys/ihh/ihh-gallery-3.jpg	\N	image/jpeg	\N
5f8b1a18-90f9-4119-9e77-e1478196a7bf	ed511fab-cf1b-4464-96b8-b724c1c6ee09	/scraped-images/work-projects/ihh/ihh-gallery-4.jpg	ihh gallery 6	\N	6	gallery	2025-07-14 16:19:54.41259+00	2025-07-14 16:19:54.41259+00	gallerys/ihh/ihh-gallery-4.jpg	\N	image/jpeg	\N
6b6af7fc-92ba-4a65-9ecb-fa71fee8af0f	ed511fab-cf1b-4464-96b8-b724c1c6ee09	/scraped-images/work-projects/ihh/ihh-gallery-5.jpg	ihh gallery 7	\N	7	gallery	2025-07-14 16:19:54.521517+00	2025-07-14 16:19:54.521517+00	gallerys/ihh/ihh-gallery-5.jpg	\N	image/jpeg	\N
6e20aa77-1d99-4b72-bee8-75674a0c6283	ed511fab-cf1b-4464-96b8-b724c1c6ee09	/scraped-images/work-projects/ihh/ihh-gallery-6.jpg	ihh gallery 8	\N	8	gallery	2025-07-14 16:19:54.62625+00	2025-07-14 16:19:54.62625+00	gallerys/ihh/ihh-gallery-6.jpg	\N	image/jpeg	\N
3b249776-8979-48fb-9a74-f6aa33d62410	ed511fab-cf1b-4464-96b8-b724c1c6ee09	/scraped-images/work-projects/ihh/ihh-gallery-7.jpg	ihh gallery 9	\N	9	gallery	2025-07-14 16:19:54.75159+00	2025-07-14 16:19:54.75159+00	gallerys/ihh/ihh-gallery-7.jpg	\N	image/jpeg	\N
b04a76b7-bea3-4e0a-af2f-c3a42ba4e900	ed511fab-cf1b-4464-96b8-b724c1c6ee09	/scraped-images/work-projects/ihh/ihh-gallery-8.jpg	ihh gallery 10	\N	10	gallery	2025-07-14 16:19:54.859631+00	2025-07-14 16:19:54.859631+00	gallerys/ihh/ihh-gallery-8.jpg	\N	image/jpeg	\N
1f4da510-c95c-42e5-9276-fd6aa0cc6394	ed511fab-cf1b-4464-96b8-b724c1c6ee09	/scraped-images/work-projects/ihh/ihh-gallery-9.jpg	ihh gallery 11	\N	11	gallery	2025-07-14 16:19:55.022316+00	2025-07-14 16:19:55.022316+00	gallerys/ihh/ihh-gallery-9.jpg	\N	image/jpeg	\N
aa649224-4954-4ac7-b8f8-a81fb54cd448	67cab6a0-0748-401d-a468-0c50e31fda4f	/scraped-images/work-projects/internationallawfirm/internationallawfirm-banner.jpg	internationallawfirm banner 1	\N	1	banner	2025-07-14 16:19:55.135904+00	2025-07-14 16:19:55.135904+00	banners/internationallawfirm/internationallawfirm-banner.jpg	\N	image/jpeg	\N
656dc8b5-fbb1-41ca-9819-67575ccd2830	67cab6a0-0748-401d-a468-0c50e31fda4f	/scraped-images/work-projects/internationallawfirm/internationallawfirm-gallery-1.jpg	internationallawfirm gallery 2	\N	2	gallery	2025-07-14 16:19:55.255617+00	2025-07-14 16:19:55.255617+00	gallerys/internationallawfirm/internationallawfirm-gallery-1.jpg	\N	image/jpeg	\N
720bf1e1-03e4-4330-b51f-e1bda2046548	67cab6a0-0748-401d-a468-0c50e31fda4f	/scraped-images/work-projects/internationallawfirm/internationallawfirm-gallery-2.jpg	internationallawfirm gallery 3	\N	3	gallery	2025-07-14 16:19:55.366391+00	2025-07-14 16:19:55.366391+00	gallerys/internationallawfirm/internationallawfirm-gallery-2.jpg	\N	image/jpeg	\N
131fbf45-6c97-4aa7-a3c3-8400823f9d5e	67cab6a0-0748-401d-a468-0c50e31fda4f	/scraped-images/work-projects/internationallawfirm/internationallawfirm-gallery-3.jpg	internationallawfirm gallery 4	\N	4	gallery	2025-07-14 16:19:55.508783+00	2025-07-14 16:19:55.508783+00	gallerys/internationallawfirm/internationallawfirm-gallery-3.jpg	\N	image/jpeg	\N
6bb6eb72-53fe-4c27-810f-5ed0b7443235	67cab6a0-0748-401d-a468-0c50e31fda4f	/scraped-images/work-projects/internationallawfirm/internationallawfirm-gallery-4.jpg	internationallawfirm gallery 5	\N	5	gallery	2025-07-14 16:19:55.617797+00	2025-07-14 16:19:55.617797+00	gallerys/internationallawfirm/internationallawfirm-gallery-4.jpg	\N	image/jpeg	\N
64db941a-552a-4ad5-8403-73387bbbf22d	67cab6a0-0748-401d-a468-0c50e31fda4f	/scraped-images/work-projects/internationallawfirm/internationallawfirm-gallery-5.jpg	internationallawfirm gallery 6	\N	6	gallery	2025-07-14 16:19:55.741163+00	2025-07-14 16:19:55.741163+00	gallerys/internationallawfirm/internationallawfirm-gallery-5.jpg	\N	image/jpeg	\N
ec2662b9-9bb5-4676-8598-bee9a7bb4a4c	67cab6a0-0748-401d-a468-0c50e31fda4f	/scraped-images/work-projects/internationallawfirm/internationallawfirm-gallery-6.jpg	internationallawfirm gallery 7	\N	7	gallery	2025-07-14 16:19:55.853696+00	2025-07-14 16:19:55.853696+00	gallerys/internationallawfirm/internationallawfirm-gallery-6.jpg	\N	image/jpeg	\N
a3e2ec83-7343-4901-97d1-714af8214f47	67cab6a0-0748-401d-a468-0c50e31fda4f	/scraped-images/work-projects/internationallawfirm/internationallawfirm-gallery-7.jpg	internationallawfirm gallery 8	\N	8	gallery	2025-07-14 16:19:55.970989+00	2025-07-14 16:19:55.970989+00	gallerys/internationallawfirm/internationallawfirm-gallery-7.jpg	\N	image/jpeg	\N
c77f7f75-0849-4599-ba3e-2a43c8c41370	67cab6a0-0748-401d-a468-0c50e31fda4f	/scraped-images/work-projects/internationallawfirm/internationallawfirm-gallery-8.jpg	internationallawfirm gallery 9	\N	9	gallery	2025-07-14 16:19:56.090794+00	2025-07-14 16:19:56.090794+00	gallerys/internationallawfirm/internationallawfirm-gallery-8.jpg	\N	image/jpeg	\N
9c8c8d29-3eb6-4da0-bbc0-f37620b6ed6e	67cab6a0-0748-401d-a468-0c50e31fda4f	/scraped-images/work-projects/internationallawfirm/internationallawfirm-gallery-9.jpg	internationallawfirm gallery 10	\N	10	gallery	2025-07-14 16:19:56.20189+00	2025-07-14 16:19:56.20189+00	gallerys/internationallawfirm/internationallawfirm-gallery-9.jpg	\N	image/jpeg	\N
247c9a45-987e-46db-9d4a-ea637722dc3b	8bdb202f-1151-4a04-9271-5b7925061571	/scraped-images/work-projects/iqvia/iqvia-banner.jpg	iqvia banner 1	\N	1	banner	2025-07-14 16:19:56.320628+00	2025-07-14 16:19:56.320628+00	banners/iqvia/iqvia-banner.jpg	\N	image/jpeg	\N
327b4519-68c7-4ce9-aead-511c9a8b0860	8bdb202f-1151-4a04-9271-5b7925061571	/scraped-images/work-projects/iqvia/iqvia-gallery-1.jpg	iqvia gallery 2	\N	2	gallery	2025-07-14 16:19:56.437861+00	2025-07-14 16:19:56.437861+00	gallerys/iqvia/iqvia-gallery-1.jpg	\N	image/jpeg	\N
fdbc5ca9-aecc-4c46-9513-7eace18dc06d	8bdb202f-1151-4a04-9271-5b7925061571	/scraped-images/work-projects/iqvia/iqvia-gallery-10.jpg	iqvia gallery 3	\N	3	gallery	2025-07-14 16:19:56.550031+00	2025-07-14 16:19:56.550031+00	gallerys/iqvia/iqvia-gallery-10.jpg	\N	image/jpeg	\N
6ec31d72-7426-459a-a877-ba99180b0c7f	8bdb202f-1151-4a04-9271-5b7925061571	/scraped-images/work-projects/iqvia/iqvia-gallery-2.jpg	iqvia gallery 4	\N	4	gallery	2025-07-14 16:19:56.669777+00	2025-07-14 16:19:56.669777+00	gallerys/iqvia/iqvia-gallery-2.jpg	\N	image/jpeg	\N
7a86937c-7b1e-4aba-befb-9423d19a3b36	8bdb202f-1151-4a04-9271-5b7925061571	/scraped-images/work-projects/iqvia/iqvia-gallery-3.jpg	iqvia gallery 5	\N	5	gallery	2025-07-14 16:19:56.791875+00	2025-07-14 16:19:56.791875+00	gallerys/iqvia/iqvia-gallery-3.jpg	\N	image/jpeg	\N
80b0dfe7-0349-4b22-a18a-e85eaad16650	8bdb202f-1151-4a04-9271-5b7925061571	/scraped-images/work-projects/iqvia/iqvia-gallery-4.jpg	iqvia gallery 6	\N	6	gallery	2025-07-14 16:19:56.903016+00	2025-07-14 16:19:56.903016+00	gallerys/iqvia/iqvia-gallery-4.jpg	\N	image/jpeg	\N
93054f72-388d-423a-98a6-5b334bf9f24c	8bdb202f-1151-4a04-9271-5b7925061571	/scraped-images/work-projects/iqvia/iqvia-gallery-5.jpg	iqvia gallery 7	\N	7	gallery	2025-07-14 16:19:57.013407+00	2025-07-14 16:19:57.013407+00	gallerys/iqvia/iqvia-gallery-5.jpg	\N	image/jpeg	\N
a3483bad-3bd7-4d46-a0ca-aa905c4c2e15	8bdb202f-1151-4a04-9271-5b7925061571	/scraped-images/work-projects/iqvia/iqvia-gallery-6.jpg	iqvia gallery 8	\N	8	gallery	2025-07-14 16:19:57.126776+00	2025-07-14 16:19:57.126776+00	gallerys/iqvia/iqvia-gallery-6.jpg	\N	image/jpeg	\N
3dd72c98-9e5c-4d76-ab4c-dd752b9aeb6f	8bdb202f-1151-4a04-9271-5b7925061571	/scraped-images/work-projects/iqvia/iqvia-gallery-7.jpg	iqvia gallery 9	\N	9	gallery	2025-07-14 16:19:57.248277+00	2025-07-14 16:19:57.248277+00	gallerys/iqvia/iqvia-gallery-7.jpg	\N	image/jpeg	\N
71cd53ef-e1a3-46b2-b9e3-7a53f2f1fc77	8bdb202f-1151-4a04-9271-5b7925061571	/scraped-images/work-projects/iqvia/iqvia-gallery-8.jpg	iqvia gallery 10	\N	10	gallery	2025-07-14 16:19:57.387159+00	2025-07-14 16:19:57.387159+00	gallerys/iqvia/iqvia-gallery-8.jpg	\N	image/jpeg	\N
6dffbd54-14b6-4a87-842c-8acf20ff947d	8bdb202f-1151-4a04-9271-5b7925061571	/scraped-images/work-projects/iqvia/iqvia-gallery-9.jpg	iqvia gallery 11	\N	11	gallery	2025-07-14 16:19:57.519524+00	2025-07-14 16:19:57.519524+00	gallerys/iqvia/iqvia-gallery-9.jpg	\N	image/jpeg	\N
a4a9b95d-3a56-4446-9251-6b8aa06b71be	0bf9a1e7-1cd1-46d7-b0c3-e983913b3ff1	/scraped-images/work-projects/lifesciencemanufacturer/lifesciencemanufacturer-banner.jpg	lifesciencemanufacturer banner 1	\N	1	banner	2025-07-14 16:19:57.641537+00	2025-07-14 16:19:57.641537+00	banners/lifesciencemanufacturer/lifesciencemanufacturer-banner.jpg	\N	image/jpeg	\N
67d60ac1-8d01-4f3f-bcec-6914c15e61d8	0bf9a1e7-1cd1-46d7-b0c3-e983913b3ff1	/scraped-images/work-projects/lifesciencemanufacturer/lifesciencemanufacturer-gallery-1.jpg	lifesciencemanufacturer gallery 2	\N	2	gallery	2025-07-14 16:19:57.76367+00	2025-07-14 16:19:57.76367+00	gallerys/lifesciencemanufacturer/lifesciencemanufacturer-gallery-1.jpg	\N	image/jpeg	\N
131203bb-cfd9-4353-8fce-b575358b7f80	0bf9a1e7-1cd1-46d7-b0c3-e983913b3ff1	/scraped-images/work-projects/lifesciencemanufacturer/lifesciencemanufacturer-gallery-2.jpg	lifesciencemanufacturer gallery 3	\N	3	gallery	2025-07-14 16:19:57.870842+00	2025-07-14 16:19:57.870842+00	gallerys/lifesciencemanufacturer/lifesciencemanufacturer-gallery-2.jpg	\N	image/jpeg	\N
7bb8682a-afed-410a-b93e-064c37796e6a	0bf9a1e7-1cd1-46d7-b0c3-e983913b3ff1	/scraped-images/work-projects/lifesciencemanufacturer/lifesciencemanufacturer-gallery-3.jpg	lifesciencemanufacturer gallery 4	\N	4	gallery	2025-07-14 16:19:57.980037+00	2025-07-14 16:19:57.980037+00	gallerys/lifesciencemanufacturer/lifesciencemanufacturer-gallery-3.jpg	\N	image/jpeg	\N
ffdcca0a-53f1-46bd-a5f5-9ddd9ecc3383	0bf9a1e7-1cd1-46d7-b0c3-e983913b3ff1	/scraped-images/work-projects/lifesciencemanufacturer/lifesciencemanufacturer-gallery-4.jpg	lifesciencemanufacturer gallery 5	\N	5	gallery	2025-07-14 16:19:58.085986+00	2025-07-14 16:19:58.085986+00	gallerys/lifesciencemanufacturer/lifesciencemanufacturer-gallery-4.jpg	\N	image/jpeg	\N
ef67c8ae-0c74-4167-8d4c-5804ff4929e5	0bf9a1e7-1cd1-46d7-b0c3-e983913b3ff1	/scraped-images/work-projects/lifesciencemanufacturer/lifesciencemanufacturer-gallery-5.jpg	lifesciencemanufacturer gallery 6	\N	6	gallery	2025-07-14 16:19:58.215477+00	2025-07-14 16:19:58.215477+00	gallerys/lifesciencemanufacturer/lifesciencemanufacturer-gallery-5.jpg	\N	image/jpeg	\N
b45e9f2f-b1e2-4fa0-b347-7fa476d29ad0	0bf9a1e7-1cd1-46d7-b0c3-e983913b3ff1	/scraped-images/work-projects/lifesciencemanufacturer/lifesciencemanufacturer-gallery-6.jpg	lifesciencemanufacturer gallery 7	\N	7	gallery	2025-07-14 16:19:58.331885+00	2025-07-14 16:19:58.331885+00	gallerys/lifesciencemanufacturer/lifesciencemanufacturer-gallery-6.jpg	\N	image/jpeg	\N
ef6ad837-84b7-43ea-861c-4d4b61983f15	a9366983-fd27-43df-be70-7b2196860111	/scraped-images/work-projects/lufax/lufax-banner.jpg	lufax banner 1	\N	1	banner	2025-07-14 16:19:58.440081+00	2025-07-14 16:19:58.440081+00	banners/lufax/lufax-banner.jpg	\N	image/jpeg	\N
299c7df7-ac4c-4241-9855-0609f33e8f0c	a9366983-fd27-43df-be70-7b2196860111	/scraped-images/work-projects/lufax/lufax-gallery-1.jpg	lufax gallery 2	\N	2	gallery	2025-07-14 16:19:58.555686+00	2025-07-14 16:19:58.555686+00	gallerys/lufax/lufax-gallery-1.jpg	\N	image/jpeg	\N
c459c0e7-5a74-4098-a759-b4195325bfac	a9366983-fd27-43df-be70-7b2196860111	/scraped-images/work-projects/lufax/lufax-gallery-2.jpg	lufax gallery 3	\N	3	gallery	2025-07-14 16:19:58.66522+00	2025-07-14 16:19:58.66522+00	gallerys/lufax/lufax-gallery-2.jpg	\N	image/jpeg	\N
05a84599-ebae-4108-b68e-8b3d4ea53b93	a9366983-fd27-43df-be70-7b2196860111	/scraped-images/work-projects/lufax/lufax-gallery-3.jpg	lufax gallery 4	\N	4	gallery	2025-07-14 16:19:58.782048+00	2025-07-14 16:19:58.782048+00	gallerys/lufax/lufax-gallery-3.jpg	\N	image/jpeg	\N
45e728b1-8685-43ec-ba60-725c5d11c5d8	a9366983-fd27-43df-be70-7b2196860111	/scraped-images/work-projects/lufax/lufax-gallery-4.jpg	lufax gallery 5	\N	5	gallery	2025-07-14 16:19:58.895461+00	2025-07-14 16:19:58.895461+00	gallerys/lufax/lufax-gallery-4.jpg	\N	image/jpeg	\N
94e987b1-a6f1-4fc3-bacc-1fee0a4e5d5e	a9366983-fd27-43df-be70-7b2196860111	/scraped-images/work-projects/lufax/lufax-gallery-5.jpg	lufax gallery 6	\N	6	gallery	2025-07-14 16:19:59.013783+00	2025-07-14 16:19:59.013783+00	gallerys/lufax/lufax-gallery-5.jpg	\N	image/jpeg	\N
4c899cb0-3fa8-4330-9b98-1d68a5bfab29	4dcb6dd4-4149-447b-9ad1-7f1267bd059c	/scraped-images/work-projects/managementconsultingfirm/managementconsultingfirm-banner.jpg	managementconsultingfirm banner 1	\N	1	banner	2025-07-14 16:19:59.125804+00	2025-07-14 16:19:59.125804+00	banners/managementconsultingfirm/managementconsultingfirm-banner.jpg	\N	image/jpeg	\N
1ab3d7aa-ec03-48bd-86eb-68b34cb6d477	4dcb6dd4-4149-447b-9ad1-7f1267bd059c	/scraped-images/work-projects/managementconsultingfirm/managementconsultingfirm-gallery-1.jpg	managementconsultingfirm gallery 2	\N	2	gallery	2025-07-14 16:19:59.255086+00	2025-07-14 16:19:59.255086+00	gallerys/managementconsultingfirm/managementconsultingfirm-gallery-1.jpg	\N	image/jpeg	\N
85876e66-9c46-47e3-abb9-2fc0b59804e7	4dcb6dd4-4149-447b-9ad1-7f1267bd059c	/scraped-images/work-projects/managementconsultingfirm/managementconsultingfirm-gallery-10.jpg	managementconsultingfirm gallery 3	\N	3	gallery	2025-07-14 16:19:59.367603+00	2025-07-14 16:19:59.367603+00	gallerys/managementconsultingfirm/managementconsultingfirm-gallery-10.jpg	\N	image/jpeg	\N
dc5c5ec2-1aef-46fa-b56e-5053bf4926b5	4dcb6dd4-4149-447b-9ad1-7f1267bd059c	/scraped-images/work-projects/managementconsultingfirm/managementconsultingfirm-gallery-2.jpg	managementconsultingfirm gallery 4	\N	4	gallery	2025-07-14 16:19:59.478629+00	2025-07-14 16:19:59.478629+00	gallerys/managementconsultingfirm/managementconsultingfirm-gallery-2.jpg	\N	image/jpeg	\N
8b4e8215-8e51-435a-899e-306f2c40c636	4dcb6dd4-4149-447b-9ad1-7f1267bd059c	/scraped-images/work-projects/managementconsultingfirm/managementconsultingfirm-gallery-3.jpg	managementconsultingfirm gallery 5	\N	5	gallery	2025-07-14 16:19:59.592319+00	2025-07-14 16:19:59.592319+00	gallerys/managementconsultingfirm/managementconsultingfirm-gallery-3.jpg	\N	image/jpeg	\N
1c704fad-2548-4d0d-8a16-c3ea3057547a	4dcb6dd4-4149-447b-9ad1-7f1267bd059c	/scraped-images/work-projects/managementconsultingfirm/managementconsultingfirm-gallery-4.jpg	managementconsultingfirm gallery 6	\N	6	gallery	2025-07-14 16:19:59.703626+00	2025-07-14 16:19:59.703626+00	gallerys/managementconsultingfirm/managementconsultingfirm-gallery-4.jpg	\N	image/jpeg	\N
7ab3e2cb-59c7-4efe-9ff7-ae93f234c45e	4dcb6dd4-4149-447b-9ad1-7f1267bd059c	/scraped-images/work-projects/managementconsultingfirm/managementconsultingfirm-gallery-5.jpg	managementconsultingfirm gallery 7	\N	7	gallery	2025-07-14 16:19:59.818709+00	2025-07-14 16:19:59.818709+00	gallerys/managementconsultingfirm/managementconsultingfirm-gallery-5.jpg	\N	image/jpeg	\N
7b8d8cee-ff78-48c1-a269-a4185dbce06f	4dcb6dd4-4149-447b-9ad1-7f1267bd059c	/scraped-images/work-projects/managementconsultingfirm/managementconsultingfirm-gallery-6.jpg	managementconsultingfirm gallery 8	\N	8	gallery	2025-07-14 16:19:59.928258+00	2025-07-14 16:19:59.928258+00	gallerys/managementconsultingfirm/managementconsultingfirm-gallery-6.jpg	\N	image/jpeg	\N
51207d86-7f20-410e-a0da-b1cd40676108	4dcb6dd4-4149-447b-9ad1-7f1267bd059c	/scraped-images/work-projects/managementconsultingfirm/managementconsultingfirm-gallery-7.jpg	managementconsultingfirm gallery 9	\N	9	gallery	2025-07-14 16:20:00.034507+00	2025-07-14 16:20:00.034507+00	gallerys/managementconsultingfirm/managementconsultingfirm-gallery-7.jpg	\N	image/jpeg	\N
20314194-a5c6-48a5-843c-57db8d635c36	4dcb6dd4-4149-447b-9ad1-7f1267bd059c	/scraped-images/work-projects/managementconsultingfirm/managementconsultingfirm-gallery-8.jpg	managementconsultingfirm gallery 10	\N	10	gallery	2025-07-14 16:20:00.153337+00	2025-07-14 16:20:00.153337+00	gallerys/managementconsultingfirm/managementconsultingfirm-gallery-8.jpg	\N	image/jpeg	\N
2a4093b8-3610-4d2a-9ea5-835b92c600dc	4dcb6dd4-4149-447b-9ad1-7f1267bd059c	/scraped-images/work-projects/managementconsultingfirm/managementconsultingfirm-gallery-9.jpg	managementconsultingfirm gallery 11	\N	11	gallery	2025-07-14 16:20:00.279751+00	2025-07-14 16:20:00.279751+00	gallerys/managementconsultingfirm/managementconsultingfirm-gallery-9.jpg	\N	image/jpeg	\N
d4b358fa-07c7-4e18-933e-22949c7bebd2	10b32f1a-0e31-4c2c-8fad-4d4f17980a9f	/scraped-images/work-projects/managementconsultingsg/managementconsultingsg-banner.jpg	managementconsultingsg banner 1	\N	1	banner	2025-07-14 16:20:00.394935+00	2025-07-14 16:20:00.394935+00	banners/managementconsultingsg/managementconsultingsg-banner.jpg	\N	image/jpeg	\N
5d16c162-7480-4224-8758-8c82d89819df	10b32f1a-0e31-4c2c-8fad-4d4f17980a9f	/scraped-images/work-projects/managementconsultingsg/mcsg-banner.jpg	managementconsultingsg banner 2	\N	2	banner	2025-07-14 16:20:00.522194+00	2025-07-14 16:20:00.522194+00	banners/managementconsultingsg/mcsg-banner.jpg	\N	image/jpeg	\N
da57ef96-035c-4b68-8918-c87ff4ed4e37	10b32f1a-0e31-4c2c-8fad-4d4f17980a9f	/scraped-images/work-projects/managementconsultingsg/mcsg-gallery-1.jpg	managementconsultingsg gallery 3	\N	3	gallery	2025-07-14 16:20:00.638994+00	2025-07-14 16:20:00.638994+00	gallerys/managementconsultingsg/mcsg-gallery-1.jpg	\N	image/jpeg	\N
d812ec2d-71e2-4ee5-9af4-c6f0a17eb83e	10b32f1a-0e31-4c2c-8fad-4d4f17980a9f	/scraped-images/work-projects/managementconsultingsg/mcsg-gallery-10.jpg	managementconsultingsg gallery 4	\N	4	gallery	2025-07-14 16:20:00.759603+00	2025-07-14 16:20:00.759603+00	gallerys/managementconsultingsg/mcsg-gallery-10.jpg	\N	image/jpeg	\N
8bd4ec23-5fe9-4072-99eb-7e60fa155c8e	10b32f1a-0e31-4c2c-8fad-4d4f17980a9f	/scraped-images/work-projects/managementconsultingsg/mcsg-gallery-2.jpg	managementconsultingsg gallery 5	\N	5	gallery	2025-07-14 16:20:00.875457+00	2025-07-14 16:20:00.875457+00	gallerys/managementconsultingsg/mcsg-gallery-2.jpg	\N	image/jpeg	\N
2f8fb998-ac7f-42a7-b7d5-d353d79db200	10b32f1a-0e31-4c2c-8fad-4d4f17980a9f	/scraped-images/work-projects/managementconsultingsg/mcsg-gallery-3.jpg	managementconsultingsg gallery 6	\N	6	gallery	2025-07-14 16:20:00.996282+00	2025-07-14 16:20:00.996282+00	gallerys/managementconsultingsg/mcsg-gallery-3.jpg	\N	image/jpeg	\N
6abb6ace-43bb-4a40-b4b9-c20f552686ab	10b32f1a-0e31-4c2c-8fad-4d4f17980a9f	/scraped-images/work-projects/managementconsultingsg/mcsg-gallery-4.jpg	managementconsultingsg gallery 7	\N	7	gallery	2025-07-14 16:20:01.12149+00	2025-07-14 16:20:01.12149+00	gallerys/managementconsultingsg/mcsg-gallery-4.jpg	\N	image/jpeg	\N
bb64b624-5b1e-4443-901f-055f91a637bb	10b32f1a-0e31-4c2c-8fad-4d4f17980a9f	/scraped-images/work-projects/managementconsultingsg/mcsg-gallery-5.jpg	managementconsultingsg gallery 8	\N	8	gallery	2025-07-14 16:20:01.2516+00	2025-07-14 16:20:01.2516+00	gallerys/managementconsultingsg/mcsg-gallery-5.jpg	\N	image/jpeg	\N
8a345757-2d7d-4879-86df-9722ebce039a	10b32f1a-0e31-4c2c-8fad-4d4f17980a9f	/scraped-images/work-projects/managementconsultingsg/mcsg-gallery-6.jpg	managementconsultingsg gallery 9	\N	9	gallery	2025-07-14 16:20:01.369972+00	2025-07-14 16:20:01.369972+00	gallerys/managementconsultingsg/mcsg-gallery-6.jpg	\N	image/jpeg	\N
d34045a6-1b79-4754-8b1f-93f729856af3	10b32f1a-0e31-4c2c-8fad-4d4f17980a9f	/scraped-images/work-projects/managementconsultingsg/mcsg-gallery-7.jpg	managementconsultingsg gallery 10	\N	10	gallery	2025-07-14 16:20:01.496228+00	2025-07-14 16:20:01.496228+00	gallerys/managementconsultingsg/mcsg-gallery-7.jpg	\N	image/jpeg	\N
3637a267-71e6-45ce-be55-06447bfea3d7	10b32f1a-0e31-4c2c-8fad-4d4f17980a9f	/scraped-images/work-projects/managementconsultingsg/mcsg-gallery-8.jpg	managementconsultingsg gallery 11	\N	11	gallery	2025-07-14 16:20:01.618518+00	2025-07-14 16:20:01.618518+00	gallerys/managementconsultingsg/mcsg-gallery-8.jpg	\N	image/jpeg	\N
da7c3a92-8be9-4a45-a84c-0c689d7f5983	10b32f1a-0e31-4c2c-8fad-4d4f17980a9f	/scraped-images/work-projects/managementconsultingsg/mcsg-gallery-9.jpg	managementconsultingsg gallery 12	\N	12	gallery	2025-07-14 16:20:01.740981+00	2025-07-14 16:20:01.740981+00	gallerys/managementconsultingsg/mcsg-gallery-9.jpg	\N	image/jpeg	\N
012e4d6e-e5f6-4a47-8eb0-7d3937210aed	df150485-bfd6-4bf4-9a83-ac8c150e7050	/scraped-images/work-projects/myp/myp-banner.jpg	myp banner 1	\N	1	banner	2025-07-14 16:20:01.855674+00	2025-07-14 16:20:01.855674+00	banners/myp/myp-banner.jpg	\N	image/jpeg	\N
6697e403-7a25-4d90-8471-5f2d72d70341	df150485-bfd6-4bf4-9a83-ac8c150e7050	/scraped-images/work-projects/myp/myp-gallery-1.jpg	myp gallery 2	\N	2	gallery	2025-07-14 16:20:01.972211+00	2025-07-14 16:20:01.972211+00	gallerys/myp/myp-gallery-1.jpg	\N	image/jpeg	\N
334c7203-7e11-4d22-9352-1947d21dfa39	df150485-bfd6-4bf4-9a83-ac8c150e7050	/scraped-images/work-projects/myp/myp-gallery-2.jpg	myp gallery 3	\N	3	gallery	2025-07-14 16:20:02.089824+00	2025-07-14 16:20:02.089824+00	gallerys/myp/myp-gallery-2.jpg	\N	image/jpeg	\N
582b1784-18ef-4bc4-8cc6-af6c32baf444	df150485-bfd6-4bf4-9a83-ac8c150e7050	/scraped-images/work-projects/myp/myp-gallery-3.jpg	myp gallery 4	\N	4	gallery	2025-07-14 16:20:02.209433+00	2025-07-14 16:20:02.209433+00	gallerys/myp/myp-gallery-3.jpg	\N	image/jpeg	\N
464db898-4b8c-4fa8-96af-319d7607db53	df150485-bfd6-4bf4-9a83-ac8c150e7050	/scraped-images/work-projects/myp/myp-gallery-4.jpg	myp gallery 5	\N	5	gallery	2025-07-14 16:20:02.317993+00	2025-07-14 16:20:02.317993+00	gallerys/myp/myp-gallery-4.jpg	\N	image/jpeg	\N
7ea91a60-aa31-45b3-9d43-908ec978b4a2	df150485-bfd6-4bf4-9a83-ac8c150e7050	/scraped-images/work-projects/myp/myp-gallery-5.jpg	myp gallery 6	\N	6	gallery	2025-07-14 16:20:02.45279+00	2025-07-14 16:20:02.45279+00	gallerys/myp/myp-gallery-5.jpg	\N	image/jpeg	\N
eb983b35-6523-49be-a518-d47d25e6a483	ef5d39ee-262e-4877-b109-95e56a0892d8	/scraped-images/work-projects/philipmorrissingapore/philipmorrissingapore-banner.jpg	philipmorrissingapore banner 1	\N	1	banner	2025-07-14 16:20:02.569044+00	2025-07-14 16:20:02.569044+00	banners/philipmorrissingapore/philipmorrissingapore-banner.jpg	\N	image/jpeg	\N
fdeac0f3-2782-4744-89d2-171546cde804	ef5d39ee-262e-4877-b109-95e56a0892d8	/scraped-images/work-projects/philipmorrissingapore/philipmorrissingapore-gallery-1.jpg	philipmorrissingapore gallery 2	\N	2	gallery	2025-07-14 16:20:02.700063+00	2025-07-14 16:20:02.700063+00	gallerys/philipmorrissingapore/philipmorrissingapore-gallery-1.jpg	\N	image/jpeg	\N
b0619e70-9b36-45e1-a510-9ceb861e03a3	ef5d39ee-262e-4877-b109-95e56a0892d8	/scraped-images/work-projects/philipmorrissingapore/philipmorrissingapore-gallery-2.jpg	philipmorrissingapore gallery 3	\N	3	gallery	2025-07-14 16:20:02.817055+00	2025-07-14 16:20:02.817055+00	gallerys/philipmorrissingapore/philipmorrissingapore-gallery-2.jpg	\N	image/jpeg	\N
b778d6a3-3486-423e-86b4-f44ac389c5de	ef5d39ee-262e-4877-b109-95e56a0892d8	/scraped-images/work-projects/philipmorrissingapore/philipmorrissingapore-gallery-3.jpg	philipmorrissingapore gallery 4	\N	4	gallery	2025-07-14 16:20:02.93304+00	2025-07-14 16:20:02.93304+00	gallerys/philipmorrissingapore/philipmorrissingapore-gallery-3.jpg	\N	image/jpeg	\N
7c9c2e60-c660-411a-9c39-b9a1a4163013	ef5d39ee-262e-4877-b109-95e56a0892d8	/scraped-images/work-projects/philipmorrissingapore/philipmorrissingapore-gallery-4.jpg	philipmorrissingapore gallery 5	\N	5	gallery	2025-07-14 16:20:03.058659+00	2025-07-14 16:20:03.058659+00	gallerys/philipmorrissingapore/philipmorrissingapore-gallery-4.jpg	\N	image/jpeg	\N
3a5084c9-dc13-42e6-a706-927d2d1515e1	ef5d39ee-262e-4877-b109-95e56a0892d8	/scraped-images/work-projects/philipmorrissingapore/philipmorrissingapore-gallery-5.jpg	philipmorrissingapore gallery 6	\N	6	gallery	2025-07-14 16:20:03.192172+00	2025-07-14 16:20:03.192172+00	gallerys/philipmorrissingapore/philipmorrissingapore-gallery-5.jpg	\N	image/jpeg	\N
a438be27-4356-4df0-a3f7-fcdf7e74d7fc	ef5d39ee-262e-4877-b109-95e56a0892d8	/scraped-images/work-projects/philipmorrissingapore/philipmorrissingapore-gallery-6.jpg	philipmorrissingapore gallery 7	\N	7	gallery	2025-07-14 16:20:03.305579+00	2025-07-14 16:20:03.305579+00	gallerys/philipmorrissingapore/philipmorrissingapore-gallery-6.jpg	\N	image/jpeg	\N
cad78570-36ee-4a40-a866-727b3f55135a	ef5d39ee-262e-4877-b109-95e56a0892d8	/scraped-images/work-projects/philipmorrissingapore/philipmorrissingapore-gallery-7.jpg	philipmorrissingapore gallery 8	\N	8	gallery	2025-07-14 16:20:03.422883+00	2025-07-14 16:20:03.422883+00	gallerys/philipmorrissingapore/philipmorrissingapore-gallery-7.jpg	\N	image/jpeg	\N
7e0a3ebe-1da7-492d-a5ce-4e835deb34a5	ef5d39ee-262e-4877-b109-95e56a0892d8	/scraped-images/work-projects/philipmorrissingapore/philipmorrissingapore-gallery-8.jpg	philipmorrissingapore gallery 9	\N	9	gallery	2025-07-14 16:20:03.552061+00	2025-07-14 16:20:03.552061+00	gallerys/philipmorrissingapore/philipmorrissingapore-gallery-8.jpg	\N	image/jpeg	\N
e1c974cd-1156-4204-84ae-1d2a287fc6af	ef5d39ee-262e-4877-b109-95e56a0892d8	/scraped-images/work-projects/philipmorrissingapore/philipmorrissingapore-gallery-9.jpg	philipmorrissingapore gallery 10	\N	10	gallery	2025-07-14 16:20:03.677029+00	2025-07-14 16:20:03.677029+00	gallerys/philipmorrissingapore/philipmorrissingapore-gallery-9.jpg	\N	image/jpeg	\N
bd3e5dfc-bef1-4bc9-9e4d-75ef653f719f	42bafecd-ec91-4e52-b143-90eb3daae480	/scraped-images/work-projects/resources/resources-banner.jpg	resources banner 1	\N	1	banner	2025-07-14 16:20:03.787894+00	2025-07-14 16:20:03.787894+00	banners/resources/resources-banner.jpg	\N	image/jpeg	\N
f4f53f30-0159-44c4-9e49-13eed0889b64	42bafecd-ec91-4e52-b143-90eb3daae480	/scraped-images/work-projects/resources/resources-gallery-1.jpg	resources gallery 2	\N	2	gallery	2025-07-14 16:20:03.899241+00	2025-07-14 16:20:03.899241+00	gallerys/resources/resources-gallery-1.jpg	\N	image/jpeg	\N
40deb764-19ec-4c23-9267-e36cf4ecfde7	42bafecd-ec91-4e52-b143-90eb3daae480	/scraped-images/work-projects/resources/resources-gallery-2.jpg	resources gallery 3	\N	3	gallery	2025-07-14 16:20:04.319571+00	2025-07-14 16:20:04.319571+00	gallerys/resources/resources-gallery-2.jpg	\N	image/jpeg	\N
5d402bda-3146-4fcf-89ea-617a0c885bdd	42bafecd-ec91-4e52-b143-90eb3daae480	/scraped-images/work-projects/resources/resources-gallery-3.jpg	resources gallery 4	\N	4	gallery	2025-07-14 16:20:04.435725+00	2025-07-14 16:20:04.435725+00	gallerys/resources/resources-gallery-3.jpg	\N	image/jpeg	\N
af1f25a6-c42b-48b8-8f92-edf10233c492	42bafecd-ec91-4e52-b143-90eb3daae480	/scraped-images/work-projects/resources/resources-gallery-4.jpg	resources gallery 5	\N	5	gallery	2025-07-14 16:20:04.540904+00	2025-07-14 16:20:04.540904+00	gallerys/resources/resources-gallery-4.jpg	\N	image/jpeg	\N
48becc64-c0b7-497d-95df-d52e3c3aa51b	f087ec15-4657-40fb-ba52-295d83487ef0	/scraped-images/work-projects/ricecommunications/ricecommunications-banner.jpg	ricecommunications banner 1	\N	1	banner	2025-07-14 16:20:04.672153+00	2025-07-14 16:20:04.672153+00	banners/ricecommunications/ricecommunications-banner.jpg	\N	image/jpeg	\N
b7110274-3853-409d-ad03-fdff58408675	f087ec15-4657-40fb-ba52-295d83487ef0	/scraped-images/work-projects/ricecommunications/ricecommunications-gallery-1.jpg	ricecommunications gallery 2	\N	2	gallery	2025-07-14 16:20:04.794499+00	2025-07-14 16:20:04.794499+00	gallerys/ricecommunications/ricecommunications-gallery-1.jpg	\N	image/jpeg	\N
fafd3d82-f53d-44c2-ab3d-bbf2b3a60c18	f087ec15-4657-40fb-ba52-295d83487ef0	/scraped-images/work-projects/ricecommunications/ricecommunications-gallery-2.jpg	ricecommunications gallery 3	\N	3	gallery	2025-07-14 16:20:04.90522+00	2025-07-14 16:20:04.90522+00	gallerys/ricecommunications/ricecommunications-gallery-2.jpg	\N	image/jpeg	\N
314c4b0f-e614-49f6-89cf-3c6043e4ff59	f087ec15-4657-40fb-ba52-295d83487ef0	/scraped-images/work-projects/ricecommunications/ricecommunications-gallery-3.jpg	ricecommunications gallery 4	\N	4	gallery	2025-07-14 16:20:05.031844+00	2025-07-14 16:20:05.031844+00	gallerys/ricecommunications/ricecommunications-gallery-3.jpg	\N	image/jpeg	\N
5b3f3e69-0d33-4280-933c-227038928980	f087ec15-4657-40fb-ba52-295d83487ef0	/scraped-images/work-projects/ricecommunications/ricecommunications-gallery-4.jpg	ricecommunications gallery 5	\N	5	gallery	2025-07-14 16:20:05.151156+00	2025-07-14 16:20:05.151156+00	gallerys/ricecommunications/ricecommunications-gallery-4.jpg	\N	image/jpeg	\N
133846fc-3b30-4aec-ab1d-12df0a1db88e	f087ec15-4657-40fb-ba52-295d83487ef0	/scraped-images/work-projects/ricecommunications/ricecommunications-gallery-5.jpg	ricecommunications gallery 6	\N	6	gallery	2025-07-14 16:20:05.259086+00	2025-07-14 16:20:05.259086+00	gallerys/ricecommunications/ricecommunications-gallery-5.jpg	\N	image/jpeg	\N
c211fea3-f3c8-44ad-96cd-c4f9ad306f1a	f087ec15-4657-40fb-ba52-295d83487ef0	/scraped-images/work-projects/ricecommunications/ricecommunications-gallery-6.jpg	ricecommunications gallery 7	\N	7	gallery	2025-07-14 16:20:05.375934+00	2025-07-14 16:20:05.375934+00	gallerys/ricecommunications/ricecommunications-gallery-6.jpg	\N	image/jpeg	\N
40c10439-898c-40f7-8955-c1d8e149e3b8	9e43248d-6bcf-4091-a447-044a44b797ab	/scraped-images/work-projects/ridehailinggiant/ridehailinggiant-banner.jpg	ridehailinggiant banner 1	\N	1	banner	2025-07-14 16:20:05.487135+00	2025-07-14 16:20:05.487135+00	banners/ridehailinggiant/ridehailinggiant-banner.jpg	\N	image/jpeg	\N
374a5edc-9f48-438e-887f-b29776fa8c42	9e43248d-6bcf-4091-a447-044a44b797ab	/scraped-images/work-projects/ridehailinggiant/ridehailinggiant-gallery-1.jpg	ridehailinggiant gallery 2	\N	2	gallery	2025-07-14 16:20:05.595544+00	2025-07-14 16:20:05.595544+00	gallerys/ridehailinggiant/ridehailinggiant-gallery-1.jpg	\N	image/jpeg	\N
44f73653-0cfe-4f37-93bb-761a9c0aee4b	9e43248d-6bcf-4091-a447-044a44b797ab	/scraped-images/work-projects/ridehailinggiant/ridehailinggiant-gallery-2.jpg	ridehailinggiant gallery 3	\N	3	gallery	2025-07-14 16:20:05.698054+00	2025-07-14 16:20:05.698054+00	gallerys/ridehailinggiant/ridehailinggiant-gallery-2.jpg	\N	image/jpeg	\N
0c1dced7-4635-4acc-b056-a1db2a970ec4	9e43248d-6bcf-4091-a447-044a44b797ab	/scraped-images/work-projects/ridehailinggiant/ridehailinggiant-gallery-3.jpg	ridehailinggiant gallery 4	\N	4	gallery	2025-07-14 16:20:05.819124+00	2025-07-14 16:20:05.819124+00	gallerys/ridehailinggiant/ridehailinggiant-gallery-3.jpg	\N	image/jpeg	\N
a679a460-37ac-4b0a-a6e0-811639ef49d6	9e43248d-6bcf-4091-a447-044a44b797ab	/scraped-images/work-projects/ridehailinggiant/ridehailinggiant-gallery-4.jpg	ridehailinggiant gallery 5	\N	5	gallery	2025-07-14 16:20:05.92478+00	2025-07-14 16:20:05.92478+00	gallerys/ridehailinggiant/ridehailinggiant-gallery-4.jpg	\N	image/jpeg	\N
1b5a1385-5226-4d3c-ab39-c7cfa78eb017	9e43248d-6bcf-4091-a447-044a44b797ab	/scraped-images/work-projects/ridehailinggiant/ridehailinggiant-gallery-5.jpg	ridehailinggiant gallery 6	\N	6	gallery	2025-07-14 16:20:06.036923+00	2025-07-14 16:20:06.036923+00	gallerys/ridehailinggiant/ridehailinggiant-gallery-5.jpg	\N	image/jpeg	\N
d1204943-c0f6-4c5d-8c56-9db98685d37f	9e43248d-6bcf-4091-a447-044a44b797ab	/scraped-images/work-projects/ridehailinggiant/ridehailinggiant-gallery-6.jpg	ridehailinggiant gallery 7	\N	7	gallery	2025-07-14 16:20:06.15609+00	2025-07-14 16:20:06.15609+00	gallerys/ridehailinggiant/ridehailinggiant-gallery-6.jpg	\N	image/jpeg	\N
9fd16f67-dd2a-4358-9dfa-c7c75dd1052f	9e43248d-6bcf-4091-a447-044a44b797ab	/scraped-images/work-projects/ridehailinggiant/ridehailinggiant-gallery-7.jpg	ridehailinggiant gallery 8	\N	8	gallery	2025-07-14 16:20:06.256715+00	2025-07-14 16:20:06.256715+00	gallerys/ridehailinggiant/ridehailinggiant-gallery-7.jpg	\N	image/jpeg	\N
66ba22fa-4a6c-4dcc-9cf5-8ea9a62a42c8	9e43248d-6bcf-4091-a447-044a44b797ab	/scraped-images/work-projects/ridehailinggiant/ridehailinggiant-gallery-8.jpg	ridehailinggiant gallery 9	\N	9	gallery	2025-07-14 16:20:06.361927+00	2025-07-14 16:20:06.361927+00	gallerys/ridehailinggiant/ridehailinggiant-gallery-8.jpg	\N	image/jpeg	\N
caf46d64-6f55-4658-85d0-b2270c62154c	9e43248d-6bcf-4091-a447-044a44b797ab	/scraped-images/work-projects/ridehailinggiant/ridehailinggiant-gallery-9.jpg	ridehailinggiant gallery 10	\N	10	gallery	2025-07-14 16:20:06.466287+00	2025-07-14 16:20:06.466287+00	gallerys/ridehailinggiant/ridehailinggiant-gallery-9.jpg	\N	image/jpeg	\N
4c19e37a-72d4-4235-92c5-eefbb8da07bd	4aa178eb-5798-408b-bdbd-ac47344fe497	/scraped-images/work-projects/rqam/rqam-banner.jpg	rqam banner 1	\N	1	banner	2025-07-14 16:20:06.585621+00	2025-07-14 16:20:06.585621+00	banners/rqam/rqam-banner.jpg	\N	image/jpeg	\N
6f06e6c3-fd76-4219-8aba-94c2bc401a47	4aa178eb-5798-408b-bdbd-ac47344fe497	/scraped-images/work-projects/rqam/rqam-gallery-1.jpg	rqam gallery 2	\N	2	gallery	2025-07-14 16:20:06.691561+00	2025-07-14 16:20:06.691561+00	gallerys/rqam/rqam-gallery-1.jpg	\N	image/jpeg	\N
831e6dad-f475-49b5-83fa-907993e17e0d	4aa178eb-5798-408b-bdbd-ac47344fe497	/scraped-images/work-projects/rqam/rqam-gallery-2.jpg	rqam gallery 3	\N	3	gallery	2025-07-14 16:20:06.791145+00	2025-07-14 16:20:06.791145+00	gallerys/rqam/rqam-gallery-2.jpg	\N	image/jpeg	\N
6b70482a-5eb2-457e-95cb-e3386dd7e2d8	4aa178eb-5798-408b-bdbd-ac47344fe497	/scraped-images/work-projects/rqam/rqam-gallery-3.jpg	rqam gallery 4	\N	4	gallery	2025-07-14 16:20:06.895028+00	2025-07-14 16:20:06.895028+00	gallerys/rqam/rqam-gallery-3.jpg	\N	image/jpeg	\N
b15b013b-3d9f-4738-87f7-1fbc40a0ba23	4aa178eb-5798-408b-bdbd-ac47344fe497	/scraped-images/work-projects/rqam/rqam-gallery-4.jpg	rqam gallery 5	\N	5	gallery	2025-07-14 16:20:06.996519+00	2025-07-14 16:20:06.996519+00	gallerys/rqam/rqam-gallery-4.jpg	\N	image/jpeg	\N
a588441c-114a-4726-8ef6-3ad103d278f6	4aa178eb-5798-408b-bdbd-ac47344fe497	/scraped-images/work-projects/rqam/rqam-gallery-5.jpg	rqam gallery 6	\N	6	gallery	2025-07-14 16:20:07.097612+00	2025-07-14 16:20:07.097612+00	gallerys/rqam/rqam-gallery-5.jpg	\N	image/jpeg	\N
1b391636-5961-4253-b493-38764b8a182b	79cf0fc8-98ac-44de-b1ff-79c6a22dbca7	/scraped-images/work-projects/swissbank/swissbank-banner.jpg	swissbank banner 1	\N	1	banner	2025-07-14 16:20:07.20013+00	2025-07-14 16:20:07.20013+00	banners/swissbank/swissbank-banner.jpg	\N	image/jpeg	\N
1259c0d7-be95-409c-aeef-62f54b8b3ac1	79cf0fc8-98ac-44de-b1ff-79c6a22dbca7	/scraped-images/work-projects/swissbank/swissbank-gallery-1.jpg	swissbank gallery 2	\N	2	gallery	2025-07-14 16:20:07.315199+00	2025-07-14 16:20:07.315199+00	gallerys/swissbank/swissbank-gallery-1.jpg	\N	image/jpeg	\N
df386b6c-baae-439a-a677-ccf539ebc01c	79cf0fc8-98ac-44de-b1ff-79c6a22dbca7	/scraped-images/work-projects/swissbank/swissbank-gallery-10.jpg	swissbank gallery 3	\N	3	gallery	2025-07-14 16:20:07.416785+00	2025-07-14 16:20:07.416785+00	gallerys/swissbank/swissbank-gallery-10.jpg	\N	image/jpeg	\N
4dbbd85d-0749-4862-9e49-54e5c13906f3	79cf0fc8-98ac-44de-b1ff-79c6a22dbca7	/scraped-images/work-projects/swissbank/swissbank-gallery-2.jpg	swissbank gallery 4	\N	4	gallery	2025-07-14 16:20:07.529242+00	2025-07-14 16:20:07.529242+00	gallerys/swissbank/swissbank-gallery-2.jpg	\N	image/jpeg	\N
6c82d803-8e83-48b7-963f-0518f6a5c1ef	79cf0fc8-98ac-44de-b1ff-79c6a22dbca7	/scraped-images/work-projects/swissbank/swissbank-gallery-3.jpg	swissbank gallery 5	\N	5	gallery	2025-07-14 16:20:07.637556+00	2025-07-14 16:20:07.637556+00	gallerys/swissbank/swissbank-gallery-3.jpg	\N	image/jpeg	\N
20b88335-0f8f-457e-9033-45849bf20352	79cf0fc8-98ac-44de-b1ff-79c6a22dbca7	/scraped-images/work-projects/swissbank/swissbank-gallery-4.jpg	swissbank gallery 6	\N	6	gallery	2025-07-14 16:20:07.756762+00	2025-07-14 16:20:07.756762+00	gallerys/swissbank/swissbank-gallery-4.jpg	\N	image/jpeg	\N
ee6b6626-a00b-4b91-8377-fd7fa6e13a0a	79cf0fc8-98ac-44de-b1ff-79c6a22dbca7	/scraped-images/work-projects/swissbank/swissbank-gallery-5.jpg	swissbank gallery 7	\N	7	gallery	2025-07-14 16:20:07.861598+00	2025-07-14 16:20:07.861598+00	gallerys/swissbank/swissbank-gallery-5.jpg	\N	image/jpeg	\N
40604aee-d676-442b-a377-66a0e8658695	79cf0fc8-98ac-44de-b1ff-79c6a22dbca7	/scraped-images/work-projects/swissbank/swissbank-gallery-6.jpg	swissbank gallery 8	\N	8	gallery	2025-07-14 16:20:07.975987+00	2025-07-14 16:20:07.975987+00	gallerys/swissbank/swissbank-gallery-6.jpg	\N	image/jpeg	\N
8cbf3047-dff4-4451-bb0a-ae68058022e6	79cf0fc8-98ac-44de-b1ff-79c6a22dbca7	/scraped-images/work-projects/swissbank/swissbank-gallery-7.jpg	swissbank gallery 9	\N	9	gallery	2025-07-14 16:20:08.082921+00	2025-07-14 16:20:08.082921+00	gallerys/swissbank/swissbank-gallery-7.jpg	\N	image/jpeg	\N
86ab4d79-f941-41aa-a5a3-fbf57ce35158	79cf0fc8-98ac-44de-b1ff-79c6a22dbca7	/scraped-images/work-projects/swissbank/swissbank-gallery-8.jpg	swissbank gallery 10	\N	10	gallery	2025-07-14 16:20:08.195293+00	2025-07-14 16:20:08.195293+00	gallerys/swissbank/swissbank-gallery-8.jpg	\N	image/jpeg	\N
d54b5831-7e88-4f6d-a337-63f4d09c40eb	79cf0fc8-98ac-44de-b1ff-79c6a22dbca7	/scraped-images/work-projects/swissbank/swissbank-gallery-9.jpg	swissbank gallery 11	\N	11	gallery	2025-07-14 16:20:08.301548+00	2025-07-14 16:20:08.301548+00	gallerys/swissbank/swissbank-gallery-9.jpg	\N	image/jpeg	\N
bc9ac86d-b58b-4475-8878-1ce4a061c767	a8abbb70-90f1-43b7-88e9-3ebeebd47ae5	/scraped-images/work-projects/thewolfden/thewolfden-banner.jpg	thewolfden banner 1	\N	1	banner	2025-07-14 16:20:08.419678+00	2025-07-14 16:20:08.419678+00	banners/thewolfden/thewolfden-banner.jpg	\N	image/jpeg	\N
0b4b22b4-2133-47b8-8b4a-594d70800fc6	a8abbb70-90f1-43b7-88e9-3ebeebd47ae5	/scraped-images/work-projects/thewolfden/thewolfden-gallery-1.jpg	thewolfden gallery 2	\N	2	gallery	2025-07-14 16:20:08.525687+00	2025-07-14 16:20:08.525687+00	gallerys/thewolfden/thewolfden-gallery-1.jpg	\N	image/jpeg	\N
7f1d5226-f579-4990-bce8-08c21a058b44	a8abbb70-90f1-43b7-88e9-3ebeebd47ae5	/scraped-images/work-projects/thewolfden/thewolfden-gallery-2.jpg	thewolfden gallery 3	\N	3	gallery	2025-07-14 16:20:08.627529+00	2025-07-14 16:20:08.627529+00	gallerys/thewolfden/thewolfden-gallery-2.jpg	\N	image/jpeg	\N
c8b1e177-85c9-4958-8dab-b6e8172ff255	a8abbb70-90f1-43b7-88e9-3ebeebd47ae5	/scraped-images/work-projects/thewolfden/thewolfden-gallery-3.jpg	thewolfden gallery 4	\N	4	gallery	2025-07-14 16:20:08.729939+00	2025-07-14 16:20:08.729939+00	gallerys/thewolfden/thewolfden-gallery-3.jpg	\N	image/jpeg	\N
ca3f74e5-5231-46c8-bcf8-3db4e9c184ad	a8abbb70-90f1-43b7-88e9-3ebeebd47ae5	/scraped-images/work-projects/thewolfden/thewolfden-gallery-4.jpg	thewolfden gallery 5	\N	5	gallery	2025-07-14 16:20:08.835731+00	2025-07-14 16:20:08.835731+00	gallerys/thewolfden/thewolfden-gallery-4.jpg	\N	image/jpeg	\N
ce0abb2c-df31-47f5-8762-8b9e8833caad	a8abbb70-90f1-43b7-88e9-3ebeebd47ae5	/scraped-images/work-projects/thewolfden/thewolfden-gallery-5.jpg	thewolfden gallery 6	\N	6	gallery	2025-07-14 16:20:08.944863+00	2025-07-14 16:20:08.944863+00	gallerys/thewolfden/thewolfden-gallery-5.jpg	\N	image/jpeg	\N
d96c9a3c-1b63-4885-a595-ec7d01f39c49	dde3babc-d612-4b08-b58b-70fa80fba408	/scraped-images/work-projects/vvlife/vvlife-banner.jpg	vvlife banner 1	\N	1	banner	2025-07-14 16:20:09.052398+00	2025-07-14 16:20:09.052398+00	banners/vvlife/vvlife-banner.jpg	\N	image/jpeg	\N
2be7346b-3705-41c4-8b70-39761e413de9	dde3babc-d612-4b08-b58b-70fa80fba408	/scraped-images/work-projects/vvlife/vvlife-gallery-1.jpg	vvlife gallery 2	\N	2	gallery	2025-07-14 16:20:09.170255+00	2025-07-14 16:20:09.170255+00	gallerys/vvlife/vvlife-gallery-1.jpg	\N	image/jpeg	\N
6fac865d-da81-4a24-9f1d-56a3c9cb7426	dde3babc-d612-4b08-b58b-70fa80fba408	/scraped-images/work-projects/vvlife/vvlife-gallery-2.jpg	vvlife gallery 3	\N	3	gallery	2025-07-14 16:20:09.280983+00	2025-07-14 16:20:09.280983+00	gallerys/vvlife/vvlife-gallery-2.jpg	\N	image/jpeg	\N
537d7b85-5856-41ff-8854-395e56757c00	dde3babc-d612-4b08-b58b-70fa80fba408	/scraped-images/work-projects/vvlife/vvlife-gallery-3.jpg	vvlife gallery 4	\N	4	gallery	2025-07-14 16:20:09.384502+00	2025-07-14 16:20:09.384502+00	gallerys/vvlife/vvlife-gallery-3.jpg	\N	image/jpeg	\N
761c3f44-4468-4b58-b01a-c125cc98585e	dde3babc-d612-4b08-b58b-70fa80fba408	/scraped-images/work-projects/vvlife/vvlife-gallery-4.jpg	vvlife gallery 5	\N	5	gallery	2025-07-14 16:20:09.499655+00	2025-07-14 16:20:09.499655+00	gallerys/vvlife/vvlife-gallery-4.jpg	\N	image/jpeg	\N
6d3b5986-dac8-49cd-819c-ca0df01a8944	dde3babc-d612-4b08-b58b-70fa80fba408	/scraped-images/work-projects/vvlife/vvlife-gallery-5.jpg	vvlife gallery 6	\N	6	gallery	2025-07-14 16:20:09.612777+00	2025-07-14 16:20:09.612777+00	gallerys/vvlife/vvlife-gallery-5.jpg	\N	image/jpeg	\N
26202f05-0bd8-46a9-8309-b7dcfbee3ed9	dde3babc-d612-4b08-b58b-70fa80fba408	/scraped-images/work-projects/vvlife/vvlife-gallery-6.jpg	vvlife gallery 7	\N	7	gallery	2025-07-14 16:20:09.728171+00	2025-07-14 16:20:09.728171+00	gallerys/vvlife/vvlife-gallery-6.jpg	\N	image/jpeg	\N
639afce2-0768-4e62-8252-10d99e25930d	55e61848-284a-43df-be70-c0299917bb6c	/scraped-images/work-projects/zurichinsurance/zurichinsurance-banner.jpg	zurichinsurance banner 1	\N	1	banner	2025-07-14 16:20:09.842724+00	2025-07-14 16:20:09.842724+00	banners/zurichinsurance/zurichinsurance-banner.jpg	\N	image/jpeg	\N
22852a46-4a36-42eb-9e4e-7e6d5c731ad7	55e61848-284a-43df-be70-c0299917bb6c	/scraped-images/work-projects/zurichinsurance/zurichinsurance-gallery-1.jpg	zurichinsurance gallery 2	\N	2	gallery	2025-07-14 16:20:09.944759+00	2025-07-14 16:20:09.944759+00	gallerys/zurichinsurance/zurichinsurance-gallery-1.jpg	\N	image/jpeg	\N
8c131070-9706-4143-b63e-ec42b4713164	55e61848-284a-43df-be70-c0299917bb6c	/scraped-images/work-projects/zurichinsurance/zurichinsurance-gallery-2.jpg	zurichinsurance gallery 3	\N	3	gallery	2025-07-14 16:20:10.053212+00	2025-07-14 16:20:10.053212+00	gallerys/zurichinsurance/zurichinsurance-gallery-2.jpg	\N	image/jpeg	\N
dfcaf696-4004-418c-ac33-1fb1345206f4	55e61848-284a-43df-be70-c0299917bb6c	/scraped-images/work-projects/zurichinsurance/zurichinsurance-gallery-3.jpg	zurichinsurance gallery 4	\N	4	gallery	2025-07-14 16:20:10.150614+00	2025-07-14 16:20:10.150614+00	gallerys/zurichinsurance/zurichinsurance-gallery-3.jpg	\N	image/jpeg	\N
e3f1c393-c6ff-4201-b505-7818e0c59fe2	55e61848-284a-43df-be70-c0299917bb6c	/scraped-images/work-projects/zurichinsurance/zurichinsurance-gallery-4.jpg	zurichinsurance gallery 5	\N	5	gallery	2025-07-14 16:20:10.260601+00	2025-07-14 16:20:10.260601+00	gallerys/zurichinsurance/zurichinsurance-gallery-4.jpg	\N	image/jpeg	\N
2f0c2dd2-c516-4200-93d3-37117fe26606	55e61848-284a-43df-be70-c0299917bb6c	/scraped-images/work-projects/zurichinsurance/zurichinsurance-gallery-5.jpg	zurichinsurance gallery 6	\N	6	gallery	2025-07-14 16:20:10.358594+00	2025-07-14 16:20:10.358594+00	gallerys/zurichinsurance/zurichinsurance-gallery-5.jpg	\N	image/jpeg	\N
896dd471-8af8-4ba0-be7f-86ab46254dcc	55e61848-284a-43df-be70-c0299917bb6c	/scraped-images/work-projects/zurichinsurance/zurichinsurance-gallery-6.jpg	zurichinsurance gallery 7	\N	7	gallery	2025-07-14 16:20:10.460428+00	2025-07-14 16:20:10.460428+00	gallerys/zurichinsurance/zurichinsurance-gallery-6.jpg	\N	image/jpeg	\N
2a4ea12b-28be-48f9-b8fd-3a16295cbb01	55e61848-284a-43df-be70-c0299917bb6c	/scraped-images/work-projects/zurichinsurance/zurichinsurance-gallery-7.jpg	zurichinsurance gallery 8	\N	8	gallery	2025-07-14 16:20:10.572775+00	2025-07-14 16:20:10.572775+00	gallerys/zurichinsurance/zurichinsurance-gallery-7.jpg	\N	image/jpeg	\N
123752ae-d277-4eb6-8b90-3088f52a0be2	10b32f1a-0e31-4c2c-8fad-4d4f17980a9f	/scraped-images/work-projects/managementconsultingsg/managementconsultingsg-banner.jpg	Singapore Management banner image	\N	0	banner	2025-07-15 13:48:39.303691+00	2025-07-15 13:48:39.303691+00	\N	\N	\N	\N
\.
COPY public.projects (id, title, subtitle, slug, banner_image_url, order_index, category_id, published_at, created_at, updated_at, is_published, description, year, size, location, scope, legacy_id, featured) FROM stdin;
f087ec15-4657-40fb-ba52-295d83487ef0	Rice Communications	Creative Agency	ricecommunications	/scraped-images/work-projects/ricecommunications/ricecommunications-banner.jpg	26	bf617c76-44fa-4702-bd2f-6d9de0752fe0	2022-01-15 00:00:00+00	2025-07-14 12:43:35.103225+00	2025-09-09 05:22:51.799584+00	t	{"meta": {"source": "static_data", "newLength": 834, "generatedAt": "2025-09-09T05:20:46.011Z", "originalLength": 289}, "format": "html", "content": "<h2>Project Overview</h2>\\n<p>With the opening of a new Asia-Pacific headquarters coupled with the agency's rebrand. Previously in Tanjong Pagar, the new digs reside at Haw Par Glass Tower in Dhoby Ghaut. Standing at approximately 5,000 sq ft (2.5 times bigger than the previous office) Rice's new home sports high ceilings, big windows with views of Fort Canning Park, and an open, airy feel with lots of space for people to work in comfort, both alone and collaboratively.</p>\\n\\n<h3>Design Approach</h3>\\n<p>Read more at: http://www.campaignasia.com/gallery/best-spaces-to-work-rice-singapore/442429</p>\\n\\n<h3>Project Specifications</h3>\\n<ul>\\n<li><strong>Size</strong>: 1,800 sqft</li>\\n<li><strong>Location</strong>: Suntec Tower 4 Level 42</li>\\n<li><strong>Scope</strong>: Design & build</li>\\n<li><strong>Year</strong>: 2017</li>\\n</ul>"}	2017	12,000 sqft	Singapore	Design & Build	ricecommunications	f
8bdb202f-1151-4a04-9271-5b7925061571	Public Health IT & Clinical Research Organisation	Healthcare Innovation	iqvia	/scraped-images/work-projects/iqvia/iqvia-banner.jpg	17	cea72569-f89c-4103-bf5c-34d3c00d8dce	2022-10-18 00:00:00+00	2025-07-14 12:43:35.103225+00	2025-09-09 05:22:51.697105+00	t	{"meta": {"source": "static_data", "newLength": 919, "generatedAt": "2025-09-09T05:20:45.911Z", "originalLength": 558}, "format": "html", "content": "<h2>Project Overview</h2>\\n<p>A consolidation of 2 entities to form a new publicly listed company in the US paved the way for a new workplace designed by Wolf to usher in a new era for both organisations. The workplace is designed as a fully agile activity based working environment, providing a variety of work cafes, touchdown, and team-based neighbourhoods thought out each floor. Each Neighbourhood was designed as a self sustainable space for teams to work individually and collaboratively.</p>\\n\\n<h3>Design Approach</h3>\\n<p>The project was delivered on a limited capex, challenging the designer to utilise creative and innovative ways to create special experiences in functional spaces.</p>\\n\\n<h3>Project Specifications</h3>\\n<ul>\\n<li><strong>Size</strong>: 50,000 sqft</li>\\n<li><strong>Location</strong>: 79 Anson Rd</li>\\n<li><strong>Scope</strong>: Design Consultancy</li>\\n<li><strong>Year</strong>: 2019</li>\\n</ul>"}	2019	28,000 sqft	Singapore	Design & Build	iqvia	f
a9366983-fd27-43df-be70-7b2196860111	Lufax	China's Fintech Giant	lufax	/scraped-images/work-projects/lufax/lufax-banner.jpg	21	bbfb7694-37b1-4087-801b-f8bbe8c402d5	2022-06-10 00:00:00+00	2025-07-14 12:43:35.103225+00	2025-09-09 05:22:51.434241+00	t	{"meta": {"source": "static_data", "newLength": 613, "generatedAt": "2025-09-09T05:20:45.655Z", "originalLength": 530}, "format": "html", "content": "<h2>Project Overview</h2>\\n<p>WOLF was engaged by LUFAX, one of China's giant fintech firms to design and build their first office in Singapore to serve as their new regional hub. The design through the use of materials, haptics and graphic imagery capture the spirit of Asia in a setting of a silicon valley inspired work environment designed to promote interaction and ideation.</p>\\n\\n<h3>Project Specifications</h3>\\n<ul>\\n<li><strong>Size</strong>: 3,500 sqft</li>\\n<li><strong>Location</strong>: MBFC Tower 2 Level 13</li>\\n<li><strong>Scope</strong>: Design & build</li>\\n<li><strong>Year</strong>: 2017</li>\\n</ul>"}	2017	35,000 sqft	Singapore	Design & Build	lufax	f
df150485-bfd6-4bf4-9a83-ac8c150e7050	MYP	SGX-Listed Investment Firm	myp	/scraped-images/work-projects/myp/myp-banner.jpg	19	bbfb7694-37b1-4087-801b-f8bbe8c402d5	2022-08-20 00:00:00+00	2025-07-14 12:43:35.103225+00	2025-09-09 05:22:51.599107+00	t	{"meta": {"source": "static_data", "newLength": 686, "generatedAt": "2025-09-09T05:20:45.825Z", "originalLength": 556}, "format": "html", "content": "<h2>Project Overview</h2>\\n<p>WOLF was engaged by MYP, an SGX mainboard listed company that invests in Realestate to relocate their headquarters to their new building in Battery Road.</p>\\n\\n<h3>Design Approach</h3>\\n<p>Inspired by a contoured design language and rich materials, the office exhumes a distinctive and strong presence. A custom laser cut feature wall was bespoke designed by Wolf to create wonderfully subtle yet detailed architectural feature.</p>\\n\\n<h3>Project Specifications</h3>\\n<ul>\\n<li><strong>Size</strong>: 5,000 sqft</li>\\n<li><strong>Location</strong>: MYP Centre Level 9</li>\\n<li><strong>Scope</strong>: Design & build</li>\\n<li><strong>Year</strong>: 2018</li>\\n</ul>"}	2018	20,000 sqft	Singapore	Design & Build	myp	f
55e61848-284a-43df-be70-c0299917bb6c	Zurich Insurance	Insurance Office	zurichinsurance	/scraped-images/work-projects/zurichinsurance/zurichinsurance-banner.jpg	22	bbfb7694-37b1-4087-801b-f8bbe8c402d5	2022-05-08 00:00:00+00	2025-07-14 12:43:35.103225+00	2025-09-09 05:22:52.173883+00	t	{"meta": {"source": "static_data", "newLength": 820, "generatedAt": "2025-09-09T05:20:46.248Z", "originalLength": 305}, "format": "html", "content": "<h2>Project Overview</h2>\\n<p>Wolf was engaged to transform the Zurich Insurance office in a Live working environment. The workplace was transformed over a series of phased weekend works to refresh the entire workplace.</p>\\n\\n<h3>Design Approach</h3>\\n<p>The project involved a total change in furniture and relocating the staff cafe to connect with the client reception and meeting room zone to create a single communal zone for all staff and visitors to come together. A flexible design for the boardroom meant the ability to create a large staff town-hall and client entertainment zone.</p>\\n\\n<h3>Project Specifications</h3>\\n<ul>\\n<li><strong>Size</strong>: 13,000 sqft</li>\\n<li><strong>Location</strong>: Singapore Land Tower</li>\\n<li><strong>Scope</strong>: Design & Build</li>\\n<li><strong>Year</strong>: 2018</li>\\n</ul>"}	2018	24,000 sqft	Singapore	Design & Build	zurichinsurance	f
da1bc1cc-e6b6-40bd-b80b-70892a70ce1c	Emerson	Automation Specialists	emerson	/scraped-images/work-projects/emerson/emerson-banner.jpg	13	bf617c76-44fa-4702-bd2f-6d9de0752fe0	2023-02-15 00:00:00+00	2025-07-14 12:43:35.103225+00	2025-09-09 05:22:51.05327+00	t	{"meta": {"source": "static_data", "newLength": 493, "generatedAt": "2025-09-09T05:20:45.286Z", "originalLength": 488}, "format": "html", "content": "<h2>Project Overview</h2>\\n<p>Emerson engaged Wolf to design and build their new office in Pandan Crescent to create a fresh new workplace that provided a clean and bright environment that captured portrayed their brand in a modern and minimalist design approach.</p>\\n\\n<h3>Project Specifications</h3>\\n<ul>\\n<li><strong>Size</strong>: 23,000 sqft</li>\\n<li><strong>Location</strong>: 1 Pandan Crescent</li>\\n<li><strong>Scope</strong>: Design & build</li>\\n<li><strong>Year</strong>: 2018</li>\\n</ul>"}	2018	28,000 sqft	Mapletree Business City	Design & Build	emerson	f
58e1ece2-dd8d-4c30-9f22-5d61a88636df	BOSCH	Making history, engineering the future	bosch	/scraped-images/work-projects/bosch/bosch-banner.jpg	11	bf617c76-44fa-4702-bd2f-6d9de0752fe0	2023-04-05 00:00:00+00	2025-07-14 12:43:35.103225+00	2025-09-09 05:22:50.893962+00	t	{"meta": {"source": "static_data", "newLength": 633, "generatedAt": "2025-09-09T05:20:45.125Z", "originalLength": 577}, "format": "html", "content": "<h2>Project Overview</h2>\\n<p>Wolf was tasked to carry out live office refresh of the Bosch headquarters in Singapore. The challenge: To spark enthusiasm, improve quality of life, and help conserve natural resources as part of the new workplace initiatives that align with their mission.</p>\\n\\n<h3>Design Approach</h3>\\n<p>The result: An uplifting and refreshing workplace that spark happiness.</p>\\n\\n<h3>Project Specifications</h3>\\n<ul>\\n<li><strong>Size</strong>: 25,000 sqft</li>\\n<li><strong>Location</strong>: Robert Bosch Building Bishan</li>\\n<li><strong>Scope</strong>: Design & Build</li>\\n<li><strong>Year</strong>: 2019</li>\\n</ul>"}	2019	40,000 sqft	Singapore	Design & Build	bosch	f
11a498ca-31aa-4e0a-971a-ca5a2e12c3d5	Management Consulting Firm	Strategic Excellence in Hong Kong	hongkongmanagement	/scraped-images/work-projects/hongkongmanagement/hongkongmanagement-banner.jpg	6	6d1fed94-687b-4af4-8c48-eee903f8bb71	2023-07-30 00:00:00+00	2025-07-14 12:43:35.103225+00	2025-09-09 05:22:51.498729+00	t	{"meta": {"source": "static_data", "newLength": 1278, "generatedAt": "2025-09-09T05:20:45.693Z", "originalLength": 580}, "format": "html", "content": "<h2>Project Overview</h2>\\n<p>This office interior design project is centered around the headquarters of our esteemed client in Hong Kong. The objective was to create an innovative, agile, and collaborative workspace for their consultants.</p>\\n\\n<h3>Design Approach</h3>\\n<p>The design incorporated elements of hospitality in the reception and café areas, ensuring a warm welcome to clients and employees alike. Additionally, a large town hall space within the café will be highly flexible, enabling diverse use, and the integration of unique, local Hong Kong-inspired murals throughout the office facilitated intuitive wayfinding.</p>\\n\\n<h3>Key Features</h3>\\n<ul>\\n<li><strong>Modern Design</strong> - Contemporary workspace design reflecting brand identity</li>\\n<li><strong>Collaborative Spaces</strong> - Open areas designed for team interaction and collaboration</li>\\n<li><strong>Technology Integration</strong> - State-of-the-art equipment and connectivity solutions</li>\\n<li><strong>Prime Location</strong> - Strategically located in Hong Kong</li>\\n</ul>\\n\\n<h3>Project Specifications</h3>\\n<ul>\\n<li><strong>Size</strong>: 30,000 sqft</li>\\n<li><strong>Location</strong>: Hong Kong</li>\\n<li><strong>Scope</strong>: Design Consultancy</li>\\n<li><strong>Year</strong>: 2022</li>\\n</ul>"}	2022	25,000 sqft	Hong Kong	Design & Build	hongkongmanagement	f
ed511fab-cf1b-4464-96b8-b724c1c6ee09	IHH Healthcare	A workplace without boundaries	ihh	/scraped-images/work-projects/ihh/ihh-banner.jpg	9	cea72569-f89c-4103-bf5c-34d3c00d8dce	2023-05-10 00:00:00+00	2025-07-14 12:43:35.103225+00	2025-09-09 04:43:15.330124+00	t	{"meta": {"source": "remaining-static-files", "version": "3.0", "lastModified": "2025-09-09T04:43:15.477Z"}, "format": "html", "content": "<p>The project itself comprised of 2 different locations, which were at 80 Bendemeer and Harbourfront. The key concept was to have a different design theme across the 2 spaces while also creating a connection across all IHH locations.</p>\\n<p>The key design challenge was to strike that balance between introducing different design elements so each location would have a its own unique flavour and expression, but at the same time have that unifying signature IHH element and branding.</p>\\n<p>The key to the space planning and workplace design was to have a wide variety of different types of work points and breaking away from the typical workstation offering. A highly agile working environment created a variety of more collaborative seats, huddle spaces, hotdesks and quiet zones for people to have more choice for work setting.</p>"}	2023	60,000 sqft	Singapore	Design Consultancy	ihh	t
dc18e22c-c280-4463-bd94-8d801169d8c6	Bayer (South East Asia) Pte Ltd	Science for a better life. A Workplace for a better future.	bayer	/scraped-images/work-projects/bayer/bayer-banner.jpg	18	cea72569-f89c-4103-bf5c-34d3c00d8dce	2022-09-25 00:00:00+00	2025-07-14 12:43:35.103225+00	2025-09-09 05:22:50.795495+00	t	{"meta": {"source": "static_data", "newLength": 1115, "generatedAt": "2025-09-09T05:20:45.062Z", "originalLength": 706}, "format": "html", "content": "<h2>Project Overview</h2>\\n<p>Wolf was engaged to design and build the regional headquarters of Bayer in Paya Lebar Quarter 3 offering a full turn key service from design, project management, and construction.</p>\\n\\n<h3>Design Approach</h3>\\n<p>The approach was to create a bright and positive atmosphere that promotes a collaborative work environment utilizing best-in-class work spaces and technology that bring a warm sense of optimism and innovation.</p>\\n\\n<h3>Key Features</h3>\\n<ul>\\n<li><strong>Modern Design</strong> - Contemporary workspace design reflecting brand identity</li>\\n<li><strong>Collaborative Spaces</strong> - Open areas designed for team interaction and collaboration</li>\\n<li><strong>Technology Integration</strong> - State-of-the-art equipment and connectivity solutions</li>\\n<li><strong>Prime Location</strong> - Strategically located in Paya Lebar Quarter</li>\\n</ul>\\n\\n<h3>Project Specifications</h3>\\n<ul>\\n<li><strong>Size</strong>: 32,000 sqft</li>\\n<li><strong>Location</strong>: Paya Lebar Quarter</li>\\n<li><strong>Scope</strong>: Design & Build</li>\\n<li><strong>Year</strong>: 2019</li>\\n</ul>"}	2019	32,000 sqft	Paya Lebar Quarter	Design & Build	bayer	t
b584c226-9ff8-4a14-ace7-3ef25edd4ebd	Goodpack	Corporate Office	goodpack	/scraped-images/work-projects/goodpack/goodpack-banner.jpg	15	bf617c76-44fa-4702-bd2f-6d9de0752fe0	2022-12-15 00:00:00+00	2025-07-14 12:43:35.103225+00	2025-09-09 05:22:51.132999+00	t	{"meta": {"source": "static_data", "newLength": 674, "generatedAt": "2025-09-09T05:20:45.382Z", "originalLength": 510}, "format": "html", "content": "<h2>Project Overview</h2>\\n<p>A home grown logistics solution provider, Goodpack tasked Wolf to design a new Singapore headquarters and warehouse demo showcase in and industrial building in Changi. The project involved a co-creation space linked with warehouse demo zone to innovate and incubate new initiatives. The activity based workplace provided their staff a variety of work settings and a central cafe for lunch and learn sessions.</p>\\n\\n<h3>Project Specifications</h3>\\n<ul>\\n<li><strong>Size</strong>: 20,000 sqft</li>\\n<li><strong>Location</strong>: Changi South Street</li>\\n<li><strong>Scope</strong>: Design Consultancy</li>\\n<li><strong>Year</strong>: 2019</li>\\n</ul>"}	2019	22,000 sqft	Singapore	Design & Build	goodpack	f
dde3babc-d612-4b08-b58b-70fa80fba408	VV Life	Technology Innovation	vvlife	/scraped-images/work-projects/vvlife/vvlife-banner.jpg	27	006c0f19-1691-4bae-85e1-470eb5e1871c	2021-12-20 00:00:00+00	2025-07-14 12:43:35.103225+00	2025-09-09 05:22:52.108881+00	t	{"meta": {"source": "static_data", "newLength": 577, "generatedAt": "2025-09-09T05:20:46.212Z", "originalLength": 306}, "format": "html", "content": "<h2>Project Overview</h2>\\n<p>VV Life is a a tech company that is powered by leading technologies to connect merchants and consumers seamlessly with an array of lifestyle solutions. This Singapore office was part of the organisations first foray into Singapore with a warm and sleek workplace that provided platform for their teams to grow and innovate.</p>\\n\\n<h3>Project Specifications</h3>\\n<ul>\\n<li><strong>Size</strong>: 10,000 sqft</li>\\n<li><strong>Location</strong>: Asia Square</li>\\n<li><strong>Scope</strong>: Design & Build</li>\\n<li><strong>Year</strong>: 2019</li>\\n</ul>"}	2019	22,000 sqft	Singapore	Design & Build	vvlife	f
ef5d39ee-262e-4877-b109-95e56a0892d8	Philip Morris Singapore	Corporate Office	philipmorrissingapore	/scraped-images/work-projects/philipmorrissingapore/philipmorrissingapore-banner.jpg	16	bf617c76-44fa-4702-bd2f-6d9de0752fe0	2022-11-22 00:00:00+00	2025-07-14 12:43:35.103225+00	2025-09-09 05:22:51.651164+00	t	{"meta": {"source": "static_data", "newLength": 1438, "generatedAt": "2025-09-09T05:20:45.861Z", "originalLength": 498}, "format": "html", "content": "<h2>Project Overview</h2>\\n<p>When Wolf was engaged to design the the new Philip Morris office in Singapore, it was an opportunity to design a workplace that would be symbolic of the company's ongoing transformation to building a future on replacing cigarettes with smoke-free alternatives.</p>\\n\\n<h3>Design Approach</h3>\\n<p>The approach was to infuse natural materials, greenery, and a light refreshing design expression. The workplace was designed for both office based employees and sales staff that we on the road for the majority of each day. The solution was to create a flexible sales team zone that is configurable to create project and town hall based spaces when required.</p>\\n\\n<h3>Key Features</h3>\\n<ul>\\n<li><strong>The openplan</strong> - The open-plan office space is interspersed with informal areas and 'themed' meeting rooms with different configurations that offer users with more choice</li>\\n<li><strong>The result</strong> - The result is an impression of calm collaboration and creativity</li>\\n<li><strong>A space</strong> - A space that captures the spirit of the new brand with an expression of local Asian culture and the personalities of the people who make up the business</li>\\n</ul>\\n\\n<h3>Project Specifications</h3>\\n<ul>\\n<li><strong>Size</strong>: 24,000 sqft</li>\\n<li><strong>Location</strong>: E-Centre @ Redhill</li>\\n<li><strong>Scope</strong>: Design Consultancy</li>\\n<li><strong>Year</strong>: 2019</li>\\n</ul>"}	2019	26,000 sqft	Singapore	Design & Build	philipmorrissingapore	f
0d596f5c-54cb-4566-bcfc-cc0bbf301607	CBRE	Real Estate Solutions	cbre	/scraped-images/work-projects/cbre/cbre-banner.jpg	14	bf617c76-44fa-4702-bd2f-6d9de0752fe0	2023-01-10 00:00:00+00	2025-07-14 12:43:35.103225+00	2025-09-09 05:22:50.943327+00	t	{"meta": {"source": "static_data", "newLength": 883, "generatedAt": "2025-09-09T05:20:45.195Z", "originalLength": 509}, "format": "html", "content": "<h2>Project Overview</h2>\\n<p>Wolf was engaged to design and build the new CBRE city office in Singapore, which involved a refresh and reconfiguration of the existing premises. The project was designed to complement and support the main head office located in Paya Lebar Quarter.</p>\\n\\n<h3>Design Approach</h3>\\n<p>The design emphasises a clear sense of organization, unity and openness that creates a work environment that is both refreshing and productive. The design of the activity-based space responds to the building's floor plan and provides a variety of work settings for either focused work or collaboration that ultimately flows into communal space.</p>\\n\\n<h3>Project Specifications</h3>\\n<ul>\\n<li><strong>Size</strong>: 6,000 sqft</li>\\n<li><strong>Location</strong>: 6 Battery Road</li>\\n<li><strong>Scope</strong>: Design & Build</li>\\n<li><strong>Year</strong>: 2019</li>\\n</ul>"}	2019	42,000 sqft	Marina Bay Financial Centre	Design & Build	cbre	t
42bafecd-ec91-4e52-b143-90eb3daae480	Resources	Bold and Professional	resources	/scraped-images/work-projects/resources/resources-banner.jpg	25	bf617c76-44fa-4702-bd2f-6d9de0752fe0	2022-02-10 00:00:00+00	2025-07-14 12:43:35.103225+00	2025-09-09 05:22:51.73907+00	t	{"meta": {"source": "static_data", "newLength": 527, "generatedAt": "2025-09-09T05:20:45.966Z", "originalLength": 286}, "format": "html", "content": "<h2>Project Overview</h2>\\n<p>WOLF was engaged to develop a high level concept design for our client that captures a bold, modern, and professional outlook. The use of clean lines and contrasting finishes and tones the client and employee experience is carried through the entire workplace.</p>\\n\\n<h3>Project Specifications</h3>\\n<ul>\\n<li><strong>Size</strong>: 20,000 sqft</li>\\n<li><strong>Location</strong>: Shenton Way Building</li>\\n<li><strong>Scope</strong>: Design consultancy</li>\\n<li><strong>Year</strong>: 2017</li>\\n</ul>"}	2017	18,000 sqft	Singapore	Design & Build	resources	f
4aa178eb-5798-408b-bdbd-ac47344fe497	RQAM	Financial Services	rqam	/scraped-images/work-projects/rqam/rqam-banner.jpg	10	bbfb7694-37b1-4087-801b-f8bbe8c402d5	2023-04-25 00:00:00+00	2025-07-14 12:43:35.103225+00	2025-09-09 05:22:51.917568+00	t	{"meta": {"source": "static_data", "newLength": 722, "generatedAt": "2025-09-09T05:20:46.080Z", "originalLength": 312}, "format": "html", "content": "<h2>Project Overview</h2>\\n<p>RQAM manages One Raffles Quay and Marina Bay Financial Centre and tasked Wolf to design a timeless, engaging and employee centric workplace that also showcased how their developments could facilitate best in class office spaces.</p>\\n\\n<h3>Design Approach</h3>\\n<p>The project is also Singapore's first to be certified under the new BCA Greenmark Scheme. Applying best practices in design, engineering and employee wellness the project achieved a platinum rating.</p>\\n\\n<h3>Project Specifications</h3>\\n<ul>\\n<li><strong>Size</strong>: 8,000 sqft</li>\\n<li><strong>Location</strong>: One Raffles Quay</li>\\n<li><strong>Scope</strong>: Design consultancy</li>\\n<li><strong>Year</strong>: 2019</li>\\n</ul>"}	2019	16,000 sqft	Singapore	Design & Build	rqam	f
b4f11f94-eb64-4fed-a2a2-7ca0a0e80b98	Global Management Consulting and Professional Services Firm	Professional Services Excellence	globalconsultinggiant	/scraped-images/work-projects/globalconsultinggiant/globalconsultinggiant-banner.jpg	12	6d1fed94-687b-4af4-8c48-eee903f8bb71	2023-03-20 00:00:00+00	2025-07-14 12:43:35.103225+00	2025-09-09 05:22:51.089046+00	t	{"meta": {"source": "static_data", "newLength": 593, "generatedAt": "2025-09-09T05:20:45.332Z", "originalLength": 568}, "format": "html", "content": "<h2>Project Overview</h2>\\n<p>A global giant in the industry, Wolf was tasked to design across 2 sites in Malaysia concurrently and deliver a creative and inspiring working environment for otherwise traditional delivery center. The result, a rich tapestry of finishes and features that embraces local culture and provides a fun and creative place to work.</p>\\n\\n<h3>Project Specifications</h3>\\n<ul>\\n<li><strong>Size</strong>: 52,000 sqft</li>\\n<li><strong>Location</strong>: Kuala Lumpur Malaysia</li>\\n<li><strong>Scope</strong>: Design Consultancy</li>\\n<li><strong>Year</strong>: 2019</li>\\n</ul>"}	2019	45,000 sqft	Marina Bay Financial Centre	Design & Build	globalconsultinggiant	t
b3de5b44-4ff7-434e-bfd3-c5c2dbf554fb	HANS IM GLÜCK	German Burger Grill	hansimgluck	/scraped-images/work-projects/hansimgluck/hansimgluck-banner.jpg	28	05ba3195-8e8d-4b18-86c2-ad4b31d8376f	2021-11-25 00:00:00+00	2025-07-14 12:43:35.103225+00	2025-09-09 05:22:51.189544+00	t	{"meta": {"source": "static_data", "newLength": 927, "generatedAt": "2025-09-09T05:20:45.426Z", "originalLength": 518}, "format": "html", "content": "<h2>Project Overview</h2>\\n<p>Hans Im Gluck from Germany needed to open their first Bar & Grill in Singapore, WOLF was tasked with the design and build of their first foray into Asia.</p>\\n\\n<h3>Design Approach</h3>\\n<p>Located within a rare freestanding pavilion right on Orchard Road, the Bar and Grill captures the brand and identity of the Restaurant from Germany, providing a unique dining and drinking experience amongst Birch Trees in a bright and airy lunchtime atmosphere and intimate mood in the evenings. WOLF worked closely with the Bespoke design team from Germany to ensure the project was successfully delivered within the aggressive timeline and to high European high standards.</p>\\n\\n<h3>Project Specifications</h3>\\n<ul>\\n<li><strong>Size</strong>: 4,000 sqft</li>\\n<li><strong>Location</strong>: 362 Orchard Rd Singapore</li>\\n<li><strong>Scope</strong>: Design & Build</li>\\n<li><strong>Year</strong>: 2017</li>\\n</ul>"}	2017	8,000 sqft	Singapore	Design & Build	hansimgluck	f
0bf9a1e7-1cd1-46d7-b0c3-e983913b3ff1	Life Science & Clinical Manufacturer	Manufacturer	lifesciencemanufacturer	/scraped-images/work-projects/lifesciencemanufacturer/lifesciencemanufacturer-banner.jpg	20	cea72569-f89c-4103-bf5c-34d3c00d8dce	2022-07-15 00:00:00+00	2025-07-14 12:43:35.103225+00	2025-09-09 05:22:51.383218+00	t	{"meta": {"source": "static_data", "newLength": 1199, "generatedAt": "2025-09-09T05:20:45.610Z", "originalLength": 502}, "format": "html", "content": "<h2>Project Overview</h2>\\n<p>Wolf was engaged to design and build a new office, Lab and warehouse facility by a global leader in developing, manufacturing, and marketing of innovative products for the life science research and clinical diagnostic markets. The workplace design carried a clean and fresh aesthetic, exhuming a sense of precision that is synonymous with the company brand.</p>\\n\\n<h3>Design Approach</h3>\\n<p>The use of Light Oak timber, neutral tones, and soft patterns created a pleasant and calming place for work.</p>\\n\\n<h3>Key Features</h3>\\n<ul>\\n<li><strong>Modern Design</strong> - Contemporary workspace design reflecting brand identity</li>\\n<li><strong>Collaborative Spaces</strong> - Open areas designed for team interaction and collaboration</li>\\n<li><strong>Technology Integration</strong> - State-of-the-art equipment and connectivity solutions</li>\\n<li><strong>Prime Location</strong> - Strategically located in IBP @ ICON</li>\\n</ul>\\n\\n<h3>Project Specifications</h3>\\n<ul>\\n<li><strong>Size</strong>: 10,000 sqft + 30,000sqft warehouse</li>\\n<li><strong>Location</strong>: IBP @ ICON</li>\\n<li><strong>Scope</strong>: Design & Build</li>\\n<li><strong>Year</strong>: 2019</li>\\n</ul>"}	2019	24,000 sqft	Singapore	Design & Build	lifesciencemanufacturer	f
82d8b5c2-272e-412f-9c9b-612032fa8f83	Dassault Systèmes	Global Leader in 3D Software	dassaultsystemes	/scraped-images/work-projects/dassaultsystemes/dassaultsystemes-banner.jpg	24	006c0f19-1691-4bae-85e1-470eb5e1871c	2022-03-10 00:00:00+00	2025-07-14 12:43:35.103225+00	2025-09-09 05:22:50.995214+00	t	{"meta": {"source": "static_data", "newLength": 613, "generatedAt": "2025-09-09T05:20:45.229Z", "originalLength": 507}, "format": "html", "content": "<h2>Project Overview</h2>\\n<p>WOLF was engaged by Dassault Systèmes, a global leader in 3D software to design and build their Singapore Headquarters.</p>\\n\\n<h3>Design Approach</h3>\\n<p>The brief was to create a clean and minimalist design language to create a refreshing and precise environment for their staff to focus on creating virtual universes that drive the company's business.</p>\\n\\n<h3>Project Specifications</h3>\\n<ul>\\n<li><strong>Size</strong>: 10,500 sqft</li>\\n<li><strong>Location</strong>: Tampines Grande L6</li>\\n<li><strong>Scope</strong>: Design & build</li>\\n<li><strong>Year</strong>: 2017</li>\\n</ul>"}	2017	30,000 sqft	Singapore	Design & Build	dassaultsystemes	f
2d4ee1b7-c3cc-4dec-bfdb-3688d642fd4e	Heineken	A workplace, A Bar, an East meets West melting pot of 2 brands	heineken	/scraped-images/work-projects/heineken/heineken-banner.jpg	4	bf617c76-44fa-4702-bd2f-6d9de0752fe0	2023-09-05 00:00:00+00	2025-07-14 12:43:35.103225+00	2025-09-09 05:22:51.242677+00	t	{"meta": {"source": "static_data", "newLength": 1312, "generatedAt": "2025-09-09T05:20:45.483Z", "originalLength": 689}, "format": "html", "content": "<h2>Project Overview</h2>\\n<p>The new Heineken workplace in Singapore brings together both the Heineken and Tiger Beer brands together to create a new experience for staff and visitors. Wolf was engaged to carry our live office A&A works to totally transform the old office design to improve work settings, brand experience, and overall employee wellness in the new environment.</p>\\n\\n<h3>Design Approach</h3>\\n<p>A 'walk and talk' path (for wondering discussion) is woven through the office that connects the Bar, to key collaborative spaces, to shared meeting rooms and pantry facilities is a symbolic expression of both brands coming together in Singapore.</p>\\n\\n<h3>Key Features</h3>\\n<ul>\\n<li><strong>Modern Design</strong> - Contemporary workspace design reflecting brand identity</li>\\n<li><strong>Collaborative Spaces</strong> - Open areas designed for team interaction and collaboration</li>\\n<li><strong>Technology Integration</strong> - State-of-the-art equipment and connectivity solutions</li>\\n<li><strong>Prime Location</strong> - Strategically located in The Metropolis</li>\\n</ul>\\n\\n<h3>Project Specifications</h3>\\n<ul>\\n<li><strong>Size</strong>: 32,000 sqft</li>\\n<li><strong>Location</strong>: The Metropolis</li>\\n<li><strong>Scope</strong>: Design & Build</li>\\n<li><strong>Year</strong>: 2019</li>\\n</ul>"}	2019	32,000 sqft	The Metropolis	Design & Build	heineken	t
e23191c5-e55a-4375-a0b0-3f450f2a1c39	HOMEAWAY	A Home From Home	homeaway	/scraped-images/work-projects/homeaway/homeaway-banner.jpg	7	05ba3195-8e8d-4b18-86c2-ad4b31d8376f	2023-06-18 00:00:00+00	2025-07-14 12:43:35.103225+00	2025-09-09 05:22:51.293896+00	t	{"meta": {"source": "static_data", "newLength": 630, "generatedAt": "2025-09-09T05:20:45.529Z", "originalLength": 598}, "format": "html", "content": "<h2>Project Overview</h2>\\n<p>HomeAway is a vacation rental marketplace with more than 2,000,000 vacation rentals in 190 countries listed on its website. When tasked to design their new workplace in Singapore, WOLF captured the spirit of travel while capturing unique Singapore design touches to ensure that the office felt just as much of a destination as the places they share on their website.</p>\\n\\n<h3>Project Specifications</h3>\\n<ul>\\n<li><strong>Size</strong>: 6,000 sqft</li>\\n<li><strong>Location</strong>: UE Square Level 18</li>\\n<li><strong>Scope</strong>: Design Consultancy</li>\\n<li><strong>Year</strong>: 2019</li>\\n</ul>"}	2019	15,000 sqft	Singapore	Design & Build	homeaway	f
67cab6a0-0748-401d-a468-0c50e31fda4f	International Law Firm	Legal Office	internationallawfirm	/scraped-images/work-projects/internationallawfirm/internationallawfirm-banner.jpg	8	02d73a19-bb69-4ffc-8171-db18be281388	2023-05-30 00:00:00+00	2025-07-14 12:43:35.103225+00	2025-09-09 05:22:51.343192+00	t	{"meta": {"source": "static_data", "newLength": 1054, "generatedAt": "2025-09-09T05:20:45.566Z", "originalLength": 560}, "format": "html", "content": "<h2>Project Overview</h2>\\n<p>This top tier International Law Firm spanned across 25,000 square feet with a goal to transform and revolutionise the traditional legal industry's workspaces typology.</p>\\n\\n<h3>Design Approach</h3>\\n<p>Catering to approximately 200 staff members, the design encompasses a dynamic mix of private rooms, shared workspaces, team-based areas, open work cafes, and collaborative zones.</p>\\n\\n<h3>Key Features</h3>\\n<ul>\\n<li><strong>Modern Design</strong> - Contemporary workspace design reflecting brand identity</li>\\n<li><strong>Collaborative Spaces</strong> - Open areas designed for team interaction and collaboration</li>\\n<li><strong>Technology Integration</strong> - State-of-the-art equipment and connectivity solutions</li>\\n<li><strong>Prime Location</strong> - Strategically located in Singapore</li>\\n</ul>\\n\\n<h3>Project Specifications</h3>\\n<ul>\\n<li><strong>Size</strong>: 25,000 sqft</li>\\n<li><strong>Location</strong>: Singapore</li>\\n<li><strong>Scope</strong>: Design & Build</li>\\n<li><strong>Year</strong>: 2022</li>\\n</ul>"}	2022	30,000 sqft	Singapore	Design & Build	internationallawfirm	f
9e43248d-6bcf-4091-a447-044a44b797ab	Ride Hailing Giant	Technology Headquarters	ridehailinggiant	/scraped-images/work-projects/ridehailinggiant/ridehailinggiant-banner.jpg	5	006c0f19-1691-4bae-85e1-470eb5e1871c	2023-08-12 00:00:00+00	2025-07-14 12:43:35.103225+00	2025-09-09 05:22:51.857354+00	t	{"meta": {"source": "static_data", "newLength": 778, "generatedAt": "2025-09-09T05:20:46.044Z", "originalLength": 305}, "format": "html", "content": "<h2>Project Overview</h2>\\n<p>The new Asia Pacific Headquarters in Singapore was designed and built by Wolf, providing a total turn key service. The project captures a rich melting pot of cultures that is representative of the region the office supports. Rooms and collaborative spaces are themed to provide a nostalgic experience of good food synonymous with South East Asian cuisines.</p>\\n\\n<h3>Design Approach</h3>\\n<p>Mural Art and an eclectic mix of design accessories provided the finishing touches and talking points for visitors and staff.</p>\\n\\n<h3>Project Specifications</h3>\\n<ul>\\n<li><strong>Size</strong>: 20,000 sqft</li>\\n<li><strong>Location</strong>: New Grade-A Building</li>\\n<li><strong>Scope</strong>: Design & Build</li>\\n<li><strong>Year</strong>: 2019</li>\\n</ul>"}	2019	55,000 sqft	Singapore	Design & Build	ridehailinggiant	t
a8abbb70-90f1-43b7-88e9-3ebeebd47ae5	The WOLF den	Where great design happens	thewolfden	/scraped-images/work-projects/thewolfden/thewolfden-banner.jpg	23	bf617c76-44fa-4702-bd2f-6d9de0752fe0	2022-04-15 00:00:00+00	2025-07-14 12:43:35.103225+00	2025-09-09 05:22:52.047144+00	t	{"meta": {"source": "static_data", "newLength": 472, "generatedAt": "2025-09-09T05:20:46.177Z", "originalLength": 215}, "format": "html", "content": "<h2>Project Overview</h2>\\n<p>Our home, designed and built by the team at WOLF. It&apos;s an expression of who we are: Daring, edgy, and fun. We have a little piece of ourselves here and it&apos;s a home our team look forward to coming to each day.</p>\\n\\n<h3>Project Specifications</h3>\\n<ul>\\n<li><strong>Size</strong>: 2,000 sqft</li>\\n<li><strong>Location</strong>: Oxley Buzhub</li>\\n<li><strong>Scope</strong>: Design & build</li>\\n<li><strong>Year</strong>: 2017</li>\\n</ul>"}	2017	2,000 sqft	Oxley Buzhub	Design & build	thewolfden	t
79cf0fc8-98ac-44de-b1ff-79c6a22dbca7	Swiss Bank	Financial Services	swissbank	/scraped-images/work-projects/swissbank/swissbank-banner.jpg	2	bbfb7694-37b1-4087-801b-f8bbe8c402d5	2023-11-15 00:00:00+00	2025-07-14 12:43:35.103225+00	2025-09-09 05:22:51.984531+00	t	{"meta": {"source": "static_data", "newLength": 1104, "generatedAt": "2025-09-09T05:20:46.132Z", "originalLength": 318}, "format": "html", "content": "<h2>Project Overview</h2>\\n<p>This project for a large Swiss Bank in Singapore consolidated over 3000 staff in wealth management, investment bank and asset management together within an entire building designed by Wolf.</p>\\n\\n<h3>Design Approach</h3>\\n<p>Outfitted with innovative future workplace concepts and customized health and well-being facilities, this 381,000 square foot state-of-the-art facility defined new ways of working for the organisation.</p>\\n\\n<h3>Key Features</h3>\\n<ul>\\n<li><strong>Modern Design</strong> - Contemporary workspace design reflecting brand identity</li>\\n<li><strong>Collaborative Spaces</strong> - Open areas designed for team interaction and collaboration</li>\\n<li><strong>Technology Integration</strong> - State-of-the-art equipment and connectivity solutions</li>\\n<li><strong>Prime Location</strong> - Strategically located in Singapore</li>\\n</ul>\\n\\n<h3>Project Specifications</h3>\\n<ul>\\n<li><strong>Size</strong>: 380,000 sqft</li>\\n<li><strong>Location</strong>: Singapore</li>\\n<li><strong>Scope</strong>: Design Consultancy</li>\\n<li><strong>Year</strong>: 2022</li>\\n</ul>"}	2022	40,000 sqft	Singapore	Design & Build	swissbank	t
4dcb6dd4-4149-447b-9ad1-7f1267bd059c	Management Consulting Firm	Consulting Firm	managementconsultingfirm	/scraped-images/work-projects/managementconsultingfirm/managementconsultingfirm-banner.jpg	1	6d1fed94-687b-4af4-8c48-eee903f8bb71	2024-01-01 00:00:00+00	2025-07-14 12:43:35.103225+00	2025-09-09 05:42:39.650212+00	t	{"meta": {"version": "1.0", "lastModified": "2025-09-09T05:42:38.982Z"}, "format": "html", "content": "<h2>Project Overview</h2><p>This project created a modern workspace for a leading consulting firm in Taipei. The design focused on creating an environment that promotes collaboration while maintaining the professional aesthetic expected of a high-end consultancy.</p><h3>Design Challenge</h3><p>The key design challenge was balancing open, collaborative areas with private spaces needed for confidential client work. We implemented a comprehensive solution that addresses these competing needs:</p><ul class=\\"bullet-list\\"><li class=\\"list-item\\"><p><strong>Open plan workstations</strong> - Flexible seating arrangements that can be reconfigured based on project requirements</p></li><li class=\\"list-item\\"><p><strong>Enclosed meeting rooms</strong> - Private spaces for confidential client discussions and sensitive strategic planning</p></li><li class=\\"list-item\\"><p><strong>Flexible breakout areas</strong> - Informal collaboration zones that encourage spontaneous interaction</p></li><li class=\\"list-item\\"><p><strong>Client presentation theaters</strong> - Professional spaces equipped for high-stakes client presentations</p></li></ul><h3>Technology Integration</h3><p>Technology integration was paramount, with state-of-the-art video conferencing facilities and digital collaboration tools embedded throughout the space. Key features include:</p><ul class=\\"bullet-list\\"><li class=\\"list-item\\"><p><strong>Advanced video conferencing systems</strong> - Seamless connectivity with global teams and clients</p></li><li class=\\"list-item\\"><p><strong>Digital collaboration tools</strong> - Interactive displays and shared workspaces for real-time project collaboration</p></li><li class=\\"list-item\\"><p><strong>Integrated presentation technology</strong> - Professional-grade systems for client presentations and internal meetings</p></li><li class=\\"list-item\\"><p><strong>Smart building systems</strong> - Automated lighting, climate control, and space utilization monitoring</p></li></ul><h3>Cultural Integration</h3><p>The overall design reflects both the firm's global standards and elements of local Taiwanese design culture, creating a space that feels both internationally sophisticated and locally relevant.</p><ul class=\\"bullet-list\\"><li class=\\"list-item\\"><p><strong>Local design elements</strong> - Incorporation of Taiwanese cultural motifs and materials</p></li><li class=\\"list-item\\"><p><strong>Global brand consistency</strong> - Alignment with the firm's international office standards</p></li><li class=\\"list-item\\"><p><strong>Biophilic design</strong> - Integration of natural elements to improve wellbeing and productivity</p></li><li class=\\"list-item\\"><p><strong>Sustainable materials</strong> - Environmentally conscious material selection reflecting local values</p></li></ul><p></p>"}	2022	38,000 sqft	Taipei	Design & Build	managementconsultingfirm	f
10b32f1a-0e31-4c2c-8fad-4d4f17980a9f	Management Consulting SG	Consulting Firm	managementconsultingsg	/scraped-images/work-projects/managementconsultingsg/managementconsultingsg-banner.jpg	3	6d1fed94-687b-4af4-8c48-eee903f8bb71	2023-10-20 00:00:00+00	2025-07-14 12:43:35.103225+00	2025-09-09 05:43:05.423466+00	t	{"meta": {"version": "1.0", "lastModified": "2025-09-09T05:43:04.948Z"}, "format": "html", "content": "<h2>Project Overview</h2><p>WOLF was commissioned to design the Singapore headquarters for a global management consulting firm, creating a space that balances professionalism with innovation. The project aimed to reflect the firm's forward-thinking approach while providing a sophisticated environment for client interactions and collaborative work.</p><h3>Design Approach</h3><p>Our design seamlessly integrates elements of Singaporean culture with the firm's global brand identity, creating a workspace that feels both locally relevant and internationally connected. The space serves as a powerful tool for talent attraction and retention in the competitive consulting sector.</p><h3>Key Features</h3><ul class=\\"bullet-list\\"><li class=\\"list-item\\"><p><strong>The firms</strong> - The firm's brand identity is subtly woven into the architectural elements and material palette</p></li><li class=\\"list-item\\"><p><strong>Corporate colors</strong> - Corporate colors appear as thoughtful accents rather than overwhelming statements</p></li><li class=\\"list-item\\"><p><strong>Local art</strong> - Local art and design elements reflect Singapore's unique cultural position as a global business hub while creating a sense of place</p></li><li class=\\"list-item\\"><p><strong>The overall</strong> - The overall aesthetic strikes a perfect balance between timeless professionalism and contemporary innovation</p></li></ul><h3>Project Specifications</h3><ul class=\\"bullet-list\\"><li class=\\"list-item\\"><p><strong>Size</strong>: 20,000 sqft</p></li><li class=\\"list-item\\"><p><strong>Location</strong>: Singapore</p></li><li class=\\"list-item\\"><p><strong>Scope</strong>: Design Consultancy</p></li><li class=\\"list-item\\"><p><strong>Year</strong>: 2022</p></li></ul><p></p>"}	2022	32,000 sqft	Singapore	Design & Build	managementconsultingsg	f
\.
COPY public.user_permissions (id, user_id, resource_type, permission_type, granted_by, granted_at) FROM stdin;
\.
COPY public.user_profiles (id, email, full_name, avatar_url, role, department, phone, bio, last_login_at, is_active, created_at, updated_at, created_by) FROM stdin;
a0438717-4d5e-4dc3-986b-e2d2871c5a74	rizki.novianto@cbre.com	rizki.novianto@cbre.com	\N	admin	\N	\N	\N	\N	t	2025-07-14 19:58:52.897542+00	2025-07-14 19:58:52.897542+00	\N
8967ac8d-6d14-4b69-b21a-4e051f259c2c	hello.novianto@gmail.com	Rizki Novianto	\N	admin	Marketing	90918030	Creative Director	\N	t	2025-07-16 07:21:07.735+00	2025-07-16 07:21:07.735+00	\N
\.
COPY public.user_sessions (id, session_id, user_ip, user_agent, started_at, last_activity, page_views_count, total_duration) FROM stdin;
5853b665-bcee-4ac4-a13e-e1620f1ab701	session_1752661305214_ojnr86fuf9	119.234.50.114	Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1	2025-07-16 10:21:45.751+00	2025-07-16 10:22:06.719+00	2	0
e04d06f3-fc85-403b-af5e-50a06cfb62d3	session_1752502503906_llgmi0k562n	103.37.228.254	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	2025-07-16 09:41:50.162+00	2025-07-16 09:41:50.719+00	1	0
3357028c-e8b3-425c-9304-cd9d629f1e3c	session_1752666303143_unueg3fhavc	119.234.18.118	Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1	2025-07-16 11:45:03.562+00	2025-07-16 11:45:03.562+00	0	0
81c2be29-f6fc-42cd-b430-0cf3a4421fb4	session_1752658027832_4dzp7fsr4i8	103.37.228.254	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	2025-07-16 09:27:08.182+00	2025-07-16 09:27:08.678+00	1	0
b1b0d11f-6113-4ab5-b49e-cc751a1f3c90	session_1752580050905_z0na5nh25pa	101.78.115.127	Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1	2025-07-15 11:47:31.222+00	2025-07-15 13:15:31.844+00	2	5250
14044b9a-e14f-4b1a-82e9-7180826ecf78	session_1752658747421_vsllwgs24n	103.37.228.254	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	2025-07-16 09:41:12.545+00	2025-07-16 09:41:12.96+00	1	0
b82ee895-f43c-42cd-98e7-b47155bdc87b	session_1752713569138_x4m3o0w8hs8	101.78.115.127	Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1	2025-07-17 00:52:49.461+00	2025-07-17 03:33:58.135+00	1	16212
e2a69b66-708a-4881-8fa2-529baf68aef2	session_1752682895786_f0qlei8r1u	101.78.115.127	Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1	2025-07-16 16:21:36.09+00	2025-07-16 16:21:48.466+00	2	4
fbf105ce-d9a5-4ad5-a019-6d498d88e698	session_1752685249668_u65cfn37e69	101.78.115.127	Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1	2025-07-16 17:00:49.986+00	2025-07-16 17:00:49.986+00	0	0
d64659d4-613b-4aae-b822-66abea10aa6e	session_1752571089167_1rn14tysxzt	103.55.53.254	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-07-15 09:18:09.564+00	2025-07-15 09:18:10.529+00	1	0
3b342d6f-c8f4-4815-9ee7-4d24c5204a92	session_1752660258519_h2de94mlnwk	103.37.228.254	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	2025-07-16 10:11:28.926+00	2025-07-16 10:11:29.443+00	1	0
c63e3da8-950b-495a-b043-05afcf0f4920	session_1752685481393_cnwr18e4s9	135.232.20.35	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.7204.93 Safari/537.36	2025-07-16 17:04:44.157+00	2025-07-16 17:04:44.158+00	0	0
7e94aef6-fd20-4860-8d4b-a4517d7e11f5	session_1752752195513_1z6ymkm903k	119.234.68.62	Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1	2025-07-17 11:36:35.88+00	2025-07-17 11:36:35.881+00	0	0
ab8c93e1-619f-413f-8690-33d469f20859	session_1752922470396_xlqgoeuv58p	119.234.18.99	Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1	2025-07-19 10:54:30.847+00	2025-07-19 10:54:30.847+00	0	0
d9127344-5ae3-4b2e-b813-5ecb1a138662	session_1752927935478_1c9yd8ox8fy	119.234.18.99	Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1	2025-07-19 12:25:35.824+00	2025-07-19 12:25:35.824+00	0	0
010d308e-d401-49fa-9c35-204cc8941c76	session_1752647524823_uxykc3jff9	103.37.228.254	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-07-16 06:33:02.548+00	2025-07-16 06:33:02.548+00	0	0
cce9add0-b219-4549-b2f2-4da427ccd23d	session_1752713668408_xl57l2el30l	72.153.231.40	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.7204.97 Safari/537.36	2025-07-17 00:54:37.793+00	2025-07-17 00:54:37.793+00	0	0
40606ace-ccd0-4027-8fb2-d34e6ad292b8	session_1752650758646_9opr17jramq	103.37.228.254	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-07-16 07:25:59.043+00	2025-07-16 07:25:59.043+00	0	0
43cce1b9-6a9a-4766-8127-70614b8ed4cc	session_1757388315144_szi9ei7mxr	101.78.115.127	Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1	2025-09-09 03:25:15.475+00	2025-09-09 03:25:15.475+00	0	0
2a97dca5-0d26-408f-8f27-997b0a8b3627	session_1757393193336_xlbwvmw552r	74.179.70.51	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.7204.92 Safari/537.36	2025-09-09 04:46:47.183+00	2025-09-09 04:46:47.185+00	0	0
e13f054e-6a01-4e8d-bc58-3b1ea0e2def5	session_1757393016271_t41ia68w9we	72.152.84.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.7204.97 Safari/537.36	2025-09-09 04:43:48.145+00	2025-09-09 04:43:48.148+00	0	0
e87a2db2-d4eb-479b-977e-91d6338bfb7f	session_1757393908330_bcvts4996rn	111.65.73.109	Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1	2025-09-09 04:58:28.716+00	2025-09-09 04:58:28.716+00	0	0
d7da7f86-402f-4af0-88b7-eadf59a0548c	session_1757390769520_a8fjl9uiosw	101.78.115.127	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36	2025-09-09 05:42:55.42+00	2025-09-09 05:46:11.908+00	1	868
55e84894-791c-491e-be5d-8f11ead4cced	session_1757900887914_pje6s361p5	103.37.228.254	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Safari/605.1.15	2025-09-15 01:48:08.249+00	2025-09-15 01:48:08.249+00	0	0
50bf822a-4278-4505-98ab-a0434a8cecec	session_1757900982700_n9hnh6yhgm	135.232.20.5	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.7204.93 Safari/537.36	2025-09-15 01:49:44.198+00	2025-09-15 01:49:44.198+00	0	0
403bc64b-b4a2-40ff-b6b5-4eccccc169aa	session_1757902011784_bzf1xy6qw5n	119.73.177.130	Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1	2025-09-15 02:06:52.158+00	2025-09-15 02:06:52.158+00	0	0
10c9aed5-5913-40c0-af5f-14b8e4f38225	session_1757910639148_topcjbbnyso	119.234.18.220	Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1	2025-09-15 04:30:39.535+00	2025-09-15 04:30:39.535+00	0	0
d45becd8-d189-4c42-852b-dbc55ebdd94e	session_1752583938624_ezb0udvijhm	101.78.115.127	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	2025-09-19 15:33:00.731+00	2025-09-19 15:33:00.731+00	0	0
79ac2fe5-5ad0-41a6-832c-7edb4c1355a4	session_1758304261005_8c8r6h04zo	208.68.246.250	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0.1 Safari/605.1.15	2025-09-19 17:51:01.128+00	2025-09-19 17:54:37.189+00	2	208
522daffa-2f14-4d91-959b-053668c16e86	session_1752527101727_r65sibbywf	103.37.228.254	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	2025-10-24 02:30:02.862+00	2025-10-24 02:30:02.862+00	0	0
2576c2f1-5d91-4417-b414-ed8549c7e037	session_1758304330882_v7uu8itlrmt	208.68.247.153	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	2025-11-19 15:31:57.929+00	2025-11-19 15:31:57.93+00	0	0
fb8e2739-2f86-4844-9a74-e881f5b6a705	session_1759264594943_qruduxhu46	208.68.247.153	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	2025-09-30 20:36:49.691+00	2025-10-01 02:36:14.453+00	2	22687
\.
ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_key UNIQUE (name);
ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_slug_key UNIQUE (slug);
ALTER TABLE ONLY public.image_migration_log
    ADD CONSTRAINT image_migration_log_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.page_views
    ADD CONSTRAINT page_views_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.project_analytics
    ADD CONSTRAINT project_analytics_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.project_analytics
    ADD CONSTRAINT project_analytics_project_id_key UNIQUE (project_id);
ALTER TABLE ONLY public.project_images
    ADD CONSTRAINT project_images_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_legacy_id_key UNIQUE (legacy_id);
ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_slug_key UNIQUE (slug);
ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT unique_email UNIQUE (email);
ALTER TABLE ONLY public.user_permissions
    ADD CONSTRAINT unique_user_permission UNIQUE (user_id, resource_type, permission_type);
ALTER TABLE ONLY public.user_permissions
    ADD CONSTRAINT user_permissions_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_session_id_key UNIQUE (session_id);
CREATE INDEX idx_activity_logs_created ON public.activity_logs USING btree (created_at);
CREATE INDEX idx_activity_logs_resource ON public.activity_logs USING btree (resource_type, resource_id);
CREATE INDEX idx_activity_logs_type ON public.activity_logs USING btree (activity_type);
CREATE INDEX idx_activity_logs_user ON public.activity_logs USING btree (user_id);
CREATE INDEX idx_activity_logs_user_profile ON public.activity_logs USING btree (user_profile_id);
CREATE INDEX idx_categories_slug ON public.categories USING btree (slug);
CREATE INDEX idx_page_views_created_at ON public.page_views USING btree (created_at);
CREATE INDEX idx_page_views_project_id ON public.page_views USING btree (project_id);
CREATE INDEX idx_page_views_session_id ON public.page_views USING btree (session_id);
CREATE INDEX idx_project_analytics_project_id ON public.project_analytics USING btree (project_id);
CREATE INDEX idx_project_images_project ON public.project_images USING btree (project_id);
CREATE INDEX idx_projects_category ON public.projects USING btree (category_id);
CREATE INDEX idx_projects_order ON public.projects USING btree (order_index);
CREATE INDEX idx_projects_published ON public.projects USING btree (is_published);
CREATE INDEX idx_projects_slug ON public.projects USING btree (slug);
CREATE INDEX idx_user_permissions_resource ON public.user_permissions USING btree (resource_type);
CREATE INDEX idx_user_permissions_user ON public.user_permissions USING btree (user_id);
CREATE INDEX idx_user_profiles_active ON public.user_profiles USING btree (is_active);
CREATE INDEX idx_user_profiles_email ON public.user_profiles USING btree (email);
CREATE INDEX idx_user_profiles_role ON public.user_profiles USING btree (role);
CREATE INDEX idx_user_sessions_session_id ON public.user_sessions USING btree (session_id);
CREATE INDEX idx_user_sessions_started_at ON public.user_sessions USING btree (started_at);
CREATE TRIGGER trigger_update_project_analytics AFTER INSERT ON public.page_views FOR EACH ROW EXECUTE FUNCTION public.update_project_analytics();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_project_images_updated_at BEFORE UPDATE ON public.project_images FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
-- Skipped constraint referencing auth.users
ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_user_profile_fkey FOREIGN KEY (user_profile_id) REFERENCES public.user_profiles(id) ON DELETE SET NULL;
ALTER TABLE ONLY public.page_views
    ADD CONSTRAINT page_views_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.project_analytics
    ADD CONSTRAINT project_analytics_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.project_images
    ADD CONSTRAINT project_images_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;
-- Skipped constraint referencing auth.users
-- Skipped constraint referencing auth.users
-- Skipped constraint referencing auth.users
-- Skipped constraint referencing auth.users
CREATE POLICY "Admins can delete permissions" ON public.user_permissions FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.user_profiles
  WHERE ((user_profiles.id = auth.uid()) AND (user_profiles.role = 'admin'::public.user_role) AND (user_profiles.is_active = true)))));
CREATE POLICY "Admins can insert permissions" ON public.user_permissions FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.user_profiles
  WHERE ((user_profiles.id = auth.uid()) AND (user_profiles.role = 'admin'::public.user_role) AND (user_profiles.is_active = true)))));
CREATE POLICY "Admins can read all permissions" ON public.user_permissions FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.user_profiles
  WHERE ((user_profiles.id = auth.uid()) AND (user_profiles.role = 'admin'::public.user_role) AND (user_profiles.is_active = true)))));
CREATE POLICY "Admins can update permissions" ON public.user_permissions FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.user_profiles
  WHERE ((user_profiles.id = auth.uid()) AND (user_profiles.role = 'admin'::public.user_role) AND (user_profiles.is_active = true)))));
CREATE POLICY "Allow anonymous users to read categories" ON public.categories FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anonymous users to read published project images" ON public.project_images FOR SELECT TO anon USING ((EXISTS ( SELECT 1
   FROM public.projects
  WHERE ((projects.id = project_images.project_id) AND (projects.is_published = true)))));
CREATE POLICY "Allow authenticated read access to project_analytics" ON public.project_analytics FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to delete categories" ON public.categories FOR DELETE TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to delete project_images" ON public.project_images FOR DELETE TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to delete projects" ON public.projects FOR DELETE TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert categories" ON public.categories FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to insert project_images" ON public.project_images FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to insert projects" ON public.projects FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to read categories" ON public.categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to read projects" ON public.projects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to read published project images" ON public.project_images FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.projects
  WHERE ((projects.id = project_images.project_id) AND (projects.is_published = true)))));
CREATE POLICY "Allow authenticated users to update categories" ON public.categories FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to update project_images" ON public.project_images FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to update projects" ON public.projects FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can read all page views" ON public.page_views FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can read all user sessions" ON public.user_sessions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete user profiles" ON public.user_profiles FOR DELETE TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert activity logs" ON public.activity_logs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can insert user profiles" ON public.user_profiles FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can read activity logs" ON public.activity_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read user profiles" ON public.user_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can update user profiles" ON public.user_profiles FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Service role full access" ON public.categories TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON public.image_migration_log TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON public.page_views TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON public.project_analytics TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON public.project_images TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON public.projects TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON public.user_sessions TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Users can read own permissions" ON public.user_permissions FOR SELECT TO authenticated USING ((auth.uid() = user_id));
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY anon_page_views_all ON public.page_views TO anon USING (true) WITH CHECK (true);
CREATE POLICY anon_project_analytics_select ON public.project_analytics FOR SELECT TO anon USING (true);
CREATE POLICY anon_projects_select_published ON public.projects FOR SELECT TO anon USING ((is_published = true));
CREATE POLICY anon_user_sessions_all ON public.user_sessions TO anon USING (true) WITH CHECK (true);
CREATE POLICY auth_page_views_all ON public.page_views TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY auth_project_analytics_all ON public.project_analytics TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY auth_projects_all ON public.projects TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY auth_user_sessions_all ON public.user_sessions TO authenticated USING (true) WITH CHECK (true);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.image_migration_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
GRANT ALL ON FUNCTION public.has_permission(p_user_id uuid, p_resource_type text, p_permission_type text) TO anon;
GRANT ALL ON FUNCTION public.has_permission(p_user_id uuid, p_resource_type text, p_permission_type text) TO authenticated;
GRANT ALL ON FUNCTION public.has_permission(p_user_id uuid, p_resource_type text, p_permission_type text) TO service_role;
GRANT ALL ON FUNCTION public.has_permission(p_user_id uuid, p_resource_type text, p_permission_type text) TO supabase_auth_admin;
GRANT ALL ON FUNCTION public.has_permission(p_user_id uuid, p_resource_type text, p_permission_type text) TO authenticator;
GRANT ALL ON FUNCTION public.log_activity(p_user_id uuid, p_activity_type public.activity_type, p_resource_type text, p_resource_id uuid, p_resource_title text, p_details jsonb, p_metadata jsonb) TO anon;
GRANT ALL ON FUNCTION public.log_activity(p_user_id uuid, p_activity_type public.activity_type, p_resource_type text, p_resource_id uuid, p_resource_title text, p_details jsonb, p_metadata jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.log_activity(p_user_id uuid, p_activity_type public.activity_type, p_resource_type text, p_resource_id uuid, p_resource_title text, p_details jsonb, p_metadata jsonb) TO service_role;
GRANT ALL ON FUNCTION public.log_activity(p_user_id uuid, p_activity_type public.activity_type, p_resource_type text, p_resource_id uuid, p_resource_title text, p_details jsonb, p_metadata jsonb) TO supabase_auth_admin;
GRANT ALL ON FUNCTION public.log_activity(p_user_id uuid, p_activity_type public.activity_type, p_resource_type text, p_resource_id uuid, p_resource_title text, p_details jsonb, p_metadata jsonb) TO authenticator;
GRANT ALL ON FUNCTION public.update_project_analytics() TO anon;
GRANT ALL ON FUNCTION public.update_project_analytics() TO authenticated;
GRANT ALL ON FUNCTION public.update_project_analytics() TO service_role;
GRANT ALL ON FUNCTION public.update_project_analytics() TO supabase_auth_admin;
GRANT ALL ON FUNCTION public.update_project_analytics() TO authenticator;
GRANT ALL ON FUNCTION public.update_updated_at_column() TO anon;
GRANT ALL ON FUNCTION public.update_updated_at_column() TO authenticated;
GRANT ALL ON FUNCTION public.update_updated_at_column() TO service_role;
GRANT ALL ON FUNCTION public.update_updated_at_column() TO supabase_auth_admin;
GRANT ALL ON FUNCTION public.update_updated_at_column() TO authenticator;
GRANT ALL ON TABLE public.activity_logs TO anon;
GRANT ALL ON TABLE public.activity_logs TO authenticated;
GRANT ALL ON TABLE public.activity_logs TO service_role;
GRANT ALL ON TABLE public.activity_logs TO supabase_auth_admin;
GRANT ALL ON TABLE public.activity_logs TO authenticator;
GRANT ALL ON TABLE public.user_profiles TO anon;
GRANT ALL ON TABLE public.user_profiles TO authenticated;
GRANT ALL ON TABLE public.user_profiles TO service_role;
GRANT ALL ON TABLE public.user_profiles TO supabase_auth_admin;
GRANT ALL ON TABLE public.user_profiles TO authenticator;
GRANT ALL ON TABLE public.activity_logs_with_users TO anon;
GRANT ALL ON TABLE public.activity_logs_with_users TO authenticated;
GRANT ALL ON TABLE public.activity_logs_with_users TO service_role;
GRANT ALL ON TABLE public.categories TO anon;
GRANT ALL ON TABLE public.categories TO authenticated;
GRANT ALL ON TABLE public.categories TO service_role;
GRANT ALL ON TABLE public.categories TO supabase_auth_admin;
GRANT ALL ON TABLE public.categories TO authenticator;
GRANT ALL ON TABLE public.image_migration_log TO anon;
GRANT ALL ON TABLE public.image_migration_log TO authenticated;
GRANT ALL ON TABLE public.image_migration_log TO service_role;
GRANT ALL ON TABLE public.image_migration_log TO supabase_auth_admin;
GRANT ALL ON TABLE public.image_migration_log TO authenticator;
GRANT ALL ON TABLE public.page_views TO anon;
GRANT ALL ON TABLE public.page_views TO authenticated;
GRANT ALL ON TABLE public.page_views TO service_role;
GRANT ALL ON TABLE public.page_views TO supabase_auth_admin;
GRANT ALL ON TABLE public.page_views TO authenticator;
GRANT ALL ON TABLE public.project_analytics TO anon;
GRANT ALL ON TABLE public.project_analytics TO authenticated;
GRANT ALL ON TABLE public.project_analytics TO service_role;
GRANT ALL ON TABLE public.project_analytics TO supabase_auth_admin;
GRANT ALL ON TABLE public.project_analytics TO authenticator;
GRANT ALL ON TABLE public.project_images TO anon;
GRANT ALL ON TABLE public.project_images TO authenticated;
GRANT ALL ON TABLE public.project_images TO service_role;
GRANT ALL ON TABLE public.project_images TO supabase_auth_admin;
GRANT ALL ON TABLE public.project_images TO authenticator;
GRANT ALL ON TABLE public.projects TO anon;
GRANT ALL ON TABLE public.projects TO authenticated;
GRANT ALL ON TABLE public.projects TO service_role;
GRANT ALL ON TABLE public.projects TO supabase_auth_admin;
GRANT ALL ON TABLE public.projects TO authenticator;
GRANT ALL ON TABLE public.user_activity_summary TO anon;
GRANT ALL ON TABLE public.user_activity_summary TO authenticated;
GRANT ALL ON TABLE public.user_activity_summary TO service_role;
GRANT ALL ON TABLE public.user_activity_summary TO supabase_auth_admin;
GRANT ALL ON TABLE public.user_activity_summary TO authenticator;
GRANT ALL ON TABLE public.user_permissions TO anon;
GRANT ALL ON TABLE public.user_permissions TO authenticated;
GRANT ALL ON TABLE public.user_permissions TO service_role;
GRANT ALL ON TABLE public.user_permissions TO supabase_auth_admin;
GRANT ALL ON TABLE public.user_permissions TO authenticator;
GRANT ALL ON TABLE public.user_sessions TO anon;
GRANT ALL ON TABLE public.user_sessions TO authenticated;
GRANT ALL ON TABLE public.user_sessions TO service_role;
GRANT ALL ON TABLE public.user_sessions TO supabase_auth_admin;
GRANT ALL ON TABLE public.user_sessions TO authenticator;
