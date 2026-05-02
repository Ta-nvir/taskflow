import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const AuthPage = () => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('member');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    if (!email || !password) return setError('Email and password are required.');
    if (mode === 'register' && !name) return setError('Name is required.');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(name, email, password, role);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = e => { if (e.key === 'Enter') handleSubmit(); };

  return (
    <div className="auth-page">
      <div className="auth-card slide-up">
        <div className="auth-logo">
          <h1>TaskFlow</h1>
          <p>Project & Task Management</p>
        </div>

        <div className="auth-title">
          {mode === 'login' ? 'Welcome back' : 'Create account'}
        </div>
        <div className="auth-subtitle">
          {mode === 'login'
            ? 'Sign in to your workspace'
            : 'Start managing your projects today'}
        </div>

        {error && <div className="error-msg">{error}</div>}

        {mode === 'register' && (
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              className="form-input"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Tanvir Yaligar"
              onKeyDown={handleKey}
            />
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            className="form-input"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            onKeyDown={handleKey}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            className="form-input"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            onKeyDown={handleKey}
          />
        </div>

        {mode === 'register' && (
          <div className="form-group">
            <label className="form-label">Account Type</label>
            <select className="form-select" value={role} onChange={e => setRole(e.target.value)}>
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        )}

        <button
          className="btn btn-primary"
          style={{ width: '100%', justifyContent: 'center', padding: 14, fontSize: 15, marginTop: 8 }}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Please wait...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
        </button>

        <div className="auth-footer">
          {mode === 'login' ? (
            <>Don't have an account? <button className="auth-link" onClick={() => { setMode('register'); setError(''); }}>Sign up</button></>
          ) : (
            <>Already have an account? <button className="auth-link" onClick={() => { setMode('login'); setError(''); }}>Sign in</button></>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
