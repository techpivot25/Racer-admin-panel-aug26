import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface LanguageSelectorProps {
  currentLang: 'EN' | 'FR' | 'ES';
  onChangeLang: (lang: 'EN' | 'FR' | 'ES') => void;
  isDark: boolean;
}

export default function LanguageSelector({ currentLang, onChangeLang, isDark }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const languages = [
    { code: 'EN' as const, flag: '🇺🇸', label: 'English' },
    { code: 'FR' as const, flag: '🇫🇷', label: 'Français' },
    { code: 'ES' as const, flag: '🇪🇸', label: 'Español' },
  ];

  const activeLangObj = languages.find(l => l.code === currentLang) || languages[0];

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      {/* Dropdown Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        className={`flex items-center gap-1.5 p-1.5 rounded-full border transition-all cursor-pointer ${
          isDark
            ? 'bg-[#1A1D23] border-[#2D333D] hover:bg-gray-800 text-white'
            : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700 shadow-3xs'
        }`}
        aria-haspopup="true"
        aria-expanded={isOpen}
        title={activeLangObj.label}
      >
        {/* Large prominent flag icon */}
        <span className="text-xl leading-none select-none filter drop-shadow-xs">
          {activeLangObj.flag}
        </span>
        {/* Micro ChevronDown indicator for explicit dropdown feedback */}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 opacity-80 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Floating Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute right-0 mt-2 w-16 origin-top-right rounded-xl border p-1 shadow-lg focus:outline-hidden z-50 transition-all duration-100 ${
            isDark
              ? 'bg-[#161920] border-[#2D333D] text-white shadow-black/40'
              : 'bg-white border-slate-100 text-slate-800 shadow-slate-200/50'
          }`}
          role="menu"
          aria-orientation="vertical"
        >
          <div className="flex flex-col gap-1">
            {languages.map((lang) => {
              const isSelected = lang.code === currentLang;
              return (
                <button
                  key={lang.code}
                  onClick={() => {
                    onChangeLang(lang.code);
                    setIsOpen(false);
                  }}
                  className={`w-full h-11 rounded-lg flex items-center justify-center transition-all cursor-pointer text-2xl hover:scale-105 active:scale-95 ${
                    isSelected
                      ? (isDark ? 'bg-[rgb(14,145,145)] text-white' : 'bg-slate-100 text-black')
                      : (isDark ? 'hover:bg-[#1A1D23]' : 'hover:bg-slate-50')
                  }`}
                  role="menuitem"
                  title={lang.label}
                >
                  <span className="filter drop-shadow-xs select-none">{lang.flag}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
