
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PaymentAnalytics from '@/components/payment/PaymentAnalytics';
import PaymentRecoveryManager from '@/components/payment/PaymentRecoveryManager';
import PaymentStatusTracker from '@/components/payment/PaymentStatusTracker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  History, 
  AlertTriangle, 
  Plus,
  RefreshCw
} from 'lucide-react';

const PaymentDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [pendingTransactions, setPendingTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
    loadPendingTransactions();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate('/login');
      return;
    }
    
    setUser(session.user);
  };

  const loadPendingTransactions = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPendingTransactions(data || []);
    } catch (error) {
      console.error('Error loading pending transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecoverySuccess = (transactionId: string) => {
    toast({
      title: "Transaction récupérée",
      description: "Vous pouvez maintenant suivre votre nouveau paiement",
    });
    
    navigate(`/payment-tracking/${transactionId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow py-8 bg-mboa-gray">
          <div className="mboa-container max-w-6xl">
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="h-8 w-8 animate-spin text-mboa-orange" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-8 bg-mboa-gray">
        <div className="mboa-container max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Tableau de bord des paiements</h1>
            <p className="text-gray-600">
              Gérez vos paiements, consultez les statistiques et récupérez les transactions échouées.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Actions rapides</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <Button 
                    onClick={() => navigate('/publier-annonce')}
                    className="bg-mboa-orange hover:bg-mboa-orange/90"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Nouvelle annonce premium
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={loadPendingTransactions}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Actualiser
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pending Transactions Alert */}
          {pendingTransactions.length > 0 && (
            <div className="mb-8">
              <Card className="border-yellow-300 bg-yellow-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-yellow-800">
                    <AlertTriangle className="h-5 w-5" />
                    Paiements en attente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-yellow-700 mb-4">
                    Vous avez {pendingTransactions.length} paiement(s) en cours de traitement.
                  </p>
                  <div className="space-y-3">
                    {pendingTransactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 bg-white rounded border">
                        <div>
                          <p className="font-medium">
                            {transaction.amount.toLocaleString()} {transaction.currency}
                          </p>
                          <p className="text-sm text-gray-500">
                            Créé le {new Date(transaction.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <PaymentStatusTracker
                            transactionId={transaction.id}
                            showActions={false}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/payment-tracking/${transaction.id}`)}
                          >
                            Suivre
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Main Content Tabs */}
          <Tabs defaultValue="analytics" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytiques
              </TabsTrigger>
              <TabsTrigger value="recovery" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                Récupération
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Historique
              </TabsTrigger>
            </TabsList>

            <TabsContent value="analytics">
              <PaymentAnalytics userId={user.id} timeRange="month" />
            </TabsContent>

            <TabsContent value="recovery">
              <PaymentRecoveryManager 
                userId={user.id}
                onRecoverySuccess={handleRecoverySuccess}
              />
            </TabsContent>

            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Historique complet des paiements</CardTitle>
                </CardHeader>
                <CardContent>
                  <PaymentAnalytics userId={user.id} timeRange="year" />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PaymentDashboard;
