-- ============================================================
-- DJ ROOTS — Auth-to-Profile Link (Supabase)
-- This migration adds an auth_id column to profiles so that
-- each Supabase Auth user is linked to a DJ Roots profile.
-- Run this in the Supabase SQL Editor AFTER enabling Email Auth.
-- ============================================================

-- 1. Add auth_id column to profiles (nullable for legacy/seed profiles)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS auth_id UUID UNIQUE;

-- 2. Create an index for fast lookups by auth_id
CREATE INDEX IF NOT EXISTS idx_profiles_auth_id ON profiles(auth_id);

-- 3. Add email column to profiles for easy display
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- 4. Auto-create a profile when a new user signs up via Supabase Auth
--    This trigger fires on auth.users INSERT and creates a matching profile.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_name TEXT;
  user_username TEXT;
  avatar_urls TEXT[] := ARRAY[
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&q=80',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&q=80'
  ];
  random_avatar TEXT;
  user_avatar TEXT;
BEGIN
  -- Extract display name from user metadata or email
  user_name := COALESCE(
    NEW.raw_user_meta_data ->> 'display_name',
    split_part(NEW.email, '@', 1)
  );
  user_username := '@' || lower(replace(user_name, ' ', '_')) || '_' || floor(random() * 1000)::text;
  random_avatar := avatar_urls[1 + floor(random() * array_length(avatar_urls, 1))::int];
  user_avatar := COALESCE(
    NEW.raw_user_meta_data ->> 'avatar_url',
    NEW.raw_user_meta_data ->> 'picture',
    random_avatar
  );

  INSERT INTO public.profiles (id, auth_id, name, username, email, avatar_url)
  VALUES (
    gen_random_uuid(),
    NEW.id,
    user_name,
    user_username,
    NEW.email,
    user_avatar
  )
  ON CONFLICT (auth_id) DO UPDATE SET
    email = EXCLUDED.email;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if any, then create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
