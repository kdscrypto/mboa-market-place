
import React from 'react';
import { Users, ShoppingBag, Tag } from 'lucide-react';

const SiteStats = () => {
  // Ces données seraient idéalement récupérées depuis une API
  const stats = [
    {
      id: 1,
      value: "50K+",
      label: "Utilisateurs actifs",
      icon: <Users className="h-8 w-8 text-mboa-orange" />
    },
    {
      id: 2,
      value: "100K+",
      label: "Annonces publiées",
      icon: <ShoppingBag className="h-8 w-8 text-mboa-orange" />
    },
    {
      id: 3,
      value: "25K+",
      label: "Ventes réalisées",
      icon: <Tag className="h-8 w-8 text-mboa-orange" />
    }
  ];

  return (
    <div className="py-6">
      <h2 className="text-2xl font-bold text-center mb-8">Mboa Market en chiffres</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div 
            key={stat.id} 
            className="flex flex-col items-center text-center p-6 bg-white border rounded-lg"
          >
            <div className="mb-4">
              {stat.icon}
            </div>
            <div className="text-3xl font-bold text-mboa-orange mb-2">{stat.value}</div>
            <p className="text-gray-600">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SiteStats;
