
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Eye, Home, Plus } from 'lucide-react';

interface CreateAdSuccessMessageProps {
  adId: string;
  requiresPayment: boolean;
  paymentUrl?: string;
}

const CreateAdSuccessMessage: React.FC<CreateAdSuccessMessageProps> = ({
  adId,
  requiresPayment,
  paymentUrl
}) => {
  const navigate = useNavigate();

  // Since all ads are now free, requiresPayment should always be false
  if (requiresPayment && paymentUrl) {
    // This case should not occur anymore, but kept for safety
    return (
      <Card className="border-orange-300 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <CheckCircle className="h-6 w-6" />
            Annonce créée - Paiement requis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              Votre annonce a été créée avec l'ID: <strong>{adId}</strong>
            </AlertDescription>
          </Alert>
          
          <p className="text-orange-800">
            Pour activer votre annonce premium, veuillez procéder au paiement.
          </p>
          
          <div className="flex gap-3">
            <Button 
              onClick={() => window.open(paymentUrl, '_blank')}
              className="bg-mboa-orange hover:bg-mboa-orange/90"
            >
              Procéder au paiement
            </Button>
            <Button variant="outline" onClick={() => navigate('/')}>
              <Home className="mr-2 h-4 w-4" />
              Retour à l'accueil
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Standard success message for free ads
  return (
    <Card className="border-green-300 bg-green-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-800">
          <CheckCircle className="h-6 w-6" />
          Annonce créée avec succès !
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Votre annonce a été créée avec l'ID: <strong>{adId}</strong>
          </AlertDescription>
        </Alert>
        
        <div className="space-y-2">
          <p className="text-green-800 font-medium">
            🎉 Félicitations ! Votre annonce est maintenant en cours de modération.
          </p>
          <p className="text-green-700 text-sm">
            Elle sera visible publiquement dès qu'elle sera approuvée par notre équipe.
            Vous recevrez une notification par email.
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-green-200">
          <h4 className="font-medium text-green-800 mb-2">Prochaines étapes :</h4>
          <ul className="space-y-1 text-sm text-green-700">
            <li>• Votre annonce est en cours de vérification</li>
            <li>• Vous recevrez un email de confirmation</li>
            <li>• Elle sera visible dans 24-48h maximum</li>
            <li>• Vous pourrez la gérer depuis votre tableau de bord</li>
          </ul>
        </div>
        
        <div className="flex gap-3 pt-2">
          <Button 
            onClick={() => navigate('/dashboard')}
            className="bg-mboa-orange hover:bg-mboa-orange/90"
          >
            <Eye className="mr-2 h-4 w-4" />
            Mes annonces
          </Button>
          <Button variant="outline" onClick={() => navigate('/publier-annonce')}>
            <Plus className="mr-2 h-4 w-4" />
            Créer une autre annonce
          </Button>
          <Button variant="outline" onClick={() => navigate('/')}>
            <Home className="mr-2 h-4 w-4" />
            Retour à l'accueil
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreateAdSuccessMessage;
