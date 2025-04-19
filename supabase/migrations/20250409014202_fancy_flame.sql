/*
  # Create Anonymous User Profile

  1. Changes
    - Create a default anonymous user profile for non-authenticated event creation
    - Update RLS policies to allow anonymous event creation
*/

-- Insert anonymous user profile if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = '00000000-0000-0000-0000-000000000000'
  ) THEN
    INSERT INTO profiles (id, name)
    VALUES ('00000000-0000-0000-0000-000000000000', 'Anonymous');
  END IF;
END $$;

-- Update events policy to allow anonymous creation
CREATE POLICY "Allow anonymous event creation"
  ON events FOR INSERT
  TO anon
  WITH CHECK (true);

-- Update events policy to allow public read
CREATE POLICY "Allow public read of events"
  ON events FOR SELECT
  TO anon
  USING (true);