'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FlameKindling, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useGoogleLogin } from '@react-oauth/google';
import { hashPassword, getStoredUser, setStoredUser, getStoredUsers, setStoredUsers, isOwner } from '../../lib/auth';


export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [gLoading, setGLoading] = useState(false);

  useEffect(() => {
    try { if (getStoredUser()) router.replace('/account'); } catch {}
  }, [router]);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tok) => {
      setGLoading(true);
      try {
        const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: { Authorization: `Bearer ${tok.access_token}` },
        });
        const gUser = await res.json();
        const users = getStoredUsers();
        let existing = users.find(u => u.email.toLowerCase() === gUser.email.toLowerCase());
        const ownerBoost = isOwner(gUser.email);
        if (!existing) {
          existing = { username: gUser.name, email: gUser.email.toLowerCase(), picture: gUser.picture, isPremium: ownerBoost, createdAt: new Date().toISOString() };
          setStoredUsers([...users, existing]);
        } else if (ownerBoost && !existing.isPremium) {
          existing.isPremium = true;
          setStoredUsers(users.map(u => u.email === existing.email ? existing : u));
        }
        setStoredUser({ username: existing.username, email: existing.email, picture: gUser.picture, isPremium: ownerBoost || existing.isPremium || false });
        router.push('/account');
      } catch { setError('Google sign-in failed. Try again.'); setGLoading(false); }
    },
    onError: () => { setError('Google sign-in failed. Try again.'); setGLoading(false); },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const users = getStoredUsers();
      const found = users.find(u => u.email.toLowerCase() === form.email.toLowerCase());
      if (!found) { setError('No account found with that email.'); setLoading(false); return; }
      const hash = await hashPassword(form.password);
      if (found.password !== hash) { setError('Incorrect password.'); setLoading(false); return; }
      const ownerBoost = isOwner(found.email);
      if (ownerBoost && !found.isPremium) {
        found.isPremium = true;
        const allUsers = getStoredUsers();
        setStoredUsers(allUsers.map(u => u.email === found.email ? { ...u, isPremium: true } : u));
      }
      setStoredUser({ username: found.username, email: found.email, picture: found.picture || null, isPremium: ownerBoost || found.isPremium || false, createdAt: found.createdAt });
      router.push('/account');
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#090910', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative', overflow: 'hidden' }}>
      {/* BG glows */}
      <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 300, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(224,48,48,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '15%', right: '10%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(167,139,250,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Logo */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 40 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(224,48,48,0.14)', border: '1px solid rgba(224,48,48,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FlameKindling size={18} style={{ color: '#e03030' }} />
          </div>
          <span style={{ fontWeight: 800, fontSize: 17, color: '#fff', letterSpacing: '-0.3px' }}>LCTRON</span>
        </Link>
      </motion.div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1 }}
        style={{
          width: '100%', maxWidth: 420,
          background: 'rgba(255,255,255,0.025)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20,
          padding: '36px 32px',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 40px 80px rgba(0,0,0,0.4)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Top accent line */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, rgba(224,48,48,0.6), transparent)' }} />

        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#fff', letterSpacing: '-0.8px', marginBottom: 6 }}>Welcome back</h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.38)', marginBottom: 20 }}>Sign in to your Lctron account</p>

        {/* Google */}
        {<button
          type="button"
          onClick={() => googleLogin()}
          disabled={gLoading}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '11px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 11, color: '#fff', fontSize: 13, fontWeight: 600, cursor: gLoading ? 'wait' : 'pointer', marginBottom: 16, opacity: gLoading ? 0.7 : 1, transition: 'all 0.15s' }}
          onMouseEnter={e => { if (!gLoading) e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
        >
          <svg width="16" height="16" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/></svg>
          {gLoading ? 'Signing in…' : 'Continue with Google'}
        </button>}

        {<div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontWeight: 500 }}>or sign in with email</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
        </div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Email */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={14} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.28)', pointerEvents: 'none' }} />
              <input
                className="input-field"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
                style={{ paddingLeft: 38 }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Password</label>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={14} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.28)', pointerEvents: 'none' }} />
              <input
                className="input-field"
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
                style={{ paddingLeft: 38, paddingRight: 40 }}
              />
              <button type="button" onClick={() => setShowPw(s => !s)} style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', padding: 0 }}>
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10, background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', fontSize: 12, color: '#fca5a5' }}>
              <AlertCircle size={13} /> {error}
            </motion.div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn-red"
            style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: 14, marginTop: 4, opacity: loading ? 0.7 : 1, cursor: loading ? 'wait' : 'pointer' }}
          >
            {loading ? 'Signing in…' : <>Sign In <ArrowRight size={15} /></>}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.35)', marginTop: 22 }}>
          Don't have an account?{' '}
          <Link href="/register" style={{ color: '#e03030', textDecoration: 'none', fontWeight: 600 }}>Create one</Link>
        </p>
      </motion.div>

      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.18)', marginTop: 28, textAlign: 'center' }}>
        © 2025 Lctron. All rights reserved.
      </p>
    </div>
  );
}
