'use client';
import { useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/src/supabaseClient';
import { useTranslation, useAuth } from '@/components/AppContext';

export default function FeedbackPage() {
  const [msg, setMsg] = useState<{ text: string; isError?: boolean } | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const { t } = useTranslation();
  const { user } = useAuth();

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setMsg(null);
    const form = e.currentTarget;
    const fd = new FormData(form);

    try {
      if (!isSupabaseConfigured) {
        setMsg({
          text: t('feedback.successMsg'),
        });
        form.reset();
        return;
      }

      const { error } = await supabase.from('feedback').insert([
        {
          type: fd.get('issueType'),
          message: `[Name: ${fd.get('name')}] ${fd.get('description')}`,
          rating: Number(fd.get('rating') ?? rating),
        },
      ]);

      if (error) {
        setMsg({ text: `Notice: ${error.message}`, isError: true });
      } else {
        setMsg({ text: t('feedback.successMsg') });
        form.reset();
      }
    } catch (err: any) {
      setMsg({ text: `Could not submit: ${err?.message || 'Network error'}`, isError: true });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="feedback-page-container">
      <div className="page-header">
        <span className="badge badge-neutral">{t('feedback.badge')}</span>
        <h1>{t('feedback.heading')}</h1>
        <p className="page-subtitle">{t('feedback.subtitle')}</p>
      </div>

      <div className="form-card">
        <form onSubmit={submit} className="styled-form">
          <div className="form-group">
            <label className="input-label" htmlFor="name">
              {t('feedback.nameLabel')}
            </label>
            <input
              id="name"
              type="text"
              name="name"
              className="styled-input"
              defaultValue={user?.user_metadata?.full_name || user?.email || ''}
              placeholder={t('feedback.namePlaceholder')}
              required
            />
          </div>

          <div className="form-group">
            <label className="input-label" htmlFor="issueType">
              {t('feedback.categoryLabel')}
            </label>
            <select
              id="issueType"
              name="issueType"
              className="styled-select"
              defaultValue="General Feedback"
            >
              <option value="General Feedback">{t('feedback.catGeneral')}</option>
              <option value="Scheme Inaccuracy">{t('feedback.catInaccuracy')}</option>
              <option value="Fraud Report">{t('feedback.catFraud')}</option>
              <option value="Technical Error">{t('feedback.catTechnical')}</option>
            </select>
          </div>

          <div className="form-group">
            <label className="input-label">{t('feedback.ratingLabel')}</label>
            <div className="rating-button-row">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`rating-btn ${rating === star ? 'selected' : ''}`}
                  onClick={() => setRating(star)}
                >
                  {star} / 5
                </button>
              ))}
            </div>
            <input type="hidden" name="rating" value={rating} />
          </div>

          <div className="form-group">
            <label className="input-label" htmlFor="description">
              {t('feedback.descLabel')}
            </label>
            <textarea
              id="description"
              name="description"
              className="styled-textarea"
              rows={4}
              placeholder={t('feedback.descPlaceholder')}
              required
            />
          </div>

          <button
            className="btn btn-primary"
            type="submit"
            style={{ width: '100%', justifyContent: 'center' }}
            disabled={submitting}
          >
            {submitting ? t('feedback.submittingBtn') : t('feedback.submitBtn')}
          </button>
        </form>

        {msg && (
          <div className={`alert-box ${msg.isError ? 'alert-error' : 'alert-success'}`}>
            {msg.text}
          </div>
        )}
      </div>
    </div>
  );
}
