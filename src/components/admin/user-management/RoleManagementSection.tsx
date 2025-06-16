
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import RoleCard from './RoleCard';

type UserRole = 'user' | 'admin' | 'moderator';

interface UserData {
  id: string;
  email: string;
  username?: string;
  role: UserRole;
  created_at: string;
  total_count: number;
}

interface RoleManagementSectionProps {
  user: UserData;
  onRoleChange: (role: UserRole) => void;
  isLoading: boolean;
}

const RoleManagementSection: React.FC<RoleManagementSectionProps> = ({
  user,
  onRoleChange,
  isLoading
}) => {
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="bg-gray-50 rounded-t-lg">
        <CardTitle className="flex items-center gap-2 text-gray-800">
          <Users className="h-5 w-5" />
          Gestion des Rôles
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 gap-4">
          <RoleCard
            role="user"
            isCurrentRole={user.role === 'user'}
            onRoleChange={onRoleChange}
            disabled={isLoading}
          />
          <RoleCard
            role="moderator"
            isCurrentRole={user.role === 'moderator'}
            onRoleChange={onRoleChange}
            disabled={isLoading}
          />
          <RoleCard
            role="admin"
            isCurrentRole={user.role === 'admin'}
            onRoleChange={onRoleChange}
            disabled={isLoading}
          />
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">
            ✨ Nouvelles fonctionnalités Phase 4
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Architecture modulaire et maintenable</li>
            <li>• Composants focalisés et réutilisables</li>
            <li>• Séparation claire des responsabilités</li>
            <li>• Code plus facile à tester et maintenir</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default RoleManagementSection;
