
import React from 'react';
import { CheckCircle } from 'lucide-react';

const Phase6UserBenefits: React.FC = () => {
  const benefits = [
    'Publication d\'annonces 100% gratuite',
    'Processus simplifié sans paiement',
    'Interface utilisateur optimisée',
    'Expérience utilisateur améliorée',
    'Pas de gestion de transactions',
    'Sécurité maintenue'
  ];

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border">
      <h3 className="font-semibold text-lg mb-4 text-blue-800">
        🌟 Avantages pour les utilisateurs
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ul className="space-y-2">
          {benefits.slice(0, 3).map((benefit, index) => (
            <li key={index} className="flex items-center gap-2 text-blue-700">
              <CheckCircle className="h-4 w-4 text-green-600" />
              {benefit}
            </li>
          ))}
        </ul>
        <ul className="space-y-2">
          {benefits.slice(3).map((benefit, index) => (
            <li key={index + 3} className="flex items-center gap-2 text-blue-700">
              <CheckCircle className="h-4 w-4 text-green-600" />
              {benefit}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Phase6UserBenefits;
