
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Star, Clock } from 'lucide-react';
import { adPlans, formatPrice } from './AdPlansData';

interface AdPlanSelectorProps {
  selectedPlan: string;
  onPlanSelect: (planId: string) => void;
}

const AdPlanSelector: React.FC<AdPlanSelectorProps> = ({ selectedPlan, onPlanSelect }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Choisir un plan d'annonce</h3>
      
      <RadioGroup value={selectedPlan} onValueChange={onPlanSelect}>
        {adPlans.map((plan) => (
          <Card 
            key={plan.id} 
            className={`cursor-pointer transition-colors ${
              selectedPlan === plan.id 
                ? 'ring-2 ring-mboa-orange bg-orange-50' 
                : 'hover:bg-gray-50'
            }`}
          >
            <CardHeader>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value={plan.id} id={plan.id} />
                <Label htmlFor={plan.id} className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-between w-full">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{plan.name}</CardTitle>
                        {plan.id !== 'standard' && (
                          <Badge className="bg-mboa-orange text-white gap-1">
                            <Star className="h-3 w-3" />
                            Premium
                          </Badge>
                        )}
                        {plan.id === 'standard' && (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            Gratuit
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{plan.description}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        {plan.duration}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-mboa-orange">
                        {plan.price === 0 ? 'Gratuit' : `${formatPrice(plan.price)} XAF`}
                      </div>
                    </div>
                  </div>
                </Label>
              </div>
            </CardHeader>
            <CardContent>
              {plan.id === 'standard' ? (
                <div className="space-y-2">
                  <ul className="space-y-1">
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <Star className="h-4 w-4 text-green-500 flex-shrink-0" />
                      Publication après modération
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <Star className="h-4 w-4 text-green-500 flex-shrink-0" />
                      Visibilité dans les résultats de recherche
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <Star className="h-4 w-4 text-green-500 flex-shrink-0" />
                      Photos et description complète
                    </li>
                  </ul>
                </div>
              ) : (
                <div className="space-y-2">
                  <ul className="space-y-1">
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <Star className="h-4 w-4 text-mboa-orange flex-shrink-0" />
                      Mise en avant dans les résultats
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <Star className="h-4 w-4 text-mboa-orange flex-shrink-0" />
                      Apparition en tête de liste
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <Star className="h-4 w-4 text-mboa-orange flex-shrink-0" />
                      Badge Premium visible
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <Star className="h-4 w-4 text-mboa-orange flex-shrink-0" />
                      Priorité dans les suggestions
                    </li>
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </RadioGroup>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <Star className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Pourquoi choisir Premium ?</p>
            <p>
              Les annonces premium bénéficient d'une visibilité accrue et apparaissent 
              en premier dans les résultats de recherche, augmentant vos chances de vente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdPlanSelector;
