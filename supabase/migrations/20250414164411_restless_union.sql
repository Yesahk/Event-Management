/*
  # Add delete policy for events

  1. Changes
    - Add policy allowing event organizers to delete their own events
*/

-- Create policy for deleting events
CREATE POLICY "Enable delete for event organizers"
  ON events FOR DELETE
  TO authenticated
  USING (auth.uid() = organizer_id);