
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Shield, Zap, Activity, FileSearch, Archive } from 'lucide-react';

interface PhaseIndicatorProps {
  currentPhase: number;
  showDetails?: boolean;
}

const PaymentPhaseIndicator: React.FC<PhaseIndicatorProps> = ({ 
  currentPhase = 5, 
  showDetails = true 
}) => {
  const phases = [
    {
      phase: 1,
      title: "Configuration Initiale",
      description: "Configuration de base et premiers tests",
      icon: Zap,
      status: currentPhase >= 1 ? 'completed' : 'pending'
    },
    {
      phase: 2,
      title: "Intégration Lygos",
      description: "Intégration complète avec l'API Lygos",
      icon: Activity,
      status: currentPhase >= 2 ? 'completed' : 'pending'
    },
    {
      phase: 3,
      title: "Callbacks & Statuts",
      description: "Amélioration des callbacks et gestion des statuts",
      icon: CheckCircle,
      status: currentPhase >= 3 ? 'completed' : 'pending'
    },
    {
      phase: 4,
      title: "Gestion d'Erreurs",
      description: "Système avancé de gestion d'erreurs et retry",
      icon: Shield,
      status: currentPhase >= 4 ? 'completed' : 'pending'
    },
    {
      phase: 5,
      title: "Sécurité & Audit",
      description: "Surveillance complète et sécurité renforcée",
      icon: FileSearch,
      status: currentPhase >= 5 ? 'completed' : currentPhase === 5 ? 'active' : 'pending'
    },
    {
      phase: 6,
      title: "Documentation & Archive",
      description: "Documentation finale et archivage",
      icon: Archive,
      status: currentPhase >= 6 ? 'completed' : currentPhase === 6 ? 'active' : 'pending'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-600 text-white';
      case 'active': return 'bg-blue-600 text-white';
      case 'pending': return 'bg-gray-300 text-gray-600';
      default: return 'bg-gray-300 text-gray-600';
    }
  };

  const getStatusIcon = (status: string, PhaseIcon: React.ComponentType<any>) => {
    if (status === 'completed') {
      return <CheckCircle className="h-4 w-4" />;
    }
    return <PhaseIcon className="h-4 w-4" />;
  };

  return (
    <Card className="border-blue-300 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          Progression de l'Intégration Lygos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Current Phase Highlight */}
          <div className="text-center p-4 bg-white rounded-lg border">
            <Badge className="bg-blue-600 text-white mb-2">
              Phase Actuelle: {currentPhase}
            </Badge>
            <h3 className="font-semibold text-lg">
              {phases.find(p => p.phase === currentPhase)?.title}
            </h3>
            <p className="text-sm text-gray-600">
              {phases.find(p => p.phase === currentPhase)?.description}
            </p>
          </div>

          {/* Phase Timeline */}
          {showDetails && (
            <div className="space-y-3">
              {phases.map((phase, index) => {
                const Icon = phase.icon;
                return (
                  <div 
                    key={phase.phase}
                    className={`flex items-center space-x-3 p-3 rounded-lg transition-colors
                      ${phase.status === 'active' ? 'bg-blue-100 border border-blue-300' : 
                        phase.status === 'completed' ? 'bg-green-50 border border-green-200' : 
                        'bg-gray-50 border border-gray-200'
                      }`}
                  >
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${getStatusColor(phase.status)}`}>
                      {getStatusIcon(phase.status, Icon)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">
                          Phase {phase.phase}: {phase.title}
                        </h4>
                        <Badge 
                          variant="outline" 
                          className={
                            phase.status === 'completed' ? 'border-green-600 text-green-600' :
                            phase.status === 'active' ? 'border-blue-600 text-blue-600' :
                            'border-gray-400 text-gray-600'
                          }
                        >
                          {phase.status === 'completed' ? 'Terminé' :
                           phase.status === 'active' ? 'En cours' : 'En attente'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {phase.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Progress Summary */}
          <div className="text-center text-sm text-gray-600">
            <p>
              Progression: {phases.filter(p => p.status === 'completed').length} / {phases.length} phases terminées
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${(phases.filter(p => p.status === 'completed').length / phases.length) * 100}%` 
                }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentPhaseIndicator;
