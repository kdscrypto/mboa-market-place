
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, User, Shield, UserMinus } from 'lucide-react';

// Define the allowed role types
type UserRole = 'user' | 'admin' | 'moderator';

interface UserData {
  id: string;
  email: string;
  username?: string;
  role: UserRole;
}

interface RoleChangeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  user: UserData | null;
  newRole: UserRole;
  isLoading: boolean;
}

const RoleChangeDialog: React.FC<RoleChangeDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  user,
  newRole,
  isLoading
}) => {
  if (!user) return null;

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin': return <Shield className="h-4 w-4 text-red-600" />;
      case 'moderator': return <User className="h-4 w-4 text-blue-600" />;
      case 'user': return <UserMinus className="h-4 w-4 text-gray-600" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'moderator': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionText = () => {
    if (newRole === 'user') {
      return user.role === 'admin' ? 'révoquer les droits d\'administrateur' : 'révoquer les droits de modérateur';
    }
    return `accorder les droits de ${newRole === 'admin' ? 'administrateur' : 'modérateur'}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Confirmation de changement de rôle
          </DialogTitle>
          <DialogDescription>
            Cette action modifiera les permissions de l'utilisateur de manière permanente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Utilisateur sélectionné:</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{user.email}</span>
              </div>
              {user.username && (
                <div className="text-sm text-gray-600">
                  Nom d'utilisateur: {user.username}
                </div>
              )}
              <div className="text-xs text-gray-500">
                ID: {user.id}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-sm">Rôle actuel:</span>
              <Badge className={getRoleColor(user.role)}>
                {getRoleIcon(user.role)}
                {user.role}
              </Badge>
            </div>
            <div className="text-2xl text-gray-400">→</div>
            <div className="flex items-center gap-2">
              <span className="text-sm">Nouveau rôle:</span>
              <Badge className={getRoleColor(newRole)}>
                {getRoleIcon(newRole)}
                {newRole}
              </Badge>
            </div>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              Vous êtes sur le point de <strong>{getActionText()}</strong> pour cet utilisateur.
            </p>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Annuler
          </Button>
          <Button onClick={onConfirm} disabled={isLoading}>
            {isLoading ? 'Traitement...' : 'Confirmer le changement'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RoleChangeDialog;
