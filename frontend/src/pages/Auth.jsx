import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import styles from './Auth.module.css';

export default function AuthPage() {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [fields, setFields] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy]   = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  function set(k, v) { setFields(f => ({ ...f, [k]: v })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (mode === 'login') {
        await login(fields.email, fields.password);
      } else {
        await register(fields.name, fields.email, fields.password);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.root}>
      <div className={styles.brand}>
        <span className={styles.logo}>T</span>
        <span className={styles.wordmark}>TaskFlow</span>
      </div>

      <div className={styles.card}>
        <div className={styles.tabs}>
          <button
            className={mode === 'login' ? styles.tabActive : styles.tab}
            onClick={() => { setMode('login'); setError(''); }}
          >Sign in</button>
          <button
            className={mode === 'register' ? styles.tabActive : styles.tab}
            onClick={() => { setMode('register'); setError(''); }}
          >Create account</button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {mode === 'register' && (
            <label className={styles.field}>
              <span>Full name</span>
              <input
                type="text" required autoComplete="name"
                value={fields.name} onChange={e => set('name', e.target.value)}
                placeholder="Ada Lovelace"
              />
            </label>
          )}

          <label className={styles.field}>
            <span>Email</span>
            <input
              type="email" required autoComplete="email"
              value={fields.email} onChange={e => set('email', e.target.value)}
              placeholder="you@example.com"
            />
          </label>

          <label className={styles.field}>
            <span>Password</span>
            <input
              type="password" required
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={fields.password} onChange={e => set('password', e.target.value)}
              placeholder={mode === 'register' ? 'At least 8 characters' : '••••••••'}
            />
          </label>

          {error && <p className={styles.error}>{error}</p>}

          <button className={styles.submit} type="submit" disabled={busy}>
            {busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        {mode === 'login' && (
          <p className={styles.hint}>
            Demo: <code>alice@example.com</code> / <code>Password123!</code>
          </p>
        )}
      </div>
    </div>
  );
}
