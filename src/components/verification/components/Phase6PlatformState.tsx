
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const Phase6PlatformState: React.FC = () => {
  return (
    <div>
      <h3 className="font-semibold text-lg mb-4">🎯 État final de la plateforme</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl mb-2">💚</div>
            <h4 className="font-medium text-green-800">100% Gratuit</h4>
            <p className="text-sm text-green-600">
              Toutes les annonces sont gratuites
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl mb-2">🔒</div>
            <h4 className="font-medium text-blue-800">Sécurisé</h4>
            <p className="text-sm text-blue-600">
              Sécurité maintenue et renforcée
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl mb-2">⚡</div>
            <h4 className="font-medium text-purple-800">Optimisé</h4>
            <p className="text-sm text-purple-600">
              Performance améliorée
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl mb-2">🎨</div>
            <h4 className="font-medium text-orange-800">Simplifié</h4>
            <p className="text-sm text-orange-600">
              Interface épurée
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Phase6PlatformState;
