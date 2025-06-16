
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, User, UserPlus, UserMinus, Crown, Star } from 'lucide-react';

type UserRole = 'user' | 'admin' | 'moderator';

interface RoleCardProps {
  role: UserRole;
  isCurrentRole: boolean;
  onRoleChange: (role: UserRole) => void;
  disabled?: boolean;
}

const RoleCard: React.FC<RoleCardProps> = ({ 
  role, 
  isCurrentRole, 
  onRoleChange, 
  disabled = false 
}) => {
  const getRoleConfig = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return {
          icon: Crown,
          label: 'Administrateur',
          description: 'Accès complet à toutes les fonctionnalités',
          color: 'from-red-500 to-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-700',
          badgeColor: 'bg-red-100 text-red-800'
        };
      case 'moderator':
        return {
          icon: Shield,
          label: 'Modérateur',
          description: 'Modération des contenus et support utilisateurs',
          color: 'from-blue-500 to-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-700',
          badgeColor: 'bg-blue-100 text-blue-800'
        };
      case 'user':
        return {
          icon: User,
          label: 'Utilisateur',
          description: 'Accès standard aux fonctionnalités de base',
          color: 'from-gray-500 to-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-700',
          badgeColor: 'bg-gray-100 text-gray-800'
        };
    }
  };

  const config = getRoleConfig(role);
  const IconComponent = config.icon;

  return (
    <Card className={`
      relative overflow-hidden transition-all duration-300 cursor-pointer
      ${isCurrentRole ? `${config.borderColor} border-2 ${config.bgColor}` : 'border hover:shadow-md'}
      ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
    `}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`
            w-12 h-12 rounded-full bg-gradient-to-r ${config.color} 
            flex items-center justify-center mb-3
          `}>
            <IconComponent className="h-6 w-6 text-white" />
          </div>
          {isCurrentRole && (
            <Badge className={config.badgeColor}>
              <Star className="h-3 w-3 mr-1" />
              Actuel
            </Badge>
          )}
        </div>

        <h3 className={`font-semibold text-lg mb-2 ${config.textColor}`}>
          {config.label}
        </h3>
        
        <p className="text-sm text-gray-600 mb-4 min-h-[2.5rem]">
          {config.description}
        </p>

        {!isCurrentRole && (
          <Button
            onClick={() => onRoleChange(role)}
            disabled={disabled}
            className={`
              w-full bg-gradient-to-r ${config.color} hover:opacity-90 
              text-white border-0 transition-all duration-200
            `}
            size="sm"
          >
            {role === 'user' ? (
              <>
                <UserMinus className="h-4 w-4 mr-2" />
                Rétrograder
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                Promouvoir
              </>
            )}
          </Button>
        )}
      </CardContent>

      {/* Gradient overlay for current role */}
      {isCurrentRole && (
        <div className={`
          absolute inset-0 bg-gradient-to-r ${config.color} opacity-5 pointer-events-none
        `} />
      )}
    </Card>
  );
};

export default RoleCard;
