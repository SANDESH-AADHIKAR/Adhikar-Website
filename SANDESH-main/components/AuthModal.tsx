'use client';
import { useState } from 'react';
import { useAuth } from './AuthContext';
import { useTranslation } from './AppContext';
import { CloseIcon, ShieldCheckIcon, GovtBuildingIcon } from './Icons';

export default function AuthModal() {
  const {
    authModalOpen,
    authModalMode,
    closeAuthModal,
    signIn,
    signUp,
    signInDemo,
    openAuthModal,
    isConfigured,
  } = useAuth();
  const { t } = useTranslation();

  const [mode, setMode] = useState<'signin' | 'signup'>(authModalMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sync mode when modal opens
  if (authModalOpen && mode !== authModalMode) {
    setMode(authModalMode);
  }

  if (!authModalOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim() || !password.trim()) {
      setErrorMsg(t('auth.fillAllFields') || 'Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg(t('auth.passwordLength') || 'Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signin') {
        const res = await signIn(email.trim(), password);
        if (res.error) {
          setErrorMsg(res.error);
        } else {
          setEmail('');
          setPassword('');
        }
      } else {
        const res = await signUp(email.trim(), password, fullName.trim());
        if (res.error) {
          setErrorMsg(res.error);
        } else {
          setSuccessMsg(
            res.message ||
              (t('auth.signupSuccess') || 'Registration successful! Check your email to verify.')
          );
          setEmail('');
          setPassword('');
          setFullName('');
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Authentication error occurred.');
    } finally {
      setLoading(false);
    }
  }

  function handleDemoLogin() {
    signInDemo('citizen.guest@adhikar.nic.in', 'Adhikar Citizen');
  }

  return (
    <div className="auth-modal-backdrop" onClick={closeAuthModal} role="dialog" aria-modal="true">
      <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="auth-modal-header">
          <div className="auth-modal-title-row">
            <div className="auth-badge-icon">
              <GovtBuildingIcon size={20} />
            </div>
            <div>
              <h2 className="auth-modal-title">
                {mode === 'signin'
                  ? t('auth.signInTitle') || 'Citizen Sign In'
                  : t('auth.signUpTitle') || 'Create Citizen Account'}
              </h2>
              <p className="auth-modal-sub">
                {mode === 'signin'
                  ? t('auth.signInSub') || 'Access saved schemes and verified citizen services'
                  : t('auth.signUpSub') || 'Register for tailored scheme tracking & safe alerts'}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="auth-modal-close"
            onClick={closeAuthModal}
            aria-label="Close"
          >
            <CloseIcon size={20} />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab-btn ${mode === 'signin' ? 'active' : ''}`}
            onClick={() => {
              setMode('signin');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
          >
            {t('auth.tabSignIn') || 'Sign In'}
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => {
              setMode('signup');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
          >
            {t('auth.tabRegister') || 'Register'}
          </button>
        </div>

        {errorMsg && (
          <div className="auth-alert auth-alert-error" role="alert">
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="auth-alert auth-alert-success" role="alert">
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'signup' && (
            <div className="auth-form-group">
              <label htmlFor="auth-fullname">
                {t('auth.fullNameLabel') || 'Full Name'}
              </label>
              <input
                id="auth-fullname"
                type="text"
                className="auth-input"
                placeholder={t('auth.fullNamePlaceholder') || 'e.g. Ramesh Patil'}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={loading}
              />
            </div>
          )}

          <div className="auth-form-group">
            <label htmlFor="auth-email">
              {t('auth.emailLabel') || 'Official / Personal Email'}
            </label>
            <input
              id="auth-email"
              type="email"
              className="auth-input"
              placeholder={t('auth.emailPlaceholder') || 'name@example.com'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="auth-form-group">
            <label htmlFor="auth-password">
              {t('auth.passwordLabel') || 'Password'}
            </label>
            <input
              id="auth-password"
              type="password"
              className="auth-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary auth-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <span>{t('common.loading') || 'Processing...'}</span>
            ) : mode === 'signin' ? (
              <span>{t('auth.signInBtn') || 'Sign In to Portal'}</span>
            ) : (
              <span>{t('auth.signUpBtn') || 'Register Account'}</span>
            )}
          </button>
        </form>

        <div className="auth-divider">
          <span>{t('auth.or') || 'OR'}</span>
        </div>

        {/* Demo Fast Login */}
        <button
          type="button"
          className="btn btn-secondary auth-demo-btn"
          onClick={handleDemoLogin}
          title="Instant access without entering passwords"
        >
          <ShieldCheckIcon size={16} />
          <span>{t('auth.demoLoginBtn') || '1-Click Demo Citizen Sign In'}</span>
        </button>

        <div className="auth-footer-notice">
          <p>
            {mode === 'signin' ? (
              <>
                {t('auth.noAccount') || "Don't have an account yet?"}{' '}
                <button
                  type="button"
                  className="auth-switch-link"
                  onClick={() => {
                    setMode('signup');
                    openAuthModal('signup');
                  }}
                >
                  {t('auth.createOne') || 'Create one now'}
                </button>
              </>
            ) : (
              <>
                {t('auth.hasAccount') || 'Already registered?'}{' '}
                <button
                  type="button"
                  className="auth-switch-link"
                  onClick={() => {
                    setMode('signin');
                    openAuthModal('signin');
                  }}
                >
                  {t('auth.signInHere') || 'Sign in here'}
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
