/*
  # Fix Event Deletion

  1. Changes
    - Add ON DELETE CASCADE to foreign key references
    - Update RLS policies for event deletion
    - Ensure proper cleanup of related data

  2. Security
    - Strengthen RLS policies for event deletion
    - Ensure only event organizers can delete their events
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable delete for event organizers" ON events;

-- Create stronger delete policy
CREATE POLICY "Enable delete for event organizers"
  ON events 
  FOR DELETE 
  TO authenticated 
  USING (
    auth.uid() = organizer_id AND
    organizer_id IS NOT NULL
  );

-- Ensure cascading deletes for registrations
ALTER TABLE registrations
  DROP CONSTRAINT IF EXISTS registrations_event_id_fkey,
  ADD CONSTRAINT registrations_event_id_fkey
    FOREIGN KEY (event_id)
    REFERENCES events(id)
    ON DELETE CASCADE;

-- Add trigger to clean up related data
CREATE OR REPLACE FUNCTION clean_up_event()
RETURNS TRIGGER AS $$
BEGIN
  -- Add any additional cleanup logic here if needed
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS event_cleanup_trigger ON events;
CREATE TRIGGER event_cleanup_trigger
  BEFORE DELETE ON events
  FOR EACH ROW
  EXECUTE FUNCTION clean_up_event();