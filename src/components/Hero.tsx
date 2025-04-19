import React from 'react';
import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSearch } from '../context/SearchContext';

const Hero: React.FC = () => {
  const { setSearchQuery, setSearchResults } = useSearch();
  
  const scrollToFeaturedEvents = () => {
    const featuredEventsSection = document.querySelector('#featured-events');
    if (featuredEventsSection) {
      featuredEventsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    
    if (query) {
      scrollToFeaturedEvents();
    }
  };

  return (
    <div className="relative bg-gradient-to-r from-purple-600 to-blue-600 min-h-[400px] md:h-[600px]">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30"
          alt="Event background"
          className="w-full h-full object-cover opacity-20"
        />
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
        <div className="text-center w-full py-12 md:py-0">
          <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold text-white mb-4 md:mb-6">
            Create, Discover, and Manage Your Events with Us
          </h1>
          <p className="text-lg md:text-xl text-white mb-6 md:mb-8 px-4">
            Join thousands of event organizers and attendees in creating unforgettable experiences
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8 md:mb-12 px-4">
            <Link
              to="/create-event"
              className="w-full sm:w-auto bg-white text-purple-600 px-6 md:px-8 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
            >
              Create Event
            </Link>
            <button 
              onClick={scrollToFeaturedEvents}
              className="w-full sm:w-auto bg-purple-500 text-white px-6 md:px-8 py-3 rounded-lg font-semibold hover:bg-purple-400 transition-colors"
            >
              Find Events
            </button>
          </div>
          <div className="max-w-2xl mx-auto px-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search events by name, category, or location"
                className="w-full px-4 md:px-6 py-3 md:py-4 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                onChange={handleSearch}
              />
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;