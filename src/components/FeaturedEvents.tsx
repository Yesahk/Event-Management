import React, { useEffect } from 'react';
import { Calendar, MapPin } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useSearch } from '../context/SearchContext';
import { supabase } from '../lib/supabase';
import { Event } from '../types/supabase';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';

const FeaturedEvents: React.FC = () => {
  const { searchQuery, searchResults, setSearchResults, selectedCategory } = useSearch();
  const [events, setEvents] = React.useState<Event[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        setEvents(data || []);
      } catch (error: any) {
        console.error('Error fetching events:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();

    // Set up real-time subscription
    const subscription = supabase
      .channel('events_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'events'
        },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            setEvents((currentEvents) => 
              currentEvents.filter(event => event.id !== payload.old.id)
            );
          } else if (payload.eventType === 'INSERT') {
            setEvents((currentEvents) => 
              [payload.new as Event, ...currentEvents]
            );
          } else if (payload.eventType === 'UPDATE') {
            setEvents((currentEvents) =>
              currentEvents.map(event =>
                event.id === payload.new.id ? { ...event, ...payload.new } : event
              )
            );
          }
        }
      )
      .subscribe();

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let filteredEvents = events;

    // Apply category filter
    if (selectedCategory) {
      filteredEvents = filteredEvents.filter(event =>
        event.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Apply search filter
    if (searchQuery) {
      filteredEvents = filteredEvents.filter(event => {
        const searchTerms = searchQuery.toLowerCase();
        return (
          event.title.toLowerCase().includes(searchTerms) ||
          event.category.toLowerCase().includes(searchTerms) ||
          event.location.toLowerCase().includes(searchTerms) ||
          event.description.toLowerCase().includes(searchTerms)
        );
      });
    }

    setSearchResults(filteredEvents);
  }, [searchQuery, events, selectedCategory, setSearchResults]);

  const handleRegisterClick = (eventId: string) => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      navigate(`/register/${eventId}`);
    }
  };

  const displayEvents = searchQuery || selectedCategory ? searchResults : events;

  if (isLoading) {
    return (
      <section className="py-8 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-8 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-red-600">
            <p>Error loading events: {error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="featured-events" className="py-8 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold">
            {selectedCategory ? `${selectedCategory} Events` : (searchQuery ? 'Search Results' : 'Featured Events')}
          </h2>
          {selectedCategory && (
            <button
              onClick={() => useSearch().setSelectedCategory(null)}
              className="text-purple-600 hover:text-purple-500 font-medium"
            >
              View All Events
            </button>
          )}
        </div>
        
        {displayEvents.length === 0 ? (
          <div className="text-center text-gray-600">
            <p>No events found {selectedCategory ? `in ${selectedCategory} category` : 'matching your search criteria'}.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {displayEvents.map((event) => (
              <div key={event.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="h-48 w-full">
                  <img
                    src={event.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87'}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 md:p-6">
                  <h3 className="text-lg md:text-xl font-semibold mb-2">{event.title}</h3>
                  <p className="text-gray-600 mb-4 text-sm md:text-base line-clamp-2">{event.description}</p>
                  <div className="flex items-center text-gray-500 mb-2 text-sm md:text-base">
                    <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                    {format(new Date(event.date), 'PPP')}
                  </div>
                  <div className="flex items-center text-gray-500 mb-4 text-sm md:text-base">
                    <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                    {event.location}
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
                    <span className="text-purple-600 font-semibold">${event.price.toFixed(2)}</span>
                    <button
                      onClick={() => handleRegisterClick(event.id)}
                      className="w-full sm:w-auto text-center bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-500 transition-colors"
                    >
                      Register Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedEvents;