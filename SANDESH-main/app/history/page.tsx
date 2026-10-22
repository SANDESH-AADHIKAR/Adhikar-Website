'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface LogItem {
  timestamp: string;
  type: string;
  message: string;
  response?: string;
}

export default function HistoryPage() {
  const [logs, setLogs] = useState<LogItem[]>([]);

  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem('history_guest') ?? '[]');
      if (Array.isArray(data)) {
        setLogs([...data].reverse());
      }
    } catch {
      setLogs([]);
    }
  }, []);

  function clearHistory() {
    if (confirm('Clear local activity record?')) {
      localStorage.removeItem('history_guest');
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
          <span className="badge badge-neutral">Private Session Trail</span>
          <h1>Activity History</h1>
          <p className="page-subtitle">
            Local browser record of your recent assistant queries and SchemeGuard scans.
          </p>
        </div>

        {logs.length > 0 && (
          <button
            type="button"
            className="text-btn"
            onClick={clearHistory}
          >
            Clear History
          </button>
        )}
      </div>

      {logs.length === 0 ? (
        <div className="empty-state-card">
          <h3>No recent activity</h3>
          <p>Questions submitted in the Assistant or messages checked in SchemeGuard will appear here.</p>
          <div className="hero-cta-group" style={{ justifyContent: 'center', marginTop: 16 }}>
            <Link className="btn btn-primary" href="/assistant">
              Open Assistant
            </Link>
            <Link className="btn btn-secondary" href="/guard">
              Test SchemeGuard
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
              <div className="history-query-text">&ldquo;{l.message}&rdquo;</div>
              {l.response && (
                <div className="history-response-box">
                  {String(l.response).slice(0, 1000)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
