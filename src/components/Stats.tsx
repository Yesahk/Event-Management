import React from 'react';
import { Users, Calendar, Star, Award } from 'lucide-react';

const stats = [
  { id: 1, name: 'Events Created', value: '500+', icon: Calendar },
  { id: 2, name: 'Active Users', value: '10,000+', icon: Users },
  { id: 3, name: 'Success Rate', value: '98%', icon: Star },
  { id: 4, name: 'Awards Won', value: '15+', icon: Award },
];

const Stats: React.FC = () => {
  return (
    <section className="bg-purple-600 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => {
            const IconComponent = stat.icon;
            return (
              <div key={stat.id} className="text-center">
                <div className="inline-block p-4 bg-white/10 rounded-full mb-4">
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-purple-200">{stat.name}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Stats;