
import React from 'react';
import { CheckCircle } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      id: 1,
      title: "Créez votre annonce",
      description: "Ajoutez une description, des photos et fixez votre prix",
      icon: <CheckCircle className="h-10 w-10 text-mboa-orange" />
    },
    {
      id: 2,
      title: "Publiez gratuitement",
      description: "Votre annonce sera visible par des milliers d'acheteurs",
      icon: <CheckCircle className="h-10 w-10 text-mboa-orange" />
    },
    {
      id: 3,
      title: "Répondez aux demandes",
      description: "Échangez avec les acheteurs intéressés",
      icon: <CheckCircle className="h-10 w-10 text-mboa-orange" />
    },
    {
      id: 4,
      title: "Vendez votre produit",
      description: "Concluez la vente et recevez votre paiement",
      icon: <CheckCircle className="h-10 w-10 text-mboa-orange" />
    }
  ];

  return (
    <div className="py-6">
      <h2 className="text-2xl font-bold text-center mb-8">Comment ça marche ?</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((step) => (
          <div 
            key={step.id} 
            className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-sm hover-scale"
          >
            <div className="mb-4">
              {step.icon}
            </div>
            <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
            <p className="text-gray-600">{step.description}</p>
            <div className="mt-4 text-2xl font-bold text-mboa-orange">{step.id}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HowItWorks;
