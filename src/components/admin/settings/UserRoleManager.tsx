
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import EnhancedUserRoleManager from '../user-management/EnhancedUserRoleManager';

const UserRoleManager = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Gestion des Rôles d'Utilisateur
        </CardTitle>
      </CardHeader>
      <CardContent>
        <EnhancedUserRoleManager />
      </CardContent>
    </Card>
  );
};

export default UserRoleManager;
