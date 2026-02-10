-- Fix for signup RLS policy issue
-- This adds the missing INSERT policy for the users table

-- First, drop any conflicting policies
DROP POLICY IF EXISTS "Users can create own profile" ON users;
DROP POLICY IF EXISTS "Users can read their own profile" ON users;
DROP POLICY IF EXISTS "Users can read all profiles" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Recreate all user policies in correct order
-- 1. Allow users to insert their own profile during signup
CREATE POLICY "Users can create own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 2. Users can read their own profile
CREATE POLICY "Users can read their own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- 3. Users can read all profiles (to see creator info on tasks)
CREATE POLICY "Users can read all profiles"
  ON users FOR SELECT
  USING (true);

-- 4. Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
