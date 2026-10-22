'use client';
import { useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/src/supabaseClient';

export default function FeedbackPage() {
  const [msg, setMsg] = useState<{ text: string; isError?: boolean } | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [submitting, setSubmitting] = useState<boolean>(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setMsg(null);
    const form = e.currentTarget;
    const fd = new FormData(form);

    try {
      if (!isSupabaseConfigured) {
        setMsg({
          text: 'Notice: Supabase is in mock mode on this instance. Your test submission succeeded locally.',
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
        setMsg({ text: `Submission notice: ${error.message}`, isError: true });
      } else {
        setMsg({ text: 'Thank you. Your feedback has been recorded in the database.' });
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
        <span className="badge badge-neutral">Support & Feedback</span>
        <h1>Portal Feedback</h1>
        <p className="page-subtitle">
          Report scheme inaccuracies, submit technical issues, or report suspected fraudulent programs.
        </p>
      </div>

      <div className="form-card">
        <form onSubmit={submit} className="styled-form">
          <div className="form-group">
            <label className="input-label" htmlFor="name">Your Name</label>
            <input
              id="name"
              type="text"
              name="name"
              className="styled-input"
              placeholder="e.g. Ramesh Patel"
              required
            />
          </div>

          <div className="form-group">
            <label className="input-label" htmlFor="issueType">Feedback Category</label>
            <select
              id="issueType"
              name="issueType"
              className="styled-select"
              defaultValue="General Feedback"
            >
              <option value="General Feedback">General Feedback & Suggestions</option>
              <option value="Scheme Inaccuracy">Scheme Inaccuracy or Outdated Information</option>
              <option value="Fraud Report">Report New Scam or Fraudulent Scheme</option>
              <option value="Technical Error">Technical Portal Issue</option>
            </select>
          </div>

          <div className="form-group">
            <label className="input-label">Overall Rating</label>
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
            <label className="input-label" htmlFor="description">Message & Description</label>
            <textarea
              id="description"
              name="description"
              className="styled-textarea"
              rows={4}
              placeholder="Describe the issue or suggestion in detail..."
              required
            />
          </div>

          <button
            className="btn btn-primary"
            type="submit"
            style={{ width: '100%', justifyContent: 'center' }}
            disabled={submitting}
          >
            {submitting ? 'Submitting…' : 'Submit Feedback'}
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
