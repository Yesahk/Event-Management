import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { Upload, MapPin, Users, DollarSign, Globe, Calendar, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const eventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(1, 'Category is required'),
  eventType: z.enum(['online', 'in-person']),
  location: z.string().min(1, 'Location is required'),
  virtualLink: z.string().url().optional().or(z.literal('')),
  price: z.number().min(0, 'Price must be 0 or greater'),
  maxAttendees: z.number().min(1, 'Maximum attendees must be at least 1'),
});

type EventFormData = z.infer<typeof eventSchema>;

const categories = [
  'Conference',
  'Workshop',
  'Seminar',
  'Webinar',
  'Music Concert',
  'Education',
  'Networking Event',
  'Other'
];

const CreateEvent: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [eventDate, setEventDate] = useState<Date | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, watch, formState: { errors }, trigger } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      eventType: 'in-person',
      price: 0,
      maxAttendees: 100
    }
  });

  const eventType = watch('eventType');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNextStep = async () => {
    const isValid = await trigger(['title', 'description', 'category', 'eventType']);
    
    if (isValid) {
      setError(null);
      setCurrentStep(2);
    }
  };

  const onSubmit = async (data: EventFormData) => {
    if (!eventDate) {
      setError('Please select an event date');
      return;
    }

    if (!user) {
      setError('You must be logged in to create an event');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const eventData = {
        title: data.title,
        description: data.description,
        date: eventDate.toISOString(),
        location: eventType === 'online' ? data.virtualLink : data.location,
        category: data.category,
        image_url: selectedImage || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87',
        price: data.price,
        max_attendees: data.maxAttendees,
        organizer_id: user.id
      };

      const { error: insertError } = await supabase
        .from('events')
        .insert([eventData]);

      if (insertError) throw insertError;

      navigate('/', { 
        state: { message: 'Event created successfully!' }
      });
    } catch (error: any) {
      console.error('Error creating event:', error);
      setError(error.message || 'Failed to create event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            
            {/* Event Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Title *
              </label>
              <input
                type="text"
                {...register('title')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter a descriptive title for your event"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            {/* Event Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Description *
              </label>
              <textarea
                {...register('description')}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Provide a detailed description of your event"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            {/* Event Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Type *
              </label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    {...register('eventType')}
                    value="in-person"
                    className="form-radio text-purple-600"
                  />
                  <span className="ml-2">In-Person</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    {...register('eventType')}
                    value="online"
                    className="form-radio text-purple-600"
                  />
                  <span className="ml-2">Online</span>
                </label>
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                {...register('category')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">Date and Location</h2>
              
              {/* Date and Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Date & Time *
                </label>
                <DatePicker
                  selected={eventDate}
                  onChange={(date) => setEventDate(date)}
                  showTimeSelect
                  dateFormat="MMMM d, yyyy h:mm aa"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholderText="Select event date and time"
                  minDate={new Date()}
                />
              </div>

              {/* Location */}
              {eventType === 'in-person' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Venue Location *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      {...register('location')}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter venue address"
                    />
                  </div>
                  {errors.location && (
                    <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Virtual Event Link *
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="url"
                      {...register('virtualLink')}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter virtual event link (e.g., Zoom, Meet)"
                    />
                  </div>
                  {errors.virtualLink && (
                    <p className="mt-1 text-sm text-red-600">{errors.virtualLink.message}</p>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">Event Details</h2>
              
              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ticket Price *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('price', { valueAsNumber: true })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter ticket price"
                  />
                </div>
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                )}
              </div>

              {/* Maximum Attendees */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Attendees *
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    min="1"
                    {...register('maxAttendees', { valueAsNumber: true })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter maximum number of attendees"
                  />
                </div>
                {errors.maxAttendees && (
                  <p className="mt-1 text-sm text-red-600">{errors.maxAttendees.message}</p>
                )}
              </div>

              {/* Event Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Image
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-purple-600 hover:text-purple-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-purple-500">
                        <span>Upload a file</span>
                        <input
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                  </div>
                </div>
                {selectedImage && (
                  <div className="mt-4">
                    <img
                      src={selectedImage}
                      alt="Preview"
                      className="h-32 w-auto rounded-lg"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Create New Event</h1>
            <div className="text-sm text-gray-500">
              Step {currentStep} of 2
            </div>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4 flex items-center text-red-600">
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
            </div>
          )}

          {/* Progress Bar */}
          <div className="relative pt-1 mb-8">
            <div className="flex mb-2 items-center justify-between">
              <div className="flex items-center">
                <span className={`text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full ${
                  currentStep >= 1 ? 'bg-purple-600 text-white' : 'bg-gray-200'
                }`}>
                  1
                </span>
                <div className={`absolute top-0 -ml-10 text-center mt-8 w-32 text-xs font-medium ${
                  currentStep >= 1 ? 'text-purple-600' : 'text-gray-500'
                }`}>
                  Basic Info
                </div>
              </div>
              <div className="flex items-center">
                <span className={`text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full ${
                  currentStep >= 2 ? 'bg-purple-600 text-white' : 'bg-gray-200'
                }`}>
                  2
                </span>
                <div className={`absolute top-0 -ml-10 text-center mt-8 w-32 text-xs font-medium ${
                  currentStep >= 2 ? 'text-purple-600' : 'text-gray-500'
                }`}>
                  Event Details
                </div>
              </div>
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
              <div
                style={{ width: `${((currentStep - 1) / 1) * 100}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-purple-600"
              ></div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {renderStep()}

            <div className="flex justify-between mt-8">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>
              )}
              {currentStep === 1 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="ml-auto px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="ml-auto px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors flex items-center space-x-2 disabled:bg-purple-300 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Creating Event...</span>
                    </>
                  ) : (
                    <>
                      <Calendar className="w-5 h-5" />
                      <span>Create Event</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateEvent;