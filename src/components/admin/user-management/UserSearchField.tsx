
import React, { useState, useEffect } from 'react';
import { Search, User, Mail, UserCheck, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

type UserRole = 'user' | 'admin' | 'moderator';

interface UserSearchResult {
  id: string;
  email: string;
  username?: string;
  role: UserRole;
  created_at: string;
  total_count: number;
}

interface UserSearchFieldProps {
  onUserSelect: (user: UserSearchResult) => void;
  selectedUser?: UserSearchResult;
}

const UserSearchField: React.FC<UserSearchFieldProps> = ({ onUserSelect, selectedUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const pageSize = 10;

  const { data: searchResults, isLoading, error, refetch } = useQuery({
    queryKey: ['user-search-paginated', searchTerm, currentPage],
    queryFn: async () => {
      if (searchTerm.length < 2 && searchTerm.length > 0) return [];
      
      try {
        const { data, error } = await supabase.rpc('search_users_paginated', {
          search_term: searchTerm || '',
          page_size: pageSize,
          page_offset: currentPage * pageSize
        });
        
        if (error) {
          console.error('Error searching users:', error);
          throw error;
        }
        
        return (data || []).map((user: any): UserSearchResult => ({
          id: user.id,
          email: user.email || 'Email non disponible',
          username: user.username,
          role: user.role as UserRole,
          created_at: user.created_at,
          total_count: user.total_count || 0
        }));
      } catch (error) {
        console.error('Search error:', error);
        throw error;
      }
    },
    enabled: searchTerm.length === 0 || searchTerm.length >= 2
  });

  const handleSearch = () => {
    setCurrentPage(0);
    setIsSearching(true);
    refetch();
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'moderator': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleDisplayName = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'Administrateur';
      case 'moderator': return 'Modérateur';
      case 'user': return 'Utilisateur';
      default: return role;
    }
  };

  const totalCount = searchResults?.[0]?.total_count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher par ID utilisateur, email ou nom d'utilisateur (min. 2 caractères)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
          />
        </div>
        <Button 
          onClick={handleSearch} 
          disabled={isLoading || (searchTerm.length > 0 && searchTerm.length < 2)}
        >
          {isLoading ? 'Recherche...' : 'Rechercher'}
        </Button>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">
                Erreur lors de la recherche. Veuillez réessayer.
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {searchResults && searchResults.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">
                Résultats de recherche: {searchResults.length} utilisateur(s) trouvé(s)
              </h4>
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">
                    Page {currentPage + 1} sur {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages - 1}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
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
                            <span className="text-xs text-gray-600">@{user.username}</span>
                          </div>
                        )}
                        <div className="text-xs text-gray-500 mt-1">
                          ID: {user.id}
                        </div>
                        <div className="text-xs text-gray-500">
                          Créé le: {new Date(user.created_at).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </div>
                    <Badge className={getRoleColor(user.role)}>
                      {getRoleDisplayName(user.role)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {searchTerm.length >= 2 && searchResults?.length === 0 && !isLoading && !error && (
        <Card>
          <CardContent className="p-4 text-center text-gray-500">
            Aucun utilisateur trouvé pour "{searchTerm}"
          </CardContent>
        </Card>
      )}

      {searchTerm.length > 0 && searchTerm.length < 2 && (
        <Card>
          <CardContent className="p-4 text-center text-orange-600">
            Veuillez saisir au moins 2 caractères pour rechercher
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserSearchField;
