'use client';
import { useState } from 'react';
import type { GuardResponse } from '@/lib/types';
import LanguageSelector from '@/components/LanguageSelector';
import { ShieldCheckIcon, AlertTriangleIcon, AlertOctagonIcon, ExternalLinkIcon } from '@/components/Icons';
import { useLanguage, useTranslation, useAuth } from '@/components/AppContext';
import { cleanVibeCodedText } from '@/components/ChatMessageView';

const SAMPLE_SCAM =
  'URGENT: Central Govt Free Laptop & ₹50,000 Cash Subsidy Scheme. Only 500 slots left. Pay ₹299 registration fee at bit.ly/pm-laptop-2026 and forward this to 5 WhatsApp groups to claim!';

const SAMPLE_GENUINE =
  'PM-KISAN 16th installment released to eligible landholding farmer families via Direct Benefit Transfer (DBT). Verify your beneficiary status and Aadhaar e-KYC on the official portal: https://pmkisan.gov.in';

const SAMPLE_SUSPICIOUS =
  'Instant Mudra business loan of ₹5,00,000 approved without credit score or collateral. Contact manager on WhatsApp +91-9876543210 with Aadhaar card copy and bank account details.';

export default function GuardPage() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GuardResponse | null>(null);
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();
  const { user } = useAuth();

  async function scan(customText?: string) {
    const textToScan = customText ?? input;
    if (!textToScan.trim() || loading) return;

    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/guard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.email || 'guest', message: textToScan, language }),
      });
      const data = await res.json();
      setResult({ ...data, explanation: data.explanation ?? data.reason });

      // Save to local activity history
      const key = user?.email ? `history_${user.email}` : 'history_guest';
      const prev = JSON.parse(localStorage.getItem(key) ?? '[]');
      prev.push({
        timestamp: new Date().toISOString(),
        type: `GUARD (${data.classification?.toUpperCase() || 'SCAN'})`,
        message: textToScan,
        response: `Trust Score: ${data.trustScore}% | ${data.reason}`,
      });
      localStorage.setItem(key, JSON.stringify(prev));
    } catch {
      alert('Unable to connect to SchemeGuard service. Please verify your internet or server status.');
    } finally {
      setLoading(false);
    }
  }

  function handleQuickSample(text: string) {
    setInput(text);
    scan(text);
  }

  if (result) {
    const isGenuine = result.classification === 'Genuine';
    const isSuspicious = result.classification === 'Suspicious';
    const rot = (Math.max(0, Math.min(100, result.trustScore)) / 100) * 180 - 180;

    const statusBadgeClass = isGenuine
      ? 'status-genuine'
      : isSuspicious
      ? 'status-suspicious'
      : 'status-fake';

    const StatusIcon = isGenuine
      ? ShieldCheckIcon
      : isSuspicious
      ? AlertTriangleIcon
      : AlertOctagonIcon;

    const classificationDisplay = isGenuine
      ? t('guard.statusGenuine')
      : isSuspicious
      ? t('guard.statusSuspicious')
      : t('guard.statusFake');

    return (
      <div className="guard-result-container">
        <div className="result-header">
          <div className={`result-status-pill ${statusBadgeClass}`}>
            <StatusIcon size={16} />
            <span>{classificationDisplay}</span>
          </div>
          <h1>{t('guard.resultHeading')}</h1>
          <p className="page-subtitle">{t('guard.resultSubtitle')}</p>
        </div>

        <div className="gauge-panel">
          <div className="gauge-wrap">
            <div className="gauge-semi">
              <div
                className={`gauge-indicator ${statusBadgeClass}`}
                style={{ transform: `rotate(${rot}deg)` }}
              />
            </div>
            <div className="gauge-score-value">{result.trustScore}%</div>
            <div className="gauge-score-label">{t('guard.trustIndexLabel')}</div>
          </div>

          <div className="assessment-details">
            <div className="assessment-card">
              <div className="assessment-title">{t('guard.analysisLabel')}</div>
              <p className="assessment-body">{cleanVibeCodedText(result.explanation ?? result.reason)}</p>
            </div>

            <div className="assessment-card">
              <div className="assessment-title">{t('guard.safeAdviceLabel')}</div>
              <p className="assessment-body">{cleanVibeCodedText(result.safeAdvice)}</p>
            </div>

            {result.officialAlternative && result.officialAlternative !== 'N/A' && (
              <div className="assessment-card official-card">
                <div className="assessment-title">{t('guard.officialLabel')}</div>
                <a
                  href={result.officialAlternative}
                  target="_blank"
                  rel="noreferrer"
                  className="official-portal-link"
                >
                  <span>{result.officialAlternative}</span>
                  <ExternalLinkIcon size={14} />
                </a>
              </div>
            )}
          </div>

          <button
            type="button"
            className="btn btn-secondary"
            style={{ width: '100%', marginTop: 20 }}
            onClick={() => {
              setResult(null);
              setInput('');
            }}
          >
            {t('guard.scanAnotherBtn')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="guard-page-container">
      <div className="chat-header-bar">
        <div>
          <span className="badge badge-neutral">{t('guard.badge')}</span>
          <h1>{t('guard.heading')}</h1>
          <p className="page-subtitle">{t('guard.subtitle')}</p>
        </div>
        <LanguageSelector value={language} onChange={setLanguage} />
      </div>

      <div className="guard-input-card">
        <label className="input-label" htmlFor="guard-input">
          {t('guard.inputLabel')}
        </label>
        <textarea
          id="guard-input"
          className="guard-textarea"
          rows={5}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('guard.inputPlaceholder')}
        />

        <div className="sample-tests-section">
          <span className="sample-label">{t('guard.sampleHeading')}</span>
          <div className="sample-btn-group">
            <button
              type="button"
              className="sample-btn"
              onClick={() => handleQuickSample(SAMPLE_SCAM)}
            >
              {t('guard.sampleFake')}
            </button>
            <button
              type="button"
              className="sample-btn"
              onClick={() => handleQuickSample(SAMPLE_SUSPICIOUS)}
            >
              {t('guard.sampleSuspicious')}
            </button>
            <button
              type="button"
              className="sample-btn"
              onClick={() => handleQuickSample(SAMPLE_GENUINE)}
            >
              {t('guard.sampleGenuine')}
            </button>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-primary guard-submit-btn"
          onClick={() => scan()}
          disabled={loading || !input.trim()}
        >
          <ShieldCheckIcon size={18} />
          <span>{loading ? t('guard.scanningBtn') : t('guard.scanBtn')}</span>
        </button>
      </div>

      <div className="guidance-box">
        <h4>{t('guard.howItWorksTitle')}</h4>
        <ul>
          <li>{t('guard.howPoint1')}</li>
          <li>{t('guard.howPoint2')}</li>
          <li>{t('guard.howPoint3')}</li>
        </ul>
      </div>
    </div>
  );
}
