
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search } from 'lucide-react';
import UserSearchField from './UserSearchField';

type UserRole = 'user' | 'admin' | 'moderator';

interface UserData {
  id: string;
  email: string;
  username?: string;
  role: UserRole;
  created_at: string;
  total_count: number;
}

interface UserSearchSectionProps {
  onUserSelect: (user: UserData) => void;
  selectedUser?: UserData;
}

const UserSearchSection: React.FC<UserSearchSectionProps> = ({
  onUserSelect,
  selectedUser
}) => {
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="bg-gray-50 rounded-t-lg">
        <CardTitle className="flex items-center gap-2 text-gray-800">
          <Search className="h-5 w-5" />
          Recherche d'Utilisateur Avancée
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <UserSearchField
          onUserSelect={onUserSelect}
          selectedUser={selectedUser}
        />
      </CardContent>
    </Card>
  );
};

export default UserSearchSection;
