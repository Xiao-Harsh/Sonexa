import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  initialValue?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, placeholder = 'Search tracks, artists...', initialValue = '' }) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    const handler = setTimeout(() => {
      onSearch(value.trim());
    }, 450);

    return () => {
      clearTimeout(handler);
    };
  }, [value, onSearch]);

  return (
    <div className="relative w-full max-w-lg">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-11 pr-10 py-3 bg-neutral-900/60 border border-neutral-800 focus:border-indigo-500 rounded-full text-sm text-neutral-100 placeholder-neutral-600 outline-none transition-all duration-300 shadow-md focus:ring-1 focus:ring-indigo-500"
      />
      {value && (
        <button
          onClick={() => setValue('')}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-neutral-800 rounded-full text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
