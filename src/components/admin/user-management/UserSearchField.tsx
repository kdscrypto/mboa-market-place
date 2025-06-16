
import React, { useState, useEffect } from 'react';
import { Search, User, Mail, UserCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface UserSearchResult {
  id: string;
  email: string;
  username?: string;
  role: string;
  created_at: string;
}

interface UserSearchFieldProps {
  onUserSelect: (user: UserSearchResult) => void;
  selectedUser?: UserSearchResult;
}

const UserSearchField: React.FC<UserSearchFieldProps> = ({ onUserSelect, selectedUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['user-search', searchTerm],
    queryFn: async () => {
      if (searchTerm.length < 3) return [];
      
      // Recherche par ID UUID exact
      if (searchTerm.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        const { data: userProfile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', searchTerm)
          .single();
        
        if (userProfile) {
          const { data: authUser } = await supabase.auth.admin.getUserById(userProfile.id);
          return [{
            id: userProfile.id,
            email: authUser.user?.email || 'Email non disponible',
            username: authUser.user?.user_metadata?.username,
            role: userProfile.role,
            created_at: userProfile.created_at
          }];
        }
        return [];
      }
      
      // Recherche par email dans auth.users (simulation - en production, vous devriez utiliser une fonction RPC)
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('*')
        .limit(10);
      
      // Note: En production, vous devriez créer une fonction RPC pour rechercher dans auth.users
      return profiles?.map(profile => ({
        id: profile.id,
        email: 'recherche@example.com', // Placeholder
        username: 'utilisateur',
        role: profile.role,
        created_at: profile.created_at
      })) || [];
    },
    enabled: searchTerm.length >= 3
  });

  const handleSearch = () => {
    setIsSearching(true);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'moderator': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher par ID utilisateur, email ou nom d'utilisateur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch} disabled={isLoading || searchTerm.length < 3}>
          {isLoading ? 'Recherche...' : 'Rechercher'}
        </Button>
      </div>

      {searchResults && searchResults.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium mb-3">Résultats de recherche:</h4>
            <div className="space-y-2">
              {searchResults.map((user) => (
                <div
                  key={user.id}
                  className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedUser?.id === user.id ? 'bg-blue-50 border-blue-300' : ''
                  }`}
                  onClick={() => onUserSelect(user)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-gray-500" />
                      <div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3 text-gray-400" />
                          <span className="text-sm font-medium">{user.email}</span>
                        </div>
                        {user.username && (
                          <div className="flex items-center gap-2 mt-1">
                            <UserCheck className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-600">{user.username}</span>
                          </div>
                        )}
                        <div className="text-xs text-gray-500 mt-1">
                          ID: {user.id}
                        </div>
                      </div>
                    </div>
                    <Badge className={getRoleColor(user.role)}>
                      {user.role}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {searchTerm.length >= 3 && searchResults?.length === 0 && !isLoading && (
        <Card>
          <CardContent className="p-4 text-center text-gray-500">
            Aucun utilisateur trouvé pour "{searchTerm}"
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserSearchField;
