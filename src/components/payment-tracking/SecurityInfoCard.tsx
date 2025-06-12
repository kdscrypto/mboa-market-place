
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Lock, 
  Eye, 
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';

interface SecurityInfoCardProps {
  transaction: any;
}

const SecurityInfoCard: React.FC<SecurityInfoCardProps> = ({
  transaction
}) => {
  const getSecurityLevel = (score?: number) => {
    if (score === undefined || score === null) return 'unknown';
    
    if (score <= 30) return 'high';
    if (score <= 60) return 'medium';
    return 'low';
  };

  const getSecurityBadge = (level: string) => {
    switch (level) {
      case 'high':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <Shield className="h-3 w-3 mr-1" />
            Sécurité élevée
          </Badge>
        );
      case 'medium':
        return (
          <Badge className="bg-orange-100 text-orange-800 border-orange-200">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Sécurité moyenne
          </Badge>
        );
      case 'low':
        return (
          <Badge variant="destructive">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Sécurité faible
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <Info className="h-3 w-3 mr-1" />
            Non évalué
          </Badge>
        );
    }
  };

  const getSecurityFeatures = () => {
    const features = [];
    
    // Vérification de base
    features.push({
      icon: <CheckCircle className="h-4 w-4 text-green-600" />,
      text: 'Transaction chiffrée end-to-end',
      status: 'active'
    });

    // Monitoring en temps réel
    features.push({
      icon: <Eye className="h-4 w-4 text-blue-600" />,
      text: 'Surveillance en temps réel',
      status: 'active'
    });

    // Verrous de sécurité
    if (transaction.processing_lock) {
      features.push({
        icon: <Lock className="h-4 w-4 text-orange-600" />,
        text: 'Verrouillage de traitement actif',
        status: 'warning'
      });
    }

    // Fingerprinting
    if (transaction.client_fingerprint) {
      features.push({
        icon: <Shield className="h-4 w-4 text-green-600" />,
        text: 'Empreinte client validée',
        status: 'active'
      });
    }

    return features;
  };

  const securityLevel = getSecurityLevel(transaction.security_score);
  const securityFeatures = getSecurityFeatures();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Informations de sécurité
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Score de sécurité */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="font-medium">Niveau de sécurité:</span>
          <div className="flex items-center gap-2">
            {getSecurityBadge(securityLevel)}
            {transaction.security_score !== undefined && (
              <span className="text-sm text-gray-600">
                ({transaction.security_score}/100)
              </span>
            )}
          </div>
        </div>

        {/* Fonctionnalités de sécurité */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Fonctionnalités de sécurité</h4>
          <div className="space-y-2">
            {securityFeatures.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                {feature.icon}
                <span className={`text-sm ${
                  feature.status === 'active' ? 'text-gray-700' :
                  feature.status === 'warning' ? 'text-orange-700' :
                  'text-gray-500'
                }`}>
                  {feature.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Informations de traçabilité */}
        {(transaction.locked_by || transaction.client_fingerprint) && (
          <div className="space-y-2 pt-2 border-t">
            <h4 className="font-medium text-sm">Traçabilité</h4>
            
            {transaction.locked_by && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Traité par:</span>
                <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                  {transaction.locked_by}
                </span>
              </div>
            )}
            
            {transaction.client_fingerprint && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Empreinte client:</span>
                <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                  {transaction.client_fingerprint.slice(0, 12)}...
                </span>
              </div>
            )}
          </div>
        )}

        {/* Recommandations de sécurité */}
        {securityLevel === 'low' && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800 text-sm">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Recommandations de sécurité</span>
            </div>
            <ul className="mt-2 text-red-700 text-xs space-y-1">
              <li>• Vérifiez que vous êtes sur le bon site</li>
              <li>• Utilisez une connexion sécurisée</li>
              <li>• Ne partagez jamais vos informations de paiement</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SecurityInfoCard;
