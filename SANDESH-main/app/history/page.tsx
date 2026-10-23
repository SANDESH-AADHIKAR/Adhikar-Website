'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation, useAuth } from '@/components/AppContext';
import { cleanVibeCodedText } from '@/components/ChatMessageView';

interface LogItem {
  timestamp: string;
  type: string;
  message: string;
  response?: string;
}

export default function HistoryPage() {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const { t } = useTranslation();
  const { user } = useAuth();

  const historyKey = user?.email ? `history_${user.email}` : 'history_guest';

  useEffect(() => {
    try {
      // Also look up guest history if user has no entries yet
      const userData = JSON.parse(localStorage.getItem(historyKey) ?? '[]');
      const guestData = user?.email ? JSON.parse(localStorage.getItem('history_guest') ?? '[]') : [];
      const combined = [...userData, ...guestData];

      if (Array.isArray(combined)) {
        // Deduplicate by timestamp and reverse
        const unique = combined.filter((v, i, a) => a.findIndex(t => t.timestamp === v.timestamp) === i);
        setLogs(unique.reverse());
      }
    } catch {
      setLogs([]);
    }
  }, [historyKey, user]);

  function clearHistory() {
    if (confirm(t('history.clearConfirm'))) {
      localStorage.removeItem(historyKey);
      if (user?.email) localStorage.removeItem('history_guest');
      setLogs([]);
    }
  }

  function getStatusClass(type: string) {
    if (type.includes('GENUINE')) return 'badge-success';
    if (type.includes('FAKE')) return 'badge-danger';
    if (type.includes('SUSPICIOUS')) return 'badge-warning';
    return 'badge-primary';
  }

  return (
    <div className="history-page-container">
      <div className="chat-header-bar">
        <div>
          <span className="badge badge-neutral">{t('history.badge')}</span>
          <h1>{t('history.heading')}</h1>
          <p className="page-subtitle">{t('history.subtitle')}</p>
        </div>

        {logs.length > 0 && (
          <button
            type="button"
            className="text-btn"
            onClick={clearHistory}
          >
            {t('history.clearBtn')}
          </button>
        )}
      </div>

      {logs.length === 0 ? (
        <div className="empty-state-card">
          <h3>{t('history.emptyTitle')}</h3>
          <p>{t('history.emptySub')}</p>
          <div className="hero-cta-group" style={{ justifyContent: 'center', marginTop: 16 }}>
            <Link className="btn btn-primary" href="/assistant">
              {t('history.ctaAssistant')}
            </Link>
            <Link className="btn btn-secondary" href="/guard">
              {t('history.ctaGuard')}
            </Link>
          </div>
        </div>
      ) : (
        <div className="history-list">
          {logs.map((l, i) => (
            <div key={i} className="history-item-card">
              <div className="history-item-header">
                <span className={`badge ${getStatusClass(l.type)}`}>{l.type}</span>
                <span className="history-timestamp">
                  {l.timestamp ? new Date(l.timestamp).toLocaleString() : ''}
                </span>
              </div>
              <div className="history-query-text">&ldquo;{cleanVibeCodedText(l.message)}&rdquo;</div>
              {l.response && (
                <div className="history-response-box">
                  {cleanVibeCodedText(String(l.response)).slice(0, 1000)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
