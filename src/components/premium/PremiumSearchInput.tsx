
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PremiumSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const PremiumSearchInput: React.FC<PremiumSearchInputProps> = ({ 
  value, 
  onChange, 
  placeholder = "Rechercher dans les annonces premium..." 
}) => {
  const handleClear = () => {
    onChange('');
  };

  return (
    <div className="relative">
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 pr-10"
      />
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
      {value && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          onClick={handleClear}
        >
          <X size={14} />
        </Button>
      )}
    </div>
  );
};

export default PremiumSearchInput;
