'use client';
import Link from 'next/link';
import { SearchIcon, ShieldCheckIcon, ChatIcon, ArrowRightIcon, MicIcon } from '@/components/Icons';
import { useTranslation } from '@/components/AppContext';
import LanguageSelector from '@/components/LanguageSelector';

export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-badge-container">
          <span className="badge badge-primary">
            {t('home.badge')}
          </span>
        </div>

        <h1 className="hero-heading">
          {t('home.heading')}
        </h1>

        <p className="hero-description">
          {t('home.description')}
        </p>

        {/* Quick Language Toggle Bar for Website UI */}
        <div className="hero-language-toggle-wrap">
          <span className="hero-lang-hint">🌐 {t('nav.selectLanguage')}:</span>
          <LanguageSelector variant="pills" />
        </div>

        {/* Hero Action CTA Group with Highlighted Voice Button */}
        <div className="hero-cta-group">
          {/* Highlighted Voice Assistant Button */}
          <Link
            className="btn btn-voice-hero"
            href="/assistant?voice=auto"
            title="Start voice conversation with Sarkari Sahayak (English)"
          >
            <span className="voice-mic-icon-pulse">
              <MicIcon size={18} />
            </span>
            <span className="voice-btn-text">
              {t('voice.heroVoiceBtn') || 'Voice Assistant'}
            </span>
            <span className="voice-lang-badge">English</span>
          </Link>

          <Link className="btn btn-primary" href="/schemes">
            <SearchIcon size={16} />
            <span>{t('home.ctaSearch')}</span>
          </Link>

          <Link className="btn btn-secondary" href="/guard">
            <ShieldCheckIcon size={16} />
            <span>{t('home.ctaGuard')}</span>
          </Link>

          <Link className="btn btn-tertiary" href="/assistant">
            <ChatIcon size={16} />
            <span>{t('home.ctaAssistant')}</span>
          </Link>
        </div>
      </section>

      {/* Voice Assistant Interactive Highlight Banner */}
      <section className="voice-feature-banner">
        <div className="voice-banner-inner">
          <div className="voice-banner-left">
            <div className="voice-pulse-circle">
              <MicIcon size={24} />
            </div>
            <div className="voice-banner-copy">
              <h3>{t('voice.heroVoiceBtn') || 'Voice Assistant'} & Audio Guidance</h3>
              <p>
                Speak your query naturally. Adhikar listens to your question and speaks the verified scheme eligibility and details aloud in English.
              </p>
            </div>
          </div>
          <Link href="/assistant?voice=auto" className="btn btn-voice-action">
            <MicIcon size={16} />
            <span>Tap to Speak Now</span>
          </Link>
        </div>
      </section>

      {/* Primary Feature Pillars */}
      <section className="pillars-grid">
        <div className="pillar-card">
          <div className="pillar-icon-box">
            <SearchIcon size={22} />
          </div>
          <h3>{t('home.pillarDirectoryTitle')}</h3>
          <p>{t('home.pillarDirectoryDesc')}</p>
          <Link href="/schemes" className="pillar-action-link">
            <span>{t('home.pillarDirectoryAction')}</span>
            <ArrowRightIcon size={14} />
          </Link>
        </div>

        <div className="pillar-card">
          <div className="pillar-icon-box">
            <ShieldCheckIcon size={22} />
          </div>
          <h3>{t('home.pillarGuardTitle')}</h3>
          <p>{t('home.pillarGuardDesc')}</p>
          <Link href="/guard" className="pillar-action-link">
            <span>{t('home.pillarGuardAction')}</span>
            <ArrowRightIcon size={14} />
          </Link>
        </div>

        <div className="pillar-card">
          <div className="pillar-icon-box">
            <ChatIcon size={22} />
          </div>
          <h3>{t('home.pillarAssistantTitle')}</h3>
          <p>{t('home.pillarAssistantDesc')}</p>
          <Link href="/assistant" className="pillar-action-link">
            <span>{t('home.pillarAssistantAction')}</span>
            <ArrowRightIcon size={14} />
          </Link>
        </div>
      </section>

      {/* Welfare Focus Areas */}
      <section className="categories-overview-section">
        <div className="section-header">
          <h2>{t('home.areasHeading')}</h2>
          <p>{t('home.areasSub')}</p>
        </div>

        <div className="category-tags-grid">
          <Link href="/schemes?cat=Agriculture" className="category-tag-card">
            <h4>{t('home.catAgriTitle')}</h4>
            <p>{t('home.catAgriDesc')}</p>
          </Link>
          <Link href="/schemes?cat=Health" className="category-tag-card">
            <h4>{t('home.catHealthTitle')}</h4>
            <p>{t('home.catHealthDesc')}</p>
          </Link>
          <Link href="/schemes?cat=Education" className="category-tag-card">
            <h4>{t('home.catEduTitle')}</h4>
            <p>{t('home.catEduDesc')}</p>
          </Link>
          <Link href="/schemes?cat=Finance" className="category-tag-card">
            <h4>{t('home.catFinanceTitle')}</h4>
            <p>{t('home.catFinanceDesc')}</p>
          </Link>
          <Link href="/schemes?cat=Housing" className="category-tag-card">
            <h4>{t('home.catHousingTitle')}</h4>
            <p>{t('home.catHousingDesc')}</p>
          </Link>
          <Link href="/schemes?cat=Social" className="category-tag-card">
            <h4>{t('home.catSocialTitle')}</h4>
            <p>{t('home.catSocialDesc')}</p>
          </Link>
        </div>
      </section>

      {/* Why Adhikar Trust & Safety */}
      <section className="why-section">
        <div className="section-header" style={{ marginBottom: 12 }}>
          <h2>{t('home.whyHeading')}</h2>
          <p>{t('home.whySub')}</p>
        </div>

        <div className="why-grid">
          <div className="why-card">
            <h4>🏛️ {t('home.feat1Title')}</h4>
            <p>{t('home.feat1Desc')}</p>
          </div>
          <div className="why-card">
            <h4>🛡️ {t('home.feat2Title')}</h4>
            <p>{t('home.feat2Desc')}</p>
          </div>
          <div className="why-card">
            <h4>🌐 {t('home.feat3Title')}</h4>
            <p>{t('home.feat3Desc')}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
