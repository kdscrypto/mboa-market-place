
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Type, Zap, Volume2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AccessibilityFeaturesProps {
  onTogglePasswordVisibility?: () => void;
  passwordVisible?: boolean;
  showKeyboardShortcuts?: boolean;
}

const AccessibilityFeatures: React.FC<AccessibilityFeaturesProps> = ({
  onTogglePasswordVisibility,
  passwordVisible = false,
  showKeyboardShortcuts = true
}) => {
  const [highContrast, setHighContrast] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  useEffect(() => {
    // Apply high contrast mode
    if (highContrast) {
      document.documentElement.classList.add('accessibility-high-contrast');
    } else {
      document.documentElement.classList.remove('accessibility-high-contrast');
    }

    // Apply large text mode
    if (largeText) {
      document.documentElement.classList.add('accessibility-large-text');
    } else {
      document.documentElement.classList.remove('accessibility-large-text');
    }

    return () => {
      document.documentElement.classList.remove('accessibility-high-contrast', 'accessibility-large-text');
    };
  }, [highContrast, largeText]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Shift + V to toggle password visibility
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'V') {
        e.preventDefault();
        onTogglePasswordVisibility?.();
      }
      
      // Ctrl/Cmd + Shift + H to toggle high contrast
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'H') {
        e.preventDefault();
        setHighContrast(prev => !prev);
      }
      
      // Ctrl/Cmd + Shift + L to toggle large text
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'L') {
        e.preventDefault();
        setLargeText(prev => !prev);
      }
      
      // Ctrl/Cmd + Shift + ? to show shortcuts
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === '?') {
        e.preventDefault();
        setShowShortcuts(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [onTogglePasswordVisibility]);

  return (
    <div className="space-y-3">
      {/* Quick access buttons */}
      <div className="flex flex-wrap gap-2">
        {onTogglePasswordVisibility && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onTogglePasswordVisibility}
            className="text-xs"
            title="Afficher/masquer le mot de passe (Ctrl+Shift+V)"
          >
            {passwordVisible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            <span className="sr-only">
              {passwordVisible ? "Masquer" : "Afficher"} le mot de passe
            </span>
          </Button>
        )}
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setHighContrast(!highContrast)}
          className={`text-xs ${highContrast ? 'bg-gray-900 text-white' : ''}`}
          title="Contraste élevé (Ctrl+Shift+H)"
        >
          <Zap className="h-3 w-3" />
          <span className="sr-only">Contraste élevé</span>
        </Button>
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setLargeText(!largeText)}
          className={`text-xs ${largeText ? 'text-lg' : ''}`}
          title="Texte large (Ctrl+Shift+L)"
        >
          <Type className="h-3 w-3" />
          <span className="sr-only">Texte large</span>
        </Button>
        
        {showKeyboardShortcuts && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowShortcuts(!showShortcuts)}
            className="text-xs"
            title="Raccourcis clavier (Ctrl+Shift+?)"
          >
            ?
            <span className="sr-only">Aide raccourcis clavier</span>
          </Button>
        )}
      </div>

      {/* Keyboard shortcuts help */}
      {showShortcuts && (
        <Alert className="bg-blue-50 border-blue-200">
          <Volume2 className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <div className="space-y-1 text-sm">
              <p className="font-medium">Raccourcis clavier :</p>
              <ul className="space-y-1 text-xs">
                <li>• <kbd className="px-1 bg-blue-100 rounded">Ctrl+Shift+V</kbd> : Afficher/masquer mot de passe</li>
                <li>• <kbd className="px-1 bg-blue-100 rounded">Ctrl+Shift+H</kbd> : Contraste élevé</li>
                <li>• <kbd className="px-1 bg-blue-100 rounded">Ctrl+Shift+L</kbd> : Texte large</li>
                <li>• <kbd className="px-1 bg-blue-100 rounded">Tab</kbd> : Navigation au clavier</li>
                <li>• <kbd className="px-1 bg-blue-100 rounded">Entrée</kbd> : Soumettre le formulaire</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Screen reader announcements */}
      <div 
        className="sr-only" 
        role="status" 
        aria-live="polite" 
        aria-atomic="true"
      >
        {highContrast && "Mode contraste élevé activé"}
        {largeText && "Mode texte large activé"}
        {passwordVisible && "Mot de passe visible"}
      </div>
    </div>
  );
};

export default AccessibilityFeatures;
