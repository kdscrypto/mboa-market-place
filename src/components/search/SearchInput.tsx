
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

const SearchInput: React.FC<SearchInputProps> = ({ value, onChange }) => {
  return (
    <div className="relative">
      <Input
        type="text"
        placeholder="Rechercher une annonce..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 pr-4 mboa-input w-full"
      />
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
    </div>
  );
};

export default SearchInput;
