import Link from 'next/link';
import { SearchIcon, ShieldCheckIcon, ChatIcon, ArrowRightIcon, GovtBuildingIcon } from '@/components/Icons';

export default function Home() {
  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-badge-container">
          <span className="badge badge-primary">
            Citizen Information Platform
          </span>
        </div>

        <h1 className="hero-heading">
          Indian Government Schemes & Welfare Verification
        </h1>

        <p className="hero-description">
          Adhikar helps citizens find eligible central and state government schemes,
          understand documentation requirements, and check the legitimacy of subsidy messages and links.
        </p>

        <div className="hero-cta-group">
          <Link className="btn btn-primary" href="/schemes">
            <SearchIcon size={16} />
            <span>Search Schemes</span>
          </Link>
          <Link className="btn btn-secondary" href="/guard">
            <ShieldCheckIcon size={16} />
            <span>Verify Suspicious Scheme</span>
          </Link>
          <Link className="btn btn-tertiary" href="/assistant">
            <ChatIcon size={16} />
            <span>Ask Assistant</span>
          </Link>
        </div>
      </section>

      {/* Primary Feature Pillars */}
      <section className="pillars-grid">
        <div className="pillar-card">
          <div className="pillar-icon-box">
            <SearchIcon size={22} />
          </div>
          <h3>Verified Directory</h3>
          <p>
            Browse curated central and state welfare initiatives across agriculture, healthcare, education, and business credit.
          </p>
          <Link href="/schemes" className="pillar-action-link">
            <span>Open Directory</span>
            <ArrowRightIcon size={14} />
          </Link>
        </div>

        <div className="pillar-card">
          <div className="pillar-icon-box">
            <ShieldCheckIcon size={22} />
          </div>
          <h3>SchemeGuard</h3>
          <p>
            Paste suspicious WhatsApp forwards, text messages, or short links to inspect red flags and compare against genuine portals.
          </p>
          <Link href="/guard" className="pillar-action-link">
            <span>Run Security Check</span>
            <ArrowRightIcon size={14} />
          </Link>
        </div>

        <div className="pillar-card">
          <div className="pillar-icon-box">
            <ChatIcon size={22} />
          </div>
          <h3>Citizen Assistant</h3>
          <p>
            Get instant answers to questions regarding eligibility criteria, required certificates, and application steps.
          </p>
          <Link href="/assistant" className="pillar-action-link">
            <span>Start Conversation</span>
            <ArrowRightIcon size={14} />
          </Link>
        </div>
      </section>

      {/* Welfare Focus Areas */}
      <section className="categories-overview-section">
        <div className="section-header">
          <h2>Key Assistance Areas</h2>
          <p>Explore programs by citizen group and sector</p>
        </div>

        <div className="category-tags-grid">
          <Link href="/schemes?cat=Agriculture" className="category-tag-card">
            <h4>Farmers & Agriculture</h4>
            <p>Direct financial support, crop insurance, and soil health cards.</p>
          </Link>
          <Link href="/schemes?cat=Health" className="category-tag-card">
            <h4>Healthcare & Treatment</h4>
            <p>Cashless hospitalization, generic medicine centers, and maternity care.</p>
          </Link>
          <Link href="/schemes?cat=Education" className="category-tag-card">
            <h4>Students & Scholarships</h4>
            <p>Merit scholarships, girl child education, and school infrastructure.</p>
          </Link>
          <Link href="/schemes?cat=Finance" className="category-tag-card">
            <h4>Small Business Credit</h4>
            <p>Mudra loans, street vendor credit, and entrepreneurship funding.</p>
          </Link>
          <Link href="/schemes?cat=Housing" className="category-tag-card">
            <h4>Housing & Basic Amenities</h4>
            <p>Pucca house financial aid, clean tap water, and clean cooking fuel.</p>
          </Link>
          <Link href="/schemes?cat=Social" className="category-tag-card">
            <h4>Social Security & Pensions</h4>
            <p>Unorganized worker pensions, food security, and elder assistance.</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
