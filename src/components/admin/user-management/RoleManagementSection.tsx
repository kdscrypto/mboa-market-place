
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
      </CardContent>
    </Card>
  );
};

export default RoleManagementSection;
