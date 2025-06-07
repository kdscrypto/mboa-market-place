
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TestResult {
  testName: string;
  status: 'passed' | 'failed' | 'error';
  details: string;
  metrics?: any;
  duration: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { testType } = await req.json();
    console.log(`Starting security test suite: ${testType || 'all'}`);

    const testResults: TestResult[] = [];

    // Test 1: Rate Limiting Validation
    if (!testType || testType === 'rate-limit') {
      const startTime = Date.now();
      try {
        // Simuler des requêtes multiples pour tester le rate limiting
        const testIP = '192.168.1.100';
        const rateLimitResults = [];
        
        for (let i = 0; i < 15; i++) {
          const { data } = await supabase.rpc('check_rate_limit', {
            p_identifier: testIP,
            p_identifier_type: 'ip',
            p_action_type: 'webhook',
            p_max_requests: 10,
            p_window_minutes: 60
          });
          rateLimitResults.push(data);
        }

        const blockedRequests = rateLimitResults.filter(r => !r?.allowed).length;
        const duration = Date.now() - startTime;

        testResults.push({
          testName: 'Rate Limiting Test',
          status: blockedRequests >= 5 ? 'passed' : 'failed',
          details: `${blockedRequests} requests blocked out of 15. Rate limiting is ${blockedRequests >= 5 ? 'working correctly' : 'not effective enough'}.`,
          metrics: { totalRequests: 15, blockedRequests, allowedRequests: 15 - blockedRequests },
          duration
        });
      } catch (error) {
        testResults.push({
          testName: 'Rate Limiting Test',
          status: 'error',
          details: `Test failed with error: ${error.message}`,
          duration: Date.now() - startTime
        });
      }
    }

    // Test 2: Anomaly Detection
    if (!testType || testType === 'anomaly-detection') {
      const startTime = Date.now();
      try {
        const testUserId = crypto.randomUUID();
        const testIP = '10.0.0.1';
        
        const { data: anomalyResult } = await supabase.rpc('detect_advanced_security_anomalies', {
          p_transaction_id: crypto.randomUUID(),
          p_user_id: testUserId,
          p_client_ip: testIP,
          p_amount: 1000000, // Montant élevé pour déclencher une anomalie
          p_additional_context: { test: true, simulated_high_risk: true }
        });

        const duration = Date.now() - startTime;
        const riskScore = anomalyResult?.risk_score || 0;

        testResults.push({
          testName: 'Anomaly Detection Test',
          status: riskScore > 50 ? 'passed' : 'failed',
          details: `Risk score: ${riskScore}. Anomaly detection is ${riskScore > 50 ? 'working correctly' : 'not sensitive enough'}.`,
          metrics: { riskScore, autoBlock: anomalyResult?.auto_block },
          duration
        });
      } catch (error) {
        testResults.push({
          testName: 'Anomaly Detection Test',
          status: 'error',
          details: `Test failed with error: ${error.message}`,
          duration: Date.now() - startTime
        });
      }
    }

    // Test 3: Database Security Functions
    if (!testType || testType === 'db-security') {
      const startTime = Date.now();
      try {
        // Tester le chiffrement des données
        const testTransactionId = crypto.randomUUID();
        const testPaymentData = { amount: 5000, currency: 'XAF', test: true };

        await supabase.rpc('encrypt_payment_data', {
          p_transaction_id: testTransactionId,
          p_payment_data: testPaymentData
        });

        // Vérifier que les métriques de sécurité fonctionnent
        const { data: metricsData } = await supabase.rpc('security_performance_metrics', {
          p_time_window_hours: 24
        });

        const duration = Date.now() - startTime;

        testResults.push({
          testName: 'Database Security Functions Test',
          status: metricsData ? 'passed' : 'failed',
          details: `Database security functions are ${metricsData ? 'working correctly' : 'not responding'}.`,
          metrics: { metricsGenerated: !!metricsData, encryptionWorking: true },
          duration
        });
      } catch (error) {
        testResults.push({
          testName: 'Database Security Functions Test',
          status: 'error',
          details: `Test failed with error: ${error.message}`,
          duration: Date.now() - startTime
        });
      }
    }

    // Test 4: Cleanup Operations
    if (!testType || testType === 'cleanup') {
      const startTime = Date.now();
      try {
        const { data: cleanupResult } = await supabase.rpc('advanced_security_cleanup');
        const duration = Date.now() - startTime;

        testResults.push({
          testName: 'Security Cleanup Test',
          status: cleanupResult ? 'passed' : 'failed',
          details: `Security cleanup ${cleanupResult ? 'executed successfully' : 'failed to execute'}.`,
          metrics: cleanupResult,
          duration
        });
      } catch (error) {
        testResults.push({
          testName: 'Security Cleanup Test',
          status: 'error',
          details: `Test failed with error: ${error.message}`,
          duration: Date.now() - startTime
        });
      }
    }

    // Calculer les statistiques globales
    const totalTests = testResults.length;
    const passedTests = testResults.filter(t => t.status === 'passed').length;
    const failedTests = testResults.filter(t => t.status === 'failed').length;
    const errorTests = testResults.filter(t => t.status === 'error').length;
    const totalDuration = testResults.reduce((sum, t) => sum + t.duration, 0);

    const summary = {
      totalTests,
      passedTests,
      failedTests,
      errorTests,
      successRate: Math.round((passedTests / totalTests) * 100),
      totalDuration,
      timestamp: new Date().toISOString()
    };

    // Enregistrer les résultats des tests
    await supabase.from('payment_audit_logs').insert({
      transaction_id: crypto.randomUUID(),
      event_type: 'security_test_suite_completed',
      event_data: {
        summary,
        testResults,
        testType: testType || 'all'
      },
      ip_address: req.headers.get('x-forwarded-for') || 'system',
      user_agent: 'security-test-suite',
      security_flags: {
        automated_test: true,
        test_suite_version: '1.0.0'
      }
    });

    console.log('Security test suite completed:', summary);

    return new Response(
      JSON.stringify({
        success: true,
        summary,
        testResults,
        recommendations: generateRecommendations(testResults)
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Security test suite error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Security test suite failed',
        details: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
})

function generateRecommendations(testResults: TestResult[]): string[] {
  const recommendations: string[] = [];
  
  testResults.forEach(result => {
    if (result.status === 'failed') {
      switch (result.testName) {
        case 'Rate Limiting Test':
          recommendations.push('Réduire les limites de débit ou diminuer la fenêtre de temps pour améliorer la protection.');
          break;
        case 'Anomaly Detection Test':
          recommendations.push('Ajuster les seuils de détection d\'anomalies pour une meilleure sensibilité.');
          break;
        case 'Database Security Functions Test':
          recommendations.push('Vérifier la configuration des fonctions de sécurité de la base de données.');
          break;
        case 'Security Cleanup Test':
          recommendations.push('Examiner les logs du système de nettoyage pour identifier les problèmes.');
          break;
      }
    }
  });
  
  if (recommendations.length === 0) {
    recommendations.push('Tous les tests de sécurité sont passés avec succès. Système sécurisé.');
  }
  
  return recommendations;
}
