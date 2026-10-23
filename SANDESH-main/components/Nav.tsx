'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MenuIcon, CloseIcon, ShieldCheckIcon, UserIcon, LogOutIcon, LogInIcon } from '@/components/Icons';
import { useTranslation, useAuth } from '@/components/AppContext';
import LanguageSelector from '@/components/LanguageSelector';
import ThemeToggle from '@/components/ThemeToggle';

export default function Nav() {
  const path = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useTranslation();
  const { user, signOut, openAuthModal } = useAuth();

  const links = [
    { href: '/', label: t('nav.home') },
    { href: '/schemes', label: t('nav.schemes') },
    { href: '/assistant', label: t('nav.assistant') },
    { href: '/guard', label: t('nav.guard') },
    { href: '/feedback', label: t('nav.feedback') },
    { href: '/history', label: t('nav.history') },
  ];

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [path]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const displayName =
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    'Citizen';

  return (
    <>
      <div className="national-ribbon" aria-hidden="true" />
      <header className="nav">
        <div className="nav-inner">
          <Link href="/" className="brand" aria-label="Adhikar Home">
            <img
              src="/logo.jpeg"
              alt="Adhikar Logo"
              width={34}
              height={34}
              className="brand-logo"
            />
            <div className="brand-details">
              <span className="brand-title">Adhikar</span>
              <span className="brand-sub">{t('nav.brandSub')}</span>
            </div>
          </Link>

          {/* Desktop links & controls */}
          <div className="desktop-nav-wrap desktop-only">
            <nav className="nav-links" aria-label="Main Navigation">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={path === l.href ? 'active' : ''}
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            <div className="nav-actions">
              <LanguageSelector variant="dropdown" />
              <ThemeToggle />

              {/* Supabase Auth Controls */}
              {user ? (
                <div className="nav-user-control">
                  <span className="nav-user-badge" title={user.email || 'Citizen'}>
                    <UserIcon size={14} />
                    <span className="nav-user-name">{displayName}</span>
                  </span>
                  <button
                    type="button"
                    className="nav-auth-btn sign-out-btn"
                    onClick={() => signOut()}
                    title={t('auth.signOutBtn') || 'Sign Out'}
                  >
                    <LogOutIcon size={14} />
                    <span>{t('auth.signOutBtn') || 'Sign Out'}</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="nav-auth-btn sign-in-btn"
                  onClick={() => openAuthModal('signin')}
                  title={t('auth.signInBtn') || 'Citizen Sign In'}
                >
                  <LogInIcon size={14} />
                  <span>{t('auth.tabSignIn') || 'Sign In'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Mobile controls */}
          <div className="mobile-header-controls mobile-only">
            <ThemeToggle />
            <button
              type="button"
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <CloseIcon size={22} /> : <MenuIcon size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown drawer */}
        {mobileMenuOpen && (
          <div className="mobile-drawer" role="dialog" aria-modal="true">
            <div className="mobile-drawer-top-row">
              <span className="mobile-drawer-label">{t('nav.selectLanguage')}:</span>
              <LanguageSelector className="mobile-lang-selector" />
            </div>

            {/* Mobile Auth Status */}
            <div className="mobile-auth-section">
              {user ? (
                <div className="mobile-user-box">
                  <div className="mobile-user-info">
                    <UserIcon size={16} />
                    <div>
                      <div className="mobile-user-name">{displayName}</div>
                      <div className="mobile-user-email">{user.email}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary mobile-auth-action-btn"
                    onClick={() => {
                      signOut();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <LogOutIcon size={14} />
                    <span>{t('auth.signOutBtn') || 'Sign Out'}</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="btn btn-secondary mobile-auth-action-btn"
                  onClick={() => {
                    openAuthModal('signin');
                    setMobileMenuOpen(false);
                  }}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <LogInIcon size={16} />
                  <span>{t('auth.signInTitle') || 'Sign In / Register'}</span>
                </button>
              )}
            </div>

            <div className="mobile-drawer-links">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`mobile-nav-link ${path === l.href ? 'active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span>{l.label}</span>
                  {path === l.href && <span className="active-dot" />}
                </Link>
              ))}
            </div>

            <div className="mobile-drawer-footer">
              <Link
                href="/guard"
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                <ShieldCheckIcon size={16} />
                <span>{t('home.ctaGuard')}</span>
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
