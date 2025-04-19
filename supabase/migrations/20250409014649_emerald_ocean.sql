/*
  # Update RLS policies for anonymous access

  1. Changes
    - Drop existing restrictive policies
    - Create new policies allowing anonymous access
    - Enable public access to events table
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can create events" ON events;
DROP POLICY IF EXISTS "Allow anonymous event creation" ON events;
DROP POLICY IF EXISTS "Allow public read of events" ON events;

-- Create new policies for events table
CREATE POLICY "Enable read access for all users"
  ON events FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Enable insert access for all users"
  ON events FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Enable update for all users"
  ON events FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Ensure RLS is enabled but with public access
ALTER TABLE events FORCE ROW LEVEL SECURITY;