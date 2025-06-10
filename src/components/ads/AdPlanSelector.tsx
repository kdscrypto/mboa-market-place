
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';

interface AdPlanSelectorProps {
  selectedPlan: string;
  onPlanSelect: (planId: string) => void;
}

const AdPlanSelector: React.FC<AdPlanSelectorProps> = ({ selectedPlan, onPlanSelect }) => {
  // Since all ads are now free, we only show the standard plan
  const standardPlan = {
    id: 'standard',
    name: 'Annonce Gratuite',
    price: 0,
    duration_days: null,
    description: 'Publication gratuite de votre annonce',
    features: [
      'Publication immédiate après modération',
      'Visibilité dans toutes les catégories',
      'Photos et description complète',
      'Contact direct par téléphone/WhatsApp',
      'Aucun frais caché'
    ]
  };

  React.useEffect(() => {
    // Auto-select the standard plan since it's the only option
    onPlanSelect('standard');
  }, [onPlanSelect]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Type d'annonce</h3>
      
      <Card className="border-2 border-green-500 bg-green-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-green-700">
              {standardPlan.name}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-600 text-white">GRATUIT</Badge>
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-700">0 XAF</div>
              <div className="text-sm text-green-600">Publication gratuite</div>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-gray-700 font-medium">Fonctionnalités incluses :</p>
              <ul className="space-y-1">
                {standardPlan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Bonne nouvelle !</p>
            <p>
              Toutes les annonces sur MboaMarket sont désormais entièrement gratuites. 
              Publiez votre annonce sans aucun frais et profitez de toutes nos fonctionnalités.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdPlanSelector;
