import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Boxes, Lock, Mail, User, ArrowRight, AlertCircle, KeyRound, Sparkles, ShieldCheck } from 'lucide-react';

const Login = () => {
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [honeypot, setHoneypot] = useState('');

  const { login, register, isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectPath = location.state?.from?.pathname || '/';

  React.useEffect(() => {
    if (isAuthenticated) navigate(redirectPath, { replace: true });
  }, [isAuthenticated, navigate, redirectPath]);

  const fillDemo = () => {
    setMode('login');
    setEmail('test@example.com');
    setPassword('password');
    setErrorMsg('');
    toast.info('Kredensial demo diisi otomatis.', 'Akun Demo');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (honeypot.trim() !== '') return;

    if (!email || !email.includes('@')) {
      const msg = 'Format email tidak valid.';
      setErrorMsg(msg);
      return;
    }
    if (password.length < 6) {
      const msg = 'Password minimal 6 karakter.';
      setErrorMsg(msg);
      return;
    }
    if (mode === 'register') {
      if (!name.trim()) { setErrorMsg('Nama wajib diisi.'); return; }
      if (password.length < 8) { setErrorMsg('Password minimal 8 karakter untuk registrasi.'); return; }
      if (password !== passwordConfirmation) { setErrorMsg('Konfirmasi password tidak cocok.'); return; }
    }

    setLoading(true);

    if (mode === 'login') {
      const result = await login(email, password);
      setLoading(false);
      if (result.success) navigate(redirectPath, { replace: true });
      else setErrorMsg(result.message);
    } else {
      const result = await register(name, email, password, passwordConfirmation);
      setLoading(false);
      if (result.success) navigate(redirectPath, { replace: true });
      else setErrorMsg(result.message);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo-icon">
            <Boxes size={17} />
          </div>
          <span className="login-logo-text">InventarisPro</span>
        </div>

        <h1 className="login-heading">
          {mode === 'login' ? 'Masuk ke akun' : 'Buat akun baru'}
        </h1>
        <p className="login-sub">
          {mode === 'login'
            ? 'Kelola inventaris & kategori barang secara real-time.'
            : 'Daftarkan akun untuk akses API Sanctum.'}
        </p>

        {/* Mode tabs */}
        <div className="login-tabs">
          <button
            type="button"
            className={`login-tab${mode === 'login' ? ' active' : ''}`}
            onClick={() => { setMode('login'); setErrorMsg(''); }}
          >
            Masuk
          </button>
          <button
            type="button"
            className={`login-tab${mode === 'register' ? ' active' : ''}`}
            onClick={() => { setMode('register'); setErrorMsg(''); }}
          >
            Daftar Baru
          </button>
        </div>

        {/* Error banner */}
        {errorMsg && (
          <div className={`error-banner${errorMsg ? ' animate-shake' : ''}`} style={{ marginBottom: '1rem' }}>
            <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form" noValidate>
          {/* Honeypot */}
          <div style={{ display: 'none' }} aria-hidden="true">
            <input type="text" name="_hp" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} tabIndex={-1} />
          </div>

          {mode === 'register' && (
            <div className="form-group">
              <label className="form-label" htmlFor="reg-name">
                Nama Lengkap <span className="req">*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <User size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)', pointerEvents: 'none' }} />
                <input
                  id="reg-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="form-input"
                  style={{ paddingLeft: '2.25rem' }}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="auth-email">Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)', pointerEvents: 'none' }} />
              <input
                id="auth-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@perusahaan.com"
                className="form-input"
                style={{ paddingLeft: '2.25rem' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="auth-password">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)', pointerEvents: 'none' }} />
              <input
                id="auth-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="form-input"
                style={{ paddingLeft: '2.25rem' }}
              />
            </div>
          </div>

          {mode === 'register' && (
            <div className="form-group">
              <label className="form-label" htmlFor="auth-password-confirm">
                Konfirmasi Password <span className="req">*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <KeyRound size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)', pointerEvents: 'none' }} />
                <input
                  id="auth-password-confirm"
                  type="password"
                  required
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  placeholder="••••••••"
                  className="form-input"
                  style={{ paddingLeft: '2.25rem' }}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            id="btn-auth-submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '0.625rem' }}
          >
            {loading ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                Memproses…
              </span>
            ) : (
              <>
                <span>{mode === 'login' ? 'Masuk Sekarang' : 'Daftarkan Akun'}</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        {/* Demo box */}
        <div className="demo-box">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span className="demo-box-title" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Sparkles size={12} style={{ color: 'var(--kraft)' }} />
              Akun Demo (Task 8)
            </span>
            <button
              type="button"
              onClick={fillDemo}
              className="btn btn-ghost"
              style={{ padding: '0.25rem 0.625rem', fontSize: '0.75rem' }}
            >
              Isi Otomatis
            </button>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Email: <code>test@example.com</code> &nbsp;|&nbsp; Password: <code>password</code>
          </p>
        </div>

        {/* Security note */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem', marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-faint)' }}>
          <ShieldCheck size={13} style={{ color: 'var(--stock-ok)' }} />
          <span>Protected with Laravel Sanctum Bearer Token</span>
        </div>
      </div>

      {/* Spinner keyframe */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Login;
