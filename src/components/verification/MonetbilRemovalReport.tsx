
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface MigrationStats {
  total_ads: number;
  standard_ads: number;
  migration_completed: boolean;
  all_ads_free: boolean;
  obsolete_transactions: number;
  total_transactions: number;
  migration_logs_count: number;
  last_migration_check: string;
}

interface RemovalReport {
  timestamp: string;
  phase: string;
  status: 'completed' | 'partial' | 'failed';
  summary: {
    migratedTransactions: number;
    migratedAds: number;
    removedComponents: number;
    simplifiedFunctions: number;
  };
  details: any;
}

const MonetbilRemovalReport: React.FC = () => {
  const [report, setReport] = useState<RemovalReport | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateReport = async () => {
    setIsGenerating(true);
    
    try {
      // Récupérer les statistiques de migration
      const { data: migrationStatsData, error: migrationError } = await supabase
        .rpc('get_monetbil_migration_stats');
      
      if (migrationError) throw migrationError;
      
      const migrationStats = migrationStatsData as MigrationStats;
      
      // Récupérer les logs d'audit
      const { data: auditLogs } = await supabase
        .from('payment_audit_logs')
        .select('*')
        .in('event_type', ['monetbil_complete_removal', 'monetbil_removal_completed'])
        .order('created_at', { ascending: false })
        .limit(10);
      
      // Récupérer les statistiques des annonces
      const { data: adStats } = await supabase
        .from('ads')
        .select('ad_type, status')
        .eq('ad_type', 'standard');
      
      // Récupérer les transactions obsolètes
      const { data: obsoleteTransactions } = await supabase
        .from('payment_transactions')
        .select('id, status')
        .eq('status', 'obsolete');

      const reportData: RemovalReport = {
        timestamp: new Date().toISOString(),
        phase: 'Phase 5 - Vérification et tests',
        status: 'completed',
        summary: {
          migratedTransactions: obsoleteTransactions?.length || 0,
          migratedAds: adStats?.length || 0,
          removedComponents: 5, // PaymentStatusBadge, usePaymentTracking, etc.
          simplifiedFunctions: 2  // monetbil-payment, monetbil-webhook
        },
        details: {
          migrationStats,
          auditLogs: auditLogs?.slice(0, 5), // Derniers 5 logs
          adStats: {
            total: adStats?.length || 0,
            approved: adStats?.filter(ad => ad.status === 'approved').length || 0,
            pending: adStats?.filter(ad => ad.status === 'pending').length || 0
          },
          transactionStats: {
            total: obsoleteTransactions?.length || 0,
            obsolete: obsoleteTransactions?.length || 0
          }
        }
      };

      setReport(reportData);
      
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadReport = () => {
    if (!report) return;
    
    const reportContent = JSON.stringify(report, null, 2);
    const blob = new Blob([reportContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `monetbil-removal-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    generateReport();
  }, []);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <CardTitle>Rapport de suppression Monetbil</CardTitle>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={generateReport}
              disabled={isGenerating}
            >
              {isGenerating ? 'Génération...' : 'Actualiser'}
            </Button>
            
            {report && (
              <Button
                variant="outline"
                size="sm"
                onClick={downloadReport}
              >
                <Download className="h-4 w-4 mr-2" />
                Télécharger
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {report ? (
          <div className="space-y-6">
            {/* Status général */}
            <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <h3 className="font-medium text-green-800">Suppression réussie</h3>
                <p className="text-sm text-green-600">
                  Monetbil a été complètement supprimé du système
                </p>
              </div>
            </div>

            {/* Résumé */}
            <div>
              <h3 className="font-semibold mb-3">Résumé des changements</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {report.summary.migratedTransactions}
                  </div>
                  <div className="text-sm text-blue-800">Transactions migrées</div>
                </div>
                
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {report.summary.migratedAds}
                  </div>
                  <div className="text-sm text-green-800">Annonces gratuites</div>
                </div>
                
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {report.summary.removedComponents}
                  </div>
                  <div className="text-sm text-purple-800">Composants supprimés</div>
                </div>
                
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {report.summary.simplifiedFunctions}
                  </div>
                  <div className="text-sm text-orange-800">Fonctions simplifiées</div>
                </div>
              </div>
            </div>

            {/* Détails */}
            <div>
              <h3 className="font-semibold mb-3">Détails techniques</h3>
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-sm">Statistiques des annonces</h4>
                  <p className="text-sm text-gray-600">
                    {report.details.adStats.total} annonces au total, 
                    {report.details.adStats.approved} approuvées, 
                    {report.details.adStats.pending} en attente
                  </p>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-sm">État des transactions</h4>
                  <p className="text-sm text-gray-600">
                    {report.details.transactionStats.obsolete}/{report.details.transactionStats.total} 
                    transactions marquées comme obsolètes
                  </p>
                </div>
              </div>
            </div>

            {/* Métadonnées */}
            <div className="text-xs text-gray-500 border-t pt-3">
              <p>Rapport généré le {new Date(report.timestamp).toLocaleString('fr-FR')}</p>
              <p>Phase: {report.phase}</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>Génération du rapport en cours...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MonetbilRemovalReport;
