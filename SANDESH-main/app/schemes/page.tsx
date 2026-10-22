'use client';
import { useState, useEffect, useMemo } from 'react';
import { SCHEMES_DB, CATEGORIES } from '@/lib/schemes';
import type { SchemeInfo } from '@/lib/types';
import { supabase } from '@/src/supabaseClient';
import { SearchIcon, ExternalLinkIcon, RefreshIcon, CheckCircleIcon } from '@/components/Icons';

export default function SchemesPage() {
  const [schemes, setSchemes] = useState<SchemeInfo[]>(SCHEMES_DB);
  const [filter, setFilter] = useState<string>('All');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState<boolean>(true);
  const [isLiveSupabase, setIsLiveSupabase] = useState<boolean>(false);

  // Fetch live schemes from Supabase
  async function fetchSchemes() {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('schemes').select('*');
      if (error) {
        console.warn('Supabase fetch notice:', error.message);
        setSchemes(SCHEMES_DB);
        setIsLiveSupabase(false);
      } else if (data && data.length > 0) {
        const normalized: SchemeInfo[] = data.map((row: any, idx: number) => ({
          id: String(row.id ?? idx + 1),
          name: row.name || row.title || 'Government Scheme',
          category: row.category || 'General',
          benefits:
            row.benefits ||
            row.benefit ||
            row.description ||
            row.details ||
            'Direct welfare assistance under official guidelines.',
          eligibility:
            row.eligibility ||
            row.criteria ||
            row.eligible ||
            'Check official portal guidelines.',
          link:
            row.link ||
            row.url ||
            row.portal_url ||
            row.official_link ||
            'https://www.india.gov.in',
        }));
        setSchemes(normalized);
        setIsLiveSupabase(true);
      } else {
        // Table exists but is currently empty; fall back to local database
        setSchemes(SCHEMES_DB);
        setIsLiveSupabase(false);
      }
    } catch (err) {
      console.warn('Network or Supabase query failed:', err);
      setSchemes(SCHEMES_DB);
      setIsLiveSupabase(false);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSchemes();
  }, []);

  // Compute category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: schemes.length };
    for (const s of schemes) {
      counts[s.category] = (counts[s.category] || 0) + 1;
    }
    return counts;
  }, [schemes]);

  // Filter schemes
  const filteredSchemes = useMemo(() => {
    return schemes.filter((s) => {
      const matchCategory = filter === 'All' || s.category === filter;
      const matchQuery =
        query === '' ||
        s.name.toLowerCase().includes(query.toLowerCase()) ||
        s.benefits.toLowerCase().includes(query.toLowerCase()) ||
        s.eligibility.toLowerCase().includes(query.toLowerCase());
      return matchCategory && matchQuery;
    });
  }, [schemes, filter, query]);

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="header-meta-row">
          <span className="badge badge-neutral">Directory</span>
          {isLiveSupabase ? (
            <span className="badge badge-success">
              <span className="live-dot" /> Live Database Connected
            </span>
          ) : (
            <span className="badge badge-neutral" title="Displaying verified offline repository">
              <span className="cache-dot" /> Verified Repository
            </span>
          )}
          <button
            type="button"
            className="icon-btn"
            onClick={fetchSchemes}
            title="Refresh database"
            aria-label="Refresh schemes"
          >
            <RefreshIcon size={14} className={loading ? 'spinning' : ''} />
          </button>
        </div>

        <h1>Government Schemes Directory</h1>
        <p className="page-subtitle">
          Search and verify central and state government welfare initiatives, direct benefit transfers, and subsidized schemes.
        </p>
      </div>

      {/* Search Input */}
      <div className="search-box-wrap">
        <SearchIcon className="search-icon" size={18} />
        <input
          type="search"
          className="search-input"
          placeholder="Search by scheme name, benefits, or eligibility (e.g. Kisan, scholarship, loan)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button
            type="button"
            className="search-clear-btn"
            onClick={() => setQuery('')}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {/* Horizontal Scrollable Category Filter */}
      <div className="category-scroll-container">
        <div className="filter-chip-row">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              className={`filter-chip ${filter === c ? 'active' : ''}`}
              onClick={() => setFilter(c)}
            >
              <span>{c}</span>
              <span className="chip-count">{categoryCounts[c] || 0}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div className="results-meta-bar">
        <span className="results-count">
          Showing <strong>{filteredSchemes.length}</strong> of {schemes.length} schemes
        </span>
        {filter !== 'All' && (
          <button
            type="button"
            className="text-btn"
            onClick={() => setFilter('All')}
          >
            Clear category filter
          </button>
        )}
      </div>

      {/* Scheme Cards Grid */}
      {filteredSchemes.length === 0 ? (
        <div className="empty-state-card">
          <SearchIcon size={32} />
          <h3>No matching schemes found</h3>
          <p>Try searching with different keywords or clear the category filter.</p>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setFilter('All');
              setQuery('');
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="schemes-grid">
          {filteredSchemes.map((s) => (
            <article key={s.id} className="scheme-card">
              <div className="scheme-card-header">
                <span className="scheme-category-badge">{s.category}</span>
                <span className="scheme-id">ID: #{s.id}</span>
              </div>

              <h2 className="scheme-title">{s.name}</h2>

              <div className="scheme-detail-block">
                <div className="scheme-field-label">Assistance & Benefit:</div>
                <div className="scheme-field-value">{s.benefits}</div>
              </div>

              <div className="scheme-detail-block">
                <div className="scheme-field-label">Eligibility Criteria:</div>
                <div className="scheme-field-value muted-text">{s.eligibility}</div>
              </div>

              <div className="scheme-card-footer">
                <a
                  href={s.link}
                  target="_blank"
                  rel="noreferrer"
                  className="scheme-portal-link"
                >
                  <span>Official Portal</span>
                  <ExternalLinkIcon size={14} />
                </a>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
