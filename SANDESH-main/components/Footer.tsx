'use client';
import Link from 'next/link';
import { useTranslation } from '@/components/AppContext';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-links">
          <a href="https://www.india.gov.in" target="_blank" rel="noreferrer">
            {t('footer.nationalPortal')}
          </a>
          <a href="https://www.mygov.in" target="_blank" rel="noreferrer">
            {t('footer.myGov')}
          </a>
          <a href="https://digitalindia.gov.in" target="_blank" rel="noreferrer">
            {t('footer.digitalIndia')}
          </a>
          <Link href="/schemes">{t('footer.schemesDirectory')}</Link>
          <Link href="/guard">{t('footer.schemeGuard')}</Link>
          <Link href="/assistant">{t('footer.citizenAssistant')}</Link>
          <Link href="/feedback">{t('footer.feedback')}</Link>
        </div>
        <p className="footer-copy">{t('footer.copyDisclaimer')}</p>
        <div className="footer-bottom">
          © {new Date().getFullYear()} {t('footer.copyright')}
        </div>
      </div>
    </footer>
  );
}
