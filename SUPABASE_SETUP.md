# Supabase Setup Instructions

## Environment Variables Setup

Create a `.env.local` file in your project root with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://izkwjtiwcrgtmkkltfzx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

## How to Get Your Keys

1. **Go to your Supabase project**: https://supabase.com/dashboard/project/izkwjtiwcrgtmkkltfzx

2. **Navigate to Settings > API**

3. **Copy the following keys**:
   - **Project URL**: Already filled in above
   - **Anon public key**: Replace `your-anon-key-here` with this key
   - **Service role key**: Replace `your-service-role-key-here` with this key (⚠️ Keep this secret!)

## Complete Setup Steps

1. **Create the environment file**:
   ```bash
   touch .env.local
   ```

2. **Add the environment variables** with your actual keys from Supabase

3. **Test the setup**:
   ```bash
   npm run dev
   ```

4. **Visit the admin login**: http://localhost:3000/admin/login

## Creating Your First Admin User

Since authentication is set up, you'll need to create an admin user in Supabase:

1. **Go to Supabase Dashboard > Authentication > Users**
2. **Click "Add User"**
3. **Enter your email and password**
4. **Confirm the user (if email confirmation is enabled)**

## Next Steps

Once environment variables are set up:
- Visit `/admin/login` to test the authentication
- The middleware will automatically protect admin routes
- You can sign out and be redirected back to login

## Security Notes

- Never commit `.env.local` to version control
- The service role key should only be used server-side
- Consider enabling Row Level Security (RLS) in Supabase for production 