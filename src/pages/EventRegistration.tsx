import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { CreditCard, Mail, Phone, Building, User, Check, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Event } from '../types/supabase';

const registrationSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  company: z.string().optional(),
  ticketQuantity: z.number().min(1, 'Must select at least 1 ticket').max(10, 'Maximum 10 tickets per registration'),
  specialRequirements: z.string().optional(),
  dietaryRestrictions: z.string().optional(),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms and conditions'
  }),
  receiveUpdates: z.boolean()
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

const EventRegistration: React.FC = () => {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [event, setEvent] = useState<Event | null>(null);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      fullName: user?.name || '',
      email: user?.email || '',
      ticketQuantity: 1,
      receiveUpdates: true,
      agreeToTerms: false
    }
  });

  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) return;

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (error) {
        console.error('Error fetching event:', error);
        setError('Event not found');
        return;
      }

      setEvent(data);
    };

    fetchEvent();
  }, [eventId]);

  const ticketQuantity = watch('ticketQuantity');
  const totalAmount = event ? event.price * ticketQuantity : 0;

  const onSubmit = async (data: RegistrationFormData) => {
    if (!event || !user) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Check if user is already registered
      const { data: existingRegistration } = await supabase
        .from('registrations')
        .select('*')
        .eq('event_id', event.id)
        .eq('user_id', user.id)
        .single();

      if (existingRegistration) {
        throw new Error('You are already registered for this event');
      }

      // Check if there's space available
      if (event.max_attendees) {
        const { data: currentRegistrations } = await supabase
          .from('registrations')
          .select('ticket_quantity')
          .eq('event_id', event.id);

        const totalRegistered = (currentRegistrations || []).reduce(
          (sum, reg) => sum + (reg.ticket_quantity || 0),
          0
        );

        if (totalRegistered + data.ticketQuantity > event.max_attendees) {
          throw new Error('Not enough tickets available');
        }
      }

      // Create registration
      const { error: registrationError } = await supabase
        .from('registrations')
        .insert([
          {
            event_id: event.id,
            user_id: user.id,
            ticket_quantity: data.ticketQuantity
          }
        ]);

      if (registrationError) throw registrationError;

      navigate('/my-events', { 
        state: { message: 'Registration successful!' }
      });
    } catch (error: any) {
      setError(error.message || 'Failed to register for event');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          {error ? (
            <div className="text-red-600">
              <AlertCircle className="h-12 w-12 mx-auto mb-4" />
              {error}
            </div>
          ) : (
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Register for {event.title}</h1>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4 flex items-center text-red-600">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    {...register('fullName')}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>
                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    {...register('email')}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter your email"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number (Optional)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    {...register('phone')}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company/Organization (Optional)
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    {...register('company')}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter your company name"
                  />
                </div>
              </div>
            </div>

            {/* Ticket Information */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Ticket Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Tickets *
                </label>
                <input
                  type="number"
                  {...register('ticketQuantity', { valueAsNumber: true })}
                  min="1"
                  max={event.max_attendees || 10}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                {errors.ticketQuantity && (
                  <p className="mt-1 text-sm text-red-600">{errors.ticketQuantity.message}</p>
                )}
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Ticket Price:</span>
                  <span className="font-semibold">${event.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-gray-700">Quantity:</span>
                  <span className="font-semibold">x{ticketQuantity}</span>
                </div>
                <div className="border-t border-gray-200 mt-2 pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-900 font-medium">Total Amount:</span>
                    <span className="text-lg font-bold text-purple-600">${totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Additional Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Requirements (Optional)
                </label>
                <textarea
                  {...register('specialRequirements')}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter any special requirements or accessibility needs"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dietary Restrictions (Optional)
                </label>
                <textarea
                  {...register('dietaryRestrictions')}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter any dietary restrictions or preferences"
                />
              </div>
            </div>

            {/* Terms and Communication Preferences */}
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  {...register('agreeToTerms')}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  I agree to the <a href="#" className="text-purple-600 hover:text-purple-500">Terms and Conditions</a> *
                </label>
              </div>
              {errors.agreeToTerms && (
                <p className="text-sm text-red-600">{errors.agreeToTerms.message}</p>
              )}

              <div className="flex items-center">
                <input
                  type="checkbox"
                  {...register('receiveUpdates')}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  I would like to receive updates about this event
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isProcessing}
                className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors disabled:bg-purple-300 flex items-center"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    Complete Registration
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EventRegistration;