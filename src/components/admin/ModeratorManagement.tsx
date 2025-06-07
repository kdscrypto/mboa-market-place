
import React from 'react';
import { useModeratorManagement } from '@/hooks/useModeratorManagement';
import ModeratorStatsCards from './moderator-management/ModeratorStatsCards';
import ModeratorsList from './moderator-management/ModeratorsList';
import ModeratorDetails from './moderator-management/ModeratorDetails';
import ModeratorInfoAlert from './moderator-management/ModeratorInfoAlert';

const ModeratorManagement = () => {
  const {
    moderators,
    moderatorDetails,
    selectedModerator,
    setSelectedModerator,
    demoteMutation,
    getActivityStats,
    isLoading
  } = useModeratorManagement();

  const stats = getActivityStats();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const handleViewModerator = (moderatorId: string) => {
    setSelectedModerator(moderatorId);
  };

  const handleDemoteModerator = (moderatorId: string) => {
    demoteMutation.mutate(moderatorId);
  };

  const handleCloseDetails = () => {
    setSelectedModerator(null);
  };

  return (
    <div className="space-y-6">
      {/* Statistiques de modération */}
      <ModeratorStatsCards
        moderatorCount={moderators?.length || 0}
        adminCount={moderators?.filter(m => m.role === 'admin').length || 0}
        approvedCount={stats.approved}
        rejectedCount={stats.rejected}
      />

      {/* Liste des modérateurs et détails */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ModeratorsList
          moderators={moderators || []}
          onViewModerator={handleViewModerator}
          onDemoteModerator={handleDemoteModerator}
          isDemoting={demoteMutation.isPending}
        />

        <ModeratorDetails
          selectedModerator={selectedModerator}
          moderatorDetails={moderatorDetails}
          onClose={handleCloseDetails}
        />
      </div>

      {/* Alerte d'information */}
      <ModeratorInfoAlert />
    </div>
  );
};

export default ModeratorManagement;
