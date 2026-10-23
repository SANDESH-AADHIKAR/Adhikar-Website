'use client';
import { Language } from '@/lib/types';
import { LANGUAGE_OPTIONS } from '@/lib/i18n';
import { useLanguage } from './AppContext';

export interface LanguageSelectorProps {
  value?: Language;
  onChange?: (l: Language) => void;
  className?: string;
  variant?: 'dropdown' | 'toggle' | 'pills';
}

export default function LanguageSelector({
  value,
  onChange,
  className = '',
  variant = 'dropdown',
}: LanguageSelectorProps) {
  const globalContext = useLanguage();
  const currentLang = value ?? globalContext.language;

  const handleChange = (newLang: Language) => {
    if (onChange) {
      onChange(newLang);
    }
    if (globalContext.setLanguage) {
      globalContext.setLanguage(newLang);
    }
  };

  // One-click cycle toggle: English -> Hindi -> Marathi -> Hinglish -> English
  const handleCycleToggle = () => {
    const list = Object.values(Language);
    const currentIndex = list.indexOf(currentLang);
    const nextLang = list[(currentIndex + 1) % list.length];
    handleChange(nextLang);
  };

  if (variant === 'toggle') {
    const meta = LANGUAGE_OPTIONS[currentLang];
    return (
      <button
        type="button"
        onClick={handleCycleToggle}
        className={`language-toggle-cycle-btn ${className}`}
        aria-label={`Current language: ${meta?.name || currentLang}. Click to toggle language.`}
        title="Toggle language (English / हिन्दी / मराठी / Hinglish)"
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="language-selector-icon"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
        <span className="language-active-name">{meta?.nativeName || currentLang}</span>
        <span className="language-cycle-badge" aria-hidden="true">⇄</span>
      </button>
    );
  }

  if (variant === 'pills') {
    return (
      <div className={`language-pills-group ${className}`} role="group" aria-label="Language selection">
        {Object.values(Language).map((l) => {
          const meta = LANGUAGE_OPTIONS[l];
          const isActive = currentLang === l;
          return (
            <button
              key={l}
              type="button"
              className={`language-pill-btn ${isActive ? 'active' : ''}`}
              onClick={() => handleChange(l)}
              aria-pressed={isActive}
            >
              {meta ? meta.nativeName : l}
            </button>
          );
        })}
      </div>
    );
  }

  // Default: Dropdown with globe
  return (
    <div className={`language-selector-wrap ${className}`}>
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="language-selector-icon"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
      <select
        value={currentLang}
        onChange={(e) => handleChange(e.target.value as Language)}
        className="language-selector-select"
        aria-label="Select portal language"
      >
        {Object.values(Language).map((l) => {
          const meta = LANGUAGE_OPTIONS[l];
          const display = meta ? `${meta.nativeName}` : l;
          return (
            <option key={l} value={l}>
              {display}
            </option>
          );
        })}
      </select>
    </div>
  );
}
