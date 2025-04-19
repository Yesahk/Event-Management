export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  category: string;
  image: string;
  price: number;
  organizer?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}