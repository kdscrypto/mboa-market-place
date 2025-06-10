
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CreditCard, 
  Zap, 
  CheckCircle, 
  AlertCircle,
  Clock,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { createLygosPayment, verifyLygosPayment } from '@/services/lygosService';

interface TestPaymentData {
  amount: number;
  description: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
}

const LygosPaymentManager: React.FC = () => {
  const [testData, setTestData] = useState<TestPaymentData>({
    amount: 1000,
    description: 'Test de paiement Lygos - Phase 5',
    customer_name: 'Utilisateur Test',
    customer_email: 'test@example.com',
    customer_phone: '+237600000000'
  });
  const [isCreating, setIsCreating] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [paymentResult, setPaymentResult] = useState<any>(null);
  const [verificationPaymentId, setVerificationPaymentId] = useState('');
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const { toast } = useToast();

  const createTestPayment = async () => {
    setIsCreating(true);
    setPaymentResult(null);
    
    try {
      const result = await createLygosPayment({
        amount: testData.amount,
        currency: 'XAF',
        description: testData.description,
        customer: {
          name: testData.customer_name,
          email: testData.customer_email,
          phone: testData.customer_phone
        },
        metadata: {
          test_mode: true,
          phase: 5,
          timestamp: new Date().toISOString()
        }
      });

      setPaymentResult(result);

      if (result.success) {
        toast({
          title: "Paiement créé avec succès",
          description: `ID de paiement: ${result.paymentData?.id || 'N/A'}`,
        });
      } else {
        toast({
          title: "Erreur de création",
          description: result.error || "Erreur inconnue",
          variant: "destructive"
        });
      }
      
    } catch (error) {
      console.error('Error creating test payment:', error);
      toast({
        title: "Erreur de test",
        description: "Impossible de créer le paiement de test",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const verifyTestPayment = async () => {
    if (!verificationPaymentId.trim()) {
      toast({
        title: "ID requis",
        description: "Veuillez saisir un ID de paiement à vérifier",
        variant: "destructive"
      });
      return;
    }

    setIsVerifying(true);
    setVerificationResult(null);
    
    try {
      const result = await verifyLygosPayment(verificationPaymentId);

      setVerificationResult(result);

      if (result.success) {
        toast({
          title: "Vérification réussie",
          description: `Statut: ${result.paymentData?.status || 'Inconnu'}`,
        });
      } else {
        toast({
          title: "Erreur de vérification",
          description: result.error || "Erreur inconnue",
          variant: "destructive"
        });
      }
      
    } catch (error) {
      console.error('Error verifying payment:', error);
      toast({
        title: "Erreur de vérification",
        description: "Impossible de vérifier le paiement",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'success':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Complété</Badge>;
      case 'pending':
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="h-3 w-3 mr-1" />En attente</Badge>;
      case 'failed':
      case 'error':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Échoué</Badge>;
      case 'cancelled':
        return <Badge variant="secondary">Annulé</Badge>;
      default:
        return <Badge variant="outline">{status || 'Inconnu'}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center space-x-2">
        <CreditCard className="h-6 w-6 text-blue-600" />
        <h3 className="text-lg font-semibold">Gestionnaire de Paiements Lygos - Phase 5</h3>
      </div>

      {/* Création de paiement de test */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Créer un Paiement de Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Montant (XAF)</label>
              <Input
                type="number"
                value={testData.amount}
                onChange={(e) => setTestData({ ...testData, amount: parseInt(e.target.value) || 0 })}
                min="100"
                max="1000000"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Nom du client</label>
              <Input
                value={testData.customer_name}
                onChange={(e) => setTestData({ ...testData, customer_name: e.target.value })}
                placeholder="Nom complet"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Email du client</label>
              <Input
                type="email"
                value={testData.customer_email}
                onChange={(e) => setTestData({ ...testData, customer_email: e.target.value })}
                placeholder="email@example.com"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Téléphone du client</label>
              <Input
                value={testData.customer_phone}
                onChange={(e) => setTestData({ ...testData, customer_phone: e.target.value })}
                placeholder="+237600000000"
              />
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={testData.description}
              onChange={(e) => setTestData({ ...testData, description: e.target.value })}
              placeholder="Description du paiement"
              rows={2}
            />
          </div>
          
          <Button 
            onClick={createTestPayment}
            disabled={isCreating}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isCreating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Création en cours...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Créer le paiement
              </>
            )}
          </Button>
          
          {/* Résultat de création */}
          {paymentResult && (
            <Alert className={paymentResult.success ? "border-green-300 bg-green-50" : "border-red-300 bg-red-50"}>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {paymentResult.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span className="font-medium">
                    {paymentResult.success ? 'Paiement créé avec succès' : 'Erreur de création'}
                  </span>
                </div>
                
                {paymentResult.success && paymentResult.paymentData && (
                  <div className="space-y-1 text-sm">
                    <p><strong>ID:</strong> {paymentResult.paymentData.id}</p>
                    <p><strong>Statut:</strong> {getStatusBadge(paymentResult.paymentData.status)}</p>
                    <p><strong>Montant:</strong> {paymentResult.paymentData.amount} {paymentResult.paymentData.currency}</p>
                    {paymentResult.paymentData.payment_url && (
                      <div className="flex items-center gap-2">
                        <strong>URL de paiement:</strong>
                        <Button
                          onClick={() => window.open(paymentResult.paymentData.payment_url, '_blank')}
                          size="sm"
                          variant="outline"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Ouvrir
                        </Button>
                      </div>
                    )}
                  </div>
                )}
                
                {!paymentResult.success && (
                  <p className="text-sm text-red-700">{paymentResult.error}</p>
                )}
              </div>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Vérification de paiement */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Vérifier un Paiement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">ID de paiement Lygos</label>
            <Input
              value={verificationPaymentId}
              onChange={(e) => setVerificationPaymentId(e.target.value)}
              placeholder="Saisir l'ID du paiement à vérifier"
            />
          </div>
          
          <Button 
            onClick={verifyTestPayment}
            disabled={isVerifying || !verificationPaymentId.trim()}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {isVerifying ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Vérification en cours...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Vérifier le paiement
              </>
            )}
          </Button>
          
          {/* Résultat de vérification */}
          {verificationResult && (
            <Alert className={verificationResult.success ? "border-green-300 bg-green-50" : "border-red-300 bg-red-50"}>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {verificationResult.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span className="font-medium">
                    {verificationResult.success ? 'Vérification réussie' : 'Erreur de vérification'}
                  </span>
                </div>
                
                {verificationResult.success && verificationResult.paymentData && (
                  <div className="space-y-1 text-sm">
                    <p><strong>ID:</strong> {verificationResult.paymentData.id}</p>
                    <p><strong>Statut:</strong> {getStatusBadge(verificationResult.paymentData.status)}</p>
                    <p><strong>Montant:</strong> {verificationResult.paymentData.amount} {verificationResult.paymentData.currency}</p>
                    <p><strong>Créé le:</strong> {new Date(verificationResult.paymentData.created_at).toLocaleString()}</p>
                    {verificationResult.paymentData.completed_at && (
                      <p><strong>Complété le:</strong> {new Date(verificationResult.paymentData.completed_at).toLocaleString()}</p>
                    )}
                  </div>
                )}
                
                {!verificationResult.success && (
                  <p className="text-sm text-red-700">{verificationResult.error}</p>
                )}
              </div>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Guide d'utilisation */}
      <Alert className="border-blue-300 bg-blue-50">
        <CreditCard className="h-4 w-4" />
        <AlertDescription>
          <strong>Guide de test Phase 5:</strong>
          <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
            <li>Créez un paiement de test avec les données de votre choix</li>
            <li>Copiez l'ID du paiement généré</li>
            <li>Utilisez cet ID pour tester la vérification</li>
            <li>Consultez les journaux d'audit pour voir tous les événements</li>
          </ol>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default LygosPaymentManager;
