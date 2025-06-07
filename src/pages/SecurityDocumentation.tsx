
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  FileText, 
  Clock,
  Users,
  Lock,
  Activity
} from 'lucide-react';

const SecurityDocumentation = () => {
  const incidentTypes = [
    {
      type: 'critical',
      name: 'Incidents Critiques',
      color: 'bg-red-600',
      icon: <AlertTriangle className="h-4 w-4" />,
      examples: ['Violation de sécurité majeure', 'Fuite de données', 'Attaque DDoS réussie'],
      responseTime: '< 15 minutes',
      escalation: 'Notification immédiate du responsable technique'
    },
    {
      type: 'high',
      name: 'Incidents Élevés',
      color: 'bg-orange-600',
      icon: <Shield className="h-4 w-4" />,
      examples: ['Tentatives d\'intrusion multiples', 'Anomalies de paiement suspectes', 'Rate limiting déclenché'],
      responseTime: '< 1 heure',
      escalation: 'Notification de l\'équipe de sécurité'
    },
    {
      type: 'medium',
      name: 'Incidents Moyens',
      color: 'bg-yellow-600',
      icon: <Activity className="h-4 w-4" />,
      examples: ['Signatures webhook invalides', 'Comportements suspects détectés'],
      responseTime: '< 4 heures',
      escalation: 'Monitoring continu, intervention si escalade'
    },
    {
      type: 'low',
      name: 'Incidents Faibles',
      color: 'bg-blue-600',
      icon: <CheckCircle className="h-4 w-4" />,
      examples: ['Tentatives de connexion échouées normales', 'Métriques de routine'],
      responseTime: '< 24 heures',
      escalation: 'Revue lors de la maintenance régulière'
    }
  ];

  const securityProcedures = [
    {
      title: 'Procédure de Réponse aux Incidents',
      steps: [
        '1. Détection automatique ou manuelle de l\'incident',
        '2. Classification immédiate selon la gravité',
        '3. Notification des parties prenantes selon le niveau',
        '4. Isolation des systèmes affectés si nécessaire',
        '5. Investigation et collecte de preuves',
        '6. Mise en place de mesures correctives',
        '7. Documentation complète de l\'incident',
        '8. Revue post-incident et amélioration des procédures'
      ]
    },
    {
      title: 'Surveillance Continue',
      steps: [
        '1. Monitoring 24/7 des métriques de sécurité',
        '2. Alertes automatiques pour les anomalies',
        '3. Revue quotidienne des logs de sécurité',
        '4. Tests de stress hebdomadaires',
        '5. Audit mensuel des configurations de sécurité',
        '6. Mise à jour trimestrielle des politiques'
      ]
    },
    {
      title: 'Gestion des Accès',
      steps: [
        '1. Principe du moindre privilège',
        '2. Authentification multi-facteurs obligatoire',
        '3. Revue périodique des accès',
        '4. Révocation immédiate en cas de départ',
        '5. Journalisation de tous les accès administratifs',
        '6. Formation régulière du personnel'
      ]
    }
  ];

  const securityMetrics = [
    { name: 'Temps de détection moyen', value: '< 5 minutes', target: '< 3 minutes' },
    { name: 'Temps de réponse critique', value: '< 15 minutes', target: '< 10 minutes' },
    { name: 'Taux de faux positifs', value: '< 2%', target: '< 1%' },
    { name: 'Couverture des tests', value: '95%', target: '98%' },
    { name: 'Incidents résolus', value: '99.5%', target: '99.8%' }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-8 bg-mboa-gray">
        <div className="mboa-container max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">Documentation Sécurité</h1>
            <p className="text-gray-600">
              Procédures et protocoles de sécurité pour la gestion des incidents de paiement
            </p>
          </div>

          <Tabs defaultValue="procedures" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="procedures">Procédures</TabsTrigger>
              <TabsTrigger value="incidents">Classification</TabsTrigger>
              <TabsTrigger value="metrics">Métriques</TabsTrigger>
              <TabsTrigger value="contacts">Contacts</TabsTrigger>
            </TabsList>

            <TabsContent value="procedures" className="space-y-6">
              <div className="grid gap-6">
                {securityProcedures.map((procedure, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        {procedure.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {procedure.steps.map((step, stepIndex) => (
                          <div key={stepIndex} className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-mboa-orange text-white text-xs flex items-center justify-center mt-0.5 flex-shrink-0">
                              {stepIndex + 1}
                            </div>
                            <span className="text-sm">{step.substring(2)}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="incidents" className="space-y-6">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Classification des incidents selon leur gravité et procédures de réponse associées.
                </AlertDescription>
              </Alert>

              <div className="grid gap-4">
                {incidentTypes.map((incident) => (
                  <Card key={incident.type}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge className={incident.color}>
                            {incident.icon}
                            <span className="ml-2">{incident.name}</span>
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>{incident.responseTime}</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Exemples d'incidents:</h4>
                          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                            {incident.examples.map((example, index) => (
                              <li key={index}>{example}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Procédure d'escalade:</h4>
                          <p className="text-sm text-gray-600">{incident.escalation}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="metrics" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Indicateurs de Performance Sécurité (KPI)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {securityMetrics.map((metric, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded">
                        <div>
                          <h4 className="font-medium">{metric.name}</h4>
                          <p className="text-sm text-gray-600">Objectif: {metric.target}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-mboa-orange">{metric.value}</div>
                          <Badge variant={metric.value === metric.target ? 'default' : 'secondary'}>
                            {metric.value === metric.target ? 'Atteint' : 'En cours'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tests de Sécurité Automatisés</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 border rounded">
                      <span>Tests quotidiens de rate limiting</span>
                      <Badge className="bg-green-600">Actif</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded">
                      <span>Validation des signatures webhook</span>
                      <Badge className="bg-green-600">Actif</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded">
                      <span>Tests de détection d'anomalies</span>
                      <Badge className="bg-green-600">Actif</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded">
                      <span>Audit des fonctions de sécurité</span>
                      <Badge className="bg-green-600">Actif</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contacts" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Équipe de Sécurité
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium">Responsable Sécurité</h4>
                        <p className="text-sm text-gray-600">security@mboa.co</p>
                        <p className="text-sm text-gray-600">+237 XXX XXX XXX</p>
                      </div>
                      <div>
                        <h4 className="font-medium">Équipe Technique</h4>
                        <p className="text-sm text-gray-600">tech@mboa.co</p>
                        <p className="text-sm text-gray-600">Disponible 24/7</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Contacts d'Urgence
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium">Incidents Critiques</h4>
                        <p className="text-sm text-gray-600">emergency@mboa.co</p>
                        <p className="text-sm text-gray-600">+237 XXX XXX XXX (24/7)</p>
                      </div>
                      <div>
                        <h4 className="font-medium">Autorités</h4>
                        <p className="text-sm text-gray-600">CERT Cameroun</p>
                        <p className="text-sm text-gray-600">Police Cyber Cameroun</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Alert>
                <Lock className="h-4 w-4" />
                <AlertDescription>
                  <strong>Important:</strong> En cas d'incident de sécurité critique, contactez immédiatement 
                  l'équipe d'urgence et suivez les procédures de confinement avant toute autre action.
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SecurityDocumentation;
