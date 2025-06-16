
import React from 'react';
import UserRoleManagerHeader from './UserRoleManagerHeader';
import UserSearchSection from './UserSearchSection';
import UserDetailsSection from './UserDetailsSection';
import RoleManagementSection from './RoleManagementSection';
import RoleChangeDialog from './RoleChangeDialog';
import RoleStatisticsCard from './RoleStatisticsCard';
import { useUserRoleManager } from './hooks/useUserRoleManager';

const EnhancedUserRoleManager: React.FC = () => {
  const {
    selectedUser,
    setSelectedUser,
    dialogOpen,
    setDialogOpen,
    pendingRole,
    handleRoleChange,
    confirmRoleChange,
    isLoading
  } = useUserRoleManager();

  return (
    <div className="space-y-8">
      {/* En-tête avec statistiques Phase 5 */}
      <UserRoleManagerHeader />

      {/* Statistiques des rôles - Nouvelle fonctionnalité Phase 5 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Section de recherche */}
          <UserSearchSection
            onUserSelect={setSelectedUser}
            selectedUser={selectedUser}
          />
        </div>
        <div className="lg:col-span-1">
          <RoleStatisticsCard />
        </div>
      </div>

      {/* Section utilisateur sélectionné */}
      {selectedUser && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Informations utilisateur */}
          <UserDetailsSection user={selectedUser} />

          {/* Gestion des rôles */}
          <RoleManagementSection
            user={selectedUser}
            onRoleChange={handleRoleChange}
            isLoading={isLoading}
          />
        </div>
      )}

      {/* Dialog de confirmation */}
      <RoleChangeDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={confirmRoleChange}
        user={selectedUser}
        newRole={pendingRole}
        isLoading={isLoading}
      />
    </div>
  );
};

export default EnhancedUserRoleManager;
