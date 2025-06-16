
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Mail, User, Calendar, Hash } from 'lucide-react';

type UserRole = 'user' | 'admin' | 'moderator';

interface UserData {
  id: string;
  email: string;
  username?: string;
  role: UserRole;
  created_at: string;
}

interface UserInfoCardProps {
  user: UserData;
}

const UserInfoCard: React.FC<UserInfoCardProps> = ({ user }) => {
  const getRoleConfig = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return {
          color: 'bg-red-100 text-red-800',
          label: 'Administrateur'
        };
      case 'moderator':
        return {
          color: 'bg-blue-100 text-blue-800',
          label: 'Modérateur'
        };
      case 'user':
        return {
          color: 'bg-gray-100 text-gray-800',
          label: 'Utilisateur'
        };
    }
  };

  const roleConfig = getRoleConfig(user.role);
  const initials = user.username 
    ? user.username.substring(0, 2).toUpperCase()
    : user.email.substring(0, 2).toUpperCase();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 pb-4">
        <CardTitle className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Profil Utilisateur
              </h3>
              <Badge className={roleConfig.color}>
                {roleConfig.label}
              </Badge>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6 space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Mail className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-700">Email</p>
              <p className="text-sm text-gray-900">{user.email}</p>
            </div>
          </div>

          {user.username && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <User className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-700">Nom d'utilisateur</p>
                <p className="text-sm text-gray-900">@{user.username}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Calendar className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-700">Membre depuis</p>
              <p className="text-sm text-gray-900">{formatDate(user.created_at)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Hash className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-700">ID Utilisateur</p>
              <p className="text-xs text-gray-600 font-mono">{user.id}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserInfoCard;
