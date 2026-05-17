-- ============================================================
-- Fix: Confirm all existing unconfirmed users
-- Run this in Supabase SQL Editor to fix "Email not confirmed" error
-- ============================================================

-- Confirm ALL existing users who haven't confirmed their email yet
UPDATE auth.users
SET email_confirmed_at = now(),
    confirmed_at = now(),
    updated_at = now()
WHERE email_confirmed_at IS NULL;

-- ALSO: Go to Supabase Dashboard → Authentication → Providers → Email
-- and turn OFF "Confirm email" to prevent this for future signups.
