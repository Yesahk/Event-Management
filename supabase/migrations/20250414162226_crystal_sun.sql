/*
  # Revert Registration Changes

  1. Changes
    - Drop registrations table
    - Remove related policies and constraints
*/

-- Drop registrations table if it exists
DROP TABLE IF EXISTS registrations;

-- Ensure events table policies are properly set
DROP POLICY IF EXISTS "Anyone can read events" ON events;
DROP POLICY IF EXISTS "Authenticated users can create events" ON events;

-- Create new policies for events table
CREATE POLICY "Enable read access for all users"
  ON events FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Enable insert for all users"
  ON events FOR INSERT
  TO public
  WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE events FORCE ROW LEVEL SECURITY;