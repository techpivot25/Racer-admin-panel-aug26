import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export interface CustomSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface CustomSelectProps {
  value: string;
  onChange?: (val: string) => void;
  options: CustomSelectOption[];
  className?: string;
  isDark?: boolean;
  disabled?: boolean;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  className = '',
  isDark = false,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value) || options[0];

  const handleSelect = (val: string) => {
    if (disabled) return;
    if (onChange) onChange(val);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative w-full text-xs ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg border outline-none transition-all cursor-pointer ${
          disabled ? 'opacity-60 cursor-not-allowed' : ''
        } ${
          isDark 
            ? 'bg-[#0f172a] border-[rgb(30, 41, 59)] text-white focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20' 
            : 'bg-white border-slate-200 text-slate-800 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20'
        }`}
      >
        <span className="truncate">{selectedOption ? selectedOption.label : 'Select...'}</span>
        <ChevronDown className={`w-3.5 h-3.5 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div 
          className={`absolute z-50 left-0 right-0 mt-1 max-h-60 overflow-y-auto rounded-lg border shadow-lg ${
            isDark 
              ? 'bg-[#0f172a] border-[rgb(30, 41, 59)] text-white' 
              : 'bg-white border-slate-200 text-slate-800'
          }`}
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <div
                key={opt.value}
                onClick={() => !opt.disabled && handleSelect(opt.value)}
                className={`px-3 py-2 cursor-pointer transition-colors ${
                  opt.disabled 
                    ? 'opacity-40 cursor-not-allowed' 
                    : isSelected
                      ? 'bg-purple-600 text-white font-bold'
                      : 'hover:bg-purple-600 hover:text-white'
                }`}
              >
                {opt.label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
