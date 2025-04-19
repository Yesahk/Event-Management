/*
  # Create events table and policies

  1. New Tables
    - `events`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `date` (timestamp)
      - `location` (text)
      - `category` (text)
      - `image_url` (text)
      - `price` (numeric)
      - `max_attendees` (integer)
      - `organizer_id` (uuid, references profiles)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on events table
    - Add policies for public read access
    - Add policies for authenticated users to create events
*/

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  date timestamptz NOT NULL,
  location text NOT NULL,
  category text NOT NULL,
  image_url text,
  price numeric NOT NULL DEFAULT 0,
  max_attendees integer,
  organizer_id uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users"
  ON events FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Enable insert for authenticated users"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update for event organizers"
  ON events FOR UPDATE
  TO authenticated
  USING (auth.uid() = organizer_id)
  WITH CHECK (auth.uid() = organizer_id);