'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MenuIcon, CloseIcon, ShieldCheckIcon } from '@/components/Icons';

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/schemes', label: 'Directory' },
  { href: '/assistant', label: 'Assistant' },
  { href: '/guard', label: 'SchemeGuard' },
  { href: '/feedback', label: 'Feedback' },
  { href: '/history', label: 'Activity' },
];

export default function Nav() {
  const path = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
              <span className="brand-sub">Government Schemes Portal</span>
            </div>
          </Link>

          {/* Desktop links */}
          <nav className="nav-links desktop-only" aria-label="Main Navigation">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={path === l.href ? 'active' : ''}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Mobile hamburger button */}
          <button
            type="button"
            className="mobile-menu-btn mobile-only"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <CloseIcon size={22} /> : <MenuIcon size={22} />}
          </button>
        </div>

        {/* Mobile dropdown drawer */}
        {mobileMenuOpen && (
          <div className="mobile-drawer" role="dialog" aria-modal="true">
            <div className="mobile-drawer-links">
              {LINKS.map((l) => (
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
                <span>Verify Scheme (SchemeGuard)</span>
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
