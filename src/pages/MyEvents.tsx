import React, { useEffect, useState } from 'react';
import { Calendar, MapPin, Ticket, AlertCircle, Trash2, Check, Edit } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Event } from '../types/supabase';
import { format } from 'date-fns';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface RegisteredEvent extends Event {
  ticket_quantity: number;
}

const MyEvents: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [registeredEvents, setRegisteredEvents] = useState<RegisteredEvent[]>([]);
  const [createdEvents, setCreatedEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(
    location.state?.message || null
  );
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        if (!user) return;

        // Fetch registered events
        const { data: registrations, error: registrationsError } = await supabase
          .from('registrations')
          .select(`
            ticket_quantity,
            events (
              id,
              title,
              description,
              date,
              location,
              category,
              image_url,
              price,
              max_attendees,
              organizer_id,
              created_at,
              updated_at
            )
          `)
          .eq('user_id', user.id);

        if (registrationsError) throw registrationsError;

        const regEvents = registrations.map(registration => ({
          ...registration.events,
          ticket_quantity: registration.ticket_quantity
        }));

        setRegisteredEvents(regEvents);

        // Fetch created events
        const { data: created, error: createdError } = await supabase
          .from('events')
          .select('*')
          .eq('organizer_id', user.id)
          .order('created_at', { ascending: false });

        if (createdError) throw createdError;

        setCreatedEvents(created || []);
      } catch (error: any) {
        console.error('Error fetching events:', error);
        setError(error.message || 'Failed to fetch events');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [user]);

  // Clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleDeleteClick = (eventId: string) => {
    setEventToDelete(eventId);
  };

  const handleEditClick = (eventId: string) => {
    navigate(`/edit-event/${eventId}`);
  };

  const handleDeleteConfirm = async () => {
    if (!eventToDelete) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventToDelete)
        .eq('organizer_id', user?.id);

      if (error) throw error;

      setCreatedEvents(events => events.filter(event => event.id !== eventToDelete));
      setSuccessMessage('Event deleted successfully');
    } catch (error: any) {
      setError(error.message || 'Failed to delete event');
    } finally {
      setIsDeleting(false);
      setEventToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setEventToDelete(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">{error}</h3>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4 flex items-center text-green-600">
            <Check className="h-5 w-5 mr-2" />
            {successMessage}
          </div>
        )}

        {/* Created Events Section */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Events I've Created</h1>
          {createdEvents.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No events created</h3>
              <p className="mt-1 text-sm text-gray-500">You haven't created any events yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {createdEvents.map((event) => (
                <div key={event.id} className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="h-48 w-full relative">
                    <img
                      src={event.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87'}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 flex space-x-2">
                      <button
                        onClick={() => handleEditClick(event.id)}
                        className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-500 transition-colors"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(event.id)}
                        className="p-2 bg-red-600 text-white rounded-full hover:bg-red-500 transition-colors"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{event.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-gray-500">
                        <Calendar className="h-5 w-5 mr-2" />
                        {format(new Date(event.date), 'PPP')}
                      </div>
                      <div className="flex items-center text-gray-500">
                        <MapPin className="h-5 w-5 mr-2" />
                        {event.location}
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-purple-600 font-semibold">
                        ${event.price.toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {event.max_attendees ? `${event.max_attendees} max attendees` : 'Unlimited attendees'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Registered Events Section */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Events I'm Attending</h2>
          {registeredEvents.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <Ticket className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No events found</h3>
              <p className="mt-1 text-sm text-gray-500">You haven't registered for any events yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {registeredEvents.map((event) => (
                <div key={event.id} className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="h-48 w-full">
                    <img
                      src={event.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87'}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{event.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-gray-500">
                        <Calendar className="h-5 w-5 mr-2" />
                        {format(new Date(event.date), 'PPP')}
                      </div>
                      <div className="flex items-center text-gray-500">
                        <MapPin className="h-5 w-5 mr-2" />
                        {event.location}
                      </div>
                      <div className="flex items-center text-gray-500">
                        <Ticket className="h-5 w-5 mr-2" />
                        {event.ticket_quantity} {event.ticket_quantity === 1 ? 'ticket' : 'tickets'}
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-purple-600 font-semibold">
                        ${(event.price * event.ticket_quantity).toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-500">
                        ${event.price.toFixed(2)} per ticket
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {eventToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Event</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this event? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors disabled:bg-red-300"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deleting...
                  </div>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyEvents;