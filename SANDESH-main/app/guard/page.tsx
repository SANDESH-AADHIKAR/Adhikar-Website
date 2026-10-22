'use client';
import { useState } from 'react';
import { Language, type GuardResponse } from '@/lib/types';
import LanguageSelector from '@/components/LanguageSelector';
import { ShieldCheckIcon, AlertTriangleIcon, AlertOctagonIcon, ExternalLinkIcon } from '@/components/Icons';

const SAMPLE_SCAM =
  'URGENT: Central Govt Free Laptop & ₹50,000 Cash Subsidy Scheme. Only 500 slots left. Pay ₹299 registration fee at bit.ly/pm-laptop-2026 and forward this to 5 WhatsApp groups to claim!';

const SAMPLE_GENUINE =
  'PM-KISAN 16th installment released to eligible landholding farmer families via Direct Benefit Transfer (DBT). Verify your beneficiary status and Aadhaar e-KYC on the official portal: https://pmkisan.gov.in';

const SAMPLE_SUSPICIOUS =
  'Instant Mudra business loan of ₹5,00,000 approved without credit score or collateral. Contact manager on WhatsApp +91-9876543210 with Aadhaar card copy and bank account details.';

export default function GuardPage() {
  const [input, setInput] = useState('');
  const [language, setLanguage] = useState<Language>(Language.ENGLISH);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GuardResponse | null>(null);

  async function scan(customText?: string) {
    const textToScan = customText ?? input;
    if (!textToScan.trim() || loading) return;

    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/guard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'guest', message: textToScan, language }),
      });
      const data = await res.json();
      setResult({ ...data, explanation: data.explanation ?? data.reason });

      // Save to local activity history
      const key = 'history_guest';
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

    return (
      <div className="guard-result-container">
        <div className="result-header">
          <div className={`result-status-pill ${statusBadgeClass}`}>
            <StatusIcon size={16} />
            <span>{result.classification}</span>
          </div>
          <h1>Verification Assessment</h1>
          <p className="page-subtitle">
            Safety analysis and domain verification results for the provided scheme message.
          </p>
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
            <div className="gauge-score-label">Trust Index (0 – 100)</div>
          </div>

          <div className="assessment-details">
            <div className="assessment-card">
              <div className="assessment-title">Analysis & Detected Patterns</div>
              <p className="assessment-body">{result.explanation ?? result.reason}</p>
            </div>

            <div className="assessment-card">
              <div className="assessment-title">Citizen Safety Advice</div>
              <p className="assessment-body">{result.safeAdvice}</p>
            </div>

            {result.officialAlternative && result.officialAlternative !== 'N/A' && (
              <div className="assessment-card official-card">
                <div className="assessment-title">Verified Official Reference</div>
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
            Scan Another Message
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="guard-page-container">
      <div className="chat-header-bar">
        <div>
          <span className="badge badge-neutral">Scam Defense</span>
          <h1>SchemeGuard Verification</h1>
          <p className="page-subtitle">
            Inspect scheme messages, WhatsApp forwards, and URLs for fraud indicators and fake portals.
          </p>
        </div>
        <LanguageSelector value={language} onChange={setLanguage} />
      </div>

      <div className="guard-input-card">
        <label className="input-label" htmlFor="guard-input">
          Paste Announcement Text, SMS, or Link
        </label>
        <textarea
          id="guard-input"
          className="guard-textarea"
          rows={5}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste message here (e.g. 'Get ₹50,000 subsidy under central govt. Apply at bit.ly/xyz...')"
        />

        <div className="sample-tests-section">
          <span className="sample-label">Load sample test cases:</span>
          <div className="sample-btn-group">
            <button
              type="button"
              className="sample-btn"
              onClick={() => handleQuickSample(SAMPLE_SCAM)}
            >
              Laptop Subsidy Scam
            </button>
            <button
              type="button"
              className="sample-btn"
              onClick={() => handleQuickSample(SAMPLE_SUSPICIOUS)}
            >
              Unverified Mudra Loan
            </button>
            <button
              type="button"
              className="sample-btn"
              onClick={() => handleQuickSample(SAMPLE_GENUINE)}
            >
              Genuine PM-KISAN Notice
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
          <span>{loading ? 'Inspecting Message…' : 'Inspect Scheme Message'}</span>
        </button>
      </div>

      <div className="guidance-box">
        <h4>Key Verification Principles:</h4>
        <ul>
          <li>Official government websites end in <strong>.gov.in</strong> or <strong>.nic.in</strong>.</li>
          <li>Never trust shortened URLs (such as bit.ly, tinyurl) claiming to represent government welfare.</li>
          <li>Legitimate government programs do not charge application or courier fees via personal UPI or WhatsApp.</li>
          <li>Never share Aadhaar card photos or OTPs with unknown numbers or unverified groups.</li>
        </ul>
      </div>
    </div>
  );
}
