import React from 'react';
import { 
  Mic2, 
  Users, 
  Video, 
  Briefcase, 
  Music, 
  GraduationCap,
  Theater,
  Heart
} from 'lucide-react';
import { useSearch } from '../context/SearchContext';

const categories = [
  { id: '1', name: 'Conference', icon: Users },
  { id: '2', name: 'Workshop', icon: Briefcase },
  { id: '3', name: 'Webinar', icon: Video },
  { id: '4', name: 'Music Concert', icon: Music },
  { id: '5', name: 'Education', icon: GraduationCap },
  { id: '6', name: 'Entertainment', icon: Theater },
  { id: '7', name: 'Charity', icon: Heart },
  { id: '8', name: 'Speaking', icon: Mic2 },
];

const Categories: React.FC = () => {
  const { setSelectedCategory } = useSearch();

  const handleCategoryClick = (categoryName: string) => {
    setSelectedCategory(categoryName);
    const featuredEventsSection = document.querySelector('#featured-events');
    if (featuredEventsSection) {
      featuredEventsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="py-8 md:py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">Browse Events by Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.name)}
                className="flex flex-col items-center p-4 md:p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                <IconComponent className="w-8 h-8 md:w-12 md:h-12 text-purple-600 mb-3 md:mb-4" />
                <h3 className="text-base md:text-lg font-medium text-gray-900 text-center">{category.name}</h3>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Categories;