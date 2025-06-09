
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const PaymentTransactionsTab = () => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historique des paiements</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-gray-500">
          <div className="mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Toutes les annonces sont gratuites !</h3>
            <p className="text-gray-600 mb-4">
              Nous avons supprimé tous les frais de publication d'annonces. 
              Vous pouvez maintenant créer toutes vos annonces gratuitement.
            </p>
            <Button 
              onClick={() => navigate('/publier-annonce')}
              className="bg-mboa-orange hover:bg-mboa-orange/90"
            >
              Créer une annonce gratuite
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentTransactionsTab;
