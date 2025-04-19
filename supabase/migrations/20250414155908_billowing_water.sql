/*
  # Update RLS policies for public access

  1. Changes
    - Update RLS policies to allow public access to events table
    - Enable read and insert access for non-authenticated users
    - Remove requirement for organizer_id foreign key check
*/

-- First, modify the events table to allow null organizer_id
ALTER TABLE events ALTER COLUMN organizer_id DROP NOT NULL;

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can create events" ON events;
DROP POLICY IF EXISTS "Anyone can read events" ON events;

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