
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  Clock, 
  RefreshCw, 
  ExternalLink,
  AlertTriangle
} from 'lucide-react';
import { createLygosPayment, verifyLygosPayment } from '@/services/lygosService';

interface PaymentData {
  amount: number;
  description: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  adId: string;
}

const LygosPaymentManager: React.FC = () => {
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [paymentResult, setPaymentResult] = useState<any>(null);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [paymentIdToVerify, setPaymentIdToVerify] = useState('');
  const { toast } = useToast();

  const testPaymentData: PaymentData = {
    amount: 1000,
    description: 'Test Annonce Premium 24h',
    customerName: 'Test User',
    customerEmail: 'test@example.com',
    customerPhone: '+237123456789',
    adId: 'test-ad-id'
  };

  const createTestPayment = async () => {
    setIsCreatingPayment(true);
    setPaymentResult(null);

    try {
      const baseUrl = window.location.origin;
      const externalReference = `test_${Date.now()}`;
      
      const paymentData = {
        amount: testPaymentData.amount,
        currency: 'XAF',
        description: testPaymentData.description,
        customerName: testPaymentData.customerName,
        customerEmail: testPaymentData.customerEmail,
        customerPhone: testPaymentData.customerPhone,
        returnUrl: `${baseUrl}/lygos-callback?ad_id=${testPaymentData.adId}&status=success`,
        cancelUrl: `${baseUrl}/lygos-callback?ad_id=${testPaymentData.adId}&status=cancelled`,
        webhookUrl: `https://hvzqgeeidzkhctoygbts.supabase.co/functions/v1/lygos-webhook`,
        externalReference
      };

      console.log('Creating test payment with data:', paymentData);
      
      const result = await createLygosPayment(paymentData);
      setPaymentResult(result);

      if (result.success && result.paymentUrl) {
        toast({
          title: "Paiement de test créé",
          description: "Le lien de paiement a été généré avec succès",
        });
      } else {
        toast({
          title: "Erreur",
          description: result.error || "Erreur lors de la création du paiement",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error creating test payment:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le paiement de test",
        variant: "destructive"
      });
    } finally {
      setIsCreatingPayment(false);
    }
  };

  const verifyPayment = async () => {
    if (!paymentIdToVerify.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir un ID de paiement",
        variant: "destructive"
      });
      return;
    }

    setIsVerifying(true);
    setVerificationResult(null);

    try {
      const result = await verifyLygosPayment(paymentIdToVerify.trim());
      setVerificationResult(result);

      if (result.success) {
        toast({
          title: "Vérification réussie",
          description: "Le statut du paiement a été récupéré",
        });
      } else {
        toast({
          title: "Erreur de vérification",
          description: result.error || "Impossible de vérifier le paiement",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la vérification du paiement",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'success':
        return <Badge className="bg-green-600 text-white">Complété</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-600 text-white">En attente</Badge>;
      case 'failed':
      case 'cancelled':
        return <Badge variant="destructive">Échoué</Badge>;
      case 'expired':
        return <Badge variant="secondary">Expiré</Badge>;
      default:
        return <Badge variant="outline">{status || 'Inconnu'}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Gestionnaire de Paiements Lygos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="create" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="create">Créer un paiement test</TabsTrigger>
              <TabsTrigger value="verify">Vérifier un paiement</TabsTrigger>
            </TabsList>

            <TabsContent value="create" className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Ce test créera un vrai paiement Lygos. Utilisez des données de test appropriées.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Montant:</p>
                  <p className="text-lg">{testPaymentData.amount} XAF</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Description:</p>
                  <p className="text-sm text-gray-600">{testPaymentData.description}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Client:</p>
                  <p className="text-sm text-gray-600">{testPaymentData.customerName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Email:</p>
                  <p className="text-sm text-gray-600">{testPaymentData.customerEmail}</p>
                </div>
              </div>

              <Button 
                onClick={createTestPayment} 
                disabled={isCreatingPayment}
                className="bg-mboa-orange hover:bg-mboa-orange/90"
              >
                {isCreatingPayment ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CreditCard className="mr-2 h-4 w-4" />
                )}
                {isCreatingPayment ? 'Création en cours...' : 'Créer un paiement test'}
              </Button>

              {paymentResult && (
                <Card className={`border-2 ${paymentResult.success ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        {paymentResult.success ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                        <span className="font-medium">
                          {paymentResult.success ? 'Paiement créé avec succès' : 'Erreur de création'}
                        </span>
                      </div>

                      {paymentResult.success ? (
                        <div className="space-y-2">
                          <p><strong>ID Paiement:</strong> {paymentResult.paymentId}</p>
                          <p><strong>ID Transaction:</strong> {paymentResult.transactionId}</p>
                          {paymentResult.status && (
                            <div className="flex items-center gap-2">
                              <strong>Statut:</strong> {getStatusBadge(paymentResult.status)}
                            </div>
                          )}
                          {paymentResult.paymentUrl && (
                            <Button 
                              variant="outline" 
                              className="mt-2"
                              onClick={() => window.open(paymentResult.paymentUrl, '_blank')}
                            >
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Ouvrir le lien de paiement
                            </Button>
                          )}
                        </div>
                      ) : (
                        <p className="text-red-600">{paymentResult.error}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="verify" className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">ID de paiement Lygos</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={paymentIdToVerify}
                    onChange={(e) => setPaymentIdToVerify(e.target.value)}
                    placeholder="Saisissez l'ID du paiement"
                    className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                  <Button 
                    onClick={verifyPayment} 
                    disabled={isVerifying || !paymentIdToVerify.trim()}
                  >
                    {isVerifying ? (
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="mr-2 h-4 w-4" />
                    )}
                    Vérifier
                  </Button>
                </div>
              </div>

              {verificationResult && (
                <Card className={`border-2 ${verificationResult.success ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        {verificationResult.success ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                        <span className="font-medium">
                          {verificationResult.success ? 'Paiement vérifié' : 'Erreur de vérification'}
                        </span>
                      </div>

                      {verificationResult.success && verificationResult.paymentData ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <strong>Statut:</strong> 
                            {getStatusBadge(verificationResult.paymentData.status)}
                          </div>
                          
                          {verificationResult.paymentData.amount && (
                            <p><strong>Montant:</strong> {verificationResult.paymentData.amount} {verificationResult.paymentData.currency || 'XAF'}</p>
                          )}
                          
                          {verificationResult.paymentData.reference && (
                            <p><strong>Référence:</strong> {verificationResult.paymentData.reference}</p>
                          )}
                          
                          {verificationResult.paymentData.created_at && (
                            <p><strong>Créé le:</strong> {new Date(verificationResult.paymentData.created_at).toLocaleString()}</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-red-600">{verificationResult.error}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default LygosPaymentManager;
