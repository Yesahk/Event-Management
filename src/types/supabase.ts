export type Profile = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

export type Event = {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  category: string;
  image_url: string;
  price: number;
  max_attendees?: number;
  organizer_id: string;
  created_at: string;
  updated_at: string;
};

export type Registration = {
  id: string;
  event_id: string;
  user_id: string;
  ticket_quantity: number;
  created_at: string;
};