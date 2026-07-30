import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';

export interface TypeaheadOption {
  value: string;
  label: string;
  subLabel?: string;
}

interface TypeaheadSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: TypeaheadOption[];
  placeholder?: string;
  isDark?: boolean;
  label?: string;
}

export const TypeaheadSelect: React.FC<TypeaheadSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Type to search...',
  isDark = false,
  label
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    if (selectedOption) {
      setQuery(selectedOption.label);
    } else {
      setQuery('');
    }
  }, [value, selectedOption]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        if (selectedOption) {
          setQuery(selectedOption.label);
        } else {
          setQuery('');
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedOption]);

  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(query.toLowerCase()) ||
    (opt.subLabel && opt.subLabel.toLowerCase().includes(query.toLowerCase()))
  );

  const handleSelect = (option: TypeaheadOption) => {
    onChange(option.value);
    setQuery(option.label);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {label && (
        <label className="block text-xs font-semibold text-slate-700 dark:text-gray-200 mb-1">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        <Search className={`absolute left-3 w-3.5 h-3.5 ${isDark ? 'text-slate-400' : 'text-slate-400'}`} />
        <input
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          placeholder={placeholder}
          className={`w-full pl-9 pr-8 py-2 text-xs rounded-lg border outline-hidden transition-all ${
            isDark
              ? 'bg-[#020617] border-[rgb(30, 41, 59)] text-white focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 placeholder-slate-500'
              : 'bg-white border-slate-300 text-slate-900 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 placeholder-slate-400'
          }`}
        />
        <ChevronDown
          className={`absolute right-3 w-3.5 h-3.5 text-slate-400 pointer-events-none transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </div>

      {isOpen && (
        <div
          className={`absolute z-50 left-0 right-0 mt-1 max-h-56 overflow-y-auto rounded-lg border shadow-xl ${
            isDark ? 'bg-[#0f172a] border-[rgb(30, 41, 59)] text-white' : 'bg-white border-slate-200 text-slate-800'
          }`}
        >
          {filteredOptions.length === 0 ? (
            <div className="p-3 text-center text-xs text-slate-400">
              No matching products found
            </div>
          ) : (
            filteredOptions.map(opt => {
              const isSelected = opt.value === value;
              return (
                <div
                  key={opt.value}
                  onClick={() => handleSelect(opt)}
                  className={`px-3 py-2 text-xs flex items-center justify-between cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-purple-600 text-white font-bold'
                      : isDark
                      ? 'hover:bg-slate-800'
                      : 'hover:bg-slate-100'
                  }`}
                >
                  <div>
                    <div className="font-semibold">{opt.label}</div>
                    {opt.subLabel && (
                      <div className={`text-[10px] ${isSelected ? 'text-teal-100' : 'text-slate-400'}`}>
                        {opt.subLabel}
                      </div>
                    )}
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 ml-2 shrink-0" />}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
