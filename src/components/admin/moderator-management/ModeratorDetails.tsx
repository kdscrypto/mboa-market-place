
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ModeratorDetailsProps {
  selectedModerator: string;
  moderatorDetails: {
    profile: {
      role: string;
      created_at: string;
    } | null;
    recentActions: any[];
  } | null;
  onClose: () => void;
}

const ModeratorDetails = ({ 
  selectedModerator, 
  moderatorDetails, 
  onClose 
}: ModeratorDetailsProps) => {
  if (!selectedModerator || !moderatorDetails) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Détails du Modérateur</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Informations</h4>
            <div className="text-sm space-y-1">
              <p><span className="font-medium">ID:</span> {selectedModerator.slice(0, 8)}...</p>
              <p><span className="font-medium">Rôle:</span> {moderatorDetails.profile?.role}</p>
              <p><span className="font-medium">Actif depuis:</span> {new Date(moderatorDetails.profile?.created_at || '').toLocaleDateString()}</p>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Activité Récente</h4>
            <div className="text-sm space-y-1">
              <p>Actions des 30 derniers jours: {moderatorDetails.recentActions.length}</p>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={onClose}
            className="w-full"
          >
            Fermer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ModeratorDetails;
