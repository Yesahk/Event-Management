/*
  # Add Sample Events

  1. Changes
    - Add sample events to demonstrate functionality
    - Update RLS policies to ensure proper access

  2. Sample Data
    - Tech Conference
    - Music Festival
    - Business Workshop
*/

-- Insert sample events
INSERT INTO events (
  title,
  description,
  date,
  location,
  category,
  image_url,
  price,
  max_attendees,
  created_at,
  updated_at
) VALUES 
(
  'Tech Conference 2024',
  'Join industry leaders for the biggest tech conference of the year. Network with professionals, attend workshops, and learn about the latest technologies.',
  '2024-06-15 09:00:00+00',
  'San Francisco, CA',
  'Conference',
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87',
  299,
  500,
  now(),
  now()
),
(
  'Summer Music Festival',
  'A weekend of amazing music performances and art installations featuring top artists from around the world.',
  '2024-07-20 16:00:00+00',
  'Austin, TX',
  'Music',
  'https://images.unsplash.com/photo-1459749411175-04bf5292ceea',
  149,
  2000,
  now(),
  now()
),
(
  'Business Leadership Workshop',
  'Learn essential business skills from successful entrepreneurs. Perfect for startup founders and business leaders.',
  '2024-05-10 10:00:00+00',
  'New York, NY',
  'Workshop',
  'https://images.unsplash.com/photo-1515187029135-18ee286d815b',
  99,
  100,
  now(),
  now()
);

-- Ensure RLS policies are properly set
DROP POLICY IF EXISTS "Enable read access for all users" ON events;
DROP POLICY IF EXISTS "Enable insert for all users" ON events;

-- Create new policies
CREATE POLICY "Anyone can read events"
  ON events FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can create events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE events ENABLE ROW LEVEL SECURITY;