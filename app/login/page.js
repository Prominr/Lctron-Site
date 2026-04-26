'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FlameKindling, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, ArrowLeft, KeyRound, ShieldCheck, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useGoogleLogin } from '@react-oauth/google';
import { hashPassword, getStoredUser, setStoredUser, getStoredUsers, setStoredUsers, authFetch, fetchGoogleProfile } from '../../lib/auth';

// Client-side rate limits (defense-in-depth; server must still enforce)
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_COOLDOWN_MS = 30_000;
const RESET_COOLDOWN_MS = 60_000;

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [resetCooldownUntil, setResetCooldownUntil] = useState(0);
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Forgot password state
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotCode, setForgotCode] = useState('');
  const [forgotNewPw, setForgotNewPw] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');
  const [forgotBusy, setForgotBusy] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    if (typeof window !== 'undefined') {
      if (getStoredUser()) router.replace('/account');
    }
  }, [router]);

  const googleLogin = useGoogleLogin({
    scope: 'openid email profile',
    flow: 'implicit',
    onSuccess: async (tokenResponse) => {
      setGLoading(true);
      setError('');
      try {
        const gUser = await fetchGoogleProfile(tokenResponse.access_token);
        const remote = await authFetch({
          action: 'google',
          email: gUser.email,
          name: gUser.name,
          picture: gUser.picture,
        });
        
        const existing = getStoredUsers().find(
          (u) => u.email.toLowerCase() === gUser.email.toLowerCase(),
        );
        const trialStart = existing?.trialStart || new Date().toISOString();
        
        if (remote.success && remote.user) {
          setStoredUser({
            username: remote.user.name,
            email: remote.user.email,
            picture: remote.user.picture || gUser.picture,
            isPremium: remote.user.isPremium || false,
            trialStart,
          });
        } else {
          setStoredUser({
            username: gUser.name,
            email: gUser.email.toLowerCase(),
            picture: gUser.picture,
            isPremium: false,
            trialStart,
          });
        }
        router.push('/account');
      } catch (e) {
        setError(e?.message || 'Google sign-in failed. Try again.');
      } finally {
        setGLoading(false);
      }
    },
    onError: () => {
      setError('Google sign-in was cancelled or blocked.');
      setGLoading(false);
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const now = Date.now();
    if (now < cooldownUntil) {
      const secs = Math.ceil((cooldownUntil - now) / 1000);
      setError(`Too many attempts. Try again in ${secs}s.`);
      return;
    }
    setError('');
    setLoading(true);

    try {
      const emailKey = form.email.trim().toLowerCase();
      const remote = await authFetch({
        action: 'login',
        email: form.email.trim(),
        password: form.password,
      });

      if (remote.success && remote.user) {
        const trialStart = getStoredUsers().find(
          (u) => u.email.toLowerCase() === emailKey
        )?.trialStart || new Date().toISOString();
        
        setStoredUser({
          username: remote.user.name,
          email: remote.user.email,
          picture: remote.user.picture || null,
          isPremium: remote.user.isPremium || false,
          trialStart,
        });
        router.push('/account');
        return;
      }

      // Local auth fallback
      const localUsers = getStoredUsers();
      const localUser = localUsers.find((u) => u.email.toLowerCase() === emailKey);
      
      if (localUser) {
        const hash = await hashPassword(form.password);
        if (localUser.password === hash) {
          const mig = await authFetch({
            action: 'login',
            email: form.email.trim(),
            password: form.password,
            migrateLocal: {
              name: localUser.username,
              isPremium: localUser.isPremium,
              createdAt: localUser.createdAt,
              picture: localUser.picture || null,
            },
          });
          if (mig.success && mig.user) {
            setStoredUser({
              username: mig.user.name,
              email: mig.user.email,
              picture: mig.user.picture || null,
              isPremium: mig.user.isPremium || false,
              trialStart: localUser.trialStart || new Date().toISOString(),
            });
            router.push('/account');
            return;
          }
          setError(mig.error || 'Sync failed. Please try again.');
          return;
        }
      }
      setError(remote.error || 'Incorrect email or password.');
      setLoginAttempts(a => {
        const next = a + 1;
        if (next >= MAX_LOGIN_ATTEMPTS) {
          setCooldownUntil(Date.now() + LOGIN_COOLDOWN_MS);
          return 0;
        }
        return next;
      });
    } catch (err) {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSendCode = async () => {
    setError('');
    setForgotMsg('');
    const now = Date.now();
    if (now < resetCooldownUntil) {
      const secs = Math.ceil((resetCooldownUntil - now) / 1000);
      setError(`Please wait ${secs}s before requesting another code.`);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(forgotEmail)) {
      setError('Please enter a valid email address.');
      return;
    }
    setForgotBusy(true);
    try {
      const res = await authFetch({ action: 'send-reset', email: forgotEmail.trim() });
      if (!res.success) {
        setError(res.error || 'Could not send reset email.');
        return;
      }
      setForgotMsg('Check your email for a 6-digit code.');
      setResetCooldownUntil(Date.now() + RESET_COOLDOWN_MS);
      setForgotStep(2);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setForgotBusy(false);
    }
  };

  const handleForgotVerify = async () => {
    setError('');
    setForgotMsg('');
    if (!forgotCode.trim()) {
      setError('Please enter the code.');
      return;
    }
    if (forgotNewPw.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setForgotBusy(true);
    try {
      const res = await authFetch({
        action: 'reset-pw',
        email: forgotEmail.trim(),
        code: forgotCode.trim(),
        newPassword: forgotNewPw,
      });
      if (!res.success) {
        setError(res.error || 'Could not reset password.');
        return;
      }
      setForgotStep(3);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setForgotBusy(false);
    }
  };

  const exitForgot = useCallback(() => {
    setForgotMode(false);
    setForgotStep(1);
    setForgotEmail('');
    setForgotCode('');
    setForgotNewPw('');
    setForgotMsg('');
    setError('');
  }, []);

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#090910', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '24px', 
      position: 'relative', 
      overflow: 'hidden' 
    }}>
      {/* Background */}
      <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 300, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(224,48,48,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '15%', right: '10%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(167,139,250,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Logo */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : -20 }} 
        transition={{ duration: 0.5 }}
      >
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 40 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(224,48,48,0.14)', border: '1px solid rgba(224,48,48,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FlameKindling size={20} style={{ color: '#e03030' }} />
          </div>
          <span style={{ fontWeight: 800, fontSize: 18, color: '#fff' }}>LCTRON</span>
        </Link>
      </motion.div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30, scale: isVisible ? 1 : 0.95 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        style={{
          width: '100%',
          maxWidth: 420,
          background: 'rgba(255,255,255,0.025)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 24,
          padding: '40px 32px',
          backdropFilter: 'blur(20px)',
          position: 'relative',
        }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, rgba(224,48,48,0.6), transparent)' }} />

        <AnimatePresence mode="wait">
          {forgotMode ? (
            <motion.div 
              key="forgot"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
            >
              <button type="button" onClick={exitForgot} className="btn-ghost" style={{ alignSelf: 'flex-start', padding: '8px 12px', fontSize: 12 }}>
                <ArrowLeft size={14} /> Back to Sign In
              </button>

              {forgotStep === 3 ? (
                <div style={{ textAlign: 'center', padding: '30px 0' }}>
                  <ShieldCheck size={48} style={{ color: '#22c55e', marginBottom: 16 }} />
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 8 }}>Password Reset!</h2>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 24 }}>Your password has been changed successfully.</p>
                  <button onClick={exitForgot} className="btn-red">
                    Sign In Now
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <h2 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 4 }}>Reset Password</h2>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
                      {forgotStep === 1 ? 'Enter your email to receive a reset code.' : 'Enter the code from your email and your new password.'}
                    </p>
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px', borderRadius: 10, background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)' }}
                      >
                        <AlertCircle size={14} style={{ color: '#fca5a5', flexShrink: 0 }} />
                        <span style={{ fontSize: 13, color: '#fca5a5' }}>{error}</span>
                      </motion.div>
                    )}
                    {forgotMsg && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px', borderRadius: 10, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}
                      >
                        <CheckCircle size={14} style={{ color: '#86efac', flexShrink: 0 }} />
                        <span style={{ fontSize: 13, color: '#86efac' }}>{forgotMsg}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {forgotStep === 1 ? (
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>Email Address</label>
                      <div style={{ position: 'relative' }}>
                        <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }} />
                        <input 
                          className="input-field" 
                          type="email" 
                          placeholder="you@example.com" 
                          value={forgotEmail} 
                          onChange={e => setForgotEmail(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleForgotSendCode()}
                          style={{ paddingLeft: 44 }}
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>Verification Code</label>
                        <div style={{ position: 'relative' }}>
                          <KeyRound size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }} />
                          <input 
                            className="input-field" 
                            type="text" 
                            placeholder="000000"
                            value={forgotCode} 
                            onChange={e => setForgotCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            maxLength={6}
                            style={{ paddingLeft: 44, letterSpacing: 8, fontSize: 18, fontWeight: 700, textAlign: 'center' }}
                          />
                        </div>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>New Password</label>
                        <div style={{ position: 'relative' }}>
                          <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }} />
                          <input 
                            className="input-field" 
                            type="password" 
                            placeholder="Min 6 characters"
                            value={forgotNewPw} 
                            onChange={e => setForgotNewPw(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleForgotVerify()}
                            style={{ paddingLeft: 44 }}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={forgotStep === 1 ? handleForgotSendCode : handleForgotVerify}
                    disabled={forgotBusy}
                    className="btn-red"
                    style={{ width: '100%' }}
                  >
                    {forgotBusy ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                        Processing...
                      </span>
                    ) : forgotStep === 1 ? 'Send Reset Code' : 'Reset Password'}
                  </button>
                </>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="login"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', marginBottom: 6 }}>Welcome back</h1>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.42)', marginBottom: 24 }}>Sign in to your Lctron account</p>

              {/* Google Button */}
              <button
                type="button"
                onClick={() => googleLogin()}
                disabled={gLoading}
                className="btn-ghost"
                style={{ width: '100%', marginBottom: 20, gap: 12 }}
              >
                <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/></svg>
                {gLoading ? 'Connecting...' : 'Continue with Google'}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>or</span>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Email */}
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>Email</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }} />
                    <input
                      className="input-field"
                      type="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      required
                      style={{ paddingLeft: 44 }}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>Password</label>
                    <button 
                      type="button" 
                      onClick={() => setForgotMode(true)} 
                      style={{ fontSize: 12, color: '#e03030', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      Forgot?
                    </button>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }} />
                    <input
                      className="input-field"
                      type={showPw ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={form.password}
                      onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                      required
                      style={{ paddingLeft: 44, paddingRight: 44 }}
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPw(s => !s)} 
                      style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}
                    >
                      {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px', borderRadius: 10, background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)' }}
                    >
                      <AlertCircle size={14} style={{ color: '#fca5a5', flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: '#fca5a5' }}>{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-red"
                  style={{ width: '100%', marginTop: 8 }}
                >
                  {loading ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                      Signing in...
                    </span>
                  ) : (
                    <>Sign In <ArrowRight size={16} /></>
                  )}
                </button>
              </form>

              <p style={{ textAlign: 'center', fontSize: 14, color: 'rgba(255,255,255,0.4)', marginTop: 24 }}>
                Don&apos;t have an account?{' '}
                <Link href="/register" style={{ color: '#e03030', textDecoration: 'none', fontWeight: 600 }}>Create one</Link>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: isVisible ? 1 : 0 }}
        transition={{ delay: 0.5 }}
        style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', marginTop: 32 }}
      >
        © 2025 Lctron. All rights reserved.
      </motion.p>
    </div>
  );
}
