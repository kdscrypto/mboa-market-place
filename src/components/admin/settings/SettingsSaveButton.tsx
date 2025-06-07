
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Save } from 'lucide-react';

interface SettingsSaveButtonProps {
  onSave: () => void;
  isSaving: boolean;
}

const SettingsSaveButton = ({ onSave, isSaving }: SettingsSaveButtonProps) => {
  return (
    <div className="flex justify-end">
      <Button 
        onClick={onSave}
        disabled={isSaving}
        className="bg-mboa-orange hover:bg-mboa-orange/90"
      >
        {isSaving ? (
          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Save className="mr-2 h-4 w-4" />
        )}
        Sauvegarder les Paramètres
      </Button>
    </div>
  );
};

export default SettingsSaveButton;
