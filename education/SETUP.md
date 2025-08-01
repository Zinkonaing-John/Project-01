# Education App Setup Guide

## Database Setup

To fix the login issues, you need to update your Supabase database with the new schema. Follow these steps:

### 1. Run the Updated Schema

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `schema.sql` into the editor
4. Run the SQL commands

This will:

- Create the updated `users` table with `auth_id` reference
- Set up triggers to automatically sync Supabase Auth users with your custom users table
- Enable Row Level Security (RLS) policies
- Create all necessary functions and triggers

### 2. Test the Setup

1. Start your development server: `npm run dev`
2. Go to `http://localhost:3000/auth/signup`
3. Create a new account (this will automatically create a user profile)
4. Try logging in with the new account

### 3. What Was Fixed

The main issues were:

1. **Schema Mismatch**: Your database had a separate `users` table that wasn't connected to Supabase Auth
2. **Missing Triggers**: No automatic sync between auth users and your custom users table
3. **Incorrect Redirects**: Login was redirecting to wrong paths
4. **Missing User Profile Fetching**: The app wasn't properly fetching user profiles after login

### 4. How It Works Now

1. When a user signs up, Supabase Auth creates an auth user
2. A trigger automatically creates a corresponding record in your `users` table
3. The login process now:
   - Authenticates with Supabase Auth
   - Fetches the user profile from your `users` table
   - Redirects to the dashboard
4. All database operations use the user's profile ID instead of auth ID

### 5. Troubleshooting

If you still have issues:

1. **Check the browser console** for any error messages
2. **Verify your environment variables** are correct in `.env.local`
3. **Check the Supabase logs** in your dashboard
4. **Make sure the schema was applied** correctly in your database

### 6. Testing the Login Flow

1. Create a new account at `/auth/signup`
2. Check your email for confirmation (if email confirmation is enabled)
3. Go to `/auth/login`
4. Enter your credentials
5. You should be redirected to `/dashboard`

The login should now work properly! 🎉
