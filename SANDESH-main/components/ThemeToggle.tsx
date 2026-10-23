'use client';
import { useTheme } from './AppContext';
import { SunIcon, MoonIcon } from './Icons';
import { useTranslation } from './AppContext';

export default function ThemeToggle({
  className = '',
  showLabel = false,
}: {
  className?: string;
  showLabel?: boolean;
}) {
  const { theme, toggleTheme, isDark } = useTheme();
  const { t } = useTranslation();

  const label = isDark ? t('nav.switchThemeLight') : t('nav.switchThemeDark');

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`theme-toggle-btn ${className}`}
      aria-label={label}
      title={label}
    >
      <span className="theme-toggle-icon">
        {isDark ? (
          <SunIcon size={18} className="theme-icon-sun" />
        ) : (
          <MoonIcon size={18} className="theme-icon-moon" />
        )}
      </span>
      {showLabel && <span className="theme-toggle-text">{label}</span>}
    </button>
  );
}
