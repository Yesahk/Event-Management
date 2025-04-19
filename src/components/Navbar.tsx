import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Menu, X, Ticket } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSearch } from '../context/SearchContext';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, signOut } = useAuth();
  const { setSelectedCategory, setSearchQuery } = useSearch();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToFeaturedEvents = () => {
    setSelectedCategory(null);
    setSearchQuery('');
    navigate('/');
    setTimeout(() => {
      const featuredEventsSection = document.querySelector('#featured-events');
      if (featuredEventsSection) {
        featuredEventsSection.scrollIntoView({ behavior: 'smooth' });
        setIsMenuOpen(false);
      }
    }, 100);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Calendar className="h-8 w-8 text-purple-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">EventsHub</span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500"
            >
              {isMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <Link to="/" className="text-gray-600 hover:text-gray-900">Home</Link>
            <button 
              onClick={scrollToFeaturedEvents} 
              className="text-gray-600 hover:text-gray-900"
            >
              Events
            </button>
            {isAuthenticated ? (
              <>
                <Link to="/create-event" className="text-gray-600 hover:text-gray-900">Create Event</Link>
                <Link to="/my-events" className="text-gray-600 hover:text-gray-900 flex items-center">
                  <Ticket className="h-5 w-5 mr-1" />
                  My Events
                </Link>
                <div className="flex items-center space-x-4">
                  <span className="text-gray-600">Welcome, {user?.name}</span>
                  <button
                    onClick={handleLogout}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-500 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-purple-600 hover:text-purple-500"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-500 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1">
          <Link 
            to="/" 
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </Link>
          <button
            onClick={scrollToFeaturedEvents}
            className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
          >
            Events
          </button>
          {isAuthenticated ? (
            <>
              <Link
                to="/create-event"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                Create Event
              </Link>
              <Link
                to="/my-events"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center">
                  <Ticket className="h-5 w-5 mr-2" />
                  My Events
                </div>
              </Link>
              <div className="px-3 py-2 text-base font-medium text-gray-700">
                Welcome, {user?.name}
              </div>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white bg-purple-600 hover:bg-purple-500"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="block px-3 py-2 rounded-md text-base font-medium text-purple-600 hover:text-purple-500"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="block px-3 py-2 rounded-md text-base font-medium text-white bg-purple-600 hover:bg-purple-500"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;