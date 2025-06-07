
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, UserMinus } from 'lucide-react';

interface Moderator {
  id: string;
  role: string;
  created_at: string;
}

interface ModeratorsListProps {
  moderators: Moderator[];
  onViewModerator: (moderatorId: string) => void;
  onDemoteModerator: (moderatorId: string) => void;
  isDemoting: boolean;
}

const ModeratorsList = ({ 
  moderators, 
  onViewModerator, 
  onDemoteModerator,
  isDemoting 
}: ModeratorsListProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Équipe de Modération</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {moderators?.map((moderator) => (
            <div key={moderator.id} className="flex items-center justify-between p-3 border rounded">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-mboa-orange rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {moderator.id.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium">Modérateur {moderator.id.slice(0, 8)}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant={moderator.role === 'admin' ? 'default' : 'secondary'}>
                      {moderator.role}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      Depuis {new Date(moderator.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onViewModerator(moderator.id)}
                >
                  <Eye className="h-3 w-3" />
                </Button>
                {moderator.role === 'moderator' && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onDemoteModerator(moderator.id)}
                    disabled={isDemoting}
                  >
                    <UserMinus className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ModeratorsList;
